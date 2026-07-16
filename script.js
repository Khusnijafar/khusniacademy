// ==========================================================================
// KHUSNI ACADEMY — script.js (v2)
// Navigasi, progres baca, tab tingkat kesulitan, mesin kuis dengan progres
// tersimpan, scroll-reveal, statistik count-up, scrollspy, checklist
// kesiapan Olimpiade, simulasi interaktif (Laboratorium Parabola &
// Lingkaran Satuan), dan render KaTeX.
// ==========================================================================

'use strict';

/* ---------- Penyimpanan aman ----------
   localStorage bisa diblokir (mode privat / iframe sandbox), jadi semua
   akses dibungkus try-catch dan situs tetap berfungsi tanpa penyimpanan. */
const KAStore = (() => {
  let ok = false;
  try {
    const k = '__ka_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    ok = true;
  } catch (e) { ok = false; }
  return {
    ok,
    get(key, fallback) {
      if (!ok) return fallback;
      try {
        const v = window.localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, val) {
      if (!ok) return;
      try { window.localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    },
    remove(key) {
      if (!ok) return;
      try { window.localStorage.removeItem(key); } catch (e) {}
    }
  };
})();

const REDUCE_MOTION = !!(window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches);

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initNavMenu();
  initNavScrolled();
  initScrollProgress();
  initBackToTop();
  initTierTabs();
  initQuizEngine();
  initScrollReveal();
  initCountUp();
  initScrollSpy();
  initChecklist();
  initUnitCircle();
  initParabola();
  initGeoAngle();
  initLimitLab();
  initMatrixLab();
  initVectorLab();
  initDataLab();
  initKatex();
});

/* ---------- Navigasi mobile ---------- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  const close = () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    links.querySelectorAll('.nav-drop.open').forEach(d => {
      d.classList.remove('open');
      const b = d.querySelector('.nav-drop-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  };

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) close();
  });
}

/* ---------- Menu dropdown navbar (bisa lebih dari satu) ---------- */
function initNavMenu() {
  const drops = Array.from(document.querySelectorAll('.nav-drop'));
  if (!drops.length) return;

  const setOpen = (drop, on) => {
    drop.classList.toggle('open', on);
    const b = drop.querySelector('.nav-drop-btn');
    if (b) b.setAttribute('aria-expanded', String(on));
  };
  const closeAll = except => drops.forEach(d => {
    if (d !== except) setOpen(d, false);
  });

  drops.forEach(drop => {
    const btn = drop.querySelector('.nav-drop-btn');
    if (!btn) return;

    // Tandai pemicu aktif bila halaman ini ada di dalam menunya
    if (drop.querySelector('a.active')) btn.classList.add('active');

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = !drop.classList.contains('open');
      closeAll(drop);
      setOpen(drop, willOpen);
    });

    drop.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drop.classList.contains('open')) {
        setOpen(drop, false);
        btn.focus();
      }
    });
  });

  // Klik di luar semua dropdown menutup semuanya
  document.addEventListener('click', e => {
    const inside = e.target && e.target.closest && e.target.closest('.nav-drop');
    if (!inside) closeAll(null);
  });
}

/* ---------- Bayangan navbar saat digulir ---------- */
function initNavScrolled() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Indikator progres baca ---------- */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress i');
  if (!bar) return;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    bar.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
  };
  document.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------- Tombol kembali ke atas ---------- */
function initBackToTop() {
  const btn = document.querySelector('.back-top');
  if (!btn) return;
  const onScroll = () => btn.classList.toggle('show', window.scrollY > 600);
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', () => {
    try {
      window.scrollTo({ top: 0, behavior: REDUCE_MOTION ? 'auto' : 'smooth' });
    } catch (e) { window.scrollTo(0, 0); }
  });
}

/* ---------- Tab tingkat kesulitan (Mudah / Sedang / Sulit) ---------- */
function initTierTabs() {
  document.querySelectorAll('[data-tier-group]').forEach(group => {
    const tabs = group.querySelectorAll('.tier-tab');
    const panels = group.querySelectorAll('.tier-panel');
    const tablist = group.querySelector('.tier-tabs');
    if (tablist) tablist.setAttribute('role', 'tablist');
    panels.forEach(p => p.setAttribute('role', 'tabpanel'));

    tabs.forEach(tab => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(tab.classList.contains('active')));
      tab.addEventListener('click', () => {
        const target = tab.dataset.tier;
        tabs.forEach(t => {
          const on = t === tab;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', String(on));
        });
        panels.forEach(p => p.classList.toggle('active', p.dataset.tier === target));
      });
    });
  });
}

/* ---------- Mesin kuis interaktif (v3: PG, PG kompleks, Benar-Salah) ---------- */
function initQuizEngine() {
  document.querySelectorAll('.quiz-card').forEach(card => {
    const qid = card.dataset.qid;
    const type = card.dataset.type || 'single';
    const key = qid ? 'ka:quiz:' + qid : null;
    const saved = key ? KAStore.get(key, null) : null;
    const panelOf = () => card.closest('.tier-panel');

    if (type === 'multi') {
      card.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
          if (card.dataset.answered === 'true') return;
          opt.classList.toggle('selected');
        });
      });
      const btn = card.querySelector('.quiz-check');
      if (btn) btn.addEventListener('click', () => {
        if (card.dataset.answered === 'true') return;
        const picked = Array.from(card.querySelectorAll('.quiz-option.selected'))
          .map(o => o.dataset.option);
        if (!picked.length) return;
        applyMulti(card, picked);
        if (key) KAStore.set(key, picked);
        refreshPanel(panelOf());
      });
      if (Array.isArray(saved) && saved.length) applyMulti(card, saved);

    } else if (type === 'tf') {
      card.querySelectorAll('.tf-row').forEach(row => {
        row.querySelectorAll('.tf-btn').forEach(b => {
          b.addEventListener('click', () => {
            if (card.dataset.answered === 'true') return;
            row.querySelectorAll('.tf-btn').forEach(x => x.classList.toggle('picked', x === b));
          });
        });
      });
      const btn = card.querySelector('.quiz-check');
      if (btn) btn.addEventListener('click', () => {
        if (card.dataset.answered === 'true') return;
        const rows = Array.from(card.querySelectorAll('.tf-row'));
        const picked = rows.map(r => {
          const b = r.querySelector('.tf-btn.picked');
          return b ? b.dataset.tf : '';
        });
        if (picked.some(p => !p)) return;
        applyTF(card, picked);
        if (key) KAStore.set(key, picked);
        refreshPanel(panelOf());
      });
      if (Array.isArray(saved) && saved.length) applyTF(card, saved);

    } else {
      card.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
          if (card.dataset.answered === 'true') return;
          applyAnswer(card, opt.dataset.option);
          if (key) KAStore.set(key, opt.dataset.option);
          refreshPanel(panelOf());
        });
      });
      if (typeof saved === 'string' && saved) applyAnswer(card, saved);
    }
  });

  document.querySelectorAll('.tier-panel').forEach(refreshPanel);

  document.querySelectorAll('.tier-reset').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.tier-panel');
      if (!panel) return;
      panel.querySelectorAll('.quiz-card').forEach(resetCard);
      refreshPanel(panel);
    });
  });
}

function showFeedback(card, isCorrect) {
  const feedback = card.querySelector('.quiz-feedback');
  if (!feedback) return;
  feedback.hidden = false;
  feedback.classList.remove('is-correct', 'is-incorrect');
  feedback.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
  const label = feedback.querySelector('strong');
  if (label) label.textContent = isCorrect ? 'Benar!' : 'Belum tepat';
}

function answerSet(card) {
  return (card.dataset.answer || '').split(',').map(s => s.trim()).filter(Boolean);
}

function applyMulti(card, picked) {
  const correct = answerSet(card);
  const chosen = new Set(picked);
  card.dataset.answered = 'true';
  const isCorrect = correct.length === chosen.size && correct.every(c => chosen.has(c));
  card.dataset.correct = String(isCorrect);

  card.querySelectorAll('.quiz-option').forEach(o => {
    o.disabled = true;
    o.classList.remove('selected');
    const inAns = correct.indexOf(o.dataset.option) !== -1;
    const took = chosen.has(o.dataset.option);
    if (inAns && took) o.classList.add('correct');
    else if (inAns) o.classList.add('reveal-correct');
    else if (took) o.classList.add('incorrect');
  });
  const btn = card.querySelector('.quiz-check');
  if (btn) btn.disabled = true;
  showFeedback(card, isCorrect);
}

function applyTF(card, picked) {
  const rows = Array.from(card.querySelectorAll('.tf-row'));
  card.dataset.answered = 'true';
  let allRight = true;

  rows.forEach((row, i) => {
    const ans = row.dataset.answer;
    const got = picked[i];
    const right = got === ans;
    if (!right) allRight = false;
    row.classList.add(right ? 'right' : 'wrong');
    row.querySelectorAll('.tf-btn').forEach(b => {
      b.disabled = true;
      b.classList.toggle('picked', b.dataset.tf === got);
      if (b.dataset.tf === ans) b.classList.add('correct');
      else if (b.dataset.tf === got) b.classList.add('incorrect');
    });
  });

  card.dataset.correct = String(allRight);
  const btn = card.querySelector('.quiz-check');
  if (btn) btn.disabled = true;
  showFeedback(card, allRight);
}

function applyAnswer(card, chosen) {
  const correct = card.dataset.answer;
  card.dataset.answered = 'true';
  const isCorrect = chosen === correct;
  card.dataset.correct = String(isCorrect);

  card.querySelectorAll('.quiz-option').forEach(o => {
    o.disabled = true;
    if (o.dataset.option === correct) {
      o.classList.add(o.dataset.option === chosen ? 'correct' : 'reveal-correct');
    } else if (o.dataset.option === chosen) {
      o.classList.add('incorrect');
    }
  });

  showFeedback(card, isCorrect);
}

function resetCard(card) {
  delete card.dataset.answered;
  delete card.dataset.correct;
  const qid = card.dataset.qid;
  if (qid) KAStore.remove('ka:quiz:' + qid);

  card.querySelectorAll('.quiz-option').forEach(o => {
    o.disabled = false;
    o.classList.remove('correct', 'incorrect', 'reveal-correct', 'selected');
  });
  card.querySelectorAll('.tf-row').forEach(r => r.classList.remove('right', 'wrong'));
  card.querySelectorAll('.tf-btn').forEach(b => {
    b.disabled = false;
    b.classList.remove('picked', 'correct', 'incorrect');
  });
  const chk = card.querySelector('.quiz-check');
  if (chk) chk.disabled = false;

  const fb = card.querySelector('.quiz-feedback');
  if (fb) {
    fb.hidden = true;
    fb.classList.remove('is-correct', 'is-incorrect');
    const s = fb.querySelector('strong');
    if (s) s.textContent = '';
  }
}

