/* Muhammad Asif — portfolio interactions
   1. hero: three.js schedule-bar field
   2. 3D coverflow sliders
   3. tilt cards, counters, scroll reveal            */

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.getElementById('yr').textContent = new Date().getFullYear();

/* ---------------------------------------------------------
   0. MOBILE MENU
--------------------------------------------------------- */
(function(){
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  if(!btn || !menu) return;
  function set(open){
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', () => set(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', e => { if(e.key === 'Escape') set(false); });
  document.addEventListener('click', e => {
    if(menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) set(false);
  });
  window.addEventListener('resize', () => { if(window.innerWidth > 900) set(false); });
})();

/* ---------------------------------------------------------
   1. HERO — a rotating field of scheduled bars.
   The hero background is a Gantt chart lifted into 3D:
   each bar is a task, its length is its duration.
--------------------------------------------------------- */
function heroScene(){
  const canvas = document.getElementById('scene');
  if(!canvas || REDUCE || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0E1620, 0.055);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
  camera.position.set(0, 6.5, 17);
  camera.lookAt(0, 0, 0);

  const group = new THREE.Group();
  scene.add(group);

  const amber = new THREE.MeshBasicMaterial({color:0xFFB703, transparent:true, opacity:.62});
  const steel = new THREE.MeshBasicMaterial({color:0x2E4257, transparent:true, opacity:.75});
  const edge  = new THREE.LineBasicMaterial({color:0xFFB703, transparent:true, opacity:.22});

  const ROWS = 14, COLS = 12;
  for(let r = 0; r < ROWS; r++){
    const len   = 1.6 + Math.random() * 5.2;          // task duration
    const start = -8 + Math.random() * (14 - len);    // task start
    const geo   = new THREE.BoxGeometry(len, .34, .34);
    const bar   = new THREE.Mesh(geo, Math.random() > .62 ? amber : steel);
    bar.position.set(start + len / 2, 0, -6 + r * 0.95);
    group.add(bar);
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edge);
    line.position.copy(bar.position);
    group.add(line);
  }

  // timescale gridlines
  for(let c = 0; c <= COLS; c++){
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-9 + c * 1.5, -.4, -6.6),
      new THREE.Vector3(-9 + c * 1.5, -.4,  7.6)
    ]);
    group.add(new THREE.Line(g, new THREE.LineBasicMaterial({color:0x26374A, transparent:true, opacity:.55})));
  }

  group.rotation.x = 0.42;

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', e => {
    tx = (e.clientX / window.innerWidth  - .5) * .5;
    ty = (e.clientY / window.innerHeight - .5) * .3;
  });

  function size(){
    const h = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(h.width, h.height, false);
    camera.aspect = h.width / h.height;
    camera.updateProjectionMatrix();
  }
  size();
  window.addEventListener('resize', size);

  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });

  (function loop(t){
    requestAnimationFrame(loop);
    if(!running) return;
    mx += (tx - mx) * .05;
    my += (ty - my) * .05;
    group.rotation.y = 0.15 + Math.sin(t * 0.00013) * 0.28 + mx;
    group.rotation.x = 0.42 + my;
    group.position.y = Math.sin(t * 0.0006) * 0.25;
    renderer.render(scene, camera);
  })(0);
}
heroScene();

