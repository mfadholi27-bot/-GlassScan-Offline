(()=>{
const $=id=>document.getElementById(id);const canvas=$('previewCanvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});let pages=[],active=-1,filter='original',stream=null,raf=0,facing='environment',guideOn=true,toastTimer,cropImage=null,cropQuad=[],cropLayout=null,dragCorner=-1,loupePointer=null;
const toast=m=>{const e=$('toast');e.textContent=m;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),2800)};
$('cameraBtn').onclick=startCamera;$('importBtn').onclick=()=>$('importInput').click();$('cameraInput').onchange=e=>loadFiles(e.target.files);$('importInput').onchange=e=>loadFiles(e.target.files);$('helpBtn').onclick=()=>$('helpDialog').showModal();$('closeHelp').onclick=()=>$('helpDialog').close();$('closeCamera').onclick=stopCamera;
$('switchCamera').onclick=async()=>{facing=facing==='environment'?'user':'environment';await stopCamera(false);startCamera()};$('captureBtn').onclick=capture;
$('autoBtn').onclick=()=>{guideOn=!guideOn;$('fixedScanFrame').hidden=!guideOn;$('autoBtn').textContent=`Bingkai: ${guideOn?'ON':'OFF'}`;$('autoBtn').classList.toggle('on',guideOn);toast(guideOn?'Bingkai panduan ditampilkan':'Bingkai panduan disembunyikan')};
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));syncEffectPanel();render()});
const effectStrengths={magic:100,bw:100,gray:100,enhance:100,shadow:100};
function ensureEffectPanel(){if($('effectControlPanel'))return;const panel=document.createElement('section');panel.id='effectControlPanel';panel.className='effect-control glass';panel.innerHTML='<div class="effect-control-head"><div><small>EFEK AKTIF</small><strong id="effectName">Magic Color</strong></div><output id="effectValue">100%</output></div><div class="effect-slider-row"><button type="button" id="effectMinus" aria-label="Kurangi intensitas">−</button><input id="effectStrength" type="range" min="0" max="100" step="1" value="100" aria-label="Intensitas efek"><button type="button" id="effectPlus" aria-label="Tambah intensitas">+</button></div><div class="effect-scale"><span>Lembut</span><span>Kuat</span></div><p>Atur kekuatan setiap efek secara terpisah. Nilai tersimpan selama halaman ini terbuka.</p>';document.querySelector('.filters').insertAdjacentElement('afterend',panel);$('effectStrength').addEventListener('input',e=>{effectStrengths[filter]=Number(e.target.value);syncEffectPanel();render()});$('effectMinus').onclick=()=>setEffectStrength(-10);$('effectPlus').onclick=()=>setEffectStrength(10);syncEffectPanel()}
function setEffectStrength(delta){if(filter==='original')return;effectStrengths[filter]=Math.max(0,Math.min(100,(effectStrengths[filter]??100)+delta));syncEffectPanel();render()}
function syncEffectPanel(){const panel=$('effectControlPanel');if(!panel)return;const names={original:'Asli (tanpa efek)',magic:'Magic Color',bw:'Hitam putih',gray:'Grayscale',enhance:'Teks tajam',shadow:'Kurangi bayangan'};const value=filter==='original'?0:(effectStrengths[filter]??100);$('effectName').textContent=names[filter]||filter;$('effectValue').textContent=value+'%';$('effectStrength').value=value;$('effectStrength').disabled=filter==='original';$('effectMinus').disabled=filter==='original'||value===0;$('effectPlus').disabled=filter==='original'||value===100}
$('correctBtn').onclick=openCropEditor;$('cropClose').onclick=()=> $('cropDialog').close();$('cropAuto').onclick=()=>{if(!cropImage)return;const q=detectQuad(cropImage);if(q){cropQuad=q;drawCropEditor();toast('Perkiraan sudut dimuat. Periksa dan geser titik ke tepi kertas.')}else toast('Deteksi otomatis belum yakin. Geser empat titik secara manual.')};$('cropReset').onclick=()=>{if(cropImage){cropQuad=defaultQuad(cropImage);drawCropEditor()}};$('cropApply').onclick=applyCropEditor;
$('deleteBtn').onclick=()=>{if(active<0)return;pages.splice(active,1);active=pages.length?Math.min(active,pages.length-1):-1;render();counts();toast('Halaman dihapus')};$('rotateBtn').onclick=()=>{if(active<0)return;pages[active].rotation=(pages[active].rotation+90)%360;render();toast('Halaman diputar')};$('saveJpgBtn').onclick=()=>active>=0&&exportJpg(active);$('exportAllJpg').onclick=()=>{pages.forEach((_,i)=>setTimeout(()=>exportJpg(i),i*400));toast('Menyiapkan file JPG satu per satu')};$('exportPdf').onclick=exportPdf;
const readFile=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
async function loadFiles(list){const fs=[...(list||[])].filter(f=>f.type.startsWith('image/'));for(const f of fs){try{const im=await loadImage(await readFile(f)),c=document.createElement('canvas'),s=Math.min(1,2600/Math.max(im.naturalWidth,im.naturalHeight));c.width=Math.round(im.naturalWidth*s);c.height=Math.round(im.naturalHeight*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);pages.push({data:c.toDataURL('image/jpeg',.96),name:f.name||`scan-${pages.length+1}.jpg`,rotation:0})}catch(e){toast('Gagal membaca gambar')}}if(fs.length){active=pages.length-1;filter='original';syncFilter();render();counts();toast(`${fs.length} gambar ditambahkan. Tekan Deteksi sudut & crop.`)}$('cameraInput').value='';$('importInput').value=''}
async function startCamera(){if(!navigator.mediaDevices?.getUserMedia){toast('Live camera perlu HTTPS. Gunakan impor gambar.');$('cameraInput').click();return}try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1920},height:{ideal:2560}},audio:false});const v=$('video');v.srcObject=stream;await v.play();$('cameraPanel').hidden=false;$('cameraPlaceholder').hidden=true;drawLive();toast('Kamera aktif — arahkan dokumen ke dalam bingkai tetap.')}catch(e){console.warn(e);toast('Izin kamera ditolak/tidak tersedia. Gunakan Impor gambar.');$('cameraInput').click()}}
async function stopCamera(hide=true){cancelAnimationFrame(raf);if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}$('video').srcObject=null;if(hide)$('cameraPanel').hidden=true}
async function openCropEditor(){if(active<0)return;try{cropImage=await loadImage(pages[active].data);let q=null;try{q=detectQuad(cropImage)}catch(e){}cropQuad=validQuad(q,cropImage)?q:defaultQuad(cropImage);drawCropEditor();$('cropDialog').showModal()}catch(e){toast('Gagal membuka editor crop')}}
function validQuad(q,im){if(!q||q.length!==4)return false;const w=im.naturalWidth,h=im.naturalHeight;return q.every(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&p[0]>=0&&p[1]>=0&&p[0]<w&&p[1]<h)}
function defaultQuad(im){const w=im.naturalWidth,h=im.naturalHeight,mx=w*.07,my=h*.07;return [[mx,my],[w-mx,my],[w-mx,h-my],[mx,h-my]]}
function drawCropEditor(){
 const c=$('cropCanvas'),r=c.getBoundingClientRect(),width=Math.max(280,r.width||300),height=Math.min(520,width*(cropImage.naturalHeight/cropImage.naturalWidth));
 c.width=Math.round(width*devicePixelRatio);c.height=Math.round(height*devicePixelRatio);c.style.height=height+'px';
 const g=c.getContext('2d');g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);g.clearRect(0,0,width,height);
 const scale=Math.min(width/cropImage.naturalWidth,height/cropImage.naturalHeight),iw=cropImage.naturalWidth*scale,ih=cropImage.naturalHeight*scale,ox=(width-iw)/2,oy=(height-ih)/2;
 g.fillStyle='#030914';g.fillRect(0,0,width,height);g.drawImage(cropImage,ox,oy,iw,ih);cropLayout={scale,ox,oy,width,height};
 const pts=cropQuad.map(p=>[ox+p[0]*scale,oy+p[1]*scale]);
 g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fillStyle='rgba(66,238,190,.13)';g.fill();g.strokeStyle='#5ef3c2';g.lineWidth=2.5;g.stroke();
 pts.forEach((p,i)=>{g.beginPath();g.arc(p[0],p[1],12,0,Math.PI*2);g.fillStyle='#f4fffb';g.fill();g.strokeStyle='#13c99b';g.lineWidth=3;g.stroke();g.fillStyle='#092b28';g.font='bold 10px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(i+1),p[0],p[1])});
 // Loupe magnifier: display a zoomed crop above the finger so the touch never hides the target point.
 if(dragCorner>=0 && loupePointer && cropImage){
   const p=cropQuad[dragCorner],cx=p[0],cy=p[1],radius=48,zoom=3.2;
   let lx=Math.max(radius+8,Math.min(width-radius-8,loupePointer[0]));
   let ly=loupePointer[1]>height*.48?radius+12:height-radius-12;
   // Keep the loupe away from the active corner when possible.
   if(Math.hypot(lx-loupePointer[0],ly-loupePointer[1])<85) ly=ly<height/2?height-radius-12:radius+12;
   g.save();g.beginPath();g.arc(lx,ly,radius,0,Math.PI*2);g.clip();
   g.fillStyle='#06111e';g.fillRect(lx-radius,ly-radius,radius*2,radius*2);
   const srcR=radius/(zoom*scale);
   const sx=Math.max(0,Math.min(cropImage.naturalWidth-2*srcR,cx-srcR));
   const sy=Math.max(0,Math.min(cropImage.naturalHeight-2*srcR,cy-srcR));
   g.drawImage(cropImage,sx,sy,2*srcR,2*srcR,lx-radius,ly-radius,radius*2,radius*2);
   g.restore();
   g.beginPath();g.arc(lx,ly,radius,0,Math.PI*2);g.strokeStyle='#e9fff8';g.lineWidth=3;g.stroke();
   g.beginPath();g.moveTo(lx-radius*.28,ly);g.lineTo(lx+radius*.28,ly);g.moveTo(lx,ly-radius*.28);g.lineTo(lx,ly+radius*.28);g.strokeStyle='#ffcf62';g.lineWidth=1.5;g.stroke();
   g.fillStyle='#05111d';g.fillRect(lx-31,ly+radius+3,62,15);g.fillStyle='#a9f6de';g.font='bold 9px sans-serif';g.textAlign='center';g.fillText('ZOOM 3.2×',lx,ly+radius+11);
 }
}
function cropPointer(e){const c=$('cropCanvas'),r=c.getBoundingClientRect(),L=cropLayout;if(!L||!r.width||!r.height)return [0,0];return [(e.clientX-r.left)*(L.width/r.width),(e.clientY-r.top)*(L.height/r.height)]}
$('cropCanvas').addEventListener('pointerdown',e=>{if(!cropLayout)return;const [x,y]=cropPointer(e);let best=Infinity,idx=-1;cropQuad.forEach((p,i)=>{const px=cropLayout.ox+p[0]*cropLayout.scale,py=cropLayout.oy+p[1]*cropLayout.scale,d=Math.hypot(px-x,py-y);if(d<best){best=d;idx=i}});if(best<35){dragCorner=idx;loupePointer=[x,y];drawCropEditor();$('cropCanvas').setPointerCapture(e.pointerId);e.preventDefault()}});
$('cropCanvas').addEventListener('pointermove',e=>{if(dragCorner<0||!cropLayout)return;const [x,y]=cropPointer(e),L=cropLayout;loupePointer=[x,y];cropQuad[dragCorner]=[Math.max(0,Math.min(cropImage.naturalWidth,(x-L.ox)/L.scale)),Math.max(0,Math.min(cropImage.naturalHeight,(y-L.oy)/L.scale))];drawCropEditor();e.preventDefault()});
$('cropCanvas').addEventListener('pointerup',()=>{dragCorner=-1;loupePointer=null;drawCropEditor()});$('cropCanvas').addEventListener('pointercancel',()=>{dragCorner=-1;loupePointer=null;drawCropEditor()});
async function applyCropEditor(){if(!cropImage||!validQuad(cropQuad,cropImage)){toast('Periksa kembali posisi empat sudut');return}try{const area=Math.abs(cropQuad.reduce((s,p,i)=>s+p[0]*cropQuad[(i+1)%4][1]-p[1]*cropQuad[(i+1)%4][0],0)/2);if(area<cropImage.naturalWidth*cropImage.naturalHeight*.02){toast('Sudut terlalu berdekatan. Atur ulang.');return}const warped=perspectiveWarp(cropImage,cropQuad);pages[active].data=warped;pages[active].rotation=0;$('cropDialog').close();render();toast('Crop dan koreksi perspektif diterapkan') }catch(e){console.error(e);toast('Crop gagal. Coba atur ulang sudut')}}

function detectQuadHeuristic(source){
  const w=source.videoWidth||source.naturalWidth||source.width;
  const h=source.videoHeight||source.naturalHeight||source.height;
  if(!w||!h)return null;
  const sw=320,sh=Math.max(180,Math.round(sw*h/w));
  const c=document.createElement('canvas');c.width=sw;c.height=sh;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0,sw,sh);
  const raw=g.getImageData(0,0,sw,sh).data, n=sw*sh, gray=new Float32Array(n);
  for(let i=0,p=0;i<raw.length;i+=4,p++)gray[p]=.299*raw[i]+.587*raw[i+1]+.114*raw[i+2];
  // Smooth a little to reduce sensor noise, then calculate Sobel-like edge strength.
  const sm=new Float32Array(n);
  for(let y=1;y<sh-1;y++)for(let x=1;x<sw-1;x++){
    const p=y*sw+x;sm[p]=(gray[p]+gray[p-1]+gray[p+1]+gray[p-sw]+gray[p+sw])/5;
  }
  const mag=new Float32Array(n),ori=new Float32Array(n);let vals=[];
  for(let y=2;y<sh-2;y++)for(let x=2;x<sw-2;x++){
    const p=y*sw+x;
    const gx=-sm[p-sw-1]+sm[p-sw+1]-2*sm[p-1]+2*sm[p+1]-sm[p+sw-1]+sm[p+sw+1];
    const gy=-sm[p-sw-1]-2*sm[p-sw]-sm[p-sw+1]+sm[p+sw-1]+2*sm[p+sw]+sm[p+sw+1];
    const m=Math.hypot(gx,gy);mag[p]=m;ori[p]=Math.atan2(gy,gx);
    if(m>45)vals.push(m);
  }
  if(vals.length<100)return null;
  vals.sort((a,b)=>a-b);const threshold=Math.max(38,vals[Math.floor(vals.length*.62)]||45);
  // Find a plausible four-sided paper by searching high-edge points in broad corner regions.
  // Scores combine edge strength, distance from the image centre, and a weak paper-brightness prior.
  const cx=sw/2,cy=sh/2,marginX=sw*.025,marginY=sh*.025;
  const regions=[
    (x,y)=>x<cx&&y<cy, (x,y)=>x>=cx&&y<cy,
    (x,y)=>x>=cx&&y>=cy, (x,y)=>x<cx&&y>=cy
  ];
  const pts=[];
  for(let r=0;r<4;r++){
    let best=-Infinity,bp=null;
    for(let y=3;y<sh-3;y+=1)for(let x=3;x<sw-3;x+=1){
      if(!regions[r](x,y)||x<marginX||x>sw-marginX||y<marginY||y>sh-marginY)continue;
      const p=y*sw+x,m=mag[p];if(m<threshold)continue;
      // Favor candidate corners toward the corresponding image quadrant's outer direction,
      // but avoid pinning to frame edges.
      const cornerDist=Math.hypot(x-(r===0||r===3?sw*.12:sw*.88),y-(r<2?sh*.12:sh*.88));
      const centreDist=Math.hypot(x-cx,y-cy);
      const score=m*.75+centreDist*.16-cornerDist*.12;
      if(score>best){best=score;bp=[x,y,m]}
    }
    if(!bp)return null;pts.push([bp[0],bp[1],bp[2]]);
  }
  // Refine each corner using a local edge-weighted centroid to avoid unstable single-pixel peaks.
  const q=pts.map(([x,y])=>{
    let sx=0,sy=0,swgt=0;
    for(let yy=Math.max(2,y-9);yy<=Math.min(sh-3,y+9);yy++)for(let xx=Math.max(2,x-9);xx<=Math.min(sw-3,x+9);xx++){
      const p=yy*sw+xx,m=mag[p];if(m<threshold)continue;
      const d=Math.hypot(xx-x,yy-y),wt=m*Math.exp(-(d*d)/50);
      sx+=xx*wt;sy+=yy*wt;swgt+=wt;
    }
    return swgt? [sx/swgt*w/sw,sy/swgt*h/sh]:[x*w/sw,y*h/sh];
  });
  const area=Math.abs(q.reduce((s,p,i)=>s+p[0]*q[(i+1)%4][1]-p[1]*q[(i+1)%4][0],0)/2);
  const full=w*h;
  if(area<full*.06||area>full*.98)return null;
  // Reject self-crossing or degenerate quadrilaterals.
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);
  const cs=q.map((p,i)=>cross(p,q[(i+1)%4],q[(i+2)%4]));
  if(cs.some(v=>Math.abs(v)<1)||!(cs.every(v=>v>0)||cs.every(v=>v<0)))return null;
  return q;
}


