// House style (Data Physicalization): the labour price of 1,000 lumen-hours as stacks of plates, exact scale.
// 1 plate = 1 hour of work; every 10th plate is brass (the stack is its own ruler). Data: FACTS.md §A1, §B.
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { makePost } from '/core/three/post.js';
import { overlay, qn, T } from '../common/overlay.js';
// cues: grow=1 the stacks are built plate by plate (g0..g3 = start of each stack, s) · say via common/overlay.js

const W = 1920, H = 1080, INK = '#1c1d20', INK2 = 'rgba(28,29,32,.62)', ACC = '#c8502a';
await Promise.all(['300 54px Inter', '500 24px Inter', '400 22px Inter', '600 30px Inter', '400 20px JBMono'].map(f => document.fonts.load(f)));
const STACKS = [
  { name: 'BABYLON', sub: 'c. 1750 BC · sesame-oil lamp', h: 41.5, label: '41.5 hours' },
  { name: '1800', sub: 'tallow candle', h: 5.387, label: '5.4 hours' },
  { name: '1900', sub: 'early electric light', h: 0.2204, label: '13 minutes' },
  { name: 'TODAY', sub: 'LED · too thin to see', h: 0.0000542, label: '0.2 seconds' },
];
const SW = .62, SD = .5, TH = .034, GAP = 1.05, BASE_H = .08;

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.14;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const ov = document.getElementById('c'); document.body.insertBefore(renderer.domElement, ov);
const BG = new THREE.Color('#c9c2b6');
const scene = new THREE.Scene(); scene.background = BG; scene.fog = new THREE.Fog(BG, 14, 40);
const camera = new THREE.PerspectiveCamera(24, W / H, .05, 80);
const post = makePost(renderer, scene, camera, W, H, { ssaa: 2, ao: true, aoRadius: .1, aoThickness: .4, aoScale: 1.6, aoAmt: .7 });
post.bloom.strength = .06; post.bloom.threshold = 1.6; post.vig.uniforms.amt.value = .26; post.vig.uniforms.warm.value = .2;

const hdr = await new RGBELoader().loadAsync('/core/assets/polyhaven/photo_studio_loft_hall_2k.hdr');
hdr.mapping = THREE.EquirectangularReflectionMapping; scene.environment = hdr; scene.environmentIntensity = 1.25; scene.environmentRotation = new THREE.Euler(0, 2.2, 0);
const key = new THREE.DirectionalLight('#fff1dc', 3.0); key.position.set(-6, 4.4, 2.4); key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 20 }); key.shadow.bias = -.0002; key.shadow.normalBias = .004; key.shadow.radius = 3;
const rim = new THREE.DirectionalLight('#b9d2ff', 1.8); rim.position.set(5, 3, -5);
scene.add(key, rim, new THREE.DirectionalLight('#eef2f8', .5));
const TL = new THREE.TextureLoader(), tex = async (u, srgb) => { const t = await TL.loadAsync(u); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 16; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(2.2, .5); return t; };
const [wD, wN, wR] = await Promise.all([tex('/core/assets/polyhaven/walnut_diff.jpg', true), tex('/core/assets/polyhaven/walnut_nor.jpg'), tex('/core/assets/polyhaven/walnut_rough.jpg')]);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: '#c2bbae', roughness: .95 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const base = new THREE.Mesh(new THREE.BoxGeometry(GAP * 4 + .3, BASE_H, 1.0), new THREE.MeshStandardMaterial({ map: wD, normalMap: wN, roughnessMap: wR, roughness: 1, color: '#a88d78' }));
base.position.set(0, BASE_H / 2, 0); base.castShadow = base.receiveShadow = true; scene.add(base);
const alu = new THREE.MeshStandardMaterial({ color: '#dde1e6', metalness: 1, roughness: .33 }), brass = new THREE.MeshStandardMaterial({ color: '#d2b07a', metalness: 1, roughness: .27 });
const xs = STACKS.map((_, i) => (i - 1.5) * GAP), plates = STACKS.map(() => []);
STACKS.forEach((s, i) => {
  const full = Math.floor(s.h), frac = s.h - full;
  for (let k = 0; k < full + (frac > 0 ? 1 : 0); k++) {
    const th = k < full ? TH : TH * frac; if (th < .0004) continue;
    const m = new THREE.Mesh(new THREE.BoxGeometry(SW, th * .985, SD), (k + 1) % 10 === 0 ? brass : alu);
    const jit = Math.sin(k * 12.9 + i * 3.1) * .006;
    m.position.set(xs[i] + jit, BASE_H + k * TH + th / 2, Math.cos(k * 7.7 + i) * .006); m.rotation.y = Math.sin(k * 3.3 + i) * .012;
    m.castShadow = m.receiveShadow = true; scene.add(m); plates[i].push(m);
  }
  s.top = new THREE.Vector3(xs[i], BASE_H + s.h * TH, 0);
});