function refreshPanel(panel) {
  if (!panel) return;
  const cards = panel.querySelectorAll('.quiz-card');
  const answered = panel.querySelectorAll('.quiz-card[data-answered="true"]');
  const correctCount = panel.querySelectorAll('.quiz-card[data-correct="true"]').length;

  const scoreEl = panel.querySelector('.tier-score strong');
  if (scoreEl) scoreEl.textContent = correctCount + '/' + cards.length;

  const bar = panel.querySelector('.tier-progress i');
  if (bar) bar.style.width = (cards.length ? (answered.length / cards.length) * 100 : 0) + '%';

  const done = panel.querySelector('.tier-complete');
  if (done) {
    if (cards.length > 0 && answered.length === cards.length) {
      const s = done.querySelector('[data-final]');
      if (s) s.textContent = correctCount + ' dari ' + cards.length;
      done.hidden = false;
    } else {
      done.hidden = true;
    }
  }
}

/* ---------- Scroll reveal ---------- */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ---------- Statistik count-up ---------- */
function initCountUp() {
  const nums = document.querySelectorAll('.stat-num[data-count]');
  if (!nums.length) return;

  const run = el => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (REDUCE_MOTION || typeof requestAnimationFrame !== 'function') {
      el.textContent = target + suffix;
      return;
    }
    const dur = 900;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    nums.forEach(run);
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        run(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  nums.forEach(n => io.observe(n));
}

/* ---------- Scrollspy navigasi materi ---------- */
function initScrollSpy() {
  const nav = document.querySelector('.lesson-nav');
  if (!nav || !('IntersectionObserver' in window)) return;

  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const map = new Map();
  links.forEach(l => {
    const sec = document.querySelector(l.getAttribute('href'));
    if (sec) map.set(sec, l);
  });
  if (!map.size) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const link = map.get(en.target);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  map.forEach((_, sec) => io.observe(sec));
}

/* ---------- Checklist kesiapan (Olimpiade / TKA) ---------- */
function initChecklist() {
  document.querySelectorAll('[data-checklist]').forEach(wrap => {
    const key = 'ka:check:' + (wrap.dataset.checklist || 'default');
    const saved = KAStore.get(key, {});
    const items = wrap.querySelectorAll('.check-item input[type="checkbox"]');
    if (!items.length) return;

    const update = () => {
      let done = 0;
      items.forEach(i => {
        const li = i.closest('.check-item');
        if (li) li.classList.toggle('done', i.checked);
        if (i.checked) done++;
      });
      const count = wrap.querySelector('[data-check-count]');
      if (count) count.textContent = done + '/' + items.length;
      const bar = wrap.querySelector('.check-progress i');
      if (bar) bar.style.width = (items.length ? (done / items.length) * 100 : 0) + '%';
      const msg = wrap.querySelector('[data-check-msg]');
      if (msg) msg.hidden = done !== items.length;
    };

    items.forEach(i => {
      if (saved[i.dataset.check]) i.checked = true;
      i.addEventListener('change', () => {
        saved[i.dataset.check] = i.checked;
        KAStore.set(key, saved);
        update();
      });
    });
    update();
  });
}

/* ---------- Util SVG ---------- */
function svgEl(name, attrs, parent) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', name);
  if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

function elDiv(cls, html) {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  if (html !== undefined) d.innerHTML = html;
  return d;
}

const fmt3 = v => {
  let s = String(Math.round(v * 1000) / 1000);
  if (s === '-0') s = '0';
  return s.replace('-', '\u2212');
};

const fnum = v => {
  const r = Math.round(v * 100) / 100;
  return String(Object.is(r, -0) ? 0 : r).replace('-', '\u2212');
};

/* ==========================================================================
   SIMULASI 1 — Lingkaran Satuan Interaktif (trigonometri.html)
   ========================================================================== */
function initUnitCircle() {
  const host = document.getElementById('widget-lingkaran');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const SIZE = 340, C = 170, R = 118;

  /* --- Bangun SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + SIZE + ' ' + SIZE,
    class: 'uc-svg',
    role: 'img',
    'aria-label': 'Lingkaran satuan interaktif: seret titik untuk mengubah sudut'
  });

  svgEl('line', { x1: 14, y1: C, x2: SIZE - 14, y2: C, class: 'uc-axis' }, svg);
  svgEl('line', { x1: C, y1: 14, x2: C, y2: SIZE - 14, class: 'uc-axis' }, svg);
  [[C + R, C, '1', C + R - 4, C + 18], [C - R, C, '\u22121', C - R - 10, C + 18],
   [C, C - R, '1', C + 8, C - R + 4], [C, C + R, '\u22121', C + 8, C + R + 4]].forEach(t => {
    const vertical = t[0] === C;
    svgEl('line', vertical
      ? { x1: C - 4, y1: t[1], x2: C + 4, y2: t[1], class: 'uc-tick' }
      : { x1: t[0], y1: C - 4, x2: t[0], y2: C + 4, class: 'uc-tick' }, svg);
    const lbl = svgEl('text', { x: t[3], y: t[4], class: 'w-lbl' }, svg);
    lbl.textContent = t[2];
  });

  svgEl('circle', { cx: C, cy: C, r: R, class: 'uc-circ' }, svg);
  const arc = svgEl('path', { d: '', class: 'uc-arc' }, svg);
  const cosLine = svgEl('line', { x1: C, y1: C, x2: C, y2: C, class: 'uc-cos' }, svg);
  const sinLine = svgEl('line', { x1: C, y1: C, x2: C, y2: C, class: 'uc-sin' }, svg);
  const radLine = svgEl('line', { x1: C, y1: C, x2: C, y2: C, class: 'uc-rad' }, svg);
  const point = svgEl('circle', { cx: C, cy: C, r: 6, class: 'uc-pt' }, svg);

  /* --- Bangun kontrol --- */
  const controls = elDiv('widget-controls');
  const row = elDiv('ctrl-row');
  const lab = document.createElement('label');
  lab.textContent = 'Sudut \u03b8';
  lab.setAttribute('for', 'uc-slider');
  const out = document.createElement('output');
  row.appendChild(lab); row.appendChild(out);
  controls.appendChild(row);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0'; slider.max = '360'; slider.step = '1'; slider.value = '45';
  slider.id = 'uc-slider';
  slider.setAttribute('aria-label', 'Sudut theta dalam derajat');
  controls.appendChild(slider);

  const chips = elDiv('chips');
  [0, 30, 45, 60, 90, 120, 135, 150, 180, 270].forEach(d => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.deg = String(d);
    b.textContent = d + '\u00b0';
    b.addEventListener('click', () => { slider.value = String(d); render(d); });
    chips.appendChild(b);
  });
  controls.appendChild(chips);

  const readout = elDiv('readout',
    '<div><span>\u03b8 (derajat)</span><b data-r="deg"></b></div>' +
    '<div><span>Radian</span><b data-r="rad"></b></div>' +
    '<div><span>sin \u03b8</span><b data-r="sin"></b></div>' +
    '<div><span>cos \u03b8</span><b data-r="cos"></b></div>' +
    '<div><span>tan \u03b8</span><b data-r="tan"></b></div>' +
    '<div><span>Kuadran</span><b data-r="quad"></b></div>');
  controls.appendChild(readout);

  const legend = elDiv('legend',
    '<span><i class="dot" style="background:var(--tier-mudah)"></i>sin \u03b8</span>' +
    '<span><i class="dot" style="background:var(--signal)"></i>cos \u03b8</span>' +
    '<span><i class="dot" style="background:var(--medal)"></i>sudut \u03b8</span>');
  controls.appendChild(legend);

  const note = elDiv('w-note');
  note.textContent = 'Geser slider, klik sudut istimewa, atau seret langsung titik emas di lingkaran. Nilai sudut istimewa ditampilkan dalam bentuk eksak.';
  controls.appendChild(note);

  const body = elDiv('widget-body');
  const canvas = elDiv('widget-canvas');
  canvas.appendChild(svg);
  body.appendChild(canvas);
  body.appendChild(controls);
  mount.innerHTML = '';
  mount.appendChild(body);

  const q = sel => readout.querySelector(sel);

  /* --- Nilai eksak sudut istimewa --- */
  function exactTrig(deg) {
    const d = ((Math.round(deg) % 360) + 360) % 360;
    if (d % 30 !== 0 && d % 45 !== 0) return null;
    let ref;
    if (d <= 90) ref = d;
    else if (d <= 180) ref = 180 - d;
    else if (d <= 270) ref = d - 180;
    else ref = 360 - d;
    const base = {
      0: ['0', '1', '0'],
      30: ['1/2', '\u221a3/2', '\u221a3/3'],
      45: ['\u221a2/2', '\u221a2/2', '1'],
      60: ['\u221a3/2', '1/2', '\u221a3'],
      90: ['1', '0', '']
    }[ref];
    if (!base) return null;
    const sinPos = d > 0 && d < 180;
    const cosPos = d < 90 || d > 270;
    const sign = (str, pos) => (str === '0' ? '0' : (pos ? '' : '\u2212') + str);
    const s = sign(base[0], sinPos);
    const c = sign(base[1], cosPos);
    let t;
    if (ref === 90) t = 'tak terdefinisi';
    else if (base[2] === '0') t = '0';
    else t = (sinPos === cosPos ? '' : '\u2212') + base[2];
    return { s: s, c: c, t: t };
  }

  function radLabel(deg) {
    const raw = Math.round(deg);
    if (raw === 360) return '2\u03c0';
    const d = ((raw % 360) + 360) % 360;
    if (d === 0) return '0';
    if (d % 15 === 0) {
      const g = (a, b) => (b ? g(b, a % b) : a);
      const k = g(d, 180);
      const n = d / k, m = 180 / k;
      const num = n === 1 ? '\u03c0' : n + '\u03c0';
      return m === 1 ? num : num + '/' + m;
    }
    return (d * Math.PI / 180).toFixed(2) + ' rad';
  }

  function quadLabel(deg) {
    const d = ((Math.round(deg) % 360) + 360) % 360;
    if (d % 90 === 0) return 'Pada sumbu';
    if (d < 90) return 'I \u2014 semua positif';
    if (d < 180) return 'II \u2014 sin positif';
    if (d < 270) return 'III \u2014 tan positif';
    return 'IV \u2014 cos positif';
  }

  function arcPath(deg) {
    if (deg < 1 || deg >= 360) return '';
    const r0 = 28;
    const a = deg * Math.PI / 180;
    const ex = C + r0 * Math.cos(a);
    const ey = C - r0 * Math.sin(a);
    const large = deg > 180 ? 1 : 0;
    return 'M ' + (C + r0) + ' ' + C +
      ' A ' + r0 + ' ' + r0 + ' 0 ' + large + ' 0 ' + ex.toFixed(1) + ' ' + ey.toFixed(1);
  }

  /* --- Render --- */
  function render(deg) {
    deg = Math.max(0, Math.min(360, Math.round(deg)));
    const rad = deg * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const px = C + R * cos;
    const py = C - R * sin;

    radLine.setAttribute('x2', px.toFixed(1));
    radLine.setAttribute('y2', py.toFixed(1));
    cosLine.setAttribute('x2', px.toFixed(1));
    sinLine.setAttribute('x1', px.toFixed(1));
    sinLine.setAttribute('y1', C);
    sinLine.setAttribute('x2', px.toFixed(1));
    sinLine.setAttribute('y2', py.toFixed(1));
    point.setAttribute('cx', px.toFixed(1));
    point.setAttribute('cy', py.toFixed(1));
    arc.setAttribute('d', arcPath(deg));

    out.textContent = deg + '\u00b0';
    q('[data-r="deg"]').textContent = deg + '\u00b0';
    q('[data-r="rad"]').textContent = radLabel(deg);

    const exact = exactTrig(deg);
    if (exact) {
      q('[data-r="sin"]').textContent = exact.s;
      q('[data-r="cos"]').textContent = exact.c;
      q('[data-r="tan"]').textContent = exact.t;
    } else {
      q('[data-r="sin"]').textContent = fmt3(sin);
      q('[data-r="cos"]').textContent = fmt3(cos);
      q('[data-r="tan"]').textContent = Math.abs(cos) < 1e-4 ? 'tak terdefinisi' : fmt3(Math.tan(rad));
    }
    q('[data-r="quad"]').textContent = quadLabel(deg);

    chips.querySelectorAll('.chip').forEach(ch => {
      ch.classList.toggle('active', Number(ch.dataset.deg) === (deg % 360));
    });
  }

  slider.addEventListener('input', () => render(Number(slider.value)));

  /* --- Seret titik di lingkaran --- */
  let dragging = false;
  const fromPointer = e => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const x = (e.clientX - rect.left) * (SIZE / rect.width);
    const y = (e.clientY - rect.top) * (SIZE / rect.height);
    let deg = Math.atan2(C - y, x - C) * 180 / Math.PI;
    deg = Math.round(((deg % 360) + 360) % 360);
    for (let s = 0; s <= 360; s += 15) {
      if (Math.abs(deg - s) <= 4) { deg = s % 360; break; }
    }
    slider.value = String(deg);
    render(deg);
  };
  svg.addEventListener('pointerdown', e => {
    dragging = true;
    try { svg.setPointerCapture(e.pointerId); } catch (err) {}
    fromPointer(e);
    e.preventDefault();
  });
  svg.addEventListener('pointermove', e => { if (dragging) fromPointer(e); });
  ['pointerup', 'pointercancel'].forEach(ev =>
    svg.addEventListener(ev, () => { dragging = false; }));

  render(45);
}

