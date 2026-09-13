# Giving Compass — user-side demo plan

## Ownership

This module is the **individual user side** of the hackathon project. Another team owns nonprofit signup, profile editing, and fundraising updates. The user side reads published nonprofit records through a shared API. A separate team can link both modules in the common shell.

## Clickable user journey

| Screen | Main content | Key actions |
| --- | --- | --- |
| Home | Product introduction and demo notice | Create demo profile; explore nonprofits |
| Signup | Name and email for a browser-only profile | Continue to dashboard; skip demo signup |
| Step 1 — Amount & reach | Simulated income, fixed 10% allocation, local/national/international percentages | Next to nonprofit selection |
| Step 2 — Choose nonprofits | One reach tab at a time, direct nonprofit picker, selected shares | Switch reach tab; add/remove; open Discover; Back or Next |
| Step 3 — Review & save | One-time/monthly choice, interactive Visa test form or Apple Pay preview, live allocation summary | Back; validate test details; submit and save |
| Discover | Published nonprofit cards with category, logo, description, cause, fundraising progress, optional YouTube link | Filter; add nonprofit; return to dashboard |
| My overview | Last **saved** plan, amounts by reach and nonprofit, unassigned reserve, frequency, demo payment label, save time | Adjust allocation or payment choice; explore again |

Only one of the three setup steps is visible at a time. After submission, the flow navigates to My overview. Changes made later remain a draft until the user submits again. The UI uses white as its dominant theme with #1E90FF blue accents for actions and progress.

## Allocation rules

- Planned contribution = 10% of simulated income.
- Local + national + international = exactly 100%; each level has at least 1%.
- Within each level, selected nonprofits share exactly 100% of that level's amount.
- A level without a selected nonprofit remains reserved and unassigned in the demo.
- Money is divided in cents to avoid losing or creating fractions of a cent.
- One-time versus monthly is a **plan frequency**, not an actual charge. For monthly, the simulated income and 10% amount are interpreted as monthly figures.

## Demo-only boundaries

There is no real authentication, payment processing, recurring billing, receipt, fund custody, or payout. The browser-only card fields accept one public test Visa number and are never sent or saved; the Apple Pay sheet is simulated. A real implementation should use a payment provider's hosted card collection, registered Apple Pay integration, and explicit recurring-payment consent.
