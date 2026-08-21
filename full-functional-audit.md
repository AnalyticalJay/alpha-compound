# Full Functional and Sales-Flow Audit

**Audit date:** 21 August 2026  
**Scope:** Public storefront, customer access, administrator access, responsive views, quote-to-payment workflow, fulfilment, notifications, invoice authorization, and live order-state consistency.

## Audit outcome

No verified functional defect was found in the audited application paths. Public access remains price-gated, protected customer and administrator routes are role-gated, and the sales workflow completed successfully inside the disposable end-to-end environment without touching live order, payment, shipping, or notification data.

## View and role checks

| Area | Evidence | Result |
|---|---|---|
| Public storefront | Home, catalogue, HD Labs filter, BP Pharma shortcut, image-backed cards | Passed |
| Mobile public layout | 390px category and hero coverage with no horizontal overflow | Passed |
| Anonymous protection | Customer dashboard sign-in gate and administrator route denial | Passed |
| Approved customer | Account access and administrator route denial | Passed |
| Administrator | Category promotion controls and imported BP product administration lookup | Passed |

The manually opened administrator route without a browser session correctly displayed an access-denied page. The associated unauthenticated API console message is expected boundary behaviour and was not treated as a sales-flow failure.

## Sales workflow checks

| Stage | Verified behaviour | Result |
|---|---|---|
| Quote creation | Approved customer adds an item, submits delivery details, and creates a quote | Passed |
| Administrator review | Administrator approves the quote and unlocks payment | Passed |
| Payment options | PayFast checkout and PayFast Instant EFT complete in isolated test mode | Passed |
| Failed payment | Customer receives retry guidance and can select a retry payment method | Passed |
| Payment integrity | Invalid PayFast signatures preserve awaiting-payment state | Passed |
| Invoice | Customer and administrator PDF access succeeds; anonymous request is denied | Passed |
| Fulfilment | Administrator shipping update persists and creates customer notification | Passed |

## Live data consistency checks

The live order-state audit found no payment-ready order with a non-positive total amount and no shipped or completed order without a shipping record. Existing live records were read only and no synthetic sales data was created.

## Automated validation

| Validation layer | Result |
|---|---|
| Vitest and contract suite | 41 files, 150 tests passed |
| TypeScript | Passed with no diagnostics |
| Public, role, and responsive browser suite | 9 scenarios passed |
| Disposable quote-to-payment sales-flow suite | 6 scenarios passed |
| Visual-baseline suite | 7 scenarios passed |

The prior full-browser-run resource issue was isolated to the combined runner under memory pressure; all affected payment scenarios passed when re-run individually. No application defect was reproduced.