/* ==========================================================================
   SIMULASI 2 — Laboratorium Parabola (aljabar.html)
   ========================================================================== */
function initParabola() {
  const host = document.getElementById('widget-parabola');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const W = 360, H = 300, PAD = 24;
  const XMIN = -6, XMAX = 6, YMIN = -8, YMAX = 8;
  const px = x => PAD + (x - XMIN) / (XMAX - XMIN) * (W - 2 * PAD);
  const py = y => PAD + (YMAX - y) / (YMAX - YMIN) * (H - 2 * PAD);

  /* --- Bangun SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + W + ' ' + H,
    class: 'pb-svg',
    role: 'img',
    'aria-label': 'Grafik interaktif fungsi kuadrat y = ax kuadrat + bx + c'
  });

  for (let x = XMIN; x <= XMAX; x++) {
    if (x !== 0) svgEl('line', { x1: px(x), y1: PAD, x2: px(x), y2: H - PAD, class: 'pb-grid' }, svg);
  }
  for (let y = YMIN; y <= YMAX; y += 2) {
    if (y !== 0) svgEl('line', { x1: PAD, y1: py(y), x2: W - PAD, y2: py(y), class: 'pb-grid' }, svg);
  }
  svgEl('line', { x1: PAD, y1: py(0), x2: W - PAD, y2: py(0), class: 'pb-axis' }, svg);
  svgEl('line', { x1: px(0), y1: PAD, x2: px(0), y2: H - PAD, class: 'pb-axis' }, svg);
  [['x', W - 16, py(0) - 7], ['y', px(0) + 9, PAD + 8],
   ['5', px(5) - 3, py(0) + 14], ['\u22125', px(-5) - 8, py(0) + 14],
   ['5', px(0) - 16, py(5) + 3], ['\u22125', px(0) - 22, py(-5) + 3]].forEach(t => {
    const lbl = svgEl('text', { x: t[1], y: t[2], class: 'w-lbl' }, svg);
    lbl.textContent = t[0];
  });

  const defs = svgEl('defs', {}, svg);
  const clip = svgEl('clipPath', { id: 'pb-clip' }, defs);
  svgEl('rect', { x: PAD, y: PAD, width: W - 2 * PAD, height: H - 2 * PAD }, clip);

  const plotG = svgEl('g', { 'clip-path': 'url(#pb-clip)' }, svg);
  const curve = svgEl('path', { d: '', class: 'pb-curve' }, plotG);
  const root1 = svgEl('circle', { r: 5, class: 'pb-root', display: 'none' }, plotG);
  const root2 = svgEl('circle', { r: 5, class: 'pb-root', display: 'none' }, plotG);
  const vertex = svgEl('circle', { r: 5, class: 'pb-vertex', display: 'none' }, plotG);

  /* --- Bangun kontrol --- */
  const controls = elDiv('widget-controls');
  const sliders = {};
  [['a', -3, 3, 0.5, 1], ['b', -6, 6, 0.5, -1], ['c', -8, 8, 0.5, -6]].forEach(cfg => {
    const name = cfg[0];
    const row = elDiv('ctrl-row');
    const lab = document.createElement('label');
    lab.textContent = 'Koefisien ' + name;
    lab.setAttribute('for', 'pb-' + name);
    const out = document.createElement('output');
    row.appendChild(lab); row.appendChild(out);
    controls.appendChild(row);

    const s = document.createElement('input');
    s.type = 'range';
    s.min = String(cfg[1]); s.max = String(cfg[2]);
    s.step = String(cfg[3]); s.value = String(cfg[4]);
    s.id = 'pb-' + name;
    s.setAttribute('aria-label', 'Koefisien ' + name);
    controls.appendChild(s);
    sliders[name] = { input: s, out: out };
    s.addEventListener('input', render);
  });

  const chips = elDiv('chips');
  [['x\u00b2 \u2212 x \u2212 6', 1, -1, -6],
   ['x\u00b2 \u2212 4x + 4', 1, -4, 4],
   ['x\u00b2 + 2x + 5', 1, 2, 5],
   ['\u2212\u00bdx\u00b2 + 2x + 3', -0.5, 2, 3]].forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = p[0];
    b.dataset.abc = p[1] + ',' + p[2] + ',' + p[3];
    b.addEventListener('click', () => {
      sliders.a.input.value = String(p[1]);
      sliders.b.input.value = String(p[2]);
      sliders.c.input.value = String(p[3]);
      render();
    });
    chips.appendChild(b);
  });
  controls.appendChild(chips);

  const readout = elDiv('readout',
    '<div class="full"><span>Persamaan</span><b data-r="eq"></b></div>' +
    '<div><span>Diskriminan D = b\u00b2 \u2212 4ac</span><b data-r="D"></b>' +
    '<div class="disc-badge" data-r="badge" hidden></div></div>' +
    '<div><span>Titik puncak</span><b data-r="vertex"></b></div>' +
    '<div class="full"><span>Akar real (titik potong sumbu-x)</span><b data-r="roots"></b></div>');
  controls.appendChild(readout);

  const legend = elDiv('legend',
    '<span><i class="dot" style="background:var(--tier-mudah)"></i>akar</span>' +
    '<span><i class="dot" style="background:var(--medal)"></i>titik puncak</span>' +
    '<span><i class="dot" style="background:var(--signal)"></i>kurva</span>');
  controls.appendChild(legend);

  const note = elDiv('w-note');
  controls.appendChild(note);

  const body = elDiv('widget-body');
  const canvas = elDiv('widget-canvas');
  canvas.appendChild(svg);
  body.appendChild(canvas);
  body.appendChild(controls);
  mount.innerHTML = '';
  mount.appendChild(body);

  const q = sel => readout.querySelector(sel);

  function eqString(a, b, c) {
    const terms = [];
    if (a !== 0) terms.push((a === 1 ? '' : a === -1 ? '\u2212' : fnum(a)) + 'x\u00b2');
    if (b !== 0) terms.push((b === 1 ? '' : b === -1 ? '\u2212' : fnum(b)) + 'x');
    if (c !== 0 || terms.length === 0) terms.push(fnum(c));
    let s = 'y = ' + terms[0];
    for (let i = 1; i < terms.length; i++) {
      const t = terms[i];
      s += t.charAt(0) === '\u2212' ? ' \u2212 ' + t.slice(1) : ' + ' + t;
    }
    return s;
  }

  function render() {
    const a = parseFloat(sliders.a.input.value);
    const b = parseFloat(sliders.b.input.value);
    const c = parseFloat(sliders.c.input.value);

    sliders.a.out.textContent = 'a = ' + fnum(a);
    sliders.b.out.textContent = 'b = ' + fnum(b);
    sliders.c.out.textContent = 'c = ' + fnum(c);

    /* Kurva */
    let d = '';
    const f = x => a * x * x + b * x + c;
    for (let x = XMIN; x <= XMAX + 1e-9; x += 0.08) {
      const yy = Math.max(-60, Math.min(60, f(x)));
      d += (d ? ' L ' : 'M ') + px(x).toFixed(1) + ' ' + py(yy).toFixed(1);
    }
    curve.setAttribute('d', d);

    q('[data-r="eq"]').textContent = eqString(a, b, c);

    const badge = q('[data-r="badge"]');
    const setMark = (el, x) => {
      if (x >= XMIN && x <= XMAX) {
        el.setAttribute('cx', px(x).toFixed(1));
        el.setAttribute('cy', py(0).toFixed(1));
        el.removeAttribute('display');
      } else {
        el.setAttribute('display', 'none');
      }
    };
    root1.setAttribute('display', 'none');
    root2.setAttribute('display', 'none');
    vertex.setAttribute('display', 'none');

    if (a === 0) {
      /* Garis lurus, bukan parabola */
      q('[data-r="D"]').textContent = '\u2014';
      badge.hidden = true;
      q('[data-r="vertex"]').textContent = '\u2014';
      if (b === 0) {
        q('[data-r="roots"]').textContent =
          c === 0 ? 'Semua nilai x memenuhi' : 'Tidak ada';
      } else {
        const r = -c / b;
        q('[data-r="roots"]').textContent = 'x = ' + fnum(r);
        setMark(root1, r);
      }
      note.textContent = 'a = 0 \u2192 grafik menjadi garis lurus y = bx + c, bukan parabola. Geser a menjauh dari 0 untuk melihat kurva kuadrat.';
      markPresets(a, b, c);
      return;
    }

    const D = b * b - 4 * a * c;
    const h = -b / (2 * a);
    const k = f(h);

    q('[data-r="D"]').textContent = fnum(D);
    badge.hidden = false;
    badge.classList.remove('pos', 'zero', 'neg');
    if (Math.abs(D) < 1e-9) {
      badge.classList.add('zero');
      badge.textContent = 'D = 0 \u00b7 akar kembar';
      q('[data-r="roots"]').textContent = 'x\u2081 = x\u2082 = ' + fnum(h);
      setMark(root1, h);
    } else if (D > 0) {
      badge.classList.add('pos');
      badge.textContent = 'D > 0 \u00b7 dua akar real';
      const sq = Math.sqrt(D);
      const r1 = (-b - sq) / (2 * a);
      const r2 = (-b + sq) / (2 * a);
      const lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      q('[data-r="roots"]').textContent = 'x\u2081 = ' + fnum(lo) + ',  x\u2082 = ' + fnum(hi);
      setMark(root1, lo);
      setMark(root2, hi);
    } else {
      badge.classList.add('neg');
      badge.textContent = 'D < 0 \u00b7 tidak ada akar real';
      q('[data-r="roots"]').textContent = 'Tidak ada (parabola tidak memotong sumbu-x)';
    }

    q('[data-r="vertex"]').textContent = '(' + fnum(h) + ', ' + fnum(k) + ')';
    if (h >= XMIN && h <= XMAX && k >= YMIN && k <= YMAX) {
      vertex.setAttribute('cx', px(h).toFixed(1));
      vertex.setAttribute('cy', py(k).toFixed(1));
      vertex.removeAttribute('display');
    }

    note.textContent = a > 0
      ? 'a > 0 \u2192 parabola terbuka ke atas; titik puncak adalah nilai minimum.'
      : 'a < 0 \u2192 parabola terbuka ke bawah; titik puncak adalah nilai maksimum.';

    markPresets(a, b, c);
  }

  function markPresets(a, b, c) {
    chips.querySelectorAll('.chip').forEach(ch => {
      const abc = ch.dataset.abc.split(',').map(Number);
      ch.classList.toggle('active', abc[0] === a && abc[1] === b && abc[2] === c);
    });
  }

  render();
}

