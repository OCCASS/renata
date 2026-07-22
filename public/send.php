<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// ============================================================
// ПРАВИМ ТОЛЬКО ЭТОТ БЛОК:
// ============================================================
const TG_TOKEN       = 'PUT_BOT_TOKEN_HERE';
const TG_CHATS       = ['PUT_CHAT_ID_HERE'];          // можно несколько: ['111', '-1002...']
const ALLOWED_ORIGIN = 'https://renchik-physics.ru';  // '' — отключить проверку
const TRUST_PROXY    = false;                         // true, если перед Apache есть CDN/прокси (тогда IP берётся из X-Forwarded-For)
// ============================================================

const MIN_FILL_MS    = 2000;
const MAX_BODY_BYTES = 4096;
const MAX_NAME       = 80;
const MAX_CONTACT    = 120;
const MAX_MESSAGE    = 1500;
const MAX_FORMAT     = 30;
const MAX_PAGE       = 200;

const RATE_WINDOW    = 3600;
const RATE_LIMIT     = 5;

const TG_TIMEOUT_SEC = 10;

// ---------- Хелперы ----------
function json_out(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

// server.js:56-61 — только &, <, > (Telegram HTML mode)
function escape_html(string $s): string {
    return str_replace(['&', '<', '>'], ['&amp;', '&lt;', '&gt;'], $s);
}

// server.js:46-54 — режем control-символы, trim, обрезаем по длине
function sanitize($v, int $max): string {
    if (!is_string($v)) return '';
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v);
    if ($v === null) return '';
    return mb_substr(trim($v), 0, $max, 'UTF-8');
}

