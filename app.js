(()=>{
const $=id=>document.getElementById(id);const canvas=$('previewCanvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});let pages=[],active=-1,filter='original',stream=null,raf=0,facing='environment',auto=false,stable=0,lastAuto=0,toastTimer,cropImage=null,cropQuad=[],cropLayout=null,dragCorner=-1,loupePointer=null;
const toast=m=>{const e=$('toast');e.textContent=m;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),2800)};
$('cameraBtn').onclick=startCamera;$('importBtn').onclick=()=>$('importInput').click();$('cameraInput').onchange=e=>loadFiles(e.target.files);$('importInput').onchange=e=>loadFiles(e.target.files);$('helpBtn').onclick=()=>$('helpDialog').showModal();$('closeHelp').onclick=()=>$('helpDialog').close();$('closeCamera').onclick=stopCamera;
$('switchCamera').onclick=async()=>{facing=facing==='environment'?'user':'environment';await stopCamera(false);startCamera()};$('captureBtn').onclick=capture;
$('autoBtn').onclick=()=>{auto=!auto;stable=0;$('autoBtn').textContent=`Auto: ${auto?'ON':'OFF'}`;$('autoBtn').classList.toggle('on',auto);toast(auto?'Auto capture aktif':'Auto capture nonaktif')};
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render()});
$('correctBtn').onclick=openCropEditor;$('cropClose').onclick=()=> $('cropDialog').close();$('cropAuto').onclick=()=>{if(!cropImage)return;const q=detectQuad(cropImage);if(q){cropQuad=q;drawCropEditor();toast('Perkiraan sudut dimuat. Periksa dan geser titik ke tepi kertas.')}else toast('Deteksi otomatis belum yakin. Geser empat titik secara manual.')};$('cropReset').onclick=()=>{if(cropImage){cropQuad=defaultQuad(cropImage);drawCropEditor()}};$('cropApply').onclick=applyCropEditor;
$('deleteBtn').onclick=()=>{if(active<0)return;pages.splice(active,1);active=pages.length?Math.min(active,pages.length-1):-1;render();counts();toast('Halaman dihapus')};$('rotateBtn').onclick=()=>{if(active<0)return;pages[active].rotation=(pages[active].rotation+90)%360;render();toast('Halaman diputar')};$('saveJpgBtn').onclick=()=>active>=0&&exportJpg(active);$('exportAllJpg').onclick=()=>{pages.forEach((_,i)=>setTimeout(()=>exportJpg(i),i*400));toast('Menyiapkan file JPG satu per satu')};$('exportPdf').onclick=exportPdf;
const readFile=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
async function loadFiles(list){const fs=[...(list||[])].filter(f=>f.type.startsWith('image/'));for(const f of fs){try{const im=await loadImage(await readFile(f)),c=document.createElement('canvas'),s=Math.min(1,2600/Math.max(im.naturalWidth,im.naturalHeight));c.width=Math.round(im.naturalWidth*s);c.height=Math.round(im.naturalHeight*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);pages.push({data:c.toDataURL('image/jpeg',.96),name:f.name||`scan-${pages.length+1}.jpg`,rotation:0})}catch(e){toast('Gagal membaca gambar')}}if(fs.length){active=pages.length-1;filter='original';syncFilter();render();counts();toast(`${fs.length} gambar ditambahkan. Tekan Deteksi sudut & crop.`)}$('cameraInput').value='';$('importInput').value=''}
async function startCamera(){if(!navigator.mediaDevices?.getUserMedia){toast('Live camera perlu HTTPS. Gunakan impor gambar.');$('cameraInput').click();return}try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1920},height:{ideal:2560}},audio:false});const v=$('video');v.srcObject=stream;await v.play();$('cameraPanel').hidden=false;$('cameraPlaceholder').hidden=true;drawLive();toast('Kamera aktif — bingkai sudut mengikuti perkiraan tepi kertas.')}catch(e){console.warn(e);toast('Izin kamera ditolak/tidak tersedia. Gunakan Impor gambar.');$('cameraInput').click()}}
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
function cropPointer(e){const c=$('cropCanvas'),r=c.getBoundingClientRect();return [(e.clientX-r.left),e.clientY-r.top]}
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
  const sum=points.map(p=>p[0]+p[1]),diff=points.map(p=>p[0]-p[1]);
  const tl=points[sum.indexOf(Math.min(...sum))],br=points[sum.indexOf(Math.max(...sum))],
        tr=points[diff.indexOf(Math.max(...diff))],bl=points[diff.indexOf(Math.min(...diff))];
  const q=[tl,tr,br,bl];
  if(new Set(q.map(p=>p.join(','))).size!==4)return null;
  return q;
}
function detectQuadOpenCV(source){
  if(!window.cv || !cv.Mat || !cv.findContours || !cv.Canny) return null;
  let src=null,gray=null,blur=null,edges=null,contours=null,hierarchy=null,approx=null;
  try{
    const w=source.videoWidth||source.naturalWidth||source.width;
    const h=source.videoHeight||source.naturalHeight||source.height;
    if(!w||!h)return null;
    const sw=480,sh=Math.max(240,Math.round(sw*h/w));
    const c=document.createElement('canvas');c.width=sw;c.height=sh;
    c.getContext('2d',{willReadFrequently:true}).drawImage(source,0,0,sw,sh);
    src=cv.imread(c);gray=new cv.Mat();blur=new cv.Mat();edges=new cv.Mat();
    cv.cvtColor(src,gray,cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray,blur,new cv.Size(5,5),0,0,cv.BORDER_DEFAULT);
    cv.Canny(blur,edges,45,135);
    const kernel=cv.getStructuringElement(cv.MORPH_RECT,new cv.Size(3,3));
    cv.dilate(edges,edges,kernel);kernel.delete();
    contours=new cv.MatVector();hierarchy=new cv.Mat();
    cv.findContours(edges,contours,hierarchy,cv.RETR_LIST,cv.CHAIN_APPROX_SIMPLE);
    let best=null,bestArea=0;
    const frameArea=sw*sh;
    for(let i=0;i<contours.size();i++){
      const cnt=contours.get(i),peri=cv.arcLength(cnt,true);approx=new cv.Mat();
      cv.approxPolyDP(cnt,approx,.02*peri,true);
      if(approx.rows===4 && cv.isContourConvex(approx)){
        const area=Math.abs(cv.contourArea(approx));
        if(area>frameArea*.07 && area<frameArea*.97 && area>bestArea){
          const pts=[];for(let j=0;j<4;j++)pts.push([approx.intAt(j,0),approx.intAt(j,1)]);
          const ordered=orderQuad(pts);
          if(ordered){best=ordered;bestArea=area}
        }
      }
      approx.delete();approx=null;cnt.delete();
    }
    if(!best)return null;
    return best.map(p=>[p[0]*w/sw,p[1]*h/sh]);
  }catch(e){console.warn('OpenCV detect failed',e);return null}
  finally{[src,gray,blur,edges,contours,hierarchy,approx].forEach(m=>{try{if(m)m.delete()}catch(e){}})}
}
function detectQuad(source){
  // OpenCV contour detection first. Use heuristic fallback only when OpenCV is not ready
  // or no valid four-corner contour is found.
  const cvQuad=detectQuadOpenCV(source);
  return cvQuad || detectQuadHeuristic(source);
}

