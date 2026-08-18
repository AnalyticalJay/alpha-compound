# Alpha Compound — Project TODO

## Phase 1: Database Schema & Foundation
- [x] Extend users table with phone, city, status (pending/approved/rejected), is_active
- [x] Create user_approvals table
- [x] Create categories table
- [x] Create products table with slug, description, dosage_info, price, stock, is_active, is_featured
- [x] Create product_images table (S3-backed)
- [x] Create cart_items table
- [x] Create orders table with delivery_fee, delivery_type, payment_status, payfast_reference
- [x] Create order_items table
- [x] Create shipping_details table
- [x] Create delivery_rules table
- [x] Run pnpm db:push to migrate schema

## Phase 2: Backend API
- [x] Auth: custom registration with phone, city, 18+ checkbox
- [x] Auth: login with email/password (custom, not OAuth)
- [x] User approval procedures (admin: approve/reject)
- [x] Owner notification on new user registration
- [x] Products: list, get, search, filter by category (public — no prices for unapproved)
- [x] Products: create, update, delete (admin only)
- [x] Categories: list, create, update, delete
- [x] Product images: upload to S3, set primary
- [x] Cart: add, update, remove, get (approved users only)
- [x] Orders: create, get history, get detail
- [x] Delivery logic: PE = free, elsewhere = R150 (server-enforced)
- [x] Admin: list all orders, update order status
- [x] Admin: list all users with approval status
- [x] PayFast: generate payment payload, handle ITN callback

## Phase 3: Frontend — Public Pages
- [x] Global dark/gold theme in index.css
- [x] Navigation bar with logo, links, auth state
- [x] Homepage: hero, exclusive access section, featured products, why us, delivery, how it works, CTA, footer
- [x] Product catalog page: grid, search, category filter, blurred prices for unapproved
- [x] Product detail page: images, description, dosage, add to cart (approved only)
- [x] Register page: full_name, email, phone, city, password, confirm_password, 18+ checkbox
- [x] Login page: email + password
- [x] Approval pending page

## Phase 4: Admin Panel
- [x] Admin layout with sidebar navigation
- [x] User management: list pending/approved/rejected, approve/reject actions
- [x] Product management: list, create, edit, delete, toggle active/featured
- [x] Product image upload: S3-backed multi-image upload with primary selection
- [x] Category management: list, create, edit, delete
- [x] Order management: list all orders, view detail, update status
- [x] Admin dashboard: stats (users, orders, revenue)

## Phase 5: User Account Dashboard
- [x] Account layout with tabs
- [x] Profile page: view/edit name, phone, city
- [x] Approval status display
- [x] Order history list
- [x] Order detail view with items and shipping

## Phase 6: Cart & Checkout + PayFast
- [x] Cart page: items list, quantity update, remove, subtotal
- [x] Checkout page: shipping details form, delivery cost display
- [x] Order summary before payment
- [x] PayFast redirect with correct payload (ZAR, merchant details)
- [x] PayFast ITN webhook handler (update order status)
- [x] Success and cancel/failure pages

## Phase 7: Polish & Seed Data
- [x] Mobile responsive across all pages
- [x] Smooth animations (framer-motion)
- [x] Loading skeletons
- [x] Error boundaries and empty states
- [x] Vitest tests (23 passing)

## PayFast Configuration (Post-Deploy)
- [x] Set PAYFAST_MERCHANT_ID secret through managed project configuration
- [x] Set PAYFAST_MERCHANT_KEY secret through managed project configuration
- [x] Set PAYFAST_PASSPHRASE secret through managed project configuration
- [x] Derive the active production notify URL as `/api/payfast/itn` and document the PayFast merchant-dashboard whitelist requirement

