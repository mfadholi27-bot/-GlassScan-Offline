# GlassScan Offline — release candidate GS-180

## Release stamp
- Version: V1.8.0 · GS-180
- Change timestamp shown in app: 28 Oktober 2026, 20:20 WIB
- In-app version and changelog: `site-updates.js`
- Service-worker cache: `glassscan-v180-fixed-frame-guide-cache`

## Implemented
- Throttle live corner detection to reduce phone workload and overlay jitter.
- Correct live overlay mapping for `object-fit: cover`.
- Improve illumination correction and mild text sharpening in Enhance/Magic.
- Score multiple OpenCV quadrilateral candidates by document-like proportions, opposite-edge consistency, area and center position.
- Disable the unreliable quadrant-based heuristic fallback; when OpenCV cannot find a credible contour, prefer manual corner adjustment over drawing a misleading polygon.
- Add an indicative document-quality panel for sharpness, brightness, dark area and highlights.
- Cache the OpenCV.js cross-origin script as an opaque response during successful online service-worker installation and serve it from cache on subsequent launches.
- Refresh service-worker cache and update in-app changelog.

## Offline caveat
The OpenCV cache requires one successful online install/update. First-time installation while offline is not guaranteed. Browser/service-worker cache behavior must be tested on target devices; this is not the same as shipping OpenCV.js as a same-origin file.

## Required before final release
- [ ] Test first install online, wait for service worker activation, reload once, then verify camera detection in airplane mode.
- [ ] Test corner detection on plain, busy, dark, rotated and low-contrast backgrounds; contour scoring is a heuristic and still needs real-device validation.
- [ ] Verify perspective transform against known rectangular test images and reject unstable quadrilaterals.
- [ ] Compare shadow-removal output against originals to preserve ink, signatures, stamps and colored marks.
- [ ] Verify full-resolution output, no clipping, correct rotations and multi-page PDF/JPG export.
- [ ] Test in airplane mode on iPhone Safari and Android Chrome.
- [ ] Check storage quota and memory behavior on older phones.

## Quality panel limitations
The quality metrics are heuristics based on a reduced preview. They are not a certified score and may flag or miss some blurry/overexposed documents. The user should inspect the page before exporting.

## References
- Alaei, A., Bui, V., Doermann, D., & Pal, U. (2024). *Document Image Quality Assessment: A Survey*. ACM Computing Surveys, 56(2). https://doi.org/10.1145/3606692
- Wang, B., Li, C., Zou, W., et al. (2025). *A comprehensive survey on shadow removal from document images: datasets, methods, and opportunities*. Vicinagearth, 2, 1. https://doi.org/10.1007/s44336-024-00010-9
- MDN Web Docs. *Caching — Progressive web apps*. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching


### GS-180 — Fixed-frame live scan (28 Oktober 2026, 20:20 WIB)
- Live camera now shows a fixed guide frame rather than drawing unstable detected corners over the preview.
- Captured camera images are not automatically perspective-warped based on uncertain live detection. Review and adjust the four corners in the crop editor before applying.
- This reduces false corner overlays but does not claim CamScanner-equivalent automatic detection. Test on physical iPhone/Android devices and patterned backgrounds before release.
