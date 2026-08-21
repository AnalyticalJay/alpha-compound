# Final Catalogue Image-Gap Source Audit

## Scope and selection policy

This pass audited the 72 active authoritative-catalogue products without primary images. Every candidate was researched independently and classified as verified, review-required, or unavailable. An image was eligible only when the supporting public source established the product identity, form, strength where specified, and brand where specified. Temporary image mirrors, generic supplies, variant conflicts, and weak-confidence matches were excluded.

## Import outcome

The reviewed importer validated direct HTTPS image responses, content type, and byte-size bounds before uploading images to S3. It imported 33 high-confidence product-specific images as new primary records. A dry re-run is idempotent: all 33 are skipped because they now have primary images; 3 variant cases remain under review; and 36 products remain unavailable because no exact safe image source was found.

## Representative storefront verification

Two new assignments were checked directly in the public storefront. **DEPOJECT 200 (TEST CYPIONATE)** renders its HD Labs Depoject vial image from S3. **BP RAD150 10mg** renders its newly assigned S3-backed source image. These checks confirm that the new primary-image records are exposed correctly by the product page.

## Remaining exception policy

The remaining records have intentionally not been assigned generic or approximate artwork. This includes unbranded supplies, missing-strength products, unavailable direct image responses, and reviewed variants such as Melanotan II, Betamox packaging, and Ivermectin brand differences. The associated importer report remains the machine-readable record of every exclusion reason.
