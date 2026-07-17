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

function allowLocalAuthFallback() {
  return process.env.NODE_ENV !== "production" && process.env.GENIUS_ALLOW_LOCAL_AUTH !== "0";
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new SupabaseAuthError("Enter a valid work email.", 400);
  }

  if (String(password || "").length < 8) {
    throw new SupabaseAuthError("Password must be at least 8 characters.", 400);
  }
}

function localAuthUser(email, metadata = {}) {
  if (!allowLocalAuthFallback()) {
    throw new SupabaseAuthError("Supabase Auth is not configured on the server.", 503);
  }

  return {
    userId: `local:${email}`,
    email,
    provider: "Local MVP",
    role: metadata.role,
    position: metadata.position,
    department: metadata.department,
  };
}

function localAuthUserAfterProviderFailure(error, email, metadata = {}) {
  if (!allowLocalAuthFallback()) throw error;
  if (error instanceof SupabaseAuthError && error.status < 500 && error.status !== 503) throw error;
  return localAuthUser(email, metadata);
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
    role: user.user_metadata?.role,
    position: user.user_metadata?.position,
    department: user.user_metadata?.department,
  };
}

export async function signInWithPassword(email, password) {
  const normalizedEmail = cleanEmail(email);
  assertAuthInput(normalizedEmail, password);

  if (!isSupabaseAuthConfigured()) {
    return localAuthUser(normalizedEmail);
  }

  try {
    const payload = await authRequest("/auth/v1/token?grant_type=password", {
      body: {
        email: normalizedEmail,
        password,
      },
    });

    return authUserFromTokenResponse(payload);
  } catch (error) {
    return localAuthUserAfterProviderFailure(error, normalizedEmail);
  }
}

export async function signUpWithPassword(email, password, metadata = {}) {
  const normalizedEmail = cleanEmail(email);
  assertAuthInput(normalizedEmail, password);

  if (!isSupabaseAuthConfigured()) {
    return localAuthUser(normalizedEmail, metadata);
  }

  try {
    await authRequest("/auth/v1/admin/users", {
      admin: true,
      body: {
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          product: "GENIUS MVP",
          role: metadata.role,
          position: metadata.position,
          department: metadata.department,
          workspace_name: metadata.workspaceName,
          company_size: metadata.companySize,
          business_type: metadata.businessType,
        },
      },
    });
  } catch (error) {
    const alreadyExists = error instanceof SupabaseAuthError
      && error.status === 422
      && /already|registered|exists/i.test(JSON.stringify(error.details || error.message));
    if (!alreadyExists) {
      return localAuthUserAfterProviderFailure(error, normalizedEmail, metadata);
    }
  }

  return await signInWithPassword(normalizedEmail, password);
}
