-- Private Storage bucket for manual-payment screenshots.
--
-- The submit route (src/app/api/subscription-request/route.ts) also creates this
-- at runtime via the Storage API when a service key is configured, but declaring
-- it here keeps `supabase db push` environments consistent and means the bucket
-- exists even before the first upload. Admin reads use service-key signed URLs
-- (RLS-bypassing), so no bucket policies are required — keep it private.
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;
