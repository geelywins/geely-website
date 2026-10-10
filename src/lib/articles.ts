// Artikel yang sudah boleh tayang: bukan draft DAN tanggal tayangnya sudah tiba (waktu Jakarta).
// Artikel dengan tanggal di masa depan otomatis tayang saat website dibangun ulang pada tanggal itu.
import { getCollection } from 'astro:content';

export const todayWIB = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);

export async function getLiveArticles() {
  const t = todayWIB();
  return (await getCollection('artikel')).filter((a) => !a.data.draft && a.data.date.toISOString().slice(0, 10) <= t);
}

export async function getLiveLandingPages() {
  const t = todayWIB();
  return (await getCollection('lp')).filter((a) => !a.data.draft && a.data.date.toISOString().slice(0, 10) <= t);
}
