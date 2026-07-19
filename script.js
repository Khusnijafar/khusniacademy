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
  initAsimtotLab();
  initTurunanLab();
  initHornerLab();
  initCircleLab();
  initVolumeLab();
  initRegionLab();
  initTransformLab();
  initModelLab();
  initExam();
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
  const twin = svgEl('circle', { cx: C, cy: C, r: 6, class: 'uc-twin' }, svg);
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
    '<div><span>Kuadran</span><b data-r="quad"></b></div>' +
    '<div><span>Sudut ber-sin sama</span><b data-r="twinsin"></b></div>' +
    '<div><span>Sudut ber-cos sama</span><b data-r="twincos"></b></div>');
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
    const tSin = ((180 - deg) % 360 + 360) % 360;
    const tCos = ((360 - deg) % 360 + 360) % 360;
    q('[data-r="twinsin"]').textContent = tSin + '\u00b0';
    q('[data-r="twincos"]').textContent = tCos + '\u00b0';
    const ta = tSin * Math.PI / 180;
    twin.setAttribute('cx', (C + R * Math.cos(ta)).toFixed(1));
    twin.setAttribute('cy', (C - R * Math.sin(ta)).toFixed(1));

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
    '<div><span>Jangkauan</span><b data-r="range"></b></div>' +
    '<div><span>Simpangan baku</span><b data-r="sb"></b></div>');
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
    const ragam = data.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n;
    q('[data-r="range"]').textContent = fmt(rng);
    q('[data-r="sb"]').textContent = fmt(Math.sqrt(ragam));

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

/* ==========================================================================
   SIMULASI 8 — Penjelajah Asimtot (limit.html)
   f(x) = (ax+b)/(cx+d): asimtot tegak x = −d/c, datar y = a/c.
   Saat ad − bc = 0 kurva runtuh menjadi garis datar berlubang.
   ========================================================================== */
