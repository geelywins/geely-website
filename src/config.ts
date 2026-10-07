// Semua isi dibaca dari file data di src/data/ lewat src/lib/data.ts.
// Cara termudah mengubahnya: lewat halaman admin (alamatwebsite/admin/).
import { settings, content } from './lib/data';

export interface Sosmed { platform: string; label: string; url: string }
export interface SitusLain { nama: string; url: string; deskripsi: string }
export interface Lokasi { nama: string; area: string }

export const SITE = {
  name: settings.namaSitus as string,
  nickname: settings.namaPanggilan as string,
  fullName: `${settings.namaLengkap} - ${settings.profesi}`,
  person: settings.namaLengkap as string,
  job: settings.profesi as string,
  tagline: settings.tagline as string,
  description: settings.deskripsi as string,
  dealer: settings.dealer as string,
  whatsapp: settings.whatsapp as string,
  email: settings.email as string,
  photo: (settings.fotoProfil || '') as string,
  greet: (settings.sapaanProfil || '') as string,
  ogImage: (settings.ogImage || '/og-default.png') as string,
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
