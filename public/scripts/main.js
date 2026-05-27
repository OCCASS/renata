/* ------------------------------------------------------------------
 * Renchik.physics — site script.
 * Cookie consent → Yandex.Metrika → animations + form submission.
 * ------------------------------------------------------------------ */

/* === CONFIG: replace YM_COUNTER_ID with your real Yandex.Metrika id.
 *    Until it is a positive number, Metrika is fully disabled. === */
const YM_COUNTER_ID = 0;          // <-- TODO: set when counter is registered
const CONSENT_KEY = 'consent.cookies.v1';
const CONSENT_VERSION = 1;

/* ---------- Cookie consent state ---------- */
const Consent = {
  read() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== CONSENT_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  },
  write(status) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        status, version: CONSENT_VERSION, ts: Date.now(),
      }));
    } catch {/* localStorage may be disabled */}
  },
  accepted() {
    const s = Consent.read();
    return !!s && s.status === 'accepted';
  },
};

/* ---------- Yandex.Metrika loader ---------- */
function loadYandexMetrika() {
  if (!Number.isInteger(YM_COUNTER_ID) || YM_COUNTER_ID <= 0) return;
  if (window.ym) return;
  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    for (let j = 0; j < e.scripts.length; j++) {
      if (e.scripts[j].src === r) return;
    }
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1; k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

  window.ym(YM_COUNTER_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    defer: false,
  });
}

/* ---------- Cookie banner UI ---------- */
const CookieBanner = (() => {
  const el = document.getElementById('cookie-banner');
  if (!el) return { open() {}, close() {} };

  const open = () => {
    el.hidden = false;
    // next tick so the transition runs
    requestAnimationFrame(() => el.classList.add('is-shown'));
  };
  const close = () => {
    el.classList.remove('is-shown');
    setTimeout(() => { el.hidden = true; }, 600);
  };

  el.addEventListener('click', (e) => {
    const target = e.target.closest('[data-cookie]');
    if (!target) return;
    const action = target.dataset.cookie;
    if (action === 'accept') {
      Consent.write('accepted');
      loadYandexMetrika();
      close();
    } else if (action === 'reject') {
      Consent.write('rejected');
      close();
    }
  });

  // Footer "Управление cookie" button.
  document.querySelectorAll('[data-cookie="open"]').forEach(btn => {
    btn.addEventListener('click', () => open());
  });

  return { open, close };
})();

(function initConsent() {
  const state = Consent.read();
  if (!state) {
    // First visit — show banner. Defer a tick so the page is visible first.
    setTimeout(() => CookieBanner.open(), 600);
  } else if (state.status === 'accepted') {
    loadYandexMetrika();
  }
})();

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-btn');
  const ans = item.querySelector('.faq-answer');
  if (!btn || !ans) return;
  btn.addEventListener('click', () => {
    const open = item.classList.contains('is-open');
    document.querySelectorAll('.faq-item.is-open').forEach(other => {
      if (other !== item) {
        other.classList.remove('is-open');
        other.querySelector('.faq-answer').style.maxHeight = '0px';
        other.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
      }
    });
    if (open) {
      item.classList.remove('is-open');
      ans.style.maxHeight = '0px';
      btn.setAttribute('aria-expanded', 'false');
    } else {
      item.classList.add('is-open');
      ans.style.maxHeight = ans.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});
const firstFaq = document.querySelector('.faq-item');
if (firstFaq) firstFaq.querySelector('.faq-btn').click();

/* ---------- Format card → preselect format in form ---------- */
document.querySelectorAll('[data-fmt]').forEach(link => {
  link.addEventListener('click', () => {
    const v = link.dataset.fmt;
    const radio = document.querySelector(`input[name="format"][value="${v}"]`);
    if (radio) radio.checked = true;
  });
});

/* ---------- Form submit ---------- */
const form = document.getElementById('signup-form');
if (form) {
  const formLoadedAt = Date.now();
  const showFormError = (msg) => {
    const el = form.querySelector('.form-error');
    el.textContent = msg;
    el.classList.add('is-shown');
  };
  const clearFormError = () => {
    const el = form.querySelector('.form-error');
    el.textContent = '';
    el.classList.remove('is-shown');
  };

  const consentEl = form.querySelector('#f-consent');
  const consentLabel = form.querySelector('.consent');
  if (consentEl && consentLabel) {
    consentEl.addEventListener('change', () => {
      if (consentEl.checked) consentLabel.classList.remove('is-invalid');
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormError();

    const name = form.querySelector('#f-name').value.trim();
    const contact = form.querySelector('#f-contact').value.trim();
    const message = form.querySelector('#f-msg').value.trim();
    const format = (form.querySelector('input[name="format"]:checked') || {}).value || '';
    const honeypot = form.querySelector('#f-website').value;
    const consent = !!(consentEl && consentEl.checked);

    if (honeypot) {
      form.classList.add('is-sent');
      return;
    }
    if (Date.now() - formLoadedAt < 2000) {
      form.classList.add('is-sent');
      return;
    }
    if (!consent) {
      consentLabel && consentLabel.classList.add('is-invalid');
      showFormError('Нужно согласие на обработку персональных данных, чтобы отправить заявку.');
      consentEl && consentEl.focus();
      return;
    }
    if (!name || !contact) {
      if (!name) form.querySelector('#f-name').focus();
      else form.querySelector('#f-contact').focus();
      return;
    }

    const endpoint = form.dataset.endpoint;
    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;

    try {
      if (!endpoint) throw new Error('Endpoint is not configured.');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, contact, message, format,
          consent,
          website: honeypot,
          ts: formLoadedAt,
          page: location.href,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error('HTTP ' + res.status + ' ' + txt);
      }
      form.classList.add('is-sent');
      if (Consent.accepted() && window.ym) {
        window.ym(YM_COUNTER_ID, 'reachGoal', 'form_submit');
      }
    } catch (err) {
      console.error('Form submit failed:', err);
      showFormError('Не получилось отправить. Напишите, пожалуйста, в Telegram @renchikik.');
      submitBtn.disabled = false;
    }
  });
}

/* ---------- Reduced motion guard ---------- */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Scroll Reveal (IntersectionObserver) ---------- */
if ('IntersectionObserver' in window && !prefersReduced) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.sr, .sr-stagger').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.sr, .sr-stagger').forEach(el => el.classList.add('in-view'));
}

