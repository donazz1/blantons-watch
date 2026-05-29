# Welcome back

The app is built and ready to try on your Mac.

## 3-minute test

```bash
cd BlantonMonitor
npx prisma migrate dev
npm run dev
```

If the dashboard shows a database error, stop the server (Ctrl+C), run `npx prisma migrate dev` again, then `npm run dev`.

1. Open http://localhost:3000/dashboard
2. Admin login: http://localhost:3000/admin/login — password `blantons-admin` (change in `.env`)
3. Add a test friend in Admin
4. Click **Run stock check now**
5. Run `npm run scrape:test` to see raw scraper results per store

## Scraper test results (from first build)

| Store | Result |
|-------|--------|
| LCBO (both) | Check failed (timeout from this network — may work on Netlify/home) |
| SAQ, BCL, TAG | Out of stock |
| Willow Park, Liquorano, BSW | In stock (verify on real site) |
| NSLC | HTTP 403 (blocks bots) |
| Manitoba | HTTP 404 |

Sites that fail show **Check failed** on the dashboard — the app still works for the others.

## Before sharing publicly

1. Change `ADMIN_PASSWORD` in `.env` and Netlify env vars
2. Set a long random `CRON_SECRET`
3. For Netlify: use free **Postgres** (Supabase/Neon) — see `README.md`
4. Deploy to Netlify from GitHub

## Share link with friends

`https://YOUR-SITE.netlify.app/dashboard`

Full details: **README.md**
