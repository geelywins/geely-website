// Setelah build: buang aturan CSS Bootstrap yang tidak dipakai supaya halaman lebih cepat dimuat.
// Aman: yang dipindai adalah semua HTML dan JS hasil build; kelas yang dipasang lewat JS ikut dijaga (safelist).
import { PurgeCSS } from 'purgecss';
import fs from 'node:fs'; import path from 'node:path';

const dist = 'dist';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const all = walk(dist);
const css = all.filter((f) => f.endsWith('.css') && f.includes(`${path.sep}_astro${path.sep}`));
const content = all.filter((f) => /\.(html|js)$/.test(f) && !f.includes(`${path.sep}admin${path.sep}`)).map((f) => ({ raw: fs.readFileSync(f, 'utf8'), extension: f.endsWith('.js') ? 'js' : 'html' }));
if (!css.length) { console.log('Tidak ada CSS untuk dirapikan'); process.exit(0); }

const result = await new PurgeCSS().purge({
  content,
  css: css.map((f) => ({ raw: fs.readFileSync(f, 'utf8'), name: f })),
  safelist: {
    standard: ['js', 'show', 'showing', 'active', 'collapse', 'collapsing', 'collapsed', 'fade', 'modal-open', 'modal-backdrop', 'offcanvas-backdrop', 'paused', 'open', 'scrolled', 'is-open', 'dark', 'light'],
    greedy: [/^data-bs/, /^lb-/, /^slide/, /^dot/, /^tooltip/, /^popover/, /^dropdown/, /^navbar/, /^nav-/, /^offcanvas/, /^accordion/],
  },
  variables: false, keyframes: false, fontFace: false,
});
let before = 0, after = 0;
result.forEach((r, i) => {
  before += fs.statSync(css[i]).size; after += Buffer.byteLength(r.css);
  fs.writeFileSync(css[i], r.css);
});
console.log(`CSS dirapikan: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
