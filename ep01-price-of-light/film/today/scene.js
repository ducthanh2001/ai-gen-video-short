// TODAY (house style, 3D): an evening desk under an LED desk lamp. The same 1,000 lumen-hours cost ~0.2 s of work (FACTS.md §B).
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makePost } from '/core/three/post.js';
import { overlay, qn, T } from '../common/overlay.js';
// cues: on=<s> the lamp switches on (default: already on) · tags/say via common/overlay.js · camera dollies in over the shot (T)

const W = 1920, H = 1080;
await Promise.all(['300 54px Inter', '600 30px Inter', '400 22px Inter', '800 60px Inter'].map(f => document.fonts.load(f)));
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const ov = document.getElementById('c'); document.body.insertBefore(renderer.domElement, ov);
const BG = new THREE.Color('#2a2833');
const scene = new THREE.Scene(); scene.background = BG; scene.fog = new THREE.Fog(BG, 8, 30);
const camera = new THREE.PerspectiveCamera(30, W / H, .02, 60);
const post = makePost(renderer, scene, camera, W, H, { ssaa: 2, ao: true, aoRadius: .06, aoThickness: .3, aoScale: 1.4, aoAmt: .6 });
post.bloom.strength = .35; post.bloom.threshold = .95; post.vig.uniforms.amt.value = .42; post.vig.uniforms.warm.value = .3;

const hdr = await new RGBELoader().loadAsync('/core/assets/polyhaven/photo_studio_loft_hall_2k.hdr');
hdr.mapping = THREE.EquirectangularReflectionMapping; scene.environment = hdr; scene.environmentIntensity = .18;
const fill = new THREE.DirectionalLight('#9fb4ff', .25); fill.position.set(4, 3, -3); scene.add(fill);

// desk
const TL = new THREE.TextureLoader(), tex = async (u, srgb) => { const t = await TL.loadAsync(u); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 16; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1.5, 1); return t; };
const [wD, wN, wR] = await Promise.all([tex('/core/assets/polyhaven/walnut_diff.jpg', true), tex('/core/assets/polyhaven/walnut_nor.jpg'), tex('/core/assets/polyhaven/walnut_rough.jpg')]);
const desk = new THREE.Mesh(new THREE.BoxGeometry(3.2, .06, 1.6), new THREE.MeshStandardMaterial({ map: wD, normalMap: wN, roughnessMap: wR, roughness: 1, color: '#b09078' }));
desk.position.y = -.03; desk.receiveShadow = true; scene.add(desk);

// the lamp (Poly Haven desk_lamp_arm_01, CC0), scaled to ~0.5 m tall
const gltf = await new GLTFLoader().loadAsync('/core/assets/polyhaven/desk_lamp_arm_01/desk_lamp_arm_01.gltf');
const lamp = gltf.scene; lamp.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
const bb = new THREE.Box3().setFromObject(lamp), size = bb.getSize(new THREE.Vector3()), k = .52 / size.y;
lamp.scale.setScalar(k); lamp.position.set(-.55 - (bb.min.x + bb.max.x) / 2 * k, -bb.min.y * k, -.15 - (bb.min.z + bb.max.z) / 2 * k);
scene.add(lamp);
const lb = new THREE.Box3().setFromObject(lamp);
// the head is the far end of the arm: put a warm LED spot just under the top of the model, aimed at the book
lamp.updateMatrixWorld(true);
const top = []; const v = new THREE.Vector3();
lamp.traverse(o => { if (!o.isMesh) return; const pa = o.geometry.attributes.position; for (let i = 0; i < pa.count; i += 3) { v.fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld); if (v.y > lb.max.y - .09) top.push(v.clone()); } });
const headPos = top.reduce((a, b) => a.add(b), new THREE.Vector3()).multiplyScalar(1 / Math.max(1, top.length)); headPos.y -= .06;
const spot = new THREE.SpotLight('#fff0d6', 9, 3, .62, .55, 1.6); spot.position.copy(headPos); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -.0005;
spot.target.position.set(.12, 0, .2); scene.add(spot, spot.target);
const bulb = new THREE.Mesh(new THREE.SphereGeometry(.018, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff8e6' })); bulb.position.copy(headPos); scene.add(bulb);
// an open book + a phone
const paper = new THREE.MeshStandardMaterial({ color: '#f1ebdf', roughness: .9 });
for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.26, .012, .36), paper); p.position.set(.12 + s * .135, .006, .2); p.rotation.z = s * -.05; p.castShadow = p.receiveShadow = true; scene.add(p); }
const cover = new THREE.Mesh(new THREE.BoxGeometry(.56, .006, .38), new THREE.MeshStandardMaterial({ color: '#7a2f22', roughness: .6 })); cover.position.set(.12, .002, .2); cover.receiveShadow = true; scene.add(cover);
const phone = new THREE.Mesh(new THREE.BoxGeometry(.075, .008, .155), new THREE.MeshStandardMaterial({ color: '#16161a', roughness: .3, metalness: .4 })); phone.position.set(.62, .004, .28); phone.rotation.y = -.35; phone.castShadow = true; scene.add(phone);
const mug = new THREE.Mesh(new THREE.CylinderGeometry(.045, .04, .1, 32), new THREE.MeshStandardMaterial({ color: '#e9e4da', roughness: .4 })); mug.position.set(.66, .05, -.05); mug.castShadow = mug.receiveShadow = true; scene.add(mug);

camera.position.set(.25, .62, 1.55); camera.lookAt(.02, .18, .05); camera.updateMatrixWorld();
post.dof.focus = camera.position.distanceTo(new THREE.Vector3(.12, .02, .2)); post.dof.aper = 7; post.dof.maxCoc = 12;

const g = ov.getContext('2d'), NOW_ONLY = new URLSearchParams(location.search).get('bare'), ON = qn('on', -1);
const C0 = camera.position.clone(), LOOK = new THREE.Vector3(.02, .18, .05), E0 = scene.environmentIntensity;
window.render = (t = 0) => {
  const lit = t >= ON, k = lit ? Math.min(1, (t - ON) / .12) : 0;          // an LED: on in a blink
  spot.intensity = 9 * k; bulb.material.color.set(k > .5 ? '#fff8e6' : '#3a3833'); scene.environmentIntensity = E0 * (.45 + .55 * k);
  post.bloom.strength = .35 * k;
  const u = Math.min(1, t / Math.max(1, T)), e = u * u * (3 - 2 * u);
  camera.position.copy(C0).lerp(new THREE.Vector3(.18, .52, 1.28), NOW_ONLY ? 0 : e * .55); camera.lookAt(LOOK); camera.updateMatrixWorld();
  post.composer.render(); g.clearRect(0, 0, W, H);
  if (NOW_ONLY) return;
  g.globalAlpha = k; g.font = '800 60px Inter'; g.fillStyle = '#f4efe6'; g.textAlign = 'right'; g.fillText('TODAY', W - 96, 130);
  g.font = '400 24px Inter'; g.fillStyle = 'rgba(244,239,230,.75)'; g.fillText('an LED desk lamp, an ordinary evening', W - 96, 172); g.globalAlpha = 1;
  overlay(g, t);
};
window.DUR = 1; window.READY = true;
render();