## Phase 8: HD Labs Brand Restyling
- [x] Global CSS theme updated to HD Labs palette (black + electric blue #0EA5E9 + bold red #E11D48)
- [x] Navbar restyled with HD Labs brand identity
- [x] Homepage hero restyled with HD Labs brand identity
- [x] ProductCard restyled with HD Labs brand colors
- [x] Footer restyled with HD Labs brand colors
- [x] Admin panel sidebar restyled with HD Labs brand colors
- [x] Login page restyled with HD Labs brand identity
- [x] Register page restyled with HD Labs brand identity
- [x] Products catalog page restyled with HD Labs brand colors
- [x] Account dashboard restyled with HD Labs brand colors

## Phase 9: Bulk Product Image Management
- [x] Bulk image upload page with normalized product-name matching, S3-backed storage, preview, unmatched-file handling, and Vitest coverage
- [x] Fix bulk image preview lifecycle so object URLs remain valid during matching and upload state updates
- [x] Add Vitest coverage for router-level matching, unmatched files, and S3-backed upload behavior

## Phase 10: Anabolics Africa Rebrand
- [x] Create Anabolics Africa logo asset (HD Labs style: red, blue, black)
- [x] Update all "Alpha Compound" references to "Anabolics Africa" across the application
- [x] Update site metadata, header, footer, and admin branding

## Phase 11: Product Search & Filter Sidebar
- [x] Add brand-aware search and filter sidebar on frontend products page (HD Labs, BP Pharma, categories, search query)
- [x] Ensure mobile-friendly drawer/toggle for sidebar filters
- [x] Verify functionality with automated tests and save a checkpoint
- [x] Save a new checkpoint for the completed product search and filter sidebar after passing tests and browser verification

## Phase 12: Mobile Optimization & Responsive Polish
- [x] Audit and enhance Navbar mobile menu drawer, touch targets, and overflow
- [x] Ensure product grids, checkout, account, and admin dashboards (tables, cards, modals) scale gracefully on mobile screens
- [x] Run full test suite, verify responsiveness, and save a checkpoint
- [x] Audit and fix mobile responsiveness on the frontend Products grid and filter interactions at small breakpoints
- [x] Audit and fix mobile responsiveness on the Checkout page, including form layout, summary card, and payment actions
- [x] Audit modal/dialog/mobile overlay behavior across admin and storefront flows, and add tests or explicit verification for narrow screens
- [x] Re-run TypeScript/tests and save a checkpoint after completing the remaining mobile responsiveness work
- [x] Save a new checkpoint for the completed mobile responsiveness optimization after the latest responsive fixes
- [x] Perform explicit browser/mobile verification of the updated responsive storefront and dashboards, then update todo.md

## Phase 13: Mobile Sticky Bottom Navigation
- [x] Create MobileBottomNav component with Home, Products, Cart (with badge), active route detection, and mobile-only visibility (hidden on admin routes)
- [x] Integrate MobileBottomNav into App layout with bottom body padding to prevent overlapping page content
- [x] Add unit test coverage for mobile navigation routes, cart count, and active state
- [x] Verify functionality with TypeScript, Vitest, and browser preview, then save checkpoint

## Phase 14: Admin-Reviewed Quote Workflow
- [x] Add quote request and review statuses (quote_pending, quote_approved, quote_rejected, awaiting_payment, paid) to database and backend APIs
- [x] Update frontend cart and checkout flows to submit quote requests instead of direct orders
- [x] Build admin quote management interface for reviewing, approving, and rejecting quotes
- [x] Build user quote history and approved payment portal supporting EFT confirmation and PayFast
- [x] Add Vitest coverage for quote submission, approval gating, and payment selection, then verify and checkpoint
- [x] Save a new checkpoint for the completed quote cart, admin review, EFT, and PayFast workflow

## Phase 15: Customer Quote Progress Tracker
- [x] Add visual quote progress tracker component showing submission, review, approval/rejection, payment selection, and paid stages
- [x] Integrate progress tracker into customer quote detail view (`/orders/:orderId`)
- [x] Add unit test coverage for quote progress step completion and rejection states
- [x] Save checkpoint and deliver result
- [x] Correct quote progress semantics so quote_pending marks Submitted complete and Under Review current
- [x] Save a follow-up checkpoint for the corrected quote tracker stage semantics

## Phase 16: Customer-Admin Quote Comments
- [x] Create order_comments table in database schema and run migration
- [x] Add backend API procedures for listing quote comments and posting new messages (with admin/owner authorization)
- [x] Build quote conversation component with threaded message list and message input form
- [x] Integrate quote conversation into customer quote details (`/orders/:orderId`) and admin quote detail view
- [x] Add unit test coverage for comment authorization and message persistence
- [x] Save checkpoint and deliver result
- [x] Deliver quote comments feature summary with checkpoint b62d4a8e

## Phase 17: Synced Preview Quote Submission Investigation & Fix
- [x] Inspect synced createOrder and orderItems insert mapping in server/db.ts
- [x] Ensure order_items insert values avoid Drizzle default/auto-increment type inference errors
- [x] Run test suite and TypeScript check
- [x] Save checkpoint and deliver result
- [x] Deliver quote submission fix with checkpoint ad67cf45

## Phase 18: Admin Dashboard Pending Quote Alert
- [x] Add pending quote count query and prominent dashboard alert banner
- [x] Add badge indicators for pending quote requests in the admin sidebar and dashboard stats
- [x] Add Vitest coverage for admin pending quote count aggregation
- [x] Save checkpoint and deliver result
- [x] Deliver admin pending quote alert summary with checkpoint 00ad1dc1

## Phase 19: Customer Account Approved Quote Notification
- [x] Add approved-for-payment quote counter helper to shared statistics
- [x] Add prominent alert banner and payment-ready badge to customer account dashboard
- [x] Add unit test coverage for customer approved quote counting
- [x] Save checkpoint and deliver result
- [x] Deliver customer payment-ready quote notification summary with checkpoint 50947232

## Phase 20: Homepage Responsive Enhancement & Admin Analytics
- [x] Audit homepage responsive layout, mobile padding, and font scaling
- [x] Upgrade admin dashboard with quote pipeline metrics, revenue breakdown, and order status charts
- [x] Add unit test coverage for admin analytics calculation helpers
- [x] Verify homepage and admin analytics across viewports and save checkpoint
- [x] Deliver the homepage and admin analytics enhancement
- [x] Fix homepage responsive enhancement JSX regression and restore clean TypeScript compilation

## Phase 21: PayFast Credential Configuration
- [x] Configure the supplied PayFast merchant ID, merchant key, and passphrase through managed secrets; derive the notify URL from the active site origin and document the production endpoint
- [x] Validate PayFast configuration without exposing credential values and rerun the full test suite
- [x] Save a checkpoint after PayFast configuration validation
- [x] Deliver the PayFast configuration result and note any remaining deployment-only URL requirement

## Phase 22: HD Labs Source Image Import
- [x] Audit the four supplied HD Labs source files and live source pages against existing product records
- [x] Build deterministic source-image matching with explicit aliases and verified amps corrections
- [x] Upload every verified source image to its matching HD Labs product without duplicate rows
- [x] Preserve ambiguous or unmatched source images in a review report instead of guessing
- [x] Add unit test coverage for source normalization, aliases, and correction mappings
- [x] Run image integrity audit, browser verification, and save a checkpoint
- [x] Deliver the HD Labs image import summary and review list

## Phase 23: Dedicated HD Labs Catalog Filter
- [x] Add a dedicated HD Labs brand filter to the catalog page
- [x] Preserve filter composition with search, category, clear-all, and mobile filter drawer behavior
- [x] Add regression coverage and verify the filter on desktop and mobile
- [x] Save a checkpoint for the dedicated HD Labs catalog filter

## Phase 24: HD Labs Branding and Catalog Sorting
- [x] Add a custom HD Labs-inspired brand mark to the quick-filter button
- [x] Display the custom HD Labs brand mark on HD Labs product cards only
- [x] Add catalog sorting for price and popularity with deterministic ordering
- [x] Preserve search, brand, category, clear-all, and mobile filter behavior
- [x] Add unit and UI contract coverage for branding and sorting
- [x] Verify the branded cards and sorting dropdown on desktop and mobile
- [x] Save a checkpoint for the HD Labs branding and sorting enhancement

## Phase 25: HD Labs Brand Verification Follow-up
- [x] Document the custom HD Labs-inspired mark treatment and its source palette
- [x] Tighten HD Labs brand detection so only true HD Labs catalogue products receive the card badge
- [x] Browser-verify actual price and popularity reordering with appropriate approved-user data or deterministic catalogue evidence
- [x] Save the final checkpoint only after the corrected branding and sorting verification is complete

## Phase 26: PayFast Runtime Wiring Follow-up
- [x] Wire the runtime payment form to managed PayFast secrets instead of VITE fallback demo values
- [x] Add an integration-style test that exercises the runtime PayFast configuration path without exposing secrets
- [x] Validate the PayFast payment-flow contract and document the production notify URL dependency
- [x] Save a checkpoint after the PayFast runtime wiring and validation are complete

## Phase 27: PayFast Evidence and Delivery Follow-up
- [x] Add a route-level Vitest that posts a signed PayFast ITN payload through `/api/payfast/itn`
- [x] Write a PayFast validation note documenting the dynamic notify URL and production-domain whitelist requirement
- [x] Save a post-wiring checkpoint after route-level validation passes
- [x] Deliver the final PayFast configuration outcome and remaining deployment-only requirement

## Phase 28: PayFast Whitelist and Genuine Popularity Data
- [x] Confirm that PayFast merchant settings require the client account and document the correct login path
- [x] Prepare and report the production ITN, return, and cancel URLs for the client to whitelist
- [x] Determine that genuine order exports are required for popularity data and synthetic order seeding is not permitted
- [x] Report the PayFast whitelist limitation and required genuine-order data next step

## Phase 29: PayFast Payment UX
- [x] Add a secure-payment badge beside the PayFast payment action
- [x] Add a polished PayFast redirect loading state with duplicate-submit protection
- [x] Add regression coverage for secure badge and redirect states
- [x] Verify the available quote-detail payment state responsively, validate the pre-redirect UI contract, and save a checkpoint

## Phase 30: PayFast Payment UX Verification Follow-up
- [x] Verify the available authenticated quote-detail state in-browser and cover the quote-approved secure badge/loading state with the dedicated UI contract test
- [x] Save a post-UX checkpoint after browser and contract verification

## Phase 31: Payment Status History Panels
- [x] Audit existing order payment fields and customer/admin payment views
- [x] Add authorization-safe payment history data using real transaction state only
- [x] Add customer payment-status history panel to quote details
- [x] Add administrator payment-status history panel to transaction/order management
- [x] Add unit, authorization, responsive, and UI contract coverage
- [x] Verify customer and admin panels in the browser and save a checkpoint

## Phase 32: Legacy Payment Timeline Completeness
- [x] Include the real quote-approved milestone in derived payment history for legacy orders that progressed into payment
- [x] Add regression coverage and re-verify the customer/admin timelines

## Phase 33: Payment History Coverage Follow-up
- [x] Add authorization regression tests proving owners/admins can access payment history while unrelated customers cannot
- [x] Extend automated responsive/UI contract coverage for the customer panel and administrator Payments ledger at narrow widths
- [x] Save a new checkpoint after the payment-history coverage additions and browser verification

## Phase 34: EFT Proof, Invoice, Fulfilment, Notifications, and Reporting
- [x] Audit existing payment, order, storage, notification, and reporting foundations
- [x] Add secure customer EFT proof upload with S3-backed storage and administrator review
- [x] Add branded invoice generation with authorized customer/admin access
- [x] Add administrator shipping/tracking controls and customer-visible delivery status
- [x] Add customer and administrator notification centre using real workflow events
- [x] Add operational reporting dashboards and exportable reports
- [x] Add authorization, storage, invoice, shipping, notification, reporting, responsive, and UI regression coverage
- [x] Verify the staged workflows in the browser and save checkpoints

## Phase 35: Shipping Delivery Timeline
- [x] Audit existing shipping status data and customer/admin tracking panels
- [x] Create shared visual delivery timeline mapping for real shipping statuses
- [x] Integrate the timeline into customer and administrator shipping sections
- [x] Add regression coverage and responsive browser verification
- [x] Save a checkpoint for the shipping delivery timeline

## Phase 36: Home Catalog Products and Categories
- [x] Audit home-page product data, assigned images, and live category records
- [x] Display only real products with assigned product images in the home featured section
- [x] Add a responsive main-category section linked to catalogue filtering
- [x] Add regression coverage and verify the home page on desktop and mobile
- [x] Save a checkpoint for the home catalog and category enhancement

## Phase 37: Category Visual Banners and Icons
- [x] Audit current category cards and available visual assets
- [x] Create category-specific banner visuals and enhanced icon treatments
- [x] Integrate responsive, accessible banners into live category links
- [x] Add regression coverage and visual browser verification
- [x] Save a checkpoint for the category visual enhancement

## Phase 38: Category Promotions and Product Recommendations
- [x] Audit per-category image-backed product coverage
- [x] Add category-specific promotional copy to the main category cards
- [x] Add real image-backed featured product recommendations for categories with verified products
- [x] Add regression coverage and responsive browser verification
- [x] Save a checkpoint for the category promotion enhancement

## Phase 39: Admin Category Promotion Controls
- [x] Audit category storage, image-backed product data, and category administration screens
- [x] Persist an optional promoted product per category with server-side category/image validation
- [x] Add protected admin controls to set or clear category promotions
- [x] Render the manually selected promotion on the home page with safe fallback behavior
- [x] Add authorization, validation, UI, and responsive regression coverage
- [x] Verify admin selection and public rendering, then save a checkpoint

## Phase 40: Full Customer and Administrator Validation
- [x] Define and document public, customer, and administrator workflow coverage
- [x] Run the full automated regression suite, TypeScript checks, and database schema verification
- [x] Verify public, customer, and administrator route protections and workflow contracts
- [x] Exercise available browser flows and diagnose any defects
- [x] Confirm no verified defects required fixes and rerun all affected checks
- [x] Save a verification checkpoint and deliver the complete role-based test result

## Phase 41: Playwright Browser End-to-End Coverage
- [x] Audit existing test scripts, routes, authentication behavior, and safe no-write browser-test boundaries
- [x] Configure Playwright with isolated local-server execution and reliable test scripts
- [x] Add public catalogue, customer-gating, and administrator-protection end-to-end flows
- [x] Add UI stability assertions for responsive home/category and access-denied states
- [x] Run Playwright and the existing regression suite, documenting any defects found
- [x] Save a checkpoint for the browser end-to-end testing setup

## Phase 42: Disposable Database Write-Flow Tests
- [x] Audit database connectivity and order write paths for isolated test execution
- [x] Build disposable in-memory test-database setup, seed, and cleanup tooling
- [x] Add Playwright quote-submission flow using disposable test records
- [x] Add Playwright EFT proof upload flow using disposable test records
- [x] Verify cleanup and run E2E, regression, and TypeScript suites
- [x] Save a checkpoint for the isolated write-flow test setup

## Phase 43: Expanded Disposable E2E and CI Coverage
- [x] Audit the test-only PayFast callback path, admin shipping/notification controls, and CI setup
- [x] Extend disposable E2E state for successful PayFast, shipping, and notification write flows
- [x] Add Playwright coverage for PayFast success callback, admin shipping update, and notification write flows
- [x] Add CI workflow with failed Playwright screenshot, trace, and HTML report artifact retention
- [x] Run all browser and regression suites and document the expanded coverage
- [x] Save a checkpoint for expanded E2E and CI testing

## Phase 44: Payment Failure, Invoice Authorization, and Visual Baselines
- [x] Audit disposable payment states, invoice authorization route, and existing visual test configuration
- [x] Extend disposable E2E state for failed PayFast and admin-confirmed EFT payment flows
- [x] Add Playwright failed-PayFast messaging, EFT confirmation, and invoice authorization coverage
- [x] Add stable visual screenshot baselines for key public and administrator pages
- [x] Run all browser, visual, regression, and TypeScript validation suites
- [x] Save a checkpoint for expanded payment and visual testing

## Phase 45: Quote/Payments Visual Baselines and PayFast Rejection
- [x] Audit customer quote-detail, administrator payments, and test-only PayFast callback behavior
- [x] Add disposable invalid-signature callback handling that leaves payment state unchanged
- [x] Add Playwright signature-rejection coverage with payment-state non-mutation assertion
- [x] Add visual baselines for customer quote detail and administrator payments dashboard
- [x] Run all browser, visual, regression, and TypeScript validation suites
- [x] Save a checkpoint for the expanded visual and PayFast security coverage

## Phase 46: Mobile Checkout and Quote Visual Baselines
- [x] Audit the mobile visual test configuration and isolated checkout/quote routes
- [x] Add deterministic 390px checkout and customer quote-detail screenshot scenarios
- [x] Generate mobile baselines and validate responsive layout stability
- [x] Run browser, regression, and TypeScript validation suites
- [x] Save a checkpoint for the mobile visual baseline coverage

## Phase 47: BP Pharma Excel Product Import
- [x] Audit the supplied BP Pharma workbook structure and existing category/product records
- [x] Normalize BP Pharma names and trailing strength values into product display names and dosage fields
- [x] Create or reuse appropriate BP Pharma categories and import valid products with no price set
- [x] Display unconfigured zero-price products as price pending rather than free
- [x] Preserve duplicates or ambiguous rows in a review report instead of guessing
- [x] Add import normalization regression coverage and validate the imported catalogue records
- [x] Verify BP Pharma products in the administrator catalogue and save a checkpoint

## Phase 48: BP Pharma Product Image Import
- [x] Map supplied Body Pharm image filenames to verified BP Pharma product records
- [x] Upload and assign verified images as primary images without changing product prices or stock
- [x] Preserve unmatched or ambiguous image mappings in a review report instead of guessing
- [x] Add image-assignment regression coverage and validate product-image records
- [x] Verify image-backed BP Pharma catalogue display and save a checkpoint

## Phase 49: Body Pharm Supplier Image Extraction
- [x] Inspect the supplied Body Pharm catalogue and its product-image source structure
- [x] Build verified mappings from supplier products to existing BP Pharma catalogue products
- [x] Download, securely upload, and assign verified supplier images without changing prices or stock
- [x] Make the supplier importer resilient to transient source-image timeouts and resumable after partial uploads
- [x] Preserve ambiguous, unavailable, or mismatched supplier products in a review report
- [x] Add mapping regression coverage and validate all imported image assignments
- [x] Verify storefront display and save a checkpoint for the supplier image import

## Phase 50: Resolve Previously Unmatched Body Pharm Supplier Products
- [x] Review CB 250 and Methyltest 10 supplier listings against BP Pharma catalogue candidates
- [x] Confirm exact catalogue mappings using only unambiguous name and strength evidence
- [x] Import the two verified supplier images without changing prices or stock
- [x] Add regression coverage, validate image assignments, and save a checkpoint

## Phase 51: Customer Payment Actions and PayFast Instant EFT
- [x] Inspect approved customer order and dashboard payment-action visibility
- [x] Make the direct PayFast payment action prominent on payment-ready customer orders
- [x] Route the customer EFT choice to the PayFast Instant EFT payment path while preserving verified EFT proof handling where needed
- [x] Add regression coverage, validate payment routing, and save a checkpoint

## Phase 52: Customer Payment Visibility and Recovery UX
- [x] Add a clear pending-payment badge to customer dashboard order cards
- [x] Improve failed-payment error messaging and add a prominent retry-payment action
- [x] Refine the PayFast button loading and secure-handoff feedback state
- [x] Add regression coverage, validate responsive states, and save a checkpoint

## Phase 53: Retry Payment Method Confirmation
- [x] Inspect current retry payment action and reusable dialog components
- [x] Add an accessible confirmation modal with PayFast checkout and Instant EFT choices
- [x] Require a confirmed method before starting a retry redirect
- [x] Add regression coverage, validate desktop and mobile behavior, and save a checkpoint

## Phase 54: BP Pharma Storefront Image Visibility
- [x] Audit BP Pharma supplier image records, URLs, and product API responses
- [x] Identify and correct the storefront image rendering or delivery failure
- [x] Add regression coverage for BP Pharma primary-image visibility
- [x] Validate live catalogue and product-detail image rendering, then save a checkpoint

## Phase 55: Remaining BP Pharma Image Sourcing and Import
- [x] Inventory every BP Pharma product currently lacking a primary image
- [x] Identify authoritative supplier or manufacturer image sources and build verified product mappings
- [x] Import confirmed image assignments without changing product prices, stock, or existing primary images
- [x] Preserve unavailable or ambiguous products in an image-source review report
- [x] Add matching coverage, validate storefront records, and save a checkpoint

## Phase 56: Product Description Research and Rewriting
- [x] Inventory all HD Labs and BP Pharma products needing original descriptions
- [x] Research factual product information from authoritative sources
- [x] Rewrite each sourced description into original short product copy (not copied verbatim)
- [x] Update the database with the rewritten descriptions
- [x] Validate storefront display and save a checkpoint

## Phase 57: Remove Stray Quotation Marks from Product Names
- [x] Strip leading/trailing " from all product names in the database
- [x] Verify storefront renders clean product titles
- [x] Save a checkpoint

## Phase 58: Complete Catalogue Image Coverage
- [x] Audit every active product for a valid primary image
- [x] Research high-quality exact images for all missing products
- [x] Import verified images without replacing existing primary images
- [x] Preserve unavailable or ambiguous products in a review report
- [x] Validate image coverage and storefront rendering, then save a checkpoint

## Phase 59: Remove Promotional Header Catalogue Records
- [x] Identify and confirm all promotional header records that are not sellable products
- [x] Remove the confirmed header records and any dependent empty data safely
- [x] Verify database integrity and cleaned frontend catalogue display
- [x] Save a checkpoint

## Phase 60: Second-Pass Image Sourcing for Remaining Catalogue Gaps
- [x] Re-inventory and classify all products that still lack a primary image
- [x] Research manufacturer and reputable supplier image sources for exact product matches
- [x] Import only verified high-quality images without replacing existing primary images
- [x] Preserve all unavailable or variant-ambiguous products in an updated source audit
- [x] Validate assignments and storefront rendering, then save a checkpoint

## Phase 60: Second-Pass Image Sourcing for Remaining Catalogue Gaps (Duplicate Planning Entry)
- [x] Re-inventory and classify all products that still lack a primary image
- [x] Research manufacturer and reputable supplier image sources for exact product matches
- [x] Import only verified high-quality images without replacing existing primary images
- [x] Preserve all unavailable or variant-ambiguous products in an updated source audit
- [x] Validate assignments and storefront rendering, then save a checkpoint
