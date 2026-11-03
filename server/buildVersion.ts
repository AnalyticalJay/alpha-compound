import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export async function getBuildVersion() {
  const preferredPaths = process.env.NODE_ENV === "production"
    ? [path.resolve(import.meta.dirname, "public", "index.html"), path.resolve(import.meta.dirname, "..", "client", "index.html")]
    : [path.resolve(import.meta.dirname, "..", "client", "index.html"), path.resolve(import.meta.dirname, "public", "index.html")];
  let contents: Buffer | null = null;
  for (const indexPath of preferredPaths) {
    try {
      contents = await fs.readFile(indexPath);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  if (!contents) throw new Error("Build entrypoint index.html was not found");
  return createHash("sha256").update(contents).digest("hex").slice(0, 16);
}
