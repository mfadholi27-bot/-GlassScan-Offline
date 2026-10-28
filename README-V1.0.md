# GlassScan v1.0 — AI Lab foundation patch

## Included
- `ai-tools.js`: adds a Smart Image Lab panel and local illumination/contrast enhancement.
- `sw.js`: precaches the AI tools script with the app shell; no cross-origin model/CDN cache is claimed.
- `manifest.webmanifest`: updates the app label.

## Apply from iPhone
1. Open https://github.com/mfadholi27-bot/-GlassScan-Offline
2. Add `ai-tools.js` at the repository root using Add file → Create new file (paste its contents).
3. Replace `sw.js` with the version in this ZIP.
4. Replace `manifest.webmanifest` with the version in this ZIP.
5. Edit `index.html`: remove the external OpenCV script tag if aiming for offline-first:
   `<script async src="https://docs.opencv.org/4.13.0/opencv.js" id="opencvScript"></script>`
   Keep `<script src="app.js"></script>` and add `<script src="ai-tools.js"></script>` immediately after it.
6. Commit each change to `main`, then open the Pages site online once and test.

## Honest limitations
This is a foundation patch, not a full trained AI installation. Smart Enhance uses classical local image processing; it is not a neural-network model. OCR is not implemented because no OCR engine/model files are bundled. The current preview/export pipeline may redraw from original page data when rerendered, so treat the Smart Enhance preview as experimental and verify exported output before relying on it. OpenCV removal means the existing detector will use its heuristic fallback. Test camera, crop, PDF/JPG and Airplane Mode on iPhone before treating the app as production-ready.