function initAsimtotLab() {
  const host = document.getElementById('widget-asimtot');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const SIZE = 340, CX = 170, CY = 170, U = 26;
  const sx = x => CX + x * U;
  const sy = y => CY - y * U;
  const fmt = v => {
    let s = String(Math.round(v * 100) / 100);
    if (s === '-0') s = '0';
    return s.replace('-', '\u2212').replace('.', ',');
  };

  let a = 2, b = 1, c = 1, d = -2;

  /* --- SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + SIZE + ' ' + SIZE, role: 'img',
    'aria-label': 'Grafik fungsi rasional dengan asimtot tegak dan datar yang bisa diubah'
  });
  for (let i = -6; i <= 6; i += 2) {
    if (i !== 0) {
      svgEl('line', { x1: sx(i), y1: sy(-6.5), x2: sx(i), y2: sy(6.5), class: 'pb-grid' }, svg);
      svgEl('line', { x1: sx(-6.5), y1: sy(i), x2: sx(6.5), y2: sy(i), class: 'pb-grid' }, svg);
    }
  }
  svgEl('line', { x1: 0, y1: sy(0), x2: SIZE, y2: sy(0), class: 'pb-axis' }, svg);
  svgEl('line', { x1: sx(0), y1: 0, x2: sx(0), y2: SIZE, class: 'pb-axis' }, svg);

  const vaLn = svgEl('line', { class: 'as-va', y1: 0, y2: SIZE }, svg);
  const haLn = svgEl('line', { class: 'as-ha', x1: 0, x2: SIZE }, svg);
  const curve = svgEl('path', { class: 'as-curve', d: '' }, svg);
  const hole = svgEl('circle', { class: 'as-hole', r: 5 }, svg);

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');

  const chips = elDiv('chips');
  const presets = [
    ['Klasik', 2, 1, 1, -2],
    ['Hiperbola 1/x', 0, 1, 1, 0],
    ['Berlubang', 2, 4, 1, 2],
    ['Garis Lurus', 1, 2, 0, 2]
  ];
  presets.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'chip'; btn.textContent = p[0];
    btn.addEventListener('click', () => { a = p[1]; b = p[2]; c = p[3]; d = p[4]; syncSliders(); render(); });
    chips.appendChild(btn);
  });
  controls.appendChild(chips);

  const sliders = {};
  const mkSlider = (key, val, labelHtml) => {
    const row = elDiv('ctrl-row');
    row.innerHTML = '<label>' + labelHtml + '</label><output></output>';
    const inp = document.createElement('input');
    inp.type = 'range'; inp.min = '-3'; inp.max = '3'; inp.step = '0.5'; inp.value = String(val);
    inp.setAttribute('aria-label', 'koefisien ' + key);
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
  mkSlider('a', a, 'a <span style="color:var(--chalk-mute)">(pembilang ax + b)</span>');
  mkSlider('b', b, 'b <span style="color:var(--chalk-mute)">(pembilang ax + b)</span>');
  mkSlider('c', c, 'c <span style="color:var(--chalk-mute)">(penyebut cx + d)</span>');
  mkSlider('d', d, 'd <span style="color:var(--chalk-mute)">(penyebut cx + d)</span>');

  const readout = elDiv('readout',
    '<div><span>Asimtot tegak</span><b data-r="va"></b></div>' +
    '<div><span>Asimtot datar</span><b data-r="ha"></b></div>' +
    '<div><span>Potong sumbu-Y</span><b data-r="icp"></b></div>' +
    '<div><span>ad \u2212 bc</span><b data-r="det"></b></div>');
  controls.appendChild(readout);

  const badgeWrap = elDiv('');
  badgeWrap.innerHTML = '<span class="disc-badge gold" data-r="badge" hidden></span>';
  controls.appendChild(badgeWrap);

  const legend = elDiv('legend',
    '<span><i class="dot" style="background:var(--signal)"></i>kurva f(x)</span>' +
    '<span><i class="dot" style="background:var(--incorrect)"></i>asimtot tegak</span>' +
    '<span><i class="dot" style="background:var(--medal)"></i>asimtot datar</span>');
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
    const dt = a * d - b * c;
    const eps = 0.001;
    const undef = Math.abs(c) < eps && Math.abs(d) < eps;
    const linear = !undef && Math.abs(c) < eps;
    const degen = Math.abs(c) >= eps && Math.abs(dt) < eps;
    const hasAsym = Math.abs(c) >= eps && !degen;

    // kurva: sampling dengan pemutusan di dekat asimtot & luar jendela
    let dPath = '', pen = false;
    if (!undef) {
      for (let x = -6.5; x <= 6.5; x += 0.05) {
        const den = c * x + d;
        if (Math.abs(den) < 0.04) { pen = false; continue; }
        const y = (a * x + b) / den;
        if (Math.abs(y) > 8) { pen = false; continue; }
        dPath += (pen ? ' L ' : ' M ') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1);
        pen = true;
      }
    }
    curve.setAttribute('d', dPath);
    curve.setAttribute('display', dPath ? '' : 'none');

    if (hasAsym) {
      const xv = -d / c, yh = a / c;
      vaLn.setAttribute('x1', sx(xv)); vaLn.setAttribute('x2', sx(xv));
      haLn.setAttribute('y1', sy(yh)); haLn.setAttribute('y2', sy(yh));
      vaLn.setAttribute('display', ''); haLn.setAttribute('display', '');
    } else {
      vaLn.setAttribute('display', 'none'); haLn.setAttribute('display', 'none');
    }

    if (degen) {
      hole.setAttribute('cx', sx(-d / c)); hole.setAttribute('cy', sy(a / c));
      hole.setAttribute('display', '');
    } else {
      hole.setAttribute('display', 'none');
    }

    q('[data-r="va"]').textContent = hasAsym ? 'x = ' + fmt(-d / c) : '\u2014';
    q('[data-r="ha"]').textContent = hasAsym ? 'y = ' + fmt(a / c) : '\u2014';
    q('[data-r="icp"]').textContent = Math.abs(d) >= eps ? '(0, ' + fmt(b / d) + ')' : '\u2014';
    q('[data-r="det"]').textContent = fmt(dt);

    const badge = q('[data-r="badge"]');
    badge.hidden = !degen;
    if (degen) badge.textContent = 'ad \u2212 bc = 0 \u00b7 kurva runtuh: garis datar berlubang!';

    note.textContent = undef
      ? 'Fungsi tak terdefinisi \u2014 penyebutnya nol untuk semua x. Geser c atau d menjauh dari nol.'
      : linear
        ? 'Tanpa asimtot: penyebutnya konstan, jadi f(x) = (ax + b)/d hanyalah garis lurus biasa. Asimtot lahir dari penyebut yang bisa menuju nol.'
        : degen
          ? 'Pembilang adalah kelipatan penyebut \u2014 keduanya saling tercoret, dan kurva runtuh menjadi garis datar y = a/c dengan satu lubang di x = \u2212d/c. Ini determinan lagi: ad \u2212 bc = 0!'
          : 'Kurva menempel makin dekat ke garis putus-putus, tapi tak pernah menyentuhnya \u2014 itulah asimtot. Geser slider dan perhatikan asimtot tegak x = \u2212d/c serta datar y = a/c ikut berpindah.';

    controls.querySelectorAll('output[data-k]').forEach(o => {
      const k = o.dataset.k;
      const v = k === 'a' ? a : k === 'b' ? b : k === 'c' ? c : d;
      o.textContent = fmt(v);
    });
  }

  render();
}

/* ==========================================================================
   SIMULASI 9 — Laboratorium Turunan (kalkulus.html)
   Geser titik di sepanjang kurva: garis singgung emas mengikuti, dan
   gradiennya = f'(x). Saat f'(x) = 0: titik stasioner.
   ========================================================================== */
function initTurunanLab() {
  const host = document.getElementById('widget-turunan');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const SIZE = 340, CX = 170, CY = 170, U = 38;
  const sx = x => CX + x * U;
  const sy = y => CY - y * U;
  const clamp = v => Math.max(-4, Math.min(4, v));
  const snap = v => Math.round(v * 4) / 4;
  const fmt = v => {
    let s = String(Math.round(v * 100) / 100);
    if (s === '-0') s = '0';
    return s.replace('-', '\u2212').replace('.', ',');
  };

  const FUNCS = {
    'Parabola': { f: x => x * x / 2 - 2, fp: x => x },
    'Kubik': { f: x => (x * x * x - 3 * x) / 2, fp: x => (3 * x * x - 3) / 2 },
    'Sinus': { f: x => 2 * Math.sin(x), fp: x => 2 * Math.cos(x) }
  };
  let cur = 'Parabola';
  let x0 = 1;

  /* --- SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + SIZE + ' ' + SIZE, role: 'img',
    'aria-label': 'Kurva dengan titik yang bisa digeser dan garis singgung yang mengikutinya'
  });
  for (let i = -4; i <= 4; i++) {
    if (i !== 0) {
      svgEl('line', { x1: sx(i), y1: sy(-4.4), x2: sx(i), y2: sy(4.4), class: 'pb-grid' }, svg);
      svgEl('line', { x1: sx(-4.4), y1: sy(i), x2: sx(4.4), y2: sy(i), class: 'pb-grid' }, svg);
    }
  }
  svgEl('line', { x1: 0, y1: sy(0), x2: SIZE, y2: sy(0), class: 'pb-axis' }, svg);
  svgEl('line', { x1: sx(0), y1: 0, x2: sx(0), y2: SIZE, class: 'pb-axis' }, svg);

  const tangent = svgEl('line', { class: 'kl-tangent' }, svg);
  const curve = svgEl('path', { class: 'kl-curve', d: '' }, svg);
  const dot = svgEl('circle', { r: 7, fill: 'var(--signal)', stroke: 'var(--ink)', 'stroke-width': 2, style: 'cursor:grab' }, svg);

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');

  const chips = elDiv('chips');
  Object.keys(FUNCS).forEach(name => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'chip'; btn.textContent = name;
    btn.addEventListener('click', () => { cur = name; drawCurve(); render(); });
    chips.appendChild(btn);
  });
  controls.appendChild(chips);

  const row = elDiv('ctrl-row');
  row.innerHTML = '<label>posisi x <span style="color:var(--chalk-mute)">(geser titiknya juga bisa)</span></label><output></output>';
  const slider = document.createElement('input');
  slider.type = 'range'; slider.min = '-4'; slider.max = '4'; slider.step = '0.25'; slider.value = String(x0);
  slider.setAttribute('aria-label', 'posisi x');
  slider.addEventListener('input', () => { x0 = parseFloat(slider.value); render(); });
  controls.appendChild(row);
  controls.appendChild(slider);
  const out = row.querySelector('output');

  const readout = elDiv('readout',
    '<div><span>Titik x</span><b data-r="x"></b></div>' +
    '<div><span>Nilai f(x)</span><b data-r="fx"></b></div>' +
    '<div><span>Gradien f\u2032(x)</span><b data-r="dfx"></b></div>' +
    '<div><span>Perilaku kurva</span><b data-r="mode"></b></div>');
  controls.appendChild(readout);

  const badgeWrap = elDiv('');
  badgeWrap.innerHTML = '<span class="disc-badge gold" data-r="badge" hidden></span>';
  controls.appendChild(badgeWrap);

  const legend = elDiv('legend',
    '<span><i class="dot" style="background:var(--signal)"></i>kurva f(x)</span>' +
    '<span><i class="dot" style="background:var(--medal)"></i>garis singgung</span>');
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

  function drawCurve() {
    const f = FUNCS[cur].f;
    let dPath = '', pen = false;
    for (let x = -4.3; x <= 4.3; x += 0.05) {
      const y = f(x);
      if (Math.abs(y) > 4.6) { pen = false; continue; }
      dPath += (pen ? ' L ' : ' M ') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1);
      pen = true;
    }
    curve.setAttribute('d', dPath);
  }

  function render() {
    const f = FUNCS[cur].f, fp = FUNCS[cur].fp;
    const y0 = f(x0), m = fp(x0);

    dot.setAttribute('cx', sx(x0));
    dot.setAttribute('cy', sy(y0));
    // garis singgung: melintasi seluruh jendela melalui (x0, y0) bergradien m
    const xa = -7, xb = 7;
    tangent.setAttribute('x1', sx(xa)); tangent.setAttribute('y1', sy(y0 + m * (xa - x0)));
    tangent.setAttribute('x2', sx(xb)); tangent.setAttribute('y2', sy(y0 + m * (xb - x0)));

    const flat = Math.abs(m) < 0.01;
    q('[data-r="x"]').textContent = fmt(x0);
    q('[data-r="fx"]').textContent = fmt(y0);
    q('[data-r="dfx"]').textContent = fmt(m);
    q('[data-r="mode"]').textContent = flat ? 'stasioner' : m > 0 ? 'naik \u2197' : 'turun \u2198';

    const badge = q('[data-r="badge"]');
    badge.hidden = !flat;
    if (flat) badge.textContent = 'f\u2032(x) = 0 \u00b7 titik stasioner \u2014 puncak atau lembah!';

    note.textContent = flat
      ? 'Garis singgungnya mendatar sempurna: di sinilah kurva berhenti sejenak sebelum berbalik arah \u2014 kandidat nilai maksimum atau minimum. Inilah alasan syarat f\u2032(x) = 0 di soal optimasi.'
      : m > 0
        ? 'Gradien positif: kurva sedang menanjak. Makin curam tanjakannya, makin besar nilai f\u2032(x) \u2014 turunan adalah ukuran kecepatan naiknya.'
        : 'Gradien negatif: kurva sedang menurun. Geser titiknya sampai garis singgung mendatar untuk menemukan titik stasioner.';

    out.textContent = fmt(x0);
    if (slider.value !== String(x0)) slider.value = String(x0);
  }

  /* --- Seret titik --- */
  let drag = false;
  const svgXY = e => {
    const r = svg.getBoundingClientRect();
    if (!r.width) return null;
    return { x: (e.clientX - r.left) * (SIZE / r.width), y: (e.clientY - r.top) * (SIZE / r.height) };
  };
  svg.addEventListener('pointerdown', e => {
    const p = svgXY(e); if (!p) return;
    if (Math.hypot(p.x - sx(x0), p.y - sy(FUNCS[cur].f(x0))) > 28) return;
    drag = true;
    try { svg.setPointerCapture(e.pointerId); } catch (err) {}
    x0 = clamp(snap((p.x - CX) / U));
    render(); e.preventDefault();
  });
  svg.addEventListener('pointermove', e => {
    if (!drag) return;
    const p = svgXY(e); if (!p) return;
    x0 = clamp(snap((p.x - CX) / U));
    render();
  });
  ['pointerup', 'pointercancel'].forEach(ev => svg.addEventListener(ev, () => { drag = false; }));

  drawCurve();
  render();
}

/* ==========================================================================
   SIMULASI 10 — Skema Horner (aljabar.html)
   Geser k dan saksikan pembagian sintetik terisi: sel terakhir adalah sisa,
   dan sisa itu persis P(k) (Teorema Sisa). Sisa nol ⟹ (x − k) faktor.
   ========================================================================== */
function initHornerLab() {
  const host = document.getElementById('widget-horner');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const SUP = { 2: '\u00b2', 3: '\u00b3' };
  const PRESETS = [
    ['Tiga Akar', [1, -6, 11, -6]],
    ['Akar Kembar', [1, 0, -3, 2]],
    ['Satu Akar', [1, -2, 1, -2]],
    ['Tanpa Akar Bulat', [1, 0, -1, -1]]
  ];
  let coef = PRESETS[0][1].slice();
  let k = 1;

  const num = v => String(v).replace('-', '\u2212');
  const polyStr = cs => {
    const deg = cs.length - 1;
    let out = '';
    cs.forEach((c, i) => {
      if (c === 0) return;
      const pw = deg - i, a = Math.abs(c);
      const sign = out === '' ? (c < 0 ? '\u2212' : '') : (c < 0 ? ' \u2212 ' : ' + ');
      let term = (a === 1 && pw > 0) ? '' : String(a);
      if (pw === 1) term += 'x';
      else if (pw > 1) term += 'x' + (SUP[pw] || pw);
      out += sign + term;
    });
    return out || '0';
  };
  const divStr = kk => kk === 0 ? 'x' : 'x ' + (kk > 0 ? '\u2212 ' : '+ ') + Math.abs(kk);

  /* --- Tabel --- */
  const wrap = elDiv('hn-wrap');
  const table = document.createElement('table');
  table.className = 'hn-table';
  table.setAttribute('aria-label', 'Skema pembagian sintetik Horner');
  wrap.appendChild(table);

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');

  const chips = elDiv('chips');
  PRESETS.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'chip'; btn.textContent = p[0];
    btn.addEventListener('click', () => { coef = p[1].slice(); render(); });
    chips.appendChild(btn);
  });
  controls.appendChild(chips);

  const row = elDiv('ctrl-row');
  row.innerHTML = '<label>pembagi (x \u2212 k), nilai k</label><output></output>';
  const slider = document.createElement('input');
  slider.type = 'range'; slider.min = '-4'; slider.max = '4'; slider.step = '1'; slider.value = String(k);
  slider.setAttribute('aria-label', 'nilai k');
  slider.addEventListener('input', () => { k = parseInt(slider.value, 10); render(); });
  controls.appendChild(row);
  controls.appendChild(slider);
  const out = row.querySelector('output');

  const readout = elDiv('readout',
    '<div><span>Suku banyak P(x)</span><b data-r="poly"></b></div>' +
    '<div><span>Dibagi</span><b data-r="div"></b></div>' +
    '<div><span>Hasil bagi</span><b data-r="bagi"></b></div>' +
    '<div><span>Sisa</span><b data-r="sisa"></b></div>' +
    '<div><span>Nilai P(k)</span><b data-r="pk"></b></div>');
  controls.appendChild(readout);

  const badgeWrap = elDiv('');
  badgeWrap.innerHTML = '<span class="disc-badge gold" data-r="badge" hidden></span>';
  controls.appendChild(badgeWrap);

  const note = elDiv('w-note');
  controls.appendChild(note);

  const body = elDiv('widget-body');
  const canvas = elDiv('widget-canvas');
  canvas.appendChild(wrap);
  body.appendChild(canvas);
  body.appendChild(controls);
  mount.innerHTML = '';
  mount.appendChild(body);

  const q = sel => controls.querySelector(sel);

  function render() {
    const r0 = coef[0];
    const r1 = r0 * k + coef[1];
    const r2 = r1 * k + coef[2];
    const sisa = r2 * k + coef[3];
    const p1 = r0 * k, p2 = r1 * k, p3 = r2 * k;
    const habis = sisa === 0;

    table.innerHTML =
      '<tr class="hn-line">' +
        '<td class="hn-k">' + num(k) + '</td>' +
        coef.map(c => '<td class="hn-coef">' + num(c) + '</td>').join('') +
      '</tr>' +
      '<tr>' +
        '<td class="hn-cap">\u00d7 k \u2198</td>' +
        '<td class="hn-prod"></td>' +
        '<td class="hn-prod">' + num(p1) + '</td>' +
        '<td class="hn-prod">' + num(p2) + '</td>' +
        '<td class="hn-prod">' + num(p3) + '</td>' +
      '</tr>' +
      '<tr>' +
        '<td class="hn-cap">jumlah \u2193</td>' +
        '<td class="hn-res" data-hn="r0">' + num(r0) + '</td>' +
        '<td class="hn-res" data-hn="r1">' + num(r1) + '</td>' +
        '<td class="hn-res" data-hn="r2">' + num(r2) + '</td>' +
        '<td class="hn-sisa' + (habis ? ' zero' : '') + '" data-hn="sisa">' + num(sisa) + '</td>' +
      '</tr>';

    q('[data-r="poly"]').textContent = polyStr(coef);
    q('[data-r="div"]').textContent = '(' + divStr(k) + ')';
    q('[data-r="bagi"]').textContent = polyStr([r0, r1, r2]);
    q('[data-r="sisa"]').textContent = num(sisa);
    q('[data-r="pk"]').textContent = num(sisa);

    const badge = q('[data-r="badge"]');
    badge.hidden = !habis;
    if (habis) badge.textContent = 'sisa = 0 \u00b7 (' + divStr(k) + ') adalah faktor P(x)!';

    note.textContent = habis
      ? 'Sisa nol! Menurut Teorema Faktor, (' + divStr(k) + ') membagi habis P(x) \u2014 artinya ' + num(k) + ' adalah salah satu akarnya. Tiga sel biru di baris bawah adalah koefisien hasil baginya.'
      : 'Sel emas di ujung baris bawah adalah sisanya \u2014 dan perhatikan, nilainya persis sama dengan P(k). Itulah Teorema Sisa. Geser k sampai sisanya nol untuk memergoki sebuah akar.';

    out.textContent = num(k);
    if (slider.value !== String(k)) slider.value = String(k);
  }

  render();
}

