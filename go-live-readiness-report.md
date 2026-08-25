# Anabolics Africa — Production Readiness & Security Audit

**Assessment date:** 25 August 2026  
**Assessment scope:** Authentication, role and approval gating, quote-to-payment workflow, PayFast ITN processing, upload/storage access, dependency posture, responsive UI stability, and production build validation.  
**Assessor:** Manus AI

## Executive Assessment

> **Go-live is currently blocked:** A controlled R10.00 checkout reached PayFast on 25 August 2026, where it was rejected before any charge with `400 — Invalid merchant key`. The same test also exposed a missing order-line persistence defect; its local repair is validated but must be published before another live test. No software review can promise that every future production interaction will be error-free; a successful real-payment smoke test remains a mandatory release gate.

The audit found and remediated material hardening gaps around payment callback integrity, session policy, private proof-of-payment access, file upload validation, browser security headers, and outdated dependencies. The final production dependency audit has **one moderate inherited advisory** remaining: `uuid@8.3.2`, brought in by the browser-only, administrator-only Excel parser. Its known affected API is not used by the application; workbook uploads are additionally restricted to `.xlsx` files of 5 MB or smaller and remain behind the administrator role boundary. This should be monitored and removed when ExcelJS publishes a compatible dependency update.

| Readiness area | Result | Evidence |
|---|---|---|
| Customer and administrator access | Pass | Approval gating, ownership checks, administrator role checks, and denied-route browser scenarios passed. |
| Quote and payment workflow | Blocked pending remediation deployment and live gateway check | The isolated PayFast/Instant EFT success, failure, signature-rejection, invoice, and retry paths passed. The R10.00 live gateway attempt found an invalid merchant key and a missing order-line persistence defect. |
| Payment callback integrity | Hardened | The ITN now requires a valid signature, configured merchant ID, approved-quote amount, current awaiting-payment state, and ignores already-paid repeats. |
| File and storage protection | Hardened | EFT proofs are blocked from the public storage proxy and retrieved through the existing authenticated signed-download flow. |
| Dependency posture | Acceptable with one tracked moderate advisory | All audited critical/high production findings were removed or upgraded; one ExcelJS transitive moderate advisory remains. |
| Production artifact | Repair validated locally; publish required | The order-and-line-item atomic persistence repair passes TypeScript, production build, unit, and isolated browser workflow validation. |

## Security Controls Verified or Added

| Control | Outcome |
|---|---|
| Member approval and role boundaries | Public users cannot access pricing; approved users are required for cart, quote, payment, and proof-upload actions; administrator procedures enforce the administrator role. |
| Session safety | Session cookies are `HttpOnly`, `SameSite=Lax`, and always `Secure` in production. Signed session claims are now rejected when their application identifier does not match this application. |
| Browser protection | The server now disables the Express signature and returns `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` headers. Production also enables HSTS and a restrictive Content Security Policy. |
| Payment handoff | Checkout form origins are allowlisted to `anabolicsafrica.co.za`, `www.anabolicsafrica.co.za`, and the configured Manus production domain. |
| PayFast ITN | The payment notification verifies its signature, merchant ID, payment reference, amount, and permitted order state before any payment state change. This extends the ITN signature requirement documented by PayFast.[1] |
| Payment replay protection | A repeat ITN for an already-paid order is ignored without creating a duplicate payment event or notification. |
| Private proof documents | `/manus-storage/orders/*` no longer creates a public signed redirect. Customer and administrator proof review continues through an ownership-checked signed URL. |
| File uploads | Product images and proofs have bounded payloads, safe filenames, MIME allowlists, and file-signature checks. Product images are limited to JPEG/PNG; proofs are limited to PDF/JPEG/PNG. |
| Spreadsheet import | The unpatched SheetJS dependency was removed. The administrator-only Excel import uses ExcelJS, accepts `.xlsx` only, and limits browser parsing to 5 MB. |

## Automated Validation Results

| Validation | Result |
|---|---|
| Unit and router regression suite | **164 tests passed** across 44 files after adding order-line persistence coverage. |
| TypeScript | Passed with `tsc --noEmit`. |
| Production build | Passed; browser and server artifacts were generated successfully. |
| Focused browser workflow suite | **15 scenarios passed** across the prior focused suite; the repaired disposable quote/payment/fulfilment suite adds **6 passing scenarios**. |
| Visual stability suite | **11 scenarios passed** after refreshing reviewed baselines for intentional UI changes. |
| Dashboard compatibility review | The upgraded analytics dashboard rendered successfully after the Recharts security update. |
| Runtime headers | Confirmed `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` on the running server. |
| Production dependency audit | **1 moderate advisory remains**; no critical or high production advisories remain. |

## Required Release Gates

The following items are outside the codebase and must be completed before accepting live money or public traffic.

| Priority | Release gate | Owner | Completion criterion |
|---|---|---|---|
| Required | Publish order-line persistence repair | Site owner | Publish the checkpoint containing the atomic order header, line-item, shipping, payment-event, and cart-clear transaction before another live quote is submitted. |
| Required | PayFast production configuration | Merchant-account owner | The ITN URL is saved and Instant EFT is enabled. Re-enter and confirm the **live PayFast merchant key**; the initial R10.00 test reached PayFast but was rejected with `400 — Invalid merchant key` before any charge. |
| Required | Real payment smoke test | Merchant-account owner + administrator | After publishing the repair and correcting the merchant key, create a new low-value approved quote, complete PayFast and Instant EFT paths as appropriate, confirm the signed ITN changes only the matching order, and issue any test refund in the merchant portal. |
| Required | Domain and TLS verification | Site owner | Confirm both `anabolicsafrica.co.za` and `www.anabolicsafrica.co.za` resolve over HTTPS and redirect consistently to the selected canonical host. |
| Required | Operational access review | Site owner | Restrict administrator accounts to named operators, remove any unused accounts, and use unique strong passwords or the approved OAuth route. |
| Required | Legal and commercial review | Business owner and qualified local advisers | Confirm that the intended catalogue, age-gating, advertising, fulfilment, payment-processor terms, licences, and customer policies are permitted for the target market. This is not determined by a technical audit. |
| Recommended | Edge rate limiting and monitoring | Site owner / hosting configuration | Configure platform or edge limits for login, registration, checkout, and ITN endpoints; retain alerting and request logs for review. |
| Recommended | ExcelJS dependency watch | Development owner | Re-run `pnpm audit --prod` before each release and upgrade ExcelJS when it removes the transitive `uuid@8.3.2` advisory. |
| Recommended | Courier integration | Operations owner | Continue using the validated manual waybill/status workflow until courier API documentation is available for live event updates. |

## Recommended Launch Sequence

First publish the atomic order-line persistence repair. Next, have the merchant-account owner re-enter the verified live PayFast merchant key, then create a fresh dedicated low-value approved test quote on the canonical production domain. Run the payment, invoice, waybill, tracking, and delivery-status walkthrough, confirm the merchant transaction reference appears only on the matching order with a persisted line item, and complete a short administrator access review. Do not accept live customer payments until the successful smoke-test record is verified.

## References

[1] [PayFast Developer Documentation — ITN validation and integration guidance](https://developers.payfast.co.za/)
