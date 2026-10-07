import * as THREE from 'three';
import { mat, add, rbox } from './helpers.js';
import { createScreen } from './screen.js';

export const DESK_Y = 0.76;

// Desk with a BBC Micro-style keyboard, CRT monitor, lamp, plant, mug and an "ALBAN.SSD" floppy.
export function buildDesk(scene) {
  const desk = new THREE.Group(); scene.add(desk);
  add(desk, rbox(1.7, 0.05, 0.82, 0.015), mat('#8a5a3b', { roughness: 0.55 }), [0, DESK_Y, -0.62]);
  for (const [x, z] of [[-0.8, -0.98], [0.8, -0.98], [-0.8, -0.26], [0.8, -0.26]])
    add(desk, rbox(0.05, DESK_Y, 0.05, 0.01), mat('#5e3d28'), [x, DESK_Y / 2, z]);

  // BBC Micro-style keyboard unit
  const beige = mat('#ddd0b4', { roughness: 0.6 });
  const kb = new THREE.Group(); kb.position.set(0, DESK_Y + 0.025, -0.36); desk.add(kb);
  add(kb, rbox(0.66, 0.06, 0.25, 0.012), beige, [0, 0.03, 0]);
  add(kb, rbox(0.66, 0.025, 0.18, 0.008), mat('#2a2522'), [0, 0.066, 0.012], [-0.08, 0, 0]);
  {
    const keyGeo = rbox(0.026, 0.014, 0.026, 0.004);
    const black = new THREE.InstancedMesh(keyGeo, mat('#1b1817', { roughness: 0.5 }), 80);
    const red = new THREE.InstancedMesh(keyGeo, mat('#c2372f', { roughness: 0.5 }), 10);
    const m4 = new THREE.Matrix4(); let n = 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 18; c++) {
      if (n >= 80) break;
      m4.makeTranslation(-0.255 + c * 0.03 + (r % 2) * 0.008, 0.083 + r * 0.004, 0.06 - r * 0.033); black.setMatrixAt(n++, m4);
    }
    black.count = n;
    for (let c = 0; c < 10; c++) { m4.makeTranslation(-0.2 + c * 0.032, 0.1, -0.075); red.setMatrixAt(c, m4); }
    black.castShadow = red.castShadow = true;
    kb.add(black, red);
    // spacebar
    add(kb, rbox(0.2, 0.014, 0.026, 0.005), mat('#1b1817'), [0, 0.08, 0.095]);
  }

  // CRT monitor
  const monitor = new THREE.Group(); monitor.position.set(0, DESK_Y + 0.025, -0.78); desk.add(monitor);
  add(monitor, rbox(0.4, 0.05, 0.36, 0.01), beige, [0, 0.025, 0]);
  add(monitor, rbox(0.58, 0.47, 0.44, 0.04), beige, [0, 0.29, 0]);
  add(monitor, rbox(0.46, 0.38, 0.3, 0.06), beige, [0, 0.3, -0.22]);
  add(monitor, rbox(0.52, 0.41, 0.02, 0.02), mat('#2a2522', { roughness: 0.4 }), [0, 0.29, 0.215]);
  const SCREEN_W = 0.46, SCREEN_H = 0.345;
  const screen = createScreen();
  const screenMesh = add(monitor, new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
    new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false }), [0, 0.29, 0.2265]);
  screenMesh.castShadow = false;
  add(monitor, new THREE.CylinderGeometry(0.008, 0.008, 0.004, 12), mat('#ff3b30', { emissive: '#ff3b30', emissiveIntensity: 2 }), [0.24, 0.1, 0.225], [Math.PI / 2, 0, 0]);
  const SCREEN_WORLD = new THREE.Vector3(0, DESK_Y + 0.025 + 0.29, -0.78 + 0.2265);

  // desk lamp
  {
    const lamp = new THREE.Group(); lamp.position.set(0.66, DESK_Y + 0.025, -0.82); desk.add(lamp);
    const lampMat = mat('#e8b23a', { roughness: 0.4, metalness: 0.15 });
    const rod = (a, b) => {
      const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
      const m = add(lamp, new THREE.CylinderGeometry(0.012, 0.012, len, 12), lampMat, A.clone().add(B).multiplyScalar(0.5).toArray());
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    };
    add(lamp, new THREE.CylinderGeometry(0.08, 0.09, 0.025, 32), lampMat, [0, 0.012, 0]);
    rod([0, 0.02, 0], [0, 0.36, 0.07]);
    add(lamp, new THREE.SphereGeometry(0.02, 12, 8), lampMat, [0, 0.36, 0.07]);
    rod([0, 0.36, 0.07], [0, 0.5, 0.22]);
    const shade = add(lamp, new THREE.CylinderGeometry(0.035, 0.1, 0.13, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#e8b23a', roughness: 0.4, metalness: 0.15, side: THREE.DoubleSide }), [0, 0.47, 0.26], [0.75, 0, 0]);
    add(lamp, new THREE.SphereGeometry(0.03, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff1c9' }), [0, 0.45, 0.275]);
    shade.castShadow = false;
  }

  // plant
  {
    const p = new THREE.Group(); p.position.set(-0.62, DESK_Y + 0.025, -0.82); desk.add(p);
    add(p, new THREE.CylinderGeometry(0.075, 0.06, 0.13, 24), mat('#c76b43', { roughness: 0.8 }), [0, 0.065, 0]);
    add(p, new THREE.CylinderGeometry(0.068, 0.068, 0.01, 24), mat('#3a261a'), [0, 0.125, 0]);
    const leaf = mat('#3f8a4e', { roughness: 0.6 });
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      add(p, new THREE.SphereGeometry(0.05, 16, 10), leaf, [Math.cos(a) * 0.05, 0.2 + (i % 3) * 0.05, Math.sin(a) * 0.05], [Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6], [0.6, 1.6, 0.35]);
    }
  }

  // mug + floppy disk
  {
    const mug = new THREE.Group(); mug.position.set(0.48, DESK_Y + 0.025, -0.4); desk.add(mug);
    add(mug, new THREE.CylinderGeometry(0.04, 0.036, 0.1, 24), mat('#f2efe8', { roughness: 0.3 }), [0, 0.05, 0]);
    add(mug, new THREE.TorusGeometry(0.025, 0.007, 8, 20), mat('#f2efe8', { roughness: 0.3 }), [0.045, 0.05, 0], [0, 0, 0]);
    add(mug, new THREE.CylinderGeometry(0.035, 0.035, 0.005, 24), mat('#3b2214', { roughness: 0.2 }), [0, 0.09, 0]);

    const dc = document.createElement('canvas'); dc.width = 256; dc.height = 256; const g = dc.getContext('2d');
    g.fillStyle = '#141414'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#efe6cf'; g.fillRect(28, 18, 200, 70);
    g.fillStyle = '#1f3fae'; g.font = 'bold 30px monospace'; g.fillText('ALBAN.SSD', 44, 64);
    g.fillStyle = '#2b2b2b'; g.beginPath(); g.arc(128, 150, 34, 0, 7); g.fill();
    g.fillStyle = '#7a6b50'; g.beginPath(); g.arc(128, 150, 14, 0, 7); g.fill();
    const dt = new THREE.CanvasTexture(dc); dt.colorSpace = THREE.SRGBColorSpace;
    const disk = add(desk, new THREE.BoxGeometry(0.13, 0.003, 0.13),
      [mat('#141414'), mat('#141414'), new THREE.MeshStandardMaterial({ map: dt, roughness: 0.6 }), mat('#141414'), mat('#141414'), mat('#141414')],
      [-0.45, DESK_Y + 0.027, -0.4], [0, 0.35, 0]);
  }
  return { desk, monitor, screenMesh, screen, screenWorld: SCREEN_WORLD };
}
