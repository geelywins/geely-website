// Pengaman halaman ganda / saling bersaing (kanibalisasi) antar artikel dan landing page.
// Jalankan: node scripts-duplikat.mjs            (cek semua)
//           node scripts-duplikat.mjs --semua    (tampilkan juga yang hanya peringatan ringan)
// Keluar dengan kode 1 kalau ada masalah BERAT, supaya bisa dipasang sebagai pagar sebelum terbit.
import fs from 'node:fs'; import path from 'node:path';

const verbose = process.argv.includes('--semua');
const registry = (() => { try { return JSON.parse(fs.readFileSync('src/data/topik.json', 'utf8')); } catch { return null; } })();
const regBySlug = new Map((registry?.topik || []).map((t) => [t.slug, t]));

const STOP = new Set('dan atau yang di ke dari untuk pada dengan ini itu adalah akan juga dalam tidak bisa anda kami saya kita lebih agar karena sebagai oleh serta para atau jika bila saat sudah belum masih pun lah kah nya'.split(' '));
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const toks = (s) => norm(s).split(' ').filter((w) => w && !STOP.has(w));
const jacc = (a, b) => { const A = new Set(a), B = new Set(b); let i = 0; for (const x of A) if (B.has(x)) i++; return A.size + B.size - i ? i / (A.size + B.size - i) : 0; };
const shingles = (words, n = 5) => { const s = new Set(); for (let i = 0; i + n <= words.length; i++) s.add(words.slice(i, i + n).join(' ')); return s; };
const jaccSet = (A, B) => { let i = 0; for (const x of A) if (B.has(x)) i++; return A.size + B.size - i ? i / (A.size + B.size - i) : 0; };

const pages = [];
for (const kind of ['artikel', 'lp']) {
  const dir = `src/content/${kind}`; if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8'); const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/); if (!m) continue;
    const [, fm, body] = m; const slug = f.replace(/\.md$/, '');
    const title = (fm.match(/^title:\s*"(.*)"\s*$/m) || [])[1] || slug;
    const tags = ((fm.match(/^tags:\s*\[(.*)\]/m) || [])[1] || '').split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    const draft = /^draft:\s*true/m.test(fm);
    const text = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, ' ').replace(/^\|.*$/gm, ' ').replace(/[#*>`_-]/g, ' ');
    const words = norm(text).split(' ').filter(Boolean);
    const kw = regBySlug.get(slug)?.kata_kunci || tags[0] || '';
    pages.push({ raw: body, kind, slug, id: `${kind}/${slug}`, title, kw, draft, words, sh: shingles(words), tt: toks(title), sentences: new Set(text.split(/(?<=[.!?])\s+/).map(norm).filter((s) => s.split(' ').length >= 12)) });
  }
}

