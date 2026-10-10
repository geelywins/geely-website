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
    const kind = /[\\/]content[\\/]lp[\\/]/.test(String(file?.path || '')) ? 'lp' : 'artikel';
    let hasImg = false;
    const find = (n) => { if (n.type === 'element' && n.tagName === 'img') hasImg = true; (n.children || []).forEach(find); };
    find(tree);
    if (hasImg) return;
    const kids = tree.children;
    const h2 = kids.map((n, i) => (n.type === 'element' && n.tagName === 'h2' ? i : -1)).filter((i) => i >= 0);
    let at = h2.length >= 2 ? h2[Math.floor(h2.length / 2)] : Math.floor(kids.length / 2);
    const alt = `Ilustrasi poin penting: ${fm.title || slug}`;
    const fig = { type: 'element', tagName: 'figure', properties: { className: ['auto-fig'] }, children: [
      { type: 'element', tagName: 'img', properties: { src: `/img/${kind}/${slug}/sisip.png`, alt, loading: 'lazy', decoding: 'async', width: 1200, height: 630 }, children: [] },
      { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: alt }] },
    ] };
    kids.splice(at, 0, fig);
  };
}


// Tautan internal ke artikel/LP yang masih draft atau belum waktunya tayang akan menjadi 404 (buruk untuk SEO).
// Plugin ini mengubah tautan seperti itu menjadi teks biasa saat build. Begitu kontennya tayang
// (dan website dibangun ulang), tautannya otomatis aktif lagi.
function liveSlugs(dir) {
  const set = new Set();
  const today = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
  let files = [];
  try { files = fs.readdirSync(`src/content/${dir}`).filter((f) => f.endsWith('.md')); } catch {}
  for (const f of files) {
    const t = fs.readFileSync(`src/content/${dir}/${f}`, 'utf8');
    const fm = (t.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
    const draft = /^draft:\s*true/m.test(fm);
    const date = (fm.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m) || [])[1] || '0000-00-00';
    if (!draft && date <= today) set.add(f.replace(/\.md$/, ''));
  }
  return set;
}
function rehypeUnlinkUnpublished() {
  const live = { artikel: liveSlugs('artikel'), lp: liveSlugs('lp') };
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      const out = [];
      for (const c of node.children) {
        walk(c);
        const h = c.type === 'element' && c.tagName === 'a' ? c.properties?.href : null;
        const m = typeof h === 'string' && h.match(/^\/(artikel|lp)\/([^/#?]+)\/?$/);
        if (m && !live[m[1]].has(m[2])) out.push(...c.children);
        else out.push(c);
      }
      node.children = out;
    };
    walk(tree);
  };
}

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH || '/',
  trailingSlash: 'always',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  markdown: { rehypePlugins: [rehypeUnlinkUnpublished, rehypeAutoImage, rehypeBase] },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
      // Tanggal terakhir diubah untuk tiap artikel atau landing page (membantu Google tahu mana yang baru/diperbarui)
      serialize(item) {
        let m = item.url.match(/\/artikel\/([^/]+)\/$/);
        let dir = 'artikel';
        if (!m) {
          m = item.url.match(/\/lp\/([^/]+)\/$/);
          dir = 'lp';
        }
        if (m) {
          try {
            const t = fs.readFileSync(`src/content/${dir}/${m[1]}.md`, 'utf8');
            const d = (t.match(/^updated:\s*(\d{4}-\d{2}-\d{2})/m) || t.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m) || [])[1];
            if (d) item.lastmod = d;
          } catch {}
        }
        return item;
      },
    }),
  ],
});
