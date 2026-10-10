# Aturan penulisan artikel dan landing page (wajib lolos validator)

Cek dengan:
  node scripts-validate.mjs <awalan-slug>           (artikel)
  DIR=src/content/lp node scripts-validate.mjs <awalan-slug>   (landing page)
  node scripts-duplikat.mjs --semua                  (tidak boleh ada MASALAH BERAT)

## Front matter artikel (persis seperti ini; semua draft)
---
title: "..."            # 45-65 karakter, memuat kata kunci utama dari src/data/topik.json
description: "..."      # 120-160 karakter, memuat kata kunci, mengajak klik
date: 2026-10-10
category: "Model Geely"  # Model Geely | Perbandingan | Panduan EV | Tips Membeli | Kredit & Biaya | Mobil Listrik | Perawatan
tags: ["kata kunci utama", ...]   # 8-10 tag huruf kecil; tag PERTAMA = kata kunci utama dari topik.json;
                                  # minimal 1 tag mengandung "geely"; minimal 3 tag dari daftar:
                                  # mobil listrik geely, geely ev, geely indonesia, geely ex5, geely starray em-i,
                                  # ev geely jakarta, mobil listrik murah, mobil listrik kompak, harga mobil listrik geely
draft: true
---
Landing page: sama, tanpa `category`, tambah `model: "geely-ex5"` (boleh kosong), `artikel: ["slug-1","slug-2",...]` (artikel penunjang
dari topik.json yang kluster-nya sama) dan `draft: true`.

## Isi
- Paragraf pertama: 40-60 kata, ringkasan jawaban, memuat kata kunci utama dalam 100 kata pertama, TANPA judul di atasnya.
- Minimal 900 kata, minimal 40 kalimat. Minimal 6 subjudul `## `. Tanpa `# ` (H1). Tanpa gambar Markdown.
- Wajib ada `## Pertanyaan yang sering diajukan` (tiap pertanyaan `### ...` lalu jawaban 1-3 kalimat) dan `## Kesimpulan` (terakhir).
- Minimal 1 tabel Markdown bila ada data/angka.
- Tautan internal (format `[teks](/alamat/)`): minimal 3 ke artikel BERBEDA yang slug-nya ada di src/content/artikel/ (bukan diri sendiri),
  1 ke /model/..., 1 ke /promo/ atau /kontak/, dan WAJIB 1 ke LP pilarnya (`/lp/<pilar>/` dari topik.json, lihat kolom `pilar`).
  LP: tautkan 4-6 artikel penunjang kluster yang sama + LP lain yang relevan + /model/ + /lokasi/ + /kontak/.
- Anchor text harus bervariasi dan deskriptif (bukan "klik di sini").
- Jangan menyalin kalimat dari halaman lain. Setiap halaman punya sudut sendiri sesuai kolom `maksud` dan `judul` di topik.json.
  Boleh merangkum lalu menaut ke halaman lain, jangan mengulang isinya.
- Bahasa Indonesia santai-sopan, mudah dipahami, kalimat pendek. Sapa pembaca dengan "Anda". Sebut "saya (Wins)" secukupnya bila natural.
- Jangan menyebut tanggal/tahun yang akan basi. Jangan menyebut data yang tidak ada di FAKTA-TERVERIFIKASI.md.
- Akhiri dengan ajakan WhatsApp/test drive yang wajar lewat tautan /kontak/.
