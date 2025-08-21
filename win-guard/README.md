# Win Guard

## Environment

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database (Supabase)

Run the SQL in `supabase/migrations/2025-08-21-trades-schema.sql` using Supabase SQL Editor. It creates/updates:

- `public.trades` with UUID PK, timestamps, optional `side`, `notes`, `screenshot_url`
- RLS for select/insert/update/delete (owner-only)
- Indexes and `updated_at` trigger
- Storage policies for `trade-screenshots`

## Storage

Create a bucket named `trade-screenshots` (public read optional; policies provided in migration).

## Dev

```
npm run dev
```

## Build

```
npm run build && npm start
```
