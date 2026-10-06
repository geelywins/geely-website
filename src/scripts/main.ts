// Skrip utama (kecil): menu HP, popup, perbesar foto, animasi muncul saat scroll.
import 'bootstrap/js/dist/collapse';
import Modal from 'bootstrap/js/dist/modal';

// Bayangan header saat halaman di-scroll
const header = document.querySelector('.site-header');
const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Animasi muncul saat terlihat di layar
const items = document.querySelectorAll<HTMLElement>('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('in'));
}

// Perbesar foto (lightbox)
const lb = document.getElementById('lightbox');
if (lb) {
  const img = lb.querySelector('img') as HTMLImageElement;
  const cap = lb.querySelector('.lb-cap') as HTMLElement;
  lb.addEventListener('show.bs.modal', (e: any) => {
    const t = e.relatedTarget as HTMLElement | null;
    if (!t) return;
    img.src = t.dataset.full || '';
    img.alt = t.dataset.caption || '';
    cap.textContent = t.dataset.caption || '';
  });
  lb.addEventListener('hidden.bs.modal', () => { img.removeAttribute('src'); });
}

// Pop up promo: muncul sekali per kunjungan, setelah beberapa detik
const pop = document.getElementById('promoPopup');
if (pop) {
  let seen = false;
  try { seen = sessionStorage.getItem('popSeen') === '1'; } catch {}
  if (!seen) {
    const delay = Math.max(2, Number(pop.dataset.delay) || 8) * 1000;
    window.setTimeout(() => {
      if (document.querySelector('.modal.show')) return;
      new Modal(pop).show();
      try { sessionStorage.setItem('popSeen', '1'); } catch {}
    }, delay);
  }
}
