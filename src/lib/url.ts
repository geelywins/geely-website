// Alat kecil untuk alamat gambar & tautan.
// Di admin, gambar disimpan tanpa awalan folder website (contoh: /images/model/ex5.jpg).
// Fungsi ini menambahkan awalan itu otomatis, jadi tetap benar kalau nanti pindah ke domain sendiri.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function href(path: string): string {
  return `${BASE}${path}`;
}

export function asset(p?: string | null): string {
  if (!p) return '';
  if (/^(https?:)?\/\//.test(p) || p.startsWith('data:')) return p;
  return p.startsWith('/') ? BASE + p : p;
}

export function absolute(path: string, site: URL | undefined): string {
  return new URL(path, site).href;
}

// "Mobil {Geely} modern" -> bagian dalam kurung kurawal akan diberi warna sorot.
export function splitHighlight(text: string): { before: string; mark: string; after: string } {
  const m = text.match(/^(.*?)\{(.+?)\}(.*)$/s);
  return m ? { before: m[1], mark: m[2], after: m[3] } : { before: text, mark: '', after: '' };
}
