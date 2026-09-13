# Giving Compass — user-side proof of concept

An English, clickable user-side demo for the charitable giving hackathon. The user can browse nonprofits, allocate a fixed 10% of simulated income across three levels, choose several nonprofits within each level, select a one-time or monthly **demo plan**, enter a Visa test card or preview Apple Pay, submit, and review the last saved plan. No money moves. Card fields are never sent to the server or saved.

## Run locally

Requires Node.js 24 or newer. There are no external packages.

```bash
node server.js
```

Open `http://127.0.0.1:4173/`. The nonprofit data handoff page is `http://127.0.0.1:4173/charity-data.html`.

Run the allocation, payment UI, and database tests with `node --test allocation.test.js payment-demo.test.js database.test.js`.

The server creates `charities.sqlite` on first run and seeds fictional nonprofit records. The database and saved plans are ignored by Git; they should not be committed. To use an alternate database path, set `DEMO_DB_PATH` before starting the server.

## User flow

1. Create a demo profile or skip signup. If a demo profile already exists in this browser, its name/email card and **Continue to Step 1** both open the allocation flow; **Switch profile** starts a fresh profile.
2. **Step 1 — Amount & reach:** set simulated income and adjust Local, National, and International. They always total 100%, with at least 1% in each level.
3. **Step 2 — Choose nonprofits:** switch between the three reach tabs. Select a published nonprofit and press **+ Add**. Adjust shares within that level. Discover is a separate page for reading profiles.
4. **Step 3 — Review & save:** choose One-time or Monthly. For Visa, fill the displayed test card number, a future expiry, a three-digit CVV, and a demo name; **Use demo card** fills them automatically. Or choose Apple Pay to view a simulated wallet confirmation. Review the allocation and select **Submit & save**.
5. **My overview:** inspect the last saved plan, per-nonprofit amounts, unassigned reserve, frequency, and demo payment method. Choose **Adjust my plan** or jump directly to **Change giving or payment details**.

Only one wizard step appears at a time. Back, Next, and the progress links move between steps. Changes made after saving do not change the overview until another submission. The card form is deliberately limited to the publicly documented Visa test number `4242 4242 4242 4242`; do not enter real card details. The Apple Pay sheet is a visual simulation and does not invoke Apple Pay.

## Team integration

The user-side browser code loads nonprofits from `GET /api/charities`. Another team can use the local handoff page or the API to create and update records. See [TEAM_INTEGRATION.md](./TEAM_INTEGRATION.md) for the field contract and routes. Published changes appear in Discover after a refresh or when the user returns to that screen. Draft records stay hidden.

The SQLite setup is for local integration on **one running server**. GitHub shares the code and schema, not live database state. Team members on separate computers need a shared backend or deployed database to see each other's updates immediately. See [DATABASE_CONNECTION.md](./DATABASE_CONNECTION.md) for step-by-step connection instructions and [config.js](./config.js) for the API origin setting.

## Modules

- `index.html`, `styles.css`: English user screens and responsive layout.
- `app.js`: navigation, draft state, nonprofit discovery, demo payment interactions, submit/save, and saved overview.
- `payment-demo.js`: test-card input formatting and validation; card fields never enter application state or API requests.
- `allocation.js`: percentage and cents-safe amount calculations.
- `server.js`, `database.js`: local HTTP API and SQLite persistence.
- `config.js`: same-origin or remote API base URL.
- `data.js`: fictional seed records and category labels.
- `charity-data.html`, `charity-data.js`: local developer handoff page for nonprofit records.

## Production gaps

This is a proof of concept. Before collecting real donations, the team needs verified nonprofit onboarding and payout details, proper user authentication, a payment provider's hosted card components and server-side payment confirmation, registered Apple Pay merchant/domain and device availability checks, a real recurring-donation lifecycle (including cancellation), receipts and donation history, error/retry handling, privacy and security review, and a shared deployed backend. The current "saved" state is a planned allocation, never a successful charge.
