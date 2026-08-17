# Body Pharm Supplier Catalogue Audit

The supplied Body Pharm supplier catalogue exposes individual product-detail URLs under:

`https://www.anabolicsteroids.co.za/suppliers/body-pharm/{product-slug}`

The supplier index lists 47 products, including Anapolon, Anavar, Aqua TNE, Aqua Winstrol, Bold, BPC157 & TB500 Pen, CB, Deca, DHEA, Dianabol, Equi, GHK-CU Pen, Halotest, Mast, Methyltest, MTren, Nebido, NPP, Primo, Retatrutide Pens, Somatropin Pens, Superdrol, Sustanon, Test variants, Tirzepatide Pens, Tren variants, Turinabol, Ultra products, and Winstrol.

The index itself contains product links but no usable product-image payloads. Image extraction must use the individual supplier product-detail pages. Only images whose supplier product name/strength match an active BP Pharma catalogue product will be imported. Existing primary BP Pharma product images will not be overwritten by the supplier import.

## Extraction outcome

The supplier importer found 47 supplier products. It verified and imported 45 supplier images into secure storage under `products/bp-pharma/supplier/`, including the source pages for Anapolon, Anavar, injectable compounds, peptides, and the Ultra range. The remaining two supplier titles—`CB 250` and `Methyltest 10`—do not have an unambiguous active BP Pharma catalogue match and were intentionally not assigned.

The detail page at `https://www.anabolicsteroids.co.za/suppliers/body-pharm/anapolon-25` exposes its image as `/images/suppliers/body-pharm/anapolon-25.png`. Storefront verification confirmed the imported Body Pharm Anapolon image renders on `https://anabolicsafrica.co.za/products/bp-anapolin-25mg` while the existing product name, strength, price-pending state, and stock remain unchanged.

## Follow-up identity confirmation

The supplier identifies `CB 250` as **Cheque Drops** (chemical composition: **Mibolerone**), at **250mcg per tablet**, with the image path `/images/suppliers/body-pharm/cd-250.png`. The supplier identifies `Methyltest 10` as **Methyl-1-Testosterone**, at **10mg per tablet**, with the image path `/images/suppliers/body-pharm/methyltest-10.png`. These facts are preserved pending exact catalogue-name mappings; chemical identity and strength must both agree before an image is assigned.

## Resolved catalogue mappings

`CB 250` is now mapped to **BP Cheque Drops 250mcg** (`bp-cheque-drops-250mcg`). The existing workbook-imported product was corrected from `250mg` to `250mcg` because the supplier identifies Cheque Drops as Mibolerone at 250mcg per tablet. `Methyltest 10` is now represented by the new BP Pharma record **BP Methyltest 10mg** (`bp-methyltest-10mg`), distinct from the existing HD Labs `METHYL-1-TEST` record.

Both verified supplier images have been stored under `products/bp-pharma/supplier/` and set as the primary image for their respective BP Pharma records. Both products remain price pending (`R0.00`) with stock quantity `0`.

Storefront verification confirmed that both `https://anabolicsafrica.co.za/products/bp-cheque-drops-250mcg` and `https://anabolicsafrica.co.za/products/bp-methyltest-10mg` render their correct Body Pharm pack images, category, corrected dosage information, and gated price-pending state.
