// ==========================================================
// Semua isi di bawah dibaca dari file data di src/data/.
// Cara termudah mengubahnya: lewat halaman admin (alamatwebsite/admin/).
// ==========================================================
import settings from './data/settings.json';
import content from './data/content.json';

export interface Sosmed { platform: string; label: string; url: string }
export interface SitusLain { nama: string; url: string; deskripsi: string }
export interface Lokasi { nama: string; area: string }

export const SITE = {
  name: settings.namaSitus,
  nickname: settings.namaPanggilan,
  fullName: `${settings.namaLengkap} - ${settings.profesi}`,
  person: settings.namaLengkap,
  job: settings.profesi,
  tagline: settings.tagline,
  description: settings.deskripsi,
  dealer: settings.dealer,
  whatsapp: settings.whatsapp,
  email: settings.email,
  ogImage: settings.ogImage || '/og-default.png',
  sosmed: settings.sosmed as Sosmed[],
  situsLain: settings.situsLain as SitusLain[],
  locations: settings.lokasi as Lokasi[],
  lang: 'id-ID',
};

export const CONTENT = content;

export function waLink(text: string = settings.pesanWa) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const phoneDisplay = (() => {
  const n = String(settings.whatsapp || '');
  return n.startsWith('62') ? '0' + n.slice(2) : n;
})();
