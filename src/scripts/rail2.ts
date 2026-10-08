// Baris geser ke samping: tombol kiri/kanan, geser jari/mouse, dan geser otomatis (opsional).
document.querySelectorAll<HTMLElement>('[data-rail2]').forEach((root) => {
  const track = root.querySelector<HTMLElement>('.rail2-track')!;
  const prev = root.querySelector<HTMLButtonElement>('.prev')!;
  const next = root.querySelector<HTMLButtonElement>('.next')!;
  const auto = Number(root.dataset.auto || 0);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = () => {
    const first = track.firstElementChild as HTMLElement | null;
    if (!first) return 300;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    return first.getBoundingClientRect().width + gap;
  };
  const max = () => track.scrollWidth - track.clientWidth;
  const sync = () => {
    const m = max();
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= m - 4;
    root.classList.toggle('no-scroll', m <= 4);
  };
  const go = (dir: 1 | -1) => track.scrollBy({ left: dir * step(), behavior: 'smooth' });
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
  // Geser dengan mouse (di HP otomatis pakai jari)
  let down = false, sx = 0, sl = 0, moved = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; track.classList.add('drag'); }
    track.scrollLeft = sl - dx;
  });
  window.addEventListener('pointerup', () => { down = false; track.classList.remove('drag'); });
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  // Geser otomatis ke kiri tiap beberapa detik
  if (auto > 0 && !reduce) {
    let paused = false, visible = true;
    const stop = () => { paused = true; };
    const start = () => { paused = false; };
    ['mouseenter', 'focusin', 'touchstart', 'pointerdown'].forEach((ev) => root.addEventListener(ev, stop, { passive: true }));
    ['mouseleave', 'focusout'].forEach((ev) => root.addEventListener(ev, start));
    root.addEventListener('touchend', () => setTimeout(start, 4000), { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.2 }).observe(root);
    setInterval(() => {
      if (paused || !visible || document.hidden || max() <= 4) return;
      if (track.scrollLeft >= max() - 4) track.scrollTo({ left: 0, behavior: 'smooth' });
      else go(1);
    }, auto);
  }
});
