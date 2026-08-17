# PayFast Runtime Validation

The Anabolics Africa payment form now obtains its PayFast merchant ID and merchant key from the managed server secrets through the protected `orders.payfastForm` procedure. The passphrase remains server-only and is used to generate and verify ITN signatures. The former frontend demo fallback credentials have been removed.

The form posts to `https://www.payfast.co.za/eng/process`. Its `notify_url` is derived from the active site origin and points to `/api/payfast/itn`; on the production domain this is `https://anabolicsafrica.co.za/api/payfast/itn` when the customer is using `https://anabolicsafrica.co.za`. The Express endpoint accepts PayFast form-encoded callbacks, verifies the signed payload, and updates the referenced payment. The production PayFast merchant dashboard should whitelist the production notify endpoint and return/cancel URLs before live transactions are enabled.

Validation evidence includes the runtime form configuration test, signature verification test, route-level signed and invalid ITN tests, the complete Vitest suite, and a clean TypeScript check.

## Customer payment options

Payment-ready customer orders now show a direct **Pay securely with PayFast** option and a separate **Pay by Instant EFT** option. The standard PayFast route leaves `payment_method` unset, so PayFast can show the payment methods enabled for the merchant. The Instant EFT route sends the hosted-form value `payment_method=ef`, which instructs PayFast to offer only EFT on its secure checkout page. This matches PayFast’s custom-integration documentation.

Selecting Instant EFT is therefore not an offline bank-transfer flow and does not require a new proof-of-payment upload. Existing historical manual-EFT orders in `awaiting_eft` remain available for proof upload and administrator confirmation. A failed PayFast attempt returns the quote to a payment-ready state so the customer can retry either option.

Instant EFT must be enabled for the merchant’s PayFast account before it can be offered successfully in production. The client should confirm this setting with PayFast and retain the existing production return, cancel, and ITN whitelist configuration.