/* ---------- Render KaTeX ---------- */
function initKatex() {
  const render = () => {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
      return true;
    }
    return false;
  };
  if (!render()) window.addEventListener('load', render);
}

/* ==========================================================================
   SIMULASI 3 — Sudut Keliling Interaktif (geometri.html)
   Seret A, B (sudut pusat) dan C (sudut keliling) pada lingkaran.
   ========================================================================== */
function initGeoAngle() {
  const host = document.getElementById('widget-sudut-keliling');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const SIZE = 340, CX = 170, CY = 170, R = 118;
  const rad = d => d * Math.PI / 180;
  const norm = d => ((d % 360) + 360) % 360;
  const px = d => CX + R * Math.cos(rad(d));
  const py = d => CY - R * Math.sin(rad(d));
  const fmtDeg = v => String(Math.round(v * 10) / 10).replace('.', ',') + '\u00b0';

  /* --- Keadaan awal: sudut pusat 120\u00b0, C di puncak --- */
  let a = 330, b = 210, c = 90;

  /* --- Bangun SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + SIZE + ' ' + SIZE,
    role: 'img',
    'aria-label': 'Simulasi sudut pusat dan sudut keliling: seret titik A, B, dan C pada lingkaran'
  });
  svgEl('circle', { cx: CX, cy: CY, r: R, class: 'uc-circ' }, svg);
  svgEl('circle', { cx: CX, cy: CY, r: 3, fill: '#33406a' }, svg);
  const oLbl = svgEl('text', { x: CX + 8, y: CY + 14, class: 'w-lbl' }, svg);
  oLbl.textContent = 'O';

  const chord = svgEl('line', { class: 'gc-chord' }, svg);
  const arcO = svgEl('path', { class: 'gc-arc-o', d: '' }, svg);
  const arcC = svgEl('path', { class: 'gc-arc-c', d: '' }, svg);
  const radA = svgEl('line', { class: 'gc-rad' }, svg);
  const radB = svgEl('line', { class: 'gc-rad' }, svg);
  const insA = svgEl('line', { class: 'gc-ins' }, svg);
  const insB = svgEl('line', { class: 'gc-ins' }, svg);
  const ptA = svgEl('circle', { r: 6, class: 'gc-pt gold' }, svg);
  const ptB = svgEl('circle', { r: 6, class: 'gc-pt gold' }, svg);
  const ptC = svgEl('circle', { r: 7, class: 'gc-pt blue' }, svg);
  const lblA = svgEl('text', { class: 'gc-lbl', 'text-anchor': 'middle' }, svg);
  const lblB = svgEl('text', { class: 'gc-lbl', 'text-anchor': 'middle' }, svg);
  const lblC = svgEl('text', { class: 'gc-lbl', 'text-anchor': 'middle' }, svg);
  lblA.textContent = 'A'; lblB.textContent = 'B'; lblC.textContent = 'C';

  /* --- Bangun kontrol --- */
  const controls = elDiv('widget-controls');

  const chips = elDiv('chips');
  [[60, '60\u00b0'], [90, '90\u00b0'], [120, '120\u00b0'], [180, '180\u00b0 (Thales)']].forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.dataset.deg = String(p[0]);
    btn.textContent = p[1];
    btn.addEventListener('click', () => {
      a = norm(270 + p[0] / 2);
      b = norm(270 - p[0] / 2);
      c = 90;
      render();
    });
    chips.appendChild(btn);
  });
  controls.appendChild(chips);

  const readout = elDiv('readout',
    '<div><span>Sudut pusat \u2220AOB</span><b data-r="pusat"></b></div>' +
    '<div><span>Sudut keliling \u2220ACB</span><b data-r="keliling"></b></div>' +
    '<div><span>Perbandingan</span><b data-r="rasio">2 : 1</b></div>' +
    '<div><span>Posisi titik C</span><b data-r="posisi"></b></div>');
  controls.appendChild(readout);

  const badgeWrap = elDiv('');
  badgeWrap.innerHTML = '<span class="disc-badge gold" data-r="badge" hidden></span>';
  controls.appendChild(badgeWrap);

  const legend = elDiv('legend',
    '<span><i class="dot" style="background:var(--medal)"></i>sudut pusat</span>' +
    '<span><i class="dot" style="background:var(--signal)"></i>sudut keliling</span>');
  legend.style.marginTop = '0.9rem';
  controls.appendChild(legend);

  const note = elDiv('w-note');
  controls.appendChild(note);

  const body = elDiv('widget-body');
  const canvas = elDiv('widget-canvas');
  canvas.appendChild(svg);
  body.appendChild(canvas);
  body.appendChild(controls);
  mount.innerHTML = '';
  mount.appendChild(body);

  const q = sel => controls.querySelector(sel);

  function arcAt(ccx, ccy, r0, startDeg, spanCCW) {
    if (spanCCW <= 0.5 || spanCCW >= 359.5) return '';
    const sx = ccx + r0 * Math.cos(rad(startDeg));
    const sy = ccy - r0 * Math.sin(rad(startDeg));
    const e2 = startDeg + spanCCW;
    const ex = ccx + r0 * Math.cos(rad(e2));
    const ey = ccy - r0 * Math.sin(rad(e2));
    const large = spanCCW > 180 ? 1 : 0;
    return 'M ' + sx.toFixed(1) + ' ' + sy.toFixed(1) +
      ' A ' + r0 + ' ' + r0 + ' 0 ' + large + ' 0 ' + ex.toFixed(1) + ' ' + ey.toFixed(1);
  }

  /* --- Render --- */
  function render() {
    const ax = px(a), ay = py(a);
    const bx = px(b), by = py(b);
    const cx2 = px(c), cy2 = py(c);

    chord.setAttribute('x1', ax.toFixed(1)); chord.setAttribute('y1', ay.toFixed(1));
    chord.setAttribute('x2', bx.toFixed(1)); chord.setAttribute('y2', by.toFixed(1));
    radA.setAttribute('x1', CX); radA.setAttribute('y1', CY);
    radA.setAttribute('x2', ax.toFixed(1)); radA.setAttribute('y2', ay.toFixed(1));
    radB.setAttribute('x1', CX); radB.setAttribute('y1', CY);
    radB.setAttribute('x2', bx.toFixed(1)); radB.setAttribute('y2', by.toFixed(1));
    insA.setAttribute('x1', cx2.toFixed(1)); insA.setAttribute('y1', cy2.toFixed(1));
    insA.setAttribute('x2', ax.toFixed(1)); insA.setAttribute('y2', ay.toFixed(1));
    insB.setAttribute('x1', cx2.toFixed(1)); insB.setAttribute('y1', cy2.toFixed(1));
    insB.setAttribute('x2', bx.toFixed(1)); insB.setAttribute('y2', by.toFixed(1));
    ptA.setAttribute('cx', ax.toFixed(1)); ptA.setAttribute('cy', ay.toFixed(1));
    ptB.setAttribute('cx', bx.toFixed(1)); ptB.setAttribute('cy', by.toFixed(1));
    ptC.setAttribute('cx', cx2.toFixed(1)); ptC.setAttribute('cy', cy2.toFixed(1));

    const lp = (el, d) => {
      el.setAttribute('x', (CX + (R + 17) * Math.cos(rad(d))).toFixed(1));
      el.setAttribute('y', (CY - (R + 17) * Math.sin(rad(d)) + 4).toFixed(1));
    };
    lp(lblA, a); lp(lblB, b); lp(lblC, c);

    /* Busur yang dihadapi C = busur AB yang TIDAK memuat C */
    const ccwAB = norm(b - a);
    const cIn = norm(c - a) < ccwAB;
    const faced = cIn ? 360 - ccwAB : ccwAB;
    const startFaced = cIn ? b : a;
    const ins = faced / 2;

    arcO.setAttribute('d', arcAt(CX, CY, 30, startFaced, faced));

    const dCA = norm(Math.atan2(cy2 - ay, ax - cx2) * 180 / Math.PI);
    const dCB = norm(Math.atan2(cy2 - by, bx - cx2) * 180 / Math.PI);
    const sAB = norm(dCB - dCA);
    const insStart = sAB <= 180 ? dCA : dCB;
    const insSpan = sAB <= 180 ? sAB : 360 - sAB;
    arcC.setAttribute('d', arcAt(cx2, cy2, 22, insStart, insSpan));

    q('[data-r="pusat"]').textContent = fmtDeg(faced) + (faced > 180.5 ? ' \u00b7 refleks' : '');
    q('[data-r="keliling"]').textContent = fmtDeg(ins);
    q('[data-r="posisi"]').textContent =
      faced < 179.5 ? 'C di busur besar' :
      faced > 180.5 ? 'C di busur kecil' : 'C menghadap diameter';

    const badge = q('[data-r="badge"]');
    if (Math.abs(faced - 180) < 0.75) {
      badge.hidden = false;
      badge.textContent = 'Teorema Thales \u00b7 \u2220ACB = 90\u00b0';
    } else {
      badge.hidden = true;
    }

    note.textContent = faced > 180.5
      ? 'C kini di busur kecil: ia menghadap busur besar (refleks), jadi \u2220ACB = \u00bd \u00d7 busur besar. Dua posisi C di busur berbeda selalu berjumlah 180\u00b0 \u2014 itulah segiempat tali busur.'
      : 'Seret titik biru C menyusuri busur \u2014 \u2220ACB tidak berubah selama C tetap di busur yang sama. Seret A atau B (emas) untuk mengubah sudut pusatnya.';

    const minor = Math.min(ccwAB, 360 - ccwAB);
    chips.querySelectorAll('.chip').forEach(ch => {
      ch.classList.toggle('active', Math.round(minor) === Number(ch.dataset.deg));
    });
  }

  /* --- Seret titik --- */
  let dragKey = null;
  const svgXY = e => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return null;
    return {
      x: (e.clientX - rect.left) * (SIZE / rect.width),
      y: (e.clientY - rect.top) * (SIZE / rect.height)
    };
  };
  const angDist = (u, v) => {
    const d = norm(u - v);
    return Math.min(d, 360 - d);
  };
  function moveTo(p) {
    let deg = norm(Math.round(Math.atan2(CY - p.y, p.x - CX) * 180 / Math.PI));
    for (let s2 = 0; s2 <= 360; s2 += 15) {
      if (Math.abs(deg - s2) <= 3) { deg = s2 % 360; break; }
    }
    if (dragKey === 'a') {
      if (angDist(deg, b) < 8) return;
      a = deg;
    } else if (dragKey === 'b') {
      if (angDist(deg, a) < 8) return;
      b = deg;
    } else {
      c = deg;
    }
    render();
  }
  svg.addEventListener('pointerdown', e => {
    const p = svgXY(e);
    if (!p) return;
    let best = null, bd = 1e9;
    [['a', a], ['b', b], ['c', c]].forEach(k => {
      const d = Math.hypot(p.x - px(k[1]), p.y - py(k[1]));
      if (d < bd) { bd = d; best = k[0]; }
    });
    if (bd > 34) return;
    dragKey = best;
    try { svg.setPointerCapture(e.pointerId); } catch (err) {}
    moveTo(p);
    e.preventDefault();
  });
  svg.addEventListener('pointermove', e => {
    if (!dragKey) return;
    const p = svgXY(e);
    if (p) moveTo(p);
  });
  ['pointerup', 'pointercancel'].forEach(ev =>
    svg.addEventListener(ev, () => { dragKey = null; }));

  render();
}

