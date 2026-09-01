# Regular Customer Product Image Verification

## Live observation

On 1 September 2026, the published customer-facing route `https://anabolicsafrica.co.za/products` was opened without navigating to an administrator route. The page rendered its normal product catalogue shell, including the HD Labs and BP Pharma filter controls, but displayed **0 premium products available**, **0 results**, and no product cards or product images. The page title was `Performance Product Catalogue | Anabolics Africa`.

The browser console showed no client-side console output or JavaScript error during this observation. Because the published route returned no product cards, this session could not confirm image rendering for a regular customer; the immediate verified issue is that the live customer catalogue is empty, which must be resolved before image display can be confirmed on that route.

## Scope note

This observation is separate from earlier database and preview checks that reported active products and successful image loads. It should not be interpreted as proof that source image files are missing. It indicates a discrepancy between the published public route and the previously verified catalogue data path.

## API request observation

The published page requested the expected batched tRPC route containing `products.list` with `{ categoryId: null, search: null }`, alongside the auth and category queries. The page still rendered 0 products. This narrows the issue to the published products query response or its production data/environment, rather than a product-card image rendering failure. No credential or secret was exposed while inspecting the request URL.

## Follow-up API verification

A direct authenticated request to the same published batched tRPC resource returned HTTP 200 with **230 products** and **10 categories**. This means the production products API currently contains the expected catalogue, and the earlier `0 results` page snapshot was captured before the client query finished resolving rather than proving an empty production catalogue.

## Visual verification after query settlement

After the public catalogue query settled, the published storefront displayed `230 premium products available`, `230 results`, and 12 visible product cards. The visual cards showed actual product imagery under the faint diagonal watermark, including a DIANABOL package and TESTAJECT/TRENAJECT packaging; the lower cards also showed the approved branded fallback where a product-specific image is not available.

A representative public detail route, `https://anabolicsafrica.co.za/products/dianabol10`, was opened next. The initial capture was still in the detail page’s loading-skeleton state, so a settled detail-page capture is still required before declaring the detail image verified for this session.
