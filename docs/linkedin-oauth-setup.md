# LinkedIn OAuth Setup

## What This Integration Does

The app supports connecting one LinkedIn account to a signed-in Feedstudio user.

The connection flow is:

1. the user clicks `Connect LinkedIn` in the dashboard
2. the frontend starts the OAuth flow at LinkedIn
3. LinkedIn redirects back to the frontend callback route
4. the frontend passes the `code` and `state` to the backend
5. the backend exchanges the code for tokens
6. the backend stores the LinkedIn tokens in encrypted form

## What Must Be Configured

LinkedIn OAuth in this repo needs all of the following:

- a LinkedIn developer app
- a valid LinkedIn OAuth redirect URL
- backend env variables for LinkedIn OAuth
- a backend encryption key for stored social tokens
- a working Clerk sign-in flow, because only signed-in users can connect LinkedIn

If the LinkedIn env variables are missing, the backend returns `social_auth_not_configured`.
If the encryption key is missing, token storage also fails.

## Routes Used By This Repo

Frontend start route:

```txt
/api/social-connections/linkedin/start
```

Frontend callback route:

```txt
/api/social-connections/linkedin/callback
```

Backend API routes:

```txt
/api/v1/social-connections/linkedin/start
/api/v1/social-connections/linkedin/callback
```

## OAuth Scope Used By This Repo

The LinkedIn scope is hardcoded in the backend as:

```txt
openid profile email w_member_social
```

That is what the app requests during authorization.

## Step 1: Create A LinkedIn App

1. Open the LinkedIn Developer portal.
2. Create a new app.
3. Fill in the required business and app details.
4. In the app settings, find the OAuth configuration section.
5. Make sure the app has access to the products and permissions required for sign-in and posting.

The code expects OAuth to return user identity data and a member social posting scope.

## Step 2: Add The Correct Redirect URL

This repo builds the redirect URI from the frontend host.

If you run the frontend locally on port `3000`, the callback URL is:

```txt
http://localhost:3000/api/social-connections/linkedin/callback
```

If you run the app on another host, use that exact host instead:

```txt
https://your-domain.com/api/social-connections/linkedin/callback
```

Important:

- the redirect URI configured in LinkedIn must exactly match the one used at runtime
- the backend sends the same `redirect_uri` during both start and callback completion
- if they do not match, LinkedIn token exchange fails

## Step 3: Copy LinkedIn Credentials

From the LinkedIn app, copy:

- client ID
- client secret

You will place them in `backend/.env`.

## Step 4: Configure Backend Env Variables

Open:

```txt
backend/.env
```

Set these values:

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_OAUTH_STATE_SECRET=your_long_random_secret
LINKEDIN_API_VERSION=202606
SECRET_CIPHER_KEY=your_fernet_key
```

What each value is for:

- `LINKEDIN_CLIENT_ID`: LinkedIn OAuth client ID
- `LINKEDIN_CLIENT_SECRET`: LinkedIn OAuth client secret
- `LINKEDIN_OAUTH_STATE_SECRET`: secret used to sign and verify the OAuth `state`
- `LINKEDIN_API_VERSION`: LinkedIn REST API version used by publishing code
- `SECRET_CIPHER_KEY`: encryption key for storing LinkedIn tokens in the database

## Step 5: Generate The Required Secrets

`LINKEDIN_OAUTH_STATE_SECRET` should be a long random string.

Example using Python:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

`SECRET_CIPHER_KEY` must be a valid Fernet key.

Example using Python:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Do not invent the Fernet key by hand.

## Step 6: Make Sure Frontend Can Reach Backend

The frontend server routes call the backend using `BACKEND_URL`.

Frontend server env should point to the backend, for example:

```env
BACKEND_URL=http://localhost:4000
```

If you use an internal backend token in your setup, also set:

```env
BACKEND_INTERNAL_API_KEY=your_internal_backend_token
```

This is not LinkedIn-specific, but the frontend callback route depends on working backend access.

## Step 7: Start The App

Make sure these parts are running:

1. frontend
2. backend
3. database

For publish jobs, you also need:

1. RabbitMQ
2. the backend worker
3. MinIO

OAuth connection itself does not need a publication job to be running.

## Step 8: Test The Connection Flow

1. Sign in to the app.
2. Open the dashboard.
3. Click `Connect LinkedIn`.
4. Authorize the LinkedIn app.
5. Confirm you return to:

```txt
/dashboard?linkedin=connected
```

6. Confirm the dashboard shows the connected LinkedIn account.

## What The Backend Stores

After a successful connection, the backend stores:

- LinkedIn account ID
- LinkedIn account URN
- display name
- access token, encrypted
- refresh token, encrypted when provided
- token expiry time
- granted scopes

The encryption is done with `SECRET_CIPHER_KEY`.

## Common Failure Cases

### Missing LinkedIn env vars

Symptom:

- connect flow fails immediately
- backend responds with LinkedIn OAuth not configured

Fix:

- set `LINKEDIN_CLIENT_ID`
- set `LINKEDIN_CLIENT_SECRET`
- set `LINKEDIN_OAUTH_STATE_SECRET`

### Missing encryption key

Symptom:

- authorization may start, but storing the connection fails

Fix:

- set a valid `SECRET_CIPHER_KEY`

### Redirect URI mismatch

Symptom:

- LinkedIn redirects back, but backend token exchange fails

Fix:

- check the exact callback URL in LinkedIn app settings
- make sure it matches the frontend host exactly

### User is not signed in

Symptom:

- start or callback route redirects to `/sign-in`

Fix:

- sign in with Clerk first

### Backend is unreachable from frontend

Symptom:

- callback returns to `/dashboard?linkedin=error`

Fix:

- verify frontend `BACKEND_URL`
- verify backend is running
- verify any required `BACKEND_INTERNAL_API_KEY`

## Local Development Recommendation

For local development, the simplest working setup is:

- frontend on `http://localhost:3000`
- backend on `http://localhost:4000`
- LinkedIn redirect URL set to:

```txt
http://localhost:3000/api/social-connections/linkedin/callback
```

- valid `backend/.env` values for `LINKEDIN_CLIENT_ID`
- valid `backend/.env` values for `LINKEDIN_CLIENT_SECRET`
- valid `backend/.env` values for `LINKEDIN_OAUTH_STATE_SECRET`
- valid `backend/.env` values for `SECRET_CIPHER_KEY`

If those values are correct, the LinkedIn connect flow in this repo should work.