/* ==========================================================================
   SIMULASI 4 — Penjelajah Limit (prakalkulus.html)
   f(x) = (x^2 - 1)/(x - 1): bolong di x = 1, tetapi limitnya 2.
   ========================================================================== */
function initLimitLab() {
  const host = document.getElementById('widget-limit');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const W = 360, H = 300, PAD = 30;
  const XMIN = -1, XMAX = 3, YMIN = -1, YMAX = 4;
  const A = 1, L = 2;
  const px = x => PAD + (x - XMIN) / (XMAX - XMIN) * (W - 2 * PAD);
  const py = y => PAD + (YMAX - y) / (YMAX - YMIN) * (H - 2 * PAD);
  const isHole = x => Math.abs(x - A) < 1e-9;

  const fmtId = (v, d) => {
    const r = Number(v).toFixed(d).replace(/\.?0+$/, '');
    return (r === '' || r === '-' ? '0' : r).replace('-', '\u2212').replace('.', ',');
  };

  /* --- Bangun SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + W + ' ' + H,
    role: 'img',
    'aria-label': 'Grafik f(x) = (x kuadrat dikurang 1) per (x dikurang 1), bolong di x sama dengan 1'
  });

  for (let x = XMIN; x <= XMAX; x++) {
    if (x !== 0) svgEl('line', { x1: px(x), y1: PAD, x2: px(x), y2: H - PAD, class: 'pb-grid' }, svg);
  }
  for (let y = YMIN; y <= YMAX; y++) {
    if (y !== 0) svgEl('line', { x1: PAD, y1: py(y), x2: W - PAD, y2: py(y), class: 'pb-grid' }, svg);
  }
  svgEl('line', { x1: PAD, y1: py(0), x2: W - PAD, y2: py(0), class: 'pb-axis' }, svg);
  svgEl('line', { x1: px(0), y1: PAD, x2: px(0), y2: H - PAD, class: 'pb-axis' }, svg);
  [['x', W - 14, py(0) - 7], ['y', px(0) + 9, PAD + 6],
   ['1', px(1) - 3, py(0) + 14], ['2', px(0) - 14, py(2) + 4]].forEach(t => {
    const lbl = svgEl('text', { x: t[1], y: t[2], class: 'w-lbl' }, svg);
    lbl.textContent = t[0];
  });

  /* Garis y = x + 1 (nilai f untuk x != 1) */
  svgEl('line', {
    x1: px(XMIN), y1: py(XMIN + 1), x2: px(XMAX), y2: py(XMAX + 1), class: 'pb-curve'
  }, svg);

  const gx = svgEl('line', { class: 'lm-guide' }, svg);
  const gy = svgEl('line', { class: 'lm-guide' }, svg);
  const pt = svgEl('circle', { r: 6, class: 'lm-pt' }, svg);
  svgEl('circle', { cx: px(A), cy: py(L), r: 5.5, class: 'lm-hole' }, svg);

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');
  const row = elDiv('ctrl-row');
  const lab = document.createElement('label');
  lab.setAttribute('for', 'lm-x');
  lab.textContent = 'Geser x mendekati 1';
  const out = document.createElement('output');
  row.appendChild(lab); row.appendChild(out);
  controls.appendChild(row);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0'; slider.max = '2'; slider.step = '0.001'; slider.value = '0.5';
  slider.id = 'lm-x';
  slider.setAttribute('aria-label', 'Nilai x');
  controls.appendChild(slider);

  const chips = elDiv('chips');
  [0.9, 0.99, 0.999, 1, 1.001, 1.01, 1.1].forEach(v => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.x = String(v);
    b.textContent = fmtId(v, 3);
    b.addEventListener('click', () => { slider.value = String(v); render(); });
    chips.appendChild(b);
  });
  controls.appendChild(chips);

  const readout = elDiv('readout',
    '<div><span>x</span><b data-r="x"></b></div>' +
    '<div><span>f(x)</span><b data-r="fx"></b></div>' +
    '<div><span>Jarak x ke 1</span><b data-r="dx"></b></div>' +
    '<div><span>Jarak f(x) ke 2</span><b data-r="dy"></b></div>');
  controls.appendChild(readout);

  const badgeWrap = elDiv('');
  badgeWrap.innerHTML = '<span class="disc-badge gold" data-r="badge" hidden></span>';
  controls.appendChild(badgeWrap);

  const note = elDiv('w-note');
  controls.appendChild(note);

  const body = elDiv('widget-body');
  const canvas = elDiv('widget-canvas');
  canvas.appendChild(svg);
  body.appendChild(canvas);
  body.appendChild(controls);
  mount.innerHTML = '';
  mount.appendChild(body);

  const q = sel => controls.querySelector(sel);

  function render() {
    const x = parseFloat(slider.value);
    const hole = isHole(x);
    const fx = hole ? null : (x * x - 1) / (x - 1);

    out.textContent = 'x = ' + fmtId(x, 3);
    q('[data-r="x"]').textContent = fmtId(x, 3);

    const badge = q('[data-r="badge"]');
    if (hole) {
      [gx, gy, pt].forEach(el => el.setAttribute('display', 'none'));
      q('[data-r="fx"]').textContent = 'tak terdefinisi';
      q('[data-r="dx"]').textContent = '0';
      q('[data-r="dy"]').textContent = '\u2014';
      badge.hidden = false;
      badge.textContent = 'f(1) tak terdefinisi \u00b7 limitnya tetap 2';
      note.textContent = 'Tepat di x = 1, penyebutnya nol \u2014 titiknya bolong. Tapi limit tidak peduli nilai di titik itu, hanya nilai di sekitarnya. Geser sedikit ke kiri atau kanan.';
    } else {
      [gx, gy, pt].forEach(el => el.removeAttribute('display'));
      const X = px(x), Y = py(fx);
      pt.setAttribute('cx', X.toFixed(1));
      pt.setAttribute('cy', Y.toFixed(1));
      gx.setAttribute('x1', X.toFixed(1)); gx.setAttribute('y1', Y.toFixed(1));
      gx.setAttribute('x2', X.toFixed(1)); gx.setAttribute('y2', py(0).toFixed(1));
      gy.setAttribute('x1', X.toFixed(1)); gy.setAttribute('y1', Y.toFixed(1));
      gy.setAttribute('x2', px(0).toFixed(1)); gy.setAttribute('y2', Y.toFixed(1));

      q('[data-r="fx"]').textContent = fmtId(fx, 3);
      q('[data-r="dx"]').textContent = fmtId(Math.abs(x - A), 3);
      q('[data-r="dy"]').textContent = fmtId(Math.abs(fx - L), 3);
      badge.hidden = true;
      const d = Math.abs(x - A);
      note.textContent = d < 0.02
        ? 'Perhatikan: jarak f(x) ke 2 selalu sama persis dengan jarak x ke 1. Sedekat apa pun kamu mau, f(x) bisa dibuat sedekat itu ke 2 \u2014 itulah arti lim f(x) = 2.'
        : (x < A
          ? 'Kamu mendekat dari kiri. Makin dekat x ke 1, makin dekat f(x) ke 2.'
          : 'Kamu mendekat dari kanan. Perhatikan f(x) menuju angka yang sama: 2.');
    }

    chips.querySelectorAll('.chip').forEach(ch => {
      ch.classList.toggle('active', Math.abs(Number(ch.dataset.x) - x) < 1e-9);
    });
  }

  slider.addEventListener('input', render);
  render();
}

