import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Astro build output. Run `npm run build` at repo root to populate it.
const ROOT = path.resolve(__dirname, '..', 'dist');

const {
  PORT = 3000,
  NODE_ENV = 'development',
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  ALLOWED_ORIGIN = '',
  TRUST_PROXY = '0',
} = process.env;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('FATAL: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set.');
  process.exit(1);
}

const MIN_FILL_MS = 2000;
const MAX_NAME = 80;
const MAX_CONTACT = 120;
const MAX_MESSAGE = 1500;
const MAX_FORMAT = 30;

const CONTROL_CHARS = new RegExp(
  '[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]',
  'g',
);

function sanitize(v, max) {
  if (typeof v !== 'string') return '';
  return v.replace(CONTROL_CHARS, '').trim().slice(0, max);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const app = express();
if (TRUST_PROXY === '1') app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'img-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use('/submit', (req, res, next) => {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGIN) {
    if (origin && origin !== ALLOWED_ORIGIN) {
      return res.status(403).json({ ok: false, error: 'Forbidden origin' });
    }
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

app.use('/submit', express.json({ limit: '4kb' }));

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests' },
});

app.post('/submit', submitLimiter, async (req, res) => {
  try {
    const body = req.body || {};

    if (typeof body.website === 'string' && body.website.length > 0) {
      return res.json({ ok: true });
    }

    const ts = Number(body.ts);
    if (!Number.isFinite(ts) || Date.now() - ts < MIN_FILL_MS) {
      return res.json({ ok: true });
    }

    // 152-ФЗ consent is mandatory before processing PD.
    if (body.consent !== true) {
      return res.status(400).json({ ok: false, error: 'Consent required' });
    }

    const name = sanitize(body.name, MAX_NAME);
    const contact = sanitize(body.contact, MAX_CONTACT);
    if (!name || !contact) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }
    const message = sanitize(body.message, MAX_MESSAGE);
    const format = sanitize(body.format, MAX_FORMAT);

    const NL = '\n';
    const consentStamp = new Date(ts).toISOString();
    const text =
      '<b>Новая заявка — Renchik.physics</b>' +
      NL + '<b>Имя:</b> ' + escapeHtml(name) +
      NL + '<b>Контакт:</b> ' + escapeHtml(contact) +
      (format ? NL + '<b>Формат:</b> ' + escapeHtml(format) : '') +
      (message ? NL + '<b>Комментарий:</b> ' + escapeHtml(message) : '') +
      NL + '<i>Согласие на обработку ПД получено: ' + escapeHtml(consentStamp) + '</i>';

    const tgRes = await fetch(
      'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      },
    );

    if (!tgRes.ok) {
      const detail = await tgRes.text().catch(() => '');
      console.error('[telegram]', tgRes.status, detail.slice(0, 300));
      return res.status(502).json({ ok: false, error: 'Upstream error' });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('[submit]', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.use(express.static(ROOT, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

app.listen(PORT, () => {
  console.log('Renchik.physics server listening on :' + PORT + ' (' + NODE_ENV + ')');
});
