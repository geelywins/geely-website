// Data promo dibaca dari promo.json (diubah lewat admin, menu "Promo").
import data from './promo.json';

export interface Promo {
  id: string;
  judul: string;
  deskripsi: string;
  periode?: string;
  foto?: string;
  model?: string;
  aktif: boolean;
}

export const PROMOS: Promo[] = data as Promo[];
export const ACTIVE_PROMOS: Promo[] = PROMOS.filter((p) => p.aktif);
