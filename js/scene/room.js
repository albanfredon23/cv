import * as THREE from 'three';
import { mat, add, rbox } from './helpers.js';

// Walls, floor, rug, the red-flower painting (a nod to Alban's photo) and a bookshelf.
export function buildRoom(scene) {
  const room = new THREE.Group(); scene.add(room);
  {
    const floor = add(room, new THREE.PlaneGeometry(14, 14), mat('#5a3b28', { roughness: 0.9 }), [0, 0, 0], [-Math.PI / 2, 0, 0]);
    floor.castShadow = false;
    // planks
    const plankTex = (() => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d');
      g.fillStyle = '#6b4630'; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 8; i++) {
        g.fillStyle = `hsl(${22 + Math.random() * 6}, ${38 + Math.random() * 10}%, ${26 + Math.random() * 8}%)`;
        g.fillRect(0, i * 64 + 1, 512, 62);
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, i * 64, 512, 2);
        const off = Math.random() * 512; g.fillRect(off, i * 64, 2, 64);
      }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    floor.material.map = plankTex; floor.material.color.set('#ffffff');

    const wallMat = mat('#c9b49a', { roughness: 0.95 });
    const back = add(room, new THREE.PlaneGeometry(14, 6), wallMat, [0, 3, -1.15]); back.castShadow = false;
    const left = add(room, new THREE.PlaneGeometry(14, 6), wallMat, [-2.2, 3, 0], [0, Math.PI / 2, 0]); left.castShadow = false;
    add(room, new THREE.BoxGeometry(14, 0.12, 0.03), mat('#3a2a1f'), [0, 0.06, -1.13]);

    // rug
    const rug = add(room, new THREE.CircleGeometry(1.05, 48), mat('#7d2f2a', { roughness: 1 }), [0.05, 0.004, 0.2], [-Math.PI / 2, 0, 0]);
    rug.castShadow = false;
    const rug2 = add(room, new THREE.RingGeometry(0.82, 0.88, 48), mat('#d9a441', { roughness: 1 }), [0.05, 0.006, 0.2], [-Math.PI / 2, 0, 0]);
    rug2.castShadow = false;

    // painting — nod to the red flowers behind Alban in his photo
    const pc = document.createElement('canvas'); pc.width = 512; pc.height = 360; const g = pc.getContext('2d');
    g.fillStyle = '#efe9df'; g.fillRect(0, 0, 512, 360);
    const flower = (x, y, s) => {
      g.strokeStyle = 'rgba(90,110,80,0.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y + 90, x - 4, y + 200); g.stroke();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.random();
        g.fillStyle = `rgba(${200 + Math.random() * 40}, ${50 + Math.random() * 30}, ${40}, 0.82)`;
        g.beginPath(); g.ellipse(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.35, s * 0.55, s * 0.32, a, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = '#5a2a1a'; g.beginPath(); g.arc(x, y, s * 0.14, 0, 7); g.fill();
    };
    flower(150, 110, 70); flower(320, 140, 80); flower(420, 70, 40);
    const ptex = new THREE.CanvasTexture(pc); ptex.colorSpace = THREE.SRGBColorSpace;
    const frame = new THREE.Group(); frame.position.set(-0.75, 2.0, -1.13); room.add(frame);
    add(frame, rbox(1.12, 0.82, 0.04, 0.01), mat('#2b1d15', { roughness: 0.5 }));
    add(frame, new THREE.PlaneGeometry(1.0, 0.7), new THREE.MeshStandardMaterial({ map: ptex, roughness: 0.9 }), [0, 0, 0.022]).castShadow = false;

    // shelf with books
    const shelf = new THREE.Group(); shelf.position.set(0.9, 1.75, -1.0); room.add(shelf);
    add(shelf, rbox(0.9, 0.03, 0.24, 0.005), mat('#3d2a1d'));
    const bookColors = ['#c0392b', '#e6b04a', '#2e6e8e', '#3b7a57', '#e8dcc6', '#6c3f8f', '#d35400'];
    let bx = -0.38;
    for (let i = 0; i < 9; i++) {
      const h = 0.17 + Math.random() * 0.08, w = 0.035 + Math.random() * 0.025;
      add(shelf, rbox(w, h, 0.17, 0.004), mat(bookColors[i % bookColors.length], { roughness: 0.6 }), [bx + w / 2, h / 2 + 0.015, 0], [0, 0, i === 6 ? 0.22 : 0]);
      bx += w + 0.006;
    }
    add(shelf, new THREE.SphereGeometry(0.06, 24, 16), mat('#e6d3b3'), [0.3, 0.075, 0]); // little globe
  }
  return room;
}
