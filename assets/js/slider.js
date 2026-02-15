function setDotActive(dots, idx) {
  dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
}

function createDots(container, count) {
  const dotsWrap = container.querySelector('[data-dots]');
  if (!dotsWrap) return [];
  dotsWrap.innerHTML = '';
  const dots = [];
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' is-active' : '');
    dotsWrap.appendChild(d);
    dots.push(d);
  }
  return dots;
}

/**
 * Generic slider controller.
 *
 * container: section element that contains [data-dots]
 * slides: array of slide objects
 * renderFn: function(slide, idx) that updates DOM
 */
export function initSlider(container, slides, renderFn, intervalMs = 10000) {
  if (!container || !Array.isArray(slides) || slides.length === 0) return null;
  if (typeof renderFn !== 'function') return null;

  let idx = 0;
  let timer = null;
  const dots = createDots(container, slides.length);

  function apply(i) {
    idx = i;
    renderFn(slides[idx], idx);
    setDotActive(dots, idx);
  }

  function next() {
    apply((idx + 1) % slides.length);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    stop();
    timer = window.setInterval(next, intervalMs);
  }

  // dot click
  dots.forEach((d, i) => d.addEventListener('click', () => {
    stop();
    apply(i);
    start();
  }));

  // pause on hover (desktop)
  container.addEventListener('mouseenter', stop);
  container.addEventListener('mouseleave', start);

  apply(0);
  start();

  return { start, stop };
}
