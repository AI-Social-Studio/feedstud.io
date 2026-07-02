# backend

FastAPI + PostgreSQL + MinIO + OpenRouter. Clean architecture.

## Run (Docker)

```bash
docker compose up --build
```

Services:

- backend: http://localhost:4000 (OpenAPI: http://localhost:4000/docs)
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001 (login `flowforge` / `flowforge-secret`)
- Postgres: localhost:5433 (`flowforge` / `flowforge` / db `flowforge`)

Bucket `flowforge-uploads` is auto-created on startup. DB schema is auto-created via `Base.metadata.create_all` in the lifespan; set `DB_RESET_ON_START=true` in `.env` to drop+recreate on every boot (local dev mode).

## Required env

`backend/.env` (gitignored):

```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/gpt-oss-120b:free
OPENROUTER_MAX_TOKENS=8192
OPENROUTER_TEMPERATURE=0.9
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=FlowForge
DB_RESET_ON_START=true
```

## Endpoints

### Generation (kontrakt frontend)

```
POST   /api/v1/generate
       body: {"raw": "...", "platforms": ["linkedin","instagram","x"], "file_ids": []}
       res:  {"posts": {"linkedin": "...", "instagram": "...", "x": "..."}, "errors": {}}

POST   /api/v1/refine
       body: {"platform": "linkedin"|"instagram"|"x",
              "text": "...",
              "action": "hook"|"shorten"|"formal"|"casual"|"cta"|"hashtags"}
       res:  {"text": "..."}
```

Output `text` to gotowy post po polsku, z `\n\n` między akapitami, hashtagi w ostatniej linii.

### Uploads (image assets)

```
POST   /api/v1/uploads       multipart/form-data; key: files (1..10 images, <=10 MB each)
GET    /api/v1/uploads/{id}
DELETE /api/v1/uploads/{id}
```

Accepted MIME: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`, `image/heic`, `image/heif`.

```
GET    /health
```

## Platforms (kanoniczne ID)

- `linkedin` — limit 3000 znaków
- `instagram` — limit 2200 znaków
- `x` — limit 280 znaków (twardy clamp w backendzie)

## Refine actions

- `hook` — zmień otwarcie
- `shorten` — skróć o ~30-40%
- `formal` — bardziej formalnie
- `casual` — luźniej
- `cta` — dodaj/wzmocnij CTA
- `hashtags` — wymień zestaw hashtagów

## Layout (clean architecture)

```
app/
  domain/          pure business rules (entities, value objects, exceptions)
  application/     use cases + ports + prompts
  infrastructure/  adapters (SQLAlchemy, MinIO, OpenRouter)
  interface/       FastAPI routers, schemas, DI
  core/            settings
```

Dependency direction: `interface → application → domain ← infrastructure`.

## Quick smoke test

```bash
# 1) generate
curl -s -X POST http://localhost:4000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"raw":"robiłem apkę całą noc","platforms":["linkedin","instagram","x"]}'

# 2) refine
curl -s -X POST http://localhost:4000/api/v1/refine \
  -H "Content-Type: application/json" \
  -d '{"platform":"x","text":"Kod sypie się o 3 w nocy.","action":"hook"}'

# 3) upload
curl -F "files=@/path/to/photo.jpg" http://localhost:4000/api/v1/uploads
```
