/* GS-203: transparent offline-readiness diagnostics. This panel does not claim that a model is offline-ready unless it can verify the relevant runtime. */
(() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const style = document.createElement('style');
  style.textContent = `
    .gs-offline-card{margin:12px 0 18px;padding:15px;border:1px solid rgba(115,190,255,.2);border-radius:17px;background:linear-gradient(135deg,rgba(24,43,68,.88),rgba(10,20,35,.92));color:#eef6ff}
    .gs-offline-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .gs-offline-head h3{margin:0;font-size:14px}.gs-offline-card p{margin:8px 0;color:#a9bfd5;font-size:12px;line-height:1.5}
    .gs-offline-card button{border:1px solid #ffffff24;border-radius:11px;padding:9px 12px;background:#203956;color:#fff;font:inherit;font-size:12px}
    .gs-offline-results{display:grid;gap:7px;margin-top:10px}.gs-offline-row{display:flex;justify-content:space-between;gap:12px;font-size:12px;padding:8px 10px;border-radius:9px;background:#ffffff08}
    .gs-offline-state{font-weight:700;text-align:right}.gs-offline-state.ok{color:#8de8b4}.gs-offline-state.warn{color:#ffd27c}.gs-offline-state.bad{color:#ff9eaa}
  `;
  document.head.appendChild(style);
  const anchor = document.getElementById('opencvStatus');
  if (!anchor || document.getElementById('gsOfflineCard')) return;
  const card = document.createElement('section');
  card.id = 'gsOfflineCard';
  card.className = 'gs-offline-card';
  card.innerHTML = '<div class="gs-offline-head"><h3>Privasi & kesiapan offline</h3><button type="button" id="gsOfflineCheck">Periksa perangkat</button></div><p>GlassScan memproses gambar di perangkat. Namun, sebagian mesin AI pihak ketiga dapat memerlukan unduhan saat pemakaian pertama. Pemeriksaan ini melaporkan kondisi yang bisa diverifikasi—bukan jaminan semua fitur siap offline.</p><div class="gs-offline-results" id="gsOfflineResults" aria-live="polite"><div class="gs-offline-row"><span>Status</span><span class="gs-offline-state warn">Belum diperiksa</span></div></div>';
  anchor.insertAdjacentElement('afterend', card);

  function row(label, value, kind) {
    return '<div class="gs-offline-row"><span>'+esc(label)+'</span><span class="gs-offline-state '+kind+'">'+esc(value)+'</span></div>';
  }
  async function check() {
    const out = document.getElementById('gsOfflineResults');
    const btn = document.getElementById('gsOfflineCheck');
    btn.disabled = true; btn.textContent = 'Memeriksa…';
    const rows = [];
    rows.push(row('Koneksi saat ini', navigator.onLine ? 'Online' : 'Offline', navigator.onLine ? 'ok' : 'warn'));
    rows.push(row('Service worker', ('serviceWorker' in navigator && navigator.serviceWorker.controller) ? 'Aktif di halaman ini' : 'Belum mengontrol halaman', ('serviceWorker' in navigator && navigator.serviceWorker.controller) ? 'ok' : 'warn'));
    rows.push(row('OpenCV.js', window.cv && window.cv.Mat ? 'Runtime tersedia' : 'Belum tersedia; deteksi cadangan mungkin dipakai', window.cv && window.cv.Mat ? 'ok' : 'warn'));
    rows.push(row('Tesseract.js', window.Tesseract ? 'Library tersedia' : 'Library belum tersedia', window.Tesseract ? 'ok' : 'warn'));
    rows.push(row('Detektor ML Quadscan', window.Quadscan && typeof window.Quadscan.scan === 'function' ? 'API tersedia pada sesi ini' : 'Belum dimuat pada sesi ini', window.Quadscan && typeof window.Quadscan.scan === 'function' ? 'ok' : 'warn'));
    try {
      const keys = await caches.keys();
      const appCache = keys.filter(k => k.startsWith('glassscan-'));
      rows.push(row('Cache aplikasi', appCache.length ? appCache.join(', ') : 'Belum ditemukan', appCache.length ? 'ok' : 'warn'));
      if (appCache.length) {
        const cache = await caches.open(appCache[appCache.length - 1]);
        const required = ['./index.html','./app.js','./styles.css','./sw.js'];
        const missing = [];
        for (const path of required) if (!await cache.match(path)) missing.push(path);
        rows.push(row('File inti di cache', missing.length ? 'Belum lengkap: '+missing.join(', ') : 'File inti ditemukan', missing.length ? 'warn' : 'ok'));
      }
    } catch (e) {
      rows.push(row('Cache Storage', 'Tidak dapat dibaca pada konteks ini', 'warn'));
    }
    rows.push(row('Model AI siap offline', 'Belum dapat dipastikan otomatis', 'warn'));
    rows.push(row('Privasi gambar', 'Tidak ada unggahan otomatis oleh pemeriksaan ini', 'ok'));
    out.innerHTML = rows.join('');
    btn.disabled = false; btn.textContent = 'Periksa lagi';
  }
  document.getElementById('gsOfflineCheck').addEventListener('click', check);
})();
