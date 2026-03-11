# Audio Notes

Send audio files via email, get back AI-powered transcriptions and summaries.

**How it works:**
1. Create an inbound email address
2. Send it an audio attachment
3. Get back a transcription, summary, and action items

## Tech Stack

Next.js 16 · Convex · OpenAI Whisper · GPT-5.1 Thinking (via Vercel AI Gateway) · Resend · Trigger.dev

## Setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd audio-notes
   npm install
   ```

2. **Copy env vars** — `cp .env.example .env` and fill in your keys

3. **Start Convex** — `npx convex dev` (creates your project on first run)

4. **Set up Resend** — create an account, verify an inbound domain, and point a webhook to `/api/webhook/resend` for the `email.received` event

5. **Set up OpenAI** — get an API key with access to Whisper

6. **Set up Trigger.dev** — create a project, copy your secret key, and update the project ID in `trigger.config.ts`

7. **Run the app** (three terminals):
   ```bash
   npm run dev                  # Next.js
   npx convex dev               # Convex
   npx trigger.dev@latest dev   # Trigger.dev
   ```

## Local Development

Resend needs to reach your webhook, so you'll need a tunnel:

```bash
ngrok http 3000
```

Set `NEXT_PUBLIC_APP_URL` to the ngrok URL and point your Resend webhook there.

## Deploying

1. Set all env vars in your hosting provider
2. `npx convex deploy`
3. `npx trigger.dev@latest deploy`
4. Point Resend webhook to your production URL

## License

MIT
