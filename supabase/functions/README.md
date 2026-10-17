# Supabase Edge Functions

`submit-order` and `invite-admin-user` are deployed and active in production
project `hkanvnbdmgzvfcwuqdjj`, with JWT verification enabled. Both allow the
configured site origin `https://bidaya-home.pages.dev`; preflight requests were
verified. No production order or invitation was created as a test.

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. Never expose the service-role
key in frontend code or a `VITE_*` variable.

`submit-order` requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the
exact deployed storefront origin in `CHECKOUT_ALLOWED_ORIGIN`.
`invite-admin-user` uses the exact deployed site origin in
`ADMIN_ALLOWED_ORIGIN`. It verifies the request's Auth JWT and checks that the
matching `admin_users` row is `super_admin` before inviting an account,
assigning its role, and writing an audit entry. Auth email delivery is not yet
verified; test SMTP/email configuration before inviting real staff.

The canonical delivery dataset is `src/data/egyptianGovernorates.ts`.
`npm run generate:delivery-seed` creates SQL preserving existing Arabic names,
English labels, fee/null-fee values, and the 317 listed areas. Existing delivery
fees and labels are not overwritten; only a missing English label is filled.
The canonical source has no explicit active/inactive flag, so the schema
default remains in effect until the owner defines an explicit status policy.

The checkout validates payload limits, ignores browser monetary fields, reads
trusted products/settings/zones, and uses the migration's unique idempotency
key. A retry must reuse the same `x-idempotency-key`; the browser keeps it
through a failed/lost-response retry and clears it only after confirmation.
Opening a WhatsApp fallback draft does not persist an order.

The production database migration and non-destructive delivery/catalog seeds
are applied. Checkout CORS is ready, but an end-to-end checkout was not tested
against production because doing so would create a real order. The frontend
source changes still need to be deployed through the website's build pipeline.

## Staging activation

Deploy and test both functions only after their database schema and required
data exist in the same staging project:

1. Link a dedicated staging project and apply the reviewed schema migrations:
   `supabase link --project-ref <staging-project-ref>`, then
   `supabase db push`.
2. Generate and apply the delivery-zone seed SQL with
   `npm run generate:delivery-seed`. Generate the catalog seed with
   `npm run generate:store-seed`; inspect and apply
   `database/seed_store_catalog.sql`. Existing products are not automatically
   imported. The live catalog/settings are preserved.
3. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `CHECKOUT_ALLOWED_ORIGIN`, and
   `ADMIN_ALLOWED_ORIGIN` as Edge Function secrets. Each origin must exactly
   match the deployed site origin, including scheme and non-default port.
   Configure and test Auth SMTP/email delivery before sending invitations.
4. Deploy both functions:

   ```powershell
   supabase functions deploy submit-order --project-ref <staging-project-ref>
   supabase functions deploy invite-admin-user --project-ref <staging-project-ref>
   ```

   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the frontend build,
   then redeploy the frontend.
5. Verify an anonymous checkout persists one server-priced order and replays
   idempotently; non-admins cannot invite users; super-admin invitations create
   both the Auth invitation and audit log; both configured origins work; and
   WhatsApp opens for a successfully persisted order.

The `submit-order` CORS preflight allows Supabase's `apikey`, `authorization`,
and `x-client-info` headers as well as the checkout idempotency header. A
missing deployment or origin secret prevents browser checkout even when the
frontend Supabase URL and publishable key are configured.

The invitation function returns a conflict for an existing administrator
email. It does not create or promote users through public sign-up. The
production owner account is already provisioned; for a new project, provision
the initial owner separately using `../README.md`.

Run unit tests locally with `npm test`. RLS, concurrent insert, and real Edge
Function integration tests need an initialized local Supabase stack; they have
not run in this workspace.
