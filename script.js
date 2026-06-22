// ============================================================
// THE LEDGER — shared script, runs on every page
// ============================================================

// ---------- Currency config ----------
// Rates are approximate USD conversion factors for display purposes only.
const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.78 },
  INR: { symbol: '₹', rate: 83.3 },
  CAD: { symbol: '$', rate: 1.36 },
  AUD: { symbol: '$', rate: 1.51 },
  JPY: { symbol: '¥', rate: 156 }
};

let currentCurrency = localStorage.getItem ? 'USD' : 'USD';

function formatMoney(amountInSelectedCurrency, withSign = false) {
  const sym = CURRENCIES[currentCurrency].symbol;
  const sign = withSign ? (amountInSelectedCurrency >= 0 ? '+' : '-') : '';
  const abs = Math.abs(amountInSelectedCurrency);
  return sign + sym + abs.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const currencySelect = document.getElementById('currencySelect');
const allPrefixes = () => document.querySelectorAll('#prefixCurrent, #prefixOffer, #prefixVested');

function updateCurrencyPrefixes() {
  const sym = CURRENCIES[currentCurrency].symbol;
  allPrefixes().forEach(el => { el.textContent = sym; });
}

if (currencySelect) {
  currencySelect.addEventListener('change', () => {
    currentCurrency = currencySelect.value;
    updateCurrencyPrefixes();
    const resultsBoxEl = document.getElementById('resultsBox');
    const calcBtnEl = document.getElementById('calcBtn');
    if (resultsBoxEl && calcBtnEl && !resultsBoxEl.hidden) calcBtnEl.click();
  });
  updateCurrencyPrefixes();
}

// ---------- Masthead date ----------
const todayDateEl = document.getElementById('todayDate');
if (todayDateEl) {
  todayDateEl.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ============================================================
// SCROLL REVEAL — IntersectionObserver toggles .is-visible
// ============================================================
const revealSelectors = '.page-intro, .section-head, .ledger__sheet, .dispatches__filter, .dispatches__grid, .submit__form, .contact__form, .about__body, .footer, .home-card';
document.querySelectorAll(revealSelectors).forEach(el => el.classList.add('reveal'));

const dispatchGrid = document.getElementById('storiesGrid');
if (dispatchGrid) {
  dispatchGrid.classList.remove('reveal');
  dispatchGrid.classList.add('reveal-stagger');
}

const homeGrid = document.getElementById('homeGrid');
if (homeGrid) {
  homeGrid.classList.add('reveal-stagger');
  homeGrid.querySelectorAll('.home-card').forEach(el => el.classList.remove('reveal'));
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));

// ============================================================
// STORY DATA (seeded entries) — only matters on stories.html
// ============================================================
const stories = [
  {
    verdict: 'stay',
    name: 'M. Okafor',
    role: 'Product Manager, 6 yrs',
    change: '+0%, stayed flat',
    quote: 'The offer was 15% more, but my team here would have fallen apart without me. I stayed for the people, not the paycheck — and I still believe that was right.'
  },
  {
    verdict: 'leave',
    name: 'J. Park',
    role: 'Backend Engineer',
    change: '+32% salary',
    quote: 'I was underpaid for three years and too comfortable to notice. The new offer wasn\u2019t even my top choice — it was just the first one that said my real worth out loud.'
  },
  {
    verdict: 'leave',
    name: 'R. Singh',
    role: 'Marketing Lead',
    change: '+21%, remote-first',
    quote: 'My manager promised a promotion for two straight cycles. The new company didn\u2019t promise anything — they just put it in the offer letter.'
  },
  {
    verdict: 'stay',
    name: 'A. Torres',
    role: 'Data Analyst',
    change: '-4% vs. offer',
    quote: 'The other offer paid more but the commute ate three hours a day. I did the math on my actual hourly rate and stayed put.'
  },
  {
    verdict: 'leave',
    name: 'C. Nwosu',
    role: 'UX Designer, 2 yrs',
    change: '+40% salary',
    quote: 'Loyalty doesn\u2019t show up on a mortgage application. I loved the team. I left anyway.'
  },
  {
    verdict: 'stay',
    name: 'D. Bianchi',
    role: 'Sales Director',
    change: '+12% counter-offer',
    quote: 'I almost left, then asked for a counter before signing anything elsewhere. They matched it in 48 hours. Funny how fast \u2018there\u2019s no budget\u2019 changes.'
  }
];

// ============================================================
// RENDER STORIES — guarded, only runs where #storiesGrid exists
// ============================================================
function renderStories(filter = 'all') {
  if (!dispatchGrid) return;
  dispatchGrid.innerHTML = '';
  const filtered = filter === 'all' ? stories : stories.filter(s => s.verdict === filter);

  filtered.forEach(story => {
    const card = document.createElement('article');
    card.className = 'dispatch-card';
    card.innerHTML = `
      <div class="dispatch-card__meta">
        <span class="dispatch-card__tag dispatch-card__tag--${story.verdict}">${story.verdict === 'stay' ? 'Stayed' : 'Left'}</span>
        <span class="dispatch-card__change">${story.change}</span>
      </div>
      <p class="dispatch-card__quote">${story.quote}</p>
      <p class="dispatch-card__byline"><strong>${story.name}</strong> — ${story.role}</p>
    `;
    dispatchGrid.appendChild(card);
  });

  dispatchGrid.classList.remove('is-visible');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => dispatchGrid.classList.add('is-visible'));
  });
}

