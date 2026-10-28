const $ = (id) => document.getElementById(id);
const statusBox = $('status');
const pill = $('connectionPill');
const connect = $('connect');
const disconnect = $('disconnect');
const modelSelect = $('model');
const ask = $('ask');

function setStatus(message) { statusBox.textContent = message; }
function sessionMessage(session) {
  if (!session) return 'Status akun belum tersedia.';
  if (session.status !== 'connected') return 'Belum terhubung. Tekan “Hubungkan ChatGPT” untuk membuka autentikasi resmi.';
  if (!session.sharing) return 'Akun sudah terhubung, tetapi izin penggunaan paket ChatGPT untuk AI belum aktif.';
  const identity = session.identity && session.identity.email ? '\\nAkun: ' + session.identity.email : '';
  return 'Terhubung dan izin penggunaan paket AI aktif.' + identity;
}
function setConnected(session) {
  const connected = !!session && session.status === 'connected';
  const canUse = connected && !!session.sharing;
  pill.textContent = canUse ? 'ChatGPT aktif' : connected ? 'Perlu izin AI' : 'Belum terhubung';
  disconnect.disabled = !connected;
  connect.disabled = false;
  ask.disabled = !canUse || !modelSelect.value;
  modelSelect.disabled = !canUse;
}
async function loadModels() {
  const result = await window.glassScanDesktop.models();
  modelSelect.replaceChildren();
  if (!result.ok || !result.models || !result.models.length) {
    const option = document.createElement('option'); option.value = ''; option.textContent = result.message || 'Model tidak tersedia'; modelSelect.append(option);
    ask.disabled = true; return;
  }
  for (const model of result.models) {
    const option = document.createElement('option'); option.value = model.slug; option.textContent = model.displayName || model.slug; modelSelect.append(option);
  }
  ask.disabled = !modelSelect.value;
}
async function refresh() {
  connect.disabled = true; setStatus('Memeriksa koneksi lokal...');
  try {
    const result = await window.glassScanDesktop.status();
    if (!result.available) { setStatus(result.message || 'SDK belum tersedia.'); pill.textContent = 'Setup diperlukan'; setConnected(null); return; }
    setStatus(sessionMessage(result.session)); setConnected(result.session);
    if (result.session && result.session.status === 'connected' && result.session.sharing) await loadModels();
  } catch (error) { setStatus(String(error.message || error)); }
  finally { connect.disabled = false; }
}
connect.addEventListener('click', async () => {
  connect.disabled = true; setStatus('Browser akan dibuka untuk autentikasi resmi ChatGPT. Selesaikan persetujuan di browser...');
  try {
    const result = await window.glassScanDesktop.signIn();
    if (!result.ok) setStatus(result.message || 'Login belum berhasil.');
    else setStatus(sessionMessage(result.session));
  } catch (error) { setStatus(String(error.message || error)); }
  await refresh();
});
disconnect.addEventListener('click', async () => {
  disconnect.disabled = true; const result = await window.glassScanDesktop.disconnect();
  setStatus(result.ok ? 'Koneksi diputus. Token lokal yang terkait telah diminta untuk dihapus.' : result.message || 'Tidak dapat memutuskan akun.');
  await refresh();
});
$('refresh').addEventListener('click', refresh);
modelSelect.addEventListener('change', () => { ask.disabled = !modelSelect.value; });
$('clear').addEventListener('click', () => { $('sourceText').value = ''; $('result').textContent = 'Belum ada hasil.'; });
$('usage').addEventListener('click', () => { window.open('https://chatgpt.com/settings/usage', '_blank', 'noopener'); });
ask.addEventListener('click', async () => {
  const text = $('sourceText').value;
  if (!text.trim()) { setStatus('Tempel teks dokumen terlebih dahulu.'); return; }
  ask.disabled = true; $('result').textContent = 'Memproses teks...';
  try {
    const result = await window.glassScanDesktop.ask(text, modelSelect.value);
    $('result').textContent = result.ok ? (result.text || '(AI tidak mengembalikan teks)') : (result.message || 'Permintaan gagal.');
    if (!result.ok) setStatus(result.message || 'Permintaan AI gagal.');
  } catch (error) { $('result').textContent = String(error.message || error); }
  finally { ask.disabled = !modelSelect.value; }
});
refresh();
