// shots_c.js: sea (10a, 13), museum (10b), X-ray (11a 11b 11c), reconstructed mechanism (12)
'use strict';
const SEA = {}, MU = {}, XR = {}, MC = {};
{ const prev = buildMore; buildMore = () => { prev && prev(); buildSea(); buildMuseum(); buildXray(); buildMech(); }; }
function seaH(x, z) { const f = sstep(5, 12, Math.hypot(x, z * .8)); return (vnoise(x * .25 + 3, z * .25) * 1.6 + Math.sin(x * .6 + z * .2) * .25) * f - 0.0; }
function swayMat(col) {
  const m = new T.MeshStandardMaterial({ color: col, roughness: .7, side: T.DoubleSide });
  m.onBeforeCompile = sh => { sh.uniforms.uT = TIMEU; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n float ph = modelMatrix[3].x * 1.7 + modelMatrix[3].z * 2.3; float h = max(position.y, 0.); transformed.x += sin(uT * 1.7 + h * 1.8 + ph) * 0.16 * h * h * .5; transformed.z += cos(uT * 1.3 + h * 1.5 + ph) * 0.08 * h * h * .5;'); };
  m.customProgramCacheKey = () => 'sway'; return m;
}
function buildSea() {
  const L = group(scene); L.userData.name = 'sea'; SEA.L = L; LOC.sea = L; L.visible = false;
  const g = new T.PlaneGeometry(90, 90, 90, 90); g.rotateX(-Math.PI / 2); const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new T.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = seaH(x, z); p.setY(i, h); c.setHex(0xb89a5e).lerp(new T.Color(0x8a7648), vnoise(x * .3, z * .3)).lerp(new T.Color(0xd2b676), clamp(1 - Math.abs(h) * .5, 0, 1) * .3); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute('color', new T.BufferAttribute(col, 3)); g.computeVertexNormals();
  const sb = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, roughness: .95 })); sb.receiveShadow = true; L.add(sb);
  // wreck: ribs, keel, planks
  const wood = std(0x6a4a30, .85), wood2 = std(0x7d5a3c, .85); const ribs = group(L, [0, 0, -7.5]);
  for (let i = 0; i < 9; i++) { const pts_ = []; const hh = 2.2 + hash(i) * .8 - (i > 6 ? 0.9 : 0), ex = 3.0 - Math.abs(i - 4) * .12; const a0 = 0.12 + hash(i + 5) * .15; for (let k = 0; k <= 14; k++) { const a = a0 + k / 14 * (1 - a0 * 2 - (i % 3 === 0 ? .25 : 0)) * Math.PI; pts_.push(V3(Math.cos(a) * ex, Math.sin(a) * hh - .35, 0)); }
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts_), 24, 0.11, 8), wood, { parent: ribs, pos: [0, 0, (i - 4) * 1.15], ol: 0.015 }); }
  mesh(roundedBox(0.3, 0.3, 11, .06), wood2, { parent: ribs, pos: [0, -0.2, 0], ol: .015 });
  for (let i = 0; i < 6; i++) mesh(roundedBox(0.12, 0.38, 9 - i, .04), wood2, { parent: ribs, pos: [Math.cos(.2 + i * .22) * 3.3 * (i % 2 ? -1 : 1), 0.4 + i * .25, -.3], rot: [0, 0, (i % 2 ? 1 : -1) * 0.2], ol: .01 });
  ribs.rotation.y = 0.12;
  // amphorae
  const amp = (s) => { const gg = group(null); mesh(lathe([[0, 0], [0.1, 0.03], [0.26, 0.35], [0.28, 0.65], [0.15, 0.95], [0.11, 1.1], [0.17, 1.18], [0.12, 1.2], [0.0, 1.18]], 20), std(0xc9703f, .75), { parent: gg, ol: .018 });
    for (const sx of [-1, 1]) mesh(new T.TorusGeometry(0.17, 0.025, 6, 12, Math.PI), std(0xb3592e, .75), { parent: gg, pos: [sx * .02, 1.0, 0], rot: [0, 0, sx > 0 ? -Math.PI / 2 : Math.PI / 2], scl: [1, 1, 1] });
    mesh(new T.TorusGeometry(0.265, 0.018, 6, 20), std(0x6a3a1c, .8), { parent: gg, pos: [0, .5, 0], rot: [Math.PI / 2, 0, 0] }); gg.scale.setScalar(s); return gg; };
  const ar = rng(12);
  for (let i = 0; i < 16; i++) { const a = amp(.9 + ar() * .5); const x = (ar() - .5) * 16, z = -4 + ar() * -8; a.position.set(x, seaH(x, z) - .05, z); a.rotation.set((ar() - .5) * 1.7, ar() * 6, (ar() - .5) * 1.7); L.add(a); }
  for (const [x, z, s] of [[2.6, -1.6, 1.0], [-2.8, -2.4, .9], [3.4, 1.4, .8]]) { const a = amp(s); a.position.set(x, 0.18, z); a.rotation.set(1.3, 0.4 + x, 0.2); L.add(a); }
  // rocks
  for (let i = 0; i < 24; i++) { const x = (ar() - .5) * 30, z = -14 + ar() * 22; if (Math.hypot(x, z) < 3.8) continue; const r = .3 + ar() * .9; mesh(new T.DodecahedronGeometry(r, 1), std(0x6b7a7c, .95, 0, { flat: true }), { parent: L, pos: [x, seaH(x, z) + r * .3, z], rot: [ar() * 3, ar() * 3, 0], scl: [1.3, .7, 1] }); }
  // seaweed + coral
  const wm = [swayMat(0x4aa56a), swayMat(0x6ac07a), swayMat(0x2f8a5a)];
  for (let i = 0; i < 42; i++) { const x = (ar() - .5) * 22, z = -10 + ar() * 20; if (Math.hypot(x, z) < 2.8) continue; const gg = new T.PlaneGeometry(0.28, 1.8 + ar() * 1.4, 1, 8); gg.translate(0, gg.parameters.height / 2, 0); const m = new T.Mesh(gg, wm[i % 3]); m.position.set(x, seaH(x, z), z); m.rotation.y = ar() * 6; L.add(m); }
  for (let i = 0; i < 10; i++) { const x = (ar() - .5) * 14, z = -7 + ar() * 12; if (Math.hypot(x, z) < 3) continue; const cc = group(L, [x, seaH(x, z), z]); const col2 = [0xe8627a, 0xf0a04a, 0xb070d0][i % 3]; for (let k = 0; k < 5; k++) mesh(new T.CapsuleGeometry(.07 + ar() * .04, .4 + ar() * .5, 4, 8), std(col2, .7), { parent: cc, pos: [(ar() - .5) * .5, .3, (ar() - .5) * .5], rot: [(ar() - .5) * .8, 0, (ar() - .5) * .8], ol: .01 }); }
  // light rays and surface
  const rayT = ctex(64, 256, (x) => { const gg = x.createLinearGradient(0, 0, 0, 256); gg.addColorStop(0, 'rgba(200,255,240,.5)'); gg.addColorStop(1, 'rgba(200,255,240,0)'); x.fillStyle = gg; x.fillRect(0, 0, 64, 256); const h = x.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(.5, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = h; x.fillRect(0, 0, 64, 256); });
  SEA.rays = [];
  for (let i = 0; i < 9; i++) { const m = new T.Mesh(new T.PlaneGeometry(1.6 + ar() * 1.6, 18), new T.MeshBasicMaterial({ map: rayT, transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false, opacity: .35 })); m.position.set(-8 + i * 2.2, 8, -5 + (i % 3) * 2); m.rotation.set(0, ar() * 3, .18); m.userData.ph = i; L.add(m); SEA.rays.push(m); }
  const surf = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshBasicMaterial({ color: new T.Color(1.2, 2.2, 2.2), fog: false })); surf.rotation.x = Math.PI / 2; surf.position.y = 17; L.add(surf);
  // bubbles
  const bp = new Float32Array(120 * 3); SEA.bub = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(bp, 3)), new T.PointsMaterial({ map: glowTex([[0, 'rgba(255,255,255,.1)'], [.7, 'rgba(220,255,255,.35)'], [.85, 'rgba(255,255,255,.9)'], [1, 'rgba(255,255,255,0)']]), size: .14, transparent: true, depthWrite: false, fog: false })); SEA.bub.frustumCulled = false; L.add(SEA.bub);
  // fish
  SEA.fish = []; for (let i = 0; i < 12; i++) { const f = group(L); mesh(new T.SphereGeometry(.14, 12, 8), std([0xf2b632, 0xff7a59, 0x59c3ff][i % 3], .5), { parent: f, scl: [1.8, 1, .6], ol: .01 }); mesh(new T.ConeGeometry(.1, .2, 8), std([0xf2b632, 0xff7a59, 0x59c3ff][i % 3], .5), { parent: f, pos: [-.3, 0, 0], rot: [0, 0, Math.PI / 2] }); f.userData = { i }; SEA.fish.push(f); }
  // divers
  const diver = (body) => { const c = makeChar({ body, helmet: true, shoe: 0x4a4a52, deco: cc => { mesh(new T.TorusGeometry(0.31, 0.05, 8, 24), std(0xc98f2e, .3, .8), { parent: cc.bg, pos: [0, 0.95, 0], rot: [Math.PI / 2, 0, 0] }); mesh(new T.CylinderGeometry(0.16, 0.16, 0.2, 12), std(0x4a4a52, .5, .5), { parent: cc.bg, pos: [0, 0.4, -0.34] }); } });
    const hose = mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V3(0, .8, 0), V3(.5, 2, .1), V3(-.4, 4, -.2), V3(.5, 7, .2), V3(-.3, 10, -.1), V3(.2, 14, 0)]), 40, 0.05, 6), std(0x2a2a30, .6), { parent: c.hg, cast: false }); hose.position.set(0, .75, -.1); c.hose = hose; return c; };
  SEA.dA = diver(0xe8873a); SEA.dB = diver(0xe9c53a); SEA.dC = diver(0xd9534a);
  for (const d of [SEA.dA, SEA.dB, SEA.dC]) L.add(d.root);
  SEA.lump = makeLump(7, 0.95, { gear: true }); L.add(SEA.lump);
  SEA.lump2 = makeLump(7, 0.95, { gear: true }); L.add(SEA.lump2);
  const gl2 = new T.Mesh(new T.PlaneGeometry(.7, .7), new T.MeshBasicMaterial({ map: glowTex([[0, 'rgba(255,255,255,1)'], [.2, 'rgba(255,230,140,.8)'], [1, 'rgba(255,200,80,0)']]), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false })); SEA.glint = gl2; L.add(gl2);
  for (const o of [SEA.dA, SEA.dB, SEA.dC]) blob(o.root, 0, 0, 0, .7, .6);
}
const seaLight = (o = {}) => Object.assign({ bg: [0.02, 0.2, 0.26], hemi: [0x6fd0f0, 0x1a5a50, 0.55], sun: { col: 0xd8fff0, int: 1.9, pos: [3, 12, 4], target: [0, 0, -2], ext: 10, far: 30 }, rim: { col: 0x7fe0ff, int: 1.4, pos: [-3, 2, -8], target: [0, 1.5, 0] }, fog: [0x0d6f82, 0.075], env: 'sea', envInt: 0.4, grade: { tint: [0.9, 1.03, 1.05], sat: 1.15, vig: 0.4, bloom: 0.3, expo: 0.95 } }, o);
function seaCommon(t) {
  SEA.rays.forEach((m, i) => { m.material.opacity = .22 + .12 * nzs(t * .8 + i); m.position.x = -8 + i * 2.2 + nzs(t * .3 + i) * .4; });
  const bp = SEA.bub.geometry.attributes.position, hp = new T.Vector3(); SEA.dA.hg.getWorldPosition(hp);
  for (let i = 0; i < 120; i++) { const ph = (t * .5 + hash(i)) % 1, src = i % 3 === 0 ? SEA.dA : i % 3 === 1 ? SEA.dB : SEA.dC; const wp = src.root.position; bp.setXYZ(i, wp.x + (hash(i + 4) - .5) * .5 + Math.sin(ph * 12 + i) * .06, wp.y + 2.2 + ph * 8, wp.z + (hash(i + 6) - .5) * .4); }
  bp.needsUpdate = true;
  SEA.fish.forEach((f, i) => { const a = t * (.35 + hash(i) * .2) + i * 1.3, r = 5 + hash(i + 2) * 3; f.position.set(Math.cos(a) * r, 2 + hash(i + 3) * 3 + Math.sin(t + i) * .2, -3 + Math.sin(a) * r * .7); f.rotation.y = -a - Math.PI / 2 * 0 + Math.PI; f.children[1].rotation.z = Math.PI / 2 + Math.sin(t * 8 + i) * .3; });
}
const SL = id => lineT(id);
SHOTS.push({ id: '10a', t0: lineT('l10') - 0.06, locs: ['sea'], light: seaLight(),
  cam: (u) => { const e = eio(u); return { p: lerp3([3.4, 2.4, 9.6], [0.55, 1.6, 3.7], e), l: lerp3([0.0, 1.9, -3.5], [0.0, 1.45, 0.4], e), fov: lerp(46, 38, e), ap: 2.6, focus: lerp(13.5, 3.4, e) }; },
  update: (u, t) => {
    seaCommon(t); SEA.lump2.visible = false; SEA.lump.visible = true;
    const lift = sstep(0.42, 0.78, u), bob = nzs(t * 2) * .02;
    const A = SEA.dA; A.root.position.set(0, 0, 0); A.root.rotation.y = 0.15; A.root.scale.setScalar(1.0);
    const hy = lerp(0.35, 0.8, lift), hz = lerp(0.55, 0.7, lift);
    SEA.lump.position.set(0, hy + 0.12, hz + .25 * (1 - lift) + .12); SEA.lump.rotation.set(0.1, t * .3 * lift + .4, 0);
    SEA.lump.updateMatrixWorld(true);
    poseChar(A, { face: lift > .3 ? 'awe' : 'calm', drop: lerp(0.28, 0, lift), lean: [lerp(.5, -.1, lift), nzs(t * 1.3) * .05, 0], head: [lerp(.3, -.15, lift) + nzs(t * 2.1) * .04, nzs(t * 1.1) * .12, nzs(t * 1.6) * .04], handL: [0.35, hy + 0.1, hz], handR: [-0.35, hy + 0.1, hz], footL: [0.2, 0, -0.05], footR: [-0.2, 0, 0.05], bob });
    const B = SEA.dB; B.root.position.set(-2.4, 0, -1.2); B.root.rotation.y = 0.7; poseChar(B, { head: [nzs(t * 1.9) * .06, .3 + nzs(t * 1.0) * .2, nzs(t * 1.4) * .06], face: 'awe', handL: [0.5, 1.2, 0.2], handR: [-0.45, 0.8, 0.2], bob: nzs(t * 2 + 1) * .02, lean: [0, 0, .08] });
    const C = SEA.dC; C.root.position.set(2.6, 0, -2.2); C.root.rotation.y = -0.6; poseChar(C, { head: [.12 + nzs(t * 1.5) * .05, -.25 + nzs(t * 1.2) * .1, .14], lean: [.12, 0, 0], face: 'focus', handL: [0.5, 1.4, 0.1], handR: [-0.4, 0.7, 0.2], bob: nzs(t * 2 + 2) * .02 });
    SEA.glint.visible = false;
  } });
