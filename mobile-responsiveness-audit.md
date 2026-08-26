# Anabolics Africa — Mobile Responsiveness Audit

**Audit viewport:** 390 × 844 pixels  
**Status:** In progress

## Coverage Captured

The initial true-mobile capture set covers the public home and catalogue, quote cart and checkout states, customer account, order detail, notifications, approval state, and the core administrator dashboard, users, products, product editor, categories, orders, payments, and reports routes.

The development preview capture session did not retain an authenticated session for the customer/admin-only route captures. Public and route-shell layouts were nevertheless captured at the requested viewport. Authenticated-state views will be reviewed through the existing isolated browser suite and source-level layout inspection before any changes are accepted.

## Initial Audit Criteria

The next pass will verify no horizontal overflow, readable type and data density, 44px-class touch targets, safe-area treatment with the mobile bottom navigation, mobile table/card transformations, dashboard navigation accessibility, and recovery behavior for loading and empty states.

## Confirmed Refinements

The administrator product and quote-management pages previously depended on wide horizontal tables at mobile widths. They now preserve the desktop data tables from the medium breakpoint upward while rendering touch-friendly mobile cards at 390px. The product cards retain image, category, price, stock, status, and edit/delete actions; quote cards retain customer, status, payment state, total, date, and a dedicated management action.

Focused 390px Playwright visual baselines now cover both revised administrator lists. The shared administrator drawer remains bounded to 82vw/15rem, mobile bottom navigation retains safe-area spacing, and customer payment, delivery, notification, quote, and public catalogue responsive contracts remain covered by the existing regression suite.
