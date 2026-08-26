# Anabolics Africa — Final Performance and Technical SEO Audit

## Executive Summary

**The release is materially more search-ready and performant, but launch approval should be conditional on publishing this checkpoint and treating the first organic-search dataset as the next source of evidence.** The audit found that the live public domain previously returned the SPA HTML document for both `robots.txt` and `sitemap.xml`, leaving crawl guidance and sitemap discovery unavailable; this has been corrected in the built release with a factual 232-URL sitemap drawn from the active catalogue, a crawl policy that excludes gated customer/admin journeys, and a canonical public origin. Public home, catalogue, and product-detail routes now provide route-aware titles, descriptions, and canonical URLs, while authenticated routes are marked `noindex,nofollow` at runtime. Route-level code splitting moved admin tooling and spreadsheet parsing out of the public entry path; the final mobile production-artifact sample recorded 1.61 MB transferred for the uncached home journey and 0.57 MB for the catalogue, with no 390px document overflow. Immutable caching now applies to static assets, although the main runtime chunk remains 642 KB minified (193 KB gzip), so image weight and real-user Core Web Vitals should be monitored after launch. No GSC, GA4, backlink, keyword, or field-CWV export was available; the report therefore does not make traffic, ranking, backlink-quality, or market-demand claims. [1] [2]

## Organic Traffic Trend

Traffic, country, landing-page, device, and keyword history were **not provided**. No six-month organic trend chart can be generated without Google Search Console, GA4, Ahrefs, Semrush, or comparable data. The immediate SEO measurement priority is to verify Search Console ownership after publishing, submit the sitemap, and collect the first index coverage and query data.

## Page Type Analysis

The indexable estate is intentionally limited to the homepage, public catalogue, and active public product-detail pages. The generated sitemap contains **232 URLs**: the homepage, catalogue, and 230 active product pages. Gated cart, checkout, account, orders, notifications, approval, and administrator paths are excluded from crawling because they do not provide a public search destination or should not appear in organic results.

## Branded vs Non-Branded Search Terms

Branded versus non-branded query data was not provided. The current release cannot establish whether discovery depends on Anabolics Africa brand searches or non-branded catalogue demand. Search Console query exports are required before setting a credible organic acquisition KPI.

## Keyword Portfolio

Keyword, ranking, click, and landing-page data was not provided. Product-detail metadata now uses the active product name and description at runtime, so each public product URL has a better defined page topic than the prior single site-wide title. The next audit should validate rendered metadata with Search Console URL Inspection and collect query coverage before evaluating keyword concentration.

## SEO Content Analysis

The public content structure currently concentrates on commercial catalogue discovery rather than editorial content. This is appropriate for the gated quote model, but it leaves no evidence yet of non-branded informational discovery. No content-cluster, locale, or keyword-click chart is included because no click data exists.

## Site Architecture

The revised architecture gives crawlers a clear public discovery path: homepage → catalogue → active product pages. The dynamic sitemap draws only from active products, while robots disallows authenticated and operational routes. This reduces accidental crawl allocation to quote, payment, and administrative views; Search Console coverage data is still required to confirm actual indexing and click depth after launch.

## Backlink Analysis

**Headline:** Backlink strength cannot be assessed because no referring-domain, anchor-text, target-page, or link-velocity export was provided. **Domain Quality:** Data not provided. **Anchor Text Analysis:** Data not provided. **Distribution of Backlinks:** Data not provided. **Verdict:** Do not infer backlink quality or pursue disavow work until a verified backlink export is available.

## Technical SEO

| Finding | Evidence | Business / SEO meaning | Action |
|---|---|---|---|
| Crawl controls were missing | Before remediation, both public crawl-control URLs returned the SPA HTML response. | Search engines had no valid robots policy or sitemap discovery endpoint. | Implemented real `robots.txt` and dynamic `sitemap.xml` routes before the SPA fallback. |
| Sitemap is factual and bounded | Final artifact serves 232 sitemap locations from homepage, catalogue, and active products. | Inactive or test-only products are not advertised to crawlers. | Submit `https://anabolicsafrica.co.za/sitemap.xml` in Search Console after publishing. |
| Gated routes are protected from indexing | Robots disallows admin, account, cart, checkout, order, and notification paths; runtime metadata applies `noindex,nofollow` outside public routes. | Customer and operational pages are less likely to dilute the public search footprint. | Retain this exclusion pattern when adding new gated routes. |
| Public metadata is route-aware | Home, catalogue, and product pages now assign title, description, and canonical data. | Reduces the previous single-title SPA limitation for JavaScript-capable crawlers. | Validate representative product URLs with Search Console URL Inspection after launch. |
| Static-asset caching is improved | Final artifact serves immutable assets with `public, max-age=31536000, immutable`; HTML remains revalidatable. | Repeat visits can reuse versioned assets without serving stale HTML. | Monitor CDN cache headers in production after publish. |

## Core Web Vitals and Page Experience

The production-artifact sampler at a 390px viewport found no document-level overflow. On a local production server with an empty cache, the homepage recorded **108 ms** DOMContentLoaded, **109 ms** load completion, **50** resources, and **1.61 MB** transferred; the catalogue recorded **61 ms**, **63 ms**, **228** resources, and **0.57 MB** transferred. These are local artifact timings, not field Core Web Vitals, and must not be interpreted as user internet performance.

The final production build is now route-split: public Home and Products chunks are 62.54 KB and 30.58 KB minified respectively, while admin dashboard and spreadsheet-import tooling load as separate route chunks. The common runtime chunk remains 642.37 KB minified (192.65 KB gzip), so the next technical performance target is vendor-level splitting and image-resource review, guided by real-user data rather than synthetic estimates.

## Final Prioritization

1. **Resolved:** The crawl controls, metadata, cache policy, and route splitting were published in checkpoint `60b35448`. Live verification confirms a text `robots.txt`, a 232-location XML sitemap, the homepage canonical, and a long-lived static-asset cache policy.
2. **Problem:** Organic visibility, branded/non-branded mix, backlinks, and field Core Web Vitals are unknown. **Fix:** Verify Search Console and GA4, submit the sitemap, and export the first 30–60 days of coverage, query, and Core Web Vitals data for the next evidence-led review.
3. **Problem:** The common runtime chunk remains material for a public mobile experience. **Fix:** Use the next bundle inspection to split shared vendor dependencies and reduce public-image transfer volume without reintroducing eager admin imports.
4. **Problem:** Product metadata is set client-side in a SPA. **Fix:** Validate rendered pages in Search Console; if indexing remains inconsistent, introduce server-rendered or pre-rendered public metadata for home, catalogue, and product pages.

## References

[1]: https://anabolicsafrica.co.za/ "Anabolics Africa public homepage"
[2]: https://anabolicsafrica.co.za/products "Anabolics Africa public catalogue"
