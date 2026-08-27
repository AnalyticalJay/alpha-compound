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

## Phase 61: Retail Price Import and Image Coverage Review
- [x] Inspect the uploaded multi-sheet price list and identify the Retail Price column in each sheet
- [x] Extract the Retail Price column from the shared Google Sheet HD Labs, BP, and Pharma tabs
- [x] Normalize product names and produce a verified source-row to catalogue-product match set
- [x] Update only matched products with Retail Price values, without altering stock or other catalogue data
- [x] Report unmatched or missing prices and confirm overall product image coverage
- [x] Validate storefront price rendering, run regression checks, and save a checkpoint

## Phase 62: Authoritative Three-Tab Catalogue Reconciliation
- [x] Treat the HD Labs, BP, and Pharma Google Sheet tabs as the complete authoritative product catalogue
- [x] Set the confirmed HD Clenbuterol Retail price to R350.00 and reconcile every source-row price
- [x] Add products present in the authoritative tabs but absent from the website catalogue
- [x] Remove products absent from all authoritative tabs only after dependency checks
- [x] Validate full Retail-price and image coverage for the reconciled catalogue, then save a checkpoint

## Phase 63: Source Images for Remaining Authoritative Catalogue Products
- [x] Export and classify all active products that still lack a primary image
- [x] Research credible manufacturer or supplier sources for high-quality exact image matches
- [x] Import only verified product-specific images without replacing existing primary images
- [x] Preserve unavailable, inaccessible, or variant-ambiguous products in a source audit
- [x] Validate product-image coverage and storefront rendering, then save a checkpoint

## Phase 64: Branded Placeholders and Default Catalogue Stock
- [x] Inventory the active products without verified imagery and newly created catalogue entries
- [x] Create an explicit Anabolics Africa "Product image pending" placeholder visual
- [x] Assign the placeholder as a primary image only to unresolved products and set new entries to stock quantity 50
- [x] Verify visible in-stock status and stock badge behaviour on product pages
- [x] Add regression coverage, validate catalogue records, and save a checkpoint

## Phase 65: Dual-Brand Hero Panel and Main Category Coverage
- [x] Inspect the existing homepage hero brand panel and responsive category grid
- [x] Add BP Pharma alongside HD Labs in the hero brand presentation
- [x] Present Injectables, Orals, Peptides, and SARMS clearly in the hero category row
- [x] Add regression coverage and validate desktop/mobile hero presentation
- [x] Save a checkpoint

## Phase 66: Full Website, Dashboard, and Sales-Flow Audit
- [x] Review feature contracts, regression coverage, and role-specific routes
- [x] Audit public storefront, customer account, and administrator dashboards across key viewports
- [x] Exercise the isolated quote submission, approval, payment, fulfilment, and notification sales flow
- [x] Diagnose and correct any verified functional or usability defects
- [x] Validate all fixes, document audit findings, and save a checkpoint

## Phase 67: Courier Tracking Status and Integration Requirements
- [x] Inspect the current waybill, shipping-status, notification, and customer timeline capabilities
- [x] Define the courier API, authentication, webhook, and status-mapping inputs required for live tracking
- [x] Report the current delivery workflow and next integration steps

## Phase 68: Customer Delivery Timeline Verification
- [x] Inspect the isolated shipping fixture and customer tracking assertions
- [x] Run an isolated admin shipping update with a waybill and tracking URL
- [x] Verify the customer order dashboard shows the tracking details and timeline progress

## Phase 69: Waybill Copy and Out for Delivery Tracking
- [x] Inspect current shipping status contracts and customer waybill UI
- [x] Add a one-click customer waybill copy control with accessible feedback
- [x] Add Out for delivery to shipping persistence, admin controls, and customer/admin timelines
- [x] Add regression coverage and verify the expanded delivery tracking flow
- [x] Save a checkpoint

## Phase 70: Customer Delivery Estimates and Timeline Progress
- [x] Inspect shipping timestamps and current customer delivery data
- [x] Define transparent status-based delivery estimate rules and timeline progress values
- [x] Add the delivery estimate and accessible visual progress bar to customer tracking
- [x] Add regression coverage and validate responsive delivery tracking
- [x] Save a checkpoint