/* ==========================================================================
   SIMULASI 5 — Matriks sebagai Transformasi (matriks.html)
   Matriks 2x2 [[a,b],[c,d]] mengubah bidang; det = luas jajaran genjang.
   ========================================================================== */
function initMatrixLab() {
  const host = document.getElementById('widget-matriks');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const SIZE = 340, CX = 170, CY = 170, U = 42; // U px per satuan
  const RANGE = 3.5;
  const sx = x => CX + x * U;
  const sy = y => CY - y * U;
  const clamp = v => Math.max(-RANGE, Math.min(RANGE, v));
  const snap = v => {
    const r = Math.round(v * 2) / 2;
    return Math.abs(v - r) < 0.12 ? r : Math.round(v * 100) / 100;
  };
  const fmt = v => {
    let s = String(Math.round(v * 100) / 100);
    if (s === '-0') s = '0';
    return s.replace('-', '\u2212');
  };

  // Keadaan awal: sedikit geser (shear) supaya menarik
  let a = 1, b = 1, c = 0, d = 1.5;

  /* --- SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + SIZE + ' ' + SIZE,
    role: 'img',
    'aria-label': 'Bidang koordinat memperlihatkan matriks 2x2 mengubah persegi satuan menjadi jajaran genjang'
  });
  // grid
  for (let i = -4; i <= 4; i++) {
    if (i !== 0) {
      svgEl('line', { x1: sx(i), y1: sy(-4), x2: sx(i), y2: sy(4), class: 'pb-grid' }, svg);
      svgEl('line', { x1: sx(-4), y1: sy(i), x2: sx(4), y2: sy(i), class: 'pb-grid' }, svg);
    }
  }
  svgEl('line', { x1: sx(-4), y1: sy(0), x2: sx(4), y2: sy(0), class: 'pb-axis' }, svg);
  svgEl('line', { x1: sx(0), y1: sy(-4), x2: sx(0), y2: sy(4), class: 'pb-axis' }, svg);

  // persegi satuan asli (bayangan referensi)
  svgEl('rect', { x: sx(0), y: sy(1), width: U, height: U, class: 'mx-square' }, svg);

  // jajaran genjang hasil (diisi warna sesuai tanda determinan)
  const para = svgEl('polygon', { class: 'mx-para pos', points: '' }, svg);

  // panah marker (definisi sekali)
  const defs = svgEl('defs', {}, svg);
  const mk = (id, cls) => {
    const m = svgEl('marker', { id, markerWidth: 9, markerHeight: 9, refX: 6, refY: 3, orient: 'auto' }, defs);
    svgEl('path', { d: 'M0,0 L6,3 L0,6 Z', class: cls }, m).setAttribute('fill', 'currentColor');
    return m;
  };
  mk('mx-arrow-i', 'ai'); mk('mx-arrow-j', 'aj');

  const vecI = svgEl('line', { class: 'mx-vec-i', 'marker-end': 'url(#mx-arrow-i)' }, svg);
  const vecJ = svgEl('line', { class: 'mx-vec-j', 'marker-end': 'url(#mx-arrow-j)' }, svg);
  vecI.style.color = 'var(--signal)'; vecJ.style.color = 'var(--medal)';
  const dotI = svgEl('circle', { r: 7, fill: 'var(--signal)', stroke: 'var(--ink)', 'stroke-width': 2, style: 'cursor:grab' }, svg);
  const dotJ = svgEl('circle', { r: 7, fill: 'var(--medal)', stroke: 'var(--ink)', 'stroke-width': 2, style: 'cursor:grab' }, svg);
  const lblI = svgEl('text', { class: 'mx-vlbl i', 'text-anchor': 'middle' }, svg);
  const lblJ = svgEl('text', { class: 'mx-vlbl j', 'text-anchor': 'middle' }, svg);
  lblI.textContent = '\u00ee'; lblJ.textContent = '\u0135';

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');

  const chips = elDiv('chips');
  const presets = [
    ['Identitas', 1, 0, 0, 1],
    ['Rotasi 90\u00b0', 0, -1, 1, 0],
    ['Regang 2\u00d7', 2, 0, 0, 2],
    ['Geser', 1, 1, 0, 1],
    ['Singular', 1, 2, 1, 2]
  ];
  presets.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'chip'; btn.textContent = p[0];
    btn.addEventListener('click', () => { a = p[1]; b = p[2]; c = p[3]; d = p[4]; syncSliders(); render(); });
    chips.appendChild(btn);
  });
  controls.appendChild(chips);

  // empat slider a,b,c,d
  const sliders = {};
  const mkSlider = (key, val, labelHtml) => {
    const row = elDiv('ctrl-row');
    row.innerHTML = '<label>' + labelHtml + '</label><output></output>';
    const inp = document.createElement('input');
    inp.type = 'range'; inp.min = '-3'; inp.max = '3'; inp.step = '0.25'; inp.value = String(val);
    inp.setAttribute('aria-label', 'elemen ' + key);
    inp.addEventListener('input', () => {
      const v = parseFloat(inp.value);
      if (key === 'a') a = v; else if (key === 'b') b = v; else if (key === 'c') c = v; else d = v;
      render();
    });
    sliders[key] = inp;
    controls.appendChild(row);
    controls.appendChild(inp);
    row.querySelector('output').dataset.k = key;
  };
  mkSlider('a', a, 'a <span style="color:var(--chalk-mute)">(kolom \u00ee, atas)</span>');
  mkSlider('c', c, 'c <span style="color:var(--chalk-mute)">(kolom \u00ee, bawah)</span>');
  mkSlider('b', b, 'b <span style="color:var(--chalk-mute)">(kolom \u0135, atas)</span>');
  mkSlider('d', d, 'd <span style="color:var(--chalk-mute)">(kolom \u0135, bawah)</span>');

  const readout = elDiv('readout',
    '<div><span>Determinan (ad \u2212 bc)</span><b data-r="det"></b></div>' +
    '<div><span>Luas jajaran genjang</span><b data-r="area"></b></div>' +
    '<div><span>Orientasi</span><b data-r="ori"></b></div>');
  controls.appendChild(readout);

  const badgeWrap = elDiv('');
  badgeWrap.innerHTML = '<span class="disc-badge" data-r="badge" hidden></span>';
  controls.appendChild(badgeWrap);

  const legend = elDiv('legend',
    '<span><i class="dot" style="background:var(--signal)"></i>\u00ee = kolom 1</span>' +
    '<span><i class="dot" style="background:var(--medal)"></i>\u0135 = kolom 2</span>');
  legend.style.marginTop = '0.9rem';
  controls.appendChild(legend);

  const note = elDiv('w-note');
  controls.appendChild(note);

  const body = elDiv('widget-body');
  const canvas = elDiv('widget-canvas');
  canvas.appendChild(svg);
  body.appendChild(canvas);
  body.appendChild(controls);
  mount.innerHTML = '';
  mount.appendChild(body);

  const q = sel => controls.querySelector(sel);

  function syncSliders() {
    ['a', 'b', 'c', 'd'].forEach(k => {
      const v = k === 'a' ? a : k === 'b' ? b : k === 'c' ? c : d;
      if (sliders[k]) sliders[k].value = String(v);
    });
  }

  function render() {
    const ix = sx(a), iy = sy(c);   // kolom 1 = (a,c)
    const jx = sx(b), jy = sy(d);   // kolom 2 = (b,d)
    const ox = sx(0), oy = sy(0);
    const tipX = sx(a + b), tipY = sy(c + d);

    para.setAttribute('points',
      ox + ',' + oy + ' ' + ix + ',' + iy + ' ' + tipX + ',' + tipY + ' ' + jx + ',' + jy);

    vecI.setAttribute('x1', ox); vecI.setAttribute('y1', oy);
    vecI.setAttribute('x2', ix); vecI.setAttribute('y2', iy);
    vecJ.setAttribute('x1', ox); vecJ.setAttribute('y1', oy);
    vecJ.setAttribute('x2', jx); vecJ.setAttribute('y2', jy);
    dotI.setAttribute('cx', ix); dotI.setAttribute('cy', iy);
    dotJ.setAttribute('cx', jx); dotJ.setAttribute('cy', jy);
    lblI.setAttribute('x', ix + (a >= 0 ? 13 : -13)); lblI.setAttribute('y', iy + (c > 0 ? 16 : -8));
    lblJ.setAttribute('x', jx + (b >= 0 ? 13 : -13)); lblJ.setAttribute('y', jy + (d > 0 ? 16 : -8));

    const det = a * d - b * c;
    const flat = Math.abs(det) < 0.02;
    para.setAttribute('class', 'mx-para ' + (flat ? 'flat' : det > 0 ? 'pos' : 'neg'));

    q('[data-r="det"]').textContent = fmt(det);
    q('[data-r="area"]').textContent = fmt(Math.abs(det)) + ' satuan\u00b2';
    q('[data-r="ori"]').textContent = flat ? '\u2014' : det > 0 ? 'terjaga' : 'terbalik (cermin)';

    const badge = q('[data-r="badge"]');
    if (flat) {
      badge.hidden = false;
      badge.className = 'disc-badge';
      badge.style.color = 'var(--incorrect)';
      badge.style.borderColor = 'rgba(255,107,107,0.35)';
      badge.style.background = 'var(--incorrect-soft)';
      badge.textContent = 'det = 0 \u00b7 matriks SINGULAR (tak punya invers)';
    } else {
      badge.hidden = true;
    }

    note.textContent = flat
      ? 'Kedua kolom segaris, jadi persegi satuan gepeng menjadi ruas garis \u2014 luasnya nol. Di sinilah det = 0 dan invers tidak ada: transformasi "meremukkan" bidang dan tak bisa dibalik.'
      : det < 0
        ? 'Determinan negatif: jajaran genjang "terbalik" \u2014 \u0135 kini berada di sisi searah jarum jam dari \u00ee. Orientasi bidang tercermin, dan |det| tetap mengukur luasnya.'
        : 'Seret titik biru (\u00ee) dan emas (\u0135), atau geser slider a, b, c, d. Perhatikan: luas jajaran genjang selalu sama dengan |determinan|.';

    // update output tiap slider
    controls.querySelectorAll('output[data-k]').forEach(o => {
      const k = o.dataset.k;
      const v = k === 'a' ? a : k === 'b' ? b : k === 'c' ? c : d;
      o.textContent = fmt(v);
    });
  }

  /* --- Seret î / ĵ --- */
  let drag = null;
  const svgXY = e => {
    const r = svg.getBoundingClientRect();
    if (!r.width) return null;
    return { x: (e.clientX - r.left) * (SIZE / r.width), y: (e.clientY - r.top) * (SIZE / r.height) };
  };
  const toUnit = p => ({ x: clamp(snap((p.x - CX) / U)), y: clamp(snap((CY - p.y) / U)) });

  svg.addEventListener('pointerdown', e => {
    const p = svgXY(e); if (!p) return;
    const di = Math.hypot(p.x - sx(a), p.y - sy(c));
    const dj = Math.hypot(p.x - sx(b), p.y - sy(d));
    if (Math.min(di, dj) > 26) return;
    drag = di <= dj ? 'i' : 'j';
    try { svg.setPointerCapture(e.pointerId); } catch (err) {}
    const u = toUnit(p);
    if (drag === 'i') { a = u.x; c = u.y; } else { b = u.x; d = u.y; }
    syncSliders(); render(); e.preventDefault();
  });
  svg.addEventListener('pointermove', e => {
    if (!drag) return;
    const p = svgXY(e); if (!p) return;
    const u = toUnit(p);
    if (drag === 'i') { a = u.x; c = u.y; } else { b = u.x; d = u.y; }
    syncSliders(); render();
  });
  ['pointerup', 'pointercancel'].forEach(ev => svg.addEventListener(ev, () => { drag = null; }));

  render();
}

