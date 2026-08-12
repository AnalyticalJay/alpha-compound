# PayFast Runtime Validation

The Anabolics Africa payment form now obtains its PayFast merchant ID and merchant key from the managed server secrets through the protected `orders.payfastForm` procedure. The passphrase remains server-only and is used to generate and verify ITN signatures. The former frontend demo fallback credentials have been removed.

The form posts to `https://www.payfast.co.za/eng/process`. Its `notify_url` is derived from the active site origin and points to `/api/payfast/itn`; on the production domain this is `https://anabolicsafrica.co.za/api/payfast/itn` when the customer is using `https://anabolicsafrica.co.za`. The Express endpoint accepts PayFast form-encoded callbacks, verifies the signed payload, and updates the referenced payment. The production PayFast merchant dashboard should whitelist the production notify endpoint and return/cancel URLs before live transactions are enabled.

Validation evidence includes the runtime form configuration test, signature verification test, route-level signed and invalid ITN tests, the complete Vitest suite, and a clean TypeScript check.