## Phase 71: Anabolics Africa Vertical Launch Reel
- [x] Define a premium 20-second vertical storyboard featuring members-only access, mobile catalogue, customer dashboard, and secure payment
- [x] Generate and assemble a 9:16 social-media reel with a clear adult-athlete and in-app experience narrative
- [x] Verify the 20-second runtime, vertical aspect ratio, and brand legibility
- [x] Deliver the completed reel

## Phase 72: Screen-Focused Mobile Platform Launch Reel
- [x] Capture authentic mobile homepage, customer dashboard, order-detail, and payment-flow screens
- [x] Design a 20-second screen-led 9:16 storyboard using actual app screens as the primary visual content
- [x] Generate and assemble the revised vertical reel with genuine platform UI focus
- [x] Verify runtime, vertical format, and screenshot legibility before delivery

## Phase 73: Customer Experience Feature Slide Set
- [x] Select authentic platform screens and map the five-slide customer journey story
- [x] Render five cohesive static slides with paired desktop and mobile mockups
- [x] Verify brand consistency, mockup legibility, and sales-flow accuracy
- [x] Deliver the customer-experience feature slide set

## Phase 74: Client Customer-Flow Presentation
- [x] Prepare authentic enlarged desktop and mobile screen references for the client presentation
- [x] Capture the real product catalogue and quote-building context for the Browse, Build & Submit slide
- [x] Write the client-facing customer experience and sales-flow narrative
- [x] Generate and validate a client-ready presentation with paired mockups
- [x] Deliver the finished presentation

## Phase 75: Correct Presentation Mobile Viewport Mockups
- [x] Inspect the presentation phone-frame image references and their viewport fidelity
- [x] Capture true narrow mobile viewport references for the homepage, quote, order, payment, and delivery states
- [x] Replace full-page images in every presentation phone frame and recompile the deck
- [x] Verify the corrected mobile mockups and deliver the revised presentation

## Phase 76: Premium Homepage Feature-List Refinement
- [x] Remove the HD Labs Exclusive and Pharmaceutical Grade benefit blocks from the homepage
- [x] Rebuild the remaining customer benefits as a premium borderless, icon-led section
- [x] Add regression coverage and validate the revised section on a 390px mobile viewport
- [x] Save a checkpoint and deliver the homepage refinement

## Phase 77: Hero Copy and Delivery-Banner Refinement
- [x] Remove pharmaceutical-grade wording from the homepage hero and brand panel
- [x] Restyle the delivery information as a premium borderless icon-led section
- [x] Add regression coverage and validate the revised homepage on desktop and 390px mobile
- [x] Save a checkpoint and deliver the completed refinement

## Phase 78: Premium Footer Delivery List
- [x] Restyle the footer delivery list with the shared premium icon-led visual language
- [x] Add regression coverage and validate footer legibility on desktop and 390px mobile
- [x] Save a checkpoint and deliver the footer refinement

## Phase 79: Quote-to-Delivery CTA Timeline
- [x] Add a compact quote-to-delivery expectation timeline beside the homepage access CTA
- [x] Ensure the timeline is premium, accessible, and responsive across desktop and 390px mobile
- [x] Add regression coverage and visual verification for the CTA timeline
- [x] Save a checkpoint and deliver the completed enhancement

## Phase 80: Production Security and Workflow Readiness Audit
- [x] Inventory public, customer, administrator, payment, webhook, storage, and deployment security surfaces
- [x] Review authentication, authorization, input validation, payment integrity, data exposure, and production configuration
- [x] Run dependency, static-analysis, unit, end-to-end, and workflow regression checks
- [x] Remediate any verified critical or high-severity findings and rerun affected checks
- [x] Produce a go-live readiness assessment, preserve the audit evidence, and save a checkpoint

## Phase 81: PayFast Production Whitelist and Live Payment Smoke Test
- [x] Confirm the production ITN, return, and cancel URLs and define a low-risk smoke-test procedure capped at R10.00
- [x] Add the verified ITN URL to the PayFast merchant dashboard and confirm Instant EFT is enabled
- [ ] Run one controlled live payment and verify callback, order state, payment record, invoice, and duplicate-callback behaviour (blocked: invalid merchant key and repair deployment)
- [ ] Document the live outcome and update go-live release status

