# Website Geely - Wins Geely

Website sales Geely berbasis Astro (HTML statis, sangat bagus untuk SEO), hosting gratis di GitHub Pages. **Semua isi website diatur lewat halaman admin di browser HP**, tanpa membuka kode.

## Yang bisa diatur dari halaman admin

Buka `https://USERNAME.github.io/geely-website/admin/`

| Menu | Isinya |
|---|---|
| **Artikel** | Tulis, edit, hapus artikel. Bisa unggah foto utama dan foto di dalam tulisan. Bisa simpan sebagai draft. |
| **Model Mobil** | Nama, foto utama, galeri foto, deskripsi, keunggulan, harga, spesifikasi, tambah/hapus model, atur urutan. |
| **Promo** | Judul, isi, periode, foto/banner, kaitkan ke model tertentu, aktif/nonaktif, atur urutan. |
| **Isi Halaman** | Semua tulisan di Beranda (judul, tombol, keunggulan, FAQ), halaman Model, Promo, Artikel, Kontak, dan footer. |
| **Pengaturan** | Nama website, nama panggilan, profesi, nomor WhatsApp, pesan awal WA, email, sosmed, website lain (LapakMu, promogeelyauto.com), lokasi dealer, gambar saat link dibagikan. |

Setiap kali menekan Simpan, website diperbarui otomatis dalam ±1-3 menit.

Foto yang diunggah otomatis dikecilkan (maks. lebar 1600 px) supaya website tetap cepat.

## Isi proyek (untuk referensi)

- `src/pages/` : halaman (Beranda, Model, Promo, Artikel, Kontak)
- `src/data/settings.json` : pengaturan umum (diubah lewat admin, menu Pengaturan)
- `src/data/content.json` : tulisan halaman (menu Isi Halaman)
- `src/data/models.json` : model mobil (menu Model Mobil)
- `src/data/promo.json` : promo (menu Promo)
- `src/content/artikel/` : file artikel `.md` (menu Artikel)
- `public/images/` : foto yang diunggah lewat admin
- `public/admin/index.html` : halaman admin
- `.github/workflows/deploy.yml` : otomatis build & publish ke GitHub Pages

## Langkah pasang (semua bisa dari HP Android)

### Langkah 1 - Buat repository GitHub
1. Buka github.com di browser HP, login.
2. Tekan **+** lalu **New repository**.
3. Nama repository: `geely-website`, pilih **Public**, tekan **Create**.

### Langkah 2 - Unggah file proyek
1. Ekstrak `geely-website.zip` di HP.
2. Di repository, pilih **Add file** lalu **Upload files**.
3. Unggah semua isi folder (pastikan folder `.github` ikut terunggah; folder tersembunyi kadang tidak terpilih, kalau perlu unggah file `deploy.yml` lewat **Add file → Create new file** dengan nama `.github/workflows/deploy.yml`).
4. Tekan **Commit changes**.

### Langkah 3 - Aktifkan GitHub Pages
1. Di repository: **Settings** lalu **Pages**.
2. Pada **Source** pilih **GitHub Actions**.
3. Buka tab **Actions**, tunggu proses selesai (centang hijau, ±2 menit).
4. Website tayang di: `https://USERNAME.github.io/geely-website/`

### Langkah 4 - Buat token untuk halaman admin
1. GitHub: foto profil lalu **Settings** lalu **Developer settings** lalu **Personal access tokens** lalu **Fine-grained tokens** lalu **Generate new token**.
2. Repository access: **Only select repositories** lalu pilih `geely-website`.
3. Permissions: **Contents** = **Read and write**.
4. Generate, lalu salin tokennya (hanya muncul sekali).

### Langkah 5 - Masuk admin dan mulai mengisi
1. Buka `https://USERNAME.github.io/geely-website/admin/`
2. Isi username, nama repo, token, tekan **Simpan & Masuk**.
3. Urutan isi yang disarankan:
   1. **Pengaturan**: cek nomor WhatsApp, link sosmed (isi link Facebook "Geely wins" yang masih kosong), website lain.
   2. **Model Mobil**: unggah foto, isi harga dan spesifikasi resmi.
   3. **Promo**: isi promo yang sedang berlaku.
   4. **Artikel**: mulai menulis artikel rutin.

Catatan: setelah website pertama kali tayang, tunggu 1-3 menit setiap kali selesai menyimpan.

## Supaya cepat terindex Google

1. Daftar ke **Google Search Console** (search.google.com/search-console), pilih **URL prefix**, masukkan alamat website.
2. Buka menu **Sitemaps**, kirim: `sitemap-index.xml`
3. Untuk tiap artikel baru: **URL Inspection**, tempel alamat artikel, tekan **Request Indexing**.
4. Tulis artikel rutin (minimal 1-2 per minggu) dengan judul yang menjawab pertanyaan calon pembeli, contoh: "Harga cicilan Geely EX5", "Perbandingan EX2 dan EX5".
5. Pasang link website ini di bio Instagram, TikTok, YouTube, Threads dan Facebook, serta di website LapakMu dan promogeelyauto.com. Link balik (backlink) membantu Google menemukan dan mempercayai website baru.
6. Isi **Deskripsi untuk Google** di setiap artikel, model dan halaman dengan kalimat yang jelas (maks. 160 karakter).

## Pakai domain sendiri (nanti)

1. Beli domain, arahkan ke GitHub Pages (Settings, Pages, Custom domain).
2. Di `.github/workflows/deploy.yml` ubah:
   - `SITE_URL: https://domainanda.com`
   - `BASE_PATH: ""`
3. Foto dan tautan otomatis menyesuaikan, tidak perlu diubah satu per satu.

## Catatan keamanan

- Siapa pun bisa membuka halaman `/admin/`, tapi tidak bisa mengubah apa pun tanpa token GitHub Anda. Jaga token, jangan dibagikan.
- Token hanya tersimpan di browser HP Anda. Tekan **Keluar** di admin untuk menghapusnya.
- Harga, promo dan spesifikasi yang tampil sebaiknya selalu dicek ulang agar sesuai informasi resmi dealer.
