(() => {
  const config = window.MOYAMOVA_CONFIG || {};
  const trainerUrl = config.trainerUrl || 'https://moyamova.online/';

  const translations = {
    ru: {
      navTrainer: 'Тренажёр', eyebrow: 'Немецкий без лишней теории',
      heroTitle: 'Учи немецкий<br><span>практикой.</span>',
      heroLead: 'MOYAMOVA — простой тренажёр слов, артиклей и конструкций. Открывается прямо в браузере.',
      openTrainer: 'Запустить тренажёр', heroNote: 'Бесплатно · без установки',
      point1: 'Слова и переводы', point2: 'Артикли и грамматика', point3: 'Повторение ошибок',
      floatPractice: 'Практика<br><b>без перегруза</b>', floatLevel: 'в одном<br>тренажёре',
      trainerKicker: 'Внутри MOYAMOVA', trainerTitle: 'Только то, что помогает практиковаться.',
      trainerIntro: 'Короткие сессии, понятный интерфейс и разные типы заданий — чтобы возвращаться к немецкому регулярно.',
      feature1Title: 'Слова и переводы', feature1Text: 'Тренируйте лексику в обе стороны и сразу проверяйте себя.',
      feature2Title: 'Артикли', feature2Text: 'Отдельная практика der, die, das без лишних отвлечений.',
      feature3Title: 'Конструкции', feature3Text: 'Закрепляйте предлоги и устойчивые сочетания на практике.',
      flow1: 'Изучи', flow2: 'Повтори', flow3: 'Посмотри', flow4: 'Практикуй снова',
      youtubeTitle: 'Смотри. Запоминай. Возвращайся к практике.', youtubeIntro: 'Два канала с немецким: выбирайте удобный язык объяснений.',
      videoPending: 'Загружаем последние видео…', videoConfig: 'Если список ещё не обновился — откройте канал напрямую.',
      channelUkText: 'Немецкий с украинским переводом', channelRuText: 'Немецкий с русским переводом', openChannel: 'Открыть канал',
      ctaKicker: 'Можно начать прямо сейчас', ctaTitle: 'Открой MOYAMOVA и попробуй одну сессию.',
      footerText: 'Немецкий — меньше теории, больше практики.', trainerLink: 'Тренажёр', privacy: 'Политика конфиденциальности', terms: 'Условия использования'
    },
    uk: {
      navTrainer: 'Тренажер', eyebrow: 'Німецька без зайвої теорії',
      heroTitle: 'Вивчай німецьку<br><span>на практиці.</span>',
      heroLead: 'MOYAMOVA — простий тренажер слів, артиклів і конструкцій. Відкривається просто у браузері.',
      openTrainer: 'Запустити тренажер', heroNote: 'Безкоштовно · без встановлення',
      point1: 'Слова й переклади', point2: 'Артиклі та граматика', point3: 'Повторення помилок',
      floatPractice: 'Практика<br><b>без перевантаження</b>', floatLevel: 'в одному<br>тренажері',
      trainerKicker: 'Всередині MOYAMOVA', trainerTitle: 'Тільки те, що допомагає практикуватися.',
      trainerIntro: 'Короткі сесії, зрозумілий інтерфейс і різні типи завдань — щоб регулярно повертатися до німецької.',
      feature1Title: 'Слова й переклади', feature1Text: 'Тренуйте лексику в обидва боки та одразу перевіряйте себе.',
      feature2Title: 'Артиклі', feature2Text: 'Окрема практика der, die, das без зайвих відволікань.',
      feature3Title: 'Конструкції', feature3Text: 'Закріплюйте прийменники та сталі сполучення на практиці.',
      flow1: 'Вивчи', flow2: 'Повтори', flow3: 'Подивись', flow4: 'Практикуй знову',
      youtubeTitle: 'Дивись. Запам’ятовуй. Повертайся до практики.', youtubeIntro: 'Два канали з німецькою: обирайте зручну мову пояснень.',
      videoPending: 'Завантажуємо останні відео…', videoConfig: 'Якщо список ще не оновився — відкрийте канал напряму.',
      channelUkText: 'Німецька з українським перекладом', channelRuText: 'Німецька з російським перекладом', openChannel: 'Відкрити канал',
      ctaKicker: 'Можна почати прямо зараз', ctaTitle: 'Відкрий MOYAMOVA і спробуй одну сесію.',
      footerText: 'Німецька — менше теорії, більше практики.', trainerLink: 'Тренажер', privacy: 'Політика конфіденційності', terms: 'Умови використання'
    }
  };

  function openTrainer(event) {
    event.preventDefault();
    const isSmall = window.matchMedia('(max-width: 720px)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isSmall) {
      window.open(trainerUrl, '_blank', 'noopener');
      return;
    }
    const width = 430;
    const height = Math.min(820, Math.max(650, window.screen.availHeight - 80));
    const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
    const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));
    const popup = window.open(trainerUrl, 'moyamova_trainer', `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
    if (!popup) window.open(trainerUrl, '_blank', 'noopener');
  }

  document.querySelectorAll('[data-open-trainer]').forEach(link => {
    link.href = trainerUrl;
    link.addEventListener('click', openTrainer);
  });

  function setLanguage(lang) {
    if (!translations[lang]) lang = 'ru';
    document.documentElement.lang = lang === 'uk' ? 'uk' : 'ru';
    document.documentElement.dataset.lang = lang;
    document.querySelectorAll('[data-lang-btn]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.langBtn === lang));
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const value = translations[lang][el.dataset.i18n];
      if (value != null) el.innerHTML = value;
    });
    const legalLang = lang === 'uk' ? 'uk' : 'ru';
    document.querySelectorAll('[data-legal-link]').forEach(link => {
      const doc = link.dataset.legalLink;
      if (doc) link.href = `./legal/${doc}.${legalLang}.html`;
    });
    localStorage.setItem('moyamova-lang', lang);
  }

  document.querySelectorAll('[data-lang-btn]').forEach(btn => btn.addEventListener('click', () => setLanguage(btn.dataset.langBtn)));
  setLanguage(localStorage.getItem('moyamova-lang') || (navigator.language?.toLowerCase().startsWith('uk') ? 'uk' : 'ru'));

  function setupChannelLink(code) {
    const channel = config.channels?.[code];
    if (!channel) return;
    const link = document.querySelector(`[data-channel-link="${code}"]`);
    const channelId = (channel.channelId || '').trim();
    const channelUrl = (channel.channelUrl || '').trim() || (channelId ? `https://www.youtube.com/channel/${channelId}` : '');

    if (link && channelUrl) {
      link.href = channelUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.classList.remove('is-disabled');
      link.removeAttribute('aria-disabled');
    }
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function renderVideos(code, videos) {
    const slot = document.querySelector(`[data-video-slot="${code}"]`);
    if (!slot || !Array.isArray(videos) || !videos.length) return;

    slot.classList.add('has-videos');
    slot.innerHTML = videos.slice(0, 3).map((video, index) => {
      const id = encodeURIComponent(video.id || '');
      const url = `https://www.youtube.com/watch?v=${id}`;
      const thumb = video.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      const title = escapeHtml(video.title || 'MOYAMOVA');
      const date = video.published ? new Date(video.published) : null;
      const dateLabel = date && !Number.isNaN(date.valueOf())
        ? new Intl.DateTimeFormat(document.documentElement.lang === 'uk' ? 'uk-UA' : 'ru-RU', {day:'2-digit', month:'short'}).format(date)
        : '';

      return `<a class="video-card${index === 0 ? ' video-card-main' : ''}" href="${url}" target="_blank" rel="noopener" aria-label="${title}">
        <span class="video-thumb">
          <img src="${escapeHtml(thumb)}" alt="" loading="lazy">
          <span class="video-play" aria-hidden="true">▶</span>
        </span>
        <span class="video-meta">
          <strong>${title}</strong>
          ${dateLabel ? `<small>${escapeHtml(dateLabel)}</small>` : ''}
        </span>
      </a>`;
    }).join('');
  }

  async function loadLatestVideos() {
    try {
      const response = await fetch('./assets/data/youtube.json', {cache: 'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      renderVideos('uk', data.channels?.uk || []);
      renderVideos('ru', data.channels?.ru || []);
    } catch (error) {
      console.warn('MOYAMOVA: youtube.json is not available yet.', error);
    }
  }

  setupChannelLink('uk');
  setupChannelLink('ru');
  loadLatestVideos();
  document.getElementById('year').textContent = new Date().getFullYear();
})();
