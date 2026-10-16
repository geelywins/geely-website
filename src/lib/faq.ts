// Ubah bagian "## Pertanyaan yang sering diajukan" (### pertanyaan + paragraf jawaban) menjadi data FAQPage untuk mesin pencari dan AI.
const bersih = (s: string) => s
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`>]/g, '').replace(/\s+/g, ' ').trim();

export function faqLd(body: string) {
  const m = body.match(/^## Pertanyaan yang sering diajukan\s*\n([\s\S]*?)(?=^## |\s*$(?![\s\S]))/m);
  if (!m) return [];
  const items: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }[] = [];
  for (const blok of m[1].split(/^### /m).slice(1)) {
    const [q, ...rest] = blok.split('\n');
    const a = bersih(rest.join(' '));
    if (q.trim() && a) items.push({ '@type': 'Question', name: bersih(q), acceptedAnswer: { '@type': 'Answer', text: a } });
  }
  return items.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items }] : [];
}
