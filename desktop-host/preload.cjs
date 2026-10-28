const { contextBridge, ipcRenderer } = require('electron');

// Only fixed, validated operations are exposed. OAuth credentials never reach the renderer.
contextBridge.exposeInMainWorld('glassScanDesktop', Object.freeze({
  status: () => ipcRenderer.invoke('glassscan:status'),
  signIn: () => ipcRenderer.invoke('glassscan:sign-in'),
  disconnect: () => ipcRenderer.invoke('glassscan:disconnect'),
  models: () => ipcRenderer.invoke('glassscan:models'),
  ask: (text, model) => ipcRenderer.invoke('glassscan:ask', text, model)
}));