## Phase 82: Authorised R10 PayFast ITN and Database Validation
- [x] Review live ITN route logging and order/payment persistence before initiating the transaction
- [x] Initiate the authorised R10.00 payment only after confirming the production merchant and checkout total
- [ ] Verify the signed ITN callback, payment record, order status, invoice access, and repeat-callback protection (blocked before charge: PayFast invalid merchant key)
- [ ] Record the live outcome and final release status without exposing customer or merchant secrets

## Phase 83: Temporary R10 Live-Test Product and Transaction
- [x] Create an isolated clearly labelled R10.00 test-only product for one authorised live payment
- [x] Submit and approve a quote containing only the test product
- [ ] Complete the authorised payment and verify ITN, payment, invoice, and order lifecycle evidence (blocked before charge: PayFast invalid merchant key)
- [x] Deactivate the test product while retaining the genuine rejected quote and payment-handoff evidence for audit

## Phase 84: PayFast Merchant-Key Failure Recovery
- [x] Verify that PayFast's invalid-merchant-key rejection produced no charge and no paid-order update
- [x] Deactivate the temporary R10 test product while retaining the rejected test quote as audit evidence
- [x] Request secure re-entry of the verified live PayFast merchant key from the merchant-account owner
- [ ] Re-run the authorised R10 live payment test after the corrected key is configured

## Phase 85: Order-Line Persistence Defect Remediation
- [x] Trace the missing line-item persistence found on authorised R10 test order #90001
- [x] Repair order creation so the order header, line items, shipping record, and payment event are atomic
- [x] Add regression coverage for durable order-item persistence, including payment and invoice preconditions
- [x] Validate quote submission and downstream payment/invoice workflows before any PayFast retry

## Phase 86: Published Repair and Corrected R10 PayFast Validation
- [ ] Securely apply and validate the supplied live PayFast merchant key without exposing it
- [ ] Confirm the published production site runs the atomic order-line persistence repair
- [ ] Create, approve, and verify a fresh R10.00 test quote with a persisted product line
- [ ] Complete the authorised live payment and verify signed ITN, payment, invoice, order state, and replay protection
- [ ] Deactivate the fresh test product and document final release readiness

## Phase 87: Transaction Insert-Identifier Compatibility Fix
- [x] Inspect the transaction insert-result shape that blocked fresh R10 quote creation before any order was committed
- [x] Repair transaction-safe order identifier retrieval without reintroducing partial order persistence
- [x] Add coverage for the transaction insert-result contract and retest quote creation
- [ ] Publish the compatibility repair before another live payment attempt

## Phase 88: Published R10 Quote and ITN Lifecycle Verification
- [ ] Submit the prepared R10 quote through the newly published repair and verify its persisted line item
- [ ] Approve the verified quote and confirm the production PayFast form carries the correct merchant and R10 total
- [ ] Complete the authorised PayFast payment and verify signed ITN, payment, invoice, order state, and replay protection
- [ ] Deactivate the test product and preserve the genuine test transaction as audit evidence

## Phase 89: Repeated Invalid Merchant-Key Recovery
- [ ] Verify the second hosted PayFast invalid-key rejection left quote #150001 unpaid and without a successful payment event
- [ ] Deactivate the temporary R10 product while preserving the verified quote and failed handoff evidence
- [ ] Obtain the merchant key that is paired with the active live PayFast merchant ID from the merchant-account owner
- [ ] Retry the authorised R10 payment only after the paired key is securely configured

## Phase 90: Matched PayFast Production Credential Update
- [ ] Securely enter the live Merchant ID and Merchant Key copied from the same PayFast production profile
- [ ] Validate the matched server-side configuration without initiating a charge
- [ ] Retry the authorised R10 payment only after the matched pair and approved domain are confirmed
- [ ] Record the final ITN outcome and release status

## Phase 91: Verified PayFast Developer Settings Profile
- [ ] Confirm the full saved ITN URL is `https://anabolicsafrica.co.za/api/payfast/itn`
- [ ] Securely configure the Merchant ID and Merchant Key shown together in the verified production profile
- [ ] Retest checkout only after the credentials are stored without further disclosure
- [ ] Rotate the Merchant Key and security passphrase exposed in the screenshot after successful validation

