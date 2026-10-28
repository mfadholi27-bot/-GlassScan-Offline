/* GlassScan GS-194: validated on-device ML corner detection via quadscan/DocAligner.
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
    const points = keys.map(key => {const p=corners[key];return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)?[p.x,p.y]:null;});
    return points.every(Boolean) ? points : null;
  }
  function validateDetectedQuad(points, image) {
    if (!points || points.length!==4 || !image || !image.naturalWidth || !image.naturalHeight) return {ok:false,reason:'Titik tidak lengkap'};
    const w=image.naturalWidth,h=image.naturalHeight,area=Math.abs(points.reduce((s,p,i)=>s+p[0]*points[(i+1)%4][1]-p[1]*points[(i+1)%4][0],0)/2),ratio=area/(w*h);
    if(points.some(p=>!Number.isFinite(p[0])||!Number.isFinite(p[1])||p[0]<0||p[1]<0||p[0]>=w||p[1]>=h))return {ok:false,reason:'Titik di luar foto'};
    if(ratio<.10||ratio>.94)return {ok:false,reason:'Luas dokumen tidak masuk akal'};
    const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);
    const turns=points.map((p,i)=>cross(p,points[(i+1)%4],points[(i+2)%4]));
    if(turns.some(v=>Math.abs(v)<w*h*.00002)||!(turns.every(v=>v>0)||turns.every(v=>v<0)))return {ok:false,reason:'Bentuk empat sudut tidak valid'};
    const lengths=points.map((p,i)=>Math.hypot(p[0]-points[(i+1)%4][0],p[1]-points[(i+1)%4][1]));
    if(lengths.some(v=>v<Math.min(w,h)*.08))return {ok:false,reason:'Sisi dokumen terlalu pendek'};
    return {ok:true,areaRatio:ratio};
  }
  function install() {
    const button = document.getElementById('cropAuto');
    if (!button || button.dataset.gsAiBound) return;
    button.dataset.gsAiBound = '1';
    button.disabled = false;
    button.textContent = '✦ Deteksi sudut AI';
    button.title = 'Gunakan model AI lokal; jika gagal, gunakan deteksi klasik.';
    // Install a native click listener rather than assigning onclick, so other UI scripts
    // cannot silently replace the AI handler. Reset disabled state when crop dialog opens.
    const cropDialog = document.getElementById('cropDialog');
    if (cropDialog && 'MutationObserver' in window) {
      new MutationObserver(() => {
        if (cropDialog.open) {
          button.disabled = false;
          if (!button.textContent.includes('AI') && !button.textContent.includes('Unduh')) button.textContent = '✦ Deteksi sudut AI';
        }
      }).observe(cropDialog, {attributes:true, attributeFilter:['open']});
    }
    button.addEventListener('click', async () => {
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
          minDetectionConfidence: 0.32,
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
        const geometry = validateDetectedQuad(points, cropImage);
        const confidence = Number.isFinite(result && result.confidence) ? result.confidence : null;
        if (!points || !validQuad(points, cropImage) || !geometry.ok || (confidence!==null && confidence<.35)) {
          const why=!points?'AI tidak menemukan empat titik':!geometry.ok?geometry.reason:confidence!==null&&confidence<.35?'keyakinan model terlalu rendah':'koordinat tidak valid';
          if (typeof toast === 'function') toast('Deteksi belum cukup meyakinkan ('+why+'). Titik lama dipertahankan; atur sudut manual atau foto satu dokumen tanpa tumpukan.');
          return;
        }
        cropQuad = points;
        drawCropEditor();
        if (typeof toast === 'function') toast('AI menemukan perkiraan empat sudut'+(confidence!==null?' · keyakinan '+Math.round(confidence*100)+'%':'')+'. Periksa semua titik sebelum menerapkan crop.');
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
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
