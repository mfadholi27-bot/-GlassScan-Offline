GLASSSCAN V1.5 — PAKET SIAP UNGGAH (TANPA EDIT KODE MANUAL)

Paket ini dibuat dari struktur file GlassScan yang sudah ada. Di dalam ZIP:
- index.html (versi dengan pemanggilan site-updates.js)
- local-ai.js
- site-updates.js (riwayat perubahan + diagnosis panel)
- sw.js (cache versi baru agar script baru ikut tersimpan)
- README-PASANG.txt

CARA PASANG TANPA MENYALIN KODE:
1. Ekstrak ZIP ke satu folder.
2. Buka repo https://github.com/mfadholi27-bot/-GlassScan-Offline
3. Tekan Add file > Upload files.
4. Dari folder hasil ekstrak, pilih keempat file: index.html, local-ai.js, site-updates.js, sw.js.
5. Seret ke halaman Upload files. Jika diminta konfirmasi penggantian index.html/sw.js, setujui.
6. Tekan Commit changes.
7. Tunggu GitHub Pages memperbarui situs, lalu buka situs dan refresh penuh.

JANGAN upload folder ZIP itu sendiri ke repo berharap GitHub otomatis mengekstraknya; GitHub tidak mengekstrak ZIP secara otomatis.

STATUS:
- Paket menambahkan riwayat perubahan dan diagnosis panel.
- OCR belum aktif sampai runtime Tesseract, core WASM, dan model bahasa Indonesia tersedia di folder lokal yang benar.
- Deteksi dokumen ONNX dan model restorasi gambar terlatih belum disertakan.
- Timestamp rilis yang ditampilkan harus disesuaikan dengan waktu commit yang sebenarnya. Jangan menganggap teks waktu dalam paket sebagai waktu deploy yang diverifikasi.
