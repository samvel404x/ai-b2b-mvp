export class SupabaseAuthError extends Error {
  constructor(message, status = 400, details = null) {
    super(message);
    this.name = "SupabaseAuthError";
    this.status = status;
    this.details = details;
  }
}

function authConfig() {
  return {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    authApiKey: process.env.SUPABASE_AUTH_KEY
      || process.env.SUPABASE_ANON_KEY
      || process.env.SUPABASE_PUBLISHABLE_KEY
      || process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function isSupabaseAuthConfigured() {
  const { url, serviceRoleKey, authApiKey } = authConfig();
  return Boolean(url && serviceRoleKey && authApiKey);
}

function endpoint(path) {
  const { url } = authConfig();
  return new URL(path, url);
}

async function authRequest(path, { method = "POST", body, admin = false } = {}) {
  const { serviceRoleKey, authApiKey } = authConfig();
  const key = admin ? serviceRoleKey : authApiKey;
  const response = await fetch(endpoint(path), {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new SupabaseAuthError(
      payload?.msg || payload?.message || `Supabase Auth request failed with ${response.status}.`,
      response.status,
      payload,
    );
  }

  return payload;
}

export function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function assertAuthInput(email, password) {
  if (!isSupabaseAuthConfigured()) {
    throw new SupabaseAuthError("Supabase Auth is not configured on the server.", 503);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new SupabaseAuthError("Enter a valid work email.", 400);
  }

  if (String(password || "").length < 8) {
    throw new SupabaseAuthError("Password must be at least 8 characters.", 400);
  }
}

function authUserFromTokenResponse(payload) {
  const user = payload?.user;
  if (!user?.id || !user?.email) {
    throw new SupabaseAuthError("Supabase Auth did not return a user session.", 502, payload);
  }

  return {
    userId: user.id,
    email: user.email,
    provider: "Email",
  };
}

export async function signInWithPassword(email, password) {
  const normalizedEmail = cleanEmail(email);
  assertAuthInput(normalizedEmail, password);

  const payload = await authRequest("/auth/v1/token?grant_type=password", {
    body: {
      email: normalizedEmail,
      password,
    },
  });

  return authUserFromTokenResponse(payload);
}

export async function signUpWithPassword(email, password) {
  const normalizedEmail = cleanEmail(email);
  assertAuthInput(normalizedEmail, password);

  try {
    await authRequest("/auth/v1/admin/users", {
      admin: true,
      body: {
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          product: "GENIUS MVP",
        },
      },
    });
  } catch (error) {
    const alreadyExists = error instanceof SupabaseAuthError
      && error.status === 422
      && /already|registered|exists/i.test(JSON.stringify(error.details || error.message));
    if (!alreadyExists) throw error;
  }

  return await signInWithPassword(normalizedEmail, password);
}
