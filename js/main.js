import * as THREE from 'three';
import { getLang, storeLang, T } from './i18n.js';
import { buildRoom } from './scene/room.js';
import { buildDesk } from './scene/desk.js';
import { buildAvatar } from './scene/avatar.js';
import { createCameraRig } from './camera-rig.js';
import { createTerminal } from './ui/terminal.js';
import { createContactCard } from './ui/contact.js';
import { createAudio } from './audio.js';

/* =========================================================
   Renderer / scene
   ========================================================= */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#1b1410');
scene.fog = new THREE.Fog('#1b1410', 6, 13);
const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 50);

// lights
scene.add(new THREE.HemisphereLight('#ffd9b0', '#2a1c14', 0.55));
const key = new THREE.DirectionalLight('#ffe2c0', 1.6);
key.position.set(2.5, 4.2, 2.2); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 10 });
scene.add(key);
const lampLight = new THREE.PointLight('#ffb35c', 3.2, 3.2, 1.6);
lampLight.position.set(0.66, 1.2, -0.5); lampLight.castShadow = true; lampLight.shadow.mapSize.set(512, 512);
scene.add(lampLight);
const screenLight = new THREE.PointLight('#5dff7a', 0.55, 1.4, 2);
screenLight.position.set(0, 1.08, -0.35);
scene.add(screenLight);
const rim = new THREE.DirectionalLight('#7fa8ff', 0.55);
rim.position.set(-3, 2.5, -1.5); scene.add(rim);
const fill = new THREE.DirectionalLight('#ffe9d2', 0.5); // follows the camera so Alban's face never goes black
scene.add(fill, fill.target);

buildRoom(scene);
const { monitor, screenMesh, screen, screenWorld } = buildDesk(scene);
const alban = buildAvatar(scene);
const rig = createCameraRig(screenWorld, reduceMotion);

/* =========================================================
   State machine: idle -> zooming -> terminal -> leaving -> contact
   ========================================================= */
let state = 'idle';
const ui = {
  hint: document.getElementById('hint'), cta: document.getElementById('cta'), lockup: document.getElementById('lockup'),
  crt: document.getElementById('crt'), term: document.getElementById('term'),
};
const anim = { swivel: 0, swivelTarget: 0, wave: 0, talk: 0, lookAtCam: 1, lookAtCamTarget: 1, lookT: 2.8 };
const contact = createContactCard(document.getElementById('contact'));
const audio = createAudio();
const terminal = createTerminal(ui.term, { reduceMotion, onExit: () => exitToContact(), onType: () => audio.key() });

async function enterScreen() {
  if (state !== 'idle' && state !== 'contact') return;
  const from = state; state = 'zooming';
  ui.cta.classList.add('is-hidden'); ui.lockup.classList.add('is-hidden');
  contact.hide();
  anim.swivelTarget = 0;
  if (from === 'contact') await rig.setShot('idle', 1.1);
  await rig.setShot('screen', 1.7, new THREE.Vector3(0.75, 1.35, 0.05));
  state = 'terminal';
  ui.crt.classList.add('is-on'); ui.crt.setAttribute('aria-hidden', 'false');
  audio.powerOn();
  terminal.boot();
}

async function exitToContact() {
  if (state !== 'terminal') return;
  state = 'leaving';
  terminal.stop();
  ui.crt.classList.remove('is-on'); ui.crt.setAttribute('aria-hidden', 'true');
  await rig.setShot('idle', 1.3);
  anim.swivelTarget = -(Math.PI - 0.3); // swivel round to face the visitor
  await rig.setShot('contact', 1.3);
  state = 'contact';
  contact.show();
  anim.wave = 2.4; anim.talk = 1.8;
}

function goHome() {
  contact.hide(); anim.swivelTarget = 0;
  state = 'returning';
  rig.setShot('idle', 1.3).then(() => {
    state = 'idle';
    ui.cta.classList.remove('is-hidden'); ui.lockup.classList.remove('is-hidden');
  });
}