function orderQuad(points){
 if(!Array.isArray(points)||points.length!==4||points.some(p=>!p||!Number.isFinite(p[0])||!Number.isFinite(p[1])))return null;
 const cx=points.reduce((s,p)=>s+p[0],0)/4,cy=points.reduce((s,p)=>s+p[1],0)/4;
 // In canvas coordinates, ascending angle around the centroid yields a consistent perimeter order.
 const ring=points.map(p=>[p[0],p[1]]).sort((a,b)=>Math.atan2(a[1]-cy,a[0]-cx)-Math.atan2(b[1]-cy,b[0]-cx));
 // Start at the point nearest the top-left diagonal; then keep perimeter order.
 let first=0,best=Infinity;
 ring.forEach((p,i)=>{const s=p[0]+p[1];if(s<best){best=s;first=i}});
 let q=ring.slice(first).concat(ring.slice(0,first));
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);
 const cs=q.map((p,i)=>cross(p,q[(i+1)%4],q[(i+2)%4]));
 if(cs.some(v=>Math.abs(v)<1)||!(cs.every(v=>v>0)||cs.every(v=>v<0)))return null;
 // Ensure the first edge generally heads rightwards; otherwise reverse perimeter direction.
 if(q[1][0]<q[3][0])q=[q[0],q[3],q[2],q[1]];
 return q;
}
function detectQuadOpenCV(source){
  if(!window.cv || !cv.Mat || !cv.findContours || !cv.Canny) return null;
  let src=null,gray=null,blur=null,edges=null,contours=null,hierarchy=null;
  try{
    const w=source.videoWidth||source.naturalWidth||source.width,h=source.videoHeight||source.naturalHeight||source.height;
    if(!w||!h)return null;
    const sw=480,sh=Math.max(240,Math.round(sw*h/w)),c=document.createElement('canvas');c.width=sw;c.height=sh;
    c.getContext('2d',{willReadFrequently:true}).drawImage(source,0,0,sw,sh);
    src=cv.imread(c);gray=new cv.Mat();blur=new cv.Mat();edges=new cv.Mat();
    cv.cvtColor(src,gray,cv.COLOR_RGBA2GRAY);cv.GaussianBlur(gray,blur,new cv.Size(5,5),0,0,cv.BORDER_DEFAULT);cv.Canny(blur,edges,45,135);
    const kernel=cv.getStructuringElement(cv.MORPH_RECT,new cv.Size(3,3));cv.dilate(edges,edges,kernel);kernel.delete();
    contours=new cv.MatVector();hierarchy=new cv.Mat();cv.findContours(edges,contours,hierarchy,cv.RETR_LIST,cv.CHAIN_APPROX_SIMPLE);
    const frameArea=sw*sh,center=[sw/2,sh/2],dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);let best=null,bestScore=-Infinity;
    for(let i=0;i<contours.size();i++){
      const cnt=contours.get(i),peri=cv.arcLength(cnt,true),area=Math.abs(cv.contourArea(cnt));
      if(area<frameArea*.07||area>frameArea*.88){cnt.delete();continue}
      for(const eps of [.012,.018,.024,.032]){
        const approx=new cv.Mat();cv.approxPolyDP(cnt,approx,eps*peri,true);
        if(approx.rows===4&&cv.isContourConvex(approx)){
          const raw=[];for(let j=0;j<4;j++)raw.push([approx.intAt(j,0),approx.intAt(j,1)]);
          const q=orderQuad(raw);
          if(q){
            const s=q.map((p,j)=>dist(p,q[(j+1)%4])),wq=(s[0]+s[2])/2,hq=(s[1]+s[3])/2,aspect=Math.min(wq,hq)/Math.max(wq,hq);
            const parallel=(Math.min(s[0],s[2])/Math.max(s[0],s[2]))*(Math.min(s[1],s[3])/Math.max(s[1],s[3]));
            const cx=q.reduce((v,p)=>v+p[0],0)/4,cy=q.reduce((v,p)=>v+p[1],0)/4,centerPenalty=Math.min(1,Math.hypot(cx-center[0],cy-center[1])/Math.hypot(center[0],center[1]));
            if(aspect>=.24&&parallel>.30){
              const ratio=area/frameArea,areaPreference=1-Math.min(1,Math.abs(ratio-.34)/.55);
              const score=areaPreference*2+parallel*1.8+(1-centerPenalty)*.65-Math.abs(aspect-.68)*.35;
              if(score>bestScore){bestScore=score;best=q.map(p=>[p[0]*w/sw,p[1]*h/sh])}
            }
          }
        }
        approx.delete();
      }
      cnt.delete();
    }
    return best;
  }catch(e){console.warn('OpenCV detect failed',e);return null}
  finally{[src,gray,blur,edges,contours,hierarchy].forEach(m=>{try{if(m)m.delete()}catch(e){}})}
}
function detectQuad(source){
  // OpenCV contour detection first. Use heuristic fallback only when OpenCV is not ready
  // or no valid four-corner contour is found.
  const cvQuad=detectQuadOpenCV(source);
  return cvQuad || detectQuadHeuristic(source);
}

