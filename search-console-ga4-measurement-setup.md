# Anabolics Africa: Search Console & GA4 Measurement Setup Checklist

**Prepared for:** Anabolics Africa  
**Prepared by:** Manus AI  
**Purpose:** Establish trustworthy post-launch search and on-site measurement without exposing customer, payment, quote, or sensitive catalogue data.

> **Current status:** The public technical SEO release is live. Google Search Console and GA4 are not yet confirmed as configured in the application. This checklist separates the client’s Google-account and DNS actions from the later, explicitly approved analytics implementation.

## 1. Confirmed public measurement prerequisites

The canonical public address is **https://anabolicsafrica.co.za**. The live site publishes **https://anabolicsafrica.co.za/robots.txt** and **https://anabolicsafrica.co.za/sitemap.xml**. At the time of the final technical audit, the sitemap contained **232 canonical public URLs**: the homepage, the catalogue, and 230 active public product pages. Gated account, quote, payment, order, and administrator paths are intentionally excluded from the sitemap and restricted from crawling.

This means the website is ready for ownership verification and sitemap submission. Sitemap submission helps Google discover and monitor the supplied URLs, but remains a discovery hint rather than an indexing guarantee.[2]

| Item | Current status | Client action needed |
|---|---|---|
| Canonical public domain | Live: `https://anabolicsafrica.co.za` | Use this address for the GA4 Web data stream. |
| Search Console property | Not confirmed | Create a **Domain property** for `anabolicsafrica.co.za`. |
| DNS access | Client-controlled | Add Google’s verification TXT record at the domain provider. |
| XML sitemap | Live: `/sitemap.xml` | Submit `https://anabolicsafrica.co.za/sitemap.xml` in Search Console. |
| GA4 property and tag | Not installed/verified | Create the property and Web stream, then supply the Measurement ID securely for approved implementation. |
| Consent and privacy decision | Pending | Confirm the business’s privacy, consent, and cookie requirements before any GA4 tag is deployed. |

## 2. Ownership, permissions, and handover

The merchant should own both Google properties. The client must not share Google login credentials. Instead, the client can invite the developer or reporting reviewer using role-based access after verification. Search Console supports multiple verified owners and recommends keeping more than one valid verification method so access is not lost if a single token or tag later changes.[1]

| Role | Recommended responsibility | Access level |
|---|---|---|
| Merchant / client domain owner | Creates the Google accounts, controls DNS, remains permanent owner, and approves privacy choices. | Search Console owner; GA4 administrator. |
| Developer | Adds only approved site-side measurement, validates tag firing, and maintains event data minimisation. | Search Console delegated owner or full user as needed; GA4 editor. |
| Business / catalogue reviewer | Reviews search trends, funnel completion, and content priorities without changing configuration. | Search Console full user; GA4 viewer or analyst. |
| Legal / privacy owner | Confirms the chosen consent, privacy notice, retention, and cookie approach before tracking begins. | Review responsibility; access only if needed. |

## 3. Search Console: one-time setup

### Recommended property

