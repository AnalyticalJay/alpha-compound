# Remaining BP Pharma Image Source Audit

## Scope and evidence

This audit began with **57 active BP Pharma products without a primary image**. The complete first-pass research evidence, including public product-page and direct-image URLs, is stored in `bp-remaining-image-research.json`. A second conservative pass for unresolved products is stored in `bp-remaining-image-resolution.json`.

Every imported item passed all of the following checks before upload: an active BP Pharma catalogue record, a secure source product page, a downloadable image response with an image content type, no existing primary image, and no duplicate direct-image URL among new assignments. The importer is implemented in `server/importRemainingBpExternalImages.mjs` and writes the current operational result to `bp-remaining-image-import-report.json`.

## Completed coverage

**49** source-validated external packaging images were securely uploaded as primary BP Pharma product images: 40 in the first import and 9 in the second pass. Together with the earlier 47 Body Pharm supplier images and 9 user-supplied peptide images, **105 of 113** BP Pharma products now have a primary image. Prices remain `R0.00`/Price pending and stock remains `0`.

Three source-confirmed dosage labels were corrected without altering their slugs, pricing, or stock:

| Product ID | Corrected catalogue name | Verified source unit |
| --- | --- | --- |
| 60053 | BP Clenbuterol 40mcg | 40mcg |
| 60059 | BP Tertroxin T3 25mcg | 25mcg |
| 60066 | BP Dostinex 100mcg | 100mcg |

## Products intentionally left without an image

The following eight products remain unassigned because a product-specific image could not be verified without risking a duplicate, incorrect dosage form, or another brand’s packaging.

| Product | Reason for preserving the no-image state |
| --- | --- |
| BP Cialis 5mg | Available source artwork is also proposed for other products and cannot be confirmed as unique packaging. |
| BP Clenbuterol 80mg Inj | The available evidence identifies 80mcg/ml, not the catalogue’s 80mg injectable claim. |
| BP Clomid 25mg | Available source artwork is also proposed for other products and cannot be confirmed as unique packaging. |
| BP Cy Combo Inj | No genuine injectable Body Pharm variant was verified. |
| BP Levitra 20mg | No verified product-specific Body Pharm packaging source was found. |
| BP Ostarine 10mg | Available source artwork is shared and cannot be confirmed as product-specific. |
| BP RAD150 10mg | No verified product-specific packaging source was found. |
| BP YK 11 10mg | No verified product-specific packaging source was found. |

These records should be revisited only when the client provides supplier artwork or confirms the affected product identity and dosage form.

## Storefront verification

The development storefront was checked after import for `BP Accutane 10mg` and `BP GHRP-6 5mg`. Both product-detail pages rendered their new S3-backed primary images with the matching product title and dosage information. The full regression suite and browser suite also passed after the import.