function drawLive(){const v=$('video'),c=$('edgeCanvas'),g=c.getContext('2d');if(!stream)return;if(v.videoWidth&&v.videoHeight){const rect=v.getBoundingClientRect();const vw=rect.width, vh=rect.height;c.width=Math.round(vw*devicePixelRatio);c.height=Math.round(vh*devicePixelRatio);g.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);g.clearRect(0,0,vw,vh);let q=detectQuad(v);if(q){const scale=Math.min(vw/v.videoWidth,vh/v.videoHeight),dw=v.videoWidth*scale,dh=v.videoHeight*scale,ox=(vw-dw)/2,oy=(vh-dh)/2;g.beginPath();q.forEach((p,i)=>{const x=ox+p[0]*scale,y=oy+p[1]*scale;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.fillStyle='rgba(65,240,190,.10)';g.fill();g.strokeStyle='#5ef3c2';g.lineWidth=2.5;g.setLineDash([]);g.stroke();q.forEach(p=>{g.beginPath();g.arc(ox+p[0]*scale,oy+p[1]*scale,5,0,Math.PI*2);g.fillStyle='#ffffff';g.fill();g.strokeStyle='#20cda1';g.stroke()});$('detectStatus').textContent='4 SUDUT TERDETEKSI';$('detectStatus').style.color='#7fffc6';document.querySelector('.hud-dot').style.background='#53efb8';stable++}else{$('detectStatus').textContent='CARI TEPI DOKUMEN';$('detectStatus').style.color='#ffe08a';document.querySelector('.hud-dot').style.background='#ffc95c';stable=0}if(auto&&q&&stable>12&&Date.now()-lastAuto>4000){lastAuto=Date.now();capture()}}raf=requestAnimationFrame(drawLive)}
async function capture(){const v=$('video');if(!stream||!v.videoWidth){toast('Kamera belum siap');return}const c=document.createElement('canvas');const s=Math.min(1,2600/Math.max(v.videoWidth,v.videoHeight));c.width=Math.round(v.videoWidth*s);c.height=Math.round(v.videoHeight*s);c.getContext('2d').drawImage(v,0,0,c.width,c.height);let data=c.toDataURL('image/jpeg',.97);const q=detectQuad(c);if(q){try{data=perspectiveWarp(c,q)}catch(e){console.warn(e)}}pages.push({data,name:`GlassScan_${new Date().toISOString().replace(/[:.]/g,'-')}.jpg`,rotation:0});active=pages.length-1;render();counts();toast(q?'Foto diambil dan perspektif dikoreksi':'Foto diambil. Sudut tidak cukup jelas; gunakan Deteksi sudut & crop.');if(auto){auto=false;$('autoBtn').textContent='Auto: OFF';$('autoBtn').classList.remove('on');stable=0}}
// Solve 8-parameter homography from destination points to source points.
function solve(A,b){for(let i=0;i<8;i++){let max=i;for(let r=i+1;r<8;r++)if(Math.abs(A[r][i])>Math.abs(A[max][i]))max=r;[A[i],A[max]]=[A[max],A[i]];[b[i],b[max]]=[b[max],b[i]];let v=A[i][i];if(Math.abs(v)<1e-9)throw Error('singular');for(let j=i;j<8;j++)A[i][j]/=v;b[i]/=v;for(let r=0;r<8;r++)if(r!==i){v=A[r][i];for(let j=i;j<8;j++)A[r][j]-=v*A[i][j];b[r]-=v*b[i]}}return b}
function perspectiveWarp(src,q){const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);const W=Math.max(1,Math.round(Math.max(dist(q[0],q[1]),dist(q[3],q[2])))),H=Math.max(1,Math.round(Math.max(dist(q[0],q[3]),dist(q[1],q[2]))));const sw=src.videoWidth||src.naturalWidth||src.width,sh=src.videoHeight||src.naturalHeight||src.height;const dst=[[0,0],[W-1,0],[W-1,H-1],[0,H-1]],A=[],b=[];for(let i=0;i<4;i++){const [x,y]=dst[i],[u,v]=q[i];A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v)}const h=solve(A,b),out=document.createElement('canvas');const scale=Math.min(1,2600/Math.max(W,H));out.width=Math.max(1,Math.round(W*scale));out.height=Math.max(1,Math.round(H*scale));const oc=out.getContext('2d',{willReadFrequently:true});oc.drawImage(src,0,0,sw,sh);const im=oc.getImageData(0,0,out.width,out.height),srcData=im.data;const input=document.createElement('canvas');input.width=sw;input.height=sh;const ix=input.getContext('2d',{willReadFrequently:true});ix.drawImage(src,0,0,sw,sh);const id=ix.getImageData(0,0,sw,sh).data;for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++){const X=x/scale,Y=y/scale,den=h[6]*X+h[7]*Y+1,u=(h[0]*X+h[1]*Y+h[2])/den,v=(h[3]*X+h[4]*Y+h[5])/den,tx=(y*out.width+x)*4;if(u<0||v<0||u>=sw-1||v>=sh-1){srcData[tx]=srcData[tx+1]=srcData[tx+2]=255;srcData[tx+3]=255;continue}const x0=Math.floor(u),y0=Math.floor(v),fx=u-x0,fy=v-y0;for(let ch=0;ch<3;ch++){const a=id[(y0*sw+x0)*4+ch],bb=id[(y0*sw+x0+1)*4+ch],cc=id[((y0+1)*sw+x0)*4+ch],dd=id[((y0+1)*sw+x0+1)*4+ch];srcData[tx+ch]=(a*(1-fx)+bb*fx)*(1-fy)+(cc*(1-fx)+dd*fx)*fy}srcData[tx+3]=255}oc.putImageData(im,0,0);return out.toDataURL('image/jpeg',.97)}
function syncFilter(){document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter))}async function render(){const has=active>=0&&pages[active];$('emptyState').hidden=!!has;$('previewWrap').hidden=!has;$('previewActions').hidden=!has;$('exportPdf').disabled=!pages.length;$('exportAllJpg').disabled=!pages.length;if(!has){$('previewTitle').textContent='Belum ada dokumen';$('thumbs').innerHTML='';return}const img=await loadImage(pages[active].data),rot=pages[active].rotation||0,sw=img.naturalWidth,sh=img.naturalHeight;canvas.width=rot%180?sh:sw;canvas.height=rot%180?sw:sh;ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(rot*Math.PI/180);ctx.drawImage(img,-sw/2,-sh/2);ctx.restore();if(filter!=='original')applyFilter(ctx,canvas.width,canvas.height,filter);$('previewTitle').textContent=pages[active].name;drawThumbs()}
function applyFilter(c,w,h,mode){
 const im=c.getImageData(0,0,w,h),d=im.data,n=w*h;
 if(mode==='original')return;
 if(mode==='gray'){for(let i=0;i<d.length;i+=4){const y=.299*d[i]+.587*d[i+1]+.114*d[i+2];d[i]=d[i+1]=d[i+2]=y}}
 else if(mode==='bw'){
  const hist=new Uint32Array(256);let sum=0;for(let i=0;i<d.length;i+=4){const y=Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2]);hist[y]++;sum+=y}
  let sb=0,wb=0,mx=-1,t=160;for(let i=0;i<256;i++){wb+=hist[i];if(!wb)continue;const wf=n-wb;if(!wf)break;sb+=i*hist[i];const v=wb*wf*(sb/wb-(sum-sb)/wf)**2;if(v>mx){mx=v;t=i}}
  // Slightly soften threshold so small text strokes survive camera noise.
  for(let i=0;i<d.length;i+=4){const y=.299*d[i]+.587*d[i+1]+.114*d[i+2],v=y>t?255:0;d[i]=d[i+1]=d[i+2]=v}
 }else if(mode==='enhance'||mode==='magic'||mode==='shadow'){
  // Estimate broad illumination field at low resolution, then lift shadows while retaining color.
  const sw=Math.max(8,Math.ceil(w/36)),sh=Math.max(8,Math.ceil(h/36)),small=document.createElement('canvas');small.width=sw;small.height=sh;
  const sc=small.getContext('2d',{willReadFrequently:true});sc.drawImage(c,0,0,sw,sh);const sd=sc.getImageData(0,0,sw,sh).data;
  const field=new Float32Array(sw*sh);for(let i=0,p=0;i<sd.length;i+=4,p++)field[p]=.299*sd[i]+.587*sd[i+1]+.114*sd[i+2];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,sx=Math.min(sw-1,Math.floor(x/w*sw)),sy=Math.min(sh-1,Math.floor(y/h*sh)),bg=Math.max(45,field[sy*sw+sx]);
   let r=d[i],g=d[i+1],b=d[i+2],lum=.299*r+.587*g+.114*b;
   if(mode==='shadow'){const target=Math.min(1.32,205/bg);const gain=Math.max(.88,Math.min(1.28,target));r*=gain;g*=gain;b*=gain;}
   if(mode==='enhance'){const gain=1.20,offset=10;r=(r-128)*gain+128+offset;g=(g-128)*gain+128+offset;b=(b-128)*gain+128+offset;}
   if(mode==='magic'){
    const corrected=Math.min(245,Math.max(0,(lum/bg)*218+12));const gain=lum>1?corrected/lum:1;
    // Neutralize a little yellow/green cast without erasing colored logos.
    r=(r*gain)*1.035;g=(g*gain)*1.005;b=(b*gain)*.985;
    const l=.299*r+.587*g+.114*b;r=l+(r-l)*1.10;g=l+(g-l)*1.10;b=l+(b-l)*1.10;
   }
   d[i]=Math.max(0,Math.min(255,r));d[i+1]=Math.max(0,Math.min(255,g));d[i+2]=Math.max(0,Math.min(255,b));
  }
 }
 c.putImageData(im,0,0)
}
function drawThumbs(){const box=$('thumbs');box.innerHTML='';pages.forEach((p,i)=>{const b=document.createElement('button');b.className='thumb'+(i===active?' active':'');const tc=document.createElement('canvas'),badge=document.createElement('span');badge.textContent=i+1;b.append(tc,badge);loadImage(p.data).then(img=>{tc.width=img.naturalWidth;tc.height=img.naturalHeight;tc.getContext('2d').drawImage(img,0,0)});b.onclick=()=>{active=i;render()};box.append(b)})}function counts(){$('pageCount').textContent=`${pages.length} halaman`;$('exportPdf').disabled=!pages.length;$('exportAllJpg').disabled=!pages.length}
async function processedData(i,quality=.94){const p=pages[i],img=await loadImage(p.data),rot=p.rotation||0,sw=img.naturalWidth,sh=img.naturalHeight,c=document.createElement('canvas');c.width=rot%180?sh:sw;c.height=rot%180?sw:sh;const x=c.getContext('2d');x.translate(c.width/2,c.height/2);x.rotate(rot*Math.PI/180);x.drawImage(img,-sw/2,-sh/2);if(i===active&&filter!=='original')applyFilter(x,c.width,c.height,filter);return c.toDataURL('image/jpeg',quality)}async function exportJpg(i){try{const url=await processedData(i,.96),a=document.createElement('a');a.href=url;a.download=(pages[i].name||`GlassScan-${i+1}`).replace(/\.[^.]+$/,'')+'.jpg';document.body.append(a);a.click();a.remove()}catch(e){toast('Gagal membuat JPG')}}
async function exportPdf(){if(!pages.length)return;const b=$('exportPdf');b.disabled=true;b.textContent='Menyiapkan…';try{const imgs=[];for(let i=0;i<pages.length;i++){const data=await processedData(i,.92),img=await loadImage(data);imgs.push({data,w:img.naturalWidth,h:img.naturalHeight})}const blob=new Blob([makePdf(imgs)],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='GlassScan-Document.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('PDF dibuat secara lokal')}catch(e){console.error(e);toast('PDF gagal dibuat; coba kurangi halaman')}finally{b.textContent='⇩ Export PDF';b.disabled=!pages.length}}
function makePdf(items){const enc=new TextEncoder(),objs=[];const add=x=>{objs.push(x instanceof Uint8Array?x:enc.encode(x));return objs.length};add('<< /Type /Catalog /Pages 2 0 R >>');add('');const ids=[];items.forEach((it,k)=>{const raw=atob(it.data.split(',')[1]),jpg=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)jpg[i]=raw.charCodeAt(i);const imgId=objs.length+1;objs.push(join([enc.encode(`${imgId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${it.w} /Height ${it.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`),jpg,enc.encode('\nendstream\nendobj\n')]));const pid=objs.length+1,cid=pid+1;ids.push(pid);const pw=595.28,ph=841.89,s=Math.min(pw/it.w,ph/it.h),w=it.w*s,h=it.h*s,x=(pw-w)/2,y=(ph-h)/2;add(`${pid} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im${k+1} ${imgId} 0 R >> >> /Contents ${cid} 0 R >>\nendobj\n`);const st=`q\n${w} 0 0 ${h} ${x} ${y} cm\n/Im${k+1} Do\nQ\n`;add(`${cid} 0 obj\n<< /Length ${enc.encode(st).length} >>\nstream\n${st}endstream\nendobj\n`)});objs[1]=enc.encode(`2 0 obj\n<< /Type /Pages /Kids [${ids.map(i=>i+' 0 R').join(' ')}] /Count ${ids.length} >>\nendobj\n`);let parts=[enc.encode('%PDF-1.4\n%GlassScan\n')],off=parts[0].length,offsets=[0];objs.forEach((o,i)=>{offsets.push(off);const p=enc.encode(`${i+1} 0 obj\n`),s=enc.encode('\nendobj\n');parts.push(p,o,s);off+=p.length+o.length+s.length});const xref=off;let t=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;for(let i=1;i<offsets.length;i++)t+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;t+=`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;parts.push(enc.encode(t));return join(parts)}function join(arr){const n=arr.reduce((a,b)=>a+b.length,0),o=new Uint8Array(n);let p=0;for(const a of arr){o.set(a,p);p+=a.length}return o}
window.addEventListener('resize',()=>{if($('cropDialog').open&&cropImage)drawCropEditor()});
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));counts();
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
