# GS-206 — FairScan TFLite browser integration (experimental)

## What changed
- Adds a **FairScan · segmentasi AI** button to the existing crop editor.
- Loads the official FairScan v1.2.0 TFLite model using the browser package `@tensorflow/tfjs-tflite` and TensorFlow.js.
- Uses the upstream 256×256 RGB float input convention with normalization `(pixel - 127.5) / 127.5`, matching the FairScan Android preprocessing source.
- Converts the segmentation output mask to an initial four-corner estimate. The user must inspect the points before applying perspective correction.
- Updates the service-worker cache namespace and caches successful runtime/model responses after they have been fetched online.

## Important limitations
- This is an **experimental integration attempt**, not a validated accuracy claim. Only JavaScript syntax and wiring were checked here; browser inference has not been executed in a real Safari session.
- The TFLite web runtime and model must be reachable with browser CORS support. If the host/runtime fails, the UI reports the failure and the existing classic/manual crop workflow remains available.
- First use requires internet. Offline repeat use depends on successful service-worker caching of runtime, WASM, and model responses; this must be tested on the deployed site.
- Four extreme points of a segmentation mask are only an initial quadrilateral approximation; irregular backgrounds or shadows can distort them.
- iPhone 12 Safari latency, memory use, model output tensor shape/range, and actual corner quality still need testing.
- FairScan model repository is GPL-3.0. Review compatibility with GlassScan's distribution/license before distributing a production build containing this model. Upstream model: https://github.com/pynicolas/fairscan-segmentation-model/releases/tag/v1.2.0
