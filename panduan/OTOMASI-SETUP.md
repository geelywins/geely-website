# Otomasi website: cara memasang (bahasa mudah)

Ada 2 otomasi baru. Keduanya aman: kalau belum disambungkan, website tetap normal.

| Otomasi | Jalan kapan | Hasil |
|---|---|---|
| Laporan mingguan | Tiap Senin 06:00 WIB | Admin > Laporan: data Google, link rusak, cek SEO, kecepatan, artikel usang |
| Posting artikel baru | Tiap hari 07:00 WIB | Artikel yang baru tayang dikirim ke n8n (max 2 per hari) |

## Langkah 1 - Pasang (wajib, sekali saja)
1. Admin > Upload ZIP > unggah ZIP terbaru, tunggu proses selesai.
2. Di tab yang sama, tekan **Perbarui file proses (semua)**.
3. Admin > Laporan > tekan **Jalankan laporan sekarang**. Tunggu ±10 menit, buka Laporan lagi.

Token GitHub perlu izin: Contents (Read and write), Workflows (Read and write), dan **Actions (Read and write)** supaya tombol "Jalankan sekarang" bisa dipakai.

## Langkah 2 - Sambungkan Search Console (supaya data Google muncul)
1. Buka console.cloud.google.com, buat project baru (nama bebas, misal geelywins-seo).
2. Menu "APIs & Services" > "Library" > cari **Google Search Console API** > Enable.
3. Menu "IAM & Admin" > "Service Accounts" > Create service account (nama: laporan-seo) > Done.
4. Buka service account itu > tab **Keys** > Add key > Create new key > **JSON** > Create. File JSON terunduh.
5. Salin alamat email service account (bentuknya `laporan-seo@namaproject.iam.gserviceaccount.com`).
6. Buka Search Console > Settings > **Users and permissions** > Add user > tempel email tadi > izin **Restricted** > Add.
7. GitHub > repository > Settings > Secrets and variables > Actions > **New repository secret**.
   Name: `GSC_KEY`. Secret: buka file JSON, salin SEMUA isinya, tempel.
8. Admin > Laporan > Jalankan laporan sekarang.

## Langkah 3 - Posting artikel baru ke Telegram (gratis, tanpa n8n)
Setiap ada artikel baru tayang, Anda menerima gambar sampul + caption siap salin + link di Telegram. Tinggal salin dan posting ke FB/IG.
1. Buka Telegram, cari **@BotFather**, kirim `/newbot`. Isi nama bot (misal Wins Geely Bot) lalu username yang berakhiran `bot` (misal winsgeely_bot).
2. BotFather membalas **token** (bentuknya `123456789:AAH...`). Salin.
3. Buka bot Anda yang baru dibuat (klik link dari BotFather), tekan **Start**, kirim satu pesan apa saja (misal "halo").
4. Cari chat ID: buka di browser `https://api.telegram.org/bot<TOKEN>/getUpdates` (ganti `<TOKEN>` dengan token tadi). Cari tulisan `"chat":{"id":` lalu salin angkanya (misal 123456789).
5. GitHub > repository > Settings > Secrets and variables > Actions > New repository secret. Buat dua:
   - Name `TELEGRAM_BOT_TOKEN`, isi: token tadi
   - Name `TELEGRAM_CHAT_ID`, isi: angka chat ID
6. Admin > Laporan > bagian "Posting artikel baru" > Jalankan posting sekarang (kali pertama hanya membuat catatan awal; tidak ada kiriman).

Mau posting otomatis penuh nanti? Isi juga `N8N_WEBHOOK_URL` (n8n/Make.com). Boleh dua-duanya aktif bersamaan. Data yang dikirim ke webhook (JSON): `judul`, `deskripsi`, `kategori`, `tags`, `tanggal`, `url`, `gambar`, `teks`.

Aturan aman posting: artikel lama TIDAK diposting ulang (pertama kali jalan hanya membuat catatan), maksimal 2 per hari, hanya dikirim kalau halamannya sudah bisa dibuka. Tanpa tujuan (Telegram/webhook), artikel baru hanya dicatat dan tidak dikirim. Jangan bagikan token bot ke siapa pun.

## Cara membaca Laporan
- **Hampir halaman 1**: kata kunci di posisi 8-20. Perkuat halamannya (tambah bagian yang menjawab kata itu, tambah link dari artikel lain).
- **Sering muncul tapi jarang diklik**: perbaiki judul dan deskripsi.
- **Dua halaman bersaing**: pilih satu halaman utama, ubah kata kunci halaman lain di Rencana Topik.
- **Link rusak**: perbaiki atau hapus linknya. "Tidak bisa dihubungi" bisa jadi hanya situs yang menolak robot, cek manual.
- **Kecepatan**: hijau 90+ bagus. Skor naik turun sedikit tiap pengujian.
- **Artikel perlu diperbarui**: lebih dari 180 hari belum diubah. Perbarui isi lalu isi tanggal "diperbarui".
