# Retail Price Source Audit

## Authoritative workbook

The shared Google Sheet `HD BP Price list 202608 Jamie` is the authoritative source for this import. The uploaded CSV was only the HD tab export and could not retain the BP and Pharma tabs.

## Confirmed tabs

| Tab | Google Sheet ID | Header row | Price column used |
| --- | ---: | --- | --- |
| HD | `1862525229` | `PRODUCT`, `W/SALE`, `RETAIL` | `RETAIL` |
| BP | `126347248` | `PRODUCT`, `W/SALE`, `RETAIL` | `RETAIL` |
| Pharma | `1061580424` | `PRODUCT`, `W/SALE`, `RETAIL` | `RETAIL` |

The price import will ignore the wholesale column and category-header rows on all three tabs.

## Verified import outcome

The import parsed **231** product rows with a positive `RETAIL` value. It updated **207** matched catalogue products and left **2** already-correct prices unchanged. No wholesale value was used.

One product was deliberately withheld from update: the HD sheet lists **CLENBUTEROL** twice with conflicting Retail prices of **R350.00** and **R250.00**. The importer blocks conflicting values instead of choosing one arbitrarily.

After the verified import, **210 of 245 active products** have a non-zero price. The remaining 35 active products either have no corresponding Retail row, have a different brand or strength/formulation from the source row, or require an explicit alias confirmation. The report `retail-price-import-report.json` preserves each source row and exception.

## Image coverage at pricing import

The active catalogue currently has **164 of 245 products with a primary image** and **81 products without one**. This count is independent of the pricing import and was not altered.

## Authoritative three-tab reconciliation

The client confirmed that the HD Labs, BP, and Pharma tabs are the full catalogue authority and confirmed the HD **CLENBUTEROL** Retail price as **R350.00**. The reconciliation imported or retained all **230** priced source rows, added **18** source-list products that had no previous catalogue record, and removed or deactivated **33** records absent from the source lists after checking dependencies.

The completed catalogue has **230 active products**, and all **230** now carry a positive Retail price. The reconciliation is idempotent: a subsequent dry run proposes **0** price changes, **0** additions, **0** removals, and **0** conflicts.

The list-only cleanup removed some image-backed records that were not in the authorised price sheets. The reconciled catalogue currently has **158 products with primary images** and **72 products still awaiting a verified image**. Pricing did not alter stock quantities.
