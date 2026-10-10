// Pembaca data. Semua data yang diubah lewat admin ada di src/data/*.json.
// Kalau file/field belum ada (misalnya pada website lama), otomatis dipakai nilai bawaan dari defaults.json.
import defaults from './defaults.json';

const raw = import.meta.glob('../data/*.json', { eager: true, import: 'default' }) as Record<string, any>;
const file = (name: string) => raw[`../data/${name}.json`];

export function fill(def: any, val: any): any {
  if (val === undefined || val === null) return def;
  if (Array.isArray(def) || Array.isArray(val)) return Array.isArray(val) ? val : def;
  if (def && typeof def === 'object') {
    if (typeof val !== 'object') return def;
    const out: any = { ...val };
    for (const k of Object.keys(def)) out[k] = fill(def[k], val[k]);
    return out;
  }
  return val;
}

export interface GeelyModel {
  slug: string; nama: string; tipe: string; ringkas: string; deskripsi: string;
  keunggulan: string[]; harga: string; spesifikasi: { label: string; nilai: string }[];
  foto?: string; galeri?: string[]; warna: string; model3d?: string; link3d?: string;
}
export interface Promo { id: string; judul: string; deskripsi: string; periode?: string; foto?: string; model?: string; aktif: boolean }
export interface Slide { label: string; judul: string; teks: string; foto?: string; fotoHp?: string; posisiTeks?: string; tombol?: string; link?: string; tombol2?: string; link2?: string; warna?: string; aktif: boolean }
export interface Testimoni { nama: string; keterangan?: string; model?: string; teks: string; rating?: string | number; foto?: string; aktif: boolean }
export interface Delivery { judul: string; nama?: string; model?: string; tanggal?: string; foto: string; caption?: string; link?: string; aktif: boolean }

export const settings = fill(defaults.settings, file('settings'));
export const content = fill(defaults.content, file('content'));

// Link 3D resmi Geely (dipakai kalau kolom "Link 3D resmi Geely" di admin masih kosong)
const LINK3D_BAWAAN: Record<string, string> = {
  'geely-ex2': 'https://global.geely.com/digital/3d/en/ex2',
  'geely-ex5': 'https://global.geely.com/digital/3d/en/ex5',
  'geely-starray-em-i': 'https://global.geely.com/digital/3d/en/p145',
};
export const MODELS: GeelyModel[] = (fill(defaults.models, file('models')) as GeelyModel[]).map((m) => ({ ...m, link3d: m.link3d || LINK3D_BAWAAN[m.slug] || '' }));
export const getModel = (slug?: string) => MODELS.find((m) => m.slug === slug);

export const PROMOS: Promo[] = fill(defaults.promo, file('promo'));
export const ACTIVE_PROMOS = PROMOS.filter((p) => p.aktif);

export const SLIDES: Slide[] = (fill(defaults.slider, file('slider')) as Slide[]).filter((s) => s.aktif);
export const TESTIMONI: Testimoni[] = (fill(defaults.testimoni, file('testimoni')) as Testimoni[]).filter((t) => t.aktif);
export const DELIVERY: Delivery[] = (fill(defaults.delivery, file('delivery')) as Delivery[])
  .filter((d) => d.aktif && d.foto)
  .sort((a, b) => String(b.tanggal || '').localeCompare(String(a.tanggal || '')));