/* ---------- language ---------- */
function applyStaticText() {
  const t = T(), lang = getLang();
  document.documentElement.lang = lang;
  document.getElementById('hintText').textContent = t.hint;
  document.getElementById('tourText').textContent = t.tour;
  document.getElementById('lockupText').textContent = t.lockup;
  document.getElementById('btnExit').textContent = t.exit;
  document.getElementById('contactTitle').textContent = t.cTitle;
  document.getElementById('contactLede').textContent = t.cLede;
  document.getElementById('btnAgain').textContent = t.again;
  document.getElementById('btnHome').textContent = t.home;
  canvas.setAttribute('aria-label', t.canvas);
  document.getElementById('bootStart').textContent = t.start;
  document.getElementById('btnSound').setAttribute('aria-label', t.sound);
  renderBoot();
  document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}
function setLang(l) {
  if (l === getLang()) return;
  storeLang(l);
  applyStaticText();
  if (contact.isOpen()) contact.render();
  if (state === 'terminal') terminal.rerender();
}
document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

/* ---------- BIOS boot screen ---------- */
const boot = { el: document.getElementById('boot'), log: document.getElementById('bootLog'), start: document.getElementById('bootStart'), shown: 0, dots: 0, ready: false };
function renderBoot() {
  const lines = T().bios.slice(0, boot.shown);
  boot.log.innerHTML = lines.map((l, i) => {
    if (typeof l === 'string') return i < 2 ? `<span class="hd">${l}</span>` : l;
    const last = i === boot.shown - 1;
    const pad = ' ' + '.'.repeat(last && !boot.ready && i === T().bios.length - 1 ? boot.dots : Math.max(3, 52 - l[0].length)) + ' ';
    const done = !(last && i === T().bios.length - 1 && !boot.ready);
    return `${l[0]}${pad}${done ? `<span class="ok">${l[1]}</span>` : ''}`;
  }).join('\n');
}
function runBoot(sceneReady) {
  const total = T().bios.length;
  const step = () => {
    if (boot.shown < total) { boot.shown++; renderBoot(); setTimeout(step, reduceMotion ? 0 : 140 + Math.random() * 160); return; }
    // last line: dots grow until the scene is ready
    const dotsTimer = setInterval(() => { boot.dots = (boot.dots + 1) % 40; renderBoot(); }, 60);
    sceneReady.then(() => {
      clearInterval(dotsTimer); boot.ready = true; renderBoot();
      boot.start.hidden = false; boot.start.focus({ preventScroll: true });
    });
  };
  step();
}
boot.start.addEventListener('click', () => {
  audio.unlock();
  boot.el.classList.add('is-done');
  ui.hint.focus({ preventScroll: true });
});

/* ---------- sound ---------- */
const btnSound = document.getElementById('btnSound');
btnSound.setAttribute('aria-pressed', String(audio.isEnabled()));
btnSound.addEventListener('click', () => {
  audio.unlock();
  audio.setEnabled(!audio.isEnabled());
  btnSound.setAttribute('aria-pressed', String(audio.isEnabled()));
});
applyStaticText();

/* ---------- keyboard & buttons ---------- */
addEventListener('keydown', (e) => {
  if (state === 'terminal') {
    if (e.key === 'Escape') { e.preventDefault(); return terminal.back(); }
    if (e.key === 'Enter') {
      if (document.activeElement?.closest?.('.menu')) return; // the focused menu button handles it
      e.preventDefault(); return terminal.press('enter');
    }
    if (/^[0-5]$/.test(e.key)) { e.preventDefault(); return terminal.press(e.key); }
    if (e.key.toLowerCase() === 'm') return terminal.press('m');
    if (e.key.toLowerCase() === 'l') return setLang(getLang() === 'fr' ? 'en' : 'fr');
    if (e.key === ' ' && terminal.isTyping()) { e.preventDefault(); terminal.skip(); }
  } else if (state === 'idle' && boot.el.classList.contains('is-done') && (e.key === 'Enter' || e.key === ' ') && document.activeElement === document.body) {
    e.preventDefault(); enterScreen();
  } else if (state === 'contact' && e.key === 'Escape') goHome();
});
document.getElementById('btnMenu').addEventListener('click', () => terminal.press('m'));
document.getElementById('btnExit').addEventListener('click', () => exitToContact());
document.getElementById('btnAgain').addEventListener('click', () => enterScreen());
document.getElementById('btnHome').addEventListener('click', () => goHome());
ui.hint.addEventListener('click', () => enterScreen());

