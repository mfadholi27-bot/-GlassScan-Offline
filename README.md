# GlassScan Offline v0.5 — visible update build GS-050

## Cara memastikan versi baru benar-benar terpasang
- Setelah deploy, halaman utama menampilkan lencana **VERSI BARU · V0.5**. Footer menampilkan **BUILD GS-050 · 28 OKT 2026**.
- Service worker menggunakan cache baru `glassscan-offline-v05`, agar aset versi lama diganti saat aktivasi.
- Jika masih melihat versi lama di iPhone: buka situs GitHub Pages di Safari, muat ulang; bila perlu buka Pengaturan iPhone → Safari → Lanjutan → Data Situs Web, cari domain GitHub Pages milikmu dan hapus data situs itu, lalu buka kembali. Menghapus data situs dapat menghapus data lokal situs.

## Fitur yang tersedia
- Kamera live pada HTTPS dan indikator kontur berbasis heuristik.
- Impor foto, editor empat titik manual, perkiraan deteksi sudut, dan koreksi perspektif.
- Filter Original, Magic Color, Hitam Putih, Grayscale, Teks Tajam, dan Kurangi Bayangan.
- Ekspor JPG halaman aktif, JPG per halaman, dan PDF multi-halaman secara lokal.

## Rekomendasi untuk hasil setara scanner profesional
1. Ganti deteksi sudut heuristik dengan OpenCV.js yang disimpan lokal di proyek (bukan CDN): grayscale → blur → Canny → kontur → approxPolyDP → pilih quadrilateral terbesar yang cembung.
2. Jalankan deteksi beberapa skala dan validasi rasio, luas, urutan sudut, dan confidence. Jangan auto-crop jika confidence rendah; minta koreksi manual.
3. Gunakan transformasi perspektif OpenCV (`getPerspectiveTransform` + `warpPerspective`) dan resampling berkualitas.
4. Buat pemrosesan adaptif: white balance, illumination/background normalization untuk bayangan, adaptive threshold untuk teks, serta kontrol intensitas; jangan pakai satu filter untuk semua foto.
5. Pertahankan gambar asli dan simpan hasil crop sebagai salinan agar pengguna bisa kembali mengedit sudut.
6. Uji kumpulan foto nyata: kertas putih di meja gelap/terang, sudut miring, bayangan, kertas kusut, formulir kecil, dan beberapa halaman. Ukur keberhasilan crop, bukan hanya tampilan UI.

## Batasan jujur
V0.5 ini terutama membuat pembaruan terlihat jelas dan memperbaiki invalidasi cache. Algoritma deteksi masih heuristik; hasil belum dijamin setara CamScanner dan perlu diuji di perangkat. Filter bayangan masih pendekatan dasar. OCR tidak disertakan. Tidak ada API/CDN yang dipanggil saat runtime.

## Deploy
Unggah semua file di dalam folder proyek ini ke root repositori GitHub Pages (timpa file lama), commit, tunggu deploy selesai, lalu buka kembali situs. Pastikan `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, dan `icon.svg` berada di tingkat yang sama.
