const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

const MAX_BYTES = 4 * 1024 * 1024;

export type ImagePromptValidation =
  | { ok: true }
  | { ok: false; error: string };

export function validateImagePromptFile(file: File): ImagePromptValidation {
  const type = file.type.toLowerCase();
  if (!ALLOWED.has(type)) {
    return {
      ok: false,
      error: "Use a JPG, PNG, or WebP image.",
    };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: "Image must be 4 MB or smaller.",
    };
  }
  if (file.size < 1) {
    return { ok: false, error: "File is empty." };
  }
  return { ok: true };
}
