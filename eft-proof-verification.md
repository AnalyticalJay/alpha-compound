EFT proof stage verification

The schema now stores EFT proof URL, storage key, and original filename on orders. The customer upload flow accepts PDF, JPG, and PNG files up to 8 MB, uploads bytes through the existing S3-backed storage helper, persists metadata, and records an `eft_proof_uploaded` payment event. The administrator order detail surface exposes an authorized signed proof view and retains the existing Confirm EFT Payment action.

The full Vitest suite passes: 24 test files and 90 tests. TypeScript diagnostics are clean. New coverage checks owner-only uploads, unsupported MIME rejection, storage metadata, payment-event recording, signed download access contracts, and customer/admin UI contracts.

Database verification found one genuine EFT order (Order #1) already paid with no proof filename, so no synthetic or altered transaction was used for live browser upload verification. The upload and review paths remain available for the next real awaiting-EFT quote.
