# Anabolics Africa — Production Readiness & Security Audit

**Assessment date:** 25 August 2026  
**Assessment scope:** Authentication, role and approval gating, quote-to-payment workflow, PayFast ITN processing, upload/storage access, dependency posture, responsive UI stability, and production build validation.  
**Assessor:** Manus AI

## Executive Assessment

> **Checkout is verified; payment confirmation remains deliberately deferred:** The controlled R10.00 order now reaches the PayFast hosted payment page with the correct total after the order-line, checkout-signature, bridge, and browser-policy repairs were published. The account owner chose not to complete the charge, so no real ITN, paid-order, or invoice-after-payment record exists yet. A successful low-value payment remains the final payment release gate.

The audit found and remediated material hardening gaps around payment callback integrity, session policy, private proof-of-payment access, file upload validation, browser security headers, and outdated dependencies. The final production dependency audit has **one moderate inherited advisory** remaining: `uuid@8.3.2`, brought in by the browser-only, administrator-only Excel parser. Its known affected API is not used by the application; workbook uploads are additionally restricted to `.xlsx` files of 5 MB or smaller and remain behind the administrator role boundary. This should be monitored and removed when ExcelJS publishes a compatible dependency update.

| Readiness area | Result | Evidence |
|---|---|---|
| Customer and administrator access | Pass | Approval gating, ownership checks, administrator role checks, and denied-route browser scenarios passed. |
| Quote and payment workflow | Checkout verified; paid lifecycle deferred | The isolated PayFast/Instant EFT success, failure, signature-rejection, invoice, and retry paths passed. The live R10.00 order was created with a persisted line item, reached the authenticated continuation page, and opened the PayFast hosted checkout without invalid-key or invalid-signature feedback. No payment was completed by client choice. |
| Payment callback integrity | Hardened | The ITN now requires a valid signature, configured merchant ID, approved-quote amount, current awaiting-payment state, and ignores already-paid repeats. |
| File and storage protection | Hardened | EFT proofs are blocked from the public storage proxy and retrieved through the existing authenticated signed-download flow. |
| Dependency posture | Acceptable with one tracked moderate advisory | All audited critical/high production findings were removed or upgraded; one ExcelJS transitive moderate advisory remains. |
| Production artifact | Pass | The atomic order persistence, ordered PayFast signatures, authenticated checkout bridge, and narrowly scoped PayFast hosted-redirect CSP allowance are published and validated. |

## Security Controls Verified or Added

| Control | Outcome |
|---|---|
| Member approval and role boundaries | Public users cannot access pricing; approved users are required for cart, quote, payment, and proof-upload actions; administrator procedures enforce the administrator role. |
| Session safety | Session cookies are `HttpOnly`, `SameSite=Lax`, and always `Secure` in production. Signed session claims are now rejected when their application identifier does not match this application. |
| Browser protection | The server now disables the Express signature and returns `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` headers. Production also enables HSTS and a restrictive Content Security Policy. |
| Payment handoff | The checkout form is signed in PayFast’s documented field order and traverses an authenticated same-origin bridge. Form navigation is restricted to `www.payfast.co.za` and PayFast’s verified hosted-payment redirect domain only. |
| PayFast ITN | The payment notification verifies its signature, merchant ID, payment reference, amount, and permitted order state before any payment state change. This extends the ITN signature requirement documented by PayFast.[1] |
| Payment replay protection | A repeat ITN for an already-paid order is ignored without creating a duplicate payment event or notification. |
| Private proof documents | `/manus-storage/orders/*` no longer creates a public signed redirect. Customer and administrator proof review continues through an ownership-checked signed URL. |
| File uploads | Product images and proofs have bounded payloads, safe filenames, MIME allowlists, and file-signature checks. Product images are limited to JPEG/PNG; proofs are limited to PDF/JPEG/PNG. |
| Spreadsheet import | The unpatched SheetJS dependency was removed. The administrator-only Excel import uses ExcelJS, accepts `.xlsx` only, and limits browser parsing to 5 MB. |

## Automated Validation Results

| Validation | Result |
|---|---|
| Unit and router regression suite | **169 tests passed** across 46 files after adding checkout-signature, bridge, and hosted-redirect policy coverage. |
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
| Required | Rotate exposed PayFast secrets | Merchant-account owner | Rotate the Merchant Key and security passphrase that were visible in the shared dashboard screenshot, then update secure project configuration as a matched live credential pair. |
| Required | Real payment smoke test | Merchant-account owner + administrator | Create a new low-value approved quote, complete one PayFast charge, confirm the signed ITN changes only the matching order, verify paid invoice access, and issue any required test refund in the merchant portal. |
| Required | Domain and TLS verification | Site owner | Confirm both `anabolicsafrica.co.za` and `www.anabolicsafrica.co.za` resolve over HTTPS and redirect consistently to the selected canonical host. |
| Required | Operational access review | Site owner | Restrict administrator accounts to named operators, remove any unused accounts, and use unique strong passwords or the approved OAuth route. |
| Required | Legal and commercial review | Business owner and qualified local advisers | Confirm that the intended catalogue, age-gating, advertising, fulfilment, payment-processor terms, licences, and customer policies are permitted for the target market. This is not determined by a technical audit. |
| Recommended | Edge rate limiting and monitoring | Site owner / hosting configuration | Configure platform or edge limits for login, registration, checkout, and ITN endpoints; retain alerting and request logs for review. |
| Recommended | ExcelJS dependency watch | Development owner | Re-run `pnpm audit --prod` before each release and upgrade ExcelJS when it removes the transitive `uuid@8.3.2` advisory. |
| Recommended | Courier integration | Operations owner | Continue using the validated manual waybill/status workflow until courier API documentation is available for live event updates. |

## Recommended Launch Sequence

The checkout path is ready for a controlled live payment. First rotate the Merchant Key and security passphrase exposed in the dashboard screenshot, then update the secure production configuration as a matched pair. Create one fresh low-value approved quote, complete a PayFast payment, verify the signed ITN changes only the matching order with a persisted line item, confirm paid invoice access, and retain the merchant reference for reconciliation. Do not treat the deferred no-charge test as ITN confirmation.

## References

[1] [PayFast Developer Documentation — ITN validation and integration guidance](https://developers.payfast.co.za/)
