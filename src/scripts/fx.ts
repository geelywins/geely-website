// Efek ringan: garis progres scroll, sorot cahaya mengikuti jari/kursor di kartu, teks hero muncul per kata, carousel model.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Garis progres scroll di paling atas
const bar = document.createElement('div');
bar.className = 'scroll-progress';
bar.setAttribute('aria-hidden', 'true');
document.body.prepend(bar);
const prog = () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
};
addEventListener('scroll', prog, { passive: true }); prog();

// 2. Sorot cahaya di kartu
document.addEventListener('pointermove', (e) => {
  const c = (e.target as Element | null)?.closest?.('.card-x') as HTMLElement | null;
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', `${e.clientX - r.left}px`);
  c.style.setProperty('--my', `${e.clientY - r.top}px`);
}, { passive: true });

// 3. Judul hero muncul per kata
if (!reduce) {
  document.querySelectorAll<HTMLElement>('.slide h1, .slide h2.slide-title').forEach((h) => {
    let k = 0;
    const walk = (n: Node) => {
      [...n.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          (c.textContent || '').split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.append(' '); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = t; i.style.setProperty('--k', String(k++));
            w.append(i); frag.append(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1) walk(c);
      });
    };
    h.setAttribute('aria-label', h.textContent || '');
    walk(h);
    h.classList.add('split');
  });
}

// 4. Carousel model: tombol, seret dengan mouse, geser dengan jari
const track = document.querySelector<HTMLElement>('[data-rail-track]');
if (track) {
  const btns = document.querySelectorAll<HTMLButtonElement>('[data-rail]');
  const step = () => (track.querySelector('.card-x') as HTMLElement | null)?.getBoundingClientRect().width ?? 320;
  const upd = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    btns.forEach((b) => { b.disabled = b.dataset.rail === '-1' ? track.scrollLeft <= 2 : track.scrollLeft >= max; });
    const wrap = track.closest('.models-sec');
    wrap?.classList.toggle('no-scroll', max <= 0);
  };
  btns.forEach((b) => b.addEventListener('click', () => track.scrollBy({ left: Number(b.dataset.rail) * (step() + 24), behavior: reduce ? 'auto' : 'smooth' })));
  track.addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd, { passive: true });
  upd();
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { track.scrollBy({ left: step() + 24, behavior: 'smooth' }); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { track.scrollBy({ left: -(step() + 24), behavior: 'smooth' }); e.preventDefault(); }
  });
  // seret dengan mouse (di layar sentuh sudah bawaan)
  let down = false, sx = 0, sl = 0, moved = false;
  track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; track.classList.add('dragging'); }
    track.scrollLeft = sl - dx;
  }, { passive: true });
  addEventListener('pointerup', () => { if (down) { down = false; setTimeout(() => track.classList.remove('dragging'), 0); } });
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
}
