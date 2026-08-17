# Body Pharm Supplier Catalogue Audit

The supplied Body Pharm supplier catalogue exposes individual product-detail URLs under:

`https://www.anabolicsteroids.co.za/suppliers/body-pharm/{product-slug}`

The supplier index lists 47 products, including Anapolon, Anavar, Aqua TNE, Aqua Winstrol, Bold, BPC157 & TB500 Pen, CB, Deca, DHEA, Dianabol, Equi, GHK-CU Pen, Halotest, Mast, Methyltest, MTren, Nebido, NPP, Primo, Retatrutide Pens, Somatropin Pens, Superdrol, Sustanon, Test variants, Tirzepatide Pens, Tren variants, Turinabol, Ultra products, and Winstrol.

The index itself contains product links but no usable product-image payloads. Image extraction must use the individual supplier product-detail pages. Only images whose supplier product name/strength match an active BP Pharma catalogue product will be imported. Existing primary BP Pharma product images will not be overwritten by the supplier import.

## Extraction outcome

The supplier importer found 47 supplier products. It verified and imported 45 supplier images into secure storage under `products/bp-pharma/supplier/`, including the source pages for Anapolon, Anavar, injectable compounds, peptides, and the Ultra range. The remaining two supplier titles—`CB 250` and `Methyltest 10`—do not have an unambiguous active BP Pharma catalogue match and were intentionally not assigned.

The detail page at `https://www.anabolicsteroids.co.za/suppliers/body-pharm/anapolon-25` exposes its image as `/images/suppliers/body-pharm/anapolon-25.png`. Storefront verification confirmed the imported Body Pharm Anapolon image renders on `https://anabolicsafrica.co.za/products/bp-anapolin-25mg` while the existing product name, strength, price-pending state, and stock remain unchanged.
