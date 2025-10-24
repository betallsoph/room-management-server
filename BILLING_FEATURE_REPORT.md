# Billing Feature Implementation Report

## Overview

- Reworked the backend scaffold to follow the MongoDB structure from `database-structure.md`, using Express + Mongoose with TypeScript.
- Added end-to-end plumbing for the invoice/billing flow, including placeholder behaviours for upload buttons and “mark as sent” toggles that the frontend can wire later.
- Left existing JavaScript controllers/models in place (e.g. `src/routes/invoiceRoute.js`) for now; we must decide whether to archive or migrate them to avoid duplicate APIs.

## Implemented Components

- `src/server.ts`, `src/app.ts`: new TypeScript entry point, loads admin/client routes, applies JSON middleware, and exposes `/api/health`.
- `src/config/database.ts`: guarded Mongo connection helper that validates `MONGODB_URI`.
- **Models** (TypeScript, Mongoose):
  - `src/models/Building.ts:1` – building metadata with virtual `blocks`.
  - `src/models/Block.ts:1` – block details, cascading room cleanup.
  - `src/models/Room.ts:1` – room info/status, virtual tenants, cascade removal.
  - `src/models/Tenant.ts:1` – tenant profile + contract dates.
  - `src/models/Invoice.ts:1` – monthly billing, amount breakdown, attachment skeleton, send/reminder flags.
  - `src/models/User.ts:1` – lightweight admin/staff/tenant mapping so React can tie building/block/room in the auth payload.
- **Admin routes** (`src/routes/admin`):
  - `buildings.ts:1` – CRUD + cascading delete across hierarchy.
  - `blocks.ts:1` – CRUD with building counters and cascade removal.
  - `rooms.ts:1` – CRUD, capacity/status updates, mark-available shortcut.
  - `tenants.ts:1` – CRUD, move-in/move-out transitions with transactions.
  - `invoices.ts:1` – create/update, filter by hierarchy/time, mark status, push attachment metadata, toggle send/reminder flags.
- **Client routes** (`src/routes/client`):
  - `auth.ts:1`, `profile.ts:1` – 501 placeholders so the frontend button can hit an endpoint while auth is pending.
- `package.json:1` + `tsconfig.json:1` – add TypeScript toolchain, `npm run build`, `npm run dev`, and type definitions.

## How the “Fake” Buttons Can Work

- Upload button: call `POST /api/admin/invoices/:id/attachments` with `{ url, fileName?, fileType?, fileSize?, note? }`. Currently stores metadata only (no storage), keeping the last 10 entries.
- “Đã gửi hóa đơn” toggle: call `POST /api/admin/invoices/:id/mark-sent`; sets `flags.invoiceSent` and timestamp.
- Reminder toggle: call `POST /api/admin/invoices/:id/mark-reminder`; updates reminder flag/timestamp.

## Integration Notes

- Start the new stack with `npm run dev` (nodemon + ts-node) after installing dependencies (`npm install`). Production build is `npm run build` followed by `npm start`.
- Existing `.env` needs a valid `MONGODB_URI`. Health check returns `{ status: 'ok' }` once the server boots.
- Frontend can fetch hierarchy data through `/api/admin/buildings` → `/blocks?buildingId=X` → `/rooms?blockId=Y`, or use query params on `/api/admin/invoices`.
- When moving a tenant out via `/api/admin/tenants/:id/move-out`, the room automatically flips to `available` for vacancy listings.

## Known Gaps / Decisions Needed

1. **Duplicate legacy code** – The old CommonJS controllers/models in `src/routes/*.js` and `src/models/*.js` are unchanged. We should either retire them or port remaining features (notifications, payments, etc.) to TypeScript to avoid conflicting endpoints.
2. **Auth/security** – No JWT/session logic is wired yet; the new routes are public. Align with existing `authController.js` or rebuild in TypeScript.
3. **Validation & DTOs** – Current handlers rely on basic mongoose validation. Consider zod/joi or custom middleware for stronger input checks and localized messages.
4. **Testing** – No automated tests cover the new code. Add integration tests (e.g. using Supertest + in-memory Mongo) once the old stack is cleaned up.
5. **Invoice business rules** – Amount calculations, automatic generation per month, debt rolling, and notification delivery remain TODO (per your note to keep backend logic separate for now).
6. **File storage** – Attachments only keep metadata. Decide on S3 integration flow and update the controller to sign/upload.
7. **Swagger/OpenAPI** – `swagger.js` still references the legacy endpoints. Update definitions to document the new routes.
8. **TypeScript linting** – No eslint/prettier config is present for TS; add when enforcing coding standards.

## Suggested Next Steps

1. Remove or migrate leftover JavaScript modules so there is a single source of truth.
2. Scaffold auth/session middleware in TypeScript (reuse bcrypt/ JWT deps already declared).
3. Hook invoice generation cron/service once business rules are ready.
4. Implement real attachment uploads (S3 or similar) and store secure URLs.
5. Add request validation + test coverage around critical flows (tenant move-in/out, invoice status changes).
