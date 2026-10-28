# GlassScan Offline — release candidate GS-172

## Release stamp
- Version: V1.7.2 · GS-172
- Change timestamp shown in app: 28 Oktober 2026, 19:32 WIB
- In-app version and changelog: `site-updates.js`
- Service-worker cache: `glassscan-v172-opencv-offline-cache`

## Implemented
- Throttle live corner detection to reduce phone workload and overlay jitter.
- Correct live overlay mapping for `object-fit: cover`.
- Improve illumination correction and mild text sharpening in Enhance/Magic.
- Order quadrilateral points around their centroid and reject degenerate/self-crossing results.
- Add an indicative document-quality panel for sharpness, brightness, dark area and highlights.
- Cache the OpenCV.js cross-origin script as an opaque response during successful online service-worker installation and serve it from cache on subsequent launches.
- Refresh service-worker cache and update in-app changelog.

## Offline caveat
The OpenCV cache requires one successful online install/update. First-time installation while offline is not guaranteed. Browser/service-worker cache behavior must be tested on target devices; this is not the same as shipping OpenCV.js as a same-origin file.

## Required before final release
- [ ] Test first install online, wait for service worker activation, reload once, then verify camera detection in airplane mode.
- [ ] Test corner detection on plain, busy, dark, rotated and low-contrast backgrounds.
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
