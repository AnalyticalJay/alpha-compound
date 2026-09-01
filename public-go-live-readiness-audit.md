# Anabolics Africa — Public Go-Live Readiness Audit

**Assessment date:** 1 September 2026  
**Assessment scope:** Public storefront availability, gated customer access, catalogue and images, checkout and payment handoff, delivery readiness, SEO, security headers, responsive behaviour, and launch dependencies.  
**Assessor:** Manus AI

## Executive Summary

**Anabolics Africa is technically suitable for a controlled public launch, and the remaining image placeholders are not a technical launch blocker; full commercial go-live should remain conditional on client-owned payment, legal, account-access, and measurement decisions.** The published canonical domain returns the public storefront over HTTPS, redirects the `www` host to the canonical host, serves valid text `robots.txt`, and exposes a 232-location XML sitemap containing the homepage, catalogue, and 230 active product pages. Public routes, gated route handling, approval-based access, quote checkout, administrator controls, secure storage, responsive layouts, and the production build have been repeatedly regression-tested. The catalogue audit confirms 230 active products, with 112 HD Labs and 112 BP Pharma products each having a primary image that loads successfully on desktop and 390px mobile; 34 branded entries use the approved fallback asset, which is a content-quality follow-up rather than a broken-image condition. The principal release caveats are that no real PayFast charge has been completed to confirm ITN-to-paid-order and invoice behaviour, GA4 is not yet installed or verified, Shiplogic automation is not yet connected, and local legal/commercial review remains outside a technical audit.

## Readiness Verdict

| Launch area | Status | Evidence and interpretation |
|---|---|---|
| Public storefront availability | **Pass** | Canonical production homepage and public catalogue respond over HTTPS with HTTP 200. |
| Canonical domain | **Pass** | `www.anabolicsafrica.co.za` redirects to `https://anabolicsafrica.co.za/`. |
| Public catalogue | **Pass with content follow-up** | 230 active products are available; progressive loading and brand/category filters were browser-verified. |
| HD Labs and BP Pharma images | **Pass for delivery; content follow-up** | 224 branded products use product-specific or imported imagery; 34 use the approved branded fallback. No active branded product lacks a primary image or failed to load in the desktop/mobile audit. |
| Approval and gated access | **Pass, technically** | Public users are not given approved-user quote/payment capabilities; administrator and ownership checks are covered by the existing workflow suite. |
| Quote checkout | **Pass for controlled workflow** | Quote submission and downstream payment handoff are automated-test validated. |
| PayFast payment lifecycle | **Conditional** | The live hosted checkout handoff was reached successfully, but the client intentionally did not complete a charge; signed ITN, paid-order, and post-payment invoice behaviour therefore remain unverified with a real transaction. |
| Delivery tracking | **Pass for current manual workflow; automation pending** | Administrators can use the existing waybill/status workflow. Shiplogic/Flash Parcels API automation is not yet connected because the production API credential has not been supplied. |
| Security posture | **Pass with tracked maintenance** | Production security headers, CSP, session controls, upload validation, payment integrity, and private proof-of-payment access were previously verified. One inherited moderate ExcelJS dependency advisory remains tracked. |
| SEO and crawl controls | **Pass** | Live `robots.txt`, 232-location XML sitemap, canonical host, route metadata, and gated-route exclusions were verified. Search Console ownership and field data remain client actions. |
| Responsive behaviour | **Pass for audited layouts** | Public, customer, checkout, delivery, and administrator views have been tested at desktop and 390px mobile widths. |
| Measurement | **Pending client setup** | Search Console and GA4 setup guidance exists, but GA4 has not been installed or verified in the application. |
| Legal and commercial approval | **Client-owned gate** | Product legality, age/access policy, advertising, licences, fulfilment, payment-processor terms, and customer policies require qualified local review. |

## Evidence from the Published Site

The canonical production host returned HTTP 200 for the homepage, catalogue, representative product page, account shell, checkout shell, and administrator shell. The `www` host redirected with HTTP 301 to `https://anabolicsafrica.co.za/`. The live response served `robots.txt` as `text/plain` and `sitemap.xml` as `application/xml`; the sitemap contained **232** `<loc>` entries. The crawl policy excludes administrator, account, cart, checkout, order, notification, approval, and order-result routes from search crawling.

