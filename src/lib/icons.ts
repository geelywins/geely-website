// Logo sosmed diambil saat build (tidak menambah ukuran JavaScript di halaman).
import { siInstagram, siThreads, siYoutube, siTiktok, siFacebook, siWhatsapp, siX, siTelegram } from 'simple-icons';

export interface IconDef { title: string; path: string; hex: string }

const ICONS: Record<string, IconDef> = {
  instagram: siInstagram,
  threads: siThreads,
  youtube: siYoutube,
  tiktok: siTiktok,
  facebook: siFacebook,
  whatsapp: siWhatsapp,
  x: siX,
  twitter: siX,
  telegram: siTelegram,
};

// Ikon bola dunia untuk platform yang tidak dikenal
export const GLOBE: IconDef = {
  title: 'Website',
  hex: '2563eb',
  path: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm9.95 11h-4.1a15.9 15.9 0 0 0-1.46-6.27A10.03 10.03 0 0 1 21.95 11zM12 2.1c.95 1.12 2.07 3.4 2.43 8.9H9.57C9.93 5.5 11.05 3.22 12 2.1zM7.61 4.73A15.9 15.9 0 0 0 6.15 11h-4.1a10.03 10.03 0 0 1 5.56-6.27zM2.05 13h4.1a15.9 15.9 0 0 0 1.46 6.27A10.03 10.03 0 0 1 2.05 13zM12 21.9c-.95-1.12-2.07-3.4-2.43-8.9h4.86c-.36 5.5-1.48 7.78-2.43 8.9zm4.39-2.63A15.9 15.9 0 0 0 17.85 13h4.1a10.03 10.03 0 0 1-5.56 6.27z',
};

export function iconFor(name: string): IconDef {
  return ICONS[String(name || '').trim().toLowerCase()] ?? GLOBE;
}

// Warna gelap (hitam) diganti warna teks supaya tetap terlihat di mode gelap
export function iconColor(def: IconDef): string {
  return /^(0{6}|0[0-9a-f]0[0-9a-f]0[0-9a-f])$/i.test(def.hex) && def.hex.toLowerCase() === '000000' ? 'currentColor' : `#${def.hex}`;
}
