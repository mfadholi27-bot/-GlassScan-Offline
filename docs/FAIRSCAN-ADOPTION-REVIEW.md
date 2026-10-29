# FairScan-inspired GlassScan improvement plan

Status: engineering assessment and acceptance criteria; this document does not claim that FairScan's model has been integrated.

## What the repository review found

- FairScan's Android app uses a custom DeepLabV3Plus + MobileNetV2 segmentation model for document-area detection, then OpenCV for perspective correction and image enhancement.
- The model repository publishes PyTorch and quantized TFLite formats. Its README reports Dice > 0.94 on its validation set; that metric is not a guarantee of accuracy on GlassScan users' images.
- FairScan is GPL-3.0. Its model repository is also GPL-3.0. Before copying or adapting their code/model, review the license files and the distribution obligations for this project. This is an engineering/licensing checkpoint, not legal advice.
- GlassScan already has an ML corner-detection path through Quadscan/DocAligner, with OpenCV/heuristic fallback, and an experimental GS-201 curved-page dewarp. FairScan's documented feature list does not establish that it can flatten curved book pages.

## Recommended adoption strategy

1. **Do not replace GS-201 dewarping with FairScan.** They solve different problems: segmentation finds the document region; perspective correction fixes a planar view; dewarping tries to flatten a curved page surface.
2. **Benchmark before adding a second detector.** Compare GlassScan's existing detector against FairScan segmentation on the same images: flat A4 sheet, book page near the spine, low contrast, shadows, ruled forms/tables, cluttered background, and rotated documents.
3. **Keep the existing fallback.** If an ML runtime/model fails to load or the confidence is low, preserve the current OpenCV/heuristic route and allow manual corner adjustment.
4. **Offline-first model delivery.** Any candidate model and its runtime must be version-pinned, hosted as a project asset, included in the service-worker cache, and verified after a first online install followed by airplane-mode launch. Avoid making a live CDN request a requirement for scanning.
5. **Protect the original image.** Run detection on a reduced analysis copy, apply coordinates to the full-resolution image, and never overwrite the original until the user accepts the result.
6. **Curved-page dewarp stays a separate workstream.** Validate on curved-book photos with visible text near the gutter and outer edges. Compare before/after crops, text-line straightness, legibility, edge preservation, and processing time on iPhone Safari. If confidence is insufficient, leave the image unchanged and explain why.
7. **Release only after device validation.** Run syntax checks, verify the service worker updates, test Safari on iPhone, and test offline mode. Do not treat a merged PR or a passing syntax check as proof of visual quality.

## Acceptance checklist for the next implementation PR

- [ ] No cloud upload is required for detection, crop, enhancement, or dewarping.
- [ ] Existing Quadscan/OpenCV/manual-corner fallback still works if the new model fails.
- [ ] Model/runtime versions are pinned and cacheable for offline use.
- [ ] Low-confidence detection does not silently crop away document content.
- [ ] Original image can be restored after any transform.
- [ ] Test results include at least one curved book page, one ruled table/form, and one flat page.
- [ ] Performance and visual behavior are checked on a real iPhone Safari session.

## Primary references

- FairScan app: https://github.com/pynicolas/FairScan
- FairScan segmentation model: https://github.com/pynicolas/fairscan-segmentation-model
- GlassScan's existing detector: `ai-corner.js`
- GlassScan's curved-page experiment: `app.js` / GS-201

This is a plan and review record only. No FairScan model weights or third-party source code have been copied into GlassScan by adding this document.
