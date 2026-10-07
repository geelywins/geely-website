// Memberi tahu mesin pencari (IndexNow: Bing, Yandex, dll) halaman yang BARU atau BERUBAH.
// Dijalankan otomatis oleh GitHub Actions setelah website tayang. Gagal pun tidak mengganggu website.
// Pemakaian: node scripts/indexnow.mjs <domain> <kunci>
import fs from 'node:fs';
import crypto from 'node:crypto';

const [, , domain, key] = process.argv;
const base = process.env.INDEXNOW_BASE || `https://${domain}`;
const endpoint = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const stateFile = '.indexnow/hashes.json';

async function get(u) {
  const r = await fetch(u + (u.includes('?') ? '&' : '?') + 'nc=' + Date.now(), { headers: { 'user-agent': 'wins-geely-indexnow' } });
  if (!r.ok) throw new Error(`${r.status} ${u}`);
  return r.text();
}
const locs = (x) => [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

try {
  if (!domain || !key) throw new Error('domain/kunci kosong');
  const idx = await get(base + '/sitemap-index.xml');
  let urls = [];
  for (const m of locs(idx)) urls.push(...locs(await get(base + new URL(m).pathname)));
  urls = [...new Set(urls)];
  console.log(`Halaman di sitemap: ${urls.length}`);

  let old = {};
  try { old = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch {}
  const now = {};
  const changed = [];
  for (const u of urls) {
    const path = new URL(u).pathname;
    const html = await get(base + path);
    now[u] = crypto.createHash('sha256').update(html).digest('hex');
    if (old[u] !== now[u]) changed.push(u);
  }
  fs.mkdirSync('.indexnow', { recursive: true });
  console.log(`Baru/berubah: ${changed.length}`);

  if (changed.length) {
    for (let i = 0; i < changed.length; i += 500) {
      const chunk = changed.slice(i, i + 500);
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: domain, key, keyLocation: `https://${domain}/${key}.txt`, urlList: chunk }),
      });
      console.log(`IndexNow kirim ${chunk.length} URL -> HTTP ${r.status}`);
      if (r.status >= 300) throw new Error('IndexNow menolak: HTTP ' + r.status);
    }
  }
  fs.writeFileSync(stateFile, JSON.stringify(now));
} catch (e) {
  console.log('IndexNow dilewati:', e.message);
}
