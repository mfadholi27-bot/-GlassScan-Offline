(() => {
  const $ = (id) => document.getElementById(id);
  const cameraInput = $("cameraInput"), importInput = $("importInput");
  const canvas = $("previewCanvas"), ctx = canvas.getContext("2d", { willReadFrequently: true });
  let pages = [], activeIndex = -1, currentFilter = "original", toastTimer;

  function toast(message) {
    const el = $("toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
  }
  $("cameraBtn").addEventListener("click", () => cameraInput.click());
  $("importBtn").addEventListener("click", () => importInput.click());
  cameraInput.addEventListener("change", e => loadFiles(e.target.files));
  importInput.addEventListener("change", e => loadFiles(e.target.files));
  $("installHint").addEventListener("click", () => $("helpDialog").showModal());
  $("closeHelp").addEventListener("click", () => $("helpDialog").close());

  async function loadFiles(fileList) {
    const files = [...(fileList || [])].filter(f => f.type.startsWith("image/"));
    if (!files.length) return;
    for (const file of files) {
      try {
        const dataUrl = await readAsDataURL(file);
        const img = await loadImage(dataUrl);
        const normalized = document.createElement("canvas");
        const maxSide = 2600, ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        normalized.width = Math.round(img.naturalWidth * ratio);
        normalized.height = Math.round(img.naturalHeight * ratio);
        normalized.getContext("2d").drawImage(img, 0, 0, normalized.width, normalized.height);
        pages.push({ data: normalized.toDataURL("image/jpeg", .94), name: file.name || `scan-${pages.length+1}.jpg` });
      } catch (err) { console.error(err); toast("Gambar tidak bisa dibuka."); }
    }
    activeIndex = pages.length - 1; currentFilter = "original"; setActiveFilterButton();
    render(); updateCounters(); cameraInput.value = ""; importInput.value = "";
    toast(`${files.length} gambar ditambahkan ke dokumen.`);
  }
  function readAsDataURL(file) {
    return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });
  }
  function loadImage(src) {
    return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
  }
  function setActiveFilterButton() {
    document.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("active", b.dataset.filter === currentFilter));
  }
  document.querySelectorAll(".filter-chip").forEach(btn => btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter; setActiveFilterButton(); render();
  }));

  async function render() {
    const hasPage = activeIndex >= 0 && pages[activeIndex];
    $("emptyState").hidden = !!hasPage; $("previewWrap").hidden = !hasPage;
    $("previewActions").hidden = !hasPage;
    $("exportPdfBtn").disabled = pages.length === 0;
    if (!hasPage) { $("previewTitle").textContent = "Belum ada dokumen"; $("thumbs").innerHTML = ""; return; }
    const img = await loadImage(pages[activeIndex].data);
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0);
    if (currentFilter !== "original") applyFilter(ctx, canvas.width, canvas.height, currentFilter);
    $("previewTitle").textContent = pages[activeIndex].name || `Halaman ${activeIndex+1}`;
    drawThumbs();
  }
  function applyFilter(context, width, height, mode) {
    const imageData = context.getImageData(0, 0, width, height), d = imageData.data;
    if (mode === "gray") {
      for (let i=0;i<d.length;i+=4) { const y=.299*d[i]+.587*d[i+1]+.114*d[i+2]; d[i]=d[i+1]=d[i+2]=y; }
    } else if (mode === "enhance") {
      for (let i=0;i<d.length;i+=4) {
        for (let c=0;c<3;c++) { const v=d[i+c]/255; d[i+c]=Math.max(0,Math.min(255,((v-.5)*1.35+.5)*255)); }
      }
    } else if (mode === "bw") {
      // Otsu thresholding on local canvas pixels; no network or external model.
      const hist = new Uint32Array(256); let total=width*height, sum=0;
      for (let i=0;i<d.length;i+=4) { const y=Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2]); hist[y]++; sum+=y; }
      let sumB=0, wB=0, maxVar=0, threshold=160;
      for(let t=0;t<256;t++){wB+=hist[t];if(!wB)continue;const wF=total-wB;if(!wF)break;sumB+=t*hist[t];const mB=sumB/wB,mF=(sum-sumB)/wF;const variance=wB*wF*(mB-mF)*(mB-mF);if(variance>maxVar){maxVar=variance;threshold=t;}}
      for(let i=0;i<d.length;i+=4){const y=.299*d[i]+.587*d[i+1]+.114*d[i+2];const v=y>threshold?255:0;d[i]=d[i+1]=d[i+2]=v;}
    }
    context.putImageData(imageData,0,0);
  }
  function drawThumbs() {
    const container=$("thumbs");container.innerHTML="";
    pages.forEach((page,index)=>{
      const button=document.createElement("button");button.className="thumb"+(index===activeIndex?" active":"");button.title=`Buka halaman ${index+1}`;
      const c=document.createElement("canvas");button.appendChild(c);const badge=document.createElement("span");badge.textContent=index+1;button.appendChild(badge);
      loadImage(page.data).then(img=>{c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext("2d").drawImage(img,0,0);});
      button.addEventListener("click",()=>{activeIndex=index;render();});container.appendChild(button);
    });
  }
  function updateCounters(){const n=pages.length;$("pageCount").textContent=`${n} halaman`; $("exportPdfBtn").disabled=!n;}
  $("deletePageBtn").addEventListener("click",()=>{if(activeIndex<0)return;pages.splice(activeIndex,1);activeIndex=pages.length?Math.min(activeIndex,pages.length-1):-1;render();updateCounters();toast("Halaman dihapus.");});
  $("saveImageBtn").addEventListener("click",()=>{if(activeIndex<0)return;const a=document.createElement("a");a.href=canvas.toDataURL("image/jpeg",.94);a.download=`glassscan-${activeIndex+1}.jpg`;a.click();toast("JPG diproses dan disiapkan.");});
  $("exportPdfBtn").addEventListener("click", async()=>{
    if(!pages.length)return;
    const button=$("exportPdfBtn");button.disabled=true;button.textContent="Menyiapkan PDF…";
    try {
      const blobs=[];
      for(const p of pages){const img=await loadImage(p.data);const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;const cctx=c.getContext("2d");cctx.drawImage(img,0,0);if(currentFilter!=="original")applyFilter(cctx,c.width,c.height,currentFilter);blobs.push({dataUrl:c.toDataURL("image/jpeg",.92),w:c.width,h:c.height});}
      const pdf=makePdf(blobs);const blob=new Blob([pdf],{type:"application/pdf"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="GlassScan-Document.pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast("PDF berhasil dibuat di perangkat.");
    }catch(err){console.error(err);toast("PDF gagal dibuat. Coba kurangi jumlah atau ukuran halaman.");}
    finally{button.innerHTML="<span>⇩</span> Export PDF";button.disabled=!pages.length;}
  });
  // Minimal PDF 1.4 writer: embeds each page as a JPEG XObject. No PDF service/library/network.
  function makePdf(items){
    const enc=new TextEncoder();const objects=[];const pageIds=[];
    const add=(bytes)=>{objects.push(bytes instanceof Uint8Array?bytes:enc.encode(bytes));return objects.length;};
    add("<< /Type /Catalog /Pages 2 0 R >>");
    add(""); // Pages object replaced after page IDs are known
    items.forEach((item)=>{
      const raw=atob(item.dataUrl.split(",")[1]), jpg=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)jpg[i]=raw.charCodeAt(i);
      const imgId=objects.length+1;
      const imgHeader=enc.encode(`<< /Type /XObject /Subtype /Image /Width ${item.w} /Height ${item.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);
      const imgFooter=enc.encode("\nendstream");
      const imgObj=concat([enc.encode(`${imgId} 0 obj\n`),imgHeader,jpg,imgFooter,enc.encode("\nendobj\n")]);objects.push(imgObj);
      const pageId=objects.length+1, contentId=pageId+1;pageIds.push(pageId);
      const pageW=595.28,pageH=841.89,scale=Math.min(pageW/item.w,pageH/item.h),w=item.w*scale,h=item.h*scale,x=(pageW-w)/2,y=(pageH-h)/2;
      add(`${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${pageIds.length} ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`);
      const stream=`q\n${w} 0 0 ${h} ${x} ${y} cm\n/Im${pageIds.length} Do\nQ\n`;
      add(`${contentId} 0 obj\n<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}endstream\nendobj\n`);
    });
    objects[1]=enc.encode(`2 0 obj\n<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>\nendobj\n`);
    let parts=[enc.encode("%PDF-1.4\n%GlassScan\n")],offset=parts[0].length,offsets=[0];
    objects.forEach((obj,i)=>{offsets.push(offset);const prefix=enc.encode(`${i+1} 0 obj\n`);const suffix=enc.encode("\nendobj\n");parts.push(prefix,obj,suffix);offset+=prefix.length+obj.length+suffix.length;});
    const xrefOffset=offset;let xref=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;for(let i=1;i<offsets.length;i++)xref+=`${String(offsets[i]).padStart(10,"0")} 00000 n \n`;
    xref+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    parts.push(enc.encode(xref));return concat(parts);
  }
  function concat(arr){const total=arr.reduce((n,a)=>n+a.length,0),out=new Uint8Array(total);let pos=0;for(const a of arr){out.set(a,pos);pos+=a.length;}return out;}
  if("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }
  updateCounters();
})();