/* ==========================================================================
   SIMULASI 6 — Laboratorium Vektor (vektor.html)
   Seret ujung u dan v: resultan (aturan jajaran genjang), dot product,
   sudut antara, dan deteksi tegak lurus.
   ========================================================================== */
function initVectorLab() {
  const host = document.getElementById('widget-vektor');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const SIZE = 340, CX = 170, CY = 170, U = 28;
  const sx = x => CX + x * U;
  const sy = y => CY - y * U;
  const clamp = v => Math.max(-4, Math.min(4, v));
  const snapHalf = v => Math.round(v * 2) / 2;
  const fmt = v => {
    let s = String(Math.round(v * 100) / 100);
    if (s === '-0') s = '0';
    return s.replace('-', '\u2212').replace('.', ',');
  };
  const pair = (x, y) => '(' + fmt(x) + ', ' + fmt(y) + ')';

  // Keadaan awal
  let ux = 3, uy = 1, vx = 1, vy = 3;

  /* --- SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + SIZE + ' ' + SIZE,
    role: 'img',
    'aria-label': 'Bidang koordinat dengan dua vektor yang bisa diseret beserta resultannya'
  });
  for (let i = -5; i <= 5; i++) {
    if (i !== 0) {
      svgEl('line', { x1: sx(i), y1: sy(-5.5), x2: sx(i), y2: sy(5.5), class: 'pb-grid' }, svg);
      svgEl('line', { x1: sx(-5.5), y1: sy(i), x2: sx(5.5), y2: sy(i), class: 'pb-grid' }, svg);
    }
  }
  svgEl('line', { x1: 0, y1: sy(0), x2: SIZE, y2: sy(0), class: 'pb-axis' }, svg);
  svgEl('line', { x1: sx(0), y1: 0, x2: sx(0), y2: SIZE, class: 'pb-axis' }, svg);

  const defs = svgEl('defs', {}, svg);
  const mkArrow = id => {
    const m = svgEl('marker', { id, markerWidth: 9, markerHeight: 9, refX: 6, refY: 3, orient: 'auto' }, defs);
    const p = svgEl('path', { d: 'M0,0 L6,3 L0,6 Z' }, m);
    p.setAttribute('fill', 'currentColor');
  };
  mkArrow('vx-a-u'); mkArrow('vx-a-v'); mkArrow('vx-a-r');

  const guide1 = svgEl('line', { class: 'vx-guide' }, svg);
  const guide2 = svgEl('line', { class: 'vx-guide' }, svg);
  const resLn = svgEl('line', { class: 'vx-res', 'marker-end': 'url(#vx-a-r)' }, svg);
  const uLn = svgEl('line', { class: 'vx-u', 'marker-end': 'url(#vx-a-u)' }, svg);
  const vLn = svgEl('line', { class: 'vx-v', 'marker-end': 'url(#vx-a-v)' }, svg);
  resLn.style.color = 'var(--tier-mudah)';
  uLn.style.color = 'var(--signal)';
  vLn.style.color = 'var(--medal)';
  const dotU = svgEl('circle', { r: 7, fill: 'var(--signal)', stroke: 'var(--ink)', 'stroke-width': 2, style: 'cursor:grab' }, svg);
  const dotV = svgEl('circle', { r: 7, fill: 'var(--medal)', stroke: 'var(--ink)', 'stroke-width': 2, style: 'cursor:grab' }, svg);
  const lblU = svgEl('text', { class: 'vx-lbl u', 'text-anchor': 'middle' }, svg);
  const lblV = svgEl('text', { class: 'vx-lbl v', 'text-anchor': 'middle' }, svg);
  const lblR = svgEl('text', { class: 'vx-lbl r', 'text-anchor': 'middle' }, svg);
  lblU.textContent = 'u'; lblV.textContent = 'v'; lblR.textContent = 'u+v';

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');

  const chips = elDiv('chips');
  const presets = [
    ['3-4-5', 3, 0, 0, 4],
    ['Tegak Lurus', 2, 1, -1, 2],
    ['Sudut 120\u00b0', 2, 0, -1, 1.7320508],
    ['Berlawanan', 3, 1, -3, -1]
  ];
  presets.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'chip'; btn.textContent = p[0];
    btn.addEventListener('click', () => { ux = p[1]; uy = p[2]; vx = p[3]; vy = p[4]; render(); });
    chips.appendChild(btn);
  });
  controls.appendChild(chips);

  const readout = elDiv('readout',
    '<div><span>Vektor u</span><b data-r="u"></b></div>' +
    '<div><span>Vektor v</span><b data-r="v"></b></div>' +
    '<div><span>Resultan u + v</span><b data-r="res"></b></div>' +
    '<div><span>Panjang |u + v|</span><b data-r="mag"></b></div>' +
    '<div><span>Dot product u \u00b7 v</span><b data-r="dot"></b></div>' +
    '<div><span>Sudut antara u, v</span><b data-r="ang"></b></div>');
  controls.appendChild(readout);

  const badgeWrap = elDiv('');
  badgeWrap.innerHTML = '<span class="disc-badge gold" data-r="badge" hidden></span>';
  controls.appendChild(badgeWrap);

  const legend = elDiv('legend',
    '<span><i class="dot" style="background:var(--signal)"></i>u</span>' +
    '<span><i class="dot" style="background:var(--medal)"></i>v</span>' +
    '<span><i class="dot" style="background:var(--tier-mudah)"></i>resultan u+v</span>');
  legend.style.marginTop = '0.9rem';
  controls.appendChild(legend);

  const note = elDiv('w-note');
  controls.appendChild(note);

  const body = elDiv('widget-body');
  const canvas = elDiv('widget-canvas');
  canvas.appendChild(svg);
  body.appendChild(canvas);
  body.appendChild(controls);
  mount.innerHTML = '';
  mount.appendChild(body);

  const q = sel => controls.querySelector(sel);

  function render() {
    const rx = ux + vx, ry = uy + vy;
    const ox = sx(0), oy = sy(0);

    uLn.setAttribute('x1', ox); uLn.setAttribute('y1', oy);
    uLn.setAttribute('x2', sx(ux)); uLn.setAttribute('y2', sy(uy));
    vLn.setAttribute('x1', ox); vLn.setAttribute('y1', oy);
    vLn.setAttribute('x2', sx(vx)); vLn.setAttribute('y2', sy(vy));
    dotU.setAttribute('cx', sx(ux)); dotU.setAttribute('cy', sy(uy));
    dotV.setAttribute('cx', sx(vx)); dotV.setAttribute('cy', sy(vy));

    const magR = Math.hypot(rx, ry);
    const showRes = magR > 1e-9;
    resLn.setAttribute('display', showRes ? '' : 'none');
    lblR.setAttribute('display', showRes ? '' : 'none');
    if (showRes) {
      resLn.setAttribute('x1', ox); resLn.setAttribute('y1', oy);
      resLn.setAttribute('x2', sx(rx)); resLn.setAttribute('y2', sy(ry));
      lblR.setAttribute('x', sx(rx) + (rx >= 0 ? 18 : -18));
      lblR.setAttribute('y', sy(ry) + (ry >= 0 ? -8 : 16));
    }
    guide1.setAttribute('x1', sx(ux)); guide1.setAttribute('y1', sy(uy));
    guide1.setAttribute('x2', sx(rx)); guide1.setAttribute('y2', sy(ry));
    guide2.setAttribute('x1', sx(vx)); guide2.setAttribute('y1', sy(vy));
    guide2.setAttribute('x2', sx(rx)); guide2.setAttribute('y2', sy(ry));

    lblU.setAttribute('x', sx(ux) + (ux >= 0 ? 14 : -14));
    lblU.setAttribute('y', sy(uy) + (uy >= 0 ? -8 : 16));
    lblV.setAttribute('x', sx(vx) + (vx >= 0 ? 14 : -14));
    lblV.setAttribute('y', sy(vy) + (vy >= 0 ? -8 : 16));

    const dot = ux * vx + uy * vy;
    const mu = Math.hypot(ux, uy);
    const mv = Math.hypot(vx, vy);
    const hasBoth = mu > 1e-9 && mv > 1e-9;

    q('[data-r="u"]').textContent = pair(ux, uy);
    q('[data-r="v"]').textContent = pair(vx, vy);
    q('[data-r="res"]').textContent = pair(rx, ry);
    q('[data-r="mag"]').textContent = fmt(magR);
    q('[data-r="dot"]').textContent = fmt(dot);
    q('[data-r="ang"]').textContent = hasBoth
      ? String(Math.round(Math.acos(Math.max(-1, Math.min(1, dot / (mu * mv)))) * 180 / Math.PI * 10) / 10).replace('.', ',') + '\u00b0'
      : '\u2014';

    const perp = hasBoth && Math.abs(dot) < 1e-9;
    const badge = q('[data-r="badge"]');
    badge.hidden = !perp;
    if (perp) badge.textContent = 'u \u22a5 v \u00b7 dot product = 0';

    const cross = ux * vy - uy * vx;
    note.textContent = !hasBoth
      ? 'Salah satu vektor sedang nol \u2014 vektor nol tidak punya arah. Seret titiknya menjauh dari titik asal.'
      : !showRes
        ? 'Resultannya nol! Dua vektor sama besar dan berlawanan arah saling meniadakan \u2014 kondisi seimbang.'
        : perp
          ? 'Tegak lurus! Saat u \u22a5 v, berlaku |u+v|\u00b2 = |u|\u00b2 + |v|\u00b2 \u2014 Pythagoras hidup kembali dalam bahasa vektor.'
          : Math.abs(cross) < 1e-9
            ? (dot > 0
              ? 'Searah: resultannya memanjang di garis yang sama, |u+v| = |u| + |v|.'
              : 'Berlawanan arah pada satu garis: panjangnya saling mengurangi, |u+v| = | |u| \u2212 |v| |.')
            : 'Seret ujung panah biru (u) dan emas (v). Resultan hijau adalah diagonal jajaran genjang \u2014 itulah aturan jajaran genjang.';
  }

  /* --- Seret --- */
  let drag = null;
  const svgXY = e => {
    const r = svg.getBoundingClientRect();
    if (!r.width) return null;
    return { x: (e.clientX - r.left) * (SIZE / r.width), y: (e.clientY - r.top) * (SIZE / r.height) };
  };
  const toUnit = p => ({ x: clamp(snapHalf((p.x - CX) / U)), y: clamp(snapHalf((CY - p.y) / U)) });

  svg.addEventListener('pointerdown', e => {
    const p = svgXY(e); if (!p) return;
    const du = Math.hypot(p.x - sx(ux), p.y - sy(uy));
    const dv = Math.hypot(p.x - sx(vx), p.y - sy(vy));
    if (Math.min(du, dv) > 26) return;
    drag = du <= dv ? 'u' : 'v';
    try { svg.setPointerCapture(e.pointerId); } catch (err) {}
    const t = toUnit(p);
    if (drag === 'u') { ux = t.x; uy = t.y; } else { vx = t.x; vy = t.y; }
    render(); e.preventDefault();
  });
  svg.addEventListener('pointermove', e => {
    if (!drag) return;
    const p = svgXY(e); if (!p) return;
    const t = toUnit(p);
    if (drag === 'u') { ux = t.x; uy = t.y; } else { vx = t.x; vy = t.y; }
    render();
  });
  ['pointerup', 'pointercancel'].forEach(ev => svg.addEventListener(ev, () => { drag = null; }));

  render();
}

