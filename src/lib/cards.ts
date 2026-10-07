// Pembuat gambar otomatis untuk artikel (sampul & sisipan tengah artikel).
// Dipakai kalau admin tidak mengunggah gambar sendiri. Hasilnya PNG 1200x630.
import sharp from 'sharp';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function wrap(text: string, max: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…';
  }
  return lines;
}

const FONT = "DejaVu Sans, Arial, Helvetica, sans-serif";
const BG = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1f3a"/><stop offset="1" stop-color="#0e5a6e"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#g)"/>
<circle cx="1080" cy="90" r="220" fill="#ffffff" fill-opacity="0.05"/><circle cx="1130" cy="560" r="150" fill="#3fd0c9" fill-opacity="0.12"/>`;

function footer() {
  return `<text x="70" y="580" font-family="${FONT}" font-size="26" fill="#9fe7e2">Wins Geely · geelywins.com</text>
<rect x="70" y="545" width="90" height="5" rx="2.5" fill="#3fd0c9"/>`;
}

export async function coverPng(title: string, category: string): Promise<Buffer> {
  const lines = wrap(title, 24, 4);
  const t = lines.map((l, i) => `<text x="70" y="${230 + i * 76}" font-family="${FONT}" font-size="60" font-weight="700" fill="#ffffff">${esc(l)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">${BG}
<rect x="70" y="90" width="${60 + category.length * 17}" height="48" rx="24" fill="#3fd0c9"/>
<text x="100" y="123" font-family="${FONT}" font-size="26" font-weight="700" fill="#0b1f3a">${esc(category)}</text>${t}${footer()}</svg>`;
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

export async function insertPng(title: string, points: string[]): Promise<Buffer> {
  const head = wrap(title, 40, 2);
  const h = head.map((l, i) => `<text x="70" y="${95 + i * 38}" font-family="${FONT}" font-size="28" fill="#9fe7e2">${esc(l)}</text>`).join('');
  const pts = points.slice(0, 5).map((p, i) => {
    const y = 285 + i * 58;
    const txt = wrap(p.replace(/^\d+[.)]\s*/, ''), 46, 1)[0];
    return `<circle cx="90" cy="${y - 10}" r="20" fill="#3fd0c9"/><text x="90" y="${y - 1}" text-anchor="middle" font-family="${FONT}" font-size="24" font-weight="700" fill="#0b1f3a">${i + 1}</text>
<text x="132" y="${y}" font-family="${FONT}" font-size="34" font-weight="700" fill="#ffffff">${esc(txt)}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">${BG}${h}
<text x="70" y="215" font-family="${FONT}" font-size="22" letter-spacing="3" fill="#3fd0c9">POIN PENTING ARTIKEL INI</text>${pts}${footer()}</svg>`;
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
