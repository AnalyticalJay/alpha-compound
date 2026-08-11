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
- [ ] Set PAYFAST_MERCHANT_ID secret
- [ ] Set PAYFAST_MERCHANT_KEY secret
- [ ] Set PAYFAST_PASSPHRASE secret
- [ ] Update PAYFAST_NOTIFY_URL to production domain

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
