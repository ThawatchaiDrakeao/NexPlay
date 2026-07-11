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
- `LINE_CHANNEL_ID`: LINE channel ID used to verify LIFF/LINE ID tokens
- `LINE_CHANNEL_SECRET`: LINE Messaging API channel secret; keep this only in backend runtime
- `LINE_CHANNEL_ACCESS_TOKEN`: LINE Messaging API access token; keep this only in backend runtime

Security note:

- Do not put LINE channel secrets or Supabase service-role keys into the frontend environment.
- Only the backend should verify LINE ID tokens and exchange them for a NexPlay JWT.

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
