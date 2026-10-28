/* GlassScan AI Professional: legacy manual OCR panel disabled.
   The scan engine remains local in app.js. ChatGPT handoff is handled by
   the consent-gated image-sharing workspace in index.html.
   This does not claim embedded ChatGPT authentication or automatic AI calls. */
(() => {
  const removeLegacyPanel = () => {
    document.getElementById('gsLocalAiPanel')?.remove();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeLegacyPanel, { once: true });
  } else {
    removeLegacyPanel();
  }
})();