camera.position.set(-.9, 1.55, 8.6); camera.lookAt(.05, .7, 0); camera.updateMatrixWorld();
post.dof.focus = camera.position.distanceTo(new THREE.Vector3(xs[1], .4, 0)); post.dof.aper = 6; post.dof.maxCoc = 12;
const proj = v => { const p = v.clone().project(camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; };

const g = ov.getContext('2d');
function txt(s, x, y, font, color, align = 'left') { g.font = font; g.fillStyle = color; g.textAlign = align; g.fillText(s, x, y); }
function labels() {
  g.clearRect(0, 0, W, H);
  txt('What 1,000 lumen-hours of light cost a worker', W - 96, 110, '600 30px Inter', INK, 'right');
  txt('1 plate = 1 hour of work  ·  every 10th plate in brass', W - 96, 148, '400 22px Inter', INK2, 'right');
  STACKS.forEach((s, i) => {
    if (shownAt[i] <= 0) return; g.globalAlpha = shownAt[i];
    const [ax, ay] = proj(s.top), lx = ax, ly = Math.min(ay - 80, 560);
    g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(ax, ay - 4); g.lineTo(lx, ly + 34); g.stroke();
    g.fillStyle = i === 3 ? ACC : INK; g.beginPath(); g.arc(ax, ay - 4, 3.4, 0, 7); g.fill();
    g.globalAlpha = .84; g.fillStyle = '#efebe4'; g.beginPath(); g.roundRect(lx - 120, ly - 108, 240, 112, 5); g.fill(); g.globalAlpha = 1;
    txt(s.name, lx, ly - 76, '500 24px Inter', INK, 'center');
    txt(s.label, lx, ly - 26, '300 44px Inter', i === 3 ? ACC : INK, 'center');
    txt(s.sub, lx, ly - 2 + 22, '400 18px Inter', INK2, 'center'); g.globalAlpha = 1;
  });
  txt('Sources: W. Nordhaus (1996), Table 1.4 · today: BLS & EIA 2026, LED ≈ 90 lm/W (our calculation)', 96, H - 60, '400 20px JBMono', INK2);
}
const GROW = qn('grow', 0), G0 = [0, 1, 2, 3].map(i => qn('g' + i, .4 + i * 1.7)), C0 = camera.position.clone();
const shownAt = [1, 1, 1, 1];
window.render = (t = 99) => {
  STACKS.forEach((st, i) => {
    const d = Math.min(2.2, .4 + st.h * .05), u = GROW ? Math.max(0, Math.min(1, (t - G0[i]) / d)) : 1;
    const n = Math.ceil(plates[i].length * u * (2 - u) - 1e-6);            // ease-out: fast first, settling on top
    plates[i].forEach((m, k) => { m.visible = k < n; });
    shownAt[i] = GROW ? Math.max(0, Math.min(1, (t - G0[i] - d + .1) / .4)) : 1;
  });
  const u = Math.min(1, t / Math.max(1, T)), e = u * u * (3 - 2 * u);
  camera.position.set(C0.x - .25 * (1 - e), C0.y + .1 * (1 - e), C0.z + .9 * (1 - e)); camera.lookAt(.05, .7, 0); camera.updateMatrixWorld();
  post.composer.render(); labels(); overlay(g, t);
};
window.DUR = 1; window.READY = true;
render(99);
