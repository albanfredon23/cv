import * as THREE from 'three';
import { T } from '../i18n.js';

// The monitor's canvas texture: Alban typing AIOTECH44 / AIOGPS snippets in a teletext-style REPL.
export function createScreen() {
  const screenCanvas = document.createElement('canvas'); screenCanvas.width = 640; screenCanvas.height = 480;
  const sctx = screenCanvas.getContext('2d');
  const screenTex = new THREE.CanvasTexture(screenCanvas); screenTex.colorSpace = THREE.SRGBColorSpace;

  const typingScript = [
    ['g', '>>> from aiotech import AdaptiveComputeGate'],
    ['g', '>>> gate = AdaptiveComputeGate(mode="green")'],
    ['g', '>>> scg = SphericalConstraintGraph(dim=256)'],
    ['g', '>>> plan = tap.beam_search(query, k=11)'],
    ['g', '>>> plan = scg.prune(plan)'],
    ['c', () => T().pruned],
    ['g', '>>> mem.allocate(docs, k_min=4)'],
    ['c', () => T().ctx],
    ['g', '>>> ekf.update(gnss, imu)  # AIOGPS'],
    ['c', () => T().spoof],
    ['g', () => `>>> print("${T().hello}")`],
    ['y', () => T().hello],
  ];
  const scriptLine = (i) => { const l = typingScript[i % typingScript.length]; return [l[0], typeof l[1] === 'function' ? l[1]() : l[1]]; };
  const TT = { g: '#4dff6a', c: '#3ef2ff', y: '#ffef3a', w: '#f5f5f0', r: '#ff4b4b' };
  let typed = { line: 0, char: 0, lines: [] };
  function draw(t) {
    const W = 640, H = 480, g = sctx;
    g.fillStyle = '#030803'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#2b3dff'; g.fillRect(24, 22, W - 48, 40);
    g.font = 'bold 30px "VT323", monospace'; g.textBaseline = 'top';
    g.fillStyle = '#ffef3a'; g.fillText('ALBAN FREDON', 36, 26);
    g.fillStyle = '#ffffff'; g.fillText('AI · FULL-STACK', W - 36 - g.measureText('AI · FULL-STACK').width, 26);
    g.font = '26px "VT323", monospace';
    const visible = typed.lines.slice(-12);
    visible.forEach((l, i) => { g.fillStyle = TT[l[0]]; g.fillText(l[1], 30, 80 + i * 28); });
    const cur = scriptLine(typed.line);
    const curText = cur[1].slice(0, typed.char);
    const y = 80 + visible.length * 28;
    g.fillStyle = TT[cur[0]]; g.fillText(curText, 30, y);
    if (Math.floor(t * 2) % 2 === 0) { g.fillStyle = '#4dff6a'; g.fillRect(32 + g.measureText(curText).width, y + 2, 13, 22); }
    g.fillStyle = 'rgba(0,0,0,0.25)'; for (let yy = 0; yy < H; yy += 3) g.fillRect(0, yy, W, 1);
    const grad = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
    grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    screenTex.needsUpdate = true;
  }
  let typeAcc = 0;
  function step(dt) {
    typeAcc += dt;
    const cur = scriptLine(typed.line);
    const isOutput = cur[1].startsWith('...') || cur[0] === 'y';
    const speed = isOutput ? 0.004 : 0.055 + Math.random() * 0.04;
    while (typeAcc > speed) {
      typeAcc -= speed;
      typed.char++;
      if (typed.char > cur[1].length) {
        typed.lines.push(cur); typed.char = 0; typed.line++;
        if (typed.line % typingScript.length === 0) typed.lines.push(['w', '']);
        typeAcc = -0.5;
        return true;
      }
    }
    return !isOutput;
  }

  // step() returns true while a command line is being typed (hands should move)
  return { texture: screenTex, draw, step };
}
