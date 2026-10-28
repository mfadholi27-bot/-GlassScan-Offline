const { contextBridge } = require('electron');

// Intentionally expose no credentials, Node APIs, or ChatGPT tokens to the page.
// A narrowly scoped bridge will only be added after the official SIWC SDK flow
// and Windows credential storage have been implemented and tested.
contextBridge.exposeInMainWorld('glassScanDesktop', Object.freeze({
  hostVersion: '0.1.0',
  chatgptIntegration: 'not-configured'
}));
