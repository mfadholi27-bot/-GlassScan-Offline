# GlassScan Offline — release candidate GS-170

## Release stamp
- Version: V1.7.0 · GS-170
- Last change shown in app: 28 Oktober 2026, 19:20 WIB
- The in-app release stamp and changelog are maintained in `site-updates.js`.
- Bump the service-worker cache name in `sw.js` for every user-facing release so installed PWAs can retrieve changed assets.

## Changes in this release candidate
- Throttle live corner detection to reduce phone workload and overlay jitter.
- Correct the live overlay transform for `object-fit: cover`.
- Improve illumination-field interpolation and add mild text sharpening to Enhance/Magic.
- Display release timestamp and expandable change notes in the app.
- Bump the service-worker cache namespace.

## Quality / offline checklist before final
- [ ] Bundle OpenCV.js locally and remove dependency on the remote script for first-time offline use.
- [ ] Test automatic corner detection on plain, busy, dark, rotated, and low-contrast backgrounds.
- [ ] Verify perspective transform with known rectangular test images; reject invalid/self-crossing quadrilaterals.
- [ ] Compare shadow-removal output against originals to ensure ink, signatures, stamps, and colored marks are preserved.
- [ ] Verify output at full resolution and avoid accidental downscaling or clipping.
- [ ] Test multi-page JPG/PDF export, rotations, and large images on iPhone Safari and Android Chrome.
- [ ] Install/update the PWA, then use airplane mode to verify launch, camera/import, crop, filters, and export.
- [ ] Check storage quota and memory behavior on older phones.

## Research direction
Document-image quality assessment should be part of the pipeline, not only a filter preview. The next phase should estimate blur, exposure, glare, document-edge confidence, and OCR readability, then prompt the user to retake a poor image rather than silently claiming it is perfect. Shadow correction should be validated carefully because some algorithms can mistake dark text for shadow.

References:
- Alaei, A., Bui, V., Doermann, D., & Pal, U. (2024). *Document Image Quality Assessment: A Survey*. ACM Computing Surveys, 56(2). https://doi.org/10.1145/3606692
- Wang, B., Li, C., Zou, W., et al. (2025). *A comprehensive survey on shadow removal from document images: datasets, methods, and opportunities*. Vicinagearth, 2, 1. https://doi.org/10.1007/s44336-024-00010-9
- MDN Web Docs. *Caching — Progressive web apps*. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
