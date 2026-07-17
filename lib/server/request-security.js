const rateLimitBuckets = new Map();
const defaultWindowMs = 60_000;
const defaultMaxBodyBytes = 1024 * 1024;

function securityHeaders(extra = {}) {
  return {
    "Cache-Control": "private, no-store",
    ...extra,
  };
}

function securityError(message, status, code, extraHeaders = {}) {
  return Response.json(
    { error: message, code },
    {
      status,
      headers: securityHeaders(extraHeaders),
    },
  );
}

function headerHost(value) {
  return String(value || "").split(",")[0].trim().toLowerCase();
}

function requestHost(request) {
  return headerHost(request.headers.get("host"))
    || headerHost(request.headers.get("x-forwarded-host"));
}

function originHost(origin) {
  try {
    return new URL(origin).host.toLowerCase();
  } catch {
    return "";
  }
}

export function requireSameOriginMutation(request) {
  const method = String(request.method || "GET").toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return null;

  const origin = request.headers.get("origin");
  if (!origin) return null;

  const expectedHost = requestHost(request);
  if (!expectedHost || originHost(origin) === expectedHost) return null;

  return securityError("Cross-origin workspace mutations are not allowed.", 403, "BAD_ORIGIN");
}

export function requireBodySizeLimit(request, options = {}) {
  const method = String(request.method || "GET").toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return null;
  if (options.maxBodyBytes === false) return null;

  const maxBodyBytes = Math.max(1, Number(options.maxBodyBytes || defaultMaxBodyBytes));
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (!Number.isFinite(contentLength) || contentLength <= maxBodyBytes) return null;

  return securityError(
    "Request body is too large.",
    413,
    "REQUEST_TOO_LARGE",
    { "Connection": "close" },
  );
}

function clientIp(request) {
  return String(
    request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]
    || "local",
  ).trim().slice(0, 80);
}

function cleanupRateLimitBuckets(now) {
  if (rateLimitBuckets.size < 5_000) return;
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }
}

export function applyRateLimit(request, options = {}) {
  const limit = Math.max(1, Number(options.limit || 60));
  const windowMs = Math.max(1_000, Number(options.windowMs || defaultWindowMs));
  const keyPrefix = String(options.keyPrefix || "api").slice(0, 80);
  const now = Date.now();
  const key = `${keyPrefix}:${clientIp(request)}`;
  const existing = rateLimitBuckets.get(key);
  const bucket = existing && existing.resetAt > now
    ? existing
    : { count: 0, resetAt: now + windowMs };

  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);
  cleanupRateLimitBuckets(now);

  if (bucket.count <= limit) return null;

  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return securityError(
    "Too many requests. Try again shortly.",
    429,
    "RATE_LIMITED",
    { "Retry-After": String(retryAfterSeconds) },
  );
}

export function guardMutationRequest(request, options = {}) {
  return requireSameOriginMutation(request)
    || requireBodySizeLimit(request, options)
    || applyRateLimit(request, options);
}
