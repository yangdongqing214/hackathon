# React + Express + MongoDB Auth Template

Reused from Season Planet's Task 1 auth build and extracted into a generic starter. Verified working: registration (with role selection), dual login (username or email), Remember me, password show/hide, session renewal, 403 permission enforcement, top nav (avatar dropdown + notification bell).

## Run it

```bash
docker compose up -d          # Mongo, host port 27018 (avoids colliding with other projects' 27017)
cd backend && npm install && npm run dev    # :4000
cd frontend && npm install && npm run dev   # :5175
```

## Directory structure

- `backend/src/modules/<auth|user|notification>/`: routes/controller/service/repository/model/dto, six files per module
- `backend/src/middleware/`: `auth.middleware.ts` (attaches `req.user` + `permissionMiddleware(role)` returning 403), `session-renewal.middleware.ts` (auto-renews a session once past half its lifetime)
- `frontend/src/features/<auth|user|notification|dashboard>/`: types/api/hook/component, four layers per feature
- `frontend/src/shared/TopNav.tsx` / `Footer.tsx`: nav bar + footer — copy these directly into a new project

## What to change when adapting this into a new project

- `backend/src/modules/user/user.model.ts`'s `role` default and `RegisterPage.tsx`'s `ROLES` array — currently placeholder `user`/`admin`, swap in your real business roles.
- `DashboardPage.tsx` — a placeholder page; start writing real features from here.
- `permissionMiddleware` does a simple role-name equality check; if you need finer-grained permissions (not just roles), extend it here without touching call sites.
- The frontend `apiClient`'s `BASE_URL` and the backend `.env`'s port/`FRONTEND_ORIGIN` — change these to non-conflicting values when running multiple projects at once.

## Verified (tested in a real browser, not assumed)

Register → auto-login → redirect to dashboard; avatar dropdown Profile settings/Log out; Profile page nickname save; log out; email login + password show/hide + Remember me (identifier persisted via localStorage); a role without permission hitting `/api/users/admin-only` returns `{code:403,message:"No permission to perform this action"}`; an unauthenticated request to a protected endpoint returns 401. `tsc --noEmit` is clean on both frontend and backend.
