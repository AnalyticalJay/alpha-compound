const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const MAX_UPLOAD_BASE64_LENGTH = 12_000_000;

export function decodeBase64File(fileData: string): Buffer {
  const normalized = fileData.trim();
  if (!normalized || normalized.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) {
    throw new Error("Upload data is not valid base64");
  }

  const buffer = Buffer.from(normalized, "base64");
  if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error("Upload exceeds the allowed file size");
  }

  return buffer;
}

export function sanitizeUploadFilename(fileName: string): string {
  const safeName = fileName
    .split(/[\\/]/)
    .pop()
    ?.replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);

  if (!safeName || safeName === "." || safeName === "..") {
    throw new Error("Upload filename is invalid");
  }

  return safeName;
}

export function hasExpectedFileSignature(buffer: Buffer, mimeType: "application/pdf" | "image/jpeg" | "image/png") {
  if (mimeType === "application/pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }

  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  return buffer.length >= 8
    && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
}