/* ==========================================================================
   SIMULASI 11 — Lingkaran Analitik (geometri.html)
   Geser pusat dan jari-jari; bentuk baku dan bentuk umum bergerak bersamaan,
   memperlihatkan bahwa A = -2a, B = -2b, C = a^2 + b^2 - r^2.
   ========================================================================== */
function initCircleLab() {
  const host = document.getElementById('widget-lingkaran-analitik');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const SIZE = 340, O = 170, U = 18.75;
  const sx = x => O + x * U;
  const sy = y => O - y * U;
  const num = v => String(v).replace('-', '\u2212');

  const term = (coef, v) => {
    if (coef === 0) return '';
    const mag = Math.abs(coef);
    return (coef < 0 ? ' \u2212 ' : ' + ') + ((mag === 1 && v) ? '' : mag) + v;
  };
  const bakuTerm = (v, c) =>
    c === 0 ? v + '\u00b2' : '(' + v + (c > 0 ? ' \u2212 ' : ' + ') + Math.abs(c) + ')\u00b2';

  /* --- SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + SIZE + ' ' + SIZE,
    class: 'ca-svg',
    role: 'img',
    'aria-label': 'Bidang koordinat dengan lingkaran yang dapat diatur pusat dan jari-jarinya'
  });
  for (let i = -8; i <= 8; i++) {
    if (i === 0) continue;
    svgEl('line', { x1: sx(i), y1: sy(-8), x2: sx(i), y2: sy(8), class: 'ca-grid' }, svg);
    svgEl('line', { x1: sx(-8), y1: sy(i), x2: sx(8), y2: sy(i), class: 'ca-grid' }, svg);
  }
  svgEl('line', { x1: sx(-8), y1: sy(0), x2: sx(8), y2: sy(0), class: 'ca-axis' }, svg);
  svgEl('line', { x1: sx(0), y1: sy(-8), x2: sx(0), y2: sy(8), class: 'ca-axis' }, svg);
  [[sx(5) - 3, sy(0) + 15, '5'], [sx(-5) - 11, sy(0) + 15, '\u22125'],
   [sx(0) + 7, sy(5) + 4, '5'], [sx(0) + 7, sy(-5) + 4, '\u22125']].forEach(t => {
    const lbl = svgEl('text', { x: t[0], y: t[1], class: 'w-lbl' }, svg);
    lbl.textContent = t[2];
  });
  const circ = svgEl('circle', { cx: O, cy: O, r: 0, class: 'ca-circle' }, svg);
  const radLine = svgEl('line', { x1: O, y1: O, x2: O, y2: O, class: 'ca-rad' }, svg);
  const ctr = svgEl('circle', { cx: O, cy: O, r: 4.5, class: 'ca-center' }, svg);

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');
  const S = {};

  const PRESETS = [
    ['Pusat di O', 0, 0, 3],
    ['Menyinggung Sumbu-X', 2, 3, 3],
    ['Melalui O', 3, 4, 5],
    ['Menyinggung Sumbu-Y', -2, 1, 2]
  ];
  const chips = elDiv('chips');
  PRESETS.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = p[0];
    b.addEventListener('click', () => {
      S.a.inp.value = String(p[1]);
      S.b.inp.value = String(p[2]);
      S.r.inp.value = String(p[3]);
      render();
    });
    chips.appendChild(b);
  });
  controls.appendChild(chips);

  function mk(key, label, min, max, val) {
    const row = elDiv('ctrl-row');
    row.innerHTML = '<label>' + label + '</label><output></output>';
    const inp = document.createElement('input');
    inp.type = 'range';
    inp.min = String(min); inp.max = String(max); inp.step = '1'; inp.value = String(val);
    inp.setAttribute('aria-label', label);
    inp.addEventListener('input', render);
    controls.appendChild(row);
    controls.appendChild(inp);
    S[key] = { inp: inp, out: row.querySelector('output') };
  }
  mk('a', 'Pusat a (mendatar)', -5, 5, 0);
  mk('b', 'Pusat b (tegak)', -5, 5, 0);
  mk('r', 'Jari-jari r', 1, 5, 3);

  const readout = elDiv('readout',
    '<div class="full"><span>Bentuk baku</span><b data-r="baku"></b></div>' +
    '<div class="full"><span>Bentuk umum</span><b data-r="umum"></b></div>' +
    '<div><span>Pusat</span><b data-r="pusat"></b></div>' +
    '<div><span>Jari-jari</span><b data-r="jari"></b></div>');
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
    const a = parseInt(S.a.inp.value, 10);
    const b = parseInt(S.b.inp.value, 10);
    const r = parseInt(S.r.inp.value, 10);
    S.a.out.textContent = 'a = ' + num(a);
    S.b.out.textContent = 'b = ' + num(b);
    S.r.out.textContent = 'r = ' + r;

    circ.setAttribute('cx', sx(a)); circ.setAttribute('cy', sy(b));
    circ.setAttribute('r', (r * U).toFixed(1));
    ctr.setAttribute('cx', sx(a)); ctr.setAttribute('cy', sy(b));
    radLine.setAttribute('x1', sx(a)); radLine.setAttribute('y1', sy(b));
    radLine.setAttribute('x2', sx(a + r)); radLine.setAttribute('y2', sy(b));

    const A = -2 * a, B = -2 * b, Cc = a * a + b * b - r * r;
    q('[data-r="baku"]').textContent =
      bakuTerm('x', a) + ' + ' + bakuTerm('y', b) + ' = ' + (r * r);
    q('[data-r="umum"]').textContent =
      'x\u00b2 + y\u00b2' + term(A, 'x') + term(B, 'y') + term(Cc, '') + ' = 0';
    q('[data-r="pusat"]').textContent = '(' + num(a) + ', ' + num(b) + ')';
    q('[data-r="jari"]').textContent = String(r);

    let bd = '';
    if (a === 0 && b === 0) bd = 'berpusat di titik asal O';
    else if (Cc === 0) bd = 'melalui titik asal O';
    else if (Math.abs(b) === r) bd = 'menyinggung sumbu-X';
    else if (Math.abs(a) === r) bd = 'menyinggung sumbu-Y';
    const badge = q('[data-r="badge"]');
    badge.hidden = bd === '';
    if (bd) badge.textContent = bd;

    note.textContent = 'Bentuk umum lahir dari menjabarkan bentuk baku: A = \u22122a = ' + num(A) +
      ', B = \u22122b = ' + num(B) + ', dan C = a\u00b2 + b\u00b2 \u2212 r\u00b2 = ' + num(Cc) +
      '. Karena itu pusatnya selalu bisa dibaca balik sebagai (\u2212A/2, \u2212B/2).';
  }

  render();
}

/* ==========================================================================
   SIMULASI 12 — Laboratorium Benda Putar (kalkulus.html)
   Daerah di bawah kurva dicerminkan terhadap sumbu-X untuk membayangkan
   bendanya, lalu volumenya dihitung langsung dengan V = pi * integral y^2 dx.
   ========================================================================== */
function initVolumeLab() {
  const host = document.getElementById('widget-benda-putar');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const W = 340, H = 300, X0 = 32, AX = 150, SPAN = 284, HMAX = 96;
  const fmt = v => String(Math.round(v * 100) / 100).replace('.', ',');

  const PRESETS = [
    { name: 'Garis y = x', label: 'y = x', kuad: 'x\u00b2', f: x => x,
      vol: b => b * b * b / 3,
      cek: b => 'Bendanya kerucut berjari-jari ' + b + ' dan tinggi ' + b +
        '. Rumus bangun ruang \u2153\u03c0r\u00b2t memberi ' + fmt(b * b * b / 3) +
        '\u03c0 \u2014 sama persis dengan hasil integralnya.' },
    { name: 'Konstan y = 2', label: 'y = 2', kuad: '4', f: () => 2,
      vol: b => 4 * b,
      cek: b => 'Bendanya tabung berjari-jari 2 dan tinggi ' + b +
        '. Rumus \u03c0r\u00b2t memberi ' + fmt(4 * b) + '\u03c0 \u2014 cocok.' },
    { name: 'Akar y = \u221ax', label: 'y = \u221ax', kuad: 'x', f: x => Math.sqrt(x),
      vol: b => b * b / 2,
      cek: () => 'Mengkuadratkan \u221ax justru menyederhanakan: integralnya tinggal \u222bx dx. ' +
        'Itulah sebabnya soal benda putar sering memakai fungsi akar.' },
    { name: 'Parabola y = x\u00b2', label: 'y = x\u00b2', kuad: 'x\u2074', f: x => x * x,
      vol: b => Math.pow(b, 5) / 5,
      cek: () => 'Pangkatnya berlipat: y = x\u00b2 dikuadratkan menjadi x\u2074, sehingga volumenya tumbuh ' +
        'jauh lebih cepat daripada luas daerahnya.' }
  ];
  let pre = 0, b = 3;

  /* --- SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + W + ' ' + H,
    class: 'vr-svg',
    role: 'img',
    'aria-label': 'Daerah di bawah kurva beserta bayangan cerminnya untuk membayangkan benda putar'
  });
  const fillTop = svgEl('path', { d: '', class: 'vr-fill' }, svg);
  const fillBot = svgEl('path', { d: '', class: 'vr-fill mirror' }, svg);
  svgEl('line', { x1: X0 - 12, y1: AX, x2: X0 + SPAN + 8, y2: AX, class: 'vr-axis' }, svg);
  svgEl('line', { x1: X0, y1: 28, x2: X0, y2: H - 28, class: 'vr-axis' }, svg);
  const curveTop = svgEl('path', { d: '', class: 'vr-curve' }, svg);
  const curveBot = svgEl('path', { d: '', class: 'vr-curve mirror' }, svg);
  const cap = svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 0, class: 'vr-cap' }, svg);
  const lblB = svgEl('text', { x: 0, y: AX + 18, class: 'w-lbl' }, svg);

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');
  const chips = elDiv('chips');
  PRESETS.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'chip'; btn.textContent = p.name;
    btn.addEventListener('click', () => { pre = i; render(); });
    chips.appendChild(btn);
  });
  controls.appendChild(chips);

  const row = elDiv('ctrl-row');
  row.innerHTML = '<label>Batas atas b</label><output></output>';
  const slider = document.createElement('input');
  slider.type = 'range'; slider.min = '1'; slider.max = '5'; slider.step = '1'; slider.value = String(b);
  slider.setAttribute('aria-label', 'Batas atas b');
  slider.addEventListener('input', () => { b = parseInt(slider.value, 10); render(); });
  controls.appendChild(row);
  controls.appendChild(slider);
  const out = row.querySelector('output');

  const readout = elDiv('readout',
    '<div><span>Kurva</span><b data-r="fungsi"></b></div>' +
    '<div><span>Batas</span><b data-r="batas"></b></div>' +
    '<div class="full"><span>Rumus</span><b data-r="rumus"></b></div>' +
    '<div><span>Volume</span><b data-r="volume"></b></div>');
  controls.appendChild(readout);

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
    const P = PRESETS[pre];
    const N = 60;
    let ymax = 0;
    for (let i = 0; i <= N; i++) ymax = Math.max(ymax, P.f(b * i / N));
    if (ymax <= 0) ymax = 1;
    const kx = SPAN / b, ky = HMAX / ymax;
    const px = x => X0 + x * kx;
    const py = y => AX - y * ky;

    let up = '', dn = '';
    for (let i = 0; i <= N; i++) {
      const x = b * i / N, y = P.f(x);
      up += (i ? ' L ' : 'M ') + px(x).toFixed(1) + ' ' + py(y).toFixed(1);
      dn += (i ? ' L ' : 'M ') + px(x).toFixed(1) + ' ' + (AX + (AX - py(y))).toFixed(1);
    }
    curveTop.setAttribute('d', up);
    curveBot.setAttribute('d', dn);
    fillTop.setAttribute('d', up + ' L ' + px(b).toFixed(1) + ' ' + AX + ' L ' + X0 + ' ' + AX + ' Z');
    fillBot.setAttribute('d', dn + ' L ' + px(b).toFixed(1) + ' ' + AX + ' L ' + X0 + ' ' + AX + ' Z');
    cap.setAttribute('x1', px(b).toFixed(1));
    cap.setAttribute('y1', py(P.f(b)).toFixed(1));
    cap.setAttribute('x2', px(b).toFixed(1));
    cap.setAttribute('y2', (AX + (AX - py(P.f(b)))).toFixed(1));
    lblB.setAttribute('x', px(b) - 4);
    lblB.textContent = String(b);

    out.textContent = 'b = ' + b;
    q('[data-r="fungsi"]').textContent = P.label;
    q('[data-r="batas"]').textContent = '0 sampai ' + b;
    q('[data-r="rumus"]').textContent = '\u03c0 \u222b ' + P.kuad + ' dx, dari 0 sampai ' + b;
    q('[data-r="volume"]').textContent = fmt(P.vol(b)) + '\u03c0';
    note.textContent = P.cek(b);
  }

  render();
}

/* ==========================================================================
   SIMULASI 13 — Laboratorium Daerah Penyelesaian (aljabar.html)
   Irisan beberapa setengah bidang dihitung langsung: setiap pasang garis
   batas dipotongkan, titik yang memenuhi SEMUA kendala disimpan sebagai
   titik pojok, lalu diurutkan melingkar menjadi poligon.
   ========================================================================== */
function initRegionLab() {
  const host = document.getElementById('widget-daerah');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const SIZE = 340, OX = 36, OY = 304, U = 27, VMAX = 10, EPS = 1e-9;
  const px = x => OX + x * U;
  const py = y => OY - y * U;
  const fmt = v => String(Math.round(v * 100) / 100).replace('.', ',');
  const pt = p => '(' + fmt(p.x) + ', ' + fmt(p.y) + ')';

  /* Kendala ditulis a·x + b·y (op) c; disimpan ternormalisasi jadi a·x + b·y <= c */
  const K = (a, b, op, c) => ({ a: a, b: b, op: op, c: c });
  const norm = k => k.op === '\u2265' ? { a: -k.a, b: -k.b, c: -k.c } : { a: k.a, b: k.b, c: k.c };
  const teks = k => {
    const kiri = (k.a === 0 ? '' : (k.a === 1 ? 'x' : k.a === -1 ? '\u2212x' : k.a + 'x')) +
      (k.b === 0 ? '' : (k.a === 0 ? (k.b === 1 ? 'y' : k.b === -1 ? '\u2212y' : k.b + 'y')
        : (k.b > 0 ? ' + ' : ' \u2212 ') + (Math.abs(k.b) === 1 ? 'y' : Math.abs(k.b) + 'y')));
    return kiri + ' ' + k.op + ' ' + String(k.c).replace('-', '\u2212');
  };

  const PRESETS = [
    { name: 'Segitiga', base: [K(1, 0, '\u2265', 0), K(0, 1, '\u2265', 0)], akhir: [1, 1, '\u2264'], k: 4 },
    { name: 'Dua Kendala', base: [K(1, 0, '\u2265', 0), K(0, 1, '\u2265', 0), K(2, 1, '\u2264', 8)], akhir: [1, 2, '\u2264'], k: 10 },
    { name: 'Berbatas x', base: [K(1, 0, '\u2265', 0), K(0, 1, '\u2265', 0), K(1, 1, '\u2264', 6)], akhir: [1, 0, '\u2264'], k: 3 },
    { name: 'Tanpa Irisan', base: [K(1, 0, '\u2265', 0), K(0, 1, '\u2265', 0), K(1, 1, '\u2264', 2)], akhir: [1, 1, '\u2265'], k: 5 }
  ];
  let pre = 0, kVal = PRESETS[0].k;

  /* --- SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + SIZE + ' ' + SIZE,
    class: 'fr-svg',
    role: 'img',
    'aria-label': 'Bidang koordinat dengan daerah penyelesaian sistem pertidaksamaan linear'
  });
  for (let i = 1; i <= VMAX; i++) {
    svgEl('line', { x1: px(i), y1: py(0), x2: px(i), y2: py(VMAX), class: 'fr-grid' }, svg);
    svgEl('line', { x1: px(0), y1: py(i), x2: px(VMAX), y2: py(i), class: 'fr-grid' }, svg);
  }
  svgEl('line', { x1: px(0) - 10, y1: py(0), x2: px(VMAX) + 8, y2: py(0), class: 'fr-axis' }, svg);
  svgEl('line', { x1: px(0), y1: py(0) + 10, x2: px(0), y2: py(VMAX) - 8, class: 'fr-axis' }, svg);
  [[px(5) - 3, py(0) + 16, '5'], [px(10) - 6, py(0) + 16, '10'],
   [px(0) - 14, py(5) + 4, '5'], [px(0) - 20, py(10) + 4, '10']].forEach(t => {
    const lbl = svgEl('text', { x: t[0], y: t[1], class: 'w-lbl' }, svg);
    lbl.textContent = t[2];
  });
  const lineLayer = svgEl('g', {}, svg);
  const poly = svgEl('polygon', { points: '', class: 'fr-poly' }, svg);
  const dotLayer = svgEl('g', {}, svg);

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');
  const chips = elDiv('chips');
  PRESETS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = p.name;
    b.addEventListener('click', () => { pre = i; kVal = p.k; slider.value = String(kVal); render(); });
    chips.appendChild(b);
  });
  controls.appendChild(chips);

  const row = elDiv('ctrl-row');
  row.innerHTML = '<label>Batas kendala terakhir</label><output></output>';
  const slider = document.createElement('input');
  slider.type = 'range'; slider.min = '0'; slider.max = '10'; slider.step = '1'; slider.value = String(kVal);
  slider.setAttribute('aria-label', 'Batas kendala terakhir');
  slider.addEventListener('input', () => { kVal = parseInt(slider.value, 10); render(); });
  controls.appendChild(row);
  controls.appendChild(slider);
  const out = row.querySelector('output');

  const readout = elDiv('readout',
    '<div class="full"><span>Sistem pertidaksamaan</span><b data-r="sistem"></b></div>' +
    '<div><span>Banyak titik pojok</span><b data-r="banyak"></b></div>' +
    '<div><span>Maks f = 3x + 2y</span><b data-r="maks"></b></div>' +
    '<div class="full"><span>Titik pojok</span><b data-r="pojok"></b></div>');
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

  /* Potongan garis batas dengan kotak tampilan, untuk digambar */
  function ruas(n) {
    const cand = [];
    const push = (x, y) => {
      if (x >= -EPS && x <= VMAX + EPS && y >= -EPS && y <= VMAX + EPS) cand.push({ x: x, y: y });
    };
    if (Math.abs(n.b) > EPS) { push(0, n.c / n.b); push(VMAX, (n.c - n.a * VMAX) / n.b); }
    if (Math.abs(n.a) > EPS) { push(n.c / n.a, 0); push((n.c - n.b * VMAX) / n.a, VMAX); }
    if (cand.length < 2) return null;
    let best = null, jauh = -1;
    for (let i = 0; i < cand.length; i++) {
      for (let j = i + 1; j < cand.length; j++) {
        const d = Math.hypot(cand[i].x - cand[j].x, cand[i].y - cand[j].y);
        if (d > jauh) { jauh = d; best = [cand[i], cand[j]]; }
      }
    }
    return jauh > EPS ? best : null;
  }

  function render() {
    const P = PRESETS[pre];
    const kendala = P.base.concat([K(P.akhir[0], P.akhir[1], P.akhir[2], kVal)]);
    const N = kendala.map(norm);

    /* Titik pojok = perpotongan tiap pasang garis yang memenuhi semua kendala */
    const sudut = [];
    for (let i = 0; i < N.length; i++) {
      for (let j = i + 1; j < N.length; j++) {
        const det = N[i].a * N[j].b - N[j].a * N[i].b;
        if (Math.abs(det) < EPS) continue;
        const x = (N[i].c * N[j].b - N[j].c * N[i].b) / det;
        const y = (N[i].a * N[j].c - N[j].a * N[i].c) / det;
        if (N.every(n => n.a * x + n.b * y <= n.c + 1e-7)) {
          const kunci = x.toFixed(6) + ',' + y.toFixed(6);
          if (!sudut.some(s => s.kunci === kunci)) sudut.push({ x: x, y: y, kunci: kunci });
        }
      }
    }
    if (sudut.length > 2) {
      const cx = sudut.reduce((a, s) => a + s.x, 0) / sudut.length;
      const cy = sudut.reduce((a, s) => a + s.y, 0) / sudut.length;
      sudut.sort((p1, p2) => Math.atan2(p1.y - cy, p1.x - cx) - Math.atan2(p2.y - cy, p2.x - cx));
    }

    /* Gambar */
    lineLayer.innerHTML = '';
    N.forEach(n => {
      const r = ruas(n);
      if (r) svgEl('line', {
        x1: px(r[0].x), y1: py(r[0].y), x2: px(r[1].x), y2: py(r[1].y), class: 'fr-line'
      }, lineLayer);
    });
    poly.setAttribute('points', sudut.map(s => px(s.x).toFixed(1) + ',' + py(s.y).toFixed(1)).join(' '));
    dotLayer.innerHTML = '';
    sudut.forEach(s => svgEl('circle', { cx: px(s.x), cy: py(s.y), r: 4.5, class: 'fr-vertex' }, dotLayer));

    /* Panel */
    out.textContent = 'batas = ' + kVal;
    q('[data-r="sistem"]').textContent = kendala.map(teks).join(',  ');
    q('[data-r="banyak"]').textContent = String(sudut.length);
    q('[data-r="pojok"]').textContent = sudut.length ? sudut.map(pt).join('  \u00b7  ') : '\u2014';

    const kosong = sudut.length === 0;
    let maks = null;
    sudut.forEach(s => {
      const f = 3 * s.x + 2 * s.y;
      if (maks === null || f > maks.f + EPS) maks = { f: f, s: s };
    });
    q('[data-r="maks"]').textContent = maks ? fmt(maks.f) : '\u2014';

    const badge = q('[data-r="badge"]');
    badge.hidden = !kosong;
    if (kosong) badge.textContent = 'irisannya kosong \u00b7 tidak ada penyelesaian';

    note.textContent = kosong
      ? 'Kendala-kendalanya saling bertentangan, jadi tak ada satu pun titik yang memenuhi semuanya. Geser batasnya sampai daerahnya muncul kembali.'
      : 'Program linear tak perlu menguji seluruh daerah \u2014 cukup titik pojoknya. Di sini f = 3x + 2y mencapai ' +
        fmt(maks.f) + ' di titik ' + pt(maks.s) + '.';
  }

  render();
}

/* ==========================================================================
   SIMULASI 14 — Laboratorium Transformasi (geometri.html)
   Sebuah segitiga siku-siku tak simetris dipetakan oleh transformasi terpilih,
   diulang n kali. Karena bangunnya tak simetris, pencerminan benar-benar
   terlihat membalik. Lencana menyala saat komposisinya kembali jadi identitas.
   ========================================================================== */
function initTransformLab() {
  const host = document.getElementById('widget-transformasi');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const SIZE = 340, C0 = 170, SPAN = 148;
  const fmt = v => {
    let t = String(Math.round(v * 100) / 100);
    if (t === '-0') t = '0';
    return t.replace('-', '\u2212');
  };
  const tp = p => '(' + fmt(p.x) + ', ' + fmt(p.y) + ')';

  const ASLI = [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }];
  const luas = pts => Math.abs(pts.reduce((s, p, i) => {
    const q = pts[(i + 1) % pts.length];
    return s + p.x * q.y - q.x * p.y;
  }, 0)) / 2;

  const TRANS = [
    { nama: 'Translasi (3, 2)', aturan: '(x + 3, y + 2)', m: null,
      f: p => ({ x: p.x + 3, y: p.y + 2 }) },
    { nama: 'Refleksi Sumbu-X', aturan: '(x, \u2212y)', m: [1, 0, 0, -1],
      f: p => ({ x: p.x, y: -p.y }) },
    { nama: 'Refleksi y = x', aturan: '(y, x)', m: [0, 1, 1, 0],
      f: p => ({ x: p.y, y: p.x }) },
    { nama: 'Rotasi 90\u00b0', aturan: '(\u2212y, x)', m: [0, -1, 1, 0],
      f: p => ({ x: -p.y, y: p.x }) },
    { nama: 'Rotasi 180\u00b0', aturan: '(\u2212x, \u2212y)', m: [-1, 0, 0, -1],
      f: p => ({ x: -p.x, y: -p.y }) },
    { nama: 'Dilatasi 2\u00d7', aturan: '(2x, 2y)', m: [2, 0, 0, 2],
      f: p => ({ x: 2 * p.x, y: 2 * p.y }) }
  ];
  let pre = 3, n = 1;

  /* --- SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + SIZE + ' ' + SIZE,
    class: 'tf-svg',
    role: 'img',
    'aria-label': 'Bidang koordinat memperlihatkan sebuah segitiga beserta bayangannya setelah transformasi'
  });
  const gridLayer = svgEl('g', {}, svg);
  const axisX = svgEl('line', { class: 'tf-axis' }, svg);
  const axisY = svgEl('line', { class: 'tf-axis' }, svg);
  const poliAsli = svgEl('polygon', { points: '', class: 'tf-asli' }, svg);
  const poliBayangan = svgEl('polygon', { points: '', class: 'tf-bayangan' }, svg);
  const dotLayer = svgEl('g', {}, svg);

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');
  const chips = elDiv('chips');
  TRANS.forEach((t, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = t.nama;
    b.addEventListener('click', () => { pre = i; render(); });
    chips.appendChild(b);
  });
  controls.appendChild(chips);

  const row = elDiv('ctrl-row');
  row.innerHTML = '<label>Diterapkan berulang</label><output></output>';
  const slider = document.createElement('input');
  slider.type = 'range'; slider.min = '1'; slider.max = '4'; slider.step = '1'; slider.value = '1';
  slider.setAttribute('aria-label', 'Banyak pengulangan transformasi');
  slider.addEventListener('input', () => { n = parseInt(slider.value, 10); render(); });
  controls.appendChild(row);
  controls.appendChild(slider);
  const out = row.querySelector('output');

  const readout = elDiv('readout',
    '<div><span>Aturan</span><b data-r="aturan"></b></div>' +
    '<div><span>Matriks</span><b data-r="matriks"></b></div>' +
    '<div class="full"><span>Bayangan titik sudut</span><b data-r="bayangan"></b></div>' +
    '<div><span>Luas asli</span><b data-r="luas-asli"></b></div>' +
    '<div><span>Luas bayangan</span><b data-r="luas"></b></div>');
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
    const T = TRANS[pre];
    let img = ASLI.slice();
    for (let i = 0; i < n; i++) img = img.map(T.f);

    /* Skala otomatis agar bangun asli dan bayangannya selalu muat */
    let R = 5;
    ASLI.concat(img).forEach(p => { R = Math.max(R, Math.abs(p.x) + 1, Math.abs(p.y) + 1); });
    R = Math.ceil(R);
    const U = SPAN / R;
    const sx = x => C0 + x * U;
    const sy = y => C0 - y * U;
    const step = R <= 6 ? 1 : R <= 12 ? 2 : R <= 30 ? 5 : 10;

    gridLayer.innerHTML = '';
    for (let i = -R; i <= R; i += step) {
      if (i === 0) continue;
      svgEl('line', { x1: sx(i), y1: sy(-R), x2: sx(i), y2: sy(R), class: 'tf-grid' }, gridLayer);
      svgEl('line', { x1: sx(-R), y1: sy(i), x2: sx(R), y2: sy(i), class: 'tf-grid' }, gridLayer);
    }
    axisX.setAttribute('x1', sx(-R)); axisX.setAttribute('y1', sy(0));
    axisX.setAttribute('x2', sx(R)); axisX.setAttribute('y2', sy(0));
    axisY.setAttribute('x1', sx(0)); axisY.setAttribute('y1', sy(-R));
    axisY.setAttribute('x2', sx(0)); axisY.setAttribute('y2', sy(R));

    const pts = arr => arr.map(p => sx(p.x).toFixed(1) + ',' + sy(p.y).toFixed(1)).join(' ');
    poliAsli.setAttribute('points', pts(ASLI));
    poliBayangan.setAttribute('points', pts(img));
    dotLayer.innerHTML = '';
    ASLI.forEach(p => svgEl('circle', { cx: sx(p.x), cy: sy(p.y), r: 3, class: 'tf-titik asal' }, dotLayer));
    img.forEach(p => svgEl('circle', { cx: sx(p.x), cy: sy(p.y), r: 4, class: 'tf-titik' }, dotLayer));

    /* Panel */
    out.textContent = n + '\u00d7';
    q('[data-r="aturan"]').textContent = '(x, y) \u2192 ' + T.aturan;
    q('[data-r="matriks"]').innerHTML = T.m
      ? '<span class="tf-mat">' + fmt(T.m[0]) + '&nbsp;&nbsp;' + fmt(T.m[1]) + '<br>' +
        fmt(T.m[2]) + '&nbsp;&nbsp;' + fmt(T.m[3]) + '</span>'
      : '\u2014 bukan perkalian';
    q('[data-r="bayangan"]').textContent = img.map(tp).join('  \u00b7  ');
    q('[data-r="luas-asli"]').textContent = fmt(luas(ASLI));
    q('[data-r="luas"]').textContent = fmt(luas(img));

    const kembali = img.every((p, i) =>
      Math.abs(p.x - ASLI[i].x) < 1e-9 && Math.abs(p.y - ASLI[i].y) < 1e-9);
    const badge = q('[data-r="badge"]');
    badge.hidden = !kembali;
    if (kembali) badge.textContent = 'kembali ke bentuk semula \u00b7 identitas';

    note.textContent = kembali
      ? 'Diterapkan ' + n + ' kali, transformasi ini membatalkan dirinya sendiri dan bangunnya kembali persis ke tempat asal.'
      : (T.m === null
        ? 'Translasi menggeser tanpa mengubah bentuk, ukuran, maupun arah hadapnya \u2014 dan karena tidak mempertahankan titik asal, ia tak bisa ditulis sebagai perkalian matriks 2\u00d72.'
        : (luas(img) === luas(ASLI)
          ? 'Luasnya tetap ' + fmt(luas(ASLI)) + ' satuan: pencerminan dan rotasi memindahkan bangun tanpa mengubah ukurannya.'
          : 'Setiap panjang terkali 2, sehingga luasnya terkali 2\u00b2 = 4 tiap penerapan \u2014 kini ' +
            fmt(luas(img)) + ' satuan.'));
  }

  render();
}

