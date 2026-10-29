/* GS-205: local QA harness for OCR/dewarp evaluation. Does not upload images. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .gs-qa{margin:20px 0;padding:20px;border:1px solid var(--line,#ddd);border-radius:20px;background:var(--panel,#fff);color:var(--text,#202020)}
    .gs-qa h3{margin:0 0 6px;font-size:17px;letter-spacing:-.03em}.gs-qa p{font-size:13px;line-height:1.55;color:var(--muted,#666)}
    .gs-qa label{display:block;font-size:12px;font-weight:650;margin:12px 0 6px}
    .gs-qa input[type=file],.gs-qa textarea{width:100%;font:inherit;font-size:13px;padding:10px;border:1px solid var(--line,#ddd);border-radius:10px;background:var(--input,#fff);color:inherit}
    .gs-qa textarea{min-height:88px;resize:vertical}.gs-qa button{border:1px solid var(--line,#ddd);border-radius:999px;padding:11px 16px;background:var(--text,#202020);color:var(--button-text,#fff);font-weight:650}
    .gs-qa button:disabled{opacity:.5}.gs-qa .gs-qa-result{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.6 ui-monospace,monospace;background:var(--soft,#f5f5f5);border-radius:12px;padding:12px;margin-top:12px;min-height:44px}
    .gs-qa .gs-qa-row{display:grid;grid-template-columns:1fr;gap:10px}.gs-qa .gs-qa-chip{display:inline-block;border:1px solid var(--line,#ddd);border-radius:999px;padding:5px 9px;font-size:11px;margin:5px 4px 0 0}
    @media(min-width:560px){.gs-qa .gs-qa-row{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);
  const anchor = document.querySelector('.export') || document.querySelector('footer');
  if (!anchor || document.getElementById('gsFairScanQA')) return;
  const panel = document.createElement('section');
  panel.id = 'gsFairScanQA'; panel.className = 'gs-qa';
  panel.innerHTML = `
    <div><small>GS-205 · QUALITY LAB</small><h3>Validasi hasil scan</h3>
    <p>Uji OCR di perangkat dan bandingkan foto sebelum/sesudah perataan halaman. Gambar tidak diunggah. Untuk uji offline yang sah, muat halaman sekali saat online, lalu aktifkan mode pesawat dan ulangi tes.</p>
    <span class="gs-qa-chip" id="gsQaOcrState">OCR: belum diperiksa</span>
    <span class="gs-qa-chip" id="gsQaModelState">FairScan model: belum terpasang</span></div>
    <div class="gs-qa-row">
      <div><label for="gsQaOriginal">Foto asli / halaman melengkung</label><input id="gsQaOriginal" type="file" accept="image/*"></div>
      <div><label for="gsQaFlattened">Hasil setelah “Ratakan kertas” (opsional)</label><input id="gsQaFlattened" type="file" accept="image/*"></div>
    </div>
    <label for="gsQaExpected">Teks acuan yang terlihat pada halaman</label><textarea id="gsQaExpected" placeholder="Ketik beberapa baris teks yang benar-benar terlihat pada dokumen. Ini dipakai menghitung kecocokan OCR."></textarea>
    <button type="button" id="gsQaRun">Jalankan uji OCR lokal</button>
    <div class="gs-qa-result" id="gsQaResult" role="status" aria-live="polite">Belum ada pengujian.</div>
    <p>Catatan: skor OCR adalah indikator keterbacaan, bukan bukti bahwa geometri halaman sudah benar. Periksa juga huruf kecil, garis tabel, stempel, tanda tangan, dan tepi kertas secara visual.</p>`;
  anchor.insertAdjacentElement('beforebegin', panel);
  const $ = id => document.getElementById(id);
  const norm = s => (s || '').toLocaleLowerCase('id').normalize('NFKD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^\\p{L}\\p{N}]+/gu,' ').trim().replace(/\\s+/g,' ');
  function similarity(expected, actual) {
    const a=norm(expected).split(' ').filter(Boolean), b=norm(actual).split(' ').filter(Boolean);
    if(!a.length) return null;
    const prev=Array.from({length:b.length+1},(_,i)=>i);
    let row;
    for(let i=1;i<=a.length;i++){row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));for(let j=0;j<row.length;j++)prev[j]=row[j];}
    return Math.max(0,Math.round((1-(row[b.length]/Math.max(a.length,b.length,1)))*100));
  }
  const updateStates = () => {
    const local = !!(window.Tesseract && typeof window.Tesseract.createWorker === 'function');
    $('gsQaOcrState').textContent = 'OCR: ' + (local ? 'library tersedia' : 'library tidak tersedia');
    $('gsQaModelState').textContent = 'FairScan model: ' + (window.GlassScanFairScanModelReady ? 'runtime/model siap' : 'belum terpasang');
  };
  async function runOCR(file, lang) {
    const T = window.Tesseract;
    if(!T || typeof T.createWorker !== 'function') throw new Error('Tesseract.js belum tersedia. Buka halaman online sekali, lalu periksa aset lokal.');
    const worker = await T.createWorker(lang, 1, {
      workerPath: './vendor/tesseract/worker.min.js',
      langPath: './models/tessdata/',
      corePath: './vendor/tesseract-core/',
      gzip: true,
      logger: m => { if(m.status) $('gsQaResult').textContent = m.status + (m.progress != null ? ' ' + Math.round(m.progress*100) + '%' : ''); }
    });
    try { const result=await worker.recognize(file); return (result.data && result.data.text) || ''; }
    finally { await worker.terminate(); }
  }
  $('gsQaRun').addEventListener('click', async () => {
    const original=$('gsQaOriginal').files[0], flattened=$('gsQaFlattened').files[0], expected=$('gsQaExpected').value.trim(), button=$('gsQaRun');
    if(!original){$('gsQaResult').textContent='Pilih foto asli terlebih dahulu.';return;}
    if(!expected){$('gsQaResult').textContent='Isi teks acuan terlebih dahulu agar hasil OCR bisa dinilai.';return;}
    button.disabled=true;
    const start=performance.now();
    try {
      $('gsQaResult').textContent='Menjalankan OCR lokal bahasa Indonesia…';
      const originalText=await runOCR(original,'ind');
      const originalScore=similarity(expected,originalText);
      let report='ASLI — kecocokan kata: '+originalScore+'%\\nWaktu total: ';
      if(flattened) {
        $('gsQaResult').textContent='Menguji hasil asli; berikutnya menguji hasil perataan…';
        const flattenedText=await runOCR(flattened,'ind');
        const flattenedScore=similarity(expected,flattenedText);
        const delta=flattenedScore-originalScore;
        report+='\\nSETELAH PERATAAN — kecocokan kata: '+flattenedScore+'%\\nPerubahan skor: '+(delta>0?'+':'')+delta+' poin';
        report+='\\nKesimpulan OCR: '+(delta>0?'hasil perataan membantu OCR pada sampel ini.':delta<0?'hasil perataan menurunkan OCR pada sampel ini.':'OCR tidak berubah pada sampel ini.');
        report+='\\n\\nTEKS OCR HASIL PERATAAN\\n'+flattenedText.slice(0,2500);
      } else report+='\\nUnggah juga hasil “Ratakan kertas” untuk membandingkan dampaknya.';
      report+='\\n'+((performance.now()-start)/1000).toFixed(1)+' detik (termasuk pemuatan runtime/model bahasa).';
      $('gsQaResult').textContent=report;
    } catch(e) { $('gsQaResult').textContent='Uji gagal: '+(e && e.message ? e.message : String(e))+'\\nPeriksa koneksi saat unduhan pertama, path model bahasa lokal, lalu ulangi dalam mode pesawat.'; }
    finally {button.disabled=false;updateStates();}
  });
  updateStates();
})();
