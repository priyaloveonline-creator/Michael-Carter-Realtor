# Michael Carter — AI Realtor Website

A premium, mobile-first real estate website with an AI assistant, built with
Next.js (App Router), TypeScript, and Tailwind CSS. Designed to be deployed
straight to Vercel from GitHub.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **AI:** OpenRouter (model configurable via env var, no retraining ever needed —
  the realtor's live data is injected as context on every request)
- **Leads / conversation log:** Google Sheets (via a lightweight service-account
  JWT flow, no database)
- **Booking:** Calendly or Cal.com, embedded in a modal on the "Book a Showing" flow
- **Data:** Realtor profile, listings, and services live in `data/realtor.ts` —
  a single source of truth read by both the UI and the AI's system prompt

There is no database and no admin dashboard. To change a listing's price or
status, edit `data/realtor.ts` and redeploy (or wire that file up to a headless
CMS later if you want live editing without a redeploy).

## Project structure

```
app/
  page.tsx              → Home / public profile page
  profile/page.tsx      → "My Profile" (same content, separate route for the menu)
  listings/page.tsx     → "My Listings"
  services/page.tsx     → "My Services"
  chat/page.tsx         → AI Realtor chat
  api/chat/route.ts     → Server-side OpenRouter call (API key never reaches the browser)
  api/leads/route.ts    → Server-side Google Sheets append
components/             → UI building blocks (nav, cards, chat pieces, booking modal)
data/realtor.ts         → Single source of truth: profile, listings, services, AI context
lib/
  useChat.ts             → Chat state/hook
  googleSheets.ts         → Google Sheets REST client (service account JWT)
public/images/           → Placeholder SVG art — swap for real photos any time
```

## Getting started locally

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Visit `http://localhost:3000`.

## Environment variables

See `.env.example` for the full list. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes, for AI chat | Server-side only. Get one at https://openrouter.ai |
| `OPENROUTER_MODEL` | No (has default) | Any OpenRouter model slug, e.g. `openai/gpt-4o-mini` |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Only for lead sync | Service account email |
| `GOOGLE_SHEETS_PRIVATE_KEY` | Only for lead sync | Service account private key (keep the `\n` escapes) |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Only for lead sync | The ID from your Sheet's URL |
| `GOOGLE_SHEETS_SHEET_NAME` | No (defaults to `Leads`) | Tab name to append rows to |
| `NEXT_PUBLIC_BOOKING_PROVIDER` | No (defaults to `calendly`) | `calendly` or `calcom` |
| `NEXT_PUBLIC_CALENDLY_URL` | If using Calendly | Your scheduling page URL |
| `NEXT_PUBLIC_CALCOM_URL` | If using Cal.com | Your scheduling page URL |

### Setting up Google Sheets lead sync

1. In Google Cloud Console, create a project (or reuse one) and enable the
   **Google Sheets API**.
2. Create a **Service Account**, then create a JSON key for it.
3. From that JSON, copy `client_email` → `GOOGLE_SHEETS_CLIENT_EMAIL` and
   `private_key` → `GOOGLE_SHEETS_PRIVATE_KEY` (keep it as one line with
   `\n` for line breaks — that's how it comes in the JSON already).
4. Create a Google Sheet, add a header row (Timestamp, Name, Email, Phone,
   Intent, Area, Budget, Timeline, Summary), and **share it with the service
   account's email** as an Editor.
5. Copy the spreadsheet ID from its URL into `GOOGLE_SHEETS_SPREADSHEET_ID`.

If these variables are left empty, the app still works — leads just won't be
synced anywhere, and the API responds with `{ syncedToSheets: false }` instead
of erroring.

### Setting up the AI

1. Create an account at https://openrouter.ai and generate an API key.
2. Set `OPENROUTER_API_KEY` in your environment.
3. Optionally change `OPENROUTER_MODEL` to any model OpenRouter supports —
   no code changes needed.

The AI is instructed (see `app/api/chat/route.ts`) to only use the realtor
knowledge generated fresh from `data/realtor.ts` on every request, and to say
so plainly rather than invent details it doesn't have.

### Setting up booking

Paste your real Calendly or Cal.com scheduling-page URL into
`NEXT_PUBLIC_CALENDLY_URL` or `NEXT_PUBLIC_CALCOM_URL`, and set
`NEXT_PUBLIC_BOOKING_PROVIDER` to match. The "Book a Showing" modal embeds
that page directly — all real availability comes from whichever provider you
connect there.

## Updating listings, services, or Michael's info

Everything lives in `data/realtor.ts`. Editing a price, marking a listing
`"Sold"`, or changing the phone number updates both the visible pages and the
AI's knowledge simultaneously — there's nothing else to sync.

## Deploying

1. Push this project to a GitHub repository.
2. Import the repo into [Vercel](https://vercel.com/new).
3. Add the environment variables from the table above in the Vercel project
   settings (Production + Preview).
4. Deploy.

## Design notes

Placeholder property photos and Michael's portrait are generated SVG art
(clean gradient placeholders) so the app looks intentional out of the box.
Swap files in `public/images/` for real photography before sharing this
publicly — the filenames referenced in `data/realtor.ts` can point to `.jpg`
or `.png` just as easily; update the extensions there to match.
