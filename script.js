// ==========================================================================
// KHUSNI ACADEMY — script.js
// Navigasi mobile, tab tingkat kesulitan, mesin kuis, scroll-reveal, KaTeX.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initTierTabs();
  initQuizEngine();
  initScrollReveal();
  initKatex();
});

/* ---------- Navigasi mobile ---------- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Tab tingkat kesulitan (Mudah / Sedang / Sulit) ---------- */
function initTierTabs() {
  const groups = document.querySelectorAll('[data-tier-group]');
  groups.forEach(group => {
    const tabs = group.querySelectorAll('.tier-tab');
    const panels = group.querySelectorAll('.tier-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tier;
        tabs.forEach(t => t.classList.toggle('active', t === tab));
        panels.forEach(p => p.classList.toggle('active', p.dataset.tier === target));
      });
    });
  });
}

/* ---------- Mesin kuis interaktif ---------- */
function initQuizEngine() {
  document.querySelectorAll('.quiz-card').forEach(card => {
    const options = card.querySelectorAll('.quiz-option');
    const feedback = card.querySelector('.quiz-feedback');
    const correctAnswer = card.dataset.answer;

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        if (card.dataset.answered === 'true') return;
        card.dataset.answered = 'true';

        const chosen = opt.dataset.option;
        const isCorrect = chosen === correctAnswer;

        options.forEach(o => {
          o.disabled = true;
          if (o.dataset.option === correctAnswer) {
            o.classList.add(o === opt ? 'correct' : 'reveal-correct');
          } else if (o === opt) {
            o.classList.add('incorrect');
          }
        });

        if (feedback) {
          feedback.hidden = false;
          feedback.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
          const label = feedback.querySelector('strong');
          if (label) label.textContent = isCorrect ? 'Benar!' : 'Belum tepat';
        }

        updateScore(card.closest('.tier-panel'));
      });
    });
  });
}

function updateScore(panel) {
  if (!panel) return;
  const scoreEl = panel.querySelector('.tier-score strong');
  if (!scoreEl) return;
  const cards = panel.querySelectorAll('.quiz-card');
  const answered = panel.querySelectorAll('.quiz-card[data-answered="true"]');
  let correctCount = 0;
  answered.forEach(c => {
    const chosen = c.querySelector('.quiz-option.correct');
    if (chosen) correctCount++;
  });
  scoreEl.textContent = `${correctCount}/${cards.length}`;
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

/* ---------- Render KaTeX ---------- */
function initKatex() {
  if (typeof renderMathInElement !== 'function') return;
  renderMathInElement(document.body, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false
  });
}
