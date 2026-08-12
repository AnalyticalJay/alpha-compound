export type CatalogSort = "featured" | "price-asc" | "price-desc" | "popularity";

export type SortableCatalogProduct = {
  name: string;
  price?: string | number | null;
  salesCount?: number | null;
  isFeatured?: boolean | null;
};

function numericPrice(price: SortableCatalogProduct["price"]): number | null {
  if (price === null || price === undefined || price === "") return null;
  const parsed = typeof price === "number" ? price : Number.parseFloat(price);
  return Number.isFinite(parsed) ? parsed : null;
}

function compareNames(a: SortableCatalogProduct, b: SortableCatalogProduct) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

export function sortCatalogProducts<T extends SortableCatalogProduct>(products: T[], sort: CatalogSort): T[] {
  return [...products].sort((a, b) => {
    const aPrice = numericPrice(a.price);
    const bPrice = numericPrice(b.price);
    const aSales = a.salesCount ?? 0;
    const bSales = b.salesCount ?? 0;
    const aFeatured = a.isFeatured ? 1 : 0;
    const bFeatured = b.isFeatured ? 1 : 0;

    if (sort === "price-asc" || sort === "price-desc") {
      if (aPrice === null && bPrice !== null) return 1;
      if (aPrice !== null && bPrice === null) return -1;
      if (aPrice !== null && bPrice !== null && aPrice !== bPrice) {
        return sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
      }
    }

    if (sort === "popularity" && aSales !== bSales) return bSales - aSales;
    if (sort === "featured" && aFeatured !== bFeatured) return bFeatured - aFeatured;
    if (aSales !== bSales) return bSales - aSales;
    if (aFeatured !== bFeatured) return bFeatured - aFeatured;
    return compareNames(a, b);
  });
}
