# BP Pharma Workbook Import Audit

## Import Result

The supplied `BPPHARMAPRICElIST.xlsx` workbook contained **112** BP Pharma product rows across seven existing catalogue categories. All 112 products were created with active status, zero stock pending inventory entry, and a `0.00` database price placeholder. The customer catalogue now renders such unconfigured prices as **Price pending**, rather than as a free product.

| Category | Imported products | Price state |
|---|---:|---|
| Orals | 14 | Pending |
| SARMS | 12 | Pending |
| Injectables | 25 | Pending |
| Fat Loss | 10 | Pending |
| Post Cycle | 9 | Pending |
| Ancillaries | 9 | Pending |
| Peptides | 33 | Pending |
| **Total** | **112** | **Pending** |

## Normalization

The importer uses the product brand prefix `BP`, converts explicit and compact strength values into the requested display form, and stores each strength independently. For example, `BP ANAPOLAN 25` is imported as **BP Anapolin 25mg** with `25mg` stored as dosage information. Existing category records were reused so that duplicate categories were not created.

## Source Rows Requiring Follow-up

The following source rows did not provide a numerical strength, so the importer created the product without inventing a dosage. Their exact source values are retained in the product descriptions for later review.

| Workbook row | Imported product | Category |
|---:|---|---|
| 60 | BP Cy Combo | Fat Loss |
| 61 | BP Cy Combo Inj | Fat Loss |
| 62 | BP Cyt3 | Fat Loss |
