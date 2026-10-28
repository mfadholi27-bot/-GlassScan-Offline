/* GlassScan release stamp + changelog. Update this file for every release. */
(() => {
 const RELEASE = {
  version: 'V1.7.2 · GS-172',
  updatedAt: '28 Oktober 2026, 19:32 WIB',
  changes: [
   'Deteksi live dibatasi agar kamera ponsel lebih ringan dan garis panduan lebih stabil.',
   'Overlay sudut disesuaikan dengan mode kamera object-fit: cover.',
   'Koreksi pencahayaan diperhalus; mode Enhance/Magic mendapat penajaman ringan.',
   'Urutan titik sudut diperbaiki menggunakan posisi relatif terhadap pusat quadrilateral.',
   'Panel pemeriksaan kualitas foto ditambahkan: indikasi ketajaman, pencahayaan, area gelap, dan sorotan terang.',
   'Cache aplikasi diperbarui untuk memuat aset versi baru. OpenCV.js dicache setelah pemasangan online agar peluncuran berikutnya dapat bekerja offline.'
  ],
  note: 'Skor kualitas bersifat indikatif. Cache OpenCV offline memerlukan satu kali pemasangan/pemuatan online yang berhasil. Instalasi pertama tanpa jaringan tetap tidak dijamin; pengujian langsung di iPhone/Android masih diperlukan sebelum rilis final.'
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
