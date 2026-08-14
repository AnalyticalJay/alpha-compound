export type CategoryPromotionProduct = {
  id: number;
  categoryId: number | null;
  primaryImage: string | null;
  isFeatured?: boolean | null;
};

export function selectCategoryPromotion<T extends CategoryPromotionProduct>(
  categoryId: number | undefined,
  promotedProductId: number | null | undefined,
  products: T[],
): T | undefined {
  if (!categoryId) return undefined;

  const eligible = products
    .filter((product) => product.categoryId === categoryId && Boolean(product.primaryImage))
    .sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));

  return eligible.find((product) => product.id === promotedProductId) ?? eligible[0];
}
