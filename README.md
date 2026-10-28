# GlassScan Offline v0.2 — iPhone PWA prototype

This is a local-first browser prototype with a glassmorphism UI.

## Added in v0.2
- Live camera preview via `getUserMedia` on HTTPS, with manual capture.
- A lightweight live edge/contrast indicator and approximate overlay frame.
- Experimental auto-capture based on edge density (not a robust document-corner detector).
- Import multiple photos.
- Original, black & white (Otsu), grayscale and contrast-enhance filters.
- Rotate active page.
- Export current/all images as JPG; export multiple pages as a locally generated PDF.
- PWA service worker cache for app assets.

## Important technical limitations
- The live overlay is a guide rectangle, **not actual four-corner tracking**. It does not yet perform reliable quadrilateral detection, automatic crop, or perspective correction.
- The auto-capture toggle is experimental and based on rough edge density; it can capture at the wrong time. Manual capture is recommended.
- No OCR, shadow-removal model, or permanent document library yet.
- The PDF embeds processed page images; it is image-based, not searchable OCR PDF.
- Camera and service worker require HTTPS. Opening `index.html` directly in iOS Files will not enable live camera.
- iOS download behavior differs by Safari version. Test export on the target iPhone.
- PWA offline mode requires first loading from HTTPS and successfully caching the assets.

## Run from iPhone only
1. Extract the ZIP in Files.
2. Create a GitHub repository in Safari.
3. Upload all files from this folder into the repository root. Do not upload private scans.
4. Open repository **Settings → Pages**, deploy from the main branch and root folder.
5. Open the HTTPS Pages URL in Safari, grant camera permission, and test.
6. Add to Home Screen if desired. Open once online, then test in Airplane Mode.

No API endpoints, analytics, or external CDNs are used by this prototype. The first visit still needs internet to load the hosted app.
