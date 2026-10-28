# GlassScan V1.1 — Crop interaction + offline shell patch

## Upload these files to the repository root
- `interaction-fix.js` (new file)
- `sw.js` (replace existing)
- `manifest.webmanifest` (replace existing)

## One small edit in index.html
Find the script lines at the bottom. Keep the existing `app.js` and `ai-tools.js` lines.
Add this line after them:
`<script src="interaction-fix.js"></script>`

Expected order:
`<script async src="https://docs.opencv.org/4.13.0/opencv.js" id="opencvScript"></script>`
`<script src="app.js"></script>`
`<script src="ai-tools.js"></script>`
`<script src="interaction-fix.js"></script>`

For more offline independence, you may later remove the external OpenCV line, but automatic detection quality can fall back to the heuristic detector. This patch does not bundle OpenCV.

## What it changes
- Prevents canvas bitmap reset when code assigns the same width/height during a drag; this is a likely cause of interrupted touch/pointer interactions.
- Sets `touch-action: none` on the crop canvas so Safari doesn't steal gestures for page scrolling.
- Automatically opens the crop editor after a camera capture has rendered.
- Adds the interaction-fix script to the service-worker precache list.

## AI/offline truth
This patch improves interaction and offline caching; it does not add a trained neural-network model or OCR engine. The existing Smart Image Lab is experimental classical image processing. To add actual offline AI, we must separately bundle and test model files locally, then integrate them into the image/export pipeline.
