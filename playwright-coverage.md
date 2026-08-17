# Playwright End-to-End Coverage

The Playwright suite starts an isolated local server on port **3100** with `E2E_TEST_MODE=true`. Read-only tests use the normal catalogue data. Quote-submission and EFT-proof tests use a disposable in-memory database held only inside that isolated server process; it is reset on process start and is discarded when the server stops. The test-only role header and disposable store are ignored by normal development and production servers.

| Flow | Role | Browser assertion |
|---|---|---|
| Home and category discovery | Public | Image-backed featured content, category links, and recommendation content render. |
| Catalogue gating | Public | Prices remain hidden; HD Labs filter toggles; quote actions remain access-gated. |
| Customer account gate | Anonymous | Account route shows sign-in gate and no protected content. |
| Customer navigation | Isolated approved customer | Account screen loads; administrator page remains denied. |
| Administrator category controls | Isolated administrator | Category management and read-only promotion selector render. |
| Mobile stability | Public | Main Category content renders at 390px without horizontal overflow. |
| Quote submission and EFT proof | Isolated customer/admin | Adds a disposable product to cart, submits a quote, approves it, selects EFT, and uploads a disposable proof file. |
| PayFast success callback | Isolated customer/admin | Approves a disposable quote, starts local PayFast handoff, receives a test-only success callback, and shows the paid state. |
| PayFast failure callback | Isolated customer/admin | Receives a local failed callback and verifies clear customer retry/EFT guidance without a confirmed payment. |
| EFT confirmation and invoice authorization | Isolated customer/admin | Administrator confirms disposable EFT; anonymous invoice access is denied while customer and administrator PDF requests succeed. |
| Shipping notification | Isolated customer/admin | Updates courier and tracking status as an administrator, then verifies the customer notification record. |
| Visual baselines | Public/isolated administrator | Screenshots compare stable public home, public catalogue, and administrator category-control views against committed baselines. |

Run the suite with `pnpm test:e2e`. Use `pnpm test:e2e:ui` for local interactive debugging. The GitHub Actions browser workflow runs the regression and browser suites on pushes and pull requests, retaining failed screenshots, traces, and the HTML report for 14 days.
