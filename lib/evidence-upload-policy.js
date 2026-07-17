export const supportedEvidenceExtensions = Object.freeze([
  ".pdf",
  ".csv",
  ".txt",
  ".xlsx",
  ".xls",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
]);

export const evidenceUploadPolicy = Object.freeze({
  maxFiles: 8,
  maxFileBytes: 20 * 1024 * 1024,
  maxBatchBytes: 50 * 1024 * 1024,
  maxDecodedTextChars: 160000,
  supportedExtensions: supportedEvidenceExtensions,
  supportedLabels: Object.freeze(["PDF", "DOCX", "XLSX", "CSV", "TXT", "PNG / JPG", "WEBP"]),
  accept: supportedEvidenceExtensions.join(","),
});

export const maxEvidenceUploadBytes = evidenceUploadPolicy.maxFileBytes;
export const maxEvidenceUploadFiles = evidenceUploadPolicy.maxFiles;
export const maxEvidenceUploadBatchBytes = evidenceUploadPolicy.maxBatchBytes;
export const maxEvidenceDecodedTextChars = evidenceUploadPolicy.maxDecodedTextChars;

export function evidenceFileSizeLabel(size = 0) {
  const bytes = Number(size) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function extensionFromEvidenceName(name) {
  const match = String(name || "").toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] ?? "";
}

export function safeEvidenceFileName(name) {
  return String(name || "evidence-file")
    .replace(/[^\w.\- ()]/g, "_")
    .replace(/\s+/g, " ")
    .slice(0, 180)
    || "evidence-file";
}

export function validateEvidenceUploadSelection(files = []) {
  const selectedFiles = Array.from(files || []).filter(Boolean);

  if (!selectedFiles.length) {
    return { ok: false, status: 400, error: "Attach at least one evidence file." };
  }

  if (selectedFiles.length > evidenceUploadPolicy.maxFiles) {
    return {
      ok: false,
      status: 413,
      error: `Upload up to ${evidenceUploadPolicy.maxFiles} files at a time.`,
    };
  }

  let totalBytes = 0;
  for (const file of selectedFiles) {
    const name = safeEvidenceFileName(file.name);
    const extension = extensionFromEvidenceName(name);
    const size = Number(file.size) || 0;

    if (!supportedEvidenceExtensions.includes(extension)) {
      return {
        ok: false,
        status: 415,
        error: `${name} is not supported. Use PDF, CSV, XLSX, DOCX, TXT, PNG, JPG, or WEBP.`,
      };
    }

    if (size <= 0) {
      return {
        ok: false,
        status: 422,
        error: `${name} is empty and cannot be analyzed.`,
      };
    }

    if (size > evidenceUploadPolicy.maxFileBytes) {
      return {
        ok: false,
        status: 413,
        error: `${name} is too large. Upload files under ${evidenceFileSizeLabel(evidenceUploadPolicy.maxFileBytes)}.`,
      };
    }

    totalBytes += size;
  }

  if (totalBytes > evidenceUploadPolicy.maxBatchBytes) {
    return {
      ok: false,
      status: 413,
      error: `This upload is too large. Upload up to ${evidenceFileSizeLabel(evidenceUploadPolicy.maxBatchBytes)} per batch.`,
    };
  }

  return { ok: true, files: selectedFiles, totalBytes };
}
