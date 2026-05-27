# Renchik.physics — server

Small Node.js server that hosts the static site (`index.html`, `images/`,
`uploads/`) and securely forwards contact-form submissions to Telegram.

## Security at a glance

- Bot token & chat id live in `.env`, never reach the browser.
- `helmet` sets CSP and standard security headers.
- Same-origin in production; `ALLOWED_ORIGIN` allowlist for CORS.
- 4 KB JSON body cap; control characters stripped; field lengths capped.
- Honeypot field + 2-second time-trap re-verified server-side.
- Rate limit: 5 submissions / hour / IP.
- HTML-escaped output before sending to Telegram.
- Errors from the Telegram API are logged, never echoed to the client.

## Run locally

```sh
cd server
cp .env.example .env       # then edit the token + chat id
npm install
npm run dev                # auto-restart on file changes
```

Open `http://localhost:3000/` — the form posts to `/submit` on the same
origin.

## Run in production

```sh
# 1. Build the Astro site at the repo root → dist/
npm ci
npm run build

# 2. Start the server (serves ../dist/ + /submit)
cd server
npm ci --omit=dev
NODE_ENV=production npm start
```

Typical layout: nginx terminates TLS and proxies `/` to `localhost:3000`,
with `TRUST_PROXY=1` and `ALLOWED_ORIGIN=https://renchik.example` in `.env`.

Use a process manager — `systemd`, `pm2`, or Docker — to keep the node
process alive across reboots.

## Setting up the Telegram bot

1. Open `@BotFather` in Telegram, send `/newbot`, follow prompts, copy the
   token into `TELEGRAM_BOT_TOKEN`.
2. From your account, send any message to the new bot (otherwise it can't
   message you first).
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser —
   find the `chat.id` in the JSON and put it in `TELEGRAM_CHAT_ID`.
4. To deliver into a group/channel: add the bot as an admin, send a
   message in the group, then read the negative `chat.id` from
   `getUpdates`.

## API contract

`POST /submit` — JSON body:

```json
{
  "name":    "string, required, <= 80 chars",
  "contact": "string, required, <= 120 chars",
  "format":  "string, optional, <= 30 chars",
  "message": "string, optional, <= 1500 chars",
  "ts":      "number, ms epoch when the form was loaded (time-trap)",
  "website": "string, must be empty (honeypot)"
}
```

Responses are always JSON: `{ ok: true }` on success, `{ ok: false,
error: "..." }` otherwise. Honeypot/time-trap trips return `ok: true` on
purpose so spammers can't tune their retries.
