import type { APIRoute } from 'astro';
import { getLiveArticles, getLiveLandingPages } from '../lib/articles';
import { SITE } from '../config';

// Ringkasan situs untuk mesin pencari berbasis AI (format llms.txt).
export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const u = (p: string) => new URL(`${base}${p}`, site).href;
  const lps = (await getLiveLandingPages()).sort((a, b) => a.id.localeCompare(b.id));
  const arts = (await getLiveArticles()).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const baris = [
    `# ${SITE.name}`, '',
    `> Informasi mobil listrik dan plug-in hybrid Geely (EX2, EX5, Starray EM-i) dari sales consultant ${SITE.person} (${SITE.nickname}), dealer ${SITE.dealer}. Semua angka teknis adalah klaim pabrikan dari brosur resmi; harga dan promo berubah, minta penawaran tertulis.`, '',
    '## Halaman utama',
    `- [Model mobil](${u('/model/')}): spesifikasi model Geely`,
    `- [Promo](${u('/promo/')}): penawaran yang sedang berjalan`,
    `- [Lokasi dealer](${u('/lokasi/')}): dealer dan peta`,
    `- [Kontak](${u('/kontak/')}): WhatsApp untuk konsultasi, test drive, simulasi kredit`, '',
    '## Landing page',
    ...lps.map((l) => `- [${l.data.title}](${u(`/lp/${l.id}/`)}): ${l.data.description}`), '',
    '## Artikel',
    ...arts.map((a) => `- [${a.data.title}](${u(`/artikel/${a.id}/`)}): ${a.data.description}`), '',
  ];
  return new Response(baris.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
