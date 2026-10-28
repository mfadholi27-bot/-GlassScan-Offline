/* GlassScan premium icon and typography polish. UI-only: preserves existing button IDs and event handlers. */
(() => {
  const icon = (name) => {
    const paths = {
      camera: '<path d="M4 8.5h3l1.7-2.2h6.6L17 8.5h3A1.5 1.5 0 0 1 21.5 10v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5Z"/><circle cx="12" cy="13.5" r="4"/>',
      image: '<rect x="3" y="3.5" width="18" height="17" rx="3"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 3.5-4 4.5 5"/>',
      spark: '<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="m19 14 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
      crop: '<path d="M7 3v12a2 2 0 0 0 2 2h12"/><path d="M3 7h12a2 2 0 0 1 2 2v12"/><path d="M7 3H3v4m14 14h4v-4"/>',
      rotate: '<path d="M4 8V3l4 4"/><path d="M4.5 7A8 8 0 1 1 4 15"/><path d="M20 16v5l-4-4"/>',
      trash: '<path d="M3 6h18M9 6V3h6v3m-9 0 1 15h10l1-15M10 10v7m4-7v7"/>',
      file: '<path d="M6 2.5h8l5 5V21H6a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2Z"/><path d="M14 2.5V8h5M8 12h8M8 16h8"/>',
      pdf: '<path d="M6 2.5h8l5 5V21H6a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2Z"/><path d="M14 2.5V8h5"/><path d="M7.5 15h2a1.5 1.5 0 0 0 0-3h-2v6m5-6v6h1.2a3 3 0 0 0 0-6H12.5Zm5 6v-6h3"/>',
      chat: '<path d="M12 3a8.5 8.5 0 0 0-7.2 13l-1 4 4.2-1A8.5 8.5 0 1 0 12 3Z"/><path d="m8 12 2.5 2.5L16 9"/>',
      arrow: '<path d="m9 5 7 7-7 7"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (paths[name] || paths.spark) + '</svg>';
  };
  function prependIcon(button, name, cls = 'btn-icon') {
    if (!button || button.querySelector('.' + cls)) return;
    const span = document.createElement('span');
    span.className = cls;
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = icon(name);
    button.prepend(span);
  }
  function polish() {
    const logo = document.querySelector('.logo span');
    if (logo) logo.textContent = 'GS';
    document.querySelectorAll('.capture-icon').forEach((el, i) => {
      el.innerHTML = icon(i === 0 ? 'camera' : 'image');
      el.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.filter .sample').forEach((el, i) => {
      const names = ['file', 'spark', 'file', 'image', 'spark', 'spark'];
      el.innerHTML = icon(names[i] || 'file');
      el.setAttribute('aria-hidden', 'true');
    });
    const aiPanel = document.getElementById('gsChatGPTQuickPanel');
    if (aiPanel && !aiPanel.querySelector('.gs-ai-heading')) {
      const title = aiPanel.querySelector('div[style*="font-size"]');
      if (title) {
        const heading = document.createElement('div');
        heading.className = 'gs-ai-heading';
        heading.innerHTML = '<span class="gs-ai-mark" aria-hidden="true">' + icon('chat') + '</span><div><div class="gs-ai-title">ChatGPT Document Workspace</div><div class="gs-ai-subtitle">AI DOCUMENT ASSISTANT</div></div>';
        title.replaceWith(heading);
      }
    }
    const send = document.getElementById('gsChatGPTQuick');
    if (send) {
      send.innerHTML = '<span class="gs-action-icon" aria-hidden="true">' + icon('spark') + '</span><span>Siapkan &amp; kirim gambar ke ChatGPT</span><span class="gs-action-icon" aria-hidden="true">' + icon('arrow') + '</span>';
    }
    const login = document.getElementById('gsOpenChatGPT');
    if (login) {
      login.innerHTML = '<span class="gs-action-icon" aria-hidden="true">' + icon('chat') + '</span><span>Masuk / buka situs ChatGPT</span><span class="gs-action-icon" aria-hidden="true">' + icon('arrow') + '</span>';
    }
    [
      ['correctBtn','crop'],['saveJpgBtn','file'],['rotateBtn','rotate'],['deleteBtn','trash'],
      ['exportAllJpg','file'],['exportPdf','pdf'],['cameraBtn','camera'],['importBtn','image']
    ].forEach(([id, name]) => {
      const button = document.getElementById(id);
      if (button && !['cameraBtn','importBtn'].includes(id)) prependIcon(button, name);
    });
    const emptyIcon = document.querySelector('.empty-icon');
    if (emptyIcon && !emptyIcon.querySelector('svg')) {
      emptyIcon.innerHTML = icon('file');
      emptyIcon.style.display = 'grid';
      emptyIcon.style.placeItems = 'center';
      emptyIcon.style.border = '1px solid #63e6ff66';
      emptyIcon.style.color = '#63e6ff';
      emptyIcon.querySelector('svg').style.cssText = 'width:32px;height:32px;stroke:currentColor;stroke-width:1.6;fill:none';
    }
    document.querySelectorAll('.arrow').forEach(el => { el.textContent = '›'; el.style.fontSize = '28px'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', polish, { once: true });
  else polish();
})();
