import https from 'node:https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

/**
 * Build an http.Agent for the configured proxy URL, or undefined if no proxy.
 *
 * Accepted schemes:
 *   - http://user:pass@host:port      → HTTPS-over-HTTP CONNECT tunnel
 *   - https://user:pass@host:port     → same, but TLS to the proxy
 *   - socks5://user:pass@host:port    → SOCKS5 (preferred for circumvention)
 *   - socks4://host:port              → SOCKS4
 */
export function buildProxyAgent(proxyUrl) {
  if (!proxyUrl) return undefined;
  const url = proxyUrl.trim();
  if (!url) return undefined;

  if (url.startsWith('socks://') || url.startsWith('socks4://') || url.startsWith('socks5://')) {
    return new SocksProxyAgent(url);
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return new HttpsProxyAgent(url);
  }
  throw new Error('Unsupported TELEGRAM_PROXY_URL scheme: ' + url);
}

/**
 * Send a message via Telegram Bot API, optionally through a proxy.
 * Resolves with { ok, status, body } regardless of HTTP outcome — only network
 * errors reject the promise.
 */
export function sendTelegramMessage({ token, chatId, text, proxyAgent, timeoutMs = 10000 }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: '/bot' + token + '/sendMessage',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: timeoutMs,
    };
    if (proxyAgent) options.agent = proxyAgent;

    const req = https.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          body,
        });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Telegram request timed out after ' + timeoutMs + 'ms'));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
