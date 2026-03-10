# Audio Notes

Send audio files via email, get back AI-powered transcriptions and summaries.

**How it works:** You create an inbound email address, send it an email with an audio attachment, and receive a reply with a transcription, summary, action items, key points, and more — all processed automatically.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Database:** [Convex](https://convex.dev)
- **AI:** OpenAI Whisper (transcription) + GPT-4o-mini (summarization) via AI SDK
- **Email:** Resend (inbound + outbound)
- **Background Jobs:** Trigger.dev

## Prerequisites

- Node.js 18+
- Accounts on:
  - [Convex](https://convex.dev) (database)
  - [Resend](https://resend.com) (email)
  - [OpenAI](https://platform.openai.com) (AI)
  - [Trigger.dev](https://trigger.dev) (background tasks)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd audio-notes
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in each variable — see the sections below for where to get them.

### 3. Set up Convex

Run the Convex dev server — it will prompt you to create a project on first run and automatically set `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in your `.env.local`:

```bash
npx convex dev
```

This also pushes the schema and generates the TypeScript client.

### 4. Set up Resend

1. Create a [Resend](https://resend.com) account and get your API key → `RESEND_API_KEY`
2. Add and verify a domain for inbound emails (e.g., `inbound.yourdomain.com`) → `RESEND_INBOUND_DOMAIN`
3. Configure a webhook in Resend pointing to `https://<your-app-url>/api/webhook/resend` for the `email.received` event

> **Local development:** You'll need a tunnel (e.g., [ngrok](https://ngrok.com)) to expose your local server so Resend can deliver webhooks. Set `NEXT_PUBLIC_APP_URL` to your tunnel URL.

### 5. Set up OpenAI

Get an API key from [OpenAI](https://platform.openai.com/api-keys) → `OPENAI_API_KEY`. Your account needs access to the Whisper and GPT-4o-mini models.

### 6. Set up Trigger.dev

1. Create a project in your [Trigger.dev dashboard](https://cloud.trigger.dev)
2. Copy your secret key → `TRIGGER_SECRET_KEY`
3. Update the project ID in `trigger.config.ts` to match your Trigger.dev project

### 7. Run the app

You need three terminals:

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Convex dev server
npx convex dev

# Terminal 3: Trigger.dev dev server
npx trigger.dev@latest dev
```

Open [http://localhost:3000](http://localhost:3000) to create your first inbound email address.

## Usage

1. Open the app and create an inbound email address
2. Optionally configure allowed senders (domains or email addresses) — if left empty, all senders are accepted
3. Send an email with an audio attachment to the inbound address
4. Receive a reply with the transcription, summary, action items, key points, dates, and people mentioned

## Project Structure

```
convex/
├── schema.ts              # Database schema
└── inboundEmails.ts       # Queries & mutations
src/
├── app/
│   ├── api/webhook/resend/   # Inbound email webhook
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # UI components
├── lib/
│   ├── actions.ts            # Server actions
│   └── config.ts             # Sender validation
└── trigger/
    └── process-audio-email.ts # Audio processing task
```

## Local Development

Since Resend delivers emails via webhook, you need a public URL for your local server.

### 1. Start a tunnel

Use [ngrok](https://ngrok.com) (or any tunnel service) to expose port 3000:

```bash
ngrok http 3000
```

Copy the forwarding URL (e.g., `https://abc123.ngrok.io`).

### 2. Configure for local dev

Set `NEXT_PUBLIC_APP_URL` in your `.env` to the ngrok URL, then configure a Resend webhook pointing to `https://<ngrok-url>/api/webhook/resend` for the `email.received` event.

### 3. Run all three servers

```bash
# Terminal 1
npm run dev

# Terminal 2
npx convex dev

# Terminal 3
npx trigger.dev@latest dev
```

### 4. Test the flow

1. Open [http://localhost:3000](http://localhost:3000) and create an inbound email address
2. Send an email with an audio attachment to that address
3. Watch the Trigger.dev dev server logs for task execution
4. Check your inbox for the processed reply

## Deploying

Deploy to Vercel for the simplest setup. Make sure to:

1. Set all environment variables in your Vercel project settings
2. Deploy your Convex project to production (`npx convex deploy`)
3. Configure the Resend webhook URL to your production domain
4. Deploy your Trigger.dev project to production (`npx trigger.dev@latest deploy`)

## License

MIT