## Phase 92: No-Change PayFast Wiring Audit
- [ ] Preserve the unpaid R10 test order and inactive test product while reviewing production wiring
- [ ] Audit non-sensitive Merchant ID, signature, endpoint, and checkout-form fields without changing credentials
- [ ] Identify the likely source of the invalid-merchant-key response or required PayFast account restriction
- [ ] Apply only client-approved changes before another authorised payment attempt

## Phase 93: PayFast Checkout Signature Remediation
- [x] Document the missing outbound checkout signature and incompatible signature ordering found in the live integration
- [x] Add PayFast-required ordered checkout signatures and ordered ITN verification without changing credentials
- [x] Add regression coverage for exact signature fields, encoding, and order of parameters
- [x] Publish the repair and rerun the authorised R10 PayFast and ITN validation through the hosted checkout handoff

## Phase 94: Published PayFast Signature Repair Validation
- [ ] Confirm the published R10 checkout form contains the required signature before payment
- [ ] Complete the authorised R10 payment once the hosted PayFast checkout accepts the handoff
- [ ] Verify signed ITN, payment event, order state, invoice authorization, and repeat-callback protection
- [ ] Deactivate test assets and update the final go-live release status

## Phase 95: Explicitly Authorised R10 PayFast Completion
- [ ] Confirm the hosted checkout identifies the expected merchant and exact R10.00 total
- [ ] Complete the user-authorised R10.00 payment once and retain the transaction reference for audit
- [ ] Verify ITN, payment, invoice, order, and duplicate-callback behavior from the real transaction
- [ ] Preserve the audit record, deactivate test assets, and record final go-live readiness

## Phase 96: Account-Holder Payment Completion
- [ ] Account holder completes the authorised R10.00 hosted PayFast payment using their own payment credentials
- [ ] Verify the live provider result through ITN, order status, payment timeline, and invoice access
- [ ] Preserve the real transaction evidence and deactivate all temporary test assets

## Phase 97: Client-Side PayFast Handoff Repair
- [x] Diagnose the form-submission transition that leaves the customer on “Connecting securely to PayFast”
- [x] Replace the stalled handoff with a reliable hosted-checkout submission and visible recovery path
- [x] Add regression coverage for immediate form submission and stale-loading recovery
- [x] Publish the repair and rerun the authorised R10 handoff through the authenticated checkout bridge

## Phase 98: Published Handoff-Repair Live Validation
- [ ] Confirm the published payment transition opens the hosted PayFast checkout for order #150001
- [ ] Complete the authorised R10.00 provider payment only after confirming the hosted checkout details
- [ ] Verify signed ITN, payment event, invoice access, order state, and replay protection
- [ ] Deactivate remaining test assets and record final go-live readiness

## Phase 99: Server-Side PayFast Checkout Bridge
- [x] Implement an authenticated same-origin checkout bridge that generates and submits the signed PayFast form
- [x] Replace the failing in-page form submission with navigation to the secure bridge
- [x] Add bridge authorization, parameter-escape, signature, and handoff regression coverage
- [x] Publish and verify the authorised R10 checkout reaches the hosted PayFast page

## Phase 100: Published Checkout-Bridge R10 Validation
- [x] Confirm order #150001 reaches the authenticated checkout bridge on the published domain
- [ ] Complete the authorised R10.00 payment from the hosted PayFast checkout
- [ ] Verify signed ITN, transaction event, invoice authorization, and final paid order state
- [ ] Deactivate remaining test assets and update the go-live status

## Phase 101: Browser-Blocked Bridge POST Diagnosis
- [x] Capture the form POST response and browser policy behavior from the published checkout bridge
- [x] Identify the browser-compatible PayFast transition compatible with the real provider response
- [x] Replace the blocked bridge transition with regression coverage and safe hosted-checkout validation
- [x] Publish the verified transition before resuming the authorised R10 payment

## Phase 102: PayFast Hosted Redirect CSP Allowlist
- [x] Record the verified PayFast 302 redirect target from the signed checkout handoff
- [x] Permit only the verified PayFast hosted-payment domain in the production form-action policy
- [x] Add CSP regression coverage and validate the non-charging redirected handoff
- [x] Publish the policy correction before the authorised R10 payment retry