if (dispatchGrid) {
  renderStories();

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderStories(btn.dataset.filter);
    });
  });
}

// ============================================================
// CALCULATOR LOGIC — guarded, only runs on calculator.html
// ============================================================
const calcBtn = document.getElementById('calcBtn');

if (calcBtn) {
  const resultsBox = document.getElementById('resultsBox');
  const stamp = document.getElementById('verdictStamp');
  const verdictText = document.getElementById('verdictText');
  const verdictReasoning = document.getElementById('verdictReasoning');
  const vestingNote = document.getElementById('vestingNote');
  const vestingLossEl = document.getElementById('vestingLoss');

  let salaryChartInstance = null;

  calcBtn.addEventListener('click', () => {
    const current = parseFloat(document.getElementById('currentSalary').value);
    const offer = parseFloat(document.getElementById('offerSalary').value);
    const years = parseFloat(document.getElementById('yearsAtJob').value) || 0;
    const commute = document.getElementById('commuteChange').value;
    const growth = document.getElementById('growthOutlook').value;
    const vestedBalance = parseFloat(document.getElementById('vestedBalance').value) || 0;
    const vestedPercent = parseFloat(document.getElementById('vestedPercent').value) || 0;

    if (!current || !offer) {
      document.getElementById('currentSalary').focus();
      return;
    }

    const rawDiff = offer - current;
    const pctDiff = (rawDiff / current) * 100;
    const fiveYear = rawDiff * 5;

    document.getElementById('rawDiff').textContent = formatMoney(rawDiff, true);
    document.getElementById('pctDiff').textContent =
      (pctDiff >= 0 ? '+' : '') + pctDiff.toFixed(1) + '%';
    document.getElementById('fiveYear').textContent = formatMoney(fiveYear, true);

    // ---- 401k vesting loss ----
    const unvestedAmount = vestedBalance * (1 - vestedPercent / 100);
    if (vestedBalance > 0 && vestedPercent < 100) {
      vestingNote.hidden = false;
      vestingLossEl.textContent = formatMoney(unvestedAmount);
    } else {
      vestingNote.hidden = true;
    }

    // ---- simple weighted verdict score ----
    let score = 0;
    score += pctDiff > 15 ? 2 : pctDiff > 5 ? 1 : pctDiff < -5 ? -1 : 0;
    score += growth === 'stalled' ? 1 : growth === 'strong' ? -1 : 0;
    score += commute === 'shorter' ? 0.5 : commute === 'longer' ? -0.5 : 0;
    score += years >= 4 ? -0.5 : 0;

    const vestingPenalty = current > 0 ? (unvestedAmount / current) * 3 : 0;
    score -= vestingPenalty;

    const leaveWins = score > 0.5;
    const tooClose = Math.abs(score) <= 0.5;

    let verdict, reasoning;
    if (tooClose) {
      verdict = 'TOO CLOSE';
      reasoning = 'The numbers don\u2019t clearly favor either side. This one comes down to what you can\u2019t put on a spreadsheet — culture, growth, peace of mind.';
    } else if (leaveWins) {
      verdict = 'LEAVE';
      reasoning = pctDiff > 15
        ? 'A raise this size rarely repeats itself by staying put. Combined with the other factors, the math leans toward the new offer.'
        : 'Stalled growth plus a real bump in pay tips this toward leaving — even if the gap isn\u2019t enormous.';
    } else {
      verdict = 'STAY';
      reasoning = unvestedAmount > 0 && vestingPenalty > 0.5
        ? `Leaving now forfeits ${formatMoney(unvestedAmount)} in unvested employer match — that\u2019s real money the offer would need to beat on its own.`
        : years >= 4
          ? 'Your tenure carries weight that doesn\u2019t show up in a salary line — relationships, institutional knowledge, momentum. The offer would need to be larger to outweigh that.'
          : 'The offer doesn\u2019t clear the bar yet. A short commute or strong growth track can be worth more than a modest raise.';
    }

    verdictText.textContent = verdict;
    stamp.classList.remove('is-stamped', 'verdict-leave');
    verdictReasoning.classList.remove('is-visible');

    void stamp.offsetWidth;

    if (verdict === 'LEAVE') stamp.classList.add('verdict-leave');
    stamp.classList.add('is-stamped');

    resultsBox.hidden = false;
    setTimeout(() => verdictReasoning.classList.add('is-visible'), 250);
    verdictReasoning.textContent = reasoning;

    renderSalaryChart(current, offer, unvestedAmount);

    setTimeout(() => {
      resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  });

  function renderSalaryChart(current, offer, unvestedAmount) {
    const ctx = document.getElementById('salaryChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const years = [0, 1, 2, 3, 4, 5];
    const stayProjection = years.map(y => Math.round(current * y));
    const leaveProjection = years.map(y => Math.round(offer * y - (y === 0 ? unvestedAmount : 0)));

    if (salaryChartInstance) {
      salaryChartInstance.destroy();
    }

    const sym = CURRENCIES[currentCurrency].symbol;

    salaryChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years.map(y => 'Year ' + y),
        datasets: [
          {
            label: 'Stay (cumulative earnings)',
            data: stayProjection,
            borderColor: '#0A0A0A',
            backgroundColor: '#0A0A0A',
            borderDash: [],
            pointStyle: 'circle',
            pointRadius: 4,
            tension: 0
          },
          {
            label: 'Leave (cumulative, minus unvested 401k)',
            data: leaveProjection,
            borderColor: '#6B6B68',
            backgroundColor: '#6B6B68',
            borderDash: [6, 4],
            pointStyle: 'rectRot',
            pointRadius: 4,
            tension: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: { callback: (v) => sym + Math.abs(v).toLocaleString() },
            grid: { color: '#D8D4C9' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

// ============================================================
// STORY SUBMISSION FORM — guarded, only runs on stories.html
// ============================================================
const storyForm = document.getElementById('storyForm');
if (storyForm) {
  const submitConfirm = document.getElementById('submitConfirm');

  storyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('storyName').value.trim();
    const role = document.getElementById('storyRole').value.trim();
    const verdict = document.getElementById('storyVerdict').value;
    const change = document.getElementById('storySalaryChange').value.trim();
    const text = document.getElementById('storyText').value.trim();

    stories.unshift({ verdict, name, role, change, quote: text });

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
    const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (allBtn) allBtn.classList.add('is-active');
    renderStories('all');

    storyForm.reset();
    submitConfirm.hidden = false;
    submitConfirm.style.animation = 'none';
    void submitConfirm.offsetWidth;
    submitConfirm.style.animation = '';

    setTimeout(() => { submitConfirm.hidden = true; }, 4000);
  });
}

// ============================================================
// CONTACT FORM — guarded, only runs on contact.html
// opens the user's email client with a pre-filled mailto link
// ============================================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const contactConfirm = document.getElementById('contactConfirm');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value.trim();

    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:hello@theledger.example?subject=${encodeURIComponent('[The Ledger] ' + subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    contactConfirm.hidden = false;
    contactConfirm.style.animation = 'none';
    void contactConfirm.offsetWidth;
    contactConfirm.style.animation = '';
  });
}
