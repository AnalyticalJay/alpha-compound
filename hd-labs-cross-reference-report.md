# HD LABS Workbook vs Website Catalogue Cross-Reference

## Scope

This comparison uses the uploaded workbook `WebsiteHDBPPricelist2026.xlsx` and scans only the worksheet identified as **HD**. The BP PHARMA worksheet was not processed. The comparison uses the active website records whose persistent brand is `hd_labs`; no product, category, price, stock, or image records were changed.

## Executive result

The workbook contains **84 included priced HD Labs product rows** after excluding the user-approved workbook rows **33 (CLENBUTEROL)** and **76 (SIBUTRAMAX)**, in addition to category-heading rows. The active website catalogue contains **111 HD Labs products** after activating website product ID **120010 (ANAVAR50)**. **79 workbook rows matched** to website products, while **5 workbook rows remain for manual confirmation** and **32 active website products do not have a confident workbook counterpart** under the current normalization rules. Workbook row 57, **ANAVAR50**, is manually mapped to website product ID 120010.

All 79 confident or approved matches have stock greater than zero, and no dosage mismatch was found where a dosage was explicitly present in both records. Two price differences remain flagged for review in the refreshed active catalogue comparison. There are **16 category discrepancies** between the workbook section and the website category. These are findings for review only; no automatic category changes were made.

| Measure | Result |
|---|---:|
| HD workbook rows included | 84 |
| Excluded workbook rows | 33, 76 |
| Active HD Labs website products | 111 |
| Confident and approved matches | 79 |
| Workbook rows needing manual matching | 5 |
| Website-only products | 32 |
| Category mismatches among matches | 16 |
| Price mismatches among matches | 2 |
| Dosage mismatches among matches | 0 |
| Matched products with zero stock | 0 |

## Workbook rows requiring manual matching

The following included rows remain below the conservative matching threshold. Rows 33 and 76 were intentionally excluded from this list at the user’s direction, and row 57 was manually approved as ANAVAR50 → website product ID 120010. The remaining rows should not be changed automatically.

| Workbook row | Workbook product | Likely website candidate |
|---:|---|---|
| 38 | HELIOSJECT 20ML | HELIOSJECT (40MCG CLENBUTEROL HCL) |
| 52 | TRINAJECT (MIX) | TRINAJECT (50MG/ML TREN ACETATE) |
| 57 | ANAVAR50 | ANAVAR50 (website product ID 120010) |
| 61 | CLENBUTEROL | HELIOSJECT (40MCG CLENBUTEROL HCL) |
| 67 | DNP 100mg 10 TABS | DNP (2.4-Dinitrophenol 100mg per tab) |
| 85 | ZMA (10mg Zinc, 150mg Magnesium, 3.5mg Vitamin B6, 2mg Boron) 90 caps | HD ZMA (10MG Zinc) |

The remaining repeated `CLENBUTEROL` row, `HELIOSJECT 20ML`, and other unresolved entries should be reviewed before any catalogue update. ANAVAR50 is no longer unresolved: it is approved against website product ID 120010. Rows 33 and 76 are excluded from the workbook comparison only and have not been deleted from the live catalogue.

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

The 32 active HD Labs records without a confident workbook match are listed below. This list reflects the active catalogue after ANAVAR50 was activated. These may represent catalogue additions, naming differences, duplicate records, or products that are absent from the latest workbook.

`ANABOLICUM (LGD-4033)`, `ANANDROL 50`, `ANAPS50`, `ANAVAR 50`, `ANDARINE (S4)`, `BOLDENONE 200`, `CJC-1295 NO DAC`, `CLENBUTEROL 40MCG`, `DROSTANOLONE 100`, `EQUIJECT 200 (BOLDENONE UNDECYLENATE)`, `FAT BURNER`, `FENZOL (FENBENDAZOLE)`, `FINAJECT`, `HD BPC-157`, `HD D3 (Vitamin D3)`, `HD GHRP-6`, `HD HCG`, `HD HGH`, `HD IGF-1 LR3`, `HD TB-500`, `HELIOSJECT (40MCG CLENBUTEROL HCL)`, `HGH FRAGMENT 177-191`, `MASTERON 100`, `METHYLTEST 10`, `NPP 100`, `OXANDROLONE 10`, `PEPTIDE BLEND`, `RAD-140`, `SUPERDROL 10`, `TESTAJECT 250 (TEST ENANTHATE)`, `TREN AJECT 100 (TREN ACETATE)`, `WILDMASS 300`.

## Recommended next review order

The safest next step is to confirm the five remaining low-confidence name matches, particularly the repeated CLENBUTEROL row and the HELIOSJECT 20ML entry. ANAVAR50 has already been approved and activated as website product ID 120010. The comparison found two refreshed price differences for review; no automatic price changes were made.

## Method note

Names were normalized by removing brand markers, packaging terms, punctuation, and file extensions. Embedded strengths such as `250mg`, `40mcg`, `10mg`, and volume values such as `1ml` were extracted separately. Matching used normalized name similarity plus dosage overlap and conservative thresholds; the report intentionally avoids automatic changes for ambiguous records.