/* ---------- pointer ---------- */
const pointer = new THREE.Vector2(0, 0), pSmooth = new THREE.Vector2();
const ray = new THREE.Raycaster();
let downAt = null;
canvas.addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (state === 'idle') {
    ray.setFromCamera(pointer, camera);
    canvas.style.cursor = ray.intersectObjects([screenMesh, ...monitor.children], false).length ? 'pointer' : 'default';
  } else canvas.style.cursor = 'default';
});
canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]); downAt = null;
  if (moved <= 8 && state === 'idle') enterScreen();
});

/* =========================================================
   Loop
   ========================================================= */
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  if (state === 'idle' && !rig.isMoving()) rig.setShot('idle', 0);
  if (state === 'contact' && !rig.isMoving()) rig.setShot('contact', 0);
}
addEventListener('resize', resize);

const clock = new THREE.Clock();
const offset = new THREE.Vector3();
let screenAcc = 0;

function animate() {
  const dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime;
  rig.updateShot(dt);

  // Alban types at the desk and now and then swivels round to glance at the visitor
  const typingNow = state === 'idle' || state === 'zooming' || state === 'returning' ? screen.step(dt) : false;
  if (typingNow && state === 'idle' && anim.lookAtCam < 0.5 && Math.random() < dt * 14) audio.key(0.3);
  screenAcc += dt;
  if (screenAcc > 1 / 20) { screenAcc = 0; screen.draw(t); }

  if (state === 'idle') {
    anim.lookT -= dt;
    if (anim.lookT < 0) {
      anim.lookAtCamTarget = anim.lookAtCamTarget ? 0 : 1;
      anim.lookT = anim.lookAtCamTarget ? 2.6 : 4 + Math.random() * 3;
    }
    anim.swivelTarget = anim.lookAtCamTarget ? -0.75 : 0;
  } else anim.lookAtCamTarget = state === 'contact' ? 1 : 0;
  anim.lookAtCam += (anim.lookAtCamTarget - anim.lookAtCam) * Math.min(1, dt * 5);
  anim.swivel += (anim.swivelTarget - anim.swivel) * Math.min(1, dt * 3.2);
  anim.wave = Math.max(0, anim.wave - dt);
  anim.talk = Math.max(0, anim.talk - dt);

  alban.update(dt, t, camera, { swivel: anim.swivel, lookAtCam: anim.lookAtCam, typingNow, wave: anim.wave, talk: anim.talk });

  screenLight.intensity = 0.55 + Math.sin(t * 30) * 0.03 + (state === 'zooming' ? 0.6 : 0);

  // camera with a soft pointer parallax
  pSmooth.lerp(pointer, Math.min(1, dt * 3));
  const par = (state === 'idle' || state === 'contact') && !reduceMotion ? 1 : 0;
  camera.position.copy(rig.cam.pos).add(offset.set(pSmooth.x * 0.12 * par, pSmooth.y * 0.06 * par, 0));
  camera.fov = rig.cam.fov; camera.updateProjectionMatrix();
  camera.lookAt(rig.cam.look);
  fill.position.copy(camera.position); fill.target.position.copy(rig.cam.look);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

const fontsReady = document.fonts.load('30px "VT323"').catch(() => {});
fontsReady.then(() => runBoot(new Promise((resolve) => {
  rig.setShot('idle', 0);
  resize();
  screen.draw(0);
  requestAnimationFrame(() => { animate(); setTimeout(resolve, reduceMotion ? 0 : 500); });
})));
