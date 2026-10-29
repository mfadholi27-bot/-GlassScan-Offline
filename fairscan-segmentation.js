/* GlassScan GS-206 — FairScan browser TFLite segmentation (experimental).
 * Upstream model: GPL-3.0, FairScan segmentation model v1.2.0.
 * This is a browser-runtime adapter, not a claim of validated accuracy.
 * First online use downloads runtime/model; successful CORS responses are cached by the service worker.
 */
(() => {
  'use strict';
  const MODEL_URL = 'https://github.com/pynicolas/fairscan-segmentation-model/releases/download/v1.2.0/fairscan-segmentation-model.tflite';
  const TF_URL = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
  const TFLITE_URL = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1/dist/tf-tflite.min.js';
  const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1/dist/';
  let modelPromise = null;

  const $ = id => document.getElementById(id);
  function status(message) {
    const b = $('fairscanAuto');
    if (b) b.textContent = message;
  }
  function loadScript(src, marker) {
    if (marker === 'tf' && window.tf) return Promise.resolve();
    if (marker === 'tflite' && window.tflite && window.tflite.loadTFLiteModel) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let script = document.querySelector('script[data-gs-fairscan="' + marker + '"]');
      if (!script) {
        script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.gsFairscan = marker;
        document.head.appendChild(script);
      }
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error('Runtime browser FairScan gagal dimuat: ' + marker)), { once: true });
      if ((marker === 'tf' && window.tf) || (marker === 'tflite' && window.tflite)) resolve();
    });
  }
  async function getModel() {
    if (modelPromise) return modelPromise;
    modelPromise = (async () => {
      await loadScript(TF_URL, 'tf');
      await loadScript(TFLITE_URL, 'tflite');
      if (!window.tflite || typeof window.tflite.loadTFLiteModel !== 'function') {
        throw new Error('API TFLite browser tidak tersedia pada runtime yang dimuat.');
      }
      if (typeof window.tflite.setWasmPath === 'function') window.tflite.setWasmPath(WASM_BASE);
      // FairScan's official pipeline uses 256x256 RGB float input normalized by (pixel - 127.5) / 127.5.
      return window.tflite.loadTFLiteModel(MODEL_URL);
    })().catch(error => { modelPromise = null; throw error; });
    return modelPromise;
  }
  function getMaskQuad(values, shape, image) {
    const w = shape[shape.length - 2] || 256;
    const h = shape[shape.length - 3] || 256;
    if (!values || values.length < w * h) throw new Error('Output model segmentasi kosong atau bentuk tensor tidak dikenali.');
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < w * h; i++) { min = Math.min(min, values[i]); max = Math.max(max, values[i]); }
    // Some exported models expose logits, others probabilities. Normalize logits conservatively.
    const isLogit = min < -0.001 || max > 1.001;
    const prob = v => isLogit ? 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, v)))) : v;
    const threshold = 0.5;
    const candidates = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (prob(values[y * w + x]) >= threshold) candidates.push([x, y]);
    }
    if (candidates.length < w * h * 0.04 || candidates.length > w * h * 0.96) {
      throw new Error('Masker FairScan terlalu kecil/besar; tidak aman untuk crop otomatis.');
    }
    // Extreme points provide a robust initial quadrilateral from a binary segmentation mask.
    const choose = score => candidates.reduce((best, p) => score(p) < score(best) ? p : best, candidates[0]);
    const tl = choose(p => p[0] + p[1]);
    const br = choose(p => -p[0] - p[1]);
    const tr = choose(p => -p[0] + p[1]);
    const bl = choose(p => p[0] - p[1]);
    const points = [tl, tr, br, bl].map(p => [
      Math.max(0, Math.min(image.naturalWidth - 1, p[0] * image.naturalWidth / w)),
      Math.max(0, Math.min(image.naturalHeight - 1, p[1] * image.naturalHeight / h))
    ]);
    if (!window.GlassScanCrop || !window.GlassScanCrop.isValidQuad(points, image)) throw new Error('Empat sudut hasil segmentasi tidak valid.');
    const area = Math.abs(points.reduce((s,p,i) => s + p[0]*points[(i+1)%4][1] - p[1]*points[(i+1)%4][0], 0) / 2);
    if (area / (image.naturalWidth * image.naturalHeight) < 0.12) throw new Error('Area dokumen terdeteksi terlalu kecil.');
    return points;
  }
  async function infer(image) {
    const model = await getModel();
    const tf = window.tf;
    let input, output;
    try {
      input = tf.tidy(() => tf.browser.fromPixels(image)
        .resizeBilinear([256, 256], true)
        .toFloat().sub(127.5).div(127.5).expandDims(0));
      output = model.predict(input);
      if (Array.isArray(output)) output = output[0];
      const data = await output.data();
      return getMaskQuad(data, output.shape, image);
    } finally {
      if (input) input.dispose();
      if (output && typeof output.dispose === 'function') output.dispose();
    }
  }
  // Expose an explicit preparation action for the privacy/offline diagnostics panel.
  // Successful model load proves this session can load the model; offline persistence is checked separately.
  window.GlassScanFairScan = window.GlassScanFairScan || {};
  window.GlassScanFairScan.prepare = async () => { await getModel(); return true; };

  function install() {
    const button = $('fairscanAuto');
    if (!button || button.dataset.gsFairscanBound) return;
    button.dataset.gsFairscanBound = '1';
    button.title = 'Segmentasi dokumen FairScan (eksperimental). Pertama kali perlu internet; hasil harus diperiksa.';
    button.addEventListener('click', async () => {
      const cropApi = window.GlassScanCrop;
      const image = cropApi && cropApi.getImage();
      if (!image || !cropApi) {
        if (typeof toast === 'function') toast('Buka editor crop terlebih dahulu.');
        return;
      }
      button.disabled = true;
      status('Memuat model FairScan…');
      const start = performance.now();
      try {
        const points = await infer(image);
        cropApi.setQuad(points);
        const ms = Math.round(performance.now() - start);
        status('FairScan ✓ ' + ms + ' ms');
        if (typeof toast === 'function') toast('FairScan memperkirakan empat sudut (' + ms + ' ms). Periksa titik sebelum Terapkan crop.');
      } catch (error) {
        console.error('[GlassScan FairScan]', error);
        status('FairScan tidak tersedia');
        if (typeof toast === 'function') toast('FairScan gagal: ' + (error && error.message ? error.message : 'runtime/model tidak cocok') + '. Gunakan deteksi klasik atau titik manual.');
      } finally {
        button.disabled = false;
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
