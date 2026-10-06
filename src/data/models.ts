// Data model mobil dibaca dari models.json.
// Cara termudah mengubahnya: lewat halaman admin (menu "Model Mobil").
import data from './models.json';

export interface GeelyModel {
  slug: string;
  nama: string;
  tipe: string;
  ringkas: string;
  deskripsi: string;
  keunggulan: string[];
  harga: string;
  spesifikasi: { label: string; nilai: string }[];
  foto?: string;
  galeri?: string[];
  warna: string;
}

export const MODELS: GeelyModel[] = data as GeelyModel[];

export const getModel = (slug: string) => MODELS.find((m) => m.slug === slug);
