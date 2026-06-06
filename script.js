// ── Confetti ──
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let pieces = [];
const colors = ['#cc7170','#e0cdbf','#deb3aa','#f0d8d4','#a9aaa4','#e8cec8','#f8ede8'];
function resize(){ canvas.width=innerWidth; canvas.height=innerHeight; }
resize(); window.addEventListener('resize',resize);
function spawnConfetti(n=80){
  for(let i=0;i<n;i++){
    pieces.push({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height-canvas.height,
      w:Math.random()*9+4, h:Math.random()*4+2,
      color:colors[Math.floor(Math.random()*colors.length)],
      rot:Math.random()*Math.PI*2,
      vx:(Math.random()-.5)*1.5, vy:Math.random()*2+.8,
      vr:(Math.random()-.5)*.08, alpha:Math.random()*.5+.35
    });
  }
}
function drawConfetti(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  pieces.forEach(p=>{
    ctx.save(); ctx.globalAlpha=p.alpha;
    ctx.translate(p.x,p.y); ctx.rotate(p.rot);
    ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
    ctx.restore();
    p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
  });
  pieces=pieces.filter(p=>p.y<canvas.height+20);
  requestAnimationFrame(drawConfetti);
}
spawnConfetti(100); drawConfetti();
setInterval(()=>spawnConfetti(20),2500);

// ── Polaroid Carousel ──
// Páginas: 2 + 2 + 2 + 3 + 1 = 10 fotos
const PAGE_SIZES = [2, 2, 2, 3, 1];
const TOTAL = PAGE_SIZES.reduce((a,b)=>a+b, 0);
const rotations = [-2.5, 1.8, -1.2, 2.2, -1.8, 1.5, -2.0, 1.4, -1.5, 1.2];
const captions = new Array(TOTAL).fill('');
const images = Array.from({length: TOTAL}, (_, i) => `img${i+1}.jpeg`);
let current = 0;

const track = document.getElementById('carouselTrack');
const dotsEl = document.getElementById('dots');

// Devuelve el índice de página al que pertenece la foto i
function pageOf(i){
  let acc = 0;
  for(let p=0; p<PAGE_SIZES.length; p++){
    acc += PAGE_SIZES[p];
    if(i < acc) return p;
  }
  return PAGE_SIZES.length - 1;
}

function makePolaroid(i){
  const pol = document.createElement('div');
  pol.className = 'polaroid';
  pol.style.setProperty('--rot', rotations[i % rotations.length]+'deg');

  const imgWrap = document.createElement('div');
  imgWrap.className = 'polaroid-img';

  if(images[i]){
    const img = document.createElement('img');
    img.src = images[i];
    imgWrap.appendChild(img);
  } else {
    imgWrap.innerHTML = `<div class="placeholder">
      <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
      <span>Agregar foto</span>
    </div>`;
  }

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  const idx = i;
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      images[idx] = ev.target.result;
      const target = pageOf(idx);
      buildPolaroids();
      goTo(target);
    };
    reader.readAsDataURL(file);
  });

  const cap = document.createElement('div');
  cap.className = 'polaroid-caption';
  cap.textContent = captions[i];

  pol.appendChild(imgWrap);
  pol.appendChild(fileInput);
  pol.appendChild(cap);
  return pol;
}

function buildPolaroids(){
  track.innerHTML = '';
  dotsEl.innerHTML = '';
  let i = 0;
  PAGE_SIZES.forEach((count, pIdx) => {
    const page = document.createElement('div');
    page.className = 'carousel-page';
    page.setAttribute('data-count', count);
    for(let c=0; c<count; c++){
      page.appendChild(makePolaroid(i));
      i++;
    }
    track.appendChild(page);

    const dot = document.createElement('div');
    dot.className = 'dot' + (pIdx===current ? ' active' : '');
    dotsEl.appendChild(dot);
  });
  updatePosition();
}

function goTo(idx){
  const pages = PAGE_SIZES.length;
  current = Math.max(0, Math.min(idx, pages-1));
  updatePosition();
  dotsEl.querySelectorAll('.dot').forEach((d,i) => {
    d.classList.toggle('active', i===current);
  });
}

function updatePosition(){
  track.style.transform = `translateX(-${current * 100}%)`;
}

document.getElementById('prevBtn').addEventListener('click',()=>goTo(current-1));
document.getElementById('nextBtn').addEventListener('click',()=>goTo(current+1));

buildPolaroids();
window.addEventListener('resize', updatePosition);
