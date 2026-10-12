// Laporan mingguan otomatis. Hasilnya ditulis ke src/data/laporan.json dan tampil di Admin > Laporan.
// Isi: (1) Search Console, (2) link rusak + cek SEO halaman, (3) skor kecepatan Lighthouse, (4) artikel yang perlu diperbarui.
// Semua bagian dibuat aman: kalau satu bagian gagal, bagian lain tetap jalan dan website tidak terganggu.
// Pemakaian: node scripts/laporan.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'src/data/laporan.json');
const readCname = () => { try { return fs.readFileSync(path.join(ROOT, 'public/CNAME'), 'utf8').split(/\r?\n/)[0].trim(); } catch { return ''; } };
const DOMAIN = readCname();
const SITE = (process.env.LAPORAN_SITE || (DOMAIN ? `https://${DOMAIN}` : '')).replace(/\/$/, '');
const TOKEN_URL = process.env.GSC_TOKEN_URL || 'https://oauth2.googleapis.com/token';
const GSC_API = process.env.GSC_API || 'https://www.googleapis.com/webmasters/v3';
const UA = { 'user-agent': 'Mozilla/5.0 (compatible; wins-geely-laporan)' };

const todayJkt = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const log = (...a) => console.log(...a);
const errMsg = (e) => String((e && e.message) || e).slice(0, 300);

// ---------- baca isi artikel / LP ----------
function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const o = {};
  if (!m) return o;
  for (const line of m[1].split(/\r?\n/)) {
    const k = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!k) continue;
    let v = k[2].trim();
    if (/^".*"$/.test(v)) v = v.slice(1, -1);
    o[k[1]] = v;
  }
  return o;
}
export function bacaKonten() {
  const out = [];
  for (const jenis of ['artikel', 'lp']) {
    const dir = path.join(ROOT, 'src/content', jenis);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const fm = frontmatter(fs.readFileSync(path.join(dir, f), 'utf8'));
      out.push({ jenis, slug: f.replace(/\.md$/, ''), title: fm.title || f, date: String(fm.date || '').slice(0, 10), updated: String(fm.updated || '').slice(0, 10), draft: fm.draft === 'true', image: fm.image || '' });
    }
  }
  return out;
}

// ---------- 1. artikel usang + ringkasan ----------
function bagianKonten() {
  const t = todayJkt();
  const semua = bacaKonten();
  const tayang = semua.filter((x) => !x.draft && x.date && x.date <= t);
  const ringkas = {
    tayang: tayang.length,
    terjadwal: semua.filter((x) => !x.draft && x.date > t).length,
    draft: semua.filter((x) => x.draft).length,
  };
  const usang = [];
  for (const x of tayang) {
    const ref = x.updated || x.date;
    const hari = Math.floor((Date.parse(t) - Date.parse(ref)) / 86400e3);
    if (hari > 180) usang.push({ jenis: x.jenis, slug: x.slug, title: x.title, umur_hari: hari });
  }
  usang.sort((a, b) => b.umur_hari - a.umur_hari);
  return { ringkas, usang };
}

// ---------- 2. Search Console ----------
function bacaKunci() {
  let raw = (process.env.GSC_KEY || '').trim();
  if (!raw) return null;
  if (!raw.startsWith('{')) { try { raw = Buffer.from(raw, 'base64').toString('utf8'); } catch {} }
  const j = JSON.parse(raw);
  if (!j.client_email || !j.private_key) throw new Error('Kunci tidak lengkap: harus berisi client_email dan private_key');
  return j;
}
async function tokenGoogle(k) {
  const b64u = (x) => Buffer.from(x).toString('base64url');
  const iat = Math.floor(Date.now() / 1000);
  const unsigned = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' + b64u(JSON.stringify({
    iss: k.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: TOKEN_URL, iat, exp: iat + 3600,
  }));
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(k.private_key, 'base64url');
  const r = await fetch(TOKEN_URL, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + sig }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error('Gagal masuk ke Google: ' + (j.error_description || j.error || r.status));
  return j.access_token;
}
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400e3);
const slugDari = (u) => { try { return new URL(u).pathname; } catch { return u; } };

