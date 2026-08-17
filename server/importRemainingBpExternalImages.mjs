import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { productImages, products } from "../drizzle/schema";
import { addProductImage, getDb } from "./db";
import { storagePut } from "./storage";
import { selectUniqueExternalBpImageCandidates } from "../shared/bpExternalImageCandidates";

const researchPath = "/home/ubuntu/alpha-compound/bp-remaining-image-research.json";
const resolutionPath = "/home/ubuntu/alpha-compound/bp-remaining-image-resolution.json";
const reportPath = "/home/ubuntu/alpha-compound/bp-remaining-image-import-report.json";
const apply = process.argv.includes("--apply");
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(45_000),
        headers: { "user-agent": "Mozilla/5.0 (compatible; AnabolicsAfricaImageImporter/1.0)" },
      });
      if (response.ok || response.status < 500 || attempt === attempts) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(600 * attempt);
  }
  throw lastError ?? new Error("Source request failed");
}

function toCandidate(result) {
  const source = result.output ?? {};
  const [id, productName] = String(result.input ?? "").split(" | ");
  return {
    productId: Number(id),
    productName,
    sourcePageUrl: source.source_page_url ?? "",
    directImageUrl: source.direct_image_url ?? "",
    verifiedMatch: source.verified_match === true,
    confidence: source.confidence ?? "",
    researchEvidence: source.match_evidence ?? "",
    researchNote: source.review_note ?? "",
  };
}

function extensionFor(contentType, sourceUrl) {
  const subtype = contentType?.split("/")[1]?.split(";")[0]?.toLowerCase();
  if (subtype === "jpeg") return "jpg";
  if (["png", "webp", "gif", "avif", "jpg"].includes(subtype)) return subtype;
  const pathname = new URL(sourceUrl).pathname;
  const fromUrl = pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase();
  return fromUrl && ["png", "jpg", "jpeg", "webp", "gif", "avif"].includes(fromUrl) ? fromUrl : "img";
}

const research = JSON.parse(await readFile(researchPath, "utf8"));
const resolutions = JSON.parse(await readFile(resolutionPath, "utf8"));
const primaryCandidates = (research.results ?? []).map(toCandidate);
const resolutionCandidates = (resolutions.results ?? []).map(toCandidate);
const resolvedByProductId = new Map(
  resolutionCandidates
    .filter((candidate) => candidate.verifiedMatch && candidate.directImageUrl.startsWith("https://"))
    .map((candidate) => [candidate.productId, candidate])
);
const candidates = primaryCandidates.map((candidate) => resolvedByProductId.get(candidate.productId) ?? candidate);
const reviewedCandidates = selectUniqueExternalBpImageCandidates(candidates);
const report = {
  mode: apply ? "apply" : "dry-run",
  imported: [],
  ready: [],
  skipped: [],
  unavailable: [],
  reviewRequired: [],
};

const db = await getDb();
if (!db) throw new Error("Database not available");

for (const reviewed of reviewedCandidates) {
  const { candidate } = reviewed;
  if (!reviewed.eligible) {
    report.reviewRequired.push({ productId: candidate.productId, productName: candidate.productName, reason: reviewed.reason });
    continue;
  }

  const product = await db
    .select({ id: products.id, name: products.name, slug: products.slug, isActive: products.isActive })
    .from(products)
    .where(eq(products.id, candidate.productId))
    .limit(1);
  const target = product[0];
  if (!target || !target.isActive || !target.slug.startsWith("bp-")) {
    report.reviewRequired.push({ productId: candidate.productId, productName: candidate.productName, reason: "The active BP Pharma catalogue record is no longer available for the reviewed source mapping." });
    continue;
  }

  const existing = await db
    .select({ id: productImages.id, imageKey: productImages.imageKey, isPrimary: productImages.isPrimary })
    .from(productImages)
    .where(eq(productImages.productId, target.id));
  if (existing.some((image) => image.isPrimary)) {
    report.skipped.push({ productId: target.id, productName: target.name, reason: "primary_image_already_exists" });
    continue;
  }

  const sourcePage = await fetchWithRetry(candidate.sourcePageUrl).catch(() => null);
  if (!sourcePage?.ok) {
    report.unavailable.push({ productId: target.id, productName: target.name, imageUrl: candidate.directImageUrl, reason: `source_page_${sourcePage?.status ?? "network_error"}` });
    continue;
  }
  const imageResponse = await fetchWithRetry(candidate.directImageUrl).catch(() => null);
  const contentType = imageResponse?.headers.get("content-type")?.toLowerCase() ?? "";
  const contentLength = Number(imageResponse?.headers.get("content-length") ?? 0);
  if (!imageResponse?.ok || !contentType.startsWith("image/") || (contentLength > MAX_IMAGE_BYTES && contentLength > 0)) {
    report.unavailable.push({
      productId: target.id,
      productName: target.name,
      imageUrl: candidate.directImageUrl,
      reason: !imageResponse?.ok ? `image_${imageResponse?.status ?? "network_error"}` : !contentType.startsWith("image/") ? `non_image_${contentType || "unknown"}` : "image_too_large",
    });
    continue;
  }
  const bytes = Buffer.from(await imageResponse.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    report.unavailable.push({ productId: target.id, productName: target.name, imageUrl: candidate.directImageUrl, reason: bytes.length === 0 ? "empty_image" : "image_too_large" });
    continue;
  }

  const entry = {
    productId: target.id,
    productName: target.name,
    productSlug: target.slug,
    sourcePageUrl: candidate.sourcePageUrl,
    sourceImageUrl: candidate.directImageUrl,
    contentType,
    bytes: bytes.length,
    researchEvidence: candidate.researchEvidence,
  };
  if (!apply) {
    report.ready.push(entry);
    continue;
  }

  const urlHash = createHash("sha256").update(candidate.directImageUrl).digest("hex").slice(0, 10);
  const extension = extensionFor(contentType, candidate.directImageUrl);
  const uploaded = await storagePut(`products/bp-pharma/external/${target.slug}_${urlHash}.${extension}`, bytes, contentType);
  await addProductImage({
    productId: target.id,
    imageUrl: uploaded.url,
    imageKey: uploaded.key,
    isPrimary: true,
  });
  report.imported.push({ ...entry, imageUrl: uploaded.url, imageKey: uploaded.key, status: "primary_uploaded" });
}

await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  mode: report.mode,
  ready: report.ready.length,
  imported: report.imported.length,
  skipped: report.skipped.length,
  unavailable: report.unavailable.length,
  reviewRequired: report.reviewRequired.length,
  reportPath,
}, null, 2));
process.exit(0);
