// Slider beranda buatan sendiri (ringan, tanpa library): otomatis jalan, bisa digeser jari, titik & panah.
const root = document.querySelector<HTMLElement>('[data-slider]');
if (root) {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('.slide'));
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('.dot'));
  const bar = root.querySelector<HTMLElement>('.slider-bar');
  const INTERVAL = 6500;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0;
  let timer: number | undefined;

  const show = (n: number) => {
    cur = (n + slides.length) % slides.length;
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === cur);
      s.setAttribute('aria-hidden', String(i !== cur));
    });
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === cur)));
    if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
  };
  const stop = () => { window.clearInterval(timer); root.classList.add('paused'); };
  const start = () => {
    if (reduce || slides.length < 2) return;
    root.classList.remove('paused');
    window.clearInterval(timer);
    timer = window.setInterval(() => show(cur + 1), INTERVAL);
  };

  if (slides.length > 1) {
    root.querySelector('.prev')?.addEventListener('click', () => { show(cur - 1); start(); });
    root.querySelector('.next')?.addEventListener('click', () => { show(cur + 1); start(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    let x0 = 0, y0 = 0;
    root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { show(cur + (dx < 0 ? 1 : -1)); start(); }
    }, { passive: true });

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { show(cur - 1); start(); }
      if (e.key === 'ArrowRight') { show(cur + 1); start(); }
    });
    start();
  }
}
