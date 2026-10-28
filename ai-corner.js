/* GlassScan GS-190: optional on-device ML corner detection via quadscan/DocAligner.
   First use downloads the library, ONNX runtime and ~4.5 MB model; the service worker
   caches successful cross-origin assets for later offline use. Existing OpenCV/heuristic
   detection remains the fallback. No document image is uploaded by this feature. */
(() => {
  let loadPromise = null;
  function setButtonBusy(busy, label) {
    const button = document.getElementById('cropAuto');
    if (!button) return;
    button.disabled = busy;
    button.textContent = label || (busy ? 'Memuat AI…' : '✦ Deteksi sudut AI');
  }
  function loadQuadscan() {
    if (window.Quadscan && typeof window.Quadscan.scan === 'function') return Promise.resolve(window.Quadscan);
    if (loadPromise) return loadPromise;
    loadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-glassscan-quadscan]');
      const script = existing || document.createElement('script');
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('Pemuatan AI melewati 20 detik. Periksa koneksi lalu tekan tombol lagi.'));
      }, 20000);
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (window.Quadscan && typeof window.Quadscan.scan === 'function') resolve(window.Quadscan);
        else reject(new Error('Library AI termuat, tetapi API deteksi tidak tersedia.'));
      };
      const fail = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(new Error('Library AI gagal dimuat. Periksa koneksi internet lalu coba lagi.'));
      };
      script.addEventListener('load', finish, {once:true});
      script.addEventListener('error', fail, {once:true});
      if (!existing) {
        script.src = 'https://cdn.jsdelivr.net/npm/quadscan@1.0.0/dist/quadscan.iife.js';
        script.async = true;
        script.dataset.glassscanQuadscan = '1';
        document.head.appendChild(script);
      } else if (window.Quadscan) finish();
    }).catch(error => { loadPromise = null; throw error; });
    return loadPromise;
  }
  function pointList(corners) {
    if (!corners) return null;
    const keys = ['topLeft','topRight','bottomRight','bottomLeft'];
    const points = keys.map(key => {
      const p = corners[key];
      return p && Number.isFinite(p.x) && Number.isFinite(p.y) ? [p.x,p.y] : null;
    });
    return points.every(Boolean) ? points : null;
  }
  function install() {
    const button = document.getElementById('cropAuto');
    if (!button || button.dataset.gsAiBound) return;
    button.dataset.gsAiBound = '1';
    button.disabled = false;
    button.textContent = '✦ Deteksi sudut AI';
    button.title = 'Gunakan model AI lokal setelah model berhasil dimuat; jika gagal, gunakan deteksi klasik.';
    button.onclick = async () => {
      if (!window.cropImage) {
        // cropImage is a top-level lexical binding in app.js, not necessarily a window property.
      }
      if (typeof cropImage === 'undefined' || !cropImage) {
        if (typeof toast === 'function') toast('Buka editor crop terlebih dahulu.');
        return;
      }
      setButtonBusy(true, 'Menyiapkan model AI…');
      try {
        const api = await loadQuadscan();
        const result = await Promise.race([
          api.scan(cropImage, {
          mode: 'detect',
          minDetectionConfidence: 0.12,
          onProgress: event => {
            if (event.phase === 'model-download') {
              const pct = event.total ? Math.min(99, Math.round(event.loaded/event.total*100)) : 0;
              setButtonBusy(true, 'Unduh model AI '+pct+'%…');
            } else if (event.phase === 'model-compile') setButtonBusy(true, 'Menyiapkan model…');
            else setButtonBusy(true, 'AI mendeteksi sudut…');
          }
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Proses deteksi AI terlalu lama. Coba lagi atau gunakan empat titik manual.')), 30000))
        ]);
        const points = result && result.success ? pointList(result.corners) : null;
        if (!points || !validQuad(points, cropImage)) {
          if (typeof toast === 'function') toast('AI belum yakin menemukan empat sudut. Mencoba deteksi klasik…');
          const fallback = detectQuad(cropImage);
          if (fallback && validQuad(fallback, cropImage)) {
            cropQuad = fallback; drawCropEditor();
            if (typeof toast === 'function') toast('Deteksi klasik menemukan perkiraan sudut. Periksa sebelum diterapkan.');
          } else if (typeof toast === 'function') toast('Sudut tidak ditemukan. Geser empat titik secara manual.');
          return;
        }
        cropQuad = points;
        drawCropEditor();
        const confidence = Number.isFinite(result.confidence) ? Math.round(result.confidence*100) : null;
        if (typeof toast === 'function') toast('AI menemukan empat sudut'+(confidence!==null?' · keyakinan '+confidence+'%':'')+'. Periksa titik sebelum menerapkan crop.');
      } catch (error) {
        console.warn('[GlassScan AI corner detection]', error);
        if (typeof toast === 'function') toast('AI belum tersedia: '+(error && error.message ? error.message : 'gagal memuat model')+'. Menggunakan deteksi klasik…');
        try {
          const fallback = detectQuad(cropImage);
          if (fallback && validQuad(fallback, cropImage)) {
            cropQuad = fallback; drawCropEditor();
            if (typeof toast === 'function') toast('Deteksi klasik siap. Model AI memerlukan koneksi pertama yang berhasil.');
          }
        } catch (_) {}
      } finally {
        setButtonBusy(false, '✦ Deteksi sudut AI');
      }
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
