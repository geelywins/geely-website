import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH || '/',
  trailingSlash: 'always',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  markdown: { rehypePlugins: [rehypeBase] },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
    }),
  ],
});
