// Setelah build: kecilkan ukuran foto besar di dist/images (lebar maks 1600 px, kualitas 76) supaya halaman cepat dibuka di HP.
// Hanya file yang jadi lebih kecil yang diganti. File asli di repository tidak diubah.
import sharp from 'sharp';
import fs from 'node:fs'; import path from 'node:path';
const root = 'dist/images';
if (!fs.existsSync(root)) process.exit(0);
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let before = 0, after = 0, n = 0;
for (const f of walk(root)) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue;
  const size = fs.statSync(f).size;
  if (size < 120 * 1024) continue;
  try {
    const img = sharp(f, { failOn: 'none' }).rotate().resize({ width: 1600, withoutEnlargement: true });
    const buf = /\.png$/i.test(f) ? await img.png({ compressionLevel: 9, palette: true, quality: 80 }).toBuffer() : await img.jpeg({ quality: 76, mozjpeg: true }).toBuffer();
    if (buf.length < size * 0.92) { fs.writeFileSync(f, buf); before += size; after += buf.length; n++; }
  } catch (e) { console.log('Dilewati', f, e.message); }
}
console.log(`Foto dikecilkan: ${n} file, ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
