# NexPlay Backend

Production-oriented Express API foundation for NexPlay.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Health Check

```http
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "service": "NexPlay API"
}
```

## Environment

- `NODE_ENV`: `development`, `test`, or `production`
- `PORT`: API port
- `CORS_ORIGIN`: allowed frontend origin, comma-separated for multiple origins
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for trusted backend operations
- `JWT_SECRET`: JWT signing secret, at least 32 characters
- `LINE_CHANNEL_SECRET`: LINE Messaging API channel secret

## Supabase Setup

Run migrations in order:

```bash
001_core_entities.sql
002_auth_entities.sql
003_venue_management.sql
004_booking_payment.sql
```

Production requirements:
- Enable `pgcrypto`.
- Keep RLS enabled.
- Use service-role key only in the backend runtime.
- Verify tenant-scoped queries before exposing new APIs.

## Render Deployment

1. Create a Render Web Service from the backend project.
2. Set build command:

```bash
npm install
```

3. Set start command:

```bash
npm start
```

4. Configure all environment variables from `.env.example`.
5. Deploy and verify `GET /api/health`.
