export type SupplierProduct = {
  title: string;
  slug: string;
  productPageUrl: string;
  imageUrl: string;
};

export type CatalogueProduct = {
  id: number;
  name: string;
  slug: string;
};

export function normalizeBodyPharmMatchKey(value: string, source: "supplier" | "catalogue") {
  const aliased = value
    .toLowerCase()
    .replace(/anapolon/g, "anapolin")
    .replace(/aqua/g, "aq")
    .replace(/\btne\b/g, "test")
    .replace(/\(pen\)/g, "")
    .replace(/^bp\s+/g, "")
    .replace(/iu\b/g, "")
    .replace(/hgh/g, "")
    .replace(/mg\b/g, "");

  return aliased.replace(/[^a-z0-9]+/g, "");
}

export function matchBodyPharmSupplierProducts(
  supplierProducts: readonly SupplierProduct[],
  catalogueProducts: readonly CatalogueProduct[],
) {
  const catalogueByKey = new Map<string, CatalogueProduct[]>();
  for (const product of catalogueProducts) {
    const key = normalizeBodyPharmMatchKey(product.name, "catalogue");
    const matches = catalogueByKey.get(key) ?? [];
    matches.push(product);
    catalogueByKey.set(key, matches);
  }

  return supplierProducts.map((supplierProduct) => {
    const key = normalizeBodyPharmMatchKey(supplierProduct.title, "supplier");
    const candidates = catalogueByKey.get(key) ?? [];
    return { supplierProduct, key, candidates };
  });
}
