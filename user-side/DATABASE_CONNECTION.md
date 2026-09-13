# Connecting the nonprofit database

This demo uses a local SQLite database so the nonprofit and individual-user modules can work against the same records during development. The browser reads the database **through the HTTP API**; it does not open the `.sqlite` file itself.

## 1. Start the shared local server

From this folder, run:

```bash
node server.js
```

The server listens at `http://127.0.0.1:4173`. On first run, `database.js` creates `charities.sqlite` beside the source files and seeds six fictional records from `data.js`. Later restarts keep existing records and saved plans. The database file is excluded by `.gitignore` and from the source ZIP.

To store it elsewhere, set `DEMO_DB_PATH` to an absolute path before starting the server. Node.js 24 or newer is required for the built-in SQLite module.

## 2. Let the nonprofit team update records

The easiest local handoff is [Nonprofit data handoff](http://127.0.0.1:4173/charity-data.html). The team can view all records, edit a record, or create a new one. Set `status` to `published` when a record should appear to individual users; `draft` records stay hidden.

The same update is available through the API:

```http
PUT /api/admin/charities/{stable-id}
Content-Type: application/json
```

Example JSON body:

```json
{
  "category": "local",
  "status": "published",
  "name": "Example Community Kitchen",
  "initials": "EC",
  "theme": "green",
  "logoUrl": "",
  "description": "Serving warm meals to neighbors.",
  "cause": "Expand the kitchen",
  "goal": 100000,
  "raised": 25000,
  "youtubeUrl": ""
}
```

Use `GET /api/admin/charities` to read all records, including drafts. Keep `id` stable once users may have selected an organization. The full field contract is in [TEAM_INTEGRATION.md](./TEAM_INTEGRATION.md).

## 3. How the user module receives updates

The user-side code calls `GET /api/charities`, which returns `{ "charities": [...] }` with **published** records only. It reloads records when entering the allocation steps or Discover page; Discover also has a Refresh button. New names, descriptions, logos, fundraising amounts, and YouTube links then appear without editing `app.js`.

With the included local server, [config.js](./config.js) has `API_BASE_URL = ''`, meaning same-origin requests. If the nonprofit team uses a separate shared backend, set `API_BASE_URL` to that backend's origin and preserve the routes and JSON field names. The backend must allow requests from the front-end origin if they are hosted separately. For an Express/MongoDB project, replace the local SQLite implementation with equivalent API handlers; the user screens can stay the same.

## What GitHub does and does not sync

GitHub can share this code, schema, seed data, and API contract. It does **not** synchronize `charities.sqlite` files on different computers. To see one another's edits live, both teams must use the same running API/database service. The included server is bound to localhost and its admin routes have no authentication, so it is for local development only. Do not expose it to the public internet or use it for real donor or payment data.