1. Sign in at [Google Search Console](https://search.google.com/search-console/) with the merchant-controlled Google account.
2. Select **Add property**, choose **Domain**, and enter `anabolicsafrica.co.za` without a protocol or path.
3. Copy the Google-supplied DNS TXT record exactly and add it at the domain’s DNS provider. Verify only after the TXT record is visible to the provider. Domain verification is the appropriate option because it covers protocol and subdomain variants, including the canonical and `www` hostnames.[1]
4. In **Settings → Ownership verification**, retain the DNS record and add a second verification method where practical, such as an HTML tag or Google tag after GA4 has been approved and deployed.[1]
5. Add the delegated developer and business reviewer by their individual Google accounts; do not circulate a shared Google login.

### Submit and inspect the sitemap

1. Open **Indexing → Sitemaps** in the new Domain property.
2. Submit the complete URL: `https://anabolicsafrica.co.za/sitemap.xml`.
3. Record the submission date and wait for the report to show the fetch and processing state. Google’s sitemap report is valuable because it shows access and processing errors, even though sitemap submission itself does not guarantee crawling or indexing.[2]
4. Use **URL Inspection** on these representative public URLs:

| Inspection priority | URL to inspect | Expected outcome |
|---|---|---|
| Homepage | `https://anabolicsafrica.co.za/` | Public, canonical, and eligible for indexing. |
| Catalogue | `https://anabolicsafrica.co.za/products` | Public catalogue route, canonical, and eligible for indexing. |
| Representative product | `https://anabolicsafrica.co.za/products/hd-testoviron-250mg-1ml-amp` | Product-specific title/canonical, public, and eligible for indexing. |

Do **not** request indexing for gated, account, quote, payment, order, or administrator URLs. Their exclusion is intentional and supports the approved-user operating model.

### First operational reviews

Google recommends reviewing whether Google can find and read the site, then monitoring Search performance and site health reports.[3] The initial reviewer should examine the following sections after data begins arriving.

| Search Console area | What to check | Escalate when |
|---|---|---|
| Sitemaps | Submitted sitemap is fetched and processed without a persistent error. | The sitemap cannot be read, has unexpected URLs, or shows widespread URL errors. |
| Page indexing | Public homepage, catalogue, and selected product URLs are discoverable; exclusions align with intentionally gated routes. | Public canonical pages are blocked, excluded unexpectedly, or duplicate URLs grow materially. |
| URL Inspection | Live-test result, canonical selection, and index status for representative public pages. | Google selects an unexpected canonical or cannot retrieve the page. |
| HTTPS / Security issues / Manual actions | No warning requiring action. | Any security or manual-action warning appears. |
| Performance | Clicks, impressions, CTR, and average position by page, query, country, and device. | A material change persists after comparing like-for-like dates and filters. |
| Core Web Vitals | Mobile and desktop field-data groups when sufficient traffic exists. | A sustained “Needs improvement” or “Poor” group appears with enough field data. |

## 4. GA4: account and Web stream setup

GA4 needs an Analytics account/property, a **Web** data stream, and a Google tag deployed directly, through a CMS, or through Google Tag Manager.[4] The client should create these items in a merchant-controlled Google account before requesting implementation.

1. Open [Google Analytics](https://analytics.google.com/) and create a property named **Anabolics Africa – Website**.
2. Select the reporting time zone **South Africa / Johannesburg** and currency **South African Rand (ZAR)**. Google notes that property time-zone changes affect data going forward, so confirm these choices before traffic collection begins.[4]
3. Under **Admin → Data streams**, add a **Web** stream with website URL `https://anabolicsafrica.co.za` and a clear stream name such as **Anabolics Africa Production**.[4]
4. Copy the **Measurement ID**. It has the format `G-...` and identifies the Web data stream receiving data.[5]
5. Send only the Measurement ID to the developer through an agreed secure channel. Do not post it in public documents, screenshots, or shared support threads.
6. Before implementation, the merchant must confirm the privacy/consent decision with its appropriate privacy adviser. This guide does not replace legal advice. The approved decision should state whether analytics fires immediately, only after consent, or not at all for visitors who decline optional analytics.
7. After written approval and receipt of the Measurement ID, the developer can add the tag through a controlled environment configuration and application release. The release should be tested in GA4 Realtime/DebugView and then checked against production.

> **Important:** Do not add an unapproved GA4 snippet now. GA4 must remain absent until the Measurement ID and the privacy/consent decision are supplied and the merchant authorises implementation.

## 5. Privacy-first quote-funnel measurement plan

The business model is an approved-user quote funnel, not an open retail checkout. Initial analytics should therefore measure only the minimum aggregate steps needed to understand navigation and quote completion. Search Console measures activity before a user reaches the site from Google Search; GA4 measures behaviour on the site after arrival.[6]

| Event | When it may fire | Allowed purpose and minimum data | Prohibited data |
|---|---|---|---|
| `view_public_catalogue` | A visitor views the public catalogue. | Count catalogue interest; optional route family only. | Product names, product contents, search text, account identity. |
| `view_public_product` | A visitor views a public product page. | Count page-view intent; optional generic public-product route family only. | Product name, SKU, dosage, category, health inference, price. |
| `add_to_quote` | An approved user successfully adds an item to a quote. | Count successful add actions only. | Quote ID, user ID, product identifiers, item names, quantities. |
| `begin_quote` | The user enters the quote submission flow. | Count funnel starts. | Address, contact details, cart contents, health information. |
| `quote_submitted` | The backend confirms the quote submission succeeded. | Count confirmed submissions without identifiers. | Quote/order ID, product list, notes, name, email, phone, address. |
| `quote_approved_notification_seen` | An approved-quote notification is displayed to the user. | Count notification visibility. | Quote ID, product details, customer identity. |
| `payment_handoff_selected` | A customer chooses an approved payment handoff. | Count handoff selection only, with no payment attributes. | Payment reference, PayFast fields, EFT proof, bank/payment details, total. |

No GA4 URL, event, user property, or custom dimension may carry **personally identifiable information**, addresses, EFT proof, payment references, PayFast fields, quote/order identifiers, medical or health inferences, or product names, dosages, contents, categories, search terms, and cart contents. The implementation should also avoid sending route query strings if one could contain sensitive data.

> **Payment-success measurement is deliberately deferred.** A real hosted PayFast handoff was confirmed without a charge. Do not create a browser-side “purchase” or “payment success” event until a merchant-authorised live payment has completed and the secure server-side ITN/order-state process has been validated in production. Any later success event must be created from the trusted server-side confirmation path, without payment or customer data in GA4.

## 6. 48-hour, 7-day, 30-day, and 60-day operating cadence

Search Console data may take several days to accrue after a property is added.[1] Core Web Vitals uses real-user CrUX field data; a newly added or low-traffic property can show **No data available** until sufficient data exists.[7] This is expected and should not be treated as a launch defect.

| Timing | Account / technical check | Business review outcome |
|---|---|---|
| Within 48 hours of Search Console setup | Confirm DNS verification, sitemap submission, sitemap fetch status, and representative URL Inspection checks. | Record launch date and any expected exclusions for gated paths. |
| Within 48 hours of approved GA4 release | Confirm the production tag fires only according to the documented consent choice; verify Realtime/DebugView with a non-sensitive test journey. | Confirm only the approved minimal event names appear. |
| Day 7 | Review Sitemaps, Page indexing, HTTPS, Security Issues, Manual Actions, and early performance trends. | Produce a short technical status note; do not overinterpret very small datasets. |
| Day 30 | Establish the first baseline for organic search, audience engagement, and quote-funnel completions. | Identify the highest-impression pages/queries and the most significant funnel drop-off. |
| Day 60 | Compare the most recent 30 days with the preceding 30 days using consistent filters. Review early CWV field data if it is present. | Prioritise content, UX, or technical follow-up only where the trend is sustained and supported by both tools. |

## 7. Concise reporting dashboard

Google’s combined Search Console/Analytics guidance recommends analysing comparable trends rather than expecting identical totals: a Search Console click is a Google Search-result click, while a GA4 session is a period of interaction on the site.[6] Use matching date ranges, country filters, and device filters when comparing the two tools.

| Reporting question | Search Console metric | GA4 metric | Suggested breakdown |
|---|---|---|---|
| Is the site becoming more visible in Google Search? | Impressions, clicks, CTR, average position | Organic sessions | Date, page, query, country, device. |
| Are organic visitors engaging after arrival? | Clicks and CTR for the landing page/query | Sessions, engagement rate, returning users | Organic Google channel; landing page; mobile vs desktop. |
| Is the quote journey progressing? | Search landing-page clicks only | `add_to_quote`, `begin_quote`, `quote_submitted`, approval-notification visibility, payment-handoff selection | Aggregated event count and completion rate; no user- or product-level detail. |
| Is technical health stable? | Indexing, sitemap, HTTPS/security/manual-action status; CWV groups | No primary GA4 equivalent | Public route family; mobile and desktop CWV groups. |

The longer-term combined report can use Google’s official Search Console and GA4 Looker Studio pattern once both properties contain data.[6] Before building any dashboard, set the date range and filters consistently and ensure the report shares only aggregated business metrics.

## 8. Client action summary

| Priority | Client action | Output to retain |
|---|---|---|
| 1 | Create the Search Console Domain property and add the DNS TXT record. | Verified property with the merchant as owner. |
| 2 | Submit `https://anabolicsafrica.co.za/sitemap.xml`. | Submission date and processing status. |
| 3 | Create GA4 property/Web stream with Johannesburg time zone and ZAR. | Measurement ID in `G-...` format. |
| 4 | Confirm privacy/consent requirements and authorise or decline GA4 implementation. | Written decision for the release record. |
| 5 | Provide the Measurement ID securely only after step 4. | Approved developer implementation request. |
| 6 | Review the 48-hour, 7-day, 30-day, and 60-day checks. | Measurement baseline and prioritised follow-up list. |

## References

[1]: https://support.google.com/webmasters/answer/9008080?hl=en "Google Search Console Help — Verify your site ownership"
[2]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central — Build and submit a sitemap"
[3]: https://developers.google.com/search/docs/monitor-debug/search-console-start "Google Search Central — Get started with Search Console"
[4]: https://support.google.com/analytics/answer/9304153?hl=en "Google Analytics Help — Set up Analytics for a website and/or app"
[5]: https://support.google.com/analytics/answer/12270356?hl=en "Google Analytics Help — GA4 Measurement ID"
[6]: https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console "Google Search Central — Using Search Console and Google Analytics data for SEO"
[7]: https://support.google.com/webmasters/answer/9205520?hl=en "Google Search Console Help — Core Web Vitals report"
