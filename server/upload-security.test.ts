import { describe, expect, it } from "vitest";
import { decodeBase64File, hasExpectedFileSignature, sanitizeUploadFilename } from "./uploadSecurity";

describe("upload security", () => {
  it("accepts bounded base64 payloads and normalizes a user-provided filename", () => {
    expect(decodeBase64File(Buffer.from("%PDF-1.7\n").toString("base64")).toString("ascii")).toContain("%PDF-");
    expect(sanitizeUploadFilename("../../proof of payment.pdf")).toBe("proof-of-payment.pdf");
  });

  it("rejects malformed payloads and mismatched file signatures", () => {
    expect(() => decodeBase64File("not valid base64!")).toThrow();
    expect(hasExpectedFileSignature(Buffer.from("plain text"), "image/jpeg")).toBe(false);
    expect(hasExpectedFileSignature(Buffer.from("%PDF-1.7\n"), "application/pdf")).toBe(true);
  });
});
