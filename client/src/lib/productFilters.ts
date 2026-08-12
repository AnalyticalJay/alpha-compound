export type BrandFilter = "all" | "HD Labs" | "BP Pharma";

export type ProductSearchRecord = {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
};

export function getProductBrand(product: ProductSearchRecord) {
  const nameAndSlug = [product.name, product.slug]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
  const description = (product.description ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const combined = `${nameAndSlug} ${description}`;

  if (combined.includes("bp pharma") || /\bbp\b/.test(nameAndSlug)) return "BP Pharma" as const;
  if (description.includes("hd labs") || nameAndSlug.includes("hd labs") || /\bhd\b/.test(nameAndSlug)) return "HD Labs" as const;
  return "Other" as const;
}

export function matchesBrand(product: ProductSearchRecord, selectedBrand: BrandFilter) {
  return selectedBrand === "all" || getProductBrand(product) === selectedBrand;
}