/* ==========================================================================
   SIMULASI 15 — Laboratorium Model Fungsi (prakalkulus.html)
   Empat kumpulan data nyata. Selisih, selisih kedua, dan rasionya dihitung
   berdampingan supaya terlihat MANA yang tetap — dari situlah keluarga
   modelnya ditentukan, lalu parameternya dibaca balik dari data.
   ========================================================================== */
function initModelLab() {
  const host = document.getElementById('widget-model');
  if (!host) return;
  const mount = host.querySelector('.widget-mount');
  if (!mount) return;

  const W = 340, H = 250, PL = 40, PR = 12, PT = 16, PB = 32;
  const XMAX = 8;

  const num = v => {
    let t = String(Math.round(v * 1000) / 1000);
    if (t === '-0') t = '0';
    return t.replace('-', '\u2212').replace('.', ',');
  };
  const deret = a => a.length ? a.map(num).join('  \u00b7  ') : '\u2014';

  const DATA = [
    { nama: 'Sewa Skuter', ket: 'Biaya (ribu Rp) setelah x jam', y: [6, 10, 14, 18, 22, 26] },
    { nama: 'Koloni Bakteri', ket: 'Bakteri (ribu) pada jam ke-x', y: [2, 6, 18, 54, 162, 486] },
    { nama: 'Lintasan Bola', ket: 'Tinggi bola (m) pada detik ke-x', y: [0, 15, 20, 15, 0] },
    { nama: 'Kadar Obat', ket: 'Kadar obat (mg) setelah x jam', y: [64, 32, 16, 8, 4, 2] }
  ];
  let pre = 0, nPred = 6;

  function analisis(y) {
    const d1 = [], d2 = [], r = [];
    for (let i = 1; i < y.length; i++) d1.push(y[i] - y[i - 1]);
    for (let i = 1; i < d1.length; i++) d2.push(d1[i] - d1[i - 1]);
    for (let i = 1; i < y.length; i++) r.push(y[i - 1] === 0 ? NaN : y[i] / y[i - 1]);
    const tetap = a => a.length > 0 && a.every(v => Math.abs(v - a[0]) < 1e-9);

    if (tetap(d1)) {
      const m = d1[0], c = y[0];
      let t = 'f(x) = ' + (m === 1 ? '' : m === -1 ? '\u2212' : num(m)) + 'x';
      if (c !== 0) t += (c > 0 ? ' + ' : ' \u2212 ') + Math.abs(c);
      return { d1: d1, d2: d2, r: r, keluarga: 'Linear', model: t,
        diagnosis: 'selisih tetap ' + num(m) + ' \u2192 linear',
        f: x => m * x + c };
    }
    if (tetap(d2)) {
      const a = d2[0] / 2, b = d1[0] - a, c = y[0];
      let t = 'f(x) = ' + (a === 1 ? '' : a === -1 ? '\u2212' : num(a)) + 'x\u00b2';
      if (b !== 0) t += (b > 0 ? ' + ' : ' \u2212 ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'x';
      if (c !== 0) t += (c > 0 ? ' + ' : ' \u2212 ') + Math.abs(c);
      return { d1: d1, d2: d2, r: r, keluarga: 'Kuadratik', model: t,
        diagnosis: 'selisih kedua tetap ' + num(d2[0]) + ' \u2192 kuadratik',
        f: x => a * x * x + b * x + c };
    }
    const a = y[0], b = r[0];
    return { d1: d1, d2: d2, r: r, keluarga: 'Eksponensial',
      model: 'f(x) = ' + num(a) + ' \u00b7 ' + num(b) + '\u02e3',
      diagnosis: 'rasio tetap ' + num(b) + ' \u2192 eksponensial',
      f: x => a * Math.pow(b, x) };
  }

  /* --- SVG --- */
  const svg = svgEl('svg', {
    viewBox: '0 0 ' + W + ' ' + H,
    class: 'mf-svg',
    role: 'img',
    'aria-label': 'Diagram pencar data beserta kurva model yang cocok'
  });
  const gridLayer = svgEl('g', {}, svg);
  const axisX = svgEl('line', { class: 'mf-axis' }, svg);
  const axisY = svgEl('line', { class: 'mf-axis' }, svg);
  const curve = svgEl('path', { d: '', class: 'mf-curve' }, svg);
  const dotLayer = svgEl('g', {}, svg);

  /* --- Kontrol --- */
  const controls = elDiv('widget-controls');
  const chips = elDiv('chips');
  DATA.forEach((d, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = d.nama;
    b.addEventListener('click', () => { pre = i; render(); });
    chips.appendChild(b);
  });
  controls.appendChild(chips);

  const row = elDiv('ctrl-row');
  row.innerHTML = '<label>Prediksi pada x</label><output></output>';
  const slider = document.createElement('input');
  slider.type = 'range'; slider.min = '0'; slider.max = String(XMAX); slider.step = '1';
  slider.value = String(nPred);
  slider.setAttribute('aria-label', 'Nilai x untuk prediksi');
  slider.addEventListener('input', () => { nPred = parseInt(slider.value, 10); render(); });
  controls.appendChild(row);
  controls.appendChild(slider);
  const out = row.querySelector('output');

  const readout = elDiv('readout',
    '<div class="full"><span>Data f(x)</span><b data-r="data"></b></div>' +
    '<div class="full"><span>Selisih \u0394</span><b data-r="d1"></b></div>' +
    '<div class="full"><span>Selisih kedua</span><b data-r="d2"></b></div>' +
    '<div class="full"><span>Rasio</span><b data-r="rasio"></b></div>' +
    '<div><span>Keluarga</span><b data-r="keluarga"></b></div>' +
    '<div><span>Model</span><b data-r="model"></b></div>' +
    '<div class="full"><span>Prediksi</span><b data-r="prediksi"></b></div>');
  controls.appendChild(readout);

  const badgeWrap = elDiv('');
  badgeWrap.innerHTML = '<span class="disc-badge gold" data-r="badge"></span>';
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
    const D = DATA[pre];
    const A = analisis(D.y);

    /* Skala: sumbu-y mengikuti data saja supaya titiknya tetap terbaca */
    const ymin = Math.min(0, ...D.y);
    const ymax = Math.max(...D.y) * 1.12;
    const sx = x => PL + (x / XMAX) * (W - PL - PR);
    const sy = y => H - PB - ((y - ymin) / (ymax - ymin)) * (H - PT - PB);
    const muat = y => y >= ymin && y <= ymax;

    gridLayer.innerHTML = '';
    for (let i = 0; i <= XMAX; i++) {
      svgEl('line', { x1: sx(i), y1: sy(ymin), x2: sx(i), y2: sy(ymax), class: 'mf-grid' }, gridLayer);
    }
    axisX.setAttribute('x1', sx(0)); axisX.setAttribute('y1', sy(0));
    axisX.setAttribute('x2', sx(XMAX)); axisX.setAttribute('y2', sy(0));
    axisY.setAttribute('x1', sx(0)); axisY.setAttribute('y1', sy(ymin));
    axisY.setAttribute('x2', sx(0)); axisY.setAttribute('y2', sy(ymax));

    /* Kurva model, dipotong saat keluar bingkai */
    let d = '', turun = true;
    for (let i = 0; i <= 160; i++) {
      const x = XMAX * i / 160, y = A.f(x);
      if (!muat(y)) { turun = true; continue; }
      d += (turun ? 'M ' : ' L ') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1);
      turun = false;
    }
    curve.setAttribute('d', d);

    dotLayer.innerHTML = '';
    D.y.forEach((v, i) => svgEl('circle', { cx: sx(i), cy: sy(v), r: 4, class: 'mf-dot' }, dotLayer));
    const yp = A.f(nPred);
    if (muat(yp)) svgEl('circle', { cx: sx(nPred), cy: sy(yp), r: 5, class: 'mf-pred' }, dotLayer);

    /* Panel */
    out.textContent = 'x = ' + nPred;
    q('[data-r="data"]').textContent = deret(D.y);
    q('[data-r="d1"]').textContent = deret(A.d1);
    q('[data-r="d2"]').textContent = deret(A.d2);
    q('[data-r="rasio"]').textContent = A.r.some(v => !isFinite(v)) ? '\u2014' : deret(A.r);
    q('[data-r="keluarga"]').textContent = A.keluarga;
    q('[data-r="model"]').textContent = A.model;
    q('[data-r="prediksi"]').textContent = 'f(' + nPred + ') = ' + num(yp);
    q('[data-r="badge"]').textContent = A.diagnosis;

    const luar = nPred > D.y.length - 1;
    note.textContent = D.ket + '. Yang membedakan ketiga keluarga bukan bentuk grafiknya, melainkan pola perubahannya \u2014 di sini ' +
      A.diagnosis + '.' + (luar
        ? ' Prediksi di x = ' + nPred + ' berada di luar jangkauan data, jadi ini ekstrapolasi: sahih hanya bila polanya benar-benar berlanjut.'
        : ' Prediksi di x = ' + nPred + ' masih di dalam jangkauan data.');
  }

  render();
}