/* ==========================================================================
   SIMULASI 7 — Laboratorium Data (statistika.html)
   Seret titik data pada garis bilangan: rata-rata (biru) mengejar pencilan,
   median (emas) bergeming. Menunjukkan ketahanan median.
   ========================================================================== */
function initDataLab() {
  const host = document.getElementById('widget-statistika');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const W = 340, H = 200, L = 24, R = 316, BASE = 150, MINV = 0, MAXV = 20;
  const sx = v => L + v * ((R - L) / (MAXV - MINV));
  const clamp = v => Math.max(MINV, Math.min(MAXV, v));
  const fmt = v => {
    let s = String(Math.round(v * 100) / 100);
    if (s === '-0') s = '0';
    return s.replace('-', '\u2212').replace('.', ',');
  };

  let data = [1, 3, 4, 4, 6, 7, 10];

  const svg = svgEl('svg', {
    viewBox: '0 0 ' + W + ' ' + H, role: 'img',
    'aria-label': 'Garis bilangan dengan titik data yang bisa diseret, penanda rata-rata dan median'
  });
  // sumbu + tik
  svgEl('line', { x1: L, y1: BASE, x2: R, y2: BASE, class: 'st-axis' }, svg);
  for (let t = 0; t <= 20; t += 5) {
    svgEl('line', { x1: sx(t), y1: BASE, x2: sx(t), y2: BASE + 6, class: 'st-tick' }, svg);
    const lbl = svgEl('text', { x: sx(t), y: BASE + 20, class: 'st-ticklbl' }, svg);
    lbl.textContent = String(t);
  }

  const meanLn = svgEl('line', { class: 'st-meanline', y1: 34, y2: BASE }, svg);
  const medLn = svgEl('line', { class: 'st-medianline', y1: 34, y2: BASE }, svg);
  const meanLbl = svgEl('text', { class: 'st-meanlbl', y: 28 }, svg);
  const medLbl = svgEl('text', { class: 'st-medianlbl', y: 28 }, svg);
  meanLbl.textContent = '\u0078\u0304'; // x̄
  medLbl.textContent = 'Med';

  const dotG = svgEl('g', {}, svg);
  let dotPos = []; // {i, cx, cy}

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');
  const chips = elDiv('chips');
  const presets = [
    ['Simetris', [2, 3, 4, 5, 6, 7, 8]],
    ['Ada Pencilan', [2, 3, 4, 4, 5, 6, 18]],
    ['Menumpuk', [5, 5, 5, 6, 6, 7, 8]],
    ['Merata', [1, 4, 7, 10, 13, 16, 19]]
  ];
  presets.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = p[0];
    b.addEventListener('click', () => { data = p[1].slice(); render(); });
    chips.appendChild(b);
  });
  controls.appendChild(chips);

  const readout = elDiv('readout',
    '<div><span>Rata-rata (x\u0304)</span><b data-r="mean"></b></div>' +
    '<div><span>Median</span><b data-r="med"></b></div>' +
    '<div><span>Modus</span><b data-r="mod"></b></div>' +
    '<div><span>Jangkauan</span><b data-r="range"></b></div>');
  controls.appendChild(readout);

  const legend = elDiv('legend',
    '<span><i class="dot" style="background:var(--signal)"></i>rata-rata</span>' +
    '<span><i class="dot" style="background:var(--medal)"></i>median</span>');
  legend.style.marginTop = '0.9rem';
  controls.appendChild(legend);

  const note = elDiv('w-note');
  controls.appendChild(note);

  const body = elDiv('widget-body');
  const canvas = elDiv('widget-canvas');
  canvas.appendChild(svg);
  body.appendChild(canvas);
  body.appendChild(controls);
  mount.innerHTML = '';
  mount.appendChild(body);

  const q = sel => controls.querySelector(sel);

  const median = arr => {
    const s = arr.slice().sort((x, y) => x - y);
    const n = s.length, m = Math.floor(n / 2);
    return n % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const modus = arr => {
    const freq = {};
    arr.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    let max = 0;
    for (const k in freq) if (freq[k] > max) max = freq[k];
    if (max <= 1) return null;
    return Object.keys(freq).filter(k => freq[k] === max).map(Number).sort((a, b) => a - b);
  };

  function render() {
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const med = median(data);
    const mo = modus(data);
    const rng = Math.max.apply(null, data) - Math.min.apply(null, data);

    // titik data (tumpuk yang bernilai sama)
    dotG.innerHTML = '';
    dotPos = [];
    const seen = {};
    data.forEach((v, i) => {
      const level = seen[v] || 0;
      seen[v] = level + 1;
      const cx = sx(v), cy = BASE - 10 - level * 15;
      const c = svgEl('circle', { cx, cy, r: 6, class: 'st-dot' }, dotG);
      c.dataset.i = i;
      dotPos.push({ i, cx, cy });
    });

    meanLn.setAttribute('x1', sx(mean)); meanLn.setAttribute('x2', sx(mean));
    medLn.setAttribute('x1', sx(med)); medLn.setAttribute('x2', sx(med));
    meanLbl.setAttribute('x', sx(mean));
    medLbl.setAttribute('x', sx(med));
    // Hindari tumpang tindih label saat rata-rata ≈ median
    if (Math.abs(sx(mean) - sx(med)) < 22) {
      meanLbl.setAttribute('y', 20); medLbl.setAttribute('y', 30);
    } else {
      meanLbl.setAttribute('y', 28); medLbl.setAttribute('y', 28);
    }

    q('[data-r="mean"]').textContent = fmt(mean);
    q('[data-r="med"]').textContent = fmt(med);
    q('[data-r="mod"]').textContent = mo ? mo.map(fmt).join(', ') : '\u2014 (tak ada)';
    q('[data-r="range"]').textContent = fmt(rng);

    const gap = mean - med;
    note.textContent = Math.abs(gap) < 0.5
      ? 'Rata-rata dan median hampir berimpit \u2014 tanda data cukup simetris, tanpa pencilan yang menarik ke satu sisi.'
      : gap > 0
        ? 'Rata-rata berada di kanan median: ada nilai besar (pencilan tinggi) yang menyeret rata-rata. Median bergeming \u2014 itulah kenapa median lebih tahan pencilan.'
        : 'Rata-rata berada di kiri median: ada nilai kecil yang menyeret rata-rata ke bawah. Perhatikan median tetap di tempatnya.';
  }

  /* --- Seret titik --- */
  let drag = null;
  const svgXY = e => {
    const r = svg.getBoundingClientRect();
    if (!r.width) return null;
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  };
  svg.addEventListener('pointerdown', e => {
    const p = svgXY(e); if (!p) return;
    let best = null, bd = 1e9;
    dotPos.forEach(d => {
      const dist = Math.hypot(p.x - d.cx, p.y - d.cy);
      if (dist < bd) { bd = dist; best = d; }
    });
    if (!best || bd > 22) return;
    drag = best.i;
    try { svg.setPointerCapture(e.pointerId); } catch (err) {}
    data[drag] = clamp(Math.round((p.x - L) / ((R - L) / (MAXV - MINV))));
    render(); e.preventDefault();
  });
  svg.addEventListener('pointermove', e => {
    if (drag === null) return;
    const p = svgXY(e); if (!p) return;
    data[drag] = clamp(Math.round((p.x - L) / ((R - L) / (MAXV - MINV))));
    render();
  });
  ['pointerup', 'pointercancel'].forEach(ev => svg.addEventListener(ev, () => { drag = null; }));

  render();
}
