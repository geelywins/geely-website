import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { coverPng, insertPng } from '../../../../lib/cards';

// Gambar otomatis untuk landing page: sampul.png (untuk tampilan & og:image) dan sisip.png (di tengah isi)
export async function getStaticPaths() {
  const all = await getCollection('lp');
  return all.flatMap((e) => ['sampul', 'sisip'].map((kind) => ({ params: { slug: e.id, kind }, props: { e, kind } })));
}

export const GET: APIRoute = async ({ props }) => {
  const { e, kind } = props as any;
  const d = e.data;
  const points = [...(e.body ?? '').matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].replace(/[*_`]/g, '').trim()).filter((p) => !/^(faq|pertanyaan)/i.test(p));
  const buf = kind === 'sampul' ? await coverPng(d.title, 'Panduan Geely') : await insertPng(d.title, points);
  return new Response(buf, { headers: { 'Content-Type': 'image/png' } });
};