function client_ip(): string {
    if (TRUST_PROXY) {
        $xff = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
        if ($xff !== '') return trim(explode(',', $xff)[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// server.js:35-38 — без токена/чатов работать нельзя
function assert_config(): void {
    if (!is_string(TG_TOKEN) || TG_TOKEN === '' || TG_TOKEN === 'PUT_BOT_TOKEN_HERE') {
        error_log('[send.php] FATAL: TG_TOKEN is not set');
        json_out(500, ['ok' => false, 'error' => 'Server misconfigured']);
    }
    if (!is_array(TG_CHATS) || count(TG_CHATS) === 0 || in_array('PUT_CHAT_ID_HERE', TG_CHATS, true)) {
        error_log('[send.php] FATAL: TG_CHATS is not set');
        json_out(500, ['ok' => false, 'error' => 'Server misconfigured']);
    }
}

// Файловый rate-limit (5 req/h/IP) — аналог express-rate-limit (server.js:97-103)
function check_rate_limit(string $ip): bool {
    $dir = __DIR__ . '/_rate';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
        @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
        @file_put_contents($dir . '/index.html', '');
    }
    $file = $dir . '/' . substr(sha1($ip), 0, 16);
    $now = time();
    $hits = [];
    $fp = @fopen($file, 'c+');
    if ($fp === false) return true; // не получилось — пропускаем, чтобы не блокировать всех при проблемах с FS
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return true;
    }
    $prev = stream_get_contents($fp);
    if (is_string($prev) && $prev !== '') {
        foreach (explode("\n", trim($prev)) as $t) {
            $t = (int)$t;
            if ($t > $now - RATE_WINDOW) $hits[] = $t;
        }
    }
    if (count($hits) >= RATE_LIMIT) {
        flock($fp, LOCK_UN);
        fclose($fp);
        return false;
    }
    $hits[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, implode("\n", $hits));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

// server.js + telegram.js — POST на api.telegram.org, parse_mode=HTML, disable_web_page_preview
function send_telegram(string $chatId, string $text): array {
    $payload = json_encode([
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true,
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => 'https://api.telegram.org/bot' . TG_TOKEN . '/sendMessage',
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => TG_TIMEOUT_SEC,
        CURLOPT_CONNECTTIMEOUT => TG_TIMEOUT_SEC,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $resp = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($resp === false) {
        return ['ok' => false, 'status' => 0, 'body' => 'curl: ' . $err];
    }
    $decoded = json_decode((string)$resp, true);
    $ok = $status >= 200 && $status < 300 && is_array($decoded) && !empty($decoded['ok']);
    return ['ok' => $ok, 'status' => $status, 'body' => (string)$resp];
}

// ---------- Главная обработка (в try/catch, как server.js:106-156) ----------
try {
    // CORS / preflight — server.js:80-93. Ставим заголовки ДО любых проверок,
    // иначе браузер на 500/403 увидит "blocked by CORS" вместо настоящей ошибки.
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (ALLOWED_ORIGIN !== '') {
        if ($origin !== '' && $origin !== ALLOWED_ORIGIN) {
            json_out(403, ['ok' => false, 'error' => 'Forbidden origin']);
        }
        header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        json_out(405, ['ok' => false, 'error' => 'Method Not Allowed']);
    }

    assert_config();

    // Body — server.js:95 (express.json limit 4kb)
    $raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
    if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
        json_out(413, ['ok' => false, 'error' => 'Body too large']);
    }
    $data = json_decode((string)$raw, true);
    if (!is_array($data)) {
        json_out(400, ['ok' => false, 'error' => 'Invalid JSON']);
    }

    // Honeypot — server.js:109-111 (молча 200, чтобы спамеры не подбирали)
    if (isset($data['website']) && is_string($data['website']) && $data['website'] !== '') {
        json_out(200, ['ok' => true]);
    }

    // Time-trap — server.js:113-116
    $ts = is_numeric($data['ts'] ?? null) ? (int)$data['ts'] : 0;
    if ($ts <= 0 || (int)(microtime(true) * 1000) - $ts < MIN_FILL_MS) {
        json_out(200, ['ok' => true]);
    }

    // Согласие 152-ФЗ — server.js:118-121
    if (($data['consent'] ?? false) !== true) {
        json_out(400, ['ok' => false, 'error' => 'Consent required']);
    }

    // Rate-limit — server.js:97-103 (ставим ДО трогания PD, чтобы не плодить логи)
    if (!check_rate_limit(client_ip())) {
        json_out(429, ['ok' => false, 'error' => 'Too many requests']);
    }

    // Sanitize — server.js:123-129
    $name    = sanitize($data['name']    ?? '', MAX_NAME);
    $contact = sanitize($data['contact'] ?? '', MAX_CONTACT);
    if ($name === '' || $contact === '') {
        json_out(400, ['ok' => false, 'error' => 'Missing required fields']);
    }
    $message = sanitize($data['message'] ?? '', MAX_MESSAGE);
    $format  = sanitize($data['format']  ?? '', MAX_FORMAT);

    // Текст — точно как server.js:131-139
    $consentStamp = gmdate('Y-m-d\TH:i:s.', (int)($ts / 1000)) . sprintf('%03dZ', $ts % 1000);
    $NL = "\n";
    $text  = '<b>Новая заявка — Renchik.physics</b>';
    $text .= $NL . '<b>Имя:</b> '     . escape_html($name);
    $text .= $NL . '<b>Контакт:</b> ' . escape_html($contact);
    if ($format !== '') {
        $text .= $NL . '<b>Формат:</b> ' . escape_html($format);
    }
    if ($message !== '') {
        $text .= $NL . '<b>Комментарий:</b> ' . escape_html($message);
    }
    $text .= $NL . '<i>Согласие на обработку ПД получено: ' . escape_html($consentStamp) . '</i>';

    // Отправка — server.js:141-151. Считаем успехом, если хотя бы один чат принял.
    $anySuccess = false;
    foreach (TG_CHATS as $chatId) {
        $res = send_telegram((string)$chatId, $text);
        if ($res['ok']) {
            $anySuccess = true;
        } else {
            error_log('[telegram] ' . $res['status'] . ' ' . substr($res['body'], 0, 300));
        }
    }

    if (!$anySuccess) {
        json_out(502, ['ok' => false, 'error' => 'Upstream error']);
    }
    json_out(200, ['ok' => true]);

} catch (Throwable $e) {
    error_log('[submit] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    json_out(500, ['ok' => false, 'error' => 'Server error']);
}
