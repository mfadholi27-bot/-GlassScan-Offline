# GlassScan — Integrasi ChatGPT Lokal

Status: perencanaan implementasi; autentikasi belum aktif.

## Tujuan
Menambahkan AI opsional ke GlassScan tanpa menyimpan kata sandi, cookie, access token, atau refresh token ChatGPT di GitHub, kode publik, atau localStorage/sessionStorage browser.

## Arsitektur yang dipilih
1. **GlassScan PWA (GitHub Pages)** tetap menjadi aplikasi pemindaian lintas perangkat. OCR dan filter lokal yang sudah ada tetap berjalan.
2. **Host lokal** akan menangani alur Sign in with ChatGPT untuk penggunaan paket ChatGPT pada aplikasi open-source.
3. PWA tidak boleh berpura-pura sudah terhubung ke ChatGPT sebelum host lokal tersedia, autentikasi tervalidasi, dan permintaan AI berhasil.
4. Kredensial hanya disimpan oleh runtime lokal di penyimpanan lokal yang dilindungi; jangan pernah memasukkan kredensial ke repository.
5. Permintaan AI hanya dikirim setelah tindakan pengguna dan izin yang sesuai. Berikan status jelas untuk belum terhubung, izin tidak diberikan, batas penggunaan, offline, dan berhasil.

## Batasan dan keputusan kompatibilitas
- GitHub Pages adalah hosting statis dan tidak menyediakan proses callback OAuth loopback di perangkat pengguna.
- Alur open-source Sign in with ChatGPT menggunakan callback lokal pada 127.0.0.1, validasi state/nonce/PKCE, pertukaran kode, pemeriksaan ID token dan scope, serta penyimpanan kredensial lokal.
- Dokumentasi OpenAI menyebut penggunaan paket ChatGPT untuk aplikasi open-source bagi pengguna yang memenuhi syarat, termasuk Plus dan Pro. Jangan menjanjikan bahwa paket Go memenuhi syarat untuk integrasi ini sebelum diverifikasi.
- Dukungan lintas platform untuk host lokal tidak boleh diklaim sampai implementasi dan pengujian perangkat nyata selesai.
- Jangan meminta password ChatGPT atau cookie sesi. Jangan menanam API key di frontend. API usage, bila dipilih sebagai alternatif, merupakan jalur terpisah dan dapat dikenai biaya API.

## Tahapan implementasi
1. Pertahankan PWA dan OCR yang sudah ada.
2. Tambahkan host lokal terpisah untuk Windows, tanpa mengubah alur scan yang berfungsi.
3. Implementasikan Sign in with ChatGPT sesuai dokumentasi resmi, termasuk state, nonce, PKCE, validasi token, pemeriksaan scope, refresh token, dan penanganan error.
4. Tambahkan bridge terbatas dari UI GlassScan ke host lokal; hanya izinkan origin/aksi yang ditentukan dan jangan mengekspos token ke JavaScript halaman.
5. Uji login ditolak, izin penggunaan paket tidak diberikan, token kedaluwarsa, offline, batas penggunaan, dan permintaan AI yang sukses.
6. Evaluasi opsi iPhone/Android secara terpisah sebelum menyatakan fitur tersedia di perangkat tersebut.

## Referensi resmi
- https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt
- https://developers.openai.com/siwc/token-sharing-open-source
- https://developers.openai.com/siwc/token-sharing-open-source/sign-in
- https://openai.com/policies/sign-in-with-chatgpt-terms/

## Kriteria sebelum fitur disebut aktif
- Login memakai alur resmi dan pengguna menyetujui izin.
- Token divalidasi dan disimpan hanya oleh host lokal.
- Permintaan AI berhasil menggunakan scope yang diberikan.
- Tidak ada token atau rahasia di repository, URL, log, atau storage browser.
- Status UI berasal dari hasil autentikasi/permintaan nyata, bukan simulasi.
