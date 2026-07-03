# AGENTS.md

## Project Overview

Feedstudio.ai is a full-stack app for generating and refining social media posts.

- `frontend/`: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- `backend/`: FastAPI, PostgreSQL, MinIO, OpenRouter

For files inside `frontend/`, also read `frontend/AGENTS.md` first. It contains extra Next.js-specific rules.

## Setup notes

If `backend/.env` is missing, `./scripts/dev.sh` creates it from `backend/.env.example`.
Set `OPENROUTER_API_KEY` in `backend/.env` before testing real AI generation.

## Testing And Validation

- Frontend lint: `cd frontend && npm run lint`
- Frontend auto-fix lint: `cd frontend && npm run lint:fix`
- Frontend format: `cd frontend && npm run format`
- Frontend format check: `cd frontend && npm run format:check`

## Code Style

- Follow existing file structure and naming.
- Use TypeScript patterns already present in the touched area.
- Run Prettier on changed frontend files before finishing.
- Respect ESLint; do not leave warnings or rule suppressions unless necessary.
- Do not add new dependencies unless there is a clear need.

### React / Next.js

- Do not use plain `useEffect` for derived state, sync state, or render-time fixes.
- Prefer derived state, event handlers, `useEffectEvent`, `useSyncExternalStore`, key-based resets, or existing helpers.
- Avoid render-time reads/writes to refs for synchronization.
- Be careful with SSR and hydration. Do not read browser-only APIs during server render unless the code already handles it safely.
- For Next.js 16 behavior changes, check `frontend/node_modules/next/dist/docs/` when working in unfamiliar areas.

## Commit Guidance

- Use Conventional Commits.
- Prefer small commits grouped by concern, for example:
  - `feat(backend): queue generate jobs with RabbitMQ`
  - `fix(frontend): use createPortal for toast notifications rendering`
