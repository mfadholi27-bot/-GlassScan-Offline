# GlassScan v0.8 — Precision Scan UI (GS-080)

## Updates
- Version badge is clearly visible: `V0.8 · BUILD GS-080`.
- Header/status/build badge are separated from the flex header to prevent logo/title/status misalignment.
- Crop editor has a 3.2× magnifier loupe during drag, positioned away from the finger, with a crosshair.
- Touch targets and filters use a more consistent responsive grid on iPhone.
- Service-worker cache namespace changed to `glassscan-v080-gs080`.

## OpenCV
The app still references OpenCV.js from the official OpenCV docs host and attempts to cache it after first online load. It is not embedded locally in this ZIP. Offline reuse depends on successful browser cache. The automatic detector can fail; inspect all four corners and use the manual editor.

## Important
This version improves crop editing usability and UI alignment. It does not add a learned document-detection model or guarantee CamScanner-equivalent processing. Shadow reduction remains basic. Test on iPhone Safari.

## Deploy
1. Extract the ZIP.
2. Upload the contents of this folder to the root of the existing GitHub Pages repository, replacing old files.
3. Wait for deployment.
4. Reopen the site and verify `V0.8 · BUILD GS-080`.
5. Test by importing a photo, choosing `Deteksi sudut & crop`, then dragging each corner; the magnifier should appear during dragging.
