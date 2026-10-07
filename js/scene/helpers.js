import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...o });

export const add = (parent, geo, material, pos = [0, 0, 0], rot = [0, 0, 0], scale) => {
  const m = new THREE.Mesh(geo, material);
  m.position.set(...pos); m.rotation.set(...rot);
  if (scale) m.scale.set(...scale);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
};

export const rbox = (w, h, d, r = 0.02) => new RoundedBoxGeometry(w, h, d, 3, r);
