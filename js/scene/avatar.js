import * as THREE from 'three';
import { mat, add, rbox } from './helpers.js';

// Chibi Alban, after his portrait: very short hair, thick round black glasses, light beard, black tee, on a swivel chair.
export function buildAvatar(scene) {
  const SKIN = '#6a3f2a';
  const skin = mat(SKIN, { roughness: 0.42 });          // a bit glossy: the shine on his head
  const skinDark = mat('#55311f', { roughness: 0.6 });
  const tee = mat('#1c1b1f', { roughness: 0.9 });
  const jeans = mat('#34405a', { roughness: 0.85 });
  const shoe = mat('#ece7dc', { roughness: 0.6 });
  const black = new THREE.MeshStandardMaterial({ color: '#0d0907', roughness: 0.2 });

  const chair = new THREE.Group(); chair.position.set(0, 0, 0.14); scene.add(chair);
  const SEAT_Y = 0.47;
  {
    const cm = mat('#2d2a2a', { roughness: 0.7 });
    add(chair, new THREE.CylinderGeometry(0.03, 0.03, SEAT_Y - 0.08, 12), mat('#888', { metalness: 0.8, roughness: 0.3 }), [0, (SEAT_Y - 0.08) / 2 + 0.06, 0]);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      add(chair, rbox(0.26, 0.03, 0.04, 0.01), cm, [Math.cos(a) * 0.13, 0.06, Math.sin(a) * 0.13], [0, -a, 0]);
      add(chair, new THREE.SphereGeometry(0.025, 12, 8), cm, [Math.cos(a) * 0.25, 0.025, Math.sin(a) * 0.25]);
    }
    add(chair, rbox(0.46, 0.07, 0.44, 0.03), mat('#c0392b', { roughness: 0.8 }), [0, SEAT_Y - 0.035, 0]);
    add(chair, rbox(0.44, 0.42, 0.06, 0.03), mat('#c0392b', { roughness: 0.8 }), [0, SEAT_Y + 0.27, 0.24], [-0.12, 0, 0]);
    add(chair, rbox(0.04, 0.2, 0.04, 0.01), cm, [0, SEAT_Y + 0.03, 0.24]);
  }

  const avatar = new THREE.Group(); avatar.position.y = SEAT_Y; chair.add(avatar);
  const body = new THREE.Group(); avatar.add(body);

  // legs
  for (const s of [-1, 1]) {
    add(avatar, new THREE.CapsuleGeometry(0.085, 0.2, 6, 16), jeans, [s * 0.1, 0.08, -0.14], [Math.PI / 2, 0, 0]);
    add(avatar, new THREE.CapsuleGeometry(0.075, 0.24, 6, 16), jeans, [s * 0.1, -0.16, -0.3]);
    add(avatar, new THREE.SphereGeometry(0.08, 20, 14), shoe, [s * 0.1, -0.41, -0.36], [0, 0, 0], [1, 0.65, 1.5]);
  }
  // torso
  const torso = add(body, new THREE.CapsuleGeometry(0.19, 0.2, 8, 24), tee, [0, 0.31, 0.02], [0, 0, 0], [1.08, 1, 0.9]);
  add(body, new THREE.TorusGeometry(0.07, 0.012, 8, 24), tee, [0, 0.53, -0.015], [Math.PI / 2 + 0.25, 0, 0]);
  add(body, new THREE.CylinderGeometry(0.065, 0.07, 0.1, 20), skin, [0, 0.56, 0.0]);

  // head, after Alban's portrait: longer oval head, very short hair with a clean hairline,
  // thick round black glasses, strong brows, calm eyes, broad nose, gentle closed smile, light beard
  const head = new THREE.Group(); head.position.set(0, 0.6, 0); body.add(head);
  const HEAD_R = 0.29, HEAD_S = [0.93, 1.1, 0.98];
  add(head, new THREE.SphereGeometry(HEAD_R, 48, 36), skin, [0, 0.27, 0], [0, 0, 0], HEAD_S);
  // jaw and chin: a softer, slightly narrower lower face
  add(head, new THREE.SphereGeometry(0.2, 32, 24), skin, [0, 0.13, -0.06], [0, 0, 0], [1, 0.9, 1]);
  for (const s of [-1, 1]) {
    const ear = add(head, new THREE.SphereGeometry(0.07, 20, 14), skin, [s * 0.272, 0.26, 0.03], [0, s * 0.35, 0], [0.5, 1.12, 0.85]);
    add(ear, new THREE.SphereGeometry(0.045, 16, 12), skinDark, [s * 0.035, 0, -0.008], [0, 0, 0], [0.35, 0.75, 0.6]);
  }
  // very short dark hair, higher at the forehead than at the nape, with a crisp edge
  const hair = mat('#1d130d', { roughness: 1 });
  // (both pieces share the head's centre and scale, so they hug it everywhere)
  add(head, new THREE.SphereGeometry(HEAD_R + 0.005, 48, 24, 0, Math.PI * 2, 0, 1.1), hair, [0, 0.27, 0], [0, 0, 0], HEAD_S);
  add(head, new THREE.SphereGeometry(HEAD_R + 0.004, 40, 24, Math.PI / 2 - 1.2, 2.4, 0.5, 1.3), hair, [0, 0.27, 0], [0, 0, 0], HEAD_S);

  const face = new THREE.Group(); face.position.set(0, 0.26, 0); head.add(face);
  const eyes = [];
  const sclera = mat('#f3ede4', { roughness: 0.3 }), iris = mat('#3a2213', { roughness: 0.3 });
  const browMat = mat('#150d08', { roughness: 0.95 }), frame = new THREE.MeshStandardMaterial({ color: '#121212', roughness: 0.3, metalness: 0.2 });
  for (const s of [-1, 1]) {
    const eye = new THREE.Group(); eye.position.set(s * 0.095, 0.012, -0.258); face.add(eye);
    add(eye, new THREE.SphereGeometry(0.042, 24, 16), sclera, [0, 0, 0], [0, 0, 0], [1, 0.82, 0.5]);
    add(eye, new THREE.SphereGeometry(0.025, 20, 14), iris, [s * -0.004, -0.003, -0.016], [0, 0, 0], [1, 1, 0.45]);
    add(eye, new THREE.SphereGeometry(0.013, 14, 10), black, [s * -0.004, -0.003, -0.026], [0, 0, 0], [1, 1, 0.4]);
    add(eye, new THREE.SphereGeometry(0.007, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }), [s * 0.006 + 0.004, 0.009, -0.03]);
    // relaxed upper lid: the calm, half-lidded look of the portrait
    add(eye, new THREE.SphereGeometry(0.046, 24, 12, 0, Math.PI * 2, 0, 0.62), skin, [0, 0.004, 0.002], [-0.32, 0, 0], [1.04, 0.9, 0.85]);
    eyes.push(eye);
    // thick, gently arched brows
    add(face, new THREE.CapsuleGeometry(0.014, 0.062, 4, 10), browMat, [s * 0.1, 0.092, -0.262], [0, s * 0.25, Math.PI / 2 + s * -0.16]);
    // thick round black frames
    add(face, new THREE.TorusGeometry(0.076, 0.0105, 12, 48), frame, [s * 0.098, 0.01, -0.3]);
    const lens = add(face, new THREE.CircleGeometry(0.072, 32), new THREE.MeshStandardMaterial({ color: '#c9d8ff', transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0.4 }), [s * 0.098, 0.01, -0.298], [0, Math.PI, 0]);
    lens.castShadow = false;
    add(face, new THREE.CylinderGeometry(0.007, 0.007, 0.27, 8), frame, [s * 0.178, 0.03, -0.165], [Math.PI / 2, 0, s * 0.08]);
    // light beard along the jaw
    add(face, new THREE.SphereGeometry(0.09, 20, 14), mat('#1f130d', { roughness: 1, transparent: true, opacity: 0.12 }), [s * 0.13, -0.12, -0.16], [0, s * 0.5, 0], [0.7, 0.9, 0.9]);
  }
  add(face, new THREE.TorusGeometry(0.016, 0.0075, 8, 16, Math.PI), frame, [0, 0.028, -0.302]);
  // broad nose with soft wings
  add(face, new THREE.SphereGeometry(0.034, 20, 14), skin, [0, -0.03, -0.29], [0, 0, 0], [1.05, 1.05, 1]);
  for (const s of [-1, 1]) add(face, new THREE.SphereGeometry(0.022, 14, 10), skinDark, [s * 0.03, -0.05, -0.275], [0, 0, 0], [1, 0.85, 0.9]);
  add(face, new THREE.CapsuleGeometry(0.01, 0.03, 4, 8), skinDark, [0, -0.012, -0.302], [0, 0, 0], [1, 1, 0.8]);
  // gentle closed smile with fuller lips
  const lips = mat('#5b2f22', { roughness: 0.55 });
  const mouth = new THREE.Group(); mouth.position.set(0, -0.106, -0.262); face.add(mouth);
  add(mouth, new THREE.CapsuleGeometry(0.011, 0.05, 4, 10), lips, [0, 0.006, 0], [0, 0, Math.PI / 2], [1, 1, 0.8]);
  add(mouth, new THREE.CapsuleGeometry(0.013, 0.042, 4, 10), mat('#6a3729', { roughness: 0.5 }), [0, -0.014, 0.004], [0, 0, Math.PI / 2], [1, 1, 0.8]);
  add(mouth, new THREE.TorusGeometry(0.034, 0.0035, 6, 20, Math.PI * 0.6), mat('#2a120c'), [0, 0.02, -0.008], [0, 0, Math.PI * 1.2]);
  // moustache shadow and chin stubble
  add(face, new THREE.SphereGeometry(0.045, 16, 10), mat('#1f130d', { roughness: 1, transparent: true, opacity: 0.16 }), [0, -0.078, -0.262], [0, 0, 0], [1.3, 0.35, 0.5]);
  add(face, new THREE.SphereGeometry(0.07, 20, 14), mat('#1f130d', { roughness: 1, transparent: true, opacity: 0.2 }), [0, -0.165, -0.21], [0, 0, 0], [1.3, 0.75, 0.7]);

  // arms
  function makeArm(s) {
    const shoulder = new THREE.Group(); shoulder.position.set(s * 0.215, 0.44, 0.0); body.add(shoulder);
    add(shoulder, new THREE.SphereGeometry(0.075, 16, 12), tee, [0, -0.02, 0]);
    add(shoulder, new THREE.CapsuleGeometry(0.058, 0.08, 6, 12), tee, [0, -0.07, 0]);
    add(shoulder, new THREE.CapsuleGeometry(0.048, 0.06, 6, 12), skin, [0, -0.14, 0]);
    const elbow = new THREE.Group(); elbow.position.set(0, -0.17, 0); shoulder.add(elbow);
    add(elbow, new THREE.CapsuleGeometry(0.044, 0.12, 6, 12), skin, [0, -0.08, 0]);
    const hand = add(elbow, new THREE.SphereGeometry(0.055, 16, 12), skin, [0, -0.17, 0], [0, 0, 0], [1, 0.9, 0.75]);
    return { shoulder, elbow, hand };
  }
  const armL = makeArm(-1), armR = makeArm(1);

  let blinkT = 2.5;
  const tmpV = new THREE.Vector3(), tmpL = new THREE.Vector3();

  // s: { swivel, lookAtCam, typingNow, wave, talk }
  function update(dt, t, camera, s) {
    chair.rotation.y = s.swivel;

    // head aims at the screen, or turns to the visitor
    const headWorld = head.getWorldPosition(tmpV);
    const toCam = tmpL.copy(camera.position).sub(headWorld);
    const yawCam = Math.atan2(-toCam.x, -toCam.z) - s.swivel;
    const wrapped = Math.atan2(Math.sin(yawCam), Math.cos(yawCam));
    const yaw = THREE.MathUtils.clamp(wrapped, -1.25, 1.25) * s.lookAtCam;
    const pitch = THREE.MathUtils.lerp(0.06, -0.08, s.lookAtCam);
    head.rotation.y += (yaw - head.rotation.y) * Math.min(1, dt * 6);
    head.rotation.x += (pitch - head.rotation.x) * Math.min(1, dt * 6);
    head.rotation.z = Math.sin(t * 0.9) * 0.025;

    // blink
    blinkT -= dt;
    const blink = blinkT < 0.12 ? 0.1 : 1;
    if (blinkT < 0) blinkT = 2 + Math.random() * 3.5;
    eyes.forEach((e) => (e.scale.y = blink));

    // breathing
    body.position.y = Math.sin(t * 2) * 0.006;
    torso.scale.x = 1.08 + Math.sin(t * 2) * 0.012;

    // arms: typing at the desk, resting or waving once turned around
    const facingDesk = 1 - THREE.MathUtils.clamp(Math.abs(s.swivel) / 1.2, 0, 1);
    const type = s.typingNow && facingDesk > 0.9 && s.lookAtCam < 0.5 ? 1 : 0.15;
    for (const [arm, ph, side] of [[armL, 0, -1], [armR, 1.7, 1]]) {
      const tap = Math.max(0, Math.sin(t * 17 + ph * 3.1 + Math.sin(t * 5 + ph) * 2)) * 0.11 * type;
      const desired = { sx: THREE.MathUtils.lerp(0.25, 0.95, facingDesk), sz: side * THREE.MathUtils.lerp(0.18, 0.12, facingDesk), ex: THREE.MathUtils.lerp(0.4, 0.75, facingDesk) - tap };
      const waving = side === 1 && s.wave > 0;
      if (waving) { desired.sx = 0.25; desired.sz = 2.5; desired.ex = 0.3 + Math.sin(t * 9) * 0.35; }
      arm.shoulder.rotation.x += (desired.sx - arm.shoulder.rotation.x) * Math.min(1, dt * 8);
      arm.shoulder.rotation.z += (desired.sz - arm.shoulder.rotation.z) * Math.min(1, dt * 8);
      arm.elbow.rotation.x += (desired.ex - arm.elbow.rotation.x) * Math.min(1, dt * 10);
      if (waving) arm.elbow.rotation.z = Math.sin(t * 9) * 0.35;
      else arm.elbow.rotation.z *= 0.9;
    }
    mouth.scale.set(1, 1 + (s.talk > 0 ? Math.abs(Math.sin(t * 14)) * 0.6 : 0), 1);
  }

  return { chair, head, update };
}
