import postgres from 'postgres';

if (!process.env.SUPABASE_DB_URL) throw new Error('SUPABASE_DB_URL is not set');

// Raw-SQL client for the analytics tables, against Supabase Postgres.
// `prepare: false` keeps us compatible with the Supavisor transaction pooler
// (pgbouncer transaction mode rejects prepared statements). Connects as the
// `postgres` owner, so RLS is bypassed for ingest/admin queries.
export const sql = postgres(process.env.SUPABASE_DB_URL, {
  prepare: false,
  ssl: 'require',
});
