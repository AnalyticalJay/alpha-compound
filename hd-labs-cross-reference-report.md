# HD LABS Workbook vs Website Catalogue Cross-Reference

## Scope

This comparison uses the uploaded workbook `WebsiteHDBPPricelist2026.xlsx` and scans only the worksheet identified as **HD**. The BP PHARMA worksheet was not processed. The comparison uses the active website records whose persistent brand is `hd_labs`; no product, category, price, stock, or image records were changed.

## Executive result

The workbook contains **86 priced HD Labs product rows** after excluding category-heading rows. The active website catalogue contains **110 HD Labs products**. **78 workbook rows matched** to website products, while **8 workbook rows require manual name matching** and **32 active website products do not have a confident workbook counterpart** under the current normalization rules.

All 78 confident matches have matching prices, all have stock greater than zero, and no dosage mismatch was found where a dosage was explicitly present in both records. There are **16 category discrepancies** between the workbook section and the website category. These are findings for review only; no automatic category changes were made.

| Measure | Result |
|---|---:|
| HD workbook priced rows | 86 |
| Active HD Labs website products | 110 |
| Confident name matches | 78 |
| Workbook rows needing manual matching | 8 |
| Website-only products | 32 |
| Category mismatches among matches | 16 |
| Price mismatches among matches | 0 |
| Dosage mismatches among matches | 0 |
| Matched products with zero stock | 0 |

## Workbook rows requiring manual matching

The following rows did not reach the conservative matching threshold. Some are likely naming variants or duplicate entries and should not be changed automatically.

| Workbook row | Workbook product | Likely website candidate |
|---:|---|---|
| 33 | CLENBUTEROL | HELIOSJECT (40MCG CLENBUTEROL HCL) |
| 38 | HELIOSJECT 20ML | HELIOSJECT (40MCG CLENBUTEROL HCL) |
| 52 | TRINAJECT (MIX) | TRINAJECT (50MG/ML TREN ACETATE) |
| 57 | ANAVAR50 | DIANABOL50 30 TABS |
| 61 | CLENBUTEROL | HELIOSJECT (40MCG CLENBUTEROL HCL) |
| 67 | DNP 100mg 10 TABS | DNP (2.4-Dinitrophenol 100mg per tab) |
| 76 | SIBUTRAMAX | TRAMACET |
| 85 | ZMA (10mg Zinc, 150mg Magnesium, 3.5mg Vitamin B6, 2mg Boron) 90 caps | HD ZMA (10MG Zinc) |

The repeated `CLENBUTEROL` rows should be reviewed against the intended product and dosage before any catalogue update. The `ANAVAR50`, `SIBUTRAMAX`, and `ZMA` candidates are not safe automatic matches based on name similarity alone.

## Category discrepancies requiring review

These products matched by name but their website category differs from the workbook section. This report does not assume that the workbook category should always override the existing audited website classification; it identifies the records that need confirmation.

| Workbook product | Workbook section | Website product | Website category |
|---|---|---|---|
| HGH (rDNA origin) GROWTH HORMONE | PEPTIDES | HGH (rDNA origin) GROWTH HORMONE | INJECTABLES |
| ARIMADEX | ORALS | ARIMADEX | POST CYCLE |
| CIALIS (20mg x 10 TABS) | ORALS | CIALIS (20mg x 10 TABS) | PHARMA |
| CLOMID | ORALS | CLOMID | POST CYCLE |
| D3 (Vitamin D3) 30 caps | ORALS | HD D3 (Vitamin D3) | PHARMA |
| FAMARA (LETROZOLE) | ORALS | FAMARA (LETROZOLE) | POST CYCLE |
| HELIOST3 (37.5MCG CLEN, 5.4MG YOHIMBINE, 25MCG T3) | ORALS | HELIOST3 (37.5MCG CLEN | FAT LOSS |
| KETOTIFEN | ORALS | KETOTIFEN | FAT LOSS |
| SIMPLY SHREDDED | ORALS | HD SIMPLY SHREDDED | FAT LOSS |
| T3 | ORALS | T3 | PHARMA |
| TAMOX | ORALS | TAMOXIFEN | POST CYCLE |
| TIGHT AND TONE | ORALS | Tight and Tone | PHARMA |
| SUPERBULK 600 | SARMS | SUPERBULK 600 - (200MG/ML TEST CYP | INJECTABLES |
| SUPERCUTMIX 300 | SARMS | SUPERCUTMIX 300 - (100MG/ML TREN ACETATE | INJECTABLES |
| SUPERSIZE 500 | SARMS | SUPERSIZE 500 - (100MG/ML TEST CYP | INJECTABLES |
| SUPERTEST 500 | SARMS | SUPERTEST 500 - (150MG/ML ENANTHATE | INJECTABLES |

Several entries are expected to require business confirmation because the workbook appears to use broad commercial sections, while the website audit uses product-form or use-case categories. In particular, the four `SUPER...` products are labelled SARMS in the workbook but have injectable formulations in their website names.

## Website-only records

The 32 active HD Labs records without a confident workbook match are listed below. These may represent catalogue additions, naming differences, duplicate records, or products that are absent from the latest workbook.

`ANABOLICUM (LGD-4033)`, `ANANDROL 50`, `ANAPS50`, `ANAVAR 50`, `ANDARINE (S4)`, `BOLDENONE 200`, `CJC-1295 NO DAC`, `CLENBUTEROL 40MCG`, `DROSTANOLONE 100`, `EQUIJECT 200 (BOLDENONE UNDECYLENATE)`, `FAT BURNER`, `FENZOL (FENBENDAZOLE)`, `FINAJECT`, `HD BPC-157`, `HD D3 (Vitamin D3)`, `HD GHRP-6`, `HD HCG`, `HD HGH`, `HD IGF-1 LR3`, `HD TB-500`, `HELIOSJECT (40MCG CLENBUTEROL HCL)`, `HGH FRAGMENT 177-191`, `MASTERON 100`, `METHYLTEST 10`, `NPP 100`, `OXANDROLONE 10`, `PEPTIDE BLEND`, `RAD-140`, `SUPERDROL 10`, `TESTAJECT 250 (TEST ENANTHATE)`, `TREN AJECT 100 (TREN ACETATE)`, `WILDMASS 300`.

## Recommended next review order

The safest next step is to confirm the eight low-confidence name matches first, particularly the repeated CLENBUTEROL rows and the `ANAVAR50`/`ANAVAR 50` naming pair. After that, confirm whether the workbook’s category headings are authoritative for the 16 discrepancies. Only once those two decisions are confirmed should catalogue records be updated. The comparison found no price or stock corrections to apply.

## Method note

Names were normalized by removing brand markers, packaging terms, punctuation, and file extensions. Embedded strengths such as `250mg`, `40mcg`, `10mg`, and volume values such as `1ml` were extracted separately. Matching used normalized name similarity plus dosage overlap and conservative thresholds; the report intentionally avoids automatic changes for ambiguous records.
