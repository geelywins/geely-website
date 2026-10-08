# Website Geely - Wins Geely

Website sales Geely berbasis Astro (HTML statis, sangat bagus untuk SEO), hosting gratis di GitHub Pages. **Semua isi website diatur lewat halaman admin di browser HP**, tanpa membuka kode.

## Yang bisa diatur dari halaman admin

Buka `https://USERNAME.github.io/geely-website/admin/`

| Menu | Isinya |
|---|---|
| **Artikel** | Daftar **Draft siap ditinjau** (disiapkan Claude) dan **Sudah terbit**. Buka Edit untuk membaca/mengubah, tekan **Terbitkan** untuk tayang. Bisa tulis artikel baru, unggah foto, dan simpan sebagai draft. |
| **Jadwal tayang** | Di daftar draft: **Jadwalkan** (satu artikel) atau **Jadwalkan semua draft** (mulai tanggal X, N artikel per hari). Artikel tayang otomatis sekitar pukul 06:00 WIB pada tanggalnya. Batalkan lewat tombol Batalkan. |
| **Upload ZIP** | Pilih ZIP pembaruan dari Claude, tekan Unggah. Terkirim ke GitHub dan website terbit otomatis (±2-4 menit). Isi yang sudah Anda ubah tidak ditimpa. |
| **Model Mobil** | Nama, foto utama, galeri foto, deskripsi, keunggulan, harga, spesifikasi, tambah/hapus model, atur urutan. |
| **Slider** | Slide besar di paling atas Beranda: judul (kata dalam `{kurung}` berwarna), teks, foto latar, dua tombol, aktif/nonaktif, atur urutan. |
| **Promo** | Judul, isi, periode, foto/banner, kaitkan ke model tertentu, aktif/nonaktif, atur urutan. |
| **Delivery** | Foto serah terima unit (judul, nama pelanggan, model, tanggal). Tampil di Beranda dan menu Delivery. Minta izin pelanggan dulu. |
| **Testimoni** | Nama, isi testimoni, bintang, foto, model. Tampil di Beranda dan menu Testimoni. Pakai testimoni asli saja. |
| **Isi Halaman** | Tulisan di Beranda (poin singkat, keunggulan, FAQ, judul tiap bagian), halaman Model, Promo, Delivery, Testimoni, Artikel, Kontak, **Pop up** (judul, isi, foto, tombol, detik muncul, aktif/nonaktif), dan footer. |
| **Pengaturan** | Nama website, nama panggilan, profesi, nomor WhatsApp, pesan awal WA, email, sosmed (pilih platform, yang tampil hanya logonya), website lain (LapakMu, promogeelyauto.com), lokasi dealer, gambar saat link dibagikan. |

## Tampilan

- Memakai Bootstrap 5, slider buatan sendiri (ringan, mirip efek Revolution Slider), pop up, animasi CSS, dan **mode terang/gelap otomatis** mengikuti pengaturan HP.
- Logo Geely di atas dan ikon tab browser memakai file `public/logo-geely.png`, `favicon.ico`, dll. Untuk mengganti, timpa file tersebut.
- Media sosial tampil sebagai logo saja. Facebook yang linknya kosong diarahkan ke pencarian nama halamannya, isi link aslinya di menu Pengaturan.

Setiap kali menekan Simpan, website diperbarui otomatis dalam ±1-3 menit.

Foto yang diunggah otomatis dikecilkan (maks. lebar 1600 px) supaya website tetap cepat.

## Isi proyek (untuk referensi)

- `src/pages/` : halaman (Beranda, Model, Promo, Artikel, Kontak)
- `src/data/settings.json` : pengaturan umum (diubah lewat admin, menu Pengaturan)
- `src/data/content.json` : tulisan halaman (menu Isi Halaman)
- `src/data/models.json` : model mobil (menu Model Mobil)
- `src/data/promo.json` : promo (menu Promo)
- `src/data/slider.json`, `delivery.json`, `testimoni.json` : menu Slider, Delivery, Testimoni
- `src/scripts/` : skrip slider, pop up, animasi (kecil, tanpa library tambahan)
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

## Video YouTube di artikel