SHOTS.push({ id: '13', t0: lineT('l13') - 0.12, locs: ['sea'], light: (u, t) => seaLight({ fog: [0x0b5a70, lerp(0.075, 0.16, sstep(0.3, 1, u))], grade: { tint: [lerp(.92, .55, sstep(.4, 1, u)), lerp(1.04, .7, sstep(.4, 1, u)), lerp(1.04, .85, sstep(.4, 1, u))], sat: 1.1, vig: lerp(.38, .7, u), bloom: .4, expo: lerp(1, .55, sstep(.3, 1, u)) } }),
  cam: (u) => { const e = eio(u); return { p: lerp3([0.35, 0.62, 1.9], [-3.2, 4.8, 9.5], e), l: lerp3([0.0, 0.4, 0.0], [0, 0.6, -3.0], e), fov: 40, ap: lerp(3.5, 1.5, u), focus: lerp(1.9, 11, e) }; },
  update: (u, t) => {
    seaCommon(t); SEA.lump.visible = false; SEA.lump2.visible = true; SEA.lump2.position.set(0, 0.12, 0); SEA.lump2.rotation.set(0.0, 0.5, 0.05);
    for (const d of [SEA.dA, SEA.dB, SEA.dC]) d.root.visible = false;
    SEA.lump2.updateMatrixWorld(true); const gp = new T.Vector3(); SEA.lump2.userData.gearTip.getWorldPosition(gp); SEA.glint.visible = true; SEA.glint.position.copy(gp).add(V3(0, 0.05, 0.15)); SEA.glint.lookAt(camera.position); SEA.glint.scale.setScalar(.8 + .5 * nzs(t * 3) ** 2);
  } });

