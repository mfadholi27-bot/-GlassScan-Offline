# GlassScan v0.7 — OpenCV Integrated Beta (GS-070)

## What changed
- Adds OpenCV.js 4.13.0 script integration.
- Uses OpenCV contour detection (`Canny`, `findContours`, `approxPolyDP`, convex quadrilateral) first for four-corner detection.
- Keeps the existing manual four-point crop editor and perspective warp fallback.
- Adds a visible OpenCV runtime status badge.
- Uses a new service-worker cache name and attempts to cache OpenCV for offline reuse after a successful online load.

## Important connectivity/offline note
This package references the official OpenCV.js script at `https://docs.opencv.org/4.13.0/opencv.js`. The service worker attempts to cache it on first online install. Therefore, first deployment/first load needs internet access; offline use depends on the browser successfully caching that cross-origin script. If strict guaranteed offline operation is required, include a locally bundled `opencv.js` file in the project and change the script source to `./opencv.js` (the library is large). This environment could not fetch and bundle the binary into this ZIP, so the OpenCV runtime itself is not physically embedded in this archive.

## Limitations
- This is a beta integration, not equivalent to CamScanner. Contour detection can fail with low contrast, complex backgrounds, curved pages, or shadows; fallback heuristic is retained.
- OpenCV detection is run on a downscaled preview for speed. The crop is applied using the existing local perspective transform and manual correction is still available.
- Shadow correction remains a basic filter; no neural-network shadow model is bundled.
- No OCR/searchable PDF.
- Test on iPhone Safari before relying on important documents.

## Deploy
1. Extract ZIP.
2. Upload the contents of this folder to the root of the same GitHub Pages repository, replacing old files.
3. Wait for deployment.
4. Open the page while online once; check `V0.7 · BUILD GS-070` and the OpenCV status badge.
5. If OpenCV fails to load, the app falls back to the previous detector. If old UI remains, close Safari tab and reopen or clear site data (this may erase site-local data).
