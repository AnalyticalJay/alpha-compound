# Authenticated Catalogue Image Regression Findings

## Initial reproduction context
The current browser session opened the preview catalogue at `/products` and was not authenticated, showing the public gated state with prices hidden. The page returned 230 products and the first 12 product-card image elements used `/manus-storage/...` paths.

## Public browser measurement
A browser console measurement of the first catalogue page found 12 image elements, all complete with `naturalWidth > 0`. The three mapped HD Labs product assets returned width 600, the branded pending asset returned width 1920, and other mapped assets returned widths 600 or 900. No failed image URLs were present in that public session.

## Current hypothesis boundary
The product data path and image renderer are shared between public and approved customers. The storage proxy does not branch on authentication for product images; it signs and redirects non-order storage keys. The reported signed-in-only failure therefore needs a comparison of the approved-user request path, cache state, and browser image error responses rather than a catalogue data rewrite.

## Relevant verification already available
`e2e/approved-customer-image-render.spec.ts` runs with `x-e2e-role: customer` and currently passes both catalogue and product-detail image checks, including `naturalWidth > 0`. This confirms the isolated approved-customer path is healthy for the test product, but does not yet cover the full 230-product catalogue or a real email/password session.

## Follow-up audit and fix
The full 230-card Playwright audit passed for both the public catalogue and the approved-customer request path; all rendered image elements had a positive natural width and no storage responses with HTTP status 400 or higher were captured. The pre-existing focused approved-customer catalogue/detail checks also pass.

The shared `ProductImage` renderer now handles a failed primary image by switching to the existing branded `/manus-storage/anabolics-africa-product-image-pending_8ff48682.png` asset. If that fallback also fails, it renders an accessible `Image temporarily unavailable` state instead of leaving a broken-image icon. A forced 503 test for an approved customer passed, confirming the recovery path.

Desktop and 390px mobile catalogue screenshots after the fix preserve the existing dark branded layout and image-under-watermark presentation. The exact real email/password session could not be reproduced in this sandbox because no customer credentials were supplied, so the fix is verified against the production-equivalent authenticated request path and an injected storage failure.