const X30 = TL.cuts.x_30 - lineT('l11'), X19 = TL.cuts.x_19 - lineT('l11'), X223 = TL.cuts.x_223 - lineT('l11');
// ---------- museum ----------
function buildMuseum() {
  const L = group(scene); L.userData.name = 'museum'; MU.L = L; LOC.museum = L; L.visible = false;
  mesh(new T.PlaneGeometry(14, 14), std(0xffffff, .6, 0, { map: woodTex('#9a6a44', '#8a5a38', [2, 2]) }), { parent: L, rot: [-Math.PI / 2, 0, 0], cast: false });
  const wall = std(0xe9d9b8, .9); mesh(new T.PlaneGeometry(14, 8), wall, { parent: L, pos: [0, 4, -4], cast: false }); mesh(new T.PlaneGeometry(14, 8), wall, { parent: L, pos: [-6, 4, 0], rot: [0, Math.PI / 2, 0], cast: false });
  const sh = group(L, [0, 0, -3.6]);
  for (let i = 0; i < 4; i++) { mesh(roundedBox(6.4, .1, .7, .03), std(0x7a4a2a, .8), { parent: sh, pos: [0, 0.9 + i * 1.1, 0] });
    for (let k = 0; k < 9; k++) { const q = (i * 5 + k) % 4, x = -2.8 + k * .7 + hash(i * 9 + k) * .1, y = .98 + i * 1.1;
      if (q === 0) mesh(lathe([[0, 0], [.14, .02], [.18, .22], [.12, .4], [.08, .44], [.1, .52]], 16), std([0xc9703f, 0xd9a441, 0x6aa0a8][k % 3], .7), { parent: sh, pos: [x, y, 0], ol: .015 });
      else if (q === 1) mesh(roundedBox(.5, .3, .4, .05), std(0xb98a5a, .8), { parent: sh, pos: [x, y + .15, 0], ol: .015 });
      else if (q === 2) mesh(new T.SphereGeometry(.17, 14, 10), std(0x9bb59a, .8), { parent: sh, pos: [x, y + .17, 0], ol: .015 });
      else mesh(new T.ConeGeometry(.16, .5, 12), std(0xe9e1cf, .8), { parent: sh, pos: [x, y + .25, 0], ol: .015 }); } }
  const tb = group(L, [0, 0, 0.2]);
  mesh(roundedBox(3.4, .12, 1.5, .04), std(0x2f6a4a, .85), { parent: tb, pos: [0, 1.0, 0], ol: .02 }); for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(roundedBox(.16, 1.0, .16, .03), std(0x6a4524, .8), { parent: tb, pos: [sx * 1.55, .5, sz * .6] });
  mesh(new T.CylinderGeometry(.55, .6, .08, 24), std(0xb82a3a, .8), { parent: tb, pos: [0.0, 1.1, 0.0], ol: .015 });
  MU.lump = makeLump(7, 0.62, { gear: true }); MU.lump.position.set(0.05, 1.45, 0.2); MU.lump.rotation.set(0, 0.2, 0); L.add(MU.lump);
  mesh(roundedBox(.5, .02, .28, .01), std(0xf5f0e0, .9), { parent: tb, pos: [0.65, 1.07, 0.5], rot: [0, -.3, 0] });
  const lamp = group(tb, [-1.2, 1.06, -.3]); mesh(new T.CylinderGeometry(.14, .17, .05, 16), std(0x2a2a30, .5, .6), { parent: lamp }); mesh(new T.CylinderGeometry(.02, .02, .8, 8), std(0x2a2a30, .5, .6), { parent: lamp, pos: [0, .4, 0] }); mesh(new T.ConeGeometry(.22, .28, 18, 1, true), std(0x3a8a5a, .6, .3, { side: T.DoubleSide }), { parent: lamp, pos: [.18, .9, 0], rot: [0, 0, -.9] });
  MU.glint = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: glowTex([[0, 'rgba(255,255,255,1)'], [.15, 'rgba(255,235,160,.85)'], [1, 'rgba(255,200,80,0)']]), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false })); L.add(MU.glint);
  MU.arch = makeChar({ body: 0xe8e2d2, flags: 'g', hat: g => { const h = group(g, [0, .45, 0]); for (let i = 0; i < 5; i++) mesh(new T.SphereGeometry(.09, 8, 6), std(0x3a2a24, .9), { parent: h, pos: [(i - 2) * .13, 0.0 - Math.abs(i - 2) * .03, .05 - Math.abs(i - 2) * .02] }); return h; }, deco: c => { mesh(new T.CylinderGeometry(0.315, 0.315, 0.55, 28, 1, true, -1.2, 2.4), std(0xffffff, .8, 0, { side: T.DoubleSide }), { parent: c.bg, pos: [0, .3, 0], ol: false }); mesh(new T.BoxGeometry(.1, .3, .04), std(0xb82a3a, .6), { parent: c.bg, pos: [0, .7, .3] }); } });
  L.add(MU.arch.root); blob(MU.arch.root, 0, 0, 0, .65, .8);
}
SHOTS.push({ id: '10b', t0: TL.cuts.x_roman + 0.08, locs: ['museum'], light: { bg: [0.1, 0.07, 0.05], hemi: [0xfff1de, 0xa5714a, 0.9], sun: { col: 0xfff0d6, int: 3.0, pos: [-2, 6, 6], target: [0, 1.3, 0], ext: 5, far: 20 }, rim: { col: 0xffd7a0, int: 1.5, pos: [0, 3, -6], target: [0, 1.5, 0] }, pts: [{ p: [-1.0, 2.0, 0.2], col: 0xffd890, int: 7, dist: 6 }], fog: [0x2a1c18, 0.01], env: 'hall', envInt: 0.55, grade: { tint: [1.05, 1.0, 0.94], sat: 1.12, vig: 0.34, bloom: 0.35 } },
  cam: (u) => { const e = ein(u) * .35 + eio(u) * .65; return { p: lerp3([1.7, 1.85, 3.2], [0.12, 1.5, 0.95], e), l: lerp3([-0.1, 1.55, -0.2], [0.18, 1.52, 0.3], e), fov: lerp(40, 26, e), ap: lerp(2.5, 6, e), focus: lerp(3.7, 0.8, e), shake: 0.004 }; },
  update: (u, t) => {
    const a = MU.arch; a.root.position.set(-0.3, 0, -0.9); a.root.rotation.y = 0.5; const pop = sstep(0.5, 0.62, u);
    poseChar(a, { face: pop > 0.2 ? 'shock' : 'focus', lean: [0.25 + pop * -0.1, 0, 0], head: [0.2 - pop * .25, 0.2, 0], handL: [0.4, 1.2, 0.45], handR: [-0.3, 1.0, 0.5], bob: 0 });
    MU.lump.updateMatrixWorld(true); const gp = new T.Vector3(); MU.lump.userData.gearTip.getWorldPosition(gp); MU.glint.position.copy(gp).add(V3(0, .02, .1)); MU.glint.lookAt(camera.position); const gk = Math.sin(clamp((u - 0.48) / 0.5) * Math.PI); MU.glint.scale.setScalar(0.05 + gk * 0.7); MU.glint.visible = gk > 0.01;
  }, over: (ctx, u) => { const k = sstep(0.5, 0.6, u) * (1 - sstep(0.85, 1, u)); if (k > .01) { const s = H * 0.1 * eback(sstep(0.5, 0.62, u)); ctx.save(); ctx.translate(W * 0.74, H * 0.2); ctx.font = `${s}px Impact`; ctx.textAlign = 'center'; ctx.lineWidth = s * .14; ctx.strokeStyle = '#000'; ctx.strokeText('!', 0, 0); ctx.fillStyle = '#ff9f1c'; ctx.fillText('!', 0, 0); ctx.restore(); } } });

