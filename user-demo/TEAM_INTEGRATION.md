# Nonprofit-team integration contract

This contract lets the nonprofit team's profile module feed the user-side Discover page. The local development server stores records in SQLite and has a simple [data handoff page](http://127.0.0.1:4173/charity-data.html). That page is a developer aid, not the nonprofit signup UI.

For exact setup steps and a description of how database changes reach the user screens, see [DATABASE_CONNECTION.md](./DATABASE_CONNECTION.md).

The common-shell team can link directly to `/#step1`, `/#step2`, `/#step3`, `/#discover`, or `/#summary`. `/#dashboard` remains an alias for Step 1. The local signup screen is a demo placeholder; the common shell should supply the real user identity when the modules are integrated.

## Record fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable unique identifier, 2–80 letters/numbers/underscore/hyphen; do not change after users select it. |
| `category` | string | Exactly `local`, `national`, or `international`. |
| `name` | string | Organization name, required. |
| `initials` | string | Fallback logo text, up to 8 characters. |
| `logoUrl` | string | Optional HTTPS logo image URL. |
| `description` | string | Short public introduction. |
| `cause` | string | What the organization is raising funds for. |
| `goal` | number | Target fundraising amount in NZD. |
| `raised` | number | Amount raised in NZD, used for the progress bar. |
| `youtubeUrl` | string | Optional HTTPS YouTube introduction video URL. |
| `status` | string | `draft` or `published`; only published records appear to users. |
| `updatedAt` | string | Server-managed timestamp. |

## Routes

- `GET /api/charities` returns `{ "charities": [...] }` with **published** records. This is the user-side dependency.
- `GET /api/admin/charities` returns all records for the local handoff page.
- `PUT /api/admin/charities/{id}` creates or updates a record. Send JSON containing all fields except `id` and `updatedAt`.
- `POST /api/allocations` saves a user's **demo** plan. The user-side module owns this route.
- `GET /api/allocations/{clientId}` reads the latest saved demo plan.

The user-side save request includes a browser-generated `clientId`, simulated `income`, `frequency` (`one_time` or `monthly`), `paymentMethod` (`visa_4242` or `apple_pay_demo`; legacy `visa_1881` records remain readable), `categoryShares`, and `charityShares`. The server validates the shares and calculates the saved snapshot. Only the chosen demo method identifier is sent; card number, expiry, CVV, and cardholder name are not sent or persisted. Replace the demo identifier with a payment-provider identifier in a real implementation; never send raw card fields to this API.

Example nonprofit update:

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

The development server listens on `127.0.0.1` and has no admin authentication. Do not expose it publicly. If the project uses Express and MongoDB, preserve the published-record response shape and field names above when replacing this local API. Real deployment also needs authentication, authorization, validation, nonprofit review, and a payment provider.