function drawLive(){
 const v=$('video'),c=$('edgeCanvas'),g=c.getContext('2d');
 if(!stream)return;
 if(v.videoWidth&&v.videoHeight){
  const rect=v.getBoundingClientRect(),vw=rect.width,vh=rect.height,dpr=devicePixelRatio||1;
  if(c.width!==Math.round(vw*dpr)||c.height!==Math.round(vh*dpr)){c.width=Math.round(vw*dpr);c.height=Math.round(vh*dpr)}
  g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,vw,vh);
  $('detectStatus').textContent='ARAHKAN DOKUMEN KE DALAM BINGKAI';
  $('detectStatus').style.color='#7fffc6';
  document.querySelector('.hud-dot').style.background='#53efb8';
 }
 raf=requestAnimationFrame(drawLive)
}
function capture(){
 const v=$('video'),stage=$('video').closest('.camera-stage'),frame=$('fixedScanFrame');
 if(!stream||!v.videoWidth||!stage||!frame){toast('Kamera belum siap');return}
 // Map the visible fixed guide rectangle back into source-video coordinates.
 // The video uses object-fit:cover, so account for the cropped sides/top.
 const sr=stage.getBoundingClientRect(),fr=frame.getBoundingClientRect();
 const scale=Math.max(sr.width/v.videoWidth,sr.height/v.videoHeight);
 const renderedW=v.videoWidth*scale,renderedH=v.videoHeight*scale;
 const offX=(renderedW-sr.width)/2,offY=(renderedH-sr.height)/2;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 let sx=(fr.left-sr.left+offX)/scale,sy=(fr.top-sr.top+offY)/scale;
 let ex=(fr.right-sr.left+offX)/scale,ey=(fr.bottom-sr.top+offY)/scale;
 sx=clamp(sx,0,v.videoWidth-1);sy=clamp(sy,0,v.videoHeight-1);
 ex=clamp(ex,sx+1,v.videoWidth);ey=clamp(ey,sy+1,v.videoHeight);
 const sw=ex-sx,sh=ey-sy,down=Math.min(1,2600/Math.max(sw,sh));
 const c=document.createElement('canvas');c.width=Math.max(1,Math.round(sw*down));c.height=Math.max(1,Math.round(sh*down));
 c.getContext('2d').drawImage(v,sx,sy,sw,sh,0,0,c.width,c.height);
 let output=c,autoStraightened=false;
 // Search for a plausible document contour only inside the guide crop.
 try{
  const q=detectQuadOpenCV(c);
  if(q&&q.length===4){
   const area=Math.abs(q.reduce((sum,p,i)=>sum+p[0]*q[(i+1)%4][1]-p[1]*q[(i+1)%4][0],0)/2);
   const xs=q.map(p=>p[0]),ys=q.map(p=>p[1]);
   const bw=Math.max(...xs)-Math.min(...xs),bh=Math.max(...ys)-Math.min(...ys);
   const ratio=bw/Math.max(1,bh),areaRatio=area/(c.width*c.height),margin=.015;
   const inside=q.every(p=>p[0]>=c.width*margin&&p[0]<=c.width*(1-margin)&&p[1]>=c.height*margin&&p[1]<=c.height*(1-margin));
   if(inside&&areaRatio>.36&&areaRatio<.94&&ratio>.34&&ratio<.98){
    const warped=perspectiveWarp(c,q);
    if(warped&&warped.width>100&&warped.height>100){output=warped;autoStraightened=true}
   }
  }
 }catch(e){console.warn('Auto perspective correction skipped',e)}
 const data=typeof output==='string'?output:output.toDataURL('image/jpeg',.97);
 pages.push({data,name:'GlassScan_'+new Date().toISOString().replace(/[:.]/g,'-')+'.jpg',rotation:0});
 active=pages.length-1;filter='magic';syncFilter();render();counts();
 toast(autoStraightened?'Foto langsung dipotong, diluruskan, dan Magic Color diterapkan.':'Foto langsung dipotong mengikuti bingkai dan Magic Color diterapkan. Sudut buku belum cukup meyakinkan untuk diluruskan otomatis; gunakan Deteksi sudut & crop bila perlu.')
}
// Solve 8-parameter homography from destination points to source points.
function solve(A,b){for(let i=0;i<8;i++){let max=i;for(let r=i+1;r<8;r++)if(Math.abs(A[r][i])>Math.abs(A[max][i]))max=r;[A[i],A[max]]=[A[max],A[i]];[b[i],b[max]]=[b[max],b[i]];let v=A[i][i];if(Math.abs(v)<1e-9)throw Error('singular');for(let j=i;j<8;j++)A[i][j]/=v;b[i]/=v;for(let r=0;r<8;r++)if(r!==i){v=A[r][i];for(let j=i;j<8;j++)A[r][j]-=v*A[i][j];b[r]-=v*b[i]}}return b}
function perspectiveWarp(src,q){const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);const W=Math.max(1,Math.round(Math.max(dist(q[0],q[1]),dist(q[3],q[2])))),H=Math.max(1,Math.round(Math.max(dist(q[0],q[3]),dist(q[1],q[2]))));const sw=src.videoWidth||src.naturalWidth||src.width,sh=src.videoHeight||src.naturalHeight||src.height;const dst=[[0,0],[W-1,0],[W-1,H-1],[0,H-1]],A=[],b=[];for(let i=0;i<4;i++){const [x,y]=dst[i],[u,v]=q[i];A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v)}const h=solve(A,b),out=document.createElement('canvas');const scale=Math.min(1,2600/Math.max(W,H));out.width=Math.max(1,Math.round(W*scale));out.height=Math.max(1,Math.round(H*scale));const oc=out.getContext('2d',{willReadFrequently:true});oc.drawImage(src,0,0,sw,sh);const im=oc.getImageData(0,0,out.width,out.height),srcData=im.data;const input=document.createElement('canvas');input.width=sw;input.height=sh;const ix=input.getContext('2d',{willReadFrequently:true});ix.drawImage(src,0,0,sw,sh);const id=ix.getImageData(0,0,sw,sh).data;for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++){const X=x/scale,Y=y/scale,den=h[6]*X+h[7]*Y+1,u=(h[0]*X+h[1]*Y+h[2])/den,v=(h[3]*X+h[4]*Y+h[5])/den,tx=(y*out.width+x)*4;if(u<0||v<0||u>=sw-1||v>=sh-1){srcData[tx]=srcData[tx+1]=srcData[tx+2]=255;srcData[tx+3]=255;continue}const x0=Math.floor(u),y0=Math.floor(v),fx=u-x0,fy=v-y0;for(let ch=0;ch<3;ch++){const a=id[(y0*sw+x0)*4+ch],bb=id[(y0*sw+x0+1)*4+ch],cc=id[((y0+1)*sw+x0)*4+ch],dd=id[((y0+1)*sw+x0+1)*4+ch];srcData[tx+ch]=(a*(1-fx)+bb*fx)*(1-fy)+(cc*(1-fx)+dd*fx)*fy}srcData[tx+3]=255}oc.putImageData(im,0,0);return out.toDataURL('image/jpeg',.97)}
function syncFilter(){document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter))}function analyzeDocumentQuality(source){
 const w=source.naturalWidth||source.videoWidth||source.width,h=source.naturalHeight||source.videoHeight||source.height;
 if(!w||!h)return {score:0,blur:0,brightness:0,dark:0,glare:0,tips:['Gambar belum siap dianalisis.']};
 const sw=240,sh=Math.max(120,Math.round(sw*h/w)),c=document.createElement('canvas');c.width=sw;c.height=sh;
 const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0,sw,sh);
 const data=g.getImageData(0,0,sw,sh).data,n=sw*sh,gray=new Float32Array(n);let sum=0,dark=0,glare=0;
 for(let i=0,p=0;i<data.length;i+=4,p++){const y=.299*data[i]+.587*data[i+1]+.114*data[i+2];gray[p]=y;sum+=y;if(y<45)dark++;if(y>248)glare++}
 const brightness=sum/n;let lapSum=0,lapSq=0,count=0;
 for(let y=1;y<sh-1;y++)for(let x=1;x<sw-1;x++){const p=y*sw+x,l=gray[p-1]+gray[p+1]+gray[p-sw]+gray[p+sw]-4*gray[p];lapSum+=l;lapSq+=l*l;count++}
 const mean=lapSum/(count||1),blur=Math.max(0,lapSq/(count||1)-mean*mean);
 const tips=[];
 if(blur<110)tips.push('Foto mungkin buram; dekatkan kamera dan tahan tangan tetap.');
 if(brightness<78)tips.push('Dokumen terlalu gelap; tambah cahaya tanpa membuat pantulan.');
 if(brightness>220||glare/n>.12)tips.push('Ada area terlalu terang; ubah sudut terhadap lampu.');
 if(dark/n>.30)tips.push('Banyak area gelap; pastikan latar dan bayangan tidak menutupi teks.');
 if(!tips.length)tips.push('Indikator dasar terlihat cukup baik. Periksa teks, tepi, dan detail kecil secara manual.');
 const blurScore=Math.max(0,Math.min(100,(blur/500)*100));
 const lightScore=Math.max(0,100-Math.abs(brightness-155)*.72-(glare/n)*180-(dark/n)*80);
 const score=Math.round(Math.max(0,Math.min(100,blurScore*.55+lightScore*.45)));
 return {score,blur:Math.round(blur),brightness:Math.round(brightness),dark:Math.round(dark/n*100),glare:Math.round(glare/n*100),tips};
}
function showQualityPanel(metrics){
 let panel=document.getElementById('gsQualityPanel');
 if(!panel){panel=document.createElement('section');panel.id='gsQualityPanel';panel.style.cssText='margin:12px 0;padding:12px 14px;border:1px solid #ffffff20;border-radius:14px;background:#0c1b2b;color:#eaf4ff;font-size:12px;line-height:1.55';const anchor=$('previewActions');anchor.insertAdjacentElement('afterend',panel)}
 panel.hidden=false;panel.replaceChildren();
 const head=document.createElement('div');head.style.cssText='display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap';
 const title=document.createElement('strong');title.textContent='Pemeriksaan kualitas foto (indikatif)';
 const score=document.createElement('span');score.textContent='Skor indikatif '+metrics.score+'/100';score.style.cssText='font-weight:700;color:'+(metrics.score>=70?'#8df5c8':metrics.score>=45?'#ffe09a':'#ffaaa8');
 head.append(title,score);panel.appendChild(head);
 const detail=document.createElement('div');detail.style.cssText='margin-top:5px;color:#b7c9df';detail.textContent='Ketajaman: '+metrics.blur+' · Terang: '+metrics.brightness+'/255 · Area gelap: '+metrics.dark+'% · Sorotan terang: '+metrics.glare+'%';panel.appendChild(detail);
 const list=document.createElement('ul');list.style.cssText='margin:7px 0 0;padding-left:18px';
 metrics.tips.forEach(t=>{const li=document.createElement('li');li.textContent=t;list.appendChild(li)});panel.appendChild(list);
 const note=document.createElement('div');note.style.cssText='margin-top:6px;color:#91a7c1';note.textContent='Ini pemeriksaan heuristik, bukan jaminan mutu atau pengganti pemeriksaan visual.';panel.appendChild(note);
}
async function render(){const has=active>=0&&pages[active];$('emptyState').hidden=!!has;$('previewWrap').hidden=!has;$('previewActions').hidden=!has;$('exportPdf').disabled=!pages.length;$('exportAllJpg').disabled=!pages.length;if(!has){$('previewTitle').textContent='Belum ada dokumen';$('thumbs').innerHTML='';const qp=document.getElementById('gsQualityPanel');if(qp)qp.hidden=true;return}const img=await loadImage(pages[active].data),rot=pages[active].rotation||0,sw=img.naturalWidth,sh=img.naturalHeight;canvas.width=rot%180?sh:sw;canvas.height=rot%180?sw:sh;ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(rot*Math.PI/180);ctx.drawImage(img,-sw/2,-sh/2);ctx.restore();const quality=analyzeDocumentQuality(canvas);showQualityPanel(quality);if(filter!=='original')applyFilter(ctx,canvas.width,canvas.height,filter);$('previewTitle').textContent=pages[active].name;drawThumbs()}
function applyFilterCore(c,w,h,mode){
 if(mode==='original')return;
 const im=c.getImageData(0,0,w,h),d=im.data,n=w*h;
 if(mode==='gray'){for(let i=0;i<d.length;i+=4){const y=.299*d[i]+.587*d[i+1]+.114*d[i+2];d[i]=d[i+1]=d[i+2]=y}c.putImageData(im,0,0);return}
 if(mode==='bw'){
  const hist=new Uint32Array(256);let sum=0;
  for(let i=0;i<d.length;i+=4){const y=Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2]);hist[y]++;sum+=y}
  let sb=0,wb=0,mx=-1,t=160;
  for(let i=0;i<256;i++){wb+=hist[i];if(!wb)continue;const wf=n-wb;if(!wf)break;sb+=i*hist[i];const v=wb*wf*(sb/wb-(sum-sb)/wf)**2;if(v>mx){mx=v;t=i}}
  for(let i=0;i<d.length;i+=4){const y=.299*d[i]+.587*d[i+1]+.114*d[i+2],v=y>t?255:0;d[i]=d[i+1]=d[i+2]=v}
  c.putImageData(im,0,0);return;
 }
 if(!['enhance','magic','shadow'].includes(mode))return;
 // Low-resolution illumination map + bilinear sampling avoids the blocky bands from
 // nearest-neighbour background correction. Work from the original pixels only.
 const sw=Math.max(12,Math.ceil(w/48)),sh=Math.max(12,Math.ceil(h/48)),small=document.createElement('canvas');
 small.width=sw;small.height=sh;const sc=small.getContext('2d',{willReadFrequently:true});
 sc.drawImage(c,0,0,sw,sh);const sd=sc.getImageData(0,0,sw,sh).data,field=new Float32Array(sw*sh);
 for(let i=0,p=0;i<sd.length;i+=4,p++)field[p]=.299*sd[i]+.587*sd[i+1]+.114*sd[i+2];
 const clamp=v=>Math.max(0,Math.min(255,v));
 for(let y=0;y<h;y++){
  const fy=(y/(h-1||1))*(sh-1),y0=Math.floor(fy),y1=Math.min(sh-1,y0+1),ty=fy-y0;
  for(let x=0;x<w;x++){
   const fx=(x/(w-1||1))*(sw-1),x0=Math.floor(fx),x1=Math.min(sw-1,x0+1),tx=fx-x0;
   const bg=Math.max(35,(field[y0*sw+x0]*(1-tx)+field[y0*sw+x1]*tx)*(1-ty)+(field[y1*sw+x0]*(1-tx)+field[y1*sw+x1]*tx)*ty);
   const i=(y*w+x)*4,r=d[i],g=d[i+1],b=d[i+2],lum=.299*r+.587*g+.114*b;
   if(mode==='shadow'){
    // Divide by the estimated illumination field gently; preserve dark ink instead
    // of multiplying every pixel by a large global gain.
    const target=Math.max(.82,Math.min(1.34,205/bg)),gain=Math.pow(target,.82);
    d[i]=clamp(r*gain);d[i+1]=clamp(g*gain);d[i+2]=clamp(b*gain);
   }else if(mode==='enhance'){
    const gain=1.28,offset=8;d[i]=clamp((r-128)*gain+128+offset);d[i+1]=clamp((g-128)*gain+128+offset);d[i+2]=clamp((b-128)*gain+128+offset);
   }else{
    const corrected=clamp((lum/ bg)*218+14),gain=lum>1?corrected/lum:1;
    const rr=r*gain,gg=g*gain,bb=b*gain,ll=.299*rr+.587*gg+.114*bb;
    d[i]=clamp(ll+(rr-ll)*1.12);d[i+1]=clamp(ll+(gg-ll)*1.12);d[i+2]=clamp(ll+(bb-ll)*1.12);
   }
  }
 }
 // Commit the corrected pixels before generating the blur reference for the unsharp mask.
 c.putImageData(im,0,0);
 // Mild unsharp mask for text clarity, only on the enhanced/magic result. Blend against
 // a small blurred copy so fine text gains edge definition without hard thresholding.
 if(mode==='enhance'||mode==='magic'){
  const blur=document.createElement('canvas');blur.width=w;blur.height=h;
  const bc=blur.getContext('2d',{willReadFrequently:true});
  bc.filter='blur(0.8px)';bc.drawImage(c,0,0,w,h);bc.filter='none';
  const bd=bc.getImageData(0,0,w,h).data;
  for(let i=0;i<d.length;i+=4)for(let ch=0;ch<3;ch++)d[i+ch]=clamp(d[i+ch]+(d[i+ch]-bd[i+ch])*.22);
 }
 c.putImageData(im,0,0);
}
function applyFilter(c,w,h,mode){
 if(mode==='original')return;const strength=Math.max(0,Math.min(100,(effectStrengths[mode]??100)))/100;if(strength<=0)return;const original=c.getImageData(0,0,w,h);applyFilterCore(c,w,h,mode);if(strength>=.999)return;const result=c.getImageData(0,0,w,h),od=original.data,rd=result.data;for(let i=0;i<rd.length;i+=4){rd[i]=od[i]+(rd[i]-od[i])*strength;rd[i+1]=od[i+1]+(rd[i+1]-od[i+1])*strength;rd[i+2]=od[i+2]+(rd[i+2]-od[i+2])*strength}c.putImageData(result,0,0);
}
function drawThumbs(){const box=$('thumbs');box.innerHTML='';pages.forEach((p,i)=>{const b=document.createElement('button');b.className='thumb'+(i===active?' active':'');const tc=document.createElement('canvas'),badge=document.createElement('span');badge.textContent=i+1;b.append(tc,badge);loadImage(p.data).then(img=>{tc.width=img.naturalWidth;tc.height=img.naturalHeight;tc.getContext('2d').drawImage(img,0,0)});b.onclick=()=>{active=i;render()};box.append(b)})}function counts(){$('pageCount').textContent=`${pages.length} halaman`;$('exportPdf').disabled=!pages.length;$('exportAllJpg').disabled=!pages.length}
async function processedData(i,quality=.94){const p=pages[i],img=await loadImage(p.data),rot=p.rotation||0,sw=img.naturalWidth,sh=img.naturalHeight,c=document.createElement('canvas');c.width=rot%180?sh:sw;c.height=rot%180?sw:sh;const x=c.getContext('2d');x.translate(c.width/2,c.height/2);x.rotate(rot*Math.PI/180);x.drawImage(img,-sw/2,-sh/2);if(i===active&&filter!=='original')applyFilter(x,c.width,c.height,filter);return c.toDataURL('image/jpeg',quality)}async function exportJpg(i){let objectUrl='';try{const dataUrl=await processedData(i,.96);if(!dataUrl||!dataUrl.startsWith('data:image/jpeg'))throw new Error('Invalid JPEG data');const blob=await (await fetch(dataUrl)).blob();if(!blob.size||blob.type!=='image/jpeg')throw new Error('Invalid JPEG blob');const filename=(pages[i].name||`GlassScan-${i+1}`).replace(/\.[^.]+$/,'')+'.jpg';const file=new File([blob],filename,{type:'image/jpeg'});if(/iPhone|iPad|iPod/i.test(navigator.userAgent)&&navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:filename});toast('JPG siap dibagikan. Pilih Simpan ke File atau aplikasi tujuan.');return}objectUrl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=objectUrl;a.download=filename;document.body.append(a);a.click();a.remove();if(/iPhone|iPad|iPod/i.test(navigator.userAgent)){setTimeout(()=>{if(!document.hidden){window.open(objectUrl,'_blank','noopener');toast('Jika JPG terbuka, tekan Bagikan lalu Simpan ke File.')}},350)}else toast('JPG berhasil disiapkan untuk disimpan')}catch(e){console.error('JPG export failed',e);toast('JPG gagal disimpan. Coba Bagikan ke File atau kurangi ukuran foto.')}finally{if(objectUrl)setTimeout(()=>URL.revokeObjectURL(objectUrl),60000)}}
async function exportPdf(){if(!pages.length)return;const b=$('exportPdf');b.disabled=true;b.textContent='Menyiapkan…';try{const imgs=[];for(let i=0;i<pages.length;i++){const data=await processedData(i,.92),img=await loadImage(data);imgs.push({data,w:img.naturalWidth,h:img.naturalHeight})}const blob=new Blob([makePdf(imgs)],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='GlassScan-Document.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('PDF dibuat secara lokal')}catch(e){console.error(e);toast('PDF gagal dibuat; coba kurangi halaman')}finally{b.textContent='⇩ Export PDF';b.disabled=!pages.length}}
function makePdf(items){const enc=new TextEncoder(),objs=[];const add=x=>{objs.push(x instanceof Uint8Array?x:enc.encode(x));return objs.length};add('<< /Type /Catalog /Pages 2 0 R >>');add('');const ids=[];items.forEach((it,k)=>{const raw=atob(it.data.split(',')[1]),jpg=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)jpg[i]=raw.charCodeAt(i);const imgId=objs.length+1;objs.push(join([enc.encode(`${imgId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${it.w} /Height ${it.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`),jpg,enc.encode('\nendstream\nendobj\n')]));const pid=objs.length+1,cid=pid+1;ids.push(pid);const pw=595.28,ph=841.89,s=Math.min(pw/it.w,ph/it.h),w=it.w*s,h=it.h*s,x=(pw-w)/2,y=(ph-h)/2;add(`${pid} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im${k+1} ${imgId} 0 R >> >> /Contents ${cid} 0 R >>\nendobj\n`);const st=`q\n${w} 0 0 ${h} ${x} ${y} cm\n/Im${k+1} Do\nQ\n`;add(`${cid} 0 obj\n<< /Length ${enc.encode(st).length} >>\nstream\n${st}endstream\nendobj\n`)});objs[1]=enc.encode(`2 0 obj\n<< /Type /Pages /Kids [${ids.map(i=>i+' 0 R').join(' ')}] /Count ${ids.length} >>\nendobj\n`);let parts=[enc.encode('%PDF-1.4\n%GlassScan\n')],off=parts[0].length,offsets=[0];objs.forEach((o,i)=>{offsets.push(off);const p=enc.encode(`${i+1} 0 obj\n`),s=enc.encode('\nendobj\n');parts.push(p,o,s);off+=p.length+o.length+s.length});const xref=off;let t=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;for(let i=1;i<offsets.length;i++)t+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;t+=`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;parts.push(enc.encode(t));return join(parts)}function join(arr){const n=arr.reduce((a,b)=>a+b.length,0),o=new Uint8Array(n);let p=0;for(const a of arr){o.set(a,p);p+=a.length}return o}
window.addEventListener('resize',()=>{if($('cropDialog').open&&cropImage)drawCropEditor()});
ensureEffectPanel();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});await reg.update();}catch(e){console.warn('[GlassScan] Service worker update failed',e);}});counts();
})();
// OpenCV runtime status: keep the app usable if the library has not loaded; heuristic fallback remains available.
(function monitorOpenCV(){
  const el=document.getElementById('opencvStatus');
  if(!el)return;
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(window.cv && typeof cv.Mat==='function' && typeof cv.findContours==='function'){
      el.innerHTML='<span class="status-dot ready"></span><span>OpenCV.js · mesin deteksi aktif</span>';
      el.classList.add('ready');clearInterval(timer);
    }else if(tries>90){
      el.innerHTML='<span class="status-dot warning"></span><span>OpenCV.js belum siap · mode cadangan aktif</span>';
      el.classList.add('warning');clearInterval(timer);
    }
  },250);
})();