/* ---------- Animated stat counter ---------- */
const statEls = document.querySelectorAll('.stat-num');
const animateCount = (el) => {
  const finalHTML = el.innerHTML;
  const raw = el.textContent.trim();
  const m = raw.match(/^(\d+)/);
  if (!m) return;
  const target = parseInt(m[1], 10);
  const suffix = raw.slice(m[1].length);

  const rect = el.getBoundingClientRect();
  el.style.display = 'inline-block';
  el.style.minWidth = rect.width + 'px';
  el.style.textAlign = 'left';

  const dur = 1400;
  const start = performance.now();
  el.classList.add('is-counting');
  const tick = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(target * eased);
    if (t < 1) {
      el.textContent = val + suffix;
      requestAnimationFrame(tick);
    } else {
      el.innerHTML = finalHTML;
      setTimeout(() => el.classList.remove('is-counting'), 400);
    }
  };
  requestAnimationFrame(tick);
};
if ('IntersectionObserver' in window && !prefersReduced) {
  const statIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  statEls.forEach(el => statIo.observe(el));
}

/* ---------- Mouse parallax on hero scene ---------- */
const scene = document.querySelector('.hero-scene');
if (scene && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
  const planet = scene.querySelector('.planet');
  const cards = scene.querySelectorAll('.h-card');
  const orbits = scene.querySelectorAll('.orbit');
  let raf = null;
  scene.addEventListener('mousemove', (e) => {
    const r = scene.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (planet) planet.style.transform = `translate(${cx * 18}px, ${cy * 18}px)`;
      cards.forEach((c, i) => {
        const k = (i + 1) * 10;
        c.style.transform = `translate(${cx * k}px, ${cy * k}px)`;
      });
      orbits.forEach((o, i) => {
        const k = (i + 1) * 4;
        o.style.transform = `translate(${cx * k}px, ${cy * k}px)`;
      });
    });
  });
  scene.addEventListener('mouseleave', () => {
    if (planet) planet.style.transform = '';
    cards.forEach(c => c.style.transform = '');
    orbits.forEach(o => o.style.transform = '');
  });
}

/* ---------- 3D tilt on format cards ---------- */
if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.fmt-card').forEach(card => {
    let raf = null;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.classList.add('is-tilt');
        card.style.transform = `perspective(1000px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-6px)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-tilt');
      card.style.transform = '';
    });
  });
}

/* ---------- Magnetic primary buttons ---------- */
if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      btn.style.transform = `translate(${x * 8}px, ${y * 6 - 2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
    btn.addEventListener('click', () => {
      btn.classList.remove('is-ripple');
      void btn.offsetWidth;
      btn.classList.add('is-ripple');
      setTimeout(() => btn.classList.remove('is-ripple'), 700);
    });
  });
}

/* ---------- Shooting stars (occasional) ---------- */
const starHost = document.querySelector('.shooting-stars');
if (starHost && !prefersReduced) {
  const spawn = () => {
    const s = document.createElement('div');
    s.className = 'shooting-star';
    s.style.setProperty('--y', (Math.random() * 60) + '%');
    s.style.setProperty('--x', (-10 - Math.random() * 10) + '%');
    s.style.setProperty('--angle', (10 + Math.random() * 20) + 'deg');
    s.style.setProperty('--dur', (1.6 + Math.random() * 1.4) + 's');
    starHost.appendChild(s);
    setTimeout(() => s.remove(), 3500);
  };
  const loop = () => {
    spawn();
    setTimeout(loop, 4000 + Math.random() * 6000);
  };
  setTimeout(loop, 2000);
}

/* ---------- Header shadow on scroll ---------- */
const hdr = document.querySelector('.hdr');
if (hdr) {
  const onScroll = () => {
    const y = window.scrollY;
    if (y > 20 && !hdr.classList.contains('is-stuck')) hdr.classList.add('is-stuck');
    else if (y <= 20 && hdr.classList.contains('is-stuck')) hdr.classList.remove('is-stuck');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
}