Di form artikel (admin), isi kolom **Link video YouTube**. Video tampil di atas isi artikel (dimuat saat diklik supaya website tetap cepat) dan data videonya ikut dibaca Google.

## Rencana artikel

Lihat `RENCANA-ARTIKEL.md` untuk 30 ide artikel beserta urutan terbit.

## Pakai domain sendiri (geelywins.com)

File `public/CNAME` berisi nama domain. Kalau file itu ada, website otomatis dibangun untuk domain tersebut. Hapus file itu untuk kembali ke alamat github.io. Urutan pasang: atur DNS di registrar, isi Custom domain di GitHub Pages, baru unggah ZIP ini.

## (Catatan lama) Pakai domain sendiri

1. Beli domain, arahkan ke GitHub Pages (Settings, Pages, Custom domain).
2. Di `.github/workflows/deploy.yml` ubah:
   - `SITE_URL: https://domainanda.com`
   - `BASE_PATH: ""`
3. Foto dan tautan otomatis menyesuaikan, tidak perlu diubah satu per satu.

## Catatan keamanan

- Siapa pun bisa membuka halaman `/admin/`, tapi tidak bisa mengubah apa pun tanpa token GitHub Anda. Jaga token, jangan dibagikan.
- Token hanya tersimpan di browser HP Anda. Tekan **Keluar** di admin untuk menghapusnya.
- Harga, promo dan spesifikasi yang tampil sebaiknya selalu dicek ulang agar sesuai informasi resmi dealer.

## Gambar otomatis & standar SEO artikel
- Artikel tanpa gambar sampul otomatis memakai gambar buatan sistem (`/img/artikel/<slug>/sampul.png`).
- Artikel yang isinya belum punya gambar otomatis diberi **gambar sisipan di tengah** (`sisip.png`, berisi poin penting dari heading artikel). Kalau Anda menaruh gambar sendiri di isi artikel, sisipan otomatis tidak ditambahkan.
- Cek standar SEO artikel (kata, kalimat, tag, tautan, FAQ): `node scripts-validate.mjs` (opsional, butuh Node di komputer; di HP cukup lihat hasil di website).

## Indexing otomatis
- Sitemap (`/sitemap-index.xml`) memuat tanggal terakhir diubah tiap artikel, supaya Google tahu mana yang baru.
- Setiap kali website tayang (update admin, ZIP, atau artikel terjadwal), proses `indexnow` mengirim **hanya halaman baru/berubah** ke Bing, Yandex dll lewat IndexNow (`scripts/indexnow.mjs`, kunci di `public/<kunci>.txt`). Hanya aktif kalau ada `public/CNAME`.
- Google tidak menerima IndexNow; Google membaca sitemap sendiri (Search Console). Setelah menerbitkan artikel penting, boleh minta pengindeksan manual (URL inspection → Request indexing).
- Wajib: tekan "Perbarui file proses (deploy.yml)" di Admin setelah mengunggah ZIP ini.

## Salin link artikel untuk Google Search Console
Admin → Artikel → bagian "Sudah terbit": tombol **Salin link** (per artikel) dan **Salin semua link terbit**. Link otomatis memakai domain dari `public/CNAME`.

## Foto profil di bawah slider
Beranda menampilkan kartu kecil berisi foto, nama, jabatan, dan tombol Chat WhatsApp. Foto diganti lewat Admin, menu Pengaturan, kolom "Foto profil Anda". Kalau foto kosong, tampil huruf awal nama.

## Ukuran foto slider
- Laptop & tablet (kolom "Foto slide"): 1920x1080, landscape, mobil di sisi kanan.
- HP (kolom "Foto slide khusus HP", opsional): 900x1200, portrait, mobil di sepertiga atas. Kalau kosong, foto laptop dipotong otomatis.
- Tinggi slider menyesuaikan layar: HP rasio 3:4, tablet sekitar 520-640 px, laptop sekitar 520-720 px.

## Posisi tulisan slider & HP lipat
Tiap slide punya pilihan "Posisi tulisan" (kiri/kanan) di Admin, untuk laptop, tablet, dan HP lipat. Pilih "kanan" kalau foto Anda ada di sisi kiri gambar. Di HP biasa, tulisan selalu di bawah.