export function analisaGsc(rows) {
  const dekat = [], ctrRendah = [], porsiQ = new Map();
  for (const r of rows) {
    const [query, page] = r.keys;
    const pos = r.position, imp = r.impressions;
    if (pos >= 8 && pos <= 20 && imp >= 10) dekat.push({ query, halaman: slugDari(page), posisi: +pos.toFixed(1), tayang: imp, klik: r.clicks });
    if (pos <= 5 && imp >= 30 && r.ctr < 0.03) ctrRendah.push({ query, halaman: slugDari(page), posisi: +pos.toFixed(1), tayang: imp, ctr: +(r.ctr * 100).toFixed(1) });
    if (imp >= 5) { if (!porsiQ.has(query)) porsiQ.set(query, []); porsiQ.get(query).push({ halaman: slugDari(page), posisi: +pos.toFixed(1), tayang: imp }); }
  }
  dekat.sort((a, b) => b.tayang - a.tayang);
  ctrRendah.sort((a, b) => b.tayang - a.tayang);
  const bersaing = [];
  for (const [query, pages] of porsiQ) if (new Set(pages.map((p) => p.halaman)).size >= 2) bersaing.push({ query, halaman: pages.sort((a, b) => a.posisi - b.posisi) });
  bersaing.sort((a, b) => b.halaman.length - a.halaman.length);
  // Semua kata kunci: gabung per kata (posisi dirata-rata berbobot tayang), urut dari yang paling sering muncul
  const per = new Map();
  for (const r of rows) {
    const [query, page] = r.keys;
    if (!per.has(query)) per.set(query, { query, tayang: 0, klik: 0, bobot: 0, halaman: slugDari(page), maks: 0 });
    const o = per.get(query);
    o.tayang += r.impressions; o.klik += r.clicks; o.bobot += r.position * r.impressions;
    if (r.impressions > o.maks) { o.maks = r.impressions; o.halaman = slugDari(page); }
  }
  const semua = [...per.values()].map((o) => ({ query: o.query, posisi: o.tayang ? +(o.bobot / o.tayang).toFixed(1) : 0, tayang: o.tayang, klik: o.klik, halaman: o.halaman }))
    .sort((a, b) => b.tayang - a.tayang || a.posisi - b.posisi).slice(0, 200);
  return { dekat: dekat.slice(0, 15), ctrRendah: ctrRendah.slice(0, 10), bersaing: bersaing.slice(0, 10), semua };
}

