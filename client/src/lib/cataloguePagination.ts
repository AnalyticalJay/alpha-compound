export const CATALOGUE_PAGE_SIZE = 12;

export function getVisibleCatalogueItems<T>(items: T[], visibleCount: number) {
  return items.slice(0, Math.max(0, visibleCount));
}

export function getNextCatalogueVisibleCount(totalItems: number, currentCount: number) {
  return Math.min(totalItems, currentCount + CATALOGUE_PAGE_SIZE);
}
