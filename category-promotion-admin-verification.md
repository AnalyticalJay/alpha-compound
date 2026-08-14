# Category Promotion Administration Verification

The public home-page selection logic and its automatic fallback behavior were covered by unit and UI contract tests. The browser preview could not render `/admin/categories` because the current preview session did not have an administrator authentication cookie and returned **Admin access required**. No promotion value was changed through the browser.

The protected server mutation, category ownership check, active-product check, primary-image requirement, administrator UI selector, and public manual-override selection are all covered by the category-promotion regression suite.
