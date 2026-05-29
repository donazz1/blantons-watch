# Blanton's Stock Monitor

A mobile-friendly web app that checks Canadian liquor sites for Blanton's bourbon, shows a shared dashboard for friends, and lets you (admin) manage users and stock hits.

Built for **Netlify** hosting with **free-tier** development.

## What works right now

- Dashboard with live stock status per store
- Big alert when any store shows **in stock**
- Admin panel (password protected) to add friends
- Friends see the same dashboard (no admin access)
- Stock hit tracking + “We purchased it” / “They didn't have it”
- Manual “Run stock check now” (admin)
- Scheduled checks every 30 minutes (Netlify)
- Weekly summary job (Saturday ~9am Eastern, via cron)
- Install on iPhone: Safari → Share → **Add to Home Screen**
- Optional SMS via Twilio (only if you add keys)

## Quick start (on your Mac)

```bash
cd BlantonMonitor
cp .env.example .env
# Edit .env — set ADMIN_PASSWORD and CRON_SECRET

npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

**Admin login:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)  
Default password (until you change `.env`): `blantons-admin`

## Test scrapers without the UI

```bash
npm run scrape:test
```

This prints each store’s result. Some sites block bots or time out from certain networks — that’s normal. LCBO often fails from automated servers; it may work better from Netlify or your home network.

## Share with friends

After deploy, share:

```text
https://YOUR-SITE.netlify.app/dashboard
```

Optional personal link (pre-selects their name):

```text
https://YOUR-SITE.netlify.app/dashboard?user=USER_ID
```

Find `USER_ID` in Admin → each friend’s “Personal dashboard link”.

## Deploy to Netlify (free / credits)

1. Push this folder to GitHub.
2. In Netlify: **Add new site** → Import from Git.
3. Set environment variables (Site settings → Environment variables):

   | Variable | Example |
   |----------|---------|
   | `DATABASE_URL` | Postgres URL from [Supabase](https://supabase.com) or [Neon](https://neon.tech) free tier |
   | `ADMIN_PASSWORD` | Your secret admin password |
   | `CRON_SECRET` | Long random string (`openssl rand -hex 32`) |
   | `TWILIO_*` | Optional, for SMS |

4. Deploy. Netlify runs migrations and builds automatically (`netlify.toml`).

**Important:** SQLite (`file:./dev.db`) works locally but **does not persist** on Netlify serverless. Use free Postgres in production.

### Switch Prisma to Postgres (production)

In `prisma/schema.prisma`, change:

```prisma
datasource db {
  provider = "postgresql"
}
```

Then run `npx prisma migrate dev` against your Postgres URL.

## Scheduled jobs

| Job | Schedule | File |
|-----|----------|------|
| Stock check | Every 30 min | `netlify/functions/scheduled-scrape.ts` |
| Weekly summary | Sat 14:00 UTC | `netlify/functions/weekly-summary.ts` |

Both call your site’s API with `Authorization: Bearer CRON_SECRET`.

## Monitored stores

- LCBO Original & Special Reserve
- SAQ, BC Liquor, Willow Park, Liquorano, BSW, TAG
- NSLC & Manitoba Liquor Marts (search pages — less precise)

## iPhone “app” install

1. Open your Netlify URL in **Safari**
2. Tap **Share** → **Add to Home Screen**
3. The app opens full-screen like a native app

## SMS (optional, usually paid)

In-app alerts always work (dashboard + hit history). For real text messages, add Twilio keys to `.env` / Netlify. Without Twilio, alerts are stored in the database only.

## Project structure

```text
src/app/           → pages (dashboard, admin)
src/app/api/       → scrape, users, hits, auth
src/lib/scrapers/  → one checker per store pattern
netlify/functions/ → scheduled scrape + weekly email
prisma/            → database schema
```

## When you get back — checklist

1. `npm run dev` — open dashboard
2. `npm run scrape:test` — see which sites respond
3. Log in to admin, change password, add a test friend
4. Click **Run stock check now**
5. Deploy to Netlify when ready

Questions or broken scrapers: note which store shows “Check failed” and we can tune that site’s parser.
