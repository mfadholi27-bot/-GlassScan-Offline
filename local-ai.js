/* GlassScan V1.3 Local AI integration starter.
   All model/runtime paths are relative to this GitHub Pages app.
   This module never calls a remote AI endpoint. OCR activates only when the
   user has placed the Tesseract.js runtime and Indonesian traineddata locally. */
(() => {
  const ROOT = './vendor/tesseract/';
  const LANG_PATH = './models/tessdata/';
  const CORE_PATH = './vendor/tesseract-core/';
  let workerPromise = null;

  const style = document.createElement('style');
  style.textContent = `
    .gs-local-ai{margin:16px 0;padding:16px;border-radius:18px;border:1px solid #63e6ff35;background:linear-gradient(140deg,#132b42e8,#0b1425f5);color:#eef6ff}
    .gs-local-ai h3{margin:0;font-size:16px}.gs-local-ai p{font-size:12px;line-height:1.5;color:#a9bfd5}
    .gs-local-ai .gs-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    .gs-local-ai button{border:1px solid #ffffff22;border-radius:11px;padding:11px 12px;background:#182941;color:#f3f7ff;font-size:12px}
    .gs-local-ai button.primary{background:linear-gradient(120deg,#63e6ff,#9d9aff);color:#07111f;font-weight:700;border:0}
    .gs-local-ai button:disabled{opacity:.45}
    .gs-ai-result{white-space:pre-wrap;overflow-wrap:anywhere;max-height:240px;overflow:auto;background:#030a14;border:1px solid #ffffff1a;border-radius:12px;padding:12px;font-size:12px;line-height:1.5;min-height:48px;color:#e9f4ff}
    .gs-ai-progress{height:5px;border-radius:9px;background:#ffffff15;overflow:hidden;margin-top:10px}
    .gs-ai-progress span{display:block;width:0;height:100%;background:linear-gradient(90deg,#63e6ff,#9d9aff);transition:width .15s}
    .gs-ai-note{font-size:10px!important;color:#8ba6c3!important}
  `;
  document.head.appendChild(style);

  function addPanel() {
    if (document.getElementById('gsLocalAiPanel')) return;
    const preview = document.querySelector('.preview');
    if (!preview) return;
    const panel = document.createElement('section');
    panel.className = 'gs-local-ai';
    panel.id = 'gsLocalAiPanel';
    panel.innerHTML = `
      <h3>🧠 Local AI Lab</h3>
      <p>Area ini disiapkan untuk model lokal. OCR akan berjalan di perangkat hanya setelah runtime dan model bahasa Indonesia ditempatkan di folder yang benar.</p>
      <div class="gs-row">
        <button class="primary" id="gsRunOcr">Jalankan OCR Indonesia</button>
        <button id="gsCopyOcr">Salin teks</button>
        <button class="primary" id="gsSendChatGPT">✦ Bantu dengan ChatGPT</button>
        <button id="gsCheckAi">Periksa aset lokal</button>
      </div>
      <div class="gs-ai-progress"><span id="gsOcrProgress"></span></div>
      <p id="gsLocalAiStatus" role="status" aria-live="polite">Belum menjalankan OCR.</p>
      <div class="gs-ai-result" id="gsOcrResult">Hasil teks akan muncul di sini.</div>
      <p class="gs-ai-note">Privasi: tidak ada endpoint cloud AI di modul ini. Agar offline, seluruh runtime, WASM, dan berkas model harus tersedia secara lokal. Deteksi dokumen ONNX dan model restorasi gambar belum aktif hanya dengan memasang file ini.</p>
    `;
    preview.insertAdjacentElement('afterend', panel);

    const status = m => { const e = document.getElementById('gsLocalAiStatus'); if(e) e.textContent = m; };
    const progress = p => { const e = document.getElementById('gsOcrProgress'); if(e) e.style.width = `${Math.max(0,Math.min(100,p||0))}%`; };
    const result = document.getElementById('gsOcrResult');

    async function getWorker() {
      if (workerPromise) return workerPromise;
      if (!window.Tesseract?.createWorker) {
        throw new Error('Runtime OCR lokal belum tersedia. Pasang vendor/tesseract/tesseract.min.js dan muat script tersebut di index.html.');
      }
      workerPromise = window.Tesseract.createWorker('ind', 1, {
        workerPath: ROOT + 'worker.min.js',
        langPath: LANG_PATH,
        corePath: CORE_PATH,
        logger: m => {
          if (m && typeof m.progress === 'number') {
            progress(m.progress * 100);
            status(`OCR: ${m.status || 'memproses'} (${Math.round(m.progress * 100)}%)`);
          }
        },
        errorHandler: e => console.warn('[GlassScan OCR]', e)
      });
      return workerPromise;
    }

    document.getElementById('gsRunOcr').addEventListener('click', async () => {
      const canvas = document.getElementById('previewCanvas');
      if (!canvas || !canvas.width || !canvas.height || document.getElementById('previewWrap')?.hidden) {
        status('Impor atau ambil foto dokumen terlebih dahulu.'); return;
      }
      const btn = document.getElementById('gsRunOcr');
      btn.disabled = true; progress(0);
      try {
        status('Menyiapkan mesin OCR lokal…');
        const worker = await getWorker();
        status('Mengenali teks pada gambar…');
        const { data } = await worker.recognize(canvas);
        const text = (data?.text || '').trim();
        result.textContent = text || 'Tidak ada teks yang terdeteksi. Coba foto yang lebih tajam dan terang.';
        status(text ? `OCR selesai · keyakinan rata-rata ${Math.round(data.confidence || 0)}%` : 'OCR selesai, tetapi teks tidak ditemukan.');
        progress(100);
      } catch (e) {
        console.error(e);
        workerPromise = null;
        status(`OCR belum siap: ${e.message || e}. Pastikan semua aset model lokal tersedia dan halaman dibuka melalui HTTPS.`);
      } finally { btn.disabled = false; }
    });

    document.getElementById('gsCopyOcr').addEventListener('click', async () => {
      const text = result.textContent || '';
      if (!text || text === 'Hasil teks akan muncul di sini.') { status('Belum ada teks untuk disalin.'); return; }
      try {
        await navigator.clipboard.writeText(text);
        status('Teks OCR disalin.');
      } catch {
        status('Browser menolak akses clipboard. Pilih teks hasil OCR lalu salin manual.');
      }
    });

    document.getElementById('gsSendChatGPT').addEventListener('click', async () => {
      const scannedText = (result.textContent || '').trim();
      if (!scannedText || scannedText === 'Hasil teks akan muncul di sini.') {
        status('Jalankan OCR terlebih dahulu sebelum menggunakan ChatGPT.');
        return;
      }
      const prompt = [
        'Bantu saya memahami teks hasil pemindaian dokumen ini.',
        'Rapikan kesalahan OCR yang jelas, buat ringkasan poin penting, dan ekstrak tanggal, nama, nomor, atau nominal jika ada.',
        'Jangan mengarang bagian yang tidak terbaca. Tandai bagian yang meragukan dan pisahkan fakta dari interpretasi.',
        '',
        'TEKS HASIL SCAN:',
        scannedText
      ].join('\n');
      const btn = document.getElementById('gsSendChatGPT');
      btn.disabled = true;
      try {
        if (navigator.share) {
          await navigator.share({ title: 'GlassScan — hasil OCR untuk ChatGPT', text: prompt });
          status('Menu berbagi dibuka. Pilih ChatGPT untuk mengirim teks hasil OCR.');
        } else {
          await navigator.clipboard.writeText(prompt);
          status('Prompt dan teks OCR disalin. ChatGPT dibuka; tempel teks di kolom chat.');
          window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer');
        }
      } catch (e) {
        if (e && e.name === 'AbortError') {
          status('Berbagi dibatalkan. Teks OCR tetap tersimpan di halaman ini.');
        } else {
          status('Tidak dapat membuka menu berbagi. Gunakan Salin teks, lalu tempel di ChatGPT.');
        }
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById('gsCheckAi').addEventListener('click', async () => {
      const checks = [
        ['Tesseract.js runtime', ROOT + 'tesseract.min.js'],
        ['Worker OCR', ROOT + 'worker.min.js'],
        ['Model bahasa Indonesia', LANG_PATH + 'ind.traineddata.gz'],
        ['Core WASM (SIMD-LSTM)', CORE_PATH + 'tesseract-core-simd-lstm.wasm.js']
      ];
      const lines = [];
      for (const [name, url] of checks) {
        try {
          const r = await fetch(url, { method:'HEAD', cache:'no-store' });
          lines.push(`${r.ok ? '✓' : '✗'} ${name}: ${r.ok ? 'tersedia' : 'belum ditemukan'}`);
        } catch { lines.push(`? ${name}: tidak dapat diperiksa`); }
      }
      status(lines.join(' · '));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addPanel);
  else addPanel();
})();