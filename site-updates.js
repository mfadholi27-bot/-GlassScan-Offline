/* GlassScan release stamp + changelog. Update this file for every release. */
(() => {
 const RELEASE = {
  version: 'V2.0.9 · GS-209',
  updatedAt: '29 Oktober 2026',
  changes: [
   'GS-209: menambahkan tindakan Siapkan AI offline untuk memuat runtime/model FairScan secara eksplisit dan memeriksa cache model; kesiapan offline tetap perlu diuji setelah mode pesawat.',\n   'GS-209: memasukkan sw.js ke daftar aset inti cache agar pemeriksaan file inti tidak salah melaporkan berkas service worker hilang.',\n   'GS-208: memperbaiki koneksi tombol FairScan ke editor crop melalui API jembatan yang eksplisit; sebelumnya status crop berada di dalam scope privat app.js.',
   'GS-208: menu Image Enhance Scan dipindahkan ke bawah Document Preview dan baru tampil setelah gambar berhasil dimuat.',
   'GS-208: cache service worker diperbarui untuk memuat perbaikan terbaru.',
   'GS-206: menambahkan integrasi browser eksperimental FairScan TFLite untuk segmentasi area kertas dan estimasi empat sudut; model/runtime dimuat saat diperlukan dan dicache setelah berhasil.',
   'GS-206: segmentasi AI tidak menggantikan deteksi klasik/manual; jika runtime, model, atau mask tidak valid, pengguna dapat kembali ke alur crop yang ada.',
   'GS-205: tema Minimalism putih-hitam dengan hierarki visual sederhana dan layout responsif.','GS-205: panel validasi OCR lokal membandingkan foto asli dan hasil perataan menggunakan teks acuan; hasil tidak dikirim ke server.','GS-205: cache service worker diperbarui agar perubahan tema dan panel QA terpasang.','GS-203: menambahkan pemeriksaan kesiapan offline.',
   'GS-201: perataan halaman buku memperkirakan profil lengkungan untuk setiap baris teks lalu menginterpolasikannya secara vertikal sebagai mesh 2D.',
   'GS-201: deteksi baris menghitung awal goresan tinta, bukan hanya jumlah piksel gelap, agar garis tabel panjang lebih kecil kemungkinannya dianggap sebagai teks.',
   'GS-201: pemrosesan dibatasi pada sisi terpanjang 2600 piksel dan tetap menolak koreksi bila profil lengkungan tidak konsisten; wajib diperiksa sebelum ekspor.',
   'GS-200: memperbaiki deteksi baris teks pada formulir bertabel dengan mengabaikan kepadatan piksel rendah dari garis vertikal, agar tabel tidak terbaca sebagai satu blok teks.',
   'GS-200: ambang proyeksi dan pemisahan baris disesuaikan; foto tidak diubah bila baris teks tetap tidak cukup meyakinkan.',
   'GS-199: perataan baris teks menggunakan interpolasi vertikal bilinear untuk mengurangi tepi huruf bergerigi setelah koreksi.',
   'GS-199: pemrosesan tetap lokal; bila deteksi baris teks tidak cukup meyakinkan, gambar tidak diubah dan foto asli dapat dipulihkan.',
   'GS-198: prototipe Ratakan Kertas lokal berbasis analisis geometri baris teks; tidak mengirim foto ke server dan menyediakan pemulihan foto asli.',
   'GS-198: koreksi dibatasi dan hanya diterapkan bila cukup banyak baris teks konsisten; bukan model neural dewarping CamScanner dan perlu uji foto nyata.',
   'GS-197: deteksi sudut OpenCV memakai beberapa tingkat Canny agar lebih tahan terhadap kontras dan latar yang berbeda.',
   'GS-197: pemeringkatan kandidat mempertimbangkan konsistensi sisi berlawanan, kualitas sudut, luas, dan posisi; deteksi tetap heuristik dan perlu uji foto nyata.',
   'GS-196: memperbaiki tombol intensitas + agar tetap aktif hingga 200% (sebelumnya berhenti di 100%).',
   'GS-196: menambahkan indikator perubahan piksel untuk membantu membandingkan setiap efek dengan foto asli.',
   'GS-196: memperkuat perbedaan Magic Color, Magic Color Pro, Color, Teks Tajam, dan Kurangi Bayangan; tetap periksa hasil visual agar tidak overprocessed.',
   'GS-195: Magic Color Pro — koreksi pencahayaan lokal, pemulihan warna yang lembut, kontras dan penajaman konservatif diproses sepenuhnya di perangkat.',
   'GS-195: Magic Color Pro tidak memerlukan model atau koneksi setelah halaman aplikasi tersedia; hasil dapat diatur lewat kontrol intensitas 0–200%.',
   'GS-194: validasi bentuk, luas, sisi, dan keyakinan deteksi sudut AI sebelum titik diterapkan; titik sebelumnya dipertahankan jika deteksi meragukan.',
   'GS-194: mengurangi deteksi palsu pada tumpukan buku, kabel, dan tepi meja; untuk dokumen bertumpuk, pengguna diarahkan mengatur titik manual.',
   'GS-193: handler tombol AI memakai event listener langsung agar tidak mudah tertimpa handler UI lain; tombol direset ketika editor dibuka. GS-192: reset status tombol Deteksi sudut & crop setiap kali editor dibuka; deteksi klasik tetap bisa dijalankan jika AI tidak tersedia. GS-191: memperbaiki tombol Deteksi sudut AI yang dapat terkunci saat pemuatan model tidak selesai; pemuatan dan proses deteksi kini memiliki batas waktu serta tombol dapat dicoba ulang. GS-190: menambahkan deteksi empat sudut berbasis model ML DocAligner melalui quadscan/ONNX Runtime Web. Model diunduh saat fitur AI pertama kali digunakan; service worker mencoba menyimpan aset CDN untuk penggunaan offline berikutnya.',
   'GS-190: tombol Deteksi sudut AI mengganti deteksi otomatis di editor crop. Jika model gagal dimuat atau sudut tidak meyakinkan, GlassScan mempertahankan deteksi klasik dan editor empat titik manual sebagai cadangan.',
   'GS-189: memperkuat pemisahan Adaptive B&W dengan normalisasi pencahayaan lokal dan ambang yang lebih tegas; hasil tetap harus diperiksa pada foto nyata.',
   'GS-189: umpan balik pengambilan foto berupa kilatan visual dan animasi tombol; getaran dicoba pada perangkat/browser yang mendukungnya. iOS Safari biasanya tidak mendukung navigator.vibrate, sehingga kilatan visual menjadi fallback.',
   'GS-189: model AI terlatih untuk empat tugas belum terintegrasi. Tidak ada model CNN/YOLO/U-Net/dewarping yang dibundel pada rilis ini.',
   'GS-188: filter Adaptive B&W memakai ambang lokal berdasarkan pencahayaan setempat untuk membantu teks di area berbayang; pemrosesan klasik deterministik, bukan model AI terlatih.',
   'GS-188: cache offline diperbarui ke GS-188. Model AI terlatih untuk deteksi/pemulihan gambar belum dibundel; gunakan deteksi OpenCV dan koreksi sudut manual untuk foto sulit.',
   'GS-187: menambahkan mode Color dan Book Premium dengan perataan pencahayaan lokal, koreksi warna lembut, dan penajaman konservatif tanpa menambahkan tekstur atau tanda buatan.',
   'GS-187: menambahkan pratinjau perbandingan asli/hasil, ekspor PNG, serta memperjelas pilihan Original, Book Premium, Color, Grayscale, dan Black & White.',
   'GS-187: pemrosesan tetap di perangkat; deteksi sudut OpenCV.js dengan fallback heuristik dan editor empat sudut manual dipertahankan.',
   'GS-186: filter Scan Premium menambahkan koreksi kertas krem-putih, ketajaman, kotak biru bernomor dengan garis diagonal, bayangan tepi halus, dan tanda air GlassScan samar.',
   'GS-186: intensitas Scan Premium dapat diatur terpisah dari filter lain hingga 200%.',
   'GS-185: petunjuk ekspor JPG iPhone diarahkan ke Simpan Gambar agar hasil masuk ke aplikasi Foto, bukan File.',
   'GS-184: ekspor JPG memakai canvas.toBlob langsung agar lebih hemat memori di Safari iPhone.',
   'GS-184: intensitas efek dapat diatur sampai 200%, dengan kekuatan tiap efek tersimpan terpisah.',
   'GS-184: penyimpanan JPG memberi alur Simpan ke File yang lebih jelas pada iPhone.',
   'GS-183: perbaikan pemetaan sentuhan editor crop agar empat titik dapat digeser dengan tepat di layar ponsel.',
   'GS-183: ekspor JPG memakai Blob JPEG tervalidasi dan alur berbagi/Simpan ke File untuk iPhone.',
   'GS-183: kontrol intensitas 0–100% ditambahkan untuk setiap efek dan kekuatan tiap efek disimpan terpisah selama sesi.',
   'Setelah capture, GlassScan mencoba meluruskan perspektif otomatis pada hasil crop bingkai bila kontur buku cukup meyakinkan; jika tidak, mempertahankan crop bingkai agar tidak memotong salah.',
   'Magic Color tetap aktif otomatis untuk pratinjau dan ekspor setelah foto diambil.',
   'Setelah tombol foto ditekan, gambar langsung dipotong mengikuti area bingkai tetap (memperhitungkan object-fit: cover) dan Magic Color dipilih otomatis.',
   'Koreksi perspektif empat sudut tetap tersedia di editor crop untuk meluruskan dokumen yang miring.',
   'Live Scanner memakai bingkai panduan tetap; tidak lagi menggambar sudut tebakan di atas video.',
   'Foto kamera disimpan tanpa koreksi perspektif otomatis yang berisiko salah; pengguna dapat memeriksa dan mengatur sudut di editor crop.',
   'Deteksi live dibatasi agar kamera ponsel lebih ringan dan garis panduan lebih stabil.',
   'Deteksi sudut memilih kontur empat sisi yang lebih menyerupai dokumen dan menolak fallback yang sering salah memilih pola lantai.',
   'Jika deteksi otomatis belum yakin, aplikasi tidak lagi menggambar sudut tebakan; gunakan empat titik manual pada editor crop.',
   'Overlay sudut disesuaikan dengan mode kamera object-fit: cover.',
   'Koreksi pencahayaan diperhalus; mode Enhance/Magic mendapat penajaman ringan.',
   'Urutan titik sudut diperbaiki menggunakan posisi relatif terhadap pusat quadrilateral.',
   'Panel pemeriksaan kualitas foto ditambahkan: indikasi ketajaman, pencahayaan, area gelap, dan sorotan terang.',
   'Cache aplikasi diperbarui untuk memuat aset versi baru. OpenCV.js dicache setelah pemasangan online agar peluncuran berikutnya dapat bekerja offline.'
  ],
  note: 'GS-205 menambahkan panel uji OCR perbandingan, tetapi panel ini belum membuktikan FairScan TFLite model telah terintegrasi. Integrasi model browser dan pengujian nyata iPhone 12 masih harus dilakukan. GS-199 meningkatkan interpolasi piksel, bukan rekonstruksi 3D. Periksa huruf kecil, garis tabel, tanda tangan, dan stempel sebelum ekspor. Deteksi sudut AI memerlukan koneksi internet saat pertama kali memuat library/runtime/model; aset CDN dicache saat berhasil, tetapi mode offline berikutnya tetap harus diuji pada perangkat dan browser yang digunakan. Empat model AI untuk penghilang bayangan, dewarping halaman, dan pemulihan teks belum terintegrasi. Pemotongan awal mengikuti bingkai tetap. Koreksi perspektif otomatis hanya diterapkan saat kontur buku lolos pemeriksaan heuristik; bila ragu, hasil crop bingkai dipertahankan dan pengguna dapat mengatur empat sudut manual. Skor kualitas bersifat indikatif. Cache OpenCV offline memerlukan satu kali pemasangan/pemuatan online yang berhasil. Instalasi pertama tanpa jaringan tetap tidak dijamin; pengujian langsung di iPhone/Android masih diperlukan sebelum rilis final.'
 };
 function addPanel() {
  if (document.getElementById('gsReleaseStamp')) return;
  const anchor = document.querySelector('.build-ribbon') || document.querySelector('.topbar');
  if (!anchor) return;
  const panel = document.createElement('section');
  panel.id = 'gsReleaseStamp';
  panel.setAttribute('aria-label', 'Informasi pembaruan GlassScan');
  panel.style.cssText = 'margin:10px 0 14px;padding:12px 14px;border:1px solid rgba(99,230,255,.24);border-radius:14px;background:linear-gradient(110deg,rgba(19,49,72,.88),rgba(27,27,57,.78));color:#eaf7ff;font-size:12px;line-height:1.55;box-shadow:0 8px 28px #0002';
  const heading = document.createElement('div');
  heading.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;justify-content:space-between';
  const version = document.createElement('strong');
  version.textContent = 'GlassScan ' + RELEASE.version;
  version.style.cssText = 'font-size:13px;color:#8beaff';
  const stamp = document.createElement('span');
  stamp.textContent = 'Pembaruan: ' + RELEASE.updatedAt;
  stamp.style.cssText = 'color:#c1d2e5';
  heading.append(version, stamp);
  const details = document.createElement('details');
  details.style.cssText = 'margin-top:7px';
  const summary = document.createElement('summary');
  summary.textContent = 'Lihat catatan perubahan';
  summary.style.cssText = 'cursor:pointer;color:#a9baff;font-weight:600';
  const list = document.createElement('ul');
  list.style.cssText = 'padding-left:18px;margin:7px 0';
  RELEASE.changes.forEach(change => { const li=document.createElement('li'); li.textContent=change; list.appendChild(li); });
  const note = document.createElement('p');
  note.textContent = RELEASE.note;
  note.style.cssText = 'margin:7px 0 0;color:#ffd991';
  details.append(summary,list,note);
  panel.append(heading,details);
  anchor.insertAdjacentElement('afterend',panel);
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addPanel, {once:true});
 else addPanel();
})();
