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

| Variable                       | Scope  | Required     | Default                 | Purpose                                                                        |
| ------------------------------ | ------ | ------------ | ----------------------- | ------------------------------------------------------------------------------ |
| `BACKEND_URL`                  | server | yes          | `http://localhost:4000` | Target for Next.js rewrites and server-side fetches                            |
| `CLERK_WEBHOOK_SIGNING_SECRET` | server | for webhooks | none                    | Verifies Clerk webhook calls used to default new users to role `user`          |
| `NEXT_PUBLIC_BACKEND_URL`      | client | no           | `/api/backend`          | Browser API base URL; keep rewrite path unless frontend calls backend directly |
| `NODE_ENV`                     | shared | no           | `development`           | Next.js runtime mode                                                           |

## Roles

The app resolves roles in this order:

1. Clerk session claim `metadata.role`
2. Clerk `publicMetadata.role`
3. fallback to `user`

Default role is `user`. Promote a user by setting Clerk metadata role to `admin`.

New users can be defaulted to `user` through the Clerk webhook at
`/api/webhooks/clerk`, which handles the `user.created` event and writes
`publicMetadata.role = "user"` when no app role exists yet.

Authentication redirects should point to `/dashboard` after sign-in and sign-up.

If you want middleware to block `/dashboard/admin` before the page loads, include `metadata.role`
in the Clerk session token claims so it is available in `sessionClaims`.

Use `admin` for privileged users and protect admin-only screens with `requireAdminContext()`.

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