/* ---------------------------------------------------------
   2. 3D COVERFLOW SLIDER
--------------------------------------------------------- */
function coverflow(id, delay){
  const root = document.getElementById(id);
  if(!root) return;
  const cards = [...root.querySelectorAll('.card3d')];
  const dots  = root.querySelector('.dots');
  const cap   = root.querySelector('.cap-live');
  const n = cards.length;
  let active = 0, timer = null;

  cards.forEach((_, k) => {
    const b = document.createElement('button');
    b.className = 'dot' + (k === 0 ? ' on' : '');
    b.setAttribute('aria-label', 'Show item ' + (k + 1));
    b.addEventListener('click', () => { go(k); restart(); });
    dots.appendChild(b);
  });
  const dotEls = [...dots.children];

  function layout(){
    cards.forEach((c, k) => {
      let o = k - active;
      if(o >  n / 2) o -= n;
      if(o < -n / 2) o += n;
      const a = Math.abs(o);
      const spread = window.innerWidth < 700 ? 54 : 62;
      c.style.transform =
        `translate(-50%,-50%) translateX(${o * spread}%) translateZ(${-a * 230}px) rotateY(${o * -32}deg)`;
      c.style.zIndex  = String(50 - a);
      c.style.opacity = a > 2 ? '0' : (o === 0 ? '1' : '.45');
      c.style.filter  = o === 0 ? 'none' : 'brightness(.55)';
      c.style.pointerEvents = o === 0 ? 'auto' : 'none';
    });
    dotEls.forEach((d, k) => d.classList.toggle('on', k === active));
    if(cap) cap.innerHTML = cards[active].dataset.cap || '';
  }
  function go(k){ active = (k + n) % n; layout(); }
  function restart(){ if(REDUCE) return; clearInterval(timer); timer = setInterval(() => go(active + 1), delay); }

  root.querySelector('.s-next').addEventListener('click', () => { go(active + 1); restart(); });
  root.querySelector('.s-prev').addEventListener('click', () => { go(active - 1); restart(); });
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', restart);
  root.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight'){ go(active + 1); restart(); }
    if(e.key === 'ArrowLeft'){  go(active - 1); restart(); }
  });
  let x0 = null;
  root.addEventListener('touchstart', e => x0 = e.touches[0].clientX, {passive:true});
  root.addEventListener('touchend', e => {
    if(x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 45){ go(active + (dx < 0 ? 1 : -1)); restart(); }
    x0 = null;
  });
  window.addEventListener('resize', layout);
  layout(); restart();
}
coverflow('slider1', 5000);
coverflow('slider2', 6000);

/* ---------------------------------------------------------
   3a. TILT CARDS
--------------------------------------------------------- */
if(!REDUCE && window.matchMedia('(hover:hover)').matches){
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - .5;
      const py = (e.clientY - r.top)  / r.height - .5;
      card.style.transform =
        `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

/* ---------------------------------------------------------
   3b. COUNTERS + SCROLL REVEAL
--------------------------------------------------------- */
function countUp(el){
  const target = +el.dataset.count, suffix = el.dataset.suffix || '';
  if(REDUCE){ el.textContent = target + suffix; return; }
  const dur = 1400, t0 = performance.now();
  (function step(t){
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
    if(p < 1) requestAnimationFrame(step);
  })(t0);
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(e.target);
  });
}, {threshold:.15});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));


/* ---------------------------------------------------------
   4. LIGHTBOX — click a platform screenshot to read it full size
--------------------------------------------------------- */
(function(){
  const lb = document.getElementById('lightbox');
  if(!lb) return;
  const img = lb.querySelector('img');
  function close(){ lb.hidden = true; document.body.style.overflow = ''; }
  document.querySelectorAll('.flat img').forEach(el => {
    el.addEventListener('click', () => {
      img.src = el.src; img.alt = el.alt;
      lb.hidden = false; document.body.style.overflow = 'hidden';
    });
  });
  lb.addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
})();


/* ---------------------------------------------------------
   5. CV DOWNLOAD

   The button is a <button>, not a link, so the browser has no
   URL to navigate to and cannot open the PDF in a viewer tab.
   The file itself is embedded in js/cv-data.js as base64, so it
   is rebuilt in memory and saved straight to the Downloads
   folder. This works on GitHub Pages, on any other host, and
   even when the page is opened directly from a local file.
--------------------------------------------------------- */
function saveCV(btn){
  const NAME = 'Muhammad-Asif-CV.pdf';
  if(typeof window.CV_BASE64 !== 'string'){ return false; }

  // base64 -> bytes -> Blob
  const raw = atob(window.CV_BASE64);
  const bytes = new Uint8Array(raw.length);
  for(let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const blob = new Blob([bytes], {type: 'application/pdf'});

  // Internet Explorer / old Edge
  if(window.navigator && window.navigator.msSaveOrOpenBlob){
    window.navigator.msSaveOrOpenBlob(blob, NAME);
    return true;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = NAME;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
  return true;
}

document.querySelectorAll('.cv-dl').forEach(btn => {
  const label = btn.innerHTML;
  btn.addEventListener('click', e => {
    e.preventDefault();
    const ok = saveCV(btn);
    btn.innerHTML = ok ? '&#10003; &nbsp;Saved to your downloads'
                       : 'Download failed, please try again';
    setTimeout(() => { btn.innerHTML = label; }, 2800);
  });
});
