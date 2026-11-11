// shots_b.js: workshop (4, 5a, 5b), exterior eclipse (7), void (9)
'use strict';
const WS = {}, EX = {}, VD = {};
{ const prev = buildMore; buildMore = () => { prev && prev(); buildShop(); buildExterior(); buildVoid(); }; }

function woodTex(c1, c2, rep) {
  return ctex(512, 512, (x) => { x.fillStyle = c1; x.fillRect(0, 0, 512, 512); const r = rng(11); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? c2 : c1; x.fillRect(0, i * 64, 512, 64); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, i * 64, 512, 3); }
    for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(60,30,10,${r() * .12})`; x.fillRect(r() * 512, r() * 512, 20 + r() * 90, 1 + r() * 2); } }, { repeat: rep });
}
function buildShop() {
  const L = group(scene, [60, 0, 0]); L.userData.name = 'shop'; WS.L = L; LOC.shop = L; L.visible = false;
  const wood = std(0xffffff, .7, 0, { map: woodTex('#b8814f', '#a5703f', [3, 3]) });
  mesh(new T.PlaneGeometry(12, 12), wood, { parent: L, rot: [-Math.PI / 2, 0, 0], cast: false });
  const wallT = ctex(512, 512, (x) => { x.fillStyle = '#e8b987'; x.fillRect(0, 0, 512, 512); const r = rng(4); for (let i = 0; i < 40; i++) { const bx = (i % 8) * 64, by = Math.floor(i / 8) * 100; x.fillStyle = `rgba(150,90,50,${.05 + r() * .08})`; x.fillRect(bx + 3, by + 3, 58, 94); } x.strokeStyle = 'rgba(120,70,40,.3)'; x.lineWidth = 3; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 512); x.stroke(); } }, { repeat: [2, 1] });
  const wm = std(0xffffff, .9, 0, { map: wallT });
  mesh(new T.PlaneGeometry(12, 7), wm, { parent: L, pos: [0, 3.5, -3], cast: false });
  mesh(new T.PlaneGeometry(12, 7), wm, { parent: L, pos: [-4.5, 3.5, 0], rot: [0, Math.PI / 2, 0], cast: false });
  mesh(new T.PlaneGeometry(12, 7), wm, { parent: L, pos: [4.5, 3.5, 0], rot: [0, -Math.PI / 2, 0], cast: false });
  // window (warm dusk light) in the back wall
  const wn = new T.Mesh(new T.PlaneGeometry(1.6, 2.2), new T.MeshBasicMaterial({ color: new T.Color(2.2, 1.8, 1.1), fog: false })); wn.position.set(2.4, 3.0, -2.97); L.add(wn);
  mesh(roundedBox(1.9, 0.14, 0.18, .04), std(0x6a4524, .8), { parent: L, pos: [2.4, 4.15, -2.95], cast: false }); mesh(roundedBox(1.9, 0.14, 0.2, .04), std(0x6a4524, .8), { parent: L, pos: [2.4, 1.85, -2.95], cast: false });
  for (const s of [-1, 1]) mesh(roundedBox(0.14, 2.4, 0.18, .04), std(0x6a4524, .8), { parent: L, pos: [2.4 + s * .8, 3.0, -2.95], cast: false });
  // bench
  const bw = std(0xffffff, .65, 0, { map: woodTex('#c08a55', '#b27a48', [2, 1]) });
  mesh(roundedBox(5.0, 0.16, 1.5, .05), bw, { parent: L, pos: [0, 0.96, -0.9], ol: 0.02 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(roundedBox(0.2, 0.9, 0.2, .04), std(0x7a4a2a, .8), { parent: L, pos: [sx * 2.3, 0.45, -0.9 + sz * .6] });
  mesh(roundedBox(4.8, 0.14, 1.3, .03), std(0x7a4a2a, .8), { parent: L, pos: [0, 0.35, -0.9] });
  // vise + gear
  const vise = group(L, [-0.2, 1.04, -0.55]);
  mesh(roundedBox(0.5, 0.22, 0.3, .04), std(0x4a4a56, .4, .8), { parent: vise, pos: [0, 0.1, 0], ol: 0.015 }); mesh(new T.CylinderGeometry(0.03, 0.03, 0.5, 8), std(0x2a2a30, .5, .6), { parent: vise, pos: [0.0, 0.1, 0.32], rot: [Math.PI / 2, 0, 0] });
  const gearBlank = mesh(gearGeo(24, 0.34, 0.07, 0.08, { spokes: 5, hole: 0.04, spokeR: .16 }), BRASS(), { parent: vise, pos: [0, 0.48, 0], ol: 0.012 }); gearBlank.rotation.set(0, 0.0, 0); WS.gear = gearBlank;
  // file prop
  const file = group(L); WS.file = file;
  mesh(roundedBox(0.62, 0.05, 0.1, .015), std(0x9aa3ae, .35, .85), { parent: file, pos: [0.0, 0, 0], ol: 0.01 }); mesh(roundedBox(0.2, 0.09, 0.09, .03), std(0x8a4a22, .7), { parent: file, pos: [-0.42, 0, 0], ol: 0.012 });
  // shelf with jars and gears
  const shelf = group(L, [-2.6, 0, -2.6]);
  for (let i = 0; i < 3; i++) { mesh(roundedBox(2.6, 0.1, 0.6, .03), std(0x7a4a2a, .8), { parent: shelf, pos: [0, 1.4 + i * 1.0, 0.0] });
    for (let k = 0; k < 6; k++) { const q = (i * 7 + k) % 3; if (q === 0) mesh(lathe([[0, 0], [0.16, 0.02], [0.2, 0.2], [0.14, 0.38], [0.08, 0.42], [0.1, 0.5]], 18), std([0xc2663c, 0x6aa0a8, 0xd9a441][k % 3], .6), { parent: shelf, pos: [-1.05 + k * 0.42, 1.45 + i * 1.0, 0], ol: 0.02 });
      else if (q === 1) { const gm = mesh(gearGeo(12 + k * 2, 0.15, 0.04, 0.04, { hole: 0.02 }), k % 2 ? BRONZE() : BRASS(), { parent: shelf, pos: [-1.05 + k * 0.42, 1.65 + i * 1.0, 0.1] }); }
      else mesh(roundedBox(0.3, 0.22, 0.3, .05), std(0x8f6a46, .8), { parent: shelf, pos: [-1.05 + k * 0.42, 1.55 + i * 1.0, 0], ol: 0.015 }); } }
  // tool board with silhouettes
  const board = ctex(512, 256, (x) => { x.fillStyle = '#8a5a34'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#2a1a14'; x.strokeStyle = '#2a1a14'; x.lineWidth = 10; x.lineCap = 'round';
    x.beginPath(); x.moveTo(60, 200); x.lineTo(120, 60); x.stroke(); x.fillRect(90, 40, 70, 34); x.beginPath(); x.moveTo(200, 50); x.lineTo(200, 210); x.stroke(); x.beginPath(); x.arc(200, 70, 34, Math.PI, 0); x.stroke();
    x.beginPath(); x.moveTo(300, 40); x.lineTo(380, 210); x.stroke(); x.beginPath(); x.moveTo(380, 40); x.lineTo(300, 210); x.stroke(); x.beginPath(); x.arc(450, 120, 44, 0, 7); x.lineWidth = 16; x.stroke(); });
  mesh(new T.PlaneGeometry(3.2, 1.6), std(0xffffff, .8, 0, { map: board }), { parent: L, pos: [-0.2, 3.3, -2.96], cast: false });
  // lamp
  const lamp = group(L, [1.5, 1.04, -1.0]); mesh(lathe([[0, 0], [0.12, 0.02], [0.14, 0.12], [0.08, 0.2], [0.0, 0.22]], 16), std(0xd9a441, .35, .8), { parent: lamp, ol: 0.012 });
  const fl = new T.Mesh(new T.ConeGeometry(0.05, 0.16, 10), new T.MeshBasicMaterial({ color: new T.Color(3, 1.8, .5), fog: false })); fl.position.set(0, 0.3, 0); lamp.add(fl); WS.flame = fl;
  const gl_ = new T.Mesh(new T.PlaneGeometry(1.0, 1.0), new T.MeshBasicMaterial({ map: glowTex([[0, 'rgba(255,200,110,.9)'], [1, 'rgba(255,170,60,0)']]), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false })); gl_.position.set(0, 0.3, 0.05); lamp.add(gl_); WS.glow = gl_;
  // barrels + anvil
  for (const [bx, bz] of [[3.4, -2.2], [-3.6, -1.2]]) { const b = mesh(lathe([[0.0, 0], [0.4, 0], [0.5, 0.3], [0.52, 0.5], [0.5, 0.7], [0.4, 1.0], [0, 1.0]], 20), std(0x8a5a34, .75), { parent: L, pos: [bx, 0, bz], ol: 0.02 }); mesh(new T.TorusGeometry(0.5, 0.03, 8, 24), std(0x3a3a44, .5, .7), { parent: L, pos: [bx, 0.28, bz], rot: [Math.PI / 2, 0, 0] }); }
  mesh(roundedBox(0.7, 0.3, 0.4, .06), std(0x4a4a56, .4, .8), { parent: L, pos: [-3.0, 0.6, 0.9], ol: .02 }); mesh(roundedBox(0.4, 0.4, 0.3, .05), std(0x6a4524, .8), { parent: L, pos: [-3.0, 0.2, 0.9] });
  // sparks
  const sp = new Float32Array(40 * 3); WS.sparks = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(sp, 3)), new T.PointsMaterial({ map: glowTex([[0, 'rgba(255,240,200,1)'], [.3, 'rgba(255,170,60,.9)'], [1, 'rgba(255,100,0,0)']]), size: 0.09, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })); WS.sparks.frustumCulled = false; L.add(WS.sparks);
  // craftsman and the box
  WS.crafter = makeChar({ body: 0xc8643c, hat: g => capHat(g, 0x7a4a2a), flags: 's', deco: c => {
    mesh(new T.CylinderGeometry(0.315, 0.315, 0.62, 28, 1, true, -0.95, 1.9), std(0xe9d3a6, .9, 0, { side: T.DoubleSide }), { parent: c.bg, pos: [0, 0.36, 0], ol: false });
    mesh(new T.TorusGeometry(0.31, 0.025, 8, 28), std(0x6a4524, .8), { parent: c.bg, pos: [0, 0.62, 0], rot: [Math.PI / 2, 0, 0] }); } });
  L.add(WS.crafter.root); blob(WS.crafter.root, 0, 0, 0, .65, .9);
  WS.box = makeBox(); L.add(WS.box); WS.box.scale.setScalar(0.85);
  for (const o of [WS.crafter]) o.root.userData.keep = 1;
}
const shopLight = (o = {}) => Object.assign({ bg: [0.06, 0.04, 0.03], hemi: [0xffe3c2, 0xa5714a, 0.9], sun: { col: 0xffe2b8, int: 2.8, pos: [-3, 6, 6], target: [60, 1, -0.5], ext: 6, far: 20 }, rim: { col: 0xffb870, int: 2.0, pos: [3, 2.5, -4], target: [60, 1.4, -0.6] },
  pts: [{ p: [61.5, 1.6, -0.9], col: 0xffa850, int: 7, dist: 7 }], fog: [0x2a1a10, 0.01], env: 'hall', envInt: 0.5, grade: { tint: [1.05, 1.0, 0.94], sat: 1.12, vig: 0.34, bloom: 0.3 } }, o);
function shopUpdate(t) {
  WS.flame.scale.set(1, 1 + Math.sin(t * 14) * .12, 1); WS.glow.material.opacity = .85 + Math.sin(t * 9) * .1;
  const sp = WS.sparks.geometry.attributes.position;
  for (let i = 0; i < 40; i++) { const ph = (t * 5 + hash(i)) % 1, k = Math.floor(t * 5 + hash(i)), a = hash(k * 7 + i) * 6.28, v = 0.5 + hash(k + i * 3) * 0.9; sp.setXYZ(i, WS.sparkO.x + Math.cos(a) * v * ph * 0.5 * .5, WS.sparkO.y + (0.35 * ph - 1.6 * ph * ph * .35) * v, WS.sparkO.z + Math.sin(a) * v * ph * 0.35); }
  sp.needsUpdate = true;
}
WS.sparkO = V3(0, 0, 0);

// ----- shot 4: filing a gear -----
SHOTS.push({ id: '4', t0: lineT('l04') - 0.1, locs: ['shop'], light: shopLight(),
  cam: (u) => { const e = eio(u); return { p: lerp3([61.0, 1.8, 2.5], [60.3, 1.65, 1.9], e), l: lerp3([60.2, 1.45, -0.9], [60.2, 1.4, -0.9], e), fov: lerp(40, 36, e), ap: 3.2, focus: lerp(2.7, 2.2, e) }; },
  update: (u, t) => {
    const c = WS.crafter, L = WS.L; c.root.position.set(0.5, 0, -1.5);
    c.root.rotation.y = 0.25 + Math.PI * 0 ; WS.box.position.set(2.3, 1.1, -0.8); WS.box.rotation.y = -0.4; updateBoxGears(WS.box, 0, 0);
    const k = lsh(t, 4, 11); const fp = V3(59.8 + 0.06 + k * 0.12, 1.5, -0.4 + 0.0);
    WS.file.position.set(fp.x - 60 + 0.28, fp.y - 0.02, fp.z); WS.file.rotation.set(0, 0, -0.1);
    WS.gear.rotation.z = 0; WS.sparkO.set(-0.2 + k * .1, 1.52, -0.5);
    c.root.updateMatrixWorld(true);
    poseChar(c, { face: u < 0.35 ? 'focus' : 'focus', head: [0.18, -0.1, 0], lean: [0.12, 0.0, 0], handR: holdAt(c, V3(fp.x + 0.62, fp.y + 0.0, fp.z + 0.0)), handL: holdAt(c, V3(fp.x - 0.1, fp.y - 0.1, fp.z - 0.55)), bob: 0 });
    shopUpdate(t);
  } });
// ----- shots 5a, 5b: the crank, then the dial -----
function needleV(t) { const t0 = lineT('l05') + 2.55, t1 = lineT('l05') + 2.95; if (t < t0) return 0; const a = clamp((t - t0) / (t1 - t0)); return 40 * (eback(a) * 0.9 + a * 0.1) + Math.sin((t - t1) * 30) * Math.max(0, 1 - (t - t1) * 3) * 0.8 * (t > t1 ? 1 : 0); }
const needleEase = t => { const a = lineT('l05') + 2.1, b = lineT('l05') + 3.0; const k = clamp((t - a) / (b - a)); return 40 * (1 - Math.pow(1 - k, 3)) + (k >= 1 ? 0 : 0) + (k > .75 ? Math.sin((k - .75) * 40) * (1 - k) * 4 : 0); };
function crankScene(t) {
  WS.box.position.set(0.1, 1.1, -0.7); WS.box.rotation.set(0, 0.0, 0); const ca = t * 8; updateBoxGears(WS.box, ca, needleEase(t));
  WS.box.updateMatrixWorld(true);
  const c = WS.crafter; c.root.position.set(1.7, 0, -1.2); c.root.rotation.y = -0.9; c.root.updateMatrixWorld(true);
  const kn = new T.Vector3(); WS.box.userData.crank.children[1].children[1].getWorldPosition(kn);
  poseChar(c, { face: 'focus', head: [0.12, -0.2, 0], lean: [0.1, 0, 0], handL: holdAt(c, kn), handR: holdAt(c, V3(60.4, 1.2, -0.9)), bob: 0 });
  WS.file.position.set(0, -10, 0); WS.gear.rotation.z = 0; WS.sparkO.set(0, -10, 0); shopUpdate(t);
}
SHOTS.push({ id: '5a', t0: lineT('l05') - 0.1, locs: ['shop'], light: shopLight({ sun: { col: 0xffe2b8, int: 2.8, pos: [-3, 6, 6], target: [60.8, 1, -0.8], ext: 6, far: 20 }, pts: [{ p: [60.6, 2.0, 0.4], col: 0xffa850, int: 6, dist: 7 }] }),
  cam: (u) => { const e = eio(u); return { p: lerp3([60.3, 2.0, 1.9], [60.35, 1.8, 1.4], e), l: lerp3([60.35, 1.25, -0.7], [60.35, 1.2, -0.7], e), fov: 38, ap: 3.0, focus: lerp(2.7, 2.2, e) }; },
  update: (u, t) => { crankScene(t); } });
SHOTS.push({ id: '5b', t0: lineT('l05') + 1.5, locs: ['shop'], light: shopLight({ pts: [{ p: [60.4, 2.0, 1.2], col: 0xffa850, int: 5, dist: 7 }], sun: { col: 0xffe2b8, int: 3.0, pos: [-1, 5, 6], target: [60.1, 1.3, -0.4], ext: 5, far: 20 } }),
  cam: (u) => { const e = eio(u); return { p: lerp3([60.3, 1.4, 1.0], [60.1, 1.34, 0.3], e), l: [60.1, 1.2, -0.4], fov: lerp(34, 28, e), ap: 3.0, focus: lerp(1.55, 0.9, e), shake: 0.003 }; },
  update: (u, t) => { crankScene(t); } });

// ----- shot 7: noon, the Moon slides over the Sun -----
function buildExterior() {
  const L = group(scene, [-200, 0, 0]); L.userData.name = 'sky'; EX.L = L; LOC.sky = L; L.visible = false;
  const dome = new T.Mesh(new T.SphereGeometry(300, 32, 20), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new T.Color(0x3a8be0) }, hor: { value: new T.Color(0xcfeaff) }, glow: { value: new T.Color(0xffa060) }, gk: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform vec3 top, hor, glow; uniform float gk; varying vec3 vP; void main(){ float y = max(vP.y, 0.); vec3 c = mix(hor, top, pow(y, .55)); c = mix(c, glow, gk * pow(1. - y, 6.)); gl_FragColor = vec4(c, 1.); }' }));
  L.add(dome); EX.dome = dome;
  // hills, temple, trees
  const hill = std(0x8fc46a, .9), hill2 = std(0x6fa95a, .9);
  for (const [x, z, r, c] of [[-50, 100, 38, hill], [40, 105, 50, hill2], [-90, 150, 70, hill], [95, 85, 30, hill]]) mesh(new T.SphereGeometry(r, 32, 16, 0, 6.28, 0, 1.2), c, { parent: L, pos: [x, -r * 0.62, z], recv: true, cast: false, scl: [1.6, 1, 1] });
  mesh(new T.CircleGeometry(400, 24), hill2, { parent: L, pos: [0, -0.2, 120], rot: [-Math.PI / 2, 0, 0], cast: false });
  const temple = group(L, [-6, 0.6, 55]);
  mesh(roundedBox(18, 1.2, 9, .2), std(0xf0e2c8, .8), { parent: temple, pos: [0, 0, 0], ol: .06 }); mesh(roundedBox(16, 0.6, 7.6, .1), std(0xf6ead2, .8), { parent: temple, pos: [0, 0.9, 0], ol: .06 });
  for (let i = 0; i < 7; i++) mesh(new T.CylinderGeometry(0.55, 0.62, 5.2, 16), std(0xf6ead2, .7), { parent: temple, pos: [-6.6 + i * 2.2, 4.1, 3], ol: .05 });
  mesh(roundedBox(17, 0.8, 8.2, .15), std(0xf0e2c8, .8), { parent: temple, pos: [0, 7.1, 0.0], ol: .06 });
  const tri = new T.Shape(); tri.moveTo(-9, 0); tri.lineTo(9, 0); tri.lineTo(0, 3.2); tri.closePath();
  const ped = mesh(new T.ExtrudeGeometry(tri, { depth: 7.6, bevelEnabled: false }), std(0xe07a4a, .7), { parent: temple, pos: [0, 7.5, -3.6 + 7.6 - 3.6 * 0 - 3.8], ol: .06 }); ped.position.set(0, 7.5, -3.8); ped.rotation.y = 0; EX.ped = ped;
  EX.birdHome = V3(-200 - 6, 12.5, 55);
  const tr = rng(8);
  for (let i = 0; i < 14; i++) { const x = -30 + tr() * 60, z = 38 + tr() * 30; if (Math.abs(x + 6) < 14) continue; mesh(new T.CylinderGeometry(0.2, 0.28, 2.2, 8), std(0x7a4a2a, .8), { parent: L, pos: [x, 1.1, z] }); mesh(new T.SphereGeometry(1.5 + tr() * .6, 14, 10), std(0x4f9a4a, .8), { parent: L, pos: [x, 3.2, z], ol: .05 }); }
  // sun, moon, corona
  const sunG = group(L); EX.sunG = sunG;
  const halo = new T.Mesh(new T.PlaneGeometry(90, 90), new T.MeshBasicMaterial({ map: glowTex([[0, 'rgba(255,255,230,1)'], [.18, 'rgba(255,230,150,.65)'], [.5, 'rgba(255,200,100,.12)'], [1, 'rgba(255,200,100,0)']]), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false })); sunG.add(halo);
  const sunD = new T.Mesh(new T.CircleGeometry(9, 48), new T.MeshBasicMaterial({ color: new T.Color(3.4, 3.0, 1.6), fog: false })); sunD.position.z = 0.5; sunG.add(sunD);
  const corona = new T.Mesh(new T.RingGeometry(9.2, 19, 64), new T.MeshBasicMaterial({ map: ctex(256, 256, (x) => { const g = x.createRadialGradient(128, 128, 90, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(190,210,255,.5)'); g.addColorStop(1, 'rgba(120,150,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false, opacity: 0 }));
  corona.geometry = new T.CircleGeometry(24, 48); corona.position.z = 0.2; sunG.add(corona);
  const moon = new T.Mesh(new T.CircleGeometry(9.3, 48), new T.MeshBasicMaterial({ color: 0x0c1020, fog: false })); moon.position.z = 1; sunG.add(moon);
  const moonOl = new T.Mesh(new T.RingGeometry(9.3, 9.8, 48), new T.MeshBasicMaterial({ color: 0x16101e, fog: false })); moonOl.position.z = 1.1; sunG.add(moonOl);
  EX.sunD = sunD; EX.moon = moon; EX.moonOl = moonOl; EX.corona = corona; EX.halo = halo;
  // stars
  const sa = new Float32Array(90 * 3), sr = rng(31); for (let i = 0; i < 90; i++) { const a = sr() * 6.28, e = 0.15 + sr() * 1.2; sa[i * 3] = Math.cos(a) * Math.cos(e) * 250; sa[i * 3 + 1] = Math.sin(e) * 250; sa[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 250; }
  EX.stars = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(sa, 3)), new T.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false })); L.add(EX.stars);
  // birds
  EX.birds = []; const bm = new T.MeshBasicMaterial({ color: 0x16101e, side: T.DoubleSide, fog: false }); const wing = new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array([0, 0, 0, 1, 0.15, 0.2, 0.6, 0, -0.35]), 3));
  for (let i = 0; i < 14; i++) { const g = new T.Group(); const a = new T.Mesh(wing, bm), b = new T.Mesh(wing, bm); b.scale.x = -1; g.add(a, b); g.userData = { a, b, ph: hash(i) * 6.28, ang: hash(i + 9) * 6.28, sp: 6 + hash(i + 3) * 8, dx: (hash(i + 20) - .5) * 14 }; L.add(g); EX.birds.push(g); }
}
const noonGrade = k => ({ tint: [lerp(1.04, .74, k), lerp(1.0, .86, k), lerp(0.95, 1.25, k)], sat: lerp(1.15, 0.9, k), vig: lerp(.3, .5, k), bloom: lerp(.35, .55, k) });
SHOTS.push({ id: '7', t0: lineT('l07') - 0.1, locs: ['sky'], light: (u, t) => { const k = EXK(u); return { bg: [0.4, 0.6, 0.9], hemi: [new T.Color(0xffffff).lerp(new T.Color(0x5a70c0), k), 0x7a9a5a, lerp(1.0, .35, k)], sun: { col: 0xfff2d8, int: lerp(3.0, 0.3, k), pos: [-10, 30, -20], target: [-206, 0, 55], ext: 40, far: 90 }, env: 'hall', envInt: lerp(.5, .15, k), fog: [0x9ac6ee, 0.0], grade: noonGrade(k) }; },
  cam: (u) => { const e = eio(u); return { p: [-200 + lerp(0, 3, u), 1.6, lerp(0, -6, e)], l: [-200 + lerp(-4, 1, e), lerp(18, 26, e) + 6, 90], fov: 52, ap: 0, shake: 0.01 }; },
  update: (u, t) => {
    const k = EXK(u), L = EX.L; const a = EX.dome.material.uniforms;
    a.top.value.setRGB(lerp(.04, .005, k) * 0 + lerp(.045, .004, k), lerp(.25, .012, k), lerp(.75, .06, k)); a.hor.value.setRGB(lerp(.62, .05, k), lerp(.8, .07, k), lerp(1, .22, k)); a.gk.value = sstep(.5, 1, k); a.glow.value.setRGB(1, .45, .2);
    // sun position along the camera ray
    const elev = 33 * Math.PI / 180, dist = 150, cx = camera.position.x; EX.sunG.position.set(cx + 200 + 4, Math.tan(elev) * dist + 1.6, dist); EX.sunG.lookAt(camera.position);
    const mk = EXK(u); EX.moon.position.x = lerp(-34, 0.35, eio(clamp(u * 1.55 - 0.05)));          // slides in from the left
    EX.moonOl.position.x = EX.moon.position.x; EX.moon.position.y = EX.moonOl.position.y = lerp(5, 0, eio(clamp(u * 1.55 - 0.05)));
    EX.corona.material.opacity = sstep(.55, .9, k); EX.sunD.material.color.setRGB(3.4, 3.0, 1.6);
    EX.stars.material.opacity = sstep(.6, 1, k) * .9; EX.halo.material.opacity = lerp(1, .25, k);
    const bt = Math.max(0, (u - 0.38)) * 3.7;
    EX.birds.forEach((g, i) => { const d = g.userData, ph = bt; const f = Math.sin(t * 16 + d.ph) * .6; d.a.rotation.z = f; d.b.rotation.z = -f; const sc = 0.9 + hash(i) * .6; g.scale.setScalar(sc);
      if (bt <= 0) { g.position.set(-6 + (hash(i + 4) - .5) * 14, 12.9 + hash(i + 6) * .3, 54.5 + hash(i + 7) * 3); g.rotation.set(0, 0, 0); d.a.rotation.z = d.b.rotation.z = .1; }
      else { const ang = d.ang * 0.35 + Math.PI * .5; g.position.set(-6 + (hash(i + 4) - .5) * 14 + Math.cos(ang) * d.sp * ph * .9 + d.dx * ph * .3, 13 + Math.sin(ph * 2.4) * 1 + ph * (7 + hash(i) * 8), 55 + ph * (4 + hash(i + 11) * 10)); g.rotation.set(0, Math.atan2(d.dx * .3 + Math.cos(ang) * d.sp * .9, 8) , 0); } });
  } });
function EXK(u) { const t = u * 3.7; return eio(clamp((u - 0.28) / 0.42)); }   // eclipse amount 0..1 over the shot

// ----- shot 9: the craftsman, a dim silhouette in the void, dissolving -----
let GHOSTU = { value: 0 };
function ghostify(root) {
  const m = new T.MeshBasicMaterial({ color: 0x35588f, fog: false });
  m.onBeforeCompile = sh => { sh.uniforms.uDis = GHOSTU; sh.vertexShader = 'varying vec3 vW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vW = (modelMatrix * vec4(transformed, 1.)).xyz;');
    sh.fragmentShader = 'uniform float uDis; varying vec3 vW;\nfloat hh(vec3 p){ return fract(sin(dot(floor(p), vec3(127.1, 311.7, 74.7))) * 43758.5453); }\n' + sh.fragmentShader.replace('void main() {', 'void main() { float th = uDis * 1.5 - (vW.y - 0.0) * 0.28 - 0.1; if (hh(vW * 11.0) < th) discard;')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n gl_FragColor.rgb *= 0.65 + 0.5 * smoothstep(0., 2.2, vW.y); float edge = smoothstep(0.0, 0.2, th - hh(vW * 11.0) + 0.0); gl_FragColor.rgb += vec3(0.3, 0.6, 1.4) * (1. - smoothstep(0., .25, hh(vW * 11.0) - th)) * 0.0;'); };
  root.traverse(o => { if (o.isMesh) { if (o.userData.isOutline) o.visible = false; else o.material = m; o.castShadow = false; } });
}
function buildVoid() {
  const L = group(scene, [0, 0, -200]); L.userData.name = 'void'; VD.L = L; LOC.void = L; L.visible = false;
  VD.crafter = makeChar({ body: 0xc8643c, hat: g => capHat(g, 0x7a4a2a), flags: 's' }); L.add(VD.crafter.root); ghostify(VD.crafter.root);
  const dp = new Float32Array(260 * 3), r = rng(77); for (let i = 0; i < 260; i++) { dp[i * 3] = (r() - .5) * 8; dp[i * 3 + 1] = r() * 6 - .5; dp[i * 3 + 2] = (r() - .5) * 6; }
  VD.dust = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(dp, 3)), new T.PointsMaterial({ map: glowTex([[0, 'rgba(160,200,255,1)'], [1, 'rgba(100,140,255,0)']]), size: 0.1, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: .9, fog: false })); VD.dust.position.set(0, 0, 0); L.add(VD.dust); VD.base = dp.slice();
  VD.floor = mesh(new T.CircleGeometry(4, 40), new T.MeshBasicMaterial({ map: glowTex([[0, 'rgba(90,140,255,.55)'], [1, 'rgba(60,90,200,0)']]), transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false }), { parent: L, pos: [0, 0.01, 0], rot: [-Math.PI / 2, 0, 0], cast: false });
  const pp = new Float32Array(240 * 3); VD.parts = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(pp, 3)), new T.PointsMaterial({ map: glowTex([[0, 'rgba(190,225,255,1)'], [1, 'rgba(100,160,255,0)']]), size: 0.09, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })); VD.parts.frustumCulled = false; L.add(VD.parts);
}
SHOTS.push({ id: '9', t0: lineT('l09') - 0.12, locs: ['void'], light: { bg: [0.008, 0.016, 0.05], hemi: [0x4a70c0, 0x101830, 0.6], sun: { int: 0 }, env: 'cold', envInt: 0.2, fog: [0x040816, 0.0], grade: { tint: [0.9, 1.0, 1.2], sat: 1.0, vig: 0.55, bloom: 0.7 } },
  cam: (u) => { const e = eio(u); return { p: lerp3([0.2, 1.55, 6.0 - 200], [-0.1, 1.5, 3.5 - 200], e), l: [0, 1.5, -200], fov: 36, ap: 2.0, focus: lerp(6, 3.5, e), shake: 0.006 }; },
  update: (u, t) => {
    const c = VD.crafter; c.root.position.set(0, 0, 0); c.root.rotation.y = 0.1; poseChar(c, { face: 'calm', head: [0.05, 0, 0], handL: [0.4, 0.62, 0.05], handR: [-0.4, 0.62, 0.05], bob: nzs(t * 1.6) * .01 });
    const k = sstep(0.18, 1.0, u); GHOSTU.value = k * 1.0;
    const dp = VD.dust.geometry.attributes.position; for (let i = 0; i < dp.count; i++) dp.setXYZ(i, VD.base[i * 3] + nzs(t * .3 + i) * .3, (VD.base[i * 3 + 1] + t * .12 + i * .01) % 6 - .5, VD.base[i * 3 + 2] + Math.cos(t * .27 + i * 1.3) * .3);
    dp.needsUpdate = true;
    const pp = VD.parts.geometry.attributes.position; for (let i = 0; i < 240; i++) { const s0 = hash(i) * .8, a = clamp((GHOSTU.value - s0 * .6) * 2.2), x = (hash(i + 3) - .5) * .7, y = hash(i + 5) * 2.2 + .1, z = (hash(i + 8) - .5) * .5;
      pp.setXYZ(i, x + nzs(t * .8 + i) * .1 * a, y + a * (0.6 + hash(i + 2) * 1.5), z + a * (hash(i + 9) - .5) * 1.4); }
    pp.needsUpdate = true; VD.parts.material.opacity = 1;
  } });
