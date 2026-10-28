/* GlassScan V1.1 interaction patch.
   Fixes crop canvas reset during pointer drags and opens crop editor after camera capture.
   No remote AI/CDN dependency is introduced by this file. */
(() => {
  const addStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      #cropCanvas { touch-action: none !important; -webkit-user-select: none; user-select: none; }
      .crop-stage { touch-action: none; }
      #cropCanvas { cursor: crosshair; }
    `;
    document.head.appendChild(style);
  };

  const protectCanvasDimensions = () => {
    const canvas = document.getElementById('cropCanvas');
    if (!canvas || canvas.dataset.gsStableDimensions === '1') return;
    const widthDesc = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'width');
    const heightDesc = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'height');
    if (!widthDesc || !heightDesc) return;

    // Setting canvas.width/height to the current value clears the bitmap and may
    // cancel pointer capture. Ignore same-value writes; allow real resize.
    Object.defineProperty(canvas, 'width', {
      configurable: true,
      get() { return widthDesc.get.call(this); },
      set(value) {
        const next = Math.max(0, Math.trunc(Number(value) || 0));
        if (widthDesc.get.call(this) !== next) widthDesc.set.call(this, next);
      }
    });
    Object.defineProperty(canvas, 'height', {
      configurable: true,
      get() { return heightDesc.get.call(this); },
      set(value) {
        const next = Math.max(0, Math.trunc(Number(value) || 0));
        if (heightDesc.get.call(this) !== next) heightDesc.set.call(this, next);
      }
    });
    canvas.dataset.gsStableDimensions = '1';
  };

  const autoOpenCropAfterCapture = () => {
    const button = document.getElementById('captureBtn');
    if (!button || button.dataset.gsAutoCropBound === '1') return;
    button.dataset.gsAutoCropBound = '1';

    // Capture phase schedules a watcher; the app's existing capture handler then
    // completes its async image processing and render before the crop button is tapped.
    button.addEventListener('click', () => {
      const title = document.getElementById('previewTitle');
      const preview = document.getElementById('previewWrap');
      const cropDialog = document.getElementById('cropDialog');
      const correct = document.getElementById('correctBtn');
      if (!title || !preview || !correct || !cropDialog) return;
      const before = title.textContent;
      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        const changed = title.textContent && title.textContent !== before;
        const ready = !preview.hidden && document.getElementById('previewCanvas')?.width > 0;
        if (ready && (changed || attempts > 5)) {
          clearInterval(timer);
          // Avoid opening twice if user or app already opened the crop dialog.
          if (!cropDialog.open) correct.click();
        } else if (attempts >= 50) {
          clearInterval(timer);
        }
      }, 120);
    });
  };

  const init = () => {
    addStyles();
    protectCanvasDimensions();
    autoOpenCropAfterCapture();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
