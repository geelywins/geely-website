import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { coverPng, insertPng } from '../../../../lib/cards';

// Satu endpoint membuat dua gambar per artikel: sampul.png & sisip.png (semua artikel, termasuk draft,
// supaya pratinjau selalu lengkap; ukurannya kecil).
export async function getStaticPaths() {
  const all = await getCollection('artikel');
  return all.flatMap((e) => ['sampul', 'sisip'].map((kind) => ({ params: { slug: e.id, kind }, props: { e, kind } })));
}

export const GET: APIRoute = async ({ props }) => {
  const { e, kind } = props as any;
  const d = e.data;
  const points = [...(e.body ?? '').matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].replace(/[*_`]/g, '').trim()).filter((p) => !/^(faq|pertanyaan)/i.test(p));
  const buf = kind === 'sampul' ? await coverPng(d.title, d.category) : await insertPng(d.title, points);
  return new Response(buf, { headers: { 'Content-Type': 'image/png' } });
};
