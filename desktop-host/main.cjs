const { app, BrowserWindow, ipcMain, shell, safeStorage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const GLASSSCAN_URL = 'https://mfadholi27-bot.github.io/-GlassScan-Offline/';
const SIWC_ENTRY = path.join(__dirname, 'vendor', 'sign-in-with-chatgpt-devkit', 'packages', 'local', 'dist', 'index.js');
let win;
let chatgpt;
let busy = false;

app.setName('GlassScan Desktop');
app.setPath('userData', path.join(app.getPath('appData'), 'GlassScan Desktop'));

function credentialEncryption() {
  return {
    id: 'electron-safe-storage-v1',
    isAvailable: () => app.isReady() && safeStorage.isEncryptionAvailable(),
    encrypt: (plaintext) => {
      if (!app.isReady() || !safeStorage.isEncryptionAvailable()) throw new Error('Penyimpanan kredensial aman Windows tidak tersedia.');
      return safeStorage.encryptString(plaintext);
    },
    decrypt: (ciphertext) => {
      if (!app.isReady() || !safeStorage.isEncryptionAvailable()) throw new Error('Penyimpanan kredensial aman Windows tidak tersedia.');
      return safeStorage.decryptString(Buffer.from(ciphertext));
    }
  };
}

async function getClient() {
  if (chatgpt) return chatgpt;
  if (!fs.existsSync(SIWC_ENTRY)) {
    throw new Error('SDK belum disiapkan. Tutup aplikasi lalu jalankan setup-siwc.ps1 di folder desktop-host.');
  }
  const sdk = await import(pathToFileURL(SIWC_ENTRY).href);
  chatgpt = sdk.createChatGPT({
    appName: 'GlassScan Desktop',
    appId: 'glassscan-desktop',
    redirectPort: 0,
    storageDir: path.join(app.getPath('userData'), 'chatgpt'),
    credentialEncryption: credentialEncryption(),
    openBrowser: async (url) => {
      const target = new URL(url);
      if (target.origin !== 'https://auth.openai.com') throw new Error('Tujuan login tidak dikenal.');
      await shell.openExternal(target.href);
    }
  });
  return chatgpt;
}

function safeError(error) {
  const message = String(error && error.message || 'Terjadi kesalahan. Coba lagi.');
  if (/sharing|scope|permission/i.test(message)) return 'Izin penggunaan paket ChatGPT belum diberikan. Periksa persetujuan akun dan coba lagi.';
  if (/limit|quota|rate/i.test(message)) return 'Batas penggunaan tercapai atau permintaan dibatasi. Periksa pengaturan penggunaan ChatGPT.';
  if (/sign.?in|auth|token|credential|profile/i.test(message)) return 'Autentikasi belum selesai atau perlu diulang. Periksa jendela browser dan coba hubungkan kembali.';
  if (/encryption|storage/i.test(message)) return 'Penyimpanan kredensial aman tidak tersedia. Login dibatalkan demi keamanan.';
  return 'Permintaan gagal. Periksa koneksi dan coba lagi. Detail teknis tidak ditampilkan untuk melindungi data akun.';
}

function validateSender(event) {
  if (!win || event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame) {
    throw new Error('Permintaan ditolak.');
  }
}

function handle(name, fn) {
  ipcMain.handle('glassscan:' + name, async (event, ...args) => {
    validateSender(event);
    return fn(...args);
  });
}

handle('status', async () => {
  try {
    const client = await getClient();
    const session = await client.getSession();
    return { available: true, session };
  } catch (error) {
    return { available: false, message: safeError(error), session: { status: 'disconnected', sharing: false } };
  }
});

handle('sign-in', async () => {
  if (busy) return { ok: false, message: 'Proses akun sedang berjalan.' };
  busy = true;
  try {
    const client = await getClient();
    const session = await client.signIn();
    return { ok: true, session };
  } catch (error) {
    return { ok: false, message: safeError(error) };
  } finally { busy = false; }
});

handle('disconnect', async () => {
  try {
    const client = await getClient();
    await client.disconnect();
    return { ok: true, session: await client.getSession() };
  } catch (error) { return { ok: false, message: safeError(error) }; }
});

handle('models', async () => {
  try {
    const client = await getClient();
    const session = await client.getSession();
    if (session.status !== 'connected' || !session.sharing) return { ok: false, message: 'Login dan izin penggunaan paket ChatGPT belum aktif.' };
    return { ok: true, models: await client.listModels() };
  } catch (error) { return { ok: false, message: safeError(error) }; }
});

handle('ask', async (text, model) => {
  if (typeof text !== 'string' || !text.trim() || text.length > 20000) {
    return { ok: false, message: 'Masukkan teks 1–20.000 karakter.' };
  }
  if (typeof model !== 'string' || model.length > 200) return { ok: false, message: 'Model tidak valid.' };
  try {
    const client = await getClient();
    const session = await client.getSession();
    if (session.status !== 'connected' || !session.sharing) {
      return { ok: false, message: 'Hubungkan akun dan izinkan penggunaan paket ChatGPT terlebih dahulu.' };
    }
    const result = await client.streamResponse({
      model,
      input: text.trim(),
      instructions: 'Kamu adalah asisten pemrosesan dokumen GlassScan. Bantu merapikan, merangkum, atau mengekstrak informasi dari teks dokumen. Jangan mengarang bagian yang tidak terbaca. Sebutkan jika ada ketidakpastian.'
    });
    return { ok: true, text: result.text || '' };
  } catch (error) { return { ok: false, message: safeError(error) }; }
});

function createWindow() {
  win = new BrowserWindow({
    width: 1400, height: 920, minWidth: 980, minHeight: 700,
    title: 'GlassScan Desktop',
    backgroundColor: '#07111f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.loadFile(path.join(__dirname, 'ui.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
