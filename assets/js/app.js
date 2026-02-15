import { loadJson, escapeHtml } from './content.js';
import { initSlider } from './slider.js';

const TRAINER_URL = 'https://moyamova.online/';

function openTrainer(e) {
  if (e) e.preventDefault();
  const w = 430;
  const h = 820;
  const left = Math.max(0, (window.screen.width - w) / 2);
  const top = Math.max(0, (window.screen.height - h) / 2);
  window.open(TRAINER_URL, 'moyamova_trainer', `width=${w},height=${h},left=${left},top=${top}`);
}

function bindCtas() {
  document.querySelectorAll('[data-open-trainer]').forEach(el => {
    el.addEventListener('click', openTrainer);
  });

  document.querySelectorAll('[data-google-play]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Демо: посилання Google Play додамо пізніше.');
    });
  });

  const donate = document.querySelector('[data-donate]');
  if (donate) {
    donate.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Демо: посилання для донату додамо пізніше.');
    });
  }
}

async function initHeroScreens() {
  const largeWrap = document.getElementById('heroScreens');
  const smallWrap = document.getElementById('heroInlineScreens');
  if (!largeWrap || !smallWrap) return;

  const data = await loadJson('./content/screens.json');
  const items = data.items || [];
  if (!items.length) return;

  const largeImg = largeWrap.querySelector('img');
  const smallImg = smallWrap.querySelector('img');
  const dotsWrap = document.getElementById('heroDots');

  let idx = 0;
  function apply(i) {
    idx = i;
    const it = items[idx];
    if (largeImg) { largeImg.src = it.src; largeImg.alt = it.alt || ''; }
    if (smallImg) { smallImg.src = it.src; smallImg.alt = it.alt || ''; }
    if (dotsWrap) {
      [...dotsWrap.children].forEach((d, di) => d.classList.toggle('is-active', di === idx));
    }
  }

  // dots
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    items.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' is-active' : '');
      d.addEventListener('click', () => { apply(i); restart(); });
      dotsWrap.appendChild(d);
    });
  }

  let timer = null;
  function restart() {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => apply((idx + 1) % items.length), 10000);
  }
  apply(0);
  restart();
}

async function initSectionSlider(sectionId, jsonUrl) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const host = section.querySelector('[data-slide-host]');
  if (!host) return;

  const data = await loadJson(jsonUrl);
  const items = data.items || [];
  if (!items.length) return;

  const render = (item) => {
    const img0 = (item.images && item.images[0]) ? item.images[0] : '';
    const title = item.title ? `<div class="slideTitle">${escapeHtml(item.title)}</div>` : '';
    const date = item.date ? `<div class="slideMeta">${escapeHtml(item.date)}</div>` : '';
    const text = item.text ? `<p class="slideText">${escapeHtml(item.text)}</p>` : '';

    host.innerHTML = `
      <div class="slideMedia">
        <div class="phone phone--small">
          <div class="phone__screen">
            <img src="${img0}" alt="${escapeHtml(item.title || '')}" loading="lazy" />
          </div>
        </div>
      </div>
      <div class="slideBody">
        ${title}
        ${date}
        ${text}
      </div>
      <div class="clear"></div>
    `;
  };

  initSlider(section, items, render, 10000);
}

function initLegalBadLinksGuard() {
  // No “back to trainer” links in this template. This is a safety guard: if any exists, neutralize.
  document.querySelectorAll('a[href*="trainer"], a[href*="moyamova.online"], a[data-back-to-trainer]').forEach(a => {
    if (a.classList.contains('allow-trainer')) return;
    // keep only explicit trainer CTA
    a.removeAttribute('href');
  });
}

(async function main(){
  bindCtas();
  initLegalBadLinksGuard();

  await initHeroScreens();
  await initSectionSlider('newsSection', './content/slides.news.json');
  await initSectionSlider('guideSection', './content/slides.guide.json');
  await initSectionSlider('supportSection', './content/slides.support.json');
})();
