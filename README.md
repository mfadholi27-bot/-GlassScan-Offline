# GlassScan Offline — release candidate GS-171

## Release stamp
- Version: V1.7.1 · GS-171
- Change timestamp shown in app: 28 Oktober 2026, 19:30 WIB
- In-app version and changelog: `site-updates.js`
- Service-worker cache: `glassscan-v171-quality-check`

## Implemented
- Throttle live corner detection to reduce phone workload and overlay jitter.
- Correct live overlay mapping for `object-fit: cover`.
- Improve illumination correction and mild text sharpening in Enhance/Magic.
- Order quadrilateral points around their centroid and reject degenerate/self-crossing results.
- Add an indicative document-quality panel for sharpness, brightness, dark area and highlights.
- Refresh service-worker cache for this candidate release.

## Required before final release
- [ ] Bundle OpenCV.js locally; first-time offline detection is not guaranteed while the library is external.
- [ ] Test corner detection on plain, busy, dark, rotated and low-contrast backgrounds.
- [ ] Verify perspective transform against known rectangular test images and reject unstable quadrilaterals.
- [ ] Compare shadow-removal output against originals to preserve ink, signatures, stamps and colored marks.
- [ ] Verify full-resolution output, no clipping, correct rotations and multi-page PDF/JPG export.
- [ ] Install/update the PWA and test in airplane mode on iPhone Safari and Android Chrome.
- [ ] Check storage quota and memory behavior on older phones.

## Quality panel limitations
The quality metrics are heuristics based on a reduced preview. They are not a certified score and may flag or miss some blurry/overexposed documents. The user should inspect the page before exporting.

## References
- Alaei, A., Bui, V., Doermann, D., & Pal, U. (2024). *Document Image Quality Assessment: A Survey*. ACM Computing Surveys, 56(2). https://doi.org/10.1145/3606692
- Wang, B., Li, C., Zou, W., et al. (2025). *A comprehensive survey on shadow removal from document images: datasets, methods, and opportunities*. Vicinagearth, 2, 1. https://doi.org/10.1007/s44336-024-00010-9
- MDN Web Docs. *Caching — Progressive web apps*. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
