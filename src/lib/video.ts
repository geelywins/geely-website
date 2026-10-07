// Mengambil ID video YouTube dari link apa pun (youtu.be, watch?v=, shorts, embed) atau ID polos.
export function youtubeId(input?: string | null): string {
  const v = String(input || '').trim();
  if (!v) return '';
  if (/^[\w-]{11}$/.test(v)) return v;
  const m = v.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : '';
}
