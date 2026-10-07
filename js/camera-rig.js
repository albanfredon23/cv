import * as THREE from 'three';

// Named camera shots and eased transitions between them (optionally curving through a via point).
export function createCameraRig(screenWorld, reduceMotion) {
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const isNarrow = () => innerWidth < 760;
  const SHOTS = {
    idle: () => isNarrow()
      ? { pos: new THREE.Vector3(2.0, 1.75, 1.9), look: new THREE.Vector3(0.0, 0.95, -0.3), fov: 50 }
      : { pos: new THREE.Vector3(2.15, 1.6, 1.05), look: new THREE.Vector3(-0.1, 1.0, -0.38), fov: 38 },
    screen: () => ({ pos: screenWorld.clone().add(new THREE.Vector3(0, 0, 0.3)), look: screenWorld.clone(), fov: 60 }),
    contact: () => isNarrow()
      ? { pos: new THREE.Vector3(0.2, 1.85, 3.3), look: new THREE.Vector3(0.05, 0.72, 0.0), fov: 46 }
      : { pos: new THREE.Vector3(0.7, 1.5, 2.75), look: new THREE.Vector3(0.62, 1.12, 0.1), fov: 38 },
  };
  const cam = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 38 };
  let shot = null;
  function setShot(name, dur = 1.6, via = null) {
    const to = SHOTS[name]();
    if (reduceMotion || dur === 0) { cam.pos.copy(to.pos); cam.look.copy(to.look); cam.fov = to.fov; shot = null; return Promise.resolve(); }
    return new Promise((resolve) => {
      shot = { from: { pos: cam.pos.clone(), look: cam.look.clone(), fov: cam.fov }, to, via, t: 0, dur, resolve };
    });
  }
  function updateShot(dt) {
    if (!shot) return;
    shot.t = Math.min(1, shot.t + dt / shot.dur);
    const k = ease(shot.t);
    if (shot.via) {
      const a = shot.from.pos, b = shot.via, c = shot.to.pos, u = 1 - k;
      cam.pos.set(u * u * a.x + 2 * u * k * b.x + k * k * c.x, u * u * a.y + 2 * u * k * b.y + k * k * c.y, u * u * a.z + 2 * u * k * b.z + k * k * c.z);
    } else cam.pos.lerpVectors(shot.from.pos, shot.to.pos, k);
    cam.look.lerpVectors(shot.from.look, shot.to.look, k);
    cam.fov = THREE.MathUtils.lerp(shot.from.fov, shot.to.fov, k);
    if (shot.t >= 1) { const r = shot.resolve; shot = null; r(); }
  }

  return { cam, setShot, updateShot, isMoving: () => shot !== null };
}