## Phase 103: Published Hosted-Redirect R10 Lifecycle Validation
- [x] Confirm the published R10 checkout follows the PayFast hosted redirect successfully
- [ ] Complete the authorised R10.00 payment only after confirming hosted checkout merchant and total (deferred by account owner)
- [ ] Verify signed ITN, payment event, invoice authorization, and final paid order state (deferred because no charge was completed)
- [x] Deactivate test assets and document final checkout-verified go-live status

## Phase 104: Checkout-Verified, No-Charge Release Closure
- [x] Preserve evidence that the R10 order reached the hosted PayFast checkout with no charge completed
- [x] Deactivate remaining temporary test products while retaining the unpaid test order for audit
- [x] Update go-live status to checkout verified with live ITN/payment confirmation deliberately deferred

## Phase 105: Full Mobile Responsiveness Audit
- [x] Inventory public storefront, account, quote, order, payment, delivery, and administrator routes for mobile review
- [x] Capture representative 390px layouts and identify confirmed overflow, touch-target, navigation, or hierarchy issues
- [x] Refine all confirmed mobile layout and interaction defects across storefront and dashboards
- [x] Add or update responsive regression coverage and verify refined views on 390px mobile
- [x] Save the verified mobile-responsiveness audit and deliver the readiness summary

## Phase 106: All-Route 390px Mobile Audit Coverage
- [x] Map every registered public, customer, and administrator route to an authenticated 390px audit scenario
- [x] Add no-overflow and mobile-shell regression coverage for each route group
- [x] Resolve any confirmed 390px overflow, navigation, touch-target, or hierarchy findings
- [x] Validate all route groups and update the comprehensive mobile audit report

## Phase 107: Persistent Light and Dark Mode
- [x] Inspect the existing theme provider, global tokens, and shared navigation surfaces
- [x] Add an accessible persistent theme toggle across storefront and admin navigation
- [x] Verify theme switching across desktop and 390px mobile layouts
- [x] Add regression coverage, save a checkpoint, and deliver the theme enhancement

## Phase 108: Mobile Theme and System Preference Verification
- [x] Verify dark-mode transition, contrast, and touch control visibility at a 390px mobile viewport
- [x] Confirm whether a system color-scheme preference is used only when no explicit theme preference exists
- [x] Document the verified behavior and any recommended refinement

## Phase 109: Final Performance and Technical SEO Audit
- [x] Inventory indexable public URLs, metadata surfaces, crawl controls, and available performance evidence
- [x] Measure indexability, titles, descriptions, canonical behavior, structured data, robots/sitemap, and page-load performance
- [x] Remediate verified release-critical technical SEO or performance issues
- [x] Validate the production artifact and record a final evidence-led release assessment

## Phase 110: Search Console and GA4 Measurement Setup Guide
- [x] Identify client-owned account prerequisites, site verification choices, and post-launch measurement owners
- [x] Verify current official setup guidance for Search Console, GA4 web streams, sitemap submission, and Core Web Vitals reporting
- [x] Write a tailored client-ready setup checklist with a 30–60 day measurement plan
- [x] Save and deliver the measurement setup guide
- [ ] Client: verify the Search Console Domain property through DNS and submit the live sitemap
- [ ] Client: create the GA4 Web stream, confirm privacy/consent requirements, and securely provide the approved `G-...` Measurement ID if tag implementation is wanted

## Phase 111: Product Image Watermarking
- [x] Map all reusable product-image render paths and define a subtle, accessible Anabolics Africa watermark treatment
- [x] Apply the watermark consistently to customer catalogue, product-detail, and administrator product-image displays without replacing source image files
- [x] Add regression coverage and verify the treatment at desktop and 390px mobile widths
- [x] Save a checkpoint and deliver the watermark enhancement

## Phase 112: Administrator Watermark Controls
- [x] Inspect current configuration, storage, administrator routing, and product-image data-flow patterns
- [x] Persist global watermark enablement, text, and optional custom-logo settings with administrator-only API access
- [x] Add secure custom watermark-logo upload validation and protected storage
- [x] Build responsive administrator controls and connect live settings to every product-image watermark
- [x] Add regression coverage, verify customer/admin views, and save a checkpoint
