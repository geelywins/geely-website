import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// Dua nilai ini diisi otomatis oleh GitHub Actions (lihat .github/workflows/deploy.yml).
// Kalau nanti sudah punya domain sendiri, isi SITE_URL dengan domain tersebut dan kosongkan BASE_PATH.
const SITE_URL = process.env.SITE_URL || 'https://GANTI-USERNAME.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/geely-website';
const BASE = BASE_PATH.replace(/\/$/, '');

// Gambar & tautan di isi artikel ditulis tanpa awalan folder (contoh: /images/artikel/foto.jpg).
// Plugin kecil ini menambahkan awalan folder website secara otomatis saat build.
function rehypeBase() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.properties) {
        for (const key of ['src', 'href']) {
          const v = node.properties[key];
          if (typeof v === 'string' && BASE && v.startsWith('/') && !v.startsWith('//') && !v.startsWith(BASE + '/')) {
            node.properties[key] = BASE + v;
          }
        }
      }
      (node.children || []).forEach(walk);
    };
    walk(tree);
  };
}

// Kalau isi artikel belum punya gambar sama sekali, sisipkan otomatis satu gambar di tengah artikel
// (dibuat sistem di /img/artikel/<slug>/sisip.png). Kalau admin sudah menaruh gambar di isi artikel, tidak ditambah.
function rehypeAutoImage() {
  return (tree, file) => {
    const fm = file?.data?.astro?.frontmatter || {};
    const slug = String(file?.path || '').split(/[\\/]/).pop()?.replace(/\.md$/, '');
    if (!slug) return;
    let hasImg = false;
    const find = (n) => { if (n.type === 'element' && n.tagName === 'img') hasImg = true; (n.children || []).forEach(find); };
    find(tree);
    if (hasImg) return;
    const kids = tree.children;
    const h2 = kids.map((n, i) => (n.type === 'element' && n.tagName === 'h2' ? i : -1)).filter((i) => i >= 0);
    let at = h2.length >= 2 ? h2[Math.floor(h2.length / 2)] : Math.floor(kids.length / 2);
    const alt = `Ilustrasi poin penting: ${fm.title || slug}`;
    const fig = { type: 'element', tagName: 'figure', properties: { className: ['auto-fig'] }, children: [
      { type: 'element', tagName: 'img', properties: { src: `/img/artikel/${slug}/sisip.png`, alt, loading: 'lazy', decoding: 'async', width: 1200, height: 630 }, children: [] },
      { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: alt }] },
    ] };
    kids.splice(at, 0, fig);
  };
}

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH || '/',
  trailingSlash: 'always',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  markdown: { rehypePlugins: [rehypeAutoImage, rehypeBase] },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
      // Tanggal terakhir diubah untuk tiap artikel (membantu Google tahu mana yang baru/diperbarui)
      serialize(item) {
        const m = item.url.match(/\/artikel\/([^/]+)\/$/);
        if (m) {
          try {
            const t = fs.readFileSync(`src/content/artikel/${m[1]}.md`, 'utf8');
            const d = (t.match(/^updated:\s*(\d{4}-\d{2}-\d{2})/m) || t.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m) || [])[1];
            if (d) item.lastmod = d;
          } catch {}
        }
        return item;
      },
    }),
  ],
});
