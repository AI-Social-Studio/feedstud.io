## Getting Started

Run the full local app:

```bash
./scripts/dev.sh
```

This starts:

- frontend: http://localhost:3000
- backend: http://localhost:4000
- backend docs: http://localhost:4000/docs
- MinIO console: http://localhost:9001 (`flowforge` / `flowforge-secret`)

If `backend/.env` does not exist, the script creates it from `backend/.env.example`.
Set `OPENROUTER_API_KEY` in `backend/.env` before using real AI generation.

Frontend env lives in `frontend/.env*`. For local work, copy `frontend/.env.example` to `frontend/.env.local` only when you need overrides.

Stop Docker services with:

```bash
cd backend && docker compose down
```