async function bagianGsc() {
  let k;
  try { k = bacaKunci(); } catch (e) { return { status: 'error', pesan: errMsg(e) }; }
  if (!k) return { status: 'belum_disambungkan', pesan: 'Kunci Search Console (GSC_KEY) belum dipasang di GitHub Secrets.' };
  try {
    const tok = await tokenGoogle(k);
    const H = { authorization: 'Bearer ' + tok, 'content-type': 'application/json' };
    const sl = await (await fetch(GSC_API + '/sites', { headers: H })).json();
    const daftar = (sl.siteEntry || []).map((s) => s.siteUrl);
    const kandidat = [process.env.GSC_SITE, `sc-domain:${DOMAIN}`, `https://${DOMAIN}/`, `https://www.${DOMAIN}/`].filter(Boolean);
    const site = kandidat.find((c) => daftar.includes(c));
    if (!site) return { status: 'situs_tidak_ditemukan', pesan: `Akun layanan (${k.client_email}) belum ditambahkan sebagai pengguna di Search Console untuk ${DOMAIN}. Situs yang bisa dilihat akun ini: ${daftar.join(', ') || 'tidak ada'}.` };
    const q = async (body) => {
      const r = await fetch(`${GSC_API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { method: 'POST', headers: H, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error('Search Console: ' + ((j.error && j.error.message) || r.status));
      return j.rows || [];
    };
    const akhir = addDays(new Date(), -3), mulai = addDays(akhir, -27);
    const akhir0 = addDays(mulai, -1), mulai0 = addDays(akhir0, -27);
    const per = { startDate: iso(mulai), endDate: iso(akhir) };
    const per0 = { startDate: iso(mulai0), endDate: iso(akhir0) };
    const [tot, tot0, qp, pg] = await Promise.all([
      q({ ...per }), q({ ...per0 }),
      q({ ...per, dimensions: ['query', 'page'], rowLimit: 2500 }),
      q({ ...per, dimensions: ['page'], rowLimit: 25 }),
    ]);
    const t1 = tot[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const t0 = tot0[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const rng = (t) => ({ klik: t.clicks, tayang: t.impressions, ctr: +(t.ctr * 100).toFixed(1), posisi: +t.position.toFixed(1) });
    return {
      status: 'ok', situs: site, periode: per, sekarang: rng(t1), sebelumnya: rng(t0),
      halaman_teratas: pg.map((r) => ({ halaman: slugDari(r.keys[0]), klik: r.clicks, tayang: r.impressions, posisi: +r.position.toFixed(1) })).sort((a, b) => b.klik - a.klik || b.tayang - a.tayang).slice(0, 10),
      ...analisaGsc(qp),
    };
  } catch (e) { return { status: 'error', pesan: errMsg(e) }; }
}

// ---------- 3. cek link rusak + SEO halaman ----------
const locs = (x) => [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
async function ambil(u, opt = {}) {
  const c = new AbortController(); const tm = setTimeout(() => c.abort(), opt.timeout || 15000);
  try { return await fetch(u, { redirect: 'follow', signal: c.signal, headers: UA, ...opt }); } finally { clearTimeout(tm); }
}
async function paralel(items, n, fn) {
  const hasil = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; hasil[k] = await fn(items[k], k); } }));
  return hasil;
}
const teks = (h, re) => { const m = h.match(re); return m ? m[1].replace(/\s+/g, ' ').trim() : ''; };
const dekode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export function seoHalaman(html) {
  const m = [];
  const title = dekode(teks(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const desc = dekode(teks(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) || teks(html, /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i));
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (!title) m.push('Tidak ada judul (title)'); else if (title.length > 65) m.push(`Judul terlalu panjang (${title.length} huruf, ideal maks 65)`); else if (title.length < 20) m.push(`Judul terlalu pendek (${title.length} huruf)`);
  if (!desc) m.push('Tidak ada deskripsi'); else if (desc.length > 165) m.push(`Deskripsi terlalu panjang (${desc.length} huruf, ideal maks 160)`); else if (desc.length < 70) m.push(`Deskripsi terlalu pendek (${desc.length} huruf)`);
  if (h1 === 0) m.push('Tidak ada judul utama (H1)'); else if (h1 > 1) m.push(`Ada ${h1} judul utama (H1), seharusnya 1`);
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) m.push('Tidak ada canonical');
  const tanpaAlt = (html.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) || []).length;
  if (tanpaAlt) m.push(`${tanpaAlt} gambar tanpa teks alt`);
  return { title, desc, masalah: m };
}
export function ambilLink(html) {
  const out = new Set();
  for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"'#][^"']*)["']/gi)) out.add(dekode(m[1]));
  return [...out];
}

async function bagianLink() {
  if (!SITE) return { status: 'error', pesan: 'Domain belum diatur (file public/CNAME kosong).' };
  try {
    const idx = await (await ambil(SITE + '/sitemap-index.xml')).text();
    let urls = [];
    for (const m of locs(idx)) urls.push(...locs(await (await ambil(SITE + new URL(m).pathname)).text()));
    urls = [...new Set(urls.map((u) => SITE + new URL(u).pathname))];
    if (!urls.length) throw new Error('Sitemap kosong');
    const halaman = await paralel(urls, 6, async (u) => {
      try { const r = await ambil(u); return { u, status: r.status, html: r.ok ? await r.text() : '' }; }
      catch (e) { return { u, status: 0, html: '' }; }
    });
    const rusak = [], seo = [], sumber = new Map(), judul = new Map(), deskr = new Map();
    for (const p of halaman) {
      if (p.status !== 200) { rusak.push({ url: p.u, status: p.status || 'gagal', dari: ['(sitemap)'] }); continue; }
      const s = seoHalaman(p.html);
      if (s.title) { if (!judul.has(s.title)) judul.set(s.title, []); judul.get(s.title).push(p.u); }
      if (s.desc) { if (!deskr.has(s.desc)) deskr.set(s.desc, []); deskr.get(s.desc).push(p.u); }
      if (s.masalah.length) seo.push({ url: slugDari(p.u), masalah: s.masalah });
      for (const l of ambilLink(p.html)) {
        if (/^(mailto:|tel:|javascript:|data:|sms:)/i.test(l)) continue;
        let abs; try { abs = new URL(l, p.u); } catch { continue; }
        if (!/^https?:$/.test(abs.protocol)) continue;
        abs.hash = '';
        if (/(^|\.)wa\.me$|whatsapp\.com$/.test(abs.hostname)) continue;
        const key = abs.href;
        if (!sumber.has(key)) sumber.set(key, new Set());
        sumber.get(key).add(slugDari(p.u));
      }
    }
    for (const [t, l] of judul) if (l.length > 1) for (const u of l) { const x = seo.find((e) => e.url === slugDari(u)) || (seo[seo.length] = { url: slugDari(u), masalah: [] }); x.masalah.push(`Judul sama dengan ${l.length - 1} halaman lain (bisa saling bersaing di Google)`); }
    for (const [t, l] of deskr) if (l.length > 1) for (const u of l) { const x = seo.find((e) => e.url === slugDari(u)) || (seo[seo.length] = { url: slugDari(u), masalah: [] }); x.masalah.push(`Deskripsi sama dengan ${l.length - 1} halaman lain`); }
    const sudah = new Map(halaman.map((p) => [p.u, p.status]));
    const targets = [...sumber.keys()].filter((u) => !sudah.has(u)).slice(0, 250);
    const hasil = await paralel(targets, 8, async (u) => {
      const eksternal = new URL(u).origin !== SITE;
      try {
        let r = await ambil(u, { method: 'HEAD', timeout: 12000 });
        if (r.status >= 400 || r.status === 405) r = await ambil(u, { method: 'GET', timeout: 12000 });
        return { u, status: r.status, eksternal };
      } catch (e) {
        try { const r2 = await ambil(u, { method: 'GET', timeout: 15000 }); return { u, status: r2.status, eksternal }; }
        catch (e2) { return { u, status: 0, eksternal }; }
      }
    });
    // 401/403/429/999 = situs menolak robot, bukan berarti link rusak
    const abaikan = new Set([401, 403, 429, 999, 503]);
    for (const h of hasil) {
      if (h.status >= 200 && h.status < 400) continue;
      if (h.eksternal && abaikan.has(h.status)) continue;
      rusak.push({ url: h.u, status: h.status || 'tidak bisa dihubungi', luar: h.eksternal, ragu: h.eksternal && !h.status, dari: [...sumber.get(h.u)].slice(0, 3) });
    }
    return { status: 'ok', halaman_dicek: halaman.length, link_dicek: targets.length, rusak, seo: seo.sort((a, b) => b.masalah.length - a.masalah.length), urls };
  } catch (e) { return { status: 'error', pesan: errMsg(e) }; }
}

// ---------- 4. Lighthouse ----------
function bagianLighthouse(urls) {
  if (process.env.LAPORAN_TANPA_LH) return { status: 'dilewati', hasil: [] };
  const pilih = [SITE + '/'];
  const ambilYang = (re, n) => urls.filter((u) => re.test(new URL(u).pathname)).slice(0, n);
  pilih.push(...ambilYang(/^\/model\/geely-ex5\/$/, 1), ...ambilYang(/^\/artikel\/[^/]+\/$/, 2), ...ambilYang(/^\/lp\/[^/]+\/$/, 1));
  const hasil = [];
  for (const u of [...new Set(pilih)]) {
    const f = path.join(os.tmpdir(), 'lh-' + Date.now() + '.json');
    try {
      execFileSync('npx', ['--yes', 'lighthouse@12', u, '--output=json', '--output-path=' + f, '--quiet', '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new --no-sandbox --disable-gpu'], { stdio: 'pipe', timeout: 240000, env: process.env });
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      const sk = (k) => Math.round((j.categories[k].score || 0) * 100);
      const a = (k) => (j.audits[k] && j.audits[k].displayValue) || '';
      hasil.push({ url: slugDari(u), skor: { performa: sk('performance'), aksesibilitas: sk('accessibility'), praktik: sk('best-practices'), seo: sk('seo') }, lcp: a('largest-contentful-paint'), cls: a('cumulative-layout-shift'), tbt: a('total-blocking-time') });
    } catch (e) { hasil.push({ url: slugDari(u), error: errMsg(e) }); }
    try { fs.unlinkSync(f); } catch {}
  }
  return { status: 'ok', hasil };
}

// ---------- jalankan ----------
async function main() {
  const lama = (() => { try { return JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { return {}; } })();
  const konten = bagianKonten();
  log('Konten:', JSON.stringify(konten.ringkas));
  const gsc = await bagianGsc(); log('Search Console:', gsc.status, gsc.pesan || '');
  const link = await bagianLink(); log('Link/SEO:', link.status, link.pesan || `${link.halaman_dicek} halaman, ${link.rusak && link.rusak.length} link rusak`);
  const urls = link.urls || [];
  delete link.urls;
  const lh = link.status === 'ok' || SITE ? bagianLighthouse(urls.length ? urls : [SITE + '/']) : { status: 'dilewati', hasil: [] };
  log('Lighthouse:', lh.status, lh.hasil.map((h) => h.url + ' ' + (h.skor ? h.skor.performa : 'gagal')).join(' | '));
  const laporan = { dibuat: new Date().toISOString(), domain: DOMAIN, konten: konten.ringkas, usang: konten.usang, gsc, link, lighthouse: lh, riwayat_gsc: lama.riwayat_gsc || [] };
  if (gsc.status === 'ok') {
    laporan.riwayat_gsc = [...laporan.riwayat_gsc, { tanggal: todayJkt(), klik: gsc.sekarang.klik, tayang: gsc.sekarang.tayang, posisi: gsc.sekarang.posisi }].slice(-26);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(laporan, null, 2) + '\n');
  log('Laporan ditulis:', OUT);
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  main().catch((e) => { console.error(e); process.exit(0); });
}
