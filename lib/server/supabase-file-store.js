const evidenceBucket = process.env.SUPABASE_EVIDENCE_BUCKET || "evidence-files";
const maxEvidenceStorageBytes = 20 * 1024 * 1024;

class SupabaseFileStoreError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "SupabaseFileStoreError";
    this.status = status;
    this.details = details;
  }
}

function getSupabaseStorageConfig() {
  return {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function isSupabaseFileStorageConfigured() {
  if (process.env.GENIUS_FORCE_LOCAL_STORE === "1") return false;
  const { url, serviceRoleKey } = getSupabaseStorageConfig();
  return Boolean(url && serviceRoleKey);
}

function storageUrl(path) {
  const { url } = getSupabaseStorageConfig();
  return new URL(`/storage/v1/${path}`, url);
}

async function storageRequest(path, { method = "GET", body, headers = {} } = {}) {
  const { serviceRoleKey } = getSupabaseStorageConfig();
  const response = await fetch(storageUrl(path), {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json",
      ...headers,
    },
    body,
    cache: "no-store",
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    throw new SupabaseFileStoreError(
      payload?.message || payload?.error || `Supabase Storage ${method} ${path} failed with ${response.status}.`,
      response.status,
      payload,
    );
  }

  return payload;
}

let bucketReadyPromise = null;

function objectPathForEvidence({ workspaceId, evidenceId, fileName }) {
  const today = new Date().toISOString().slice(0, 10);
  const safeFileName = String(fileName || "evidence-file")
    .replace(/[^\w.\- ()]/g, "_")
    .slice(0, 160);
  return `${workspaceId}/${today}/${evidenceId}/${safeFileName}`;
}

function encodeObjectPath(path) {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

function isBucketNotFound(error) {
  return error instanceof SupabaseFileStoreError
    && (error.status === 404 || /bucket not found/i.test(JSON.stringify(error.details || error.message)));
}

export async function ensureEvidenceBucket() {
  if (!isSupabaseFileStorageConfigured()) return null;
  if (bucketReadyPromise) return await bucketReadyPromise;

  bucketReadyPromise = (async () => {
    try {
      return await storageRequest(`bucket/${encodeURIComponent(evidenceBucket)}`);
    } catch (error) {
      if (!isBucketNotFound(error)) throw error;
    }

    try {
      return await storageRequest("bucket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: evidenceBucket,
          name: evidenceBucket,
          public: false,
          file_size_limit: maxEvidenceStorageBytes,
        }),
      });
    } catch (error) {
      const alreadyExists = error instanceof SupabaseFileStoreError
        && error.status === 400
        && /already|exist/i.test(JSON.stringify(error.details || error.message));
      if (alreadyExists) return await storageRequest(`bucket/${encodeURIComponent(evidenceBucket)}`);
      throw error;
    }
  })();

  try {
    return await bucketReadyPromise;
  } catch (error) {
    bucketReadyPromise = null;
    throw error;
  }
}

export async function storeEvidenceFile({ workspaceId, evidenceId, fileName, mimeType, buffer }) {
  if (!isSupabaseFileStorageConfigured()) return null;

  await ensureEvidenceBucket();
  const path = objectPathForEvidence({ workspaceId, evidenceId, fileName });
  const encodedPath = encodeObjectPath(path);
  await storageRequest(`object/${encodeURIComponent(evidenceBucket)}/${encodedPath}`, {
    method: "POST",
    headers: {
      "Content-Type": mimeType || "application/octet-stream",
      "x-upsert": "false",
    },
    body: buffer,
  });

  return {
    provider: "supabase_storage",
    bucket: evidenceBucket,
    path,
    mimeType,
    bytes: buffer.length,
    savedAt: new Date().toISOString(),
  };
}

export async function deleteEvidenceFiles(records = []) {
  if (!isSupabaseFileStorageConfigured()) return;

  const files = records
    .map((record) => record?.storage || record?.extracted?.storage_file)
    .filter((file) => file?.bucket === evidenceBucket && file?.path);

  await Promise.allSettled(
    files.map((file) =>
      storageRequest(`object/${encodeURIComponent(evidenceBucket)}/${encodeObjectPath(file.path)}`, {
        method: "DELETE",
      }),
    ),
  );
}
