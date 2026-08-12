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
