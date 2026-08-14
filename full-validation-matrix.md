# Full Role-Based Validation Matrix

## Public visitor

| Area | Expected behaviour | Evidence |
|---|---|---|
| Home and catalogue | Home, category links, product search, filters, and image-backed cards remain accessible. | Browser and home/catalog regression tests |
| Access gating | Product prices and quote/payment actions remain restricted to approved accounts. | Quote workflow, filter, and payment tests |
| Protected routes | Account, order, and administrator routes do not disclose protected data to anonymous sessions. | Route/authorization tests and browser access check |

## Approved customer

| Area | Expected behaviour | Evidence |
|---|---|---|
| Quote lifecycle | Customers can submit quotes, view progress, comment, and access only their own orders. | Quote workflow and payment-history authorization tests |
| Payments | EFT proof upload, PayFast form preparation, invoices, payment history, and notifications remain owner-scoped. | EFT, PayFast, invoice, and payment-history tests |
| Delivery | Customers can view only their own shipping details and delivery timeline. | Fulfilment, shipping timeline, and responsive tests |

## Administrator

| Area | Expected behaviour | Evidence |
|---|---|---|
| Administration | Category, product, user, quote, payment, fulfilment, notification, and report operations require administrator access. | Router/authorization contract tests |
| Category promotions | Admins can select only active, same-category products with a primary image for home-page promotion. | Category-promotion tests |
| Operations | Admin review, EFT confirmation, tracking updates, reports, and invoice access remain protected. | Fulfilment, report, invoice, and payment tests |
