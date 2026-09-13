# Charitable Giving Platform

Hackathon app: React + Express + MongoDB. Login, then users land on the giving dashboard. Nonprofits publish org profiles that appear in Browse and in the user-side Discover list.

## Run it

```bash
docker compose up -d          # Mongo, host port 27018 (avoids colliding with other projects' 27017)
cd backend && npm install && npm run dev    # :4000
cd frontend && npm install && npm run dev   # :5175
```

Open `http://localhost:5175/`. Register as **User**, then you should see the giving allocation wizard (shaoxin's user-side demo) on `/dashboard`.

Register as **Charity** to edit an org profile at `/nonprofits/me/edit`. Published orgs show up under **Nonprofits** and in the user-side Discover screen.

## Directory structure

- `frontend/` — Vite React app (port 5175)
- `backend/` — Express API (port 4000)
- `user-side/` — user allocation demo (vanilla JS). Served inside the React app at `/dashboard`. Can also run alone with `cd user-side && node server.js` → `http://127.0.0.1:4173/`
- `testing/` — Playwright E2E

## User-side notes

The user-side files used to sit in the repo root (`index.html`, `app.js`, …), so `frontend npm run dev` never showed them. They now live in `user-side/` and are wired to the logged-in dashboard.
