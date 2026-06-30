# platform-aware-content-generator

## Environment

Frontend uses `@t3-oss/env-nextjs` for typed, validated access to runtime configuration.

Files:

```bash
.env.local        # local overrides, gitignored
.env.example      # template committed to git
.env.development  # committed local defaults
.env.production   # committed production template
```

Variables:

| Variable | Scope | Required | Default | Purpose |
| --- | --- | --- | --- | --- |
| `BACKEND_URL` | server | yes | `http://localhost:4000` | Target for Next.js rewrites and server-side fetches |
| `NEXT_PUBLIC_BACKEND_URL` | client | no | `/api/backend` | Browser API base URL; keep rewrite path unless frontend calls backend directly |
| `NODE_ENV` | shared | no | `development` | Next.js runtime mode |

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```
