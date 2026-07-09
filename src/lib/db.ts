import postgres from 'postgres';

if (!process.env.SUPABASE_DB_URL) throw new Error('SUPABASE_DB_URL is not set');

// Raw-SQL client for the analytics tables, against Supabase Postgres.
// `prepare: false` keeps us compatible with the Supavisor transaction pooler
// (pgbouncer transaction mode rejects prepared statements). Connects as the
// `postgres` owner, so RLS is bypassed for ingest/admin queries.
//
// The timeouts are tuned for serverless: a warm Vercel function otherwise
// keeps idle sockets open forever, and once the pooler/NAT silently drops
// one, the next query on it dies with ETIMEDOUT/ECONNRESET. Closing idle
// connections after 20s forces a fresh, healthy connect per burst, and
// connect_timeout keeps a bad connect from eating the whole request window.
export const sql = postgres(process.env.SUPABASE_DB_URL, {
  prepare: false,
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 15,
});
