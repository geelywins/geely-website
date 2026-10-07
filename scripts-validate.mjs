// Validasi standar SEO artikel. Jalankan: node scripts-validate.mjs [awalan-slug-opsional]
import fs from 'node:fs'; import path from 'node:path';
const dir = 'src/content/artikel'; const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
const slugs = new Set(files.map(f => f.replace(/\.md$/, '')));
const only = process.argv[2]; let bad = 0, n = 0;
const EV = ['mobil listrik geely','geely ev','geely indonesia','geely ex5','geely starray em-i','ev geely jakarta','mobil listrik murah','mobil listrik kompak','harga mobil listrik geely'];
for (const f of files) {
  const slug = f.replace(/\.md$/, ''); if (only && !slug.includes(only)) continue;
  const raw = fs.readFileSync(path.join(dir, f), 'utf8'); const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const err = []; if (!m) { console.log('X', slug, 'front matter rusak'); bad++; continue; }
  const [, fm, body] = m; const get = k => (fm.match(new RegExp('^' + k + ':\\s*"(.*)"\\s*$', 'm')) || [])[1];
  const title = get('title') || '', desc = get('description') || '';
  const tags = ((fm.match(/^tags:\s*\[(.*)\]/m) || [])[1] || '').split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
  const text = body.replace(/`[^`]*`/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*>|_-]/g, ' ');
  const words = (text.match(/\S+/g) || []).length;
  const sents = body.split('\n').filter(l => !/^\s*(#|\|)/.test(l)).join(' ').split(/(?<=[.!?])\s+/).filter(s => s.trim().split(/\s+/).length >= 3).length;
  const links = [...body.matchAll(/\]\((\/[^)]*)\)/g)].map(x => x[1]);
  const art = [...new Set(links.filter(l => l.startsWith('/artikel/')).map(l => l.split('/')[2]))];
  const h2 = (body.match(/^## /gm) || []).length;
  if (words < 900) err.push(`kata ${words}<900`); if (sents < 40) err.push(`kalimat ${sents}<40`);
  if (title.length < 45 || title.length > 65) err.push(`judul ${title.length} char`);
  if (desc.length < 120 || desc.length > 160) err.push(`deskripsi ${desc.length} char`);
  if (tags.length < 8 || tags.length > 10) err.push(`tag ${tags.length}`); if (new Set(tags).size !== tags.length) err.push('tag dobel');
  if (!tags.includes('geely ex2') || !tags.includes('geely ex2 max')) err.push('tag wajib');
  if (tags.filter(t => EV.includes(t)).length < 3) err.push('<3 tag EV Geely');
  if (tags.some(t => t !== t.toLowerCase())) err.push('tag huruf besar');
  if (h2 < 6) err.push(`H2 ${h2}<6`); if (/^# /m.test(body)) err.push('ada H1'); if (/!\[/.test(body)) err.push('ada gambar md');
  if (!links.includes('/model/geely-ex2/')) err.push('tautan model EX2'); if (!links.some(l => l === '/promo/' || l === '/kontak/')) err.push('tautan promo/kontak');
  if (art.length < 3) err.push(`tautan artikel ${art.length}<3`); for (const a of art) { if (!slugs.has(a)) err.push('slug tak ada: ' + a); if (a === slug) err.push('tautan diri sendiri'); }
  if (!/^## Pertanyaan yang sering diajukan/m.test(body)) err.push('tanpa FAQ'); if (!/^## Kesimpulan/m.test(body)) err.push('tanpa Kesimpulan');
  if (!/draft:\s*true/.test(fm)) err.push('bukan draft'); if (!/^date:\s*\d{4}-\d{2}-\d{2}/m.test(fm)) err.push('date');
  n++; if (err.length) { bad++; console.log('X', slug, '→', err.join('; ')); } else console.log('OK', slug, `${words}k ${sents}kal ${art.length}art`);
}
console.log(`\n${n - bad}/${n} lolos`); process.exit(bad ? 1 : 0);