/* ==========================================================================
   SIMULASI UJIAN (simulasi.html)
   Menarik soal acak dari bank hasil panen, menjalankan pewaktu, dan menahan
   seluruh pembahasan sampai peserta menekan Selesai.
   ========================================================================== */
function initExam() {
  const akar = document.getElementById('exam-root');
  if (!akar || !window.KA_BANK) return;

  const BANK = window.KA_BANK.soal;
  const LABEL = window.KA_BANK.label;
  const q = sel => akar.querySelector(sel);
  const r = key => akar.querySelector('[data-r="' + key + '"]');
  const layar = nama => akar.querySelector('[data-layar="' + nama + '"]');

  const DASAR = ['mudah', 'sedang'];
  const LANJUT = ['sulit', 'olimpiade'];
  const pilihan = { paket: 'semua', tingkat: 'semua', jumlah: '20', waktu: '90' };

  let sesi = null, jamId = null;

  /* ---------- Alat ---------- */
  const acak = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const jam = d => {
    const m = Math.floor(Math.abs(d) / 60), s = Math.abs(d) % 60;
    return (d < 0 ? '-' : '') + m + ':' + String(s).padStart(2, '0');
  };
  const rumus = el => {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(el, {
        delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
        throwOnError: false
      });
    }
  };

  function tersedia() {
    let s = BANK;
    if (pilihan.paket !== 'semua') s = s.filter(x => x.mapel === pilihan.paket);
    else s = s.filter(x => !x.mapel.startsWith('tka'));
    if (pilihan.tingkat !== 'semua' && !pilihan.paket.startsWith('tka')) {
      const izin = pilihan.tingkat === 'dasar' ? DASAR : LANJUT;
      s = s.filter(x => izin.includes(x.tier));
    }
    return s;
  }

  /* ---------- Layar 1: penyiapan ---------- */
  akar.querySelectorAll('[data-pilih]').forEach(grup => {
    grup.addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (!b) return;
      grup.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      b.classList.add('active');
      pilihan[grup.dataset.pilih] = b.dataset.nilai;
      ringkas();
    });
  });

  function ringkas() {
    const ada = tersedia();
    const minta = pilihan.jumlah === 'semua' ? ada.length : Math.min(+pilihan.jumlah, ada.length);
    const detik = +pilihan.waktu * minta;
    const namaPaket = pilihan.paket === 'semua' ? 'sembilan mapel' : LABEL[pilihan.paket];
    let t = '<strong>' + minta + ' soal</strong> akan diambil acak dari ' + ada.length +
      ' soal ' + namaPaket;
    t += detik ? ' &middot; waktu <strong>' + jam(detik) + '</strong>' : ' &middot; <strong>tanpa batas waktu</strong>';
    if (ada.length === 0) t = 'Tidak ada soal yang cocok dengan saringan ini.';
    else if (minta < +pilihan.jumlah) t += '<br><em>Hanya ' + ada.length + ' soal tersedia, jadi semuanya dipakai.</em>';
    r('ringkas').innerHTML = t;
    q('[data-aksi="mulai"]').disabled = ada.length === 0;
  }

  /* ---------- Menjalankan sesi ---------- */
  function mulai() {
    const ada = tersedia();
    if (!ada.length) return;
    const n = pilihan.jumlah === 'semua' ? ada.length : Math.min(+pilihan.jumlah, ada.length);
    sesi = {
      soal: acak(ada).slice(0, n),
      jawab: new Array(n).fill(null),
      ragu: new Array(n).fill(false),
      kini: 0,
      sisa: +pilihan.waktu * n,
      berbatas: +pilihan.waktu > 0,
      mulaiPada: Date.now()
    };
    tampil('kerja');
    petaBangun();
    tampilSoal();
    if (sesi.berbatas) {
      jamId = setInterval(() => {
        sesi.sisa--;
        r('jam').textContent = jam(sesi.sisa);
        r('jam').classList.toggle('kritis', sesi.sisa <= 60);
        if (sesi.sisa <= 0) selesai(true);
      }, 1000);
      r('jam').textContent = jam(sesi.sisa);
    } else {
      r('jam').textContent = '∞';
    }
  }

  function tampil(nama) {
    ['setup', 'kerja', 'hasil'].forEach(x => { layar(x).hidden = x !== nama; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function petaBangun() {
    r('peta').innerHTML = sesi.soal.map((_, i) =>
      '<button type="button" class="exam-kotak" data-ke="' + i + '">' + (i + 1) + '</button>').join('');
    r('peta').onclick = e => {
      const b = e.target.closest('.exam-kotak');
      if (b) { sesi.kini = +b.dataset.ke; tampilSoal(); }
    };
  }

  function petaSegar() {
    [...r('peta').children].forEach((b, i) => {
      b.classList.toggle('terjawab', sesi.jawab[i] !== null);
      b.classList.toggle('ragu', sesi.ragu[i]);
      b.classList.toggle('kini', i === sesi.kini);
    });
    const n = sesi.jawab.filter(x => x !== null).length;
    r('terjawab').textContent = n + ' terjawab';
    r('maju').textContent = 'Soal ' + (sesi.kini + 1) + ' dari ' + sesi.soal.length;
    r('garis').style.width = (n / sesi.soal.length * 100) + '%';
    q('[data-aksi="ragu"]').classList.toggle('aktif', sesi.ragu[sesi.kini]);
  }

  function kartuSoal(s, ke, jawab, kunci) {
    const tag = s.tipe === 'tf' ? '<span class="quiz-tag tf">Benar–Salah</span>'
      : s.tipe === 'multi' ? '<span class="quiz-tag multi">Pilihan Ganda Kompleks</span>' : '';
    let t = '<div class="exam-kepala"><span class="exam-nomor">' + (ke + 1) + '</span>' +
      '<span class="exam-asal">' + LABEL[s.mapel] + '</span></div>' +
      '<p class="quiz-question">' + s.soal + '</p>' + tag +
      (s.gambar || '');

    if (s.tipe === 'tf') {
      t += '<div class="tf-list">' + s.baris.map((b, i) => {
        const dipilih = jawab ? jawab.split(',')[i] : '';
        return '<div class="tf-row"><p>' + b.p + '</p><div class="tf-btns">' +
          ['B', 'S'].map(v => '<button type="button" class="tf-btn' +
            (dipilih === v ? ' aktif' : '') +
            (kunci ? (b.a === v ? ' benar' : (dipilih === v ? ' salah' : '')) : '') +
            '" data-baris="' + i + '" data-tf="' + v + '"' + (kunci ? ' disabled' : '') + '>' +
            (v === 'B' ? 'Benar' : 'Salah') + '</button>').join('') +
          '</div></div>';
      }).join('') + '</div>';
    } else {
      const dipilih = jawab ? jawab.split(',') : [];
      const benar = s.jawab.split(',');
      t += '<div class="quiz-options ' + (s.kelas || '') + '">' + s.opsi.map(o => {
        let k = 'quiz-option';
        if (dipilih.includes(o.l)) k += ' dipilih';
        if (kunci) {
          if (benar.includes(o.l)) k += ' correct';
          else if (dipilih.includes(o.l)) k += ' incorrect';
        }
        return '<button type="button" class="' + k + '" data-option="' + o.l + '"' +
          (kunci ? ' disabled' : '') + '>' + o.h + '</button>';
      }).join('') + '</div>';
    }
    return t;
  }

  function tampilSoal() {
    const s = sesi.soal[sesi.kini];
    const kotak = r('soal');
    kotak.innerHTML = kartuSoal(s, sesi.kini, sesi.jawab[sesi.kini], false);
    rumus(kotak);
    petaSegar();

    if (s.tipe === 'tf') {
      kotak.querySelectorAll('.tf-btn').forEach(b => b.onclick = () => {
        const kini = (sesi.jawab[sesi.kini] || new Array(s.baris.length).fill('').join(',')).split(',');
        kini[+b.dataset.baris] = b.dataset.tf;
        sesi.jawab[sesi.kini] = kini.every(x => x) ? kini.join(',') : kini.join(',');
        if (!kini.some(x => x)) sesi.jawab[sesi.kini] = null;
        tampilSoal();
      });
    } else if (s.tipe === 'multi') {
      kotak.querySelectorAll('.quiz-option').forEach(b => b.onclick = () => {
        const kini = sesi.jawab[sesi.kini] ? sesi.jawab[sesi.kini].split(',') : [];
        const i = kini.indexOf(b.dataset.option);
        if (i >= 0) kini.splice(i, 1); else kini.push(b.dataset.option);
        kini.sort();
        sesi.jawab[sesi.kini] = kini.length ? kini.join(',') : null;
        tampilSoal();
      });
    } else {
      kotak.querySelectorAll('.quiz-option').forEach(b => b.onclick = () => {
        sesi.jawab[sesi.kini] = b.dataset.option;
        if (sesi.kini < sesi.soal.length - 1) { sesi.kini++; tampilSoal(); }
        else tampilSoal();
      });
    }
  }

  /* ---------- Penilaian ---------- */
  const cocok = (s, j) => {
    if (!j) return false;
    if (s.tipe === 'tf') return j === s.jawab;
    const a = j.split(',').sort().join(','), b = s.jawab.split(',').sort().join(',');
    return a === b;
  };

  function selesai(paksa) {
    if (!paksa) {
      const kosong = sesi.jawab.filter(x => x === null).length;
      const pesan = kosong
        ? 'Masih ada ' + kosong + ' soal yang belum dijawab. Selesaikan sekarang?'
        : 'Selesaikan dan lihat hasilnya?';
      if (!window.confirm(pesan)) return;
    }
    if (jamId) { clearInterval(jamId); jamId = null; }
    const benar = sesi.soal.filter((s, i) => cocok(s, sesi.jawab[i])).length;
    const total = sesi.soal.length;
    const pakai = Math.round((Date.now() - sesi.mulaiPada) / 1000);
    const persen = Math.round(benar / total * 100);

    const komentar = persen >= 85 ? 'Sangat baik — pertahankan ritmenya.'
      : persen >= 70 ? 'Bagus. Rapikan bagian yang masih goyah di bawah.'
      : persen >= 50 ? 'Separuh jalan. Pembahasan di bawah adalah tempat terbaik memulai.'
      : 'Belum apa-apa — ini justru daftar belanja belajarmu.';

    r('skor').innerHTML =
      '<div class="skor-angka"><strong>' + benar + '</strong><span>/ ' + total + '</span></div>' +
      '<div class="skor-persen">' + persen + '%</div>' +
      '<p class="skor-komentar">' + komentar + '</p>' +
      '<p class="skor-waktu">Waktu terpakai ' + jam(pakai) +
      (paksa ? ' · <strong>waktu habis</strong>' : '') + '</p>';

    const per = {};
    sesi.soal.forEach((s, i) => {
      const k = LABEL[s.mapel];
      per[k] = per[k] || { benar: 0, total: 0 };
      per[k].total++;
      if (cocok(s, sesi.jawab[i])) per[k].benar++;
    });
    r('rincian').innerHTML = '<div class="table-scroll"><table class="math-table"><thead><tr>' +
      '<th style="text-align:left;">Mapel</th><th>Benar</th><th>Soal</th><th>Capaian</th></tr></thead><tbody>' +
      Object.entries(per).sort((a, b) => a[1].benar / a[1].total - b[1].benar / b[1].total)
        .map(([k, v]) => '<tr><td style="text-align:left;">' + k + '</td><td>' + v.benar +
          '</td><td>' + v.total + '</td><td>' + Math.round(v.benar / v.total * 100) + '%</td></tr>').join('') +
      '</tbody></table></div>';

    r('review').innerHTML = sesi.soal.map((s, i) => {
      const ok = cocok(s, sesi.jawab[i]);
      const jw = sesi.jawab[i] || '—';
      return '<div class="exam-review-item ' + (ok ? 'benar' : 'salah') + '">' +
        '<div class="review-status">' + (ok ? '✓ Benar' : '✗ ' + (sesi.jawab[i] ? 'Salah' : 'Tidak dijawab')) + '</div>' +
        kartuSoal(s, i, sesi.jawab[i], true) +
        '<div class="review-kunci">Jawabanmu <strong>' + jw + '</strong> &middot; kunci <strong>' + s.jawab + '</strong></div>' +
        '<div class="review-bahas">' + s.bahas + '</div>' +
        '<a class="review-tautan" href="' + s.sumber + '">Buka materi ' + LABEL[s.mapel] + ' →</a>' +
        '</div>';
    }).join('');

    tampil('hasil');
    rumus(r('rincian'));
    rumus(r('review'));
  }

  /* ---------- Tombol ---------- */
  akar.addEventListener('click', e => {
    const b = e.target.closest('[data-aksi]');
    if (!b) return;
    const a = b.dataset.aksi;
    if (a === 'mulai') mulai();
    else if (a === 'selesai') selesai(false);
    else if (a === 'mundur' && sesi.kini > 0) { sesi.kini--; tampilSoal(); }
    else if (a === 'maju' && sesi.kini < sesi.soal.length - 1) { sesi.kini++; tampilSoal(); }
    else if (a === 'ragu') { sesi.ragu[sesi.kini] = !sesi.ragu[sesi.kini]; petaSegar(); }
    else if (a === 'ulang') { if (jamId) clearInterval(jamId); sesi = null; tampil('setup'); }
  });

  document.addEventListener('keydown', e => {
    if (layar('kerja').hidden || !sesi) return;
    if (e.key === 'ArrowLeft' && sesi.kini > 0) { sesi.kini--; tampilSoal(); }
    if (e.key === 'ArrowRight' && sesi.kini < sesi.soal.length - 1) { sesi.kini++; tampilSoal(); }
  });

  ringkas();
}
