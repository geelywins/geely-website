import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const sitemap = new URL(`${base}/sitemap-index.xml`, site).href;
  const body = `User-agent: *
Allow: /
Disallow: ${base}/admin/

# Crawler AI diizinkan agar konten bisa dikutip dalam jawaban AI
User-agent: GPTBot
Allow: /
Disallow: ${base}/admin/
User-agent: ClaudeBot
Allow: /
Disallow: ${base}/admin/
User-agent: PerplexityBot
Allow: /
Disallow: ${base}/admin/
User-agent: Google-Extended
Allow: /
Disallow: ${base}/admin/

Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
