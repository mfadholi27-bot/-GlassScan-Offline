/* GlassScan V1.5 — visible release history and runtime diagnostics.
   Update CHANGELOG on each future release with the real commit/publication time. */
(() => {
  const RELEASE = { version: 'V1.5', date: '28 Oktober 2026', time: 'Waktu commit: isi sesuai waktu commit GitHub', title: 'Paket siap unggah + riwayat perubahan', detail: 'Memuat riwayat rilis di website dan pemeriksaan apakah modul Local AI berhasil dimuat.' };
  const css = `
    #gsSiteUpdates{margin:14px 0 18px;padding:15px;border:1px solid #63e6ff36;border-radius:18px;background:linear-gradient(140deg,#10283de8,#091321f5);color:#edf6ff}
    #gsSiteUpdates h3{font-size:15px;margin:0 0 8px}
    #gsSiteUpdates .gs-update-sub{font-size:11px;line-height:1.5;color:#9db6ce;margin:0 0 10px}
    #gsSiteUpdates .gs-update-item{padding:10px 0;border-top:1px solid #ffffff17}
    #gsSiteUpdates .gs-update-meta{display:flex;flex-wrap:wrap;gap:7px;align-items:center;font-size:10px;color:#77e8ff}
    #gsSiteUpdates .gs-update-title{font-size:12px;font-weight:700;margin-top:5px}
    #gsSiteUpdates .gs-update-detail{font-size:11px;line-height:1.45;color:#a9bfd5;margin-top:4px}
    #gsSiteUpdates .gs-diagnostic{padding:9px 10px;margin-top:10px;border-radius:10px;background:#020914;color:#b7d3ed;font-size:11px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function inject() {
    if (!document.body || document.getElementById('gsSiteUpdates')) return;
    const box = document.createElement('section');
    box.id = 'gsSiteUpdates';
    box.innerHTML = `<h3>🕒 Riwayat Perubahan GlassScan</h3>
      <p class="gs-update-sub">Waktu commit/publikasi ditampilkan sebagai metadata rilis. Perbarui catatan ini pada setiap rilis agar sesuai dengan waktu commit sebenarnya.</p>
      <div id="gsUpdateItems"></div><div class="gs-diagnostic" id="gsPanelDiagnostic">Memeriksa modul…</div>`;
    const footer = document.querySelector('footer');
    if (footer) footer.insertAdjacentElement('beforebegin', box);
    else document.querySelector('main')?.appendChild(box);
    const older = [
      {version:'V1.4',date:'28 Oktober 2026',time:'Rilis patch',title:'Diagnosis panel dan riwayat perubahan',detail:'Menyiapkan panel status pemuatan modul.'},
      {version:'V1.3',date:'28 Oktober 2026',time:'Rilis patch',title:'Local AI Lab starter',detail:'Fondasi antarmuka OCR lokal; runtime dan model belum dibundel.'}
    ];
    document.getElementById('gsUpdateItems').innerHTML = [RELEASE,...older].map(i=>`<div class="gs-update-item"><div class="gs-update-meta"><b>${i.version}</b><span>${i.date}</span><span>${i.time}</span></div><div class="gs-update-title">${i.title}</div><div class="gs-update-detail">${i.detail}</div></div>`).join('');
    const diag = document.getElementById('gsPanelDiagnostic');
    let tries = 0;
    const check = () => {
      const panel = document.getElementById('gsLocalAiPanel');
      const scripts = [...document.scripts].map(s=>s.getAttribute('src')).filter(Boolean);
      diag.textContent = `Versi website: ${RELEASE.version}\nTag local-ai.js: ${scripts.includes('local-ai.js') ? 'ditemukan' : 'TIDAK ditemukan'}\nTag site-updates.js: ${scripts.includes('site-updates.js') ? 'ditemukan' : 'TIDAK ditemukan'}\nPanel Local AI: ${panel ? 'muncul' : 'belum muncul'}\nJika panel belum muncul: periksa apakah local-ai.js ada di root repo, lalu refresh cache browser.`;
    };
    check();
    const timer = setInterval(()=>{check();if(document.getElementById('gsLocalAiPanel')||++tries>15)clearInterval(timer)},400);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();