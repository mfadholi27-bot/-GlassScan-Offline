# GlassScan v0.9 — Offline-first patch

This patch removes the service worker's unreliable cross-origin OpenCV caching attempt.
The app shell (HTML, CSS, JavaScript, manifest, and icon) is precached from the same
GitHub Pages origin. `app.js` has a heuristic document-detection fallback, so the
scanner can remain usable without OpenCV; detection quality may be lower.

## Apply on GitHub from iPhone

1. Open the repository: https://github.com/mfadholi27-bot/-GlassScan-Offline
2. Replace `sw.js` with the `sw.js` in this ZIP.
3. Replace `manifest.webmanifest` with the file in this ZIP.
4. Open `index.html` in GitHub and tap Edit.
5. At the very bottom, find and remove this script tag:
   `<script async src="https://docs.opencv.org/4.13.0/opencv.js" id="opencvScript"></script>`
   Keep `<script src="app.js"></script>` in place.
6. Commit the changes to `main`.
7. Open the Pages site online once, reload it, then test in Airplane Mode.

## Important limitation

This is offline-first, not a guarantee of full offline operation on every iPhone/browser.
The first successful online visit is required to cache the app shell. Camera access and
download behavior should be tested on the target iPhone. OpenCV is intentionally not
bundled in this patch, so the app uses its built-in heuristic fallback rather than
claiming OpenCV-based detection is available offline. No AI model/OCR is included yet.

After applying, if the old version still appears, close the installed web app and reopen
it; if needed, clear Safari website data for the GitHub Pages site and visit it online again.
