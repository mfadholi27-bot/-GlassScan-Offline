/* GlassScan AI Lab foundation.
   Honest status: local smart enhancement is implemented with classical image processing.
   A trained ML model and offline OCR model are NOT bundled in this patch. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .gs-ai-panel{margin:18px 0;padding:18px;border:1px solid rgba(139,166,255,.22);border-radius:20px;background:linear-gradient(135deg,rgba(33,52,86,.72),rgba(11,20,36,.92));color:#eef4ff}
    .gs-ai-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
    .gs-ai-head h3{margin:0;font-size:1.05rem}.gs-ai-tag{font-size:.68rem;padding:5px 8px;border-radius:999px;background:rgba(132,106,255,.18);color:#cfc5ff}
    .gs-ai-panel p{font-size:.82rem;line-height:1.5;color:#b7c5db;margin:8px 0 14px}
    .gs-ai-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}
    .gs-ai-actions button{border:1px solid rgba(170,190,230,.22);border-radius:12px;padding:11px 9px;background:#182941;color:#f3f7ff;font:inherit;font-size:.82rem}
    .gs-ai-actions button.primary{background:linear-gradient(135deg,#6e5bff,#327bdc);border:0}
    .gs-ai-status{font-size:.78rem;color:#a9c4ff;min-height:1.4em;margin-top:10px}
    @media(max-width:380px){.gs-ai-actions{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function init() {
    const preview = document.getElementById('previewWrap');
    if (!preview || document.getElementById('gsAiPanel')) return;
    const panel = document.createElement('section');
    panel.className = 'gs-ai-panel';
    panel.id = 'gsAiPanel';
    panel.innerHTML = `
      <div class="gs-ai-head"><h3>✦ Smart Image Lab</h3><span class="gs-ai-tag">LOCAL BETA</span></div>
      <p>Perbaikan kontras dan pencahayaan diproses di perangkat. Ini pemrosesan gambar lokal, bukan model AI terlatih. OCR dan model AI offline belum dipasang.</p>
      <div class="gs-ai-actions">
        <button class="primary" id="gsSmartEnhance">✦ Smart Enhance</button>
        <button id="gsResetEnhance">Kembali ke scan asli</button>
        <button id="gsOcrInfo">Teks / OCR</button>
        <button id="gsAiPrivacy">Status offline</button>
      </div>
      <div class="gs-ai-status" id="gsAiStatus" role="status" aria-live="polite">Menunggu dokumen.</div>
    `;
    const section = preview.closest('.preview');
    if (section) section.insertAdjacentElement('afterend', panel);
    else preview.insertAdjacentElement('afterend', panel);

    const status = msg => { const el = document.getElementById('gsAiStatus'); if (el) el.textContent = msg; };
    document.getElementById('gsSmartEnhance').addEventListener('click', () => {
      const canvas = document.getElementById('previewCanvas');
      if (!canvas || !canvas.width || !canvas.height || document.getElementById('emptyState')?.hidden === false) {
        status('Tambahkan foto terlebih dahulu.');
        return;
      }
      try {
        const c = document.createElement('canvas');
        c.width = canvas.width; c.height = canvas.height;
        const x = c.getContext('2d', {willReadFrequently:true});
        x.drawImage(canvas, 0, 0);
        const image = x.getImageData(0,0,c.width,c.height);
        const d = image.data, w = c.width, h = c.height;
        // Estimate broad illumination at reduced resolution to lift dark regions.
        const sw = Math.max(8, Math.min(80, Math.ceil(w/32)));
        const sh = Math.max(8, Math.min(80, Math.ceil(h/32)));
        const small = document.createElement('canvas'); small.width=sw; small.height=sh;
        const sx = small.getContext('2d',{willReadFrequently:true});
        sx.drawImage(c,0,0,sw,sh);
        const sd=sx.getImageData(0,0,sw,sh).data, field=new Float32Array(sw*sh);
        for(let i=0,j=0;i<sd.length;i+=4,j++) field[j]=.299*sd[i]+.587*sd[i+1]+.114*sd[i+2];
        for(let y=0;y<h;y++){
          const sy=Math.min(sh-1,Math.floor(y/h*sh));
          for(let xx=0;xx<w;xx++){
            const i=(y*w+xx)*4, sxx=Math.min(sw-1,Math.floor(xx/w*sw));
            const bg=Math.max(55,field[sy*sw+sxx]);
            const lum=.299*d[i]+.587*d[i+1]+.114*d[i+2];
            // Gentle illumination correction plus restrained contrast.
            const gain=Math.max(.82,Math.min(1.32,205/bg));
            for(let k=0;k<3;k++){
              let v=d[i+k]*gain;
              v=(v-128)*1.10+136;
              d[i+k]=Math.max(0,Math.min(255,v));
            }
          }
        }
        x.putImageData(image,0,0);
        // Replace displayed preview with enhanced pixels only; original page data stays intact.
        const visible=document.getElementById('previewCanvas');
        visible.width=c.width; visible.height=c.height;
        visible.getContext('2d').drawImage(c,0,0);
        status('Smart Enhance selesai secara lokal. Hasil ekspor mengikuti alur ekspor aplikasi yang sudah ada; untuk menyimpan hasil peningkatan, gunakan Simpan JPG setelah memilih filter aplikasi bila perlu.');
      } catch(e) {
        console.error(e); status('Tidak dapat memproses gambar ini. Coba gambar berukuran lebih kecil.');
      }
    });
    document.getElementById('gsResetEnhance').addEventListener('click', () => {
      status('Untuk memulihkan pratinjau sepenuhnya, pilih thumbnail halaman atau impor ulang foto. Data asli halaman tidak diubah.');
      document.querySelector('.filter[data-filter="original"]')?.click();
    });
    document.getElementById('gsOcrInfo').addEventListener('click', () => {
      status('OCR belum tersedia: model bahasa dan mesin OCR offline belum dibundel. Tombol ini tidak mengirim dokumen ke server.');
    });
    document.getElementById('gsAiPrivacy').addEventListener('click', () => {
      status('Pemrosesan Smart Enhance berjalan di browser. Mode offline penuh tetap perlu diuji di iPhone; model AI/OCR belum disertakan.');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