// ---------- x-ray ----------
function spiralTex(turns, tick) {
  return ctex(512, 512, (x) => { x.clearRect(0, 0, 512, 512); x.strokeStyle = 'rgba(160,235,255,.95)'; x.lineWidth = 6; x.beginPath(); x.arc(256, 256, 246, 0, 7); x.stroke(); x.lineWidth = 3;
    x.beginPath(); for (let a = 0; a < turns * 6.2832; a += .03) { const r = 40 + a / (turns * 6.2832) * 190; (a === 0 ? x.moveTo : x.lineTo).call(x, 256 + Math.cos(a) * r, 256 + Math.sin(a) * r); } x.stroke();
    for (let i = 0; i < tick; i++) { const a = i / tick * 6.2832; x.lineWidth = i % 5 === 0 ? 5 : 2; x.beginPath(); x.moveTo(256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214); x.lineTo(256 + Math.cos(a) * 240, 256 + Math.sin(a) * 240); x.stroke(); }
    x.fillStyle = 'rgba(160,235,255,.9)'; x.beginPath(); x.arc(256, 256, 14, 0, 7); x.fill(); });
}
function buildXray() {
  const L = group(scene); L.userData.name = 'xray'; XR.L = L; LOC.xray = L; L.visible = false;
  const grid = ctex(512, 512, (x) => { x.clearRect(0, 0, 512, 512); x.strokeStyle = 'rgba(70,170,255,.55)'; x.lineWidth = 2; for (let i = 0; i <= 16; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, 512); x.moveTo(0, i * 32); x.lineTo(512, i * 32); x.stroke(); } }, { repeat: [6, 6] });
  const fl = new T.Mesh(new T.PlaneGeometry(24, 24), new T.MeshBasicMaterial({ map: grid, transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false })); fl.rotation.x = -Math.PI / 2; fl.position.y = -1.5; L.add(fl);
  XR.root = group(L); const R = XR.root;
  XR.lumpSolid = makeLump(7, 1.9, { gear: false }); R.add(XR.lumpSolid); XR.lumpSolid.traverse(o => { if (o.isMesh && !o.userData.isOutline && o.material.vertexColors) { o.material.transparent = true; } });
  const geoL = XR.lumpSolid.children[0].geometry;
  XR.shell = new T.Mesh(geoL, new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.FrontSide, uniforms: { op: { value: 0 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float op; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.2); vec3 c = vec3(.06, .3, .8) * (.1 + f * 1.1) + vec3(.3, .7, .9) * pow(f, 4.) * .6; gl_FragColor = vec4(c * op, 1.); }' })); XR.shell.scale.setScalar(1.9); XR.shell.renderOrder = 5; R.add(XR.shell);
  XR.gears = []; const r = rng(5), Ns = [8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32];
  const gmat = new T.MeshBasicMaterial({ color: new T.Color(.15, .6, 1.1), transparent: true, opacity: .2, depthWrite: false, blending: T.AdditiveBlending });
  const emat = new T.LineBasicMaterial({ color: new T.Color(.45, 1.1, 1.7), transparent: true, opacity: .55, blending: T.AdditiveBlending });
  for (let i = 0; i < 30; i++) {
    const N = Ns[Math.floor(r() * Ns.length)], rad = N * 0.0105 * 1.9, ang = r() * 6.28, rr = Math.sqrt(r()) * .62 * 1.9;
    const geo = gearGeo(N, rad, .028 * 1.9, .03 * 1.9, { spokes: N > 18 ? 4 : 0, hole: rad * .12, spokeR: .2 });
    const g = new T.Group(); g.position.set(Math.cos(ang) * rr * 0.9, Math.sin(ang) * rr * .72, (r() - .5) * .7 * 1.9); g.rotation.set((r() - .5) * .5, (r() - .5) * .5, 0);
    const m = new T.Mesh(geo, gmat); g.add(m); const e = new T.LineSegments(new T.EdgesGeometry(geo, 25), emat); g.add(e); R.add(g); XR.gears.push({ g, m, N, sp: (r() < .5 ? -1 : 1) * (.8 + r() * 1.2) * 12 / N, t0: i / 30 });
  }
  // two dials
  const mkDial = (turns, tick, rad, x, y, z) => { const d = new T.Mesh(new T.CircleGeometry(rad, 48), new T.MeshBasicMaterial({ map: spiralTex(turns, tick), transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: .95 })); d.position.set(x, y, z); R.add(d);
    const ring = new T.Mesh(new T.RingGeometry(rad * 1.05, rad * 1.09, 48), new T.MeshBasicMaterial({ color: new T.Color(1.6, 1.0, .25), transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0 })); ring.position.set(x, y, z + .01); R.add(ring); return { d, ring }; };
  XR.dA = mkDial(5, 60, .34, .45, .28, .62); XR.dB = mkDial(4, 56, .3, -.5, -.22, .5);
  XR.scan = new T.Mesh(new T.TorusGeometry(1.5, 0.02, 8, 64), new T.MeshBasicMaterial({ color: new T.Color(1.2, 2.2, 3), blending: T.AdditiveBlending, transparent: true, depthWrite: false })); XR.scan.rotation.x = Math.PI / 2; L.add(XR.scan);
}
const xrLight = { bg: [0.012, 0.025, 0.07], hemi: [0x335588, 0x0a1020, 0.3], sun: { int: 0 }, fog: [0x030818, 0.0], env: null, grade: { tint: [0.95, 1.0, 1.15], sat: 1.1, vig: 0.5, bloom: 0.45 } };
function xrUpdate(t, u) {
  const l0 = lineT('l11'), R = XR.root; R.rotation.y = nzs(t * .35) * .22 - 0.1; R.rotation.x = nzs(t * .27) * .06;
  const scanK = sstep(l0 + 0.2, l0 + 1.5, t);                    // lump turns to x-ray
  XR.lumpSolid.traverse(o => { if (o.isMesh && !o.userData.isOutline) { o.material.opacity = 1 - scanK; o.visible = scanK < 1; if (o.material.transparent === false) o.material.transparent = true; } else if (o.isMesh) o.visible = scanK < .6; });
  XR.shell.material.uniforms.op.value = sstep(l0 + .3, l0 + 1.6, t) * (0.9 + 0.1 * nzs(t * 3));
  XR.scan.position.y = lerp(1.6, -1.6, clamp((t - l0 - 0.1) / 1.4)); XR.scan.visible = t < l0 + 1.6 && t > l0;
  const nCount = 30 * clamp((t - (l0 + X30)) / 1.0);
  XR.gears.forEach((o, i) => { const k = clamp((t - (l0 + X30 + o.t0 * 0.95)) / 0.25); const s = Math.max(1e-3, eback(k)); o.g.scale.setScalar(k <= 0 ? 1e-4 : s); o.m.rotation.z = t * o.sp; o.g.children[1].rotation.z = t * o.sp; });
  const pulseA = sstep(l0 + X19 - .18, l0 + X19 + .12, t) * (0.6 + .4 * Math.sin(t * 8)) * (1 - sstep(l0 + X223 - 1.2, l0 + X223 - .8, t)), pulseB = sstep(l0 + X223 - .14, l0 + X223 + .16, t) * (0.6 + .4 * Math.sin(t * 8));
  XR.dA.ring.material.opacity = pulseA; XR.dB.ring.material.opacity = pulseB; XR.dA.d.rotation.z = t * .6; XR.dB.d.rotation.z = -t * .5;
  XR.dA.d.material.opacity = XR.dB.d.material.opacity = sstep(l0 + X30 - .04, l0 + X30 + .76, t);
  return nCount;
}
function projAnchor(obj, off = [0, 0, 0]) { const v = obj.getWorldPosition(new T.Vector3()); v.add(V3(...off)); v.project(camera); return [(v.x * .5 + .5) * W, (-v.y * .5 + .5) * H]; }
const NOLABEL = !!Q.get('nolabel');
function pill(ctx, x, y, text, col = '#ff9f1c') { if (NOLABEL) return; const fs = H * 0.05; ctx.font = `${fs}px Impact`; const w = ctx.measureText(text).width + fs * .9, h = fs * 1.35; ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = '#000'; ctx.lineWidth = fs * .12; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = fs * .16; ctx.strokeStyle = '#000'; ctx.strokeText(text, 0, fs * .04); ctx.fillText(text, 0, fs * .04); ctx.restore(); }
function counterOver(ctx, n, big) { if (NOLABEL) return;
  const v = Math.floor(n + 1e-6), done = v >= 30; const fs = H * (big ? 0.15 : 0.06); ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.font = `${fs}px Impact`; const cx = W * 0.5, cy = H * (big ? 0.2 : 0.09);
  ctx.lineWidth = fs * .12; ctx.strokeStyle = '#000'; ctx.strokeText(String(v), cx, cy); ctx.fillStyle = done ? '#ff9f1c' : '#9fe9ff'; ctx.fillText(String(v), cx, cy);
  const f2 = fs * .3; ctx.font = `${f2}px Impact`; ctx.lineWidth = f2 * .14; ctx.strokeText('BRONZE GEARS', cx, cy + f2 * 1.25); ctx.fillStyle = '#fff'; ctx.fillText('BRONZE GEARS', cx, cy + f2 * 1.25); ctx.restore();
}
SHOTS.push({ id: '11a', t0: lineT('l11') - 0.04, locs: ['xray'], light: xrLight,
  cam: (u) => { const e = eio(u); const a = lerp(0.5, -0.15, e), r = lerp(8.2, 6.4, e); return { p: [Math.sin(a) * r, lerp(0.8, 0.5, e), Math.cos(a) * r], l: [0, -0.5, 0], fov: 38, ap: 1.2, focus: r }; },
  update: (u, t) => { XR.n = xrUpdate(t, u); }, over: (ctx, u, t) => { const l0 = lineT('l11'); if (t > l0 + X30 - .1) counterOver(ctx, XR.n, true); } });
