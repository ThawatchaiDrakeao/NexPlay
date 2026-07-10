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
