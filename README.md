# GlassScan Offline v0.3 — iPhone PWA beta

## Fitur dalam versi ini
- Kamera live pada HTTPS dengan perkiraan kontur empat sudut yang digambar langsung.
- Deteksi sudut heuristik dari tepi gambar; saat memotret, mencoba crop otomatis dan koreksi perspektif.
- Tombol **Deteksi sudut & crop** untuk gambar impor/foto yang sudah ada.
- Filter Original/warna, Hitam Putih (Otsu), Grayscale, Enhance, dan Kurangi Bayangan (normalisasi lokal perkiraan).
- Ekspor JPG dan PDF multi-halaman yang dibuat di perangkat.
- PWA dengan cache service worker; tidak menggunakan API, analytics, atau CDN runtime.

## Batasan penting
Ini adalah **beta/prototipe**, bukan pengganti scanner komersial. Deteksi sudut menggunakan heuristik ekstrem tepi, bukan model ML/OpenCV robust; latar ramai, dokumen berlipat, bayangan kuat, atau tepi terpotong bisa menghasilkan sudut salah. Selalu periksa hasil. Penghilangan bayangan merupakan normalisasi sederhana, bukan pemulihan sempurna. OCR belum tersedia. File diproses di browser, tetapi setelah mengunggah ke GitHub Pages, kode sumber menjadi publik jika repositorinya publik.

## Menjalankan di iPhone
1. Unggah isi folder ini ke repositori GitHub.
2. Aktifkan **Settings → Pages** (HTTPS).
3. Buka URL GitHub Pages di Safari dan izinkan kamera.
4. Untuk mode offline, buka sekali ketika online agar aset dicache; lalu uji mode pesawat.
5. Untuk menyimpan aplikasi: Safari → Bagikan → Tambahkan ke Layar Utama.

## Privasi
Tidak ada pengiriman gambar ke server dari aplikasi. Gambar tetap di memori/browser dan diekspor hanya saat pengguna menekan tombol ekspor.


## Pembaruan v0.4 — editor crop manual
- Tombol “Deteksi sudut & crop” sekarang membuka editor empat titik. Pengguna dapat menggeser setiap titik dengan sentuhan, mencoba perkiraan otomatis, mereset, lalu menerapkan crop/perspective warp.
- Deteksi otomatis masih heuristik dan bisa salah memilih tepi; periksa posisi titik sebelum menerapkan. Editor manual adalah jalur koreksi bila deteksi otomatis gagal.
- Ekspor JPG tetap tersedia per halaman; PDF menggabungkan halaman. Pada iOS, Safari mungkin menampilkan pratinjau/unduhan dan pengguna dapat memilih Bagikan → Simpan ke File.
