-- Fallback storage for payment screenshots when the payment-proofs Storage
-- bucket is unusable (SUPABASE_SECRET_KEY unset in the deploy): the image
-- bytes live in the request row itself and screenshot_path carries a `db:`
-- prefix. Served to the admin by /api/admin/subscriptions/screenshot/[id].
alter table public.subscription_requests
  add column if not exists screenshot_data bytea;
