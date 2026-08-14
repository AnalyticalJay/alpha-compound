# Playwright End-to-End Coverage

The Playwright suite starts an isolated local server on port **3100** with `E2E_TEST_MODE=true`. It does not create, edit, approve, pay for, ship, or delete any production data. The test-only role header exists solely in that isolated process and is ignored by normal development and production servers.

| Flow | Role | Browser assertion |
|---|---|---|
| Home and category discovery | Public | Image-backed featured content, category links, and recommendation content render. |
| Catalogue gating | Public | Prices remain hidden; HD Labs filter toggles; quote actions remain access-gated. |
| Customer account gate | Anonymous | Account route shows sign-in gate and no protected content. |
| Customer navigation | Isolated approved customer | Account screen loads; administrator page remains denied. |
| Administrator category controls | Isolated administrator | Category management and read-only promotion selector render. |
| Mobile stability | Public | Main Category content renders at 390px without horizontal overflow. |

Run the suite with `pnpm test:e2e`. Use `pnpm test:e2e:ui` for local interactive debugging.
