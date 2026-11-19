# Boyfriend Application Form — 2026

Cute, timed boyfriend application built with React, Vite, Tailwind CSS, and Lucide icons.

Submitted applications are stored in **Supabase PostgreSQL** and can be reviewed from the `/admin` dashboard on any device. Application drafts remain in the applicant's browser until submitted. The Netlify Functions connect to Supabase using a server-only service role key; that key is never sent to the browser.

Local Vite development uses the same Supabase-backed API via its local function middleware, so submissions made locally appear in the shared admin dashboard. To use browser-only demo storage instead, set `VITE_LOCAL_STORAGE_ONLY=true` and configure `VITE_LOCAL_ADMIN_PASSWORD` in the ignored local `.env`. Deployed admin sign-in uses the server-side `ADMIN_PASSWORD` environment variable.

## Configure Supabase and Netlify

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql) to create the applications table and restrict direct browser access.
3. Add the environment variables in Netlify site settings. The local `.env` already contains the Supabase project URL; add the remaining values to it when running Netlify Dev:

- `ADMIN_PASSWORD`: the passcode the admin uses to sign in.
- `ADMIN_TOKEN_SECRET`: a long, random secret used to sign admin sessions (keep it private and do not commit it).
- `SUPABASE_URL`: the Project URL from Supabase.
- `SUPABASE_SECRET_KEY`: the server-only Secret API key from Supabase (starts with `sb_secret_`). Never use this as a `VITE_` variable or expose it in client code. Legacy `SUPABASE_SERVICE_ROLE_KEY` is also accepted.
- `SUPABASE_VOICE_BUCKET`: optional private Storage bucket name; defaults to `voice-recordings`.

The `.env` file is git-ignored. After setting Netlify environment variables, redeploy so the functions receive them. Admin sessions expire after 12 hours. The dashboard API requires an authenticated admin session; applicants can submit records but cannot list or edit them.

The questionnaire includes a timed physical appearance and self-care assessment. It records
self-ratings, personal feature descriptions, grooming responses, and interview answers for review;
natural physical characteristics are not used for automatic rejection.

Open-response interview questions use one-take voice recording. Their countdown starts only after
recording begins; applicants can preview and retry uploading the same finalized recording. Recordings
are stored in the private `voice-recordings` Supabase Storage bucket (override with the server-only
`SUPABASE_VOICE_BUCKET` setting). Run the updated [`supabase/schema.sql`](./supabase/schema.sql) to
create the private bucket and recording metadata table. Admins can play submitted recordings from
each application's detail page. Selection and rating questions remain selection-based and are not
recorded.

The welcome page also includes Section 13, an informational benefits package for the boyfriend
experience.

Section 14 presents the symbolic salary and compensation package. Applicants must accept its
agreement before continuing; acceptance and timestamp are stored with the application record and
shown in admin review. The package is informational and does not specify a monetary salary.

## Scripts

```bash
npm install
npm run dev
```

`npm run dev` loads `.env` for server-side Netlify function handlers and serves them locally with Vite. Open `http://localhost:5173`; never add secret values to `VITE_` variables.

## Publish on Netlify

This project is configured for Netlify. Connect the project to Netlify and use the build
command `npm run build` with `dist` as the publish directory. The redirect configuration
keeps direct navigation to React routes working.

After deployment, use the public `https://...netlify.app` site URL for a shareable QR code.
Supabase retains submitted records across visitors and devices; draft progress remains local to the
applicant's browser.
