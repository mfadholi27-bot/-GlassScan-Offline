/* GlassScan release stamp + changelog. Update this file for every release. */
(() => {
 const RELEASE = {
  version: 'V1.9.1 · GS-191',
  updatedAt: '28 Oktober 2026, 23:35 WIB',
  changes: [
   'GS-191: memperbaiki tombol Deteksi sudut AI yang dapat terkunci saat pemuatan model tidak selesai; pemuatan dan proses deteksi kini memiliki batas waktu serta tombol dapat dicoba ulang. GS-190: menambahkan deteksi empat sudut berbasis model ML DocAligner melalui quadscan/ONNX Runtime Web. Model diunduh saat fitur AI pertama kali digunakan; service worker mencoba menyimpan aset CDN untuk penggunaan offline berikutnya.',
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
  note: 'Deteksi sudut AI memerlukan koneksi internet saat pertama kali memuat library/runtime/model; aset CDN dicache saat berhasil, tetapi mode offline berikutnya tetap harus diuji pada perangkat dan browser yang digunakan. Empat model AI untuk penghilang bayangan, dewarping halaman, dan pemulihan teks belum terintegrasi. Pemotongan awal mengikuti bingkai tetap. Koreksi perspektif otomatis hanya diterapkan saat kontur buku lolos pemeriksaan heuristik; bila ragu, hasil crop bingkai dipertahankan dan pengguna dapat mengatur empat sudut manual. Skor kualitas bersifat indikatif. Cache OpenCV offline memerlukan satu kali pemasangan/pemuatan online yang berhasil. Instalasi pertama tanpa jaringan tetap tidak dijamin; pengujian langsung di iPhone/Android masih diperlukan sebelum rilis final.'
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
