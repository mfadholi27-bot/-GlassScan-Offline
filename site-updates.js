/* GlassScan V1.6 status panel. No remote service calls. */
(() => {
 function addPanel() {
  if (document.getElementById('gsSiteUpdatePanel')) return;
  const host = document.querySelector('.preview');
  if (!host) return;
  const panel = document.createElement('section');
  panel.id = 'gsSiteUpdatePanel';
  panel.style.cssText = 'margin:12px 0;padding:10px 14px;border:1px solid #ffffff20;border-radius:12px;background:#101d2d;color:#dcecff;font-size:12px;line-height:1.5';
  panel.innerHTML = '<strong>GlassScan V1.6</strong><div>Gunakan “Periksa aset lokal” dan jalankan OCR untuk menguji pemasangan.</div><div style="opacity:.75">Dukungan offline harus diuji setelah situs dipublikasikan.</div>';
  host.insertAdjacentElement('afterend', panel);
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addPanel, {once:true});
 else addPanel();
})();