SHOTS.push({ id: '11b', t0: lineT('l11') + 3.4, locs: ['xray'], light: xrLight,
  cam: (u) => { const e = eio(u); return { p: lerp3([0.5, 1.2, 4.0], [0.9, 0.75, 2.35], e), l: lerp3([0.1, -0.3, 0], [0.5, 0.0, 0.4], e), fov: 36, ap: 1.0, focus: lerp(4.2, 2.4, e) }; },
  update: (u, t) => { XR.n = xrUpdate(t, u); }, over: (ctx, u, t) => { counterOver(ctx, 30, false); const l0 = lineT('l11'); if (t > l0 + 4.2) { const [x, y] = projAnchor(XR.dA.d, [0, 0.0, 0]); const px = clamp(x + W * 0.0, W * .3, W * .7), py = Math.max(H * 0.2, y - H * 0.2); ctx.strokeStyle = '#ff9f1c'; ctx.lineWidth = 4 * S; ctx.beginPath(); ctx.moveTo(px, py + H * .03); ctx.lineTo(x, y - H * .06); ctx.stroke(); pill(ctx, px, py, '19 YEARS'); } } });
SHOTS.push({ id: '11c', t0: lineT('l11') + 6.5, locs: ['xray'], light: xrLight,
  cam: (u) => { const e = eio(u); return { p: lerp3([-0.2, 0.2, 3.9], [-0.75, -0.05, 2.2], e), l: lerp3([0.0, -0.3, 0], [-0.5, -0.3, 0.4], e), fov: 36, ap: 1.0, focus: lerp(4.0, 2.3, e) }; },
  update: (u, t) => { XR.n = xrUpdate(t, u); }, over: (ctx, u, t) => { counterOver(ctx, 30, false); const l0 = lineT('l11'); if (t > l0 + 7.3) { const [x, y] = projAnchor(XR.dB.d, [0, 0, 0]); const px = clamp(x, W * .3, W * .7), py = Math.max(H * 0.2, y - H * 0.22); ctx.strokeStyle = '#ff9f1c'; ctx.lineWidth = 4 * S; ctx.beginPath(); ctx.moveTo(px, py + H * .03); ctx.lineTo(x, y - H * .06); ctx.stroke(); pill(ctx, px, py, '223 MONTHS'); } } });

