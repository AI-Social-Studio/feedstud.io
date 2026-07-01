# Clerk Roles And Webhook

## Current Role Model

The application uses app-level roles stored in Clerk `publicMetadata`.

- `admin`: elevated access in the app
- `user`: default application role

Role resolution in the app:

1. `sessionClaims.metadata.role`
2. `publicMetadata.role`
3. fallback to `user`

This means the app already works even if a user has no `role` in Clerk yet.
No role is treated as `user`.

## What Works Without A Webhook

You do not need the Clerk webhook during local development.

Without the webhook:

- sign-in and sign-up still work
- regular users still work because missing role falls back to `user`
- admins still work if you manually set `publicMetadata.role = "admin"`
- `/dashboard/admin` stays protected by the frontend role checks

So the current codebase is safe to run without hosting and without a webhook endpoint configured.

## Why The Webhook Exists

The webhook is only for one thing: writing `publicMetadata.role = "user"` automatically when a new Clerk user is created.

It is a normalization step, not a runtime requirement.

Without it, the app behavior is still correct because missing role already means `user`.

## Webhook Endpoint In This Repo

The route is:

```txt
/api/webhooks/clerk
```

Implementation:

```txt
frontend/app/api/webhooks/clerk/route.ts
```

Handled event:

- `user.created`

Behavior:

- if the user already has a valid app role, nothing is changed
- if the user has no app role, the route sets:

```json
{
  "role": "user"
}
```

## When To Configure The Webhook

Configure it when you have a reachable URL for the frontend app, for example:

- production hosting
- preview deployment
- local tunnel such as ngrok or Cloudflare Tunnel

Example endpoint URL:

```txt
https://your-domain.com/api/webhooks/clerk
```

## Clerk Dashboard Setup

When you are ready:

1. Open Clerk Dashboard.
2. Go to `Webhooks`.
3. Add a new endpoint.
4. Set the endpoint URL to your deployed frontend webhook URL.
5. Subscribe to `user.created`.
6. Copy the signing secret.
7. Put it in frontend env as:

```env
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

## Local Development Recommendation

For now, if you are not hosting the app and do not want to use a tunnel:

- do not configure the webhook yet
- keep developing normally
- manually set `publicMetadata.role = "admin"` for admin accounts in Clerk

Regular users will still be treated as `user` automatically by the app.

## Recommended Admin Setup

Admin user in Clerk:

```json
{
  "role": "admin"
}
```

Regular user in Clerk:

```json
{
  "role": "user"
}
```

or simply no role at all, if the webhook is not enabled yet.
