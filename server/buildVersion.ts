import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export async function getBuildVersion() {
  const indexPath = process.env.NODE_ENV === "development"
    ? path.resolve(import.meta.dirname, "..", "client", "index.html")
    : path.resolve(import.meta.dirname, "public", "index.html");
  const contents = await fs.readFile(indexPath);
  return createHash("sha256").update(contents).digest("hex").slice(0, 16);
}