The live response also returned HSTS, CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy`. These are strong technical signals, but no security audit can establish absolute security or legal compliance.

## Catalogue and Image Findings

The catalogue contains **230 active products**. The existing filter verification confirmed complete All products, HD Labs, and BP Pharma results, and the category audit confirmed the requested category filters. The product-image audit then loaded all 112 HD Labs cards and all 112 BP Pharma cards successfully at both desktop and 390px mobile widths.

| Brand | Active products | Primary image association | Browser image loads | Fallback-primary count |
|---|---:|---:|---:|---:|
| HD Labs | 112 | 112/112 | 112/112 desktop and 112/112 mobile | 32 |
| BP Pharma | 112 | 112/112 | 112/112 desktop and 112/112 mobile | 2 |

The fallback treatment is intentionally branded and visible, so the site does not present broken or empty product cards. Replacing those 34 assets with product-specific photography will improve merchandising quality and customer confidence, but it is not required to keep the public catalogue functional. The separate replacement list is available in [`fallback-image-product-list.md`](./fallback-image-product-list.md).

## Workflow and Payment Readiness

The approved-user quote model is technically in place: users request access, approved users build quotes, administrators review them, and payment becomes available only after approval. The PayFast production endpoint and authenticated checkout bridge have been reached in a controlled R10 handoff. However, the account owner deliberately did not complete the charge. Consequently, the following live facts remain unconfirmed: a real provider transaction, signed ITN persistence, paid order state, payment record, post-payment invoice access, and real duplicate-callback behaviour. The site should not claim that a successful live payment has been proven until the merchant account owner authorises and completes that controlled test.

The current delivery workflow supports administrator-entered waybill and status updates visible to the customer timeline. Flash Parcels/Shiplogic automatic tracking lookup has not been completed because the client-authorised production Shiplogic API key is still required. This does not prevent the existing manual delivery workflow from operating, but it does mean that automatic courier refreshes should not be advertised as active.

## SEO, Performance, and Measurement

The published release has a factual 232-URL sitemap, public route metadata, gated-route crawl exclusions, canonical public-origin handling, route-level lazy loading, and immutable static-asset caching. The previous performance audit recorded no document-level 390px overflow and identified that local synthetic timings are not field Core Web Vitals. The common runtime bundle remains material, so real-user performance should be monitored after launch rather than inferred from local timings.[1]

Search Console ownership, sitemap submission, and GA4 property/web-stream setup remain client-owned measurement actions. GA4 is not currently installed or verified in the application. If tracking is later implemented, the client must first approve the privacy/consent approach and provide the approved `G-...` Measurement ID through secure project configuration; no sensitive product, health, payment, address, or personal data should be sent as analytics parameters.[2] [3]

## Required Conditions for Full Commercial Go-Live

| Priority | Condition | Owner | Acceptance evidence |
|---|---|---|---|
| Required before accepting live money | Complete one authorised low-value PayFast charge after confirming the merchant profile and amount | Merchant-account owner and administrator | Signed ITN, paid order, payment record, invoice access, and replay-protection evidence are present. |
| Required before public commercial operation | Complete local legal/commercial review | Business owner and qualified local advisers | Catalogue, age/access, advertising, licences, fulfilment, payment terms, privacy, and customer policies are approved. |
| Required before operational handoff | Review administrator accounts and support ownership | Site owner | Named operators, unique credentials/OAuth, and recovery responsibility are confirmed. |
| Required for automated courier tracking | Supply the authorised Shiplogic credential and complete the provider setup | Client/Flash Parcels contact | Server-side tracking lookup succeeds for an authorised waybill; automatic webhooks remain a later enhancement. |
| Required for measurement | Verify Search Console and create GA4 Web stream | Client Google-account owner | Domain property verified, sitemap submitted, and approved `G-...` ID supplied if implementation is requested. |
| Recommended | Replace the 34 fallback images | Catalogue/content owner | Each listed product has a product-specific primary image. |
| Recommended | Monitor the inherited ExcelJS advisory and public bundle size | Development owner | Dependency audit and field performance are reviewed at the next release. |

## Launch Recommendation

The appropriate technical recommendation is **controlled public launch readiness, not an unconditional claim of complete commercial readiness**. Image placeholders may remain during launch if they are acceptable to the business, because the fallback images are deliberate, branded, and technically functional. Before accepting genuine payments, the merchant owner should complete the controlled PayFast transaction and the business owner should approve the legal and commercial basis of the catalogue. The current manual delivery process can remain in use while Shiplogic automation is prepared.

## Final Prioritisation

1. **Complete the authorised PayFast smoke test** and retain ITN, payment, paid-order, invoice, and replay evidence.
2. **Complete local legal and commercial approval** for the catalogue, access model, fulfilment, payment terms, and customer policies.
3. **Verify Search Console and GA4** after the client approves the privacy/consent approach; do not represent GA4 as active before implementation.
4. **Provide the Shiplogic credential** if automated Flash Parcels status lookups are required; until then, use the existing manual waybill/status workflow.
5. **Replace the 34 fallback images** as a merchandising-quality improvement, not as a public availability blocker.

## References

[1]: [Anabolics Africa — Final Performance and Technical SEO Audit](./final-performance-seo-audit.md)  
[2]: [Google Search Console — Verify your website ownership](https://support.google.com/webmasters/answer/9008080?hl=en)  
[3]: [Google Analytics — Set up Analytics for a website or app](https://support.google.com/analytics/answer/9304153?hl=en)  
[4]: [Anabolics Africa — Production Readiness and Security Audit](./go-live-readiness-report.md)  
[5]: [PayFast Developer Documentation](https://developers.payfast.co.za/)
