# Production Readiness Audit Evidence

## Visual Baseline Review — 25 August 2026

The full Playwright suite completed **24 of 28 scenarios** successfully. The four failures were visual-baseline differences rather than functional assertion failures. Manual review of the current 390px checkout and quote-detail captures found their expected customer controls, quote summary, delivery tracking, payment selection, customer conversation, footer, and mobile navigation present and legible.

The checkout screenshot is taller because it includes the revised premium footer delivery treatment. The quote-detail screenshot is taller because it includes the expanded payment, tracking, conversation, and footer content now present in the page. These are baseline-maintenance findings that must be refreshed only after the remaining security remediation is complete and the resulting screens have been revalidated.

## External Reference

PayFast's developer documentation states that ITN notifications must have their security signature verified. This audit uses that official requirement as the basis for reviewing the current signature validation and the surrounding order-integrity controls.

- [PayFast Developer Documentation](https://developers.payfast.co.za/)

## PayFast Checkout Signature Finding — 25 August 2026

The verified PayFast production Developer Settings profile has ITN enabled at `https://anabolicsafrica.co.za/api/payfast/itn`. A controlled R10.00 quote was successfully created on the published site with a durable order line, shipping detail, and payment-handoff reference; no payment completed.

PayFast's official custom-integration documentation requires a generated MD5 `signature` field on every checkout POST. It also requires the signature input string to preserve the documentation field order, use form-style URL encoding, append the passphrase, and avoid the alphabetically sorted API-signature format. The production checkout helper was found to omit the outbound `signature` field and to use alphabetic ordering for its shared signature helper. The hosted PayFast endpoint rejected the handoff before payment with `400 — Invalid merchant key`.

The remedial scope is limited to adding the required ordered checkout signature and aligning ITN signature construction with PayFast's documented order/encoding rules. Merchant credentials and ITN settings are not changed by this code repair.

- [PayFast Custom Integration Documentation](https://developers.payfast.co.za/docs#step_1_create_a_checkout_form)
- [PayFast Integration Requirements](https://payfast.io/integration/submit-your-solution/)

## Final Remediation and Validation Record

- Removed unused AWS SDK and rich markdown-rendering packages that contributed production audit findings.
- Upgraded Axios, Express, tRPC, Drizzle ORM, NanoID, and Recharts; replaced SheetJS with ExcelJS for administrator `.xlsx` import.
- Added production session, payment-origin, PayFast merchant/amount/state, storage-proxy, upload validation, and browser-header safeguards.
- Final validation completed with 162 Vitest tests, a successful TypeScript check, a successful production build, 15 focused browser workflow scenarios, and 11 refreshed visual baseline scenarios.
- Final `pnpm audit --prod` result: one moderate ExcelJS transitive `uuid@8.3.2` advisory remains. It is confined to the administrator-only, client-side spreadsheet parser and is documented as a tracked release risk in `go-live-readiness-report.md`.