// ---------- reconstructed mechanism ----------
function buildMech() {
  const L = group(scene); L.userData.name = 'mech'; MC.L = L; LOC.mech = L; L.visible = false;
  const fl = mesh(new T.CylinderGeometry(3.5, 3.6, .2, 48), std(0x3a2418, .5, .2), { parent: L, pos: [0, -1.4, 0], cast: false, ol: .0 });
  mesh(new T.CylinderGeometry(1.1, 1.3, .35, 40), std(0x6a4524, .4, .6), { parent: L, pos: [0, -1.18, 0], ol: .02 });
  const M = group(L, [0, 0.3, 0]); MC.M = M; const bz = BRONZE(), br = BRASS();
  // frame
  for (const [x, y, w, h] of [[-.75, 0, .1, 2.0], [.75, 0, .1, 2.0], [0, .95, 1.6, .1], [0, -.95, 1.6, .1]]) mesh(roundedBox(w, h, .34, .03), bz, { parent: M, pos: [x, y, 0], ol: .012 });
  const front = mesh(roundedBox(1.5, 1.9, .06, .02), bz, { parent: M, pos: [0, 0, .18], ol: .012 });
  const zod = ctex(512, 512, (x) => { x.clearRect(0, 0, 512, 512); x.fillStyle = '#e9c978'; x.beginPath(); x.arc(256, 256, 250, 0, 7); x.fill(); x.fillStyle = '#7a4a22'; x.beginPath(); x.arc(256, 256, 214, 0, 7); x.fill(); x.fillStyle = '#e9c978'; x.beginPath(); x.arc(256, 256, 176, 0, 7); x.fill(); x.fillStyle = '#5a3418'; x.beginPath(); x.arc(256, 256, 150, 0, 7); x.fill();
    x.strokeStyle = '#2a1a0c'; x.lineWidth = 3; for (let i = 0; i < 72; i++) { const a = i / 72 * 6.2832, r1 = i % 6 === 0 ? 176 : 192; x.beginPath(); x.moveTo(256 + Math.cos(a) * r1, 256 + Math.sin(a) * r1); x.lineTo(256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214); x.stroke(); }
    x.fillStyle = '#f4e0a0'; for (let i = 0; i < 12; i++) { const a = (i + .5) / 12 * 6.2832; x.beginPath(); x.arc(256 + Math.cos(a) * 232, 256 + Math.sin(a) * 232, 9, 0, 7); x.fill(); x.beginPath(); x.arc(256 + Math.cos(a) * 112, 256 + Math.sin(a) * 112, 8, 0, 7); x.fill(); } x.strokeStyle = '#f4e0a0'; x.lineWidth = 3; for (let k = 1; k <= 3; k++) { x.beginPath(); x.arc(256, 256, 40 * k + 10, 0, 7); x.stroke(); } });
  MC.dial = mesh(new T.CircleGeometry(.62, 64), new T.MeshStandardMaterial({ map: zod, transparent: true, roughness: .35, metalness: .6 }), { parent: M, pos: [0, .35, .225], cast: false });
  const hubs = group(M, [0, .35, .26]); MC.sun = group(hubs); MC.moon = group(hubs);
  mesh(roundedBox(.03, .52, .01, .004), br, { parent: MC.sun, pos: [0, .26, 0], cast: false }); mesh(new T.CircleGeometry(.075, 20), std(0xffc94a, .3, .5, { emissive: 0xff9a20, ei: .8 }), { parent: MC.sun, pos: [0, .5, .005], cast: false });
  mesh(roundedBox(.025, .44, .01, .004), std(0xdde3ea, .3, .9), { parent: MC.moon, pos: [0, .22, .01], cast: false }); mesh(new T.SphereGeometry(.06, 16, 12), std(0xf2f4f8, .3, .4), { parent: MC.moon, pos: [0, .44, .02], cast: false }); mesh(new T.SphereGeometry(.062, 16, 12, 0, Math.PI), std(0x1a1a28, .4), { parent: MC.moon, pos: [0, .44, .02], rotation: [0, 0, 0], cast: false });
  mesh(new T.SphereGeometry(.035, 12, 8), br, { parent: hubs });
  MC.sp1 = mesh(new T.CircleGeometry(.24, 40), new T.MeshBasicMaterial({ map: spiralTex(5, 60), transparent: true, color: 0xffd890 }), { parent: M, pos: [-.33, -.52, .225], cast: false }); MC.sp2 = mesh(new T.CircleGeometry(.24, 40), new T.MeshBasicMaterial({ map: spiralTex(4, 56), transparent: true, color: 0xffd890 }), { parent: M, pos: [.33, -.52, .225], cast: false });
  for (const q of [MC.sp1, MC.sp2]) { const rg = mesh(new T.TorusGeometry(.245, .02, 8, 40), br, { parent: M, pos: [q.position.x, q.position.y, .23], cast: false }); }
  // gear trains behind the front plate (visible from the side and back)
  MC.gears = [];
  const chain = (z, Ns, x0, y0, a0, mat) => { let px = x0, py = y0, ang = a0, prev = null; Ns.forEach((N, i) => { const r = N * .014; if (prev) { ang += (i % 2 ? .6 : -.55); const rp = prev.N * .014; px += Math.cos(ang) * (rp + r); py += Math.sin(ang) * (rp + r); } const pg = group(M, [px, py, z]); const gm = mesh(gearGeo(N, r, .026, .035, { spokes: N > 20 ? 5 : 0, hole: .012, spokeR: .2 }), mat[i % mat.length], { parent: pg, ol: false }); mesh(new T.CylinderGeometry(.012, .012, .3, 8), bz, { parent: pg, rot: [Math.PI / 2, 0, 0], cast: false });
    const o = { g: gm, N, x: px, y: py, ang: prev ? Math.atan2(py - prev.y, px - prev.x) : 0 }; MC.gears.push(o); prev = o; o.chain = z; }); };
  chain(0.06, [30, 14, 24, 12, 20, 16], -.45, .55, -.3, [br, bz]); chain(-0.1, [26, 12, 22, 10, 18, 14], .4, .6, 2.6, [bz, br]); chain(-0.02, [22, 16, 10, 24], -.3, -.6, 0.3, [br, bz]);
  for (const o of MC.gears) { o.g.userData = { z: o.chain }; }
  MC.sparks = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(60 * 3), 3)), new T.PointsMaterial({ map: glowTex([[0, 'rgba(255,240,200,1)'], [1, 'rgba(255,180,60,0)']]), size: .06, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })); MC.sparks.frustumCulled = false; L.add(MC.sparks);
}
function mechUpdate(t) {
  const k = t * 1.0; MC.sun.rotation.z = -k * .5; MC.moon.rotation.z = -k * .5 * 12.4 + .5;
  MC.dial.rotation.z = 0; MC.sp1.rotation.z = -k * .3; MC.sp2.rotation.z = k * .25;
  // chains: gear n meshes with gear n-1 within the same chain
  let prev = null, ph = k * 1.1;
  for (const o of MC.gears) {
    if (!prev || prev.chain !== o.chain) { o.g.rotation.z = (o.chain > 0 ? 1 : -1) * ph + o.ang; ph = o.g.rotation.z; }
    else { const al = o.ang; o.g.rotation.z = al + Math.PI - Math.PI / o.N - (ph - al) * 0 - ((prev.g.rotation.z - al) * prev.N / o.N); ph = o.g.rotation.z; }
    prev = o;
  }
  const sp = MC.sparks.geometry.attributes.position; for (let i = 0; i < 60; i++) { const f = (t * .3 + hash(i)) % 1, a = hash(i + 2) * 6.28; sp.setXYZ(i, Math.cos(a) * (.4 + f * .9) * 1.2, -1.2 + f * 3.2, Math.sin(a) * (.4 + f * .9) * 1.2); } sp.needsUpdate = true;
}
SHOTS.push({ id: '12', t0: lineT('l12') - 0.12, locs: ['mech'], light: { bg: [0.06, 0.035, 0.02], hemi: [0xffe3c2, 0x6a4524, 0.7], sun: { col: 0xffe0b0, int: 3.4, pos: [4, 6, 6], target: [0, 0.3, 0], ext: 4, far: 20 }, rim: { col: 0xffa860, int: 3.0, pos: [-4, 3, -5], target: [0, 0.3, 0] }, pts: [{ p: [0, 1.2, 2.2], col: 0xffc880, int: 8, dist: 8 }], fog: [0x1a0e08, 0.02], env: 'hall', envInt: 0.9, grade: { tint: [1.06, 1.0, 0.92], sat: 1.15, vig: 0.4, bloom: 0.45 } },
  cam: (u) => { const e = eio(u); const a = lerp(-0.55, 2.3, e), r = lerp(4.4, 3.4, e); return { p: [Math.sin(a) * r, lerp(0.9, 1.5, e), Math.cos(a) * r], l: [0, 0.45, 0], fov: 38, ap: 1.8, focus: r, roll: lerp(0.03, -0.03, e) }; },
  update: (u, t) => { mechUpdate(t); } });
