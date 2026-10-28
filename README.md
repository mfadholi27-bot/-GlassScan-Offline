# GlassScan Offline — iPhone-ready starter

Prototipe PWA scanner dokumen dengan tema Glassmorphism. Kode UI dan pemrosesan gambar di paket ini berjalan di browser; tidak ada API eksternal, analitik, iklan, atau CDN.

## Fitur yang tersedia dalam prototipe
- Mengambil gambar melalui pemilih kamera iPhone (`capture="environment"`) atau mengimpor foto.
- Menyimpan beberapa halaman dalam sesi browser.
- Filter Original, Black & White (ambang Otsu), Grayscale, dan Enhance.
- Menyimpan pratinjau sebagai JPG.
- Membuat PDF multipage secara lokal menggunakan pembuat PDF minimal yang tertanam di `app.js`.
- PWA cache untuk aset aplikasi setelah pertama kali dibuka lewat HTTPS.

## Batasan yang belum diimplementasikan
- Belum ada deteksi sudut otomatis dan crop perspektif.
- Belum ada OCR.
- Filter Enhance adalah peningkatan kontras sederhana, bukan penghilang bayangan tingkat lanjut.
- Data halaman disimpan dalam memori selama sesi; belum ada perpustakaan dokumen permanen/IndexedDB.
- Ini bukan aplikasi iOS native/App Store. Kamera dan service worker tidak bekerja jika `index.html` dibuka langsung dari aplikasi Files (`file://`).
- PWA offline di iPhone harus pertama kali diakses melalui origin HTTPS dan aset berhasil tercache. Pengujian mode pesawat diperlukan.
- Fitur ekspor unduhan di iOS dapat berbeda menurut versi Safari; jika dialog unduhan tidak muncul, gunakan menu Share atau uji di Safari.

## Jalankan dari iPhone
1. Unggah isi folder ini ke repositori GitHub milikmu (bisa lewat Safari/GitHub).
2. Di repo GitHub, buka **Settings → Pages**, pilih branch dan folder root, lalu aktifkan Pages.
3. Tunggu situs HTTPS diterbitkan, kemudian buka URL Pages di Safari.
4. Pilih **Bagikan → Tambahkan ke Layar Utama**.
5. Buka aplikasi sekali saat online, lalu tes memindai dan ekspor.
6. Aktifkan Mode Pesawat dan uji ulang. Jangan simpan dokumen penting sebelum memastikan ekspor dan cache bekerja di perangkatmu.

## Privasi
- Aplikasi tidak mengirim gambar ke server.
- Koneksi pertama ke GitHub Pages diperlukan untuk memuat situs dan cache aset. Setelah cache berhasil, aset statis disediakan oleh service worker.
- Jangan mengunggah dokumen sensitif ke repositori publik. Repositori hanya berisi kode, bukan hasil scan.

## Struktur
- `index.html` — struktur aplikasi
- `styles.css` — desain Glassmorphism responsif
- `app.js` — impor gambar, filter, halaman, dan ekspor PDF lokal
- `manifest.webmanifest` — metadata PWA
- `sw.js` — cache offline
- `icon.svg` — ikon aplikasi

## Lisensi
Starter ini dibuat untuk prototipe dan boleh dimodifikasi. Jika mengambil kode/komponen dari proyek pihak ketiga, tambahkan atribusi dan ikuti lisensi proyek tersebut. Paket ini tidak menyertakan kode pihak ketiga.