const berat = [], ringan = [];
// 1. Alamat (slug) ganda lintas jenis
const seen = new Map();
for (const p of pages) { if (seen.has(p.slug)) berat.push(`Alamat sama dipakai dua halaman: ${seen.get(p.slug)} dan ${p.id}`); else seen.set(p.slug, p.id); }
// 2. Kata kunci utama ganda (hanya bila terdaftar di peta topik; tag pertama dipakai sebagai cadangan)
const byKw = new Map();
for (const p of pages) { const k = norm(p.kw); if (!k) continue; (byKw.get(k) || byKw.set(k, []).get(k)).push(p.id); }
for (const [k, ids] of byKw) if (ids.length > 1) (registry ? berat : ringan).push(`Kata kunci utama "${k}" dipakai ${ids.length} halaman: ${ids.join(', ')}`);
// 3. Judul dan isi mirip
for (let i = 0; i < pages.length; i++) for (let j = i + 1; j < pages.length; j++) {
  const a = pages[i], b = pages[j];
  const tj = jacc(a.tt, b.tt), sj = jaccSet(a.sh, b.sh);
  let shared = 0; for (const s of a.sentences) if (b.sentences.has(s)) shared++;
  const pair = `${a.id}  <->  ${b.id}`;
  if (sj >= 0.35 || shared >= 8) berat.push(`ISI TERLALU MIRIP (${Math.round(sj * 100)}%, ${shared} kalimat sama): ${pair}`);
  else if (sj >= 0.18 || shared >= 4) ringan.push(`Isi agak mirip (${Math.round(sj * 100)}%, ${shared} kalimat sama): ${pair}`);
  if (tj >= 0.75) berat.push(`JUDUL HAMPIR SAMA (${Math.round(tj * 100)}%): ${pair}  | "${a.title}" vs "${b.title}"`);
  else if (tj >= 0.55) ringan.push(`Judul mirip (${Math.round(tj * 100)}%): ${pair}`);
}
// 3b. Kata kunci milik halaman sistem (Promo, Model, Lokasi, Kontak, Beranda) tidak boleh dipakai artikel/LP
if (registry) {
  const sys = new Map((registry.halaman_sistem || []).map((h) => [norm(h.kata_kunci), h.url]));
  for (const p of pages) { const k = norm(p.kw); if (sys.has(k)) berat.push(`Kata kunci "${p.kw}" milik halaman sistem ${sys.get(k)}, jangan dipakai ${p.id}`); }
  // Judul Google beranda tidak boleh memuat kata kunci utama sebuah LP/artikel (beranda dan LP akan bersaing)
  try {
    const home = JSON.parse(fs.readFileSync('src/data/content.json', 'utf8'))?.beranda?.seoJudul || '';
    const nh = norm(home);
    if (home) for (const p of pages) if (p.kind === 'lp' && norm(p.kw).split(' ').length >= 3 && nh.includes(norm(p.kw))) berat.push(`Judul Google beranda "${home}" memuat kata kunci LP ${p.id} ("${p.kw}"). Ganti judul beranda (admin > Isi Halaman > Beranda).`);
  } catch {}
}
// 3c. Artikel yang belum menaut ke LP pilar-nya (kekuatan SEO tidak mengalir)
if (registry) {
  const belum = [];
  for (const p of pages) { if (p.kind !== 'artikel') continue; const t = regBySlug.get(p.slug); if (t?.pilar && !p.raw.includes(`/lp/${t.pilar}/`)) belum.push(`${p.slug} -> /lp/${t.pilar}/`); }
  if (belum.length) { ringan.push(`${belum.length} artikel belum menaut ke LP pilar-nya`); if (verbose) belum.forEach((x) => ringan.push('    ' + x)); }
}
// 4. Peta topik: tiap topik harus unik dan halaman yang sudah ada harus terdaftar
if (registry) {
  const ks = new Map();
  for (const t of registry.topik) { const k = norm(t.kata_kunci); if (ks.has(k)) berat.push(`Peta topik: kata kunci "${t.kata_kunci}" ganda (${ks.get(k)} dan ${t.slug})`); else ks.set(k, t.slug); }
  const known = new Set(registry.topik.map((t) => t.slug));
  for (const p of pages) if (!known.has(p.slug)) ringan.push(`Halaman belum ada di peta topik: ${p.id}`);
}

console.log(`Dicek: ${pages.length} halaman (${pages.filter((p) => p.kind === 'artikel').length} artikel, ${pages.filter((p) => p.kind === 'lp').length} LP)`);
if (berat.length) { console.log('\nMASALAH BERAT (harus diperbaiki sebelum terbit):'); berat.forEach((x) => console.log(' X', x)); }
if (ringan.length && (verbose || !berat.length)) { console.log('\nPeringatan ringan:'); ringan.forEach((x) => console.log(' !', x)); }
else if (ringan.length) console.log(`\n(${ringan.length} peringatan ringan disembunyikan, tambah --semua untuk melihat)`);
if (!berat.length && !ringan.length) console.log('Tidak ada halaman ganda. Aman.');
process.exit(berat.length ? 1 : 0);
