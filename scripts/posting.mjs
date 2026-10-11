// Kirim artikel yang BARU tayang ke webhook n8n (untuk diposting ke FB/IG lewat Sosmed Content Bot).
// Jalan tiap hari lewat GitHub Actions. Aturan aman:
//  - Pertama kali jalan: semua artikel yang sudah tayang dicatat sebagai "sudah", TIDAK dikirim (supaya tidak banjir posting).
//  - Maksimal MAKS artikel per hari (bawaan 2).
//  - Hanya dikirim kalau halamannya benar-benar sudah bisa dibuka (HTTP 200).
//  - Tujuan: Telegram (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID) dan/atau webhook (N8N_WEBHOOK_URL). Boleh dua-duanya.
//  - Kalau belum ada tujuan, artikel baru dicatat "dilewati" (tidak menumpuk untuk dikirim belakangan).
// Pemakaian: node scripts/posting.mjs
import fs from 'node:fs';
import path from 'node:path';
import { bacaKonten } from './laporan.mjs';

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'src/data/dipost.json');
const DOMAIN = (() => { try { return fs.readFileSync(path.join(ROOT, 'public/CNAME'), 'utf8').split(/\r?\n/)[0].trim(); } catch { return ''; } })();
const SITE = (process.env.LAPORAN_SITE || (DOMAIN ? `https://${DOMAIN}` : '')).replace(/\/$/, '');
const HOOK = (process.env.N8N_WEBHOOK_URL || '').trim();
const TG_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const TG_CHAT = (process.env.TELEGRAM_CHAT_ID || '').trim();
const TG_API = process.env.TELEGRAM_API || 'https://api.telegram.org';
const MAKS = Number(process.env.POSTING_MAKS || 2);
const todayJkt = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);

function bacaLengkap(slug) {
  const t = fs.readFileSync(path.join(ROOT, 'src/content/artikel', slug + '.md'), 'utf8');
  const fm = t.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1];
  const g = (k) => { const m = fm.match(new RegExp('^' + k + ':\\s*(.*)$', 'm')); return m ? m[1].trim().replace(/^"|"$/g, '') : ''; };
  let tags = []; try { tags = JSON.parse(g('tags') || '[]'); } catch {}
  return { deskripsi: g('description'), kategori: g('category'), tags };
}
const hashtag = (s) => '#' + s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');

// Kirim ke Telegram: gambar sampul + caption siap salin. Kalau gambar gagal, kirim teks saja.
async function kirimTelegram(p) {
  const post = async (metode, body) => {
    const r = await fetch(`${TG_API}/bot${TG_TOKEN}/${metode}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: TG_CHAT, ...body }) });
    if (!r.ok) throw new Error(`Telegram ${metode} ${r.status}`);
  };
  try { await post('sendPhoto', { photo: p.gambar, caption: p.teks.slice(0, 1000) }); }
  catch { await post('sendMessage', { text: p.teks.slice(0, 4000) }); }
}

async function main() {
  if (!SITE) { console.log('Domain belum diatur, dilewati.'); return; }
  const t = todayJkt();
  const tayang = bacaKonten().filter((x) => x.jenis === 'artikel' && !x.draft && x.date && x.date <= t).sort((a, b) => a.date.localeCompare(b.date));
  let st = null;
  try { st = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
  if (!st) {
    st = { catatan: 'Daftar artikel yang sudah diposting ke media sosial. Jangan diubah manual kecuali perlu.', diposting: {} };
    for (const a of tayang) st.diposting[a.slug] = { status: 'awal', tanggal: t };
    fs.writeFileSync(FILE, JSON.stringify(st, null, 2) + '\n');
    console.log(`Catatan awal dibuat: ${tayang.length} artikel lama ditandai sudah ada (tidak dikirim).`);
    return;
  }
  const baru = tayang.filter((a) => !st.diposting[a.slug]);
  console.log(`Artikel baru tayang: ${baru.length}`);
  if (!baru.length) return;
  if (!HOOK && !(TG_TOKEN && TG_CHAT)) {
    for (const a of baru) st.diposting[a.slug] = { status: 'dilewati', tanggal: t, alasan: 'tujuan posting belum dipasang' };
    fs.writeFileSync(FILE, JSON.stringify(st, null, 2) + '\n');
    console.log('Belum ada tujuan posting (Telegram atau webhook): artikel baru dicatat dilewati.');
    return;
  }
  let kirim = 0;
  for (const a of baru) {
    if (kirim >= MAKS) break;
    const url = `${SITE}/artikel/${a.slug}/`;
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'wins-geely-posting' } });
      if (r.status !== 200) { console.log(`Belum bisa dibuka (${r.status}): ${url}, dicoba lagi besok.`); continue; }
      const d = bacaLengkap(a.slug);
      const gambar = a.image ? (/^https?:/.test(a.image) ? a.image : SITE + a.image) : `${SITE}/img/artikel/${a.slug}/sampul.png`;
      const tag = [...new Set(['#geely', ...d.tags.slice(0, 3).map(hashtag)])].filter((x) => x.length > 2).join(' ');
      const payload = { sumber: 'geelywins-website', judul: a.title, deskripsi: d.deskripsi, kategori: d.kategori, tags: d.tags, tanggal: a.date, url, gambar, teks: `${a.title}\n\n${d.deskripsi}\n\nBaca selengkapnya: ${url}\n\n${tag}` };
      let ok = false;
      if (HOOK) {
        const res = await fetch(HOOK, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) ok = true; else console.log(`Webhook menolak (${res.status}) untuk ${a.slug}.`);
      }
      if (TG_TOKEN && TG_CHAT) {
        try { await kirimTelegram(payload); ok = true; } catch (e) { console.log('Telegram gagal:', String(e.message || e).slice(0, 120)); }
      }
      if (!ok) { console.log(`Gagal mengirim ${a.slug}, dicoba lagi besok.`); continue; }
      st.diposting[a.slug] = { status: 'terkirim', tanggal: t };
      kirim++;
      console.log('Terkirim:', a.slug);
    } catch (e) { console.log('Gagal:', a.slug, String(e.message || e).slice(0, 200)); }
  }
  fs.writeFileSync(FILE, JSON.stringify(st, null, 2) + '\n');
}
main().catch((e) => { console.error(e); process.exit(0); });
