# Customer Catalogue Visibility and Product-Image Delivery Audit

## Scope

This audit reviewed the published customer catalogue data path, including active product counts, primary-image associations, public product-query filtering, and storage-image delivery behaviour. It does not alter product prices, stock quantities, or catalogue descriptions.

## Verified findings

| Check | Verified outcome |
| --- | --- |
| Active customer catalogue | **230 active products** are returned by the public catalogue query. The customer catalogue renders the complete query result rather than applying a client-side pagination or product-count cap. |
| Primary image coverage before correction | 227 of 230 active products had a primary image. |
| Missing primary images | `Betamox 500 (15 tabs)`, `IVERMECTIM 50ML`, and `MELANOTAN II` had no primary-image association. |
| Primary image coverage after correction | **230 of 230 active products** now have a primary-image association. The three unresolved items use the existing branded “Product image pending” fallback instead of an invented product image. |
| Customer catalogue rendering | Desktop and 390px customer catalogue checks show the full 230-result catalogue and visible product images in the first rendered cards. |
| Delivery issue identified | The prior storage proxy generated a fresh signed URL for each product image and set `no-store`. A grid or fast scroll could issue a large burst of signing requests, producing verified upstream `429 request too many` errors and leaving some images unrendered. |

## Corrective changes

Product images now request native browser lazy loading with asynchronous decoding. This limits the initial image requests to cards near the visible viewport rather than the entire 230-product grid.

The server-side public product-image proxy now uses a short-lived shared signed-URL cache, de-duplicates identical in-flight signing requests, and serializes new signing requests with a small interval. It also makes one bounded retry after a transient upstream rate-limit response. Public product-image redirects are cacheable for two minutes; protected `orders/` assets remain unavailable through the public route.

## Verification

The targeted storage and product-image tests passed, as did the complete regression suite and production build. The checkout and order-attachment security boundaries were not relaxed as part of this correction.

## Remaining content consideration

The three fallback cards now display reliably, but they are intentionally generic until an exact, approved source image is available. The customer catalogue itself is no longer excluding active records or limiting results.
