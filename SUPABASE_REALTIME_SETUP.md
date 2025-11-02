Supabase Realtime setup

Required settings:

- Enable Realtime in Supabase dashboard for your project.
- Enable replication for the following tables: `transactions`, `notifications`, `accounts` (if you want balance updates).
- Ensure publications are enabled for these tables and that replication is configured.
- Configure RLS policies as needed to allow authenticated clients to receive relevant changes (use Row Level Security policies that allow the server/admin to write and clients to read their own rows).

Frontend subscription example:

Use the provided component `components/supabase/realtime-subscriber.tsx`:

- Place the component in a client-side area (e.g. inside dashboard layout) and pass the current user id.
- The component subscribes to `transactions:user_${userId}` and `notifications:user_${userId}` channels and logs payloads via the app logger.

Server considerations:

- The backend should use the admin/service role key to insert rows (the admin client is available via `lib/supabase/admin.ts`).
- Clients should use the anon/public key.
- Do NOT expose the service role key to the browser.

Testing checklist:

1. Confirm the SQL migration `scripts/001_create_banking_schema.sql` has been applied in Supabase SQL editor.
2. Verify RLS policies are present for `transactions`, `notifications`, `accounts` as intended.
3. Enable Realtime replication for the above tables.
4. Start app, log in as a user, and open browser console to see realtime payloads when a transaction or notification is created.
5. If realtime events are not received, check Supabase Realtime dashboard and ensure replication is active and that your project is not blocked by network/firewall rules.
