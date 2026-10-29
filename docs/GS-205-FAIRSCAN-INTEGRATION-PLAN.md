# GS-205 — FairScan integration and device QA plan

## Current milestone delivered in this branch
- Applies a restrained, responsive Minimalism visual theme to the existing GlassScan PWA.
- Adds a local OCR comparison panel. It runs Tesseract.js with the app's local worker/core/language paths and compares recognized words against text entered by the tester.
- Allows an original curved-page photo and a flattened result to be tested against the same reference text. It reports a simple word-token similarity score and elapsed time.
- Refreshes the service-worker cache namespace so the new CSS and QA script can be fetched on update.
- The QA panel explicitly reports that the FairScan model is not installed; it does not pretend the model is integrated.

## FairScan model integration — next implementation gate
FairScan's official model repository describes a DeepLabV3Plus model with MobileNetV2 encoder and provides PyTorch and quantized TFLite assets. The upstream Android app executes TFLite with LiteRT; that Android runtime is not directly usable by this browser PWA.

Before enabling a browser model:
1. Confirm the exact TFLite artifact, input dimensions, RGB/BGR ordering, normalization, output tensor layout and segmentation threshold from the model source.
2. Select and pin a browser-compatible TFLite/WebAssembly runtime, then vendor its JS/WASM files locally. Do not rely on a CDN at runtime.
3. Bundle the model locally and add it to the service-worker precache list. Verify its license file ships with it.
4. Add a segmentation-to-quadrilateral postprocessor with confidence/area/aspect-ratio checks. If uncertain, retain the existing OpenCV/manual four-corner path.
5. Test on iPhone 12 Safari with representative document photos and measure cold start, inference time, memory, false positives, and offline repeatability.

## Licensing
The FairScan application and its segmentation-model repository state GPLv3. Review GlassScan's existing license and distribution plans before copying or redistributing upstream code/model assets. The FairScan dataset is CC BY-NC-SA 4.0, which has non-commercial/share-alike conditions; do not bundle the dataset into a distributable app without a separate licensing review. This branch does not copy upstream source or model weights.

## Validation protocol
Use the same test set for every candidate:
- Flat printed page; low contrast; shadow across text; page on a patterned background; perspective skew; multiple sheets; table/form; curved book page near the spine.
- For dewarp, compare original and output side by side and run OCR on both against manually transcribed reference text. Record OCR similarity, elapsed time, and whether any characters, borders, signatures, stamps or page edges were visibly damaged.
- For offline OCR, load the page and local assets online once, close/reopen the PWA, enable airplane mode, and run OCR again. A passing test requires the language model, worker, WASM runtime and OCR to work with no network requests.
- On iPhone 12 Safari, test camera permission, import from Photos, corner dragging, dewarp/undo, multi-page selection, JPG/PNG/PDF export, background/foreground return, and memory stability.
- Keep the results as a test log. A source/syntax check is not a substitute for these physical-device tests.

## Known limits at this milestone
- The FairScan segmentation model is not integrated yet.
- The OCR panel is an evaluation harness, not a guarantee that offline OCR already passes. A language model or runtime asset may still be missing or blocked.
- OCR similarity is only a proxy for readability; visual inspection remains required.
- No real iPhone 12 device test has been performed by this code change.
