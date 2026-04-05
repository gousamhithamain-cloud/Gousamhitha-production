# Security Refactor Execution Plan

## Phase 1: Delete Insecure Files
1. Delete `js/supabase-client.js` - Contains hardcoded credentials
2. Delete `js/nhost-data-manager.js` - Direct GraphQL DB access
3. Delete `api/config.js` - Exposes credentials to window
4. Delete `supabase-auth.js` (root) - Uses direct Supabase auth
5. Delete `js/supabase-auth.js` - Uses direct Supabase auth
6. Delete `config.js` (root) - Contains credentials

## Phase 2: Create Secure Auth Handler
1. Create `js/auth-handler.js` - Frontend auth via backend API
2. Update backend auth endpoints to handle all auth operations

## Phase 3: Remove Supabase CDN from HTML Files
Files to update (24 total):
- about.html
- admin-add-product.html
- admin-dashboard.html
- admin-debug.html
- admin-deliveries.html
- admin-delivery-settings.html
- admin-orders.html
- admin-payouts.html
- admin-products.html
- admin-vendors.html
- cart.html
- checkout.html
- contact.html
- donations.html
- gowshala.html
- how-to-use.html
- index.html
- orders.html
- privacy-policy.html
- product.html
- profile.html
- shop.html
- terms.html

## Phase 4: Update HTML Script References
Replace:
- `<script src="supabase-auth.js">` → `<script src="js/auth-handler.js">`
- Remove `<script src="js/supabase-client.js">`
- Remove `<script src="./config.js">`
- Remove inline SUPABASE_CONFIG blocks

## Phase 5: Verification
- Grep for remaining Supabase references
- Test authentication flow
- Test data operations
- Confirm no credentials in frontend

## Status: READY TO EXECUTE
