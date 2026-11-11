// world.js (B02): sets (harbour building site, storm, concrete cutaway, modern lab, harbour ruins today), cast, textures, effects.
'use strict';
const LOC = {}, ENV = {}, OBJ = {};
function holdAt(ch, wp) { ch.root.updateMatrixWorld(true); const v = ch.root.worldToLocal(wp.clone()); return [v.x, v.y, v.z]; }
function glowTex(stops) { return ctex(256, 256, (x) => { const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); for (const [o, c] of stops) g.addColorStop(o, c); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }); }
function woodTex(c1, c2, rep) {
  return ctex(512, 512, (x) => { x.fillStyle = c1; x.fillRect(0, 0, 512, 512); const r = rng(11); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? c2 : c1; x.fillRect(0, i * 64, 512, 64); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, i * 64, 512, 3); }
    for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(60,30,10,${r() * .12})`; x.fillRect(r() * 512, r() * 512, 20 + r() * 90, 1 + r() * 2); } }, { repeat: rep });
}
function smoothNormals(g) {
  g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal, m = new Map(), keys = [];
  for (let i = 0; i < p.count; i++) { const k = p.getX(i).toFixed(4) + ',' + p.getY(i).toFixed(4) + ',' + p.getZ(i).toFixed(4); keys.push(k); const a = m.get(k) || [0, 0, 0]; a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); m.set(k, a); }
  for (let i = 0; i < p.count; i++) { const a = m.get(keys[i]), l = Math.hypot(a[0], a[1], a[2]) || 1; n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
}
// lumpy blob (white lime clast or a rock)
function blobGeo(seed, r = 0.5, k = 0.35, det = 3) {
  const g = new T.IcosahedronGeometry(r, det), p = g.attributes.position, v = new T.Vector3();
  for (let i = 0; i < p.count; i++) { v.set(p.getX(i), p.getY(i), p.getZ(i)); const n = v.clone().normalize(); const f = 1 + (vnoise(n.x * 2.3 + seed, n.y * 2.3 + n.z * 1.7) - .5) * k * 2 + (vnoise(n.x * 6 + 3, n.z * 6 + seed) - .5) * k * .5; v.copy(n).multiplyScalar(r * f); p.setXYZ(i, v.x, v.y, v.z); }
  smoothNormals(g); return g;
}
// ---------- concrete textures ----------
function concreteTex(o = {}) {        // o.lumps: draw white lime lumps; o.old: weathered
  return ctex(1024, 1024, (x, w, h) => {
    const r = rng(o.seed ?? 3);
    x.fillStyle = o.old ? '#9a958a' : '#a7a49d'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const c = 120 + r() * 70 | 0; x.fillStyle = `rgba(${c},${c - 4},${c - 10},${.15 + r() * .25})`; x.beginPath(); x.arc(r() * w, r() * h, 8 + r() * 46, 0, 7); x.fill(); }
    for (let i = 0; i < 1600; i++) { const c = [[90, 84, 76], [140, 120, 96], [70, 70, 72], [170, 160, 140]][i % 4]; x.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},.85)`; x.beginPath(); x.ellipse(r() * w, r() * h, 2 + r() * 7, 2 + r() * 5, r() * 3, 0, 7); x.fill(); }
    if (o.old) for (let i = 0; i < 60; i++) { x.strokeStyle = `rgba(60,70,50,${.03 + r() * .06})`; x.lineWidth = 2 + r() * 6; x.beginPath(); const sx = r() * w; x.moveTo(sx, 0); x.lineTo(sx + (r() - .5) * 60, h); x.stroke(); }
    if (o.lumps) for (let i = 0; i < (o.n ?? 26); i++) {
      const cx = 40 + r() * (w - 80), cy = 40 + r() * (h - 80), rr = 10 + r() * 22;
      x.fillStyle = '#f4f1e6'; x.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, q = rr * (.75 + r() * .45); x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.closePath(); x.fill();
      x.strokeStyle = 'rgba(120,115,100,.7)'; x.lineWidth = 3; x.stroke(); x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.arc(cx - rr * .3, cy - rr * .3, rr * .3, 0, 7); x.fill();
    }
  }, { repeat: o.repeat || [1, 1] });
}
// crack texture: red channel = progress along the crack (0 at the start), alpha = crack ink. Not colour-managed.
function crackTex(seed, o = {}) {
  const N = 1024, r = rng(seed), pts = [];
  let x0 = N * (o.x0 ?? 0.5), y0 = N * (o.y0 ?? 0.98); pts.push([x0, y0]);
  const steps = o.steps ?? 16;
  for (let i = 1; i <= steps; i++) { x0 += (r() - .5) * N * .16; x0 = clamp(x0, N * .15, N * .85); y0 -= N * (o.len ?? .92) / steps; pts.push([x0, y0]); }
  const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'); g.lineCap = g.lineJoin = 'round';
  const seg = (a, b, p0, p1, wd) => { const n = 8; for (let k = 0; k < n; k++) { const t0 = k / n, t1 = (k + 1) / n; g.strokeStyle = `rgb(${Math.round(lerp(p0, p1, t0) * 255)},0,0)`; g.lineWidth = wd; g.beginPath(); g.moveTo(lerp(a[0], b[0], t0), lerp(a[1], b[1], t0)); g.lineTo(lerp(a[0], b[0], t1), lerp(a[1], b[1], t1)); g.stroke(); } };
  for (let i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1], i / (pts.length - 1), (i + 1) / (pts.length - 1), (o.w ?? 16) * (1 - i / pts.length * .5));
  for (let i = 2; i < pts.length - 2; i += 3) { const a = pts[i], b = [a[0] + (r() - .5) * 220, a[1] - 40 - r() * 90]; seg(a, b, i / (pts.length - 1), Math.min(1, i / (pts.length - 1) + .1), (o.w ?? 16) * .45); }
  const t = new T.CanvasTexture(c); t.colorSpace = T.NoColorSpace; t.anisotropy = 8; return t;
}
function crackMat(tex, col, glow = 0) {
  return new T.ShaderMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2,
    uniforms: { map: { value: tex }, reveal: { value: 0 }, col: { value: new T.Color(col) }, glow: { value: glow }, op: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform sampler2D map; uniform float reveal, glow, op; uniform vec3 col; varying vec2 vUv; void main(){ vec4 c = texture2D(map, vUv); if (c.a < .35 || c.r > reveal + .001) discard; gl_FragColor = vec4(col * (1. + glow), op * smoothstep(.35, .7, c.a)); }' });
}
// ---------- water: displaced faceted plane; amp/chop are per-material uniforms, calm inside the harbour (z < 0) ----------
function waterMat(col, o = {}) {
  const m = new T.MeshStandardMaterial({ color: col, roughness: .18, metalness: .05, flatShading: true, transparent: !!o.op, opacity: o.op ?? 1 });
  m.userData.u = { uT: TIMEU, uAmp: { value: o.amp ?? .3 }, uChop: { value: o.chop ?? .5 }, uCalmZ: { value: o.calmZ ?? -999 } };
  m.onBeforeCompile = sh => { Object.assign(sh.uniforms, m.userData.u);
    sh.vertexShader = 'uniform float uT, uAmp, uChop, uCalmZ;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec4 wpw = modelMatrix * vec4(position, 1.); vec2 q = wpw.xz;
      float h = sin(q.x * .31 + uT * 1.07) * .5 + sin(q.y * .47 - uT * 1.31 + q.x * .21) * .36 + sin((q.x + q.y) * .93 + uT * 1.93) * .17 * uChop + sin(q.x * 1.71 - q.y * 1.29 - uT * 2.37) * .11 * uChop;
      float calm = smoothstep(uCalmZ - 2., uCalmZ + 1.5, wpw.z);
      transformed.z += h * uAmp * mix(.15, 1., calm);`); };
  m.customProgramCacheKey = () => 'water';
  return m;
}
function waterPlane(parent, w, d, mat, y, seg = 1) { const m = new T.Mesh(new T.PlaneGeometry(w, d, Math.round(w * seg), Math.round(d * seg)), mat); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; parent.add(m); return m; }
function skyDome(parent, top, hor, r = 380) {
  const m = new T.Mesh(new T.SphereGeometry(r, 32, 16), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new T.Color(top) }, hor: { value: new T.Color(hor) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform vec3 top, hor; varying vec3 vP; void main(){ float y = max(vP.y, 0.); gl_FragColor = vec4(mix(hor, top, pow(y, .55)), 1.); }' }));
  parent.add(m); return m;
}
function cloud(parent, x, y, z, s, col = 0xffffff) { const g = group(parent, [x, y, z]); const r = rng(Math.round(x * 7 + z)); const m = std(col, .95);
  for (let i = 0; i < 6; i++) mesh(new T.SphereGeometry(1, 16, 10), m, { parent: g, pos: [(i - 2.5) * s * .55, r() * s * .3, (r() - .5) * s * .4], scl: [s * (.6 + r() * .4), s * (.45 + r() * .3), s * .6], cast: false, recv: false }); return g; }

// ---------- particles helper ----------
function points(parent, n, size, stops, o = {}) {
  const p = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(n * 3), 3)),
    new T.PointsMaterial({ map: glowTex(stops), size, transparent: true, depthWrite: false, blending: o.add === false ? T.NormalBlending : T.AdditiveBlending, fog: o.fog ?? false, opacity: o.op ?? 1, sizeAttenuation: true }));
  p.frustumCulled = false; parent.add(p); return p;
}
// aperiodic event clock: k-th event of stream s starts at t_k with jittered spacing; returns [index, phase 0..1] for the current event
function evClock(t, s, base, jit) { let k = Math.floor(t / base) - 1; for (let j = 0; j < 3; j++, k++) { const t0 = (k + hash2(k, s) * jit) * base, t1 = (k + 1 + hash2(k + 1, s) * jit) * base; if (t >= t0 && t < t1) return [k, (t - t0) / (t1 - t0)]; } return [0, 0]; }

// ---------- cast ----------
const TUNIC = { yb: 0x3f86c8, master: 0x9c2f2f };
function headband(col) { return g => { const h = group(g, [0, 0.3, 0]); mesh(new T.TorusGeometry(0.47, 0.05, 10, 32), std(col, .7), { parent: h, rot: [Math.PI / 2 - 0.1, 0, 0], ol: 0.012 }); return h; }; }
function hairTufts(col) { return g => { const h = group(g); const m = std(col, .9); for (const s of [-1, 1]) for (let k = 0; k < 3; k++) mesh(new T.SphereGeometry(0.075, 10, 8), m, { parent: h, pos: [s * (0.46 - k * .02), 0.1 - k * 0.1, -0.16 - k * .06], ol: 0.01 }); return h; }; }
function strawHat(g) { const h = group(g, [0, 0.38, 0]); const m = std(0xe0b965, .9); mesh(new T.CylinderGeometry(0.62, 0.66, 0.05, 28), m, { parent: h, ol: 0.014 }); mesh(new T.SphereGeometry(0.33, 20, 10, 0, 6.29, 0, 1.3), m, { parent: h, pos: [0, 0.02, 0], ol: 0.014 }); return h; }
function capHat(col) { return g => { const h = group(g, [0, 0.4, 0.02]); const m = std(col, .8); mesh(new T.SphereGeometry(0.38, 24, 12, 0, 6.2832, 0, 1.15), m, { parent: h, scl: [1, .62, 1], ol: 0.02 }); mesh(new T.CylinderGeometry(0.4, 0.4, 0.045, 24), m, { parent: h, pos: [0, 0.01, 0.05], ol: 0.014 }); return h; }; }
function belt(col = 0x5a3a22) { return c => { mesh(new T.TorusGeometry(0.31 * c.shx, 0.035, 8, 28), std(col, .8), { parent: c.bg, pos: [0, 0.36 + (c.shy - 1) * .3, 0], rot: [Math.PI / 2, 0, 0] }); }; }
function ownMaterials(c) { c.root.traverse(o => { if (o.isMesh && o !== c.head) { o.material = o.material.clone(); } }); }
function makeCast() {
  OBJ.yb = makeChar({ body: TUNIC.yb, hat: headband(0xd63c2c), deco: belt(), flags: '' });
  OBJ.master = makeChar({ body: TUNIC.master, beard: 0xf2efe8, beardBig: 1.15, flags: 'w', shape: [1.28, 1.02], hat: hairTufts(0xdcdcd6), deco: belt(0xd9a441) });
  const W = [[0x8a6a3e, [0.82, 1.25], capHat(0x6a4a2a), ''], [0xc8743a, [1.3, 0.82], strawHat, 's'], [0x6a9a5a, [1.0, 1.0], headband(0xf2efe8), ''], [0xb9a27a, [1.38, 1.04], null, 's'], [0x7a6ab0, [0.9, 1.12], capHat(0x3a3a4a), '']];
  OBJ.workers = W.map(([col, shape, hat, fl], i) => makeChar({ body: col, shape, hat, flags: fl, beard: i === 3 ? 0x5a4a3a : 0, beardBig: .7, deco: belt() }));
  OBJ.sci = makeChar({ body: 0xf4f6f8, flags: 'g', hat: g => { const h = group(g, [0, .3, -.05]); mesh(new T.SphereGeometry(0.47, 24, 12, 0, 6.29, 0, 1.25), std(0x3a2a24, .8), { parent: h, ol: .015 }); return h; },
    deco: c => { mesh(new T.CylinderGeometry(0.33, 0.37, 0.8, 24, 1, true, 0.5, 5.28), std(0xffffff, .7, 0, { side: T.DoubleSide }), { parent: c.bg, pos: [0, 0.32, 0], ol: false }); } });
  OBJ.yb2 = makeChar({ body: TUNIC.yb, hat: headband(0xd63c2c), deco: belt() }); ownMaterials(OBJ.yb2);
  OBJ.yb2.root.traverse(o => { if (o.isMesh) { o.material.transparent = true; } });
}
function setOpacity(c, a) { c.root.traverse(o => { if (o.isMesh) { o.material.opacity = a; o.material.depthWrite = a > .98; o.visible = a > .01; } }); }

// =====================================================================================================
// SITE: Roman harbour building site. Wall along x (z in [-1.2, 1.2]); open sea at z > 1.2; calm harbour at z < -1.2; quay (land) at x > 4.
// =====================================================================================================
function buildSite() {
  const L = group(scene); L.userData.name = 'site'; LOC.site = L; const S = {}; OBJ.site = S;
  S.sky = skyDome(L, 0x4f9be8, 0xd4ecff);
  for (const [x, y, z, s] of [[-60, 40, -120, 6], [40, 48, -140, 8], [-110, 34, 40, 6], [90, 36, 80, 7], [0, 55, 160, 9]]) cloud(L, x, y, z, s);
  S.seaMat = waterMat(0x2f9fb8, { amp: .35, chop: .7, calmZ: 0.5 }); S.sea = waterPlane(L, 260, 260, S.seaMat, -0.55, .5);
  // quay (land) and its stone edge
  const sand = ctex(512, 512, (x) => { x.fillStyle = '#d9c08f'; x.fillRect(0, 0, 512, 512); const r = rng(5); for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(${150 + r() * 60 | 0},${120 + r() * 50 | 0},${80 + r() * 40 | 0},.35)`; x.fillRect(r() * 512, r() * 512, 2 + r() * 5, 2 + r() * 4); } }, { repeat: [6, 6] });
  mesh(new T.BoxGeometry(30, 1.2, 26), std(0xffffff, .95, 0, { map: sand }), { parent: L, pos: [19, -0.6, 0], cast: false });
  const stoneT = ctex(512, 256, (x) => { x.fillStyle = '#b8a888'; x.fillRect(0, 0, 512, 256); x.strokeStyle = '#7d6e58'; x.lineWidth = 6; for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) x.strokeRect(i * 86 + (j % 2) * 43, j * 64, 86, 64); }, { repeat: [8, 1] });
  mesh(new T.BoxGeometry(30.2, 1.4, 0.4), std(0xffffff, .9, 0, { map: stoneT }), { parent: L, pos: [19, -0.5, 13], cast: false });
  mesh(new T.BoxGeometry(0.4, 1.4, 26.2), std(0xffffff, .9, 0, { map: stoneT }), { parent: L, pos: [4.1, -0.5, 0], cast: false });
  // the sea wall
  S.plain = concreteTex({ seed: 4, repeat: [3, 1] }); S.lumpy = concreteTex({ seed: 9, lumps: true, n: 30, repeat: [1, 1] });
  const wm = std(0xffffff, .92, 0, { map: S.plain });
  S.wallFin = mesh(new T.BoxGeometry(14, 4.6, 2.4), wm, { parent: L, pos: [-13, 0.3, 0], ol: 0.03 });     // finished part x -20..-6, top y 2.6
  S.wallLow = mesh(new T.BoxGeometry(6.5, 3.2, 2.4), wm, { parent: L, pos: [-2.75, -0.4, 0], ol: 0.03 });   // unfinished part x -6..0.5, top 1.2
  S.wallLowTop = mesh(new T.BoxGeometry(6.5, 1.4, 2.4), wm, { parent: L, pos: [-2.75, 1.9, 0], ol: 0.03 }); // finished later (storm)
  S.wallYB = mesh(new T.BoxGeometry(3.6, 4.6, 2.4), std(0xffffff, .92, 0, { map: S.lumpy }), { parent: L, pos: [2.3, 0.3, 0], ol: 0.03 }); // the young builder's section x 0.5..4.1
  mesh(new T.BoxGeometry(20.2, 0.18, 2.6), std(0x9a968c, .9), { parent: L, pos: [-9.9, 2.69, 0], ol: 0.02 });               // walkway cap
  // 3D lime lumps on the young builder's section: quay-facing end (x = 4.1) and the sea face (z = 1.2)
  S.lumps = [];
  const r = rng(77);
  for (let i = 0; i < 16; i++) { const end = i < 9; const g = blobGeo(i * 3.1, 0.07 + r() * 0.07, .3, 2); const m = mesh(g, std(0xf6f2e6, .75), { parent: L, ol: 0.008 });
    if (end) m.position.set(4.1 + 0.01, 0.3 + r() * 2.1, -1.0 + r() * 2.0); else m.position.set(0.7 + r() * 3.2, 0.2 + r() * 2.2, 1.2 + 0.01); m.scale.set(1, 1, .6); m.rotation.set(r(), r(), r()); S.lumps.push(m); }
  S.jabLump = S.lumps[0]; S.jabLump.position.set(4.11, 1.45, 0.35); S.jabLump.scale.set(1.3, 1.3, .7);
  // formwork boards and scaffolding on the unfinished part
  const plank = std(0xffffff, .8, 0, { map: woodTex('#b78550', '#a77544', [1, 1]) }); S.form = group(L);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) mesh(roundedBox(1.05, 0.28, 0.08, .03), plank, { parent: S.form, pos: [-5.5 + i * 1.08, 1.4, s * 1.25], ol: .012 });
  for (let i = 0; i <= 6; i++) for (const s of [-1, 1]) mesh(new T.CylinderGeometry(0.05, 0.05, 1.0, 8), std(0x7a5232, .8), { parent: S.form, pos: [-6 + i * 1.08, 1.5, s * 1.32] });
  S.scaf = group(L);
  const pole = std(0x8a5e38, .8);
  for (let i = 0; i < 5; i++) for (const zz of [1.7, 2.7]) mesh(new T.CylinderGeometry(0.07, 0.07, 4.6, 8), pole, { parent: S.scaf, pos: [-5.8 + i * 1.6, 1.2, zz], ol: .012 });
  for (let k = 0; k < 2; k++) mesh(roundedBox(6.8, 0.1, 1.2, .03), plank, { parent: S.scaf, pos: [-2.6, 1.1 + k * 1.6, 2.2], ol: .012 });
  for (let i = 0; i < 5; i++) mesh(new T.CylinderGeometry(0.04, 0.04, 1.4, 6), pole, { parent: S.scaf, pos: [-5.8 + i * 1.6, 2.6, 2.2], rot: [Math.PI / 2, 0, 0] });
  const lad = group(S.scaf, [0.2, 0, 2.4], [0.25, 0, 0]); for (const s of [-1, 1]) mesh(new T.CylinderGeometry(0.04, 0.04, 3.6, 6), pole, { parent: lad, pos: [s * .25, 1.6, 0] }); for (let k = 0; k < 8; k++) mesh(new T.CylinderGeometry(0.03, 0.03, 0.5, 6), pole, { parent: lad, pos: [0, 0.2 + k * .42, 0], rot: [0, 0, Math.PI / 2] });
  // wooden crane (A-frame with rope and a stone)
  const cr = group(L, [5.8, 0, -3.2]); for (const s of [-1, 1]) mesh(new T.CylinderGeometry(0.09, 0.11, 5.2, 8), pole, { parent: cr, pos: [s * .9, 2.45, 0], rot: [0, 0, s * .2], ol: .015 });
  mesh(new T.CylinderGeometry(0.08, 0.08, 3.2, 8), pole, { parent: cr, pos: [-1.2, 4.6, 0], rot: [0, 0, 1.25], ol: .015 }); mesh(new T.CylinderGeometry(0.015, 0.015, 3.0, 4), std(0xd8c49a, .9), { parent: cr, pos: [-2.6, 3.4, 0] });
  mesh(blobGeo(5, 0.35, .2, 2), std(0xa59f92, .9, 0, { flat: true }), { parent: cr, pos: [-2.6, 1.8, 0], ol: .015 });
  // mixing trough with the wet mix (bubbles + steam) and the young builder's sack
  const tr = group(L, [9, 0, 1.5]); S.trough = tr; const tw = std(0xffffff, .8, 0, { map: woodTex('#a06c3e', '#8e5e34', [2, 1]) });
  mesh(roundedBox(2.6, 0.12, 1.5, .03), tw, { parent: tr, pos: [0, 0.06, 0], ol: .015 });
  for (const s of [-1, 1]) { mesh(roundedBox(2.6, 0.7, 0.1, .03), tw, { parent: tr, pos: [0, 0.35, s * 0.72], ol: .015 }); mesh(roundedBox(0.1, 0.7, 1.5, .03), tw, { parent: tr, pos: [s * 1.25, 0.35, 0], ol: .015 }); }
  const mixT = ctex(512, 256, (x) => { x.fillStyle = '#8f8d86'; x.fillRect(0, 0, 512, 256); const q = rng(8); for (let i = 0; i < 400; i++) { const c = 110 + q() * 50 | 0; x.fillStyle = `rgba(${c},${c},${c - 6},.5)`; x.beginPath(); x.arc(q() * 512, q() * 256, 3 + q() * 14, 0, 7); x.fill(); } });
  S.mix = mesh(new T.PlaneGeometry(2.4, 1.32, 24, 12), std(0xffffff, .35, 0, { map: mixT }), { parent: tr, pos: [0, 0.55, 0], rot: [-Math.PI / 2, 0, 0], cast: false });
  S.powderPatch = mesh(new T.CircleGeometry(0.42, 24), std(0xf4f1ea, .9), { parent: tr, pos: [-0.25, 0.565, 0.1], rot: [-Math.PI / 2, 0, 0], cast: false });
  S.bubbles = []; const bm = std(0xb9b7b0, .25, 0, { transparent: true, opacity: .95 });
  for (let i = 0; i < 26; i++) { const b = mesh(new T.SphereGeometry(0.09, 12, 8, 0, 6.29, 0, 1.6), bm, { parent: tr, cast: false, ol: 0.006 }); S.bubbles.push(b); }
  S.steam = points(tr, 90, 0.9, [[0, 'rgba(255,255,255,.55)'], [.5, 'rgba(240,240,240,.22)'], [1, 'rgba(255,255,255,0)']], { add: false });
  S.sack = group(L); S.sack.scale.setScalar(0.72); const sackM = std(0xd8c7a0, .95);
  mesh(lathe([[0, -0.38], [0.28, -0.33], [0.34, 0], [0.3, 0.28], [0.16, 0.42], [0.18, 0.48], [0, 0.5]], 18), sackM, { parent: S.sack, ol: 0.014 });
  mesh(new T.TorusGeometry(0.16, 0.03, 6, 16), std(0x8a6a3e, .8), { parent: S.sack, pos: [0, 0.43, 0], rot: [Math.PI / 2, 0, 0] });
  S.powder = points(L, 120, 0.11, [[0, 'rgba(255,255,255,1)'], [.6, 'rgba(250,250,245,.7)'], [1, 'rgba(255,255,255,0)']], { add: false });
  // calm lime troughs for the others, with a bucket of water
  S.limeTr = [[14.6, 3.8], [16.8, 2.2]].map(([x, z], i) => { const g = group(L, [x, 0, z], [0, .3 * i, 0]); mesh(roundedBox(1.6, 0.5, 1.0, .05), tw, { parent: g, pos: [0, 0.25, 0], ol: .015 }); mesh(new T.PlaneGeometry(1.4, .8), std(0xd9d6cc, .3, 0), { parent: g, pos: [0, 0.48, 0], rot: [-Math.PI / 2, 0, 0], cast: false }); return g; });
  S.bucket = group(L); mesh(lathe([[0, 0], [0.18, 0], [0.22, 0.34], [0.2, 0.34], [0.16, 0.03], [0, 0.03]], 18), std(0x8e5e34, .8), { parent: S.bucket, ol: .012 });
  S.pour = points(L, 70, 0.07, [[0, 'rgba(160,220,255,1)'], [1, 'rgba(120,200,255,0)']], { add: false });
  // props: sand pile, stone pile, amphorae, crates, baskets, tools
  mesh(new T.ConeGeometry(1.6, 1.3, 24), std(0xd9bd84, .95), { parent: L, pos: [18, 0.6, -5.5], ol: .02 });
  for (let i = 0; i < 9; i++) { const q = rng(i + 40); mesh(blobGeo(i, 0.32 + q() * .2, .25, 1), std([0xa59f92, 0x8f897d, 0xb5ad9c][i % 3], .9, 0, { flat: true }), { parent: L, pos: [7 + (i % 3) * .7, 0.25 + Math.floor(i / 3) * .35, -5.6 + (i % 2) * .5], ol: .012 }); }
  for (let i = 0; i < 5; i++) { const a = group(L, [19 + (i % 3) * .55, 0, 5.2 + Math.floor(i / 3) * .6], [0.15 * i, 0, 0]); mesh(lathe([[0, 0], [0.1, 0.03], [0.26, 0.35], [0.28, 0.65], [0.15, 0.95], [0.11, 1.1], [0.17, 1.18], [0.0, 1.18]], 18), std(0xc9703f, .75), { parent: a, ol: .016 }); }
  for (const [x, z] of [[21, -2], [21.9, -1.4], [12.5, 6]]) mesh(roundedBox(0.9, 0.7, 0.9, .06), tw, { parent: L, pos: [x, 0.35, z], rot: [0, x, 0], ol: .015 });
  // the harbour town on the far shore, a lighthouse, moored boats
  const hill = std(0x9bbf6a, .95), hill2 = std(0x86ad5a, .95);
  for (const [x, z, rr, m] of [[-30, -70, 30, hill], [10, -80, 36, hill2], [-70, -60, 26, hill2], [45, -60, 22, hill]]) mesh(new T.SphereGeometry(rr, 28, 14, 0, 6.29, 0, 1.4), m, { parent: L, pos: [x, -rr * .72, z], scl: [1.7, 1, 1], cast: false });
  const wallC = [0xf1e3c6, 0xe9d2b0, 0xf6ead7, 0xe2c7a4], roofC = [0xc65a34, 0xb24c2e, 0xd06a3c];
  for (let i = 0; i < 34; i++) { const q = rng(i + 100); const x = -45 + q() * 85, z = -48 - q() * 18, hgt = 1.6 + q() * 2.4, w = 2 + q() * 2.6; const g = group(L, [x, 2 + (z + 48) * -.45 + q() * 1.5, z], [0, (q() - .5) * .6, 0]);
    mesh(roundedBox(w, hgt, 2.2, .1), std(wallC[i % 4], .9), { parent: g, pos: [0, hgt / 2, 0], ol: .04, cast: false }); const rf = mesh(new T.CylinderGeometry(0.01, 1.35, w + .3, 3), std(roofC[i % 3], .8), { parent: g, pos: [0, hgt + .4, 0], rot: [0, 0, Math.PI / 2], scl: [1, 1, .9], ol: .04, cast: false }); rf.rotation.set(Math.PI / 2 * 0, 0, Math.PI / 2); }
  const lh = group(L, [-38, 0, -30]); mesh(lathe([[0, 0], [2.4, 0], [2.0, 6], [1.6, 6], [1.6, 9], [1.2, 9], [1.1, 11], [0, 11.5]], 16), std(0xeee2c8, .9), { parent: lh, ol: .05, cast: false }); mesh(new T.SphereGeometry(.9, 12, 8), new T.MeshBasicMaterial({ color: new T.Color(2.5, 1.8, .9) }), { parent: lh, pos: [0, 10.2, 0], cast: false });
  S.boats = [[-9, -10, .4], [-17, -16, -.6], [1, -15, 2.4], [-26, -9, 1.2]].map(([x, z, ry], i) => { const b = group(L, [x, -0.55, z], [0, ry, 0]);
    const hs = new T.Shape(); hs.moveTo(-2, .9); hs.quadraticCurveTo(-2.1, -0.2, -1.2, -0.5); hs.lineTo(1.4, -0.5); hs.quadraticCurveTo(2.3, 0, 2.4, 1); hs.lineTo(-2, .9);
    mesh(new T.ExtrudeGeometry(hs, { depth: 1.2, bevelEnabled: true, bevelSize: .1, bevelThickness: .1, bevelSegments: 2 }), std([0x8a5a34, 0x6a4a2a, 0x9a6a3a][i % 3], .8), { parent: b, pos: [0, 0, -0.6], ol: .03 });
    mesh(new T.CylinderGeometry(0.06, 0.08, 4.2, 8), pole, { parent: b, pos: [0, 2.6, 0] }); const sail = mesh(new T.PlaneGeometry(2.2, 2.4, 6, 6), std(i % 2 ? 0xf2e6cc : 0xd9634a, .9, 0, { side: T.DoubleSide }), { parent: b, pos: [0.15, 2.7, 0], rot: [0, Math.PI / 2, 0], ol: false });
    return b; });
  // sea spray (waves hitting the wall face) + rain + storm wave (hidden in fair weather)
  S.spray = points(L, 520, 0.28, [[0, 'rgba(255,255,255,.95)'], [.5, 'rgba(235,248,255,.5)'], [1, 'rgba(255,255,255,0)']], { add: false });
  S.rain = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(900 * 6), 3)), new T.LineBasicMaterial({ color: 0xbfd0ea, transparent: true, opacity: .55 })); S.rain.frustumCulled = false; L.add(S.rain);
  S.bigWave = group(L); { const wv = new T.Mesh(new T.BoxGeometry(10, 5, 1.6, 30, 12, 2), waterMat(0x2a6f86, { amp: .35, chop: 1.4, op: .93 })); wv.position.y = -2.5; S.bigWave.add(wv);
    const cap = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 10, 16), std(0xf2f8ff, .5)); cap.rotation.z = Math.PI / 2; cap.position.set(0, 0, 0.3); S.bigWave.add(cap); }
  // crack decal on the sea face of the finished wall + white seam version
  S.crackT = crackTex(17, { x0: .48, y0: .97, len: .9, steps: 15, w: 18 });
  S.crack = new T.Mesh(new T.PlaneGeometry(3.4, 2.9), crackMat(S.crackT, 0x161218)); S.crack.position.set(-9, 1.15, 1.215); L.add(S.crack);
  S.seam = new T.Mesh(new T.PlaneGeometry(3.4, 2.9), crackMat(S.crackT, 0xfffbf0, 0.6)); S.seam.position.set(-9, 1.15, 1.22); L.add(S.seam);
  L.visible = false;
}
// per-frame site animation. o: {storm (0..1), finished (bool), mix (bubbling 0..1), steam (0..1), crack reveal, seam reveal}
function siteUpdate(t, o = {}) {
  const S = OBJ.site, st = o.storm ?? 0;
  S.seaMat.userData.u.uAmp.value = lerp(.35, 1.2, st); S.seaMat.userData.u.uChop.value = lerp(.7, 1.6, st); S.seaMat.color.setHex(st > .5 ? 0x24596a : 0x2f9fb8);
  S.sky.material.uniforms.top.value.setHex(st > .5 ? 0x1c2533 : 0x4f9be8); S.sky.material.uniforms.hor.value.setHex(st > .5 ? 0x4b5868 : 0xd4ecff);
  const fin = !!o.finished; S.wallLowTop.visible = fin; S.form.visible = !fin; S.scaf.visible = !fin;
  S.boats.forEach((b, i) => { b.position.y = -0.55 + nzf(t, i + 50, .5) * .08; b.rotation.z = nzf(t, i + 60, .4) * .05; b.visible = st < .5; });
  // mix: bubbles (aperiodic births), powder patch spreading, steam
  const mixK = o.mix ?? 0;
  S.bubbles.forEach((b, i) => { const [k, ph] = evClock(t + i * .37, i + 1, .55 + hash(i) * .5, .5); const on = mixK > hash(i + 9) * .8;
    b.visible = on; if (!on) return; b.position.set((hash2(k, i) - .5) * 2.1, 0.56, (hash2(i, k + 3) - .5) * 1.1); const s = Math.sin(ph * Math.PI) * (0.6 + hash2(k, i + 7) * .9) * (ph < .92 ? 1 : 0); b.scale.setScalar(Math.max(1e-3, s)); });
  S.mix.material.color.setScalar(1 - mixK * .08);
  S.powderPatch.scale.setScalar(Math.max(1e-3, o.patch ?? 0)); S.powderPatch.visible = (o.patch ?? 0) > .01;
  const sp = S.steam.geometry.attributes.position, stK = o.steam ?? 0;
  for (let i = 0; i < 90; i++) { const per = 1.4 + hash(i) * 1.2, ph = ((t + hash(i + 3) * per) % per) / per, k = Math.floor((t + hash(i + 3) * per) / per);
    const burst = o.burst ?? 0; const up = ph * (1.6 + burst * 2.4); sp.setXYZ(i, (hash2(k, i) - .5) * 2.0 + nzf(t, i, .7) * .2 + (hash2(i, k) - .5) * burst * 2, 0.6 + up, (hash2(k + 1, i) - .5) * 1.0 + burst * ph * 2.2 * hash2(k, i + 2)); }
  sp.needsUpdate = true; S.steam.material.opacity = stK; S.steam.visible = stK > .01; S.steam.material.size = (o.steamSize ?? 0.9) + (o.burst ?? 0) * 1.4;
  // spray at the wall's sea face: aperiodic slams
  const ssp = S.spray.geometry.attributes.position, sK = lerp(1, 3.2, st);
  for (let i = 0; i < 520; i++) { const e = i % 13; const [k, ph] = evClock(t, e + 200, 1.6 - st * .6, .7); const x = -19 + hash2(k, e) * 18; const v = (1 + hash(i) * 1.5) * sK, a = hash(i + 5) * 6.28;
    const tt = ph * 1.6; ssp.setXYZ(i, x + Math.cos(a) * hash(i + 2) * 1.2 * sK * .4 + tt * (hash(i + 8) - .5), Math.max(-0.5, -0.4 + v * tt * 1.8 - 4.9 * tt * tt), 1.4 + tt * hash(i + 9) * 1.5 * sK * .5); }
  ssp.needsUpdate = true; S.spray.material.size = .2 + st * .14;
  S.rain.visible = st > .3; if (S.rain.visible) { const rp = S.rain.geometry.attributes.position; for (let i = 0; i < 900; i++) { const x = -26 + hash(i) * 40, z = -6 + hash(i + 1) * 30, f = ((t * (1.3 + hash(i + 2) * .4) + hash(i + 3)) % 1), y = 14 - f * 16; rp.setXYZ(i * 2, x, y, z); rp.setXYZ(i * 2 + 1, x - .25, y - .9, z + .1); } rp.needsUpdate = true; }
  S.bigWave.visible = (o.wave ?? 0) > 0.01 && (o.wave ?? 0) < 0.98; if (S.bigWave.visible) { const w = o.wave; S.bigWave.position.set(-9, lerp(-0.8, 3.4, Math.sin(clamp(w * 1.15) * Math.PI)) - (w > .7 ? (w - .7) * 6 : 0), lerp(8, 1.8, eout(w))); S.bigWave.rotation.set(lerp(-0.2, 0.55, w), 0, 0); }
  S.crack.material.uniforms.reveal.value = o.crack ?? 0; S.crack.visible = (o.crack ?? 0) > 0;
  S.seam.material.uniforms.reveal.value = o.seam ?? 0; S.seam.visible = (o.seam ?? 0) > 0; S.seam.material.uniforms.glow.value = o.seamGlow ?? .6;
}

// =====================================================================================================
// XS: concrete cutaway. Slab 8 x 10 x 2 split by a jagged crack (gap) running top to bottom; one white lump sits on the crack.
// =====================================================================================================
function buildXS() {
  const L = group(scene, [0, 0, -300]); L.userData.name = 'xs'; LOC.xs = L; const X = {}; OBJ.xs = X;
  const bg = new T.Mesh(new T.SphereGeometry(120, 24, 12), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, uniforms: { a: { value: new T.Color(0x23303f) }, b: { value: new T.Color(0x0b1018) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform vec3 a, b; varying vec3 vP; void main(){ gl_FragColor = vec4(mix(b, a, smoothstep(-.6, .8, vP.y)), 1.); }' })); L.add(bg);
  const r = rng(31), N = 22; X.path = [];
  for (let i = 0; i <= N; i++) { const y = 5 - i * 10 / N; const x = i === 0 || i === N ? (r() - .5) * .4 : (r() - .5) * 1.1 + Math.sin(i * .9) * .3; X.path.push(new T.Vector2(x, y)); }
  X.lumpY = 0.6; let lx = 0; for (let i = 0; i < N; i++) { const a = X.path[i], b = X.path[i + 1]; if (X.lumpY <= a.y && X.lumpY >= b.y) lx = lerp(a.x, b.x, (a.y - X.lumpY) / (a.y - b.y)); } X.lumpX = lx;
  const gap = 0.36, D = 2.0;
  const half = (side) => { const s = new T.Shape(); const ox = side * gap / 2; const pts = X.path.map(p => new T.Vector2(p.x + ox, p.y));
    if (side < 0) { s.moveTo(-4, -5); s.lineTo(-4, 5); for (const p of pts) s.lineTo(p.x, p.y); } else { s.moveTo(4, 5); s.lineTo(4, -5); for (let i = pts.length - 1; i >= 0; i--) s.lineTo(pts[i].x, pts[i].y); } s.closePath(); return s; };
  const ct = concreteTex({ seed: 12 }); ct.repeat.set(.14, .14); ct.offset.set(.5, .5);
  const cm = new T.MeshStandardMaterial({ map: ct, roughness: .92 }), sideM = std(0x6e6a63, .95);
  for (const side of [-1, 1]) { const g = new T.ExtrudeGeometry(half(side), { depth: D, bevelEnabled: true, bevelSize: .04, bevelThickness: .04, bevelSegments: 1, curveSegments: 4 }); const m = new T.Mesh(g, [cm, sideM]); m.castShadow = m.receiveShadow = true; L.add(m); addOutline(m, 0.025); }
  mesh(new T.PlaneGeometry(8.4, 10.4), std(0x1a1614, 1), { parent: L, pos: [0, 0, 0.02], cast: false });
  // aggregate pebbles on the cut face (kept off the crack and the lump)
  const pm = [std(0x7d776c, .85, 0, { flat: true }), std(0x9a8a6e, .85, 0, { flat: true }), std(0x5e5c5a, .85, 0, { flat: true }), std(0xb7ad98, .85, 0, { flat: true })];
  const cx = y => { for (let i = 0; i < N; i++) { const a = X.path[i], b = X.path[i + 1]; if (y <= a.y && y >= b.y) return lerp(a.x, b.x, (a.y - y) / (a.y - b.y)); } return 0; };
  X.cx = cx;
  for (let i = 0; i < 120; i++) { const x = -3.7 + r() * 7.4, y = -4.7 + r() * 9.4, rr = .1 + r() * .32; if (Math.abs(x - cx(y)) < gap / 2 + rr + .05) continue; if (Math.hypot(x - lx, y - X.lumpY) < 1.0) continue;
    mesh(blobGeo(i, rr, .3, 1), pm[i % 4], { parent: L, pos: [x, y, D + .02 - rr * .45], rot: [r() * 3, r() * 3, 0], ol: .008 }); }
  // white lime lumps: one on the crack, two more elsewhere
  X.lump = mesh(blobGeo(4.2, 0.62, .28, 3), std(0xf7f4ea, .7), { parent: L, pos: [lx + 0.25, X.lumpY, D - 0.12], scl: [1, .9, .55], ol: .015 });
  for (const [x, y] of [[-2.3, 3.2], [2.6, -3.1]]) mesh(blobGeo(x + y, 0.42, .3, 3), std(0xf7f4ea, .7), { parent: L, pos: [x, y, D - 0.08], scl: [1, .85, .5], ol: .012 });
  // the water thread (tube along the crack, grows with drawRange), the milky stream, fizz, crystals, glowing seam
  const top = X.path.filter(p => p.y >= X.lumpY - 0.05).map(p => new T.Vector3(p.x, p.y, D - 0.15)); top.push(new T.Vector3(lx, X.lumpY, D - 0.15));
  X.waterCurve = new T.CatmullRomCurve3(top); const tg = new T.TubeGeometry(X.waterCurve, 120, 0.075, 8); X.water = new T.Mesh(tg, new T.MeshStandardMaterial({ color: 0x4fb6ff, emissive: 0x1f6fd0, emissiveIntensity: .8, roughness: .1, transparent: true, opacity: .92 })); L.add(X.water); X.waterIdx = tg.index.count;
  X.drop = mesh(new T.SphereGeometry(0.11, 14, 10), X.water.material, { parent: L });
  X.milk = points(L, 260, 0.24, [[0, 'rgba(255,255,255,1)'], [.5, 'rgba(245,245,240,.6)'], [1, 'rgba(255,255,255,0)']], { add: false });
  X.fizz = points(L, 90, 0.12, [[0, 'rgba(255,255,255,.1)'], [.7, 'rgba(255,255,255,.7)'], [.85, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']], { add: false });
  const cg = new T.OctahedronGeometry(0.12, 0); cg.scale(0.6, 1.6, 0.6);
  X.cry = new T.InstancedMesh(cg, std(0xffffff, .25, 0, { emissive: 0xdff4ff, ei: .35 }), 360); X.cry.instanceMatrix.setUsage(T.DynamicDrawUsage); L.add(X.cry);
  X.cryData = []; for (let i = 0; i < 360; i++) { const y = 4.9 - r() * 9.8, side = i % 2 ? 1 : -1; X.cryData.push({ y, side, z: D - 0.05 - r() * 1.6, a: (r() - .5) * 1.2, s: .7 + r() * .7 }); }
  X.seamCurve = new T.CatmullRomCurve3(X.path.map(p => new T.Vector3(p.x, p.y, D + 0.01)));
  X.seam = new T.Mesh(new T.TubeGeometry(X.seamCurve, 160, 0.09, 6), new T.MeshBasicMaterial({ color: new T.Color(2.2, 2.2, 2.0), transparent: true, opacity: 0 })); L.add(X.seam);
  L.visible = false;
}
// p: {water 0..1, hit (0..1 splash), dissolve 0..1, crystals 0..1 (zip progress), seam 0..1}
const _m4 = new T.Matrix4(), _q4 = new T.Quaternion(), _v4 = new T.Vector3(), _s4 = new T.Vector3(), _e4 = new T.Euler();
function xsUpdate(t, p) {
  const X = OBJ.xs, D = 2.0;
  const w = clamp(p.water ?? 0); X.water.geometry.setDrawRange(0, Math.floor(X.waterIdx * w / 48) * 48); X.water.visible = w > 0.005;
  const tip = X.waterCurve.getPointAt(Math.min(1, w + 1e-4)); X.drop.position.copy(tip); X.drop.visible = w > 0.01 && w < 0.999; X.drop.scale.setScalar(1 + nzf(t, 3, 4) * .15);
  const dis = clamp(p.dissolve ?? 0); X.lump.scale.set(Math.max(.02, 1 - dis * .92), Math.max(.02, .9 - dis * .82), Math.max(.02, .55 - dis * .5)); X.lump.position.y = X.lumpY - dis * .15;
  const mp = X.milk.geometry.attributes.position;
  for (let i = 0; i < 260; i++) { const life = ((t * .35 + hash(i)) % 1); const along = (i % 2 ? 1 : -1) * life * (1.2 + dis * 3.6); const y = X.lumpY + along + (i % 2 ? 0 : -0.1); mp.setXYZ(i, X.cx(y) + (hash(i + 3) - .5) * .25, y, D - 0.1 - hash(i + 5) * .8); }
  mp.needsUpdate = true; X.milk.material.opacity = sstep(0, .25, dis) * (1 - sstep(.75, 1, p.crystals ?? 0) * .7); X.milk.visible = dis > 0.01;
  const fp = X.fizz.geometry.attributes.position; const fz = (p.fizz ?? 0);
  for (let i = 0; i < 90; i++) { const ph = ((t * (1.2 + hash(i) * 1.5) + hash(i + 7)) % 1), a = hash(i + 1) * 6.28, rr = .3 + hash(i + 2) * .5; fp.setXYZ(i, X.lump.position.x + Math.cos(a) * rr * (1 - dis * .6), X.lumpY + Math.sin(a) * rr * .8 + ph * .9, D + .05 + ph * .4); }
  fp.needsUpdate = true; X.fizz.material.opacity = fz; X.fizz.visible = fz > .01;
  const cz = clamp(p.crystals ?? 0); let n = 0;
  for (const c of X.cryData) { const d = Math.abs(c.y - X.lumpY) / 5.6; const g = clamp((cz * 1.25 - d) / .25); if (g <= 0.001) { _s4.set(0, 0, 0); } else _s4.setScalar(g * c.s);
    const x = X.cx(c.y) + c.side * (0.18 - g * .1); _e4.set(0, 0, c.side * (Math.PI / 2 - .35) + c.a * .4); _q4.setFromEuler(_e4); _m4.compose(_v4.set(x, c.y, c.z), _q4, _s4); X.cry.setMatrixAt(n++, _m4); }
  X.cry.instanceMatrix.needsUpdate = true; X.cry.visible = cz > 0.001;
  X.seam.material.opacity = clamp(p.seam ?? 0);  X.seam.visible = (p.seam ?? 0) > .01;
}

// =====================================================================================================
// LAB: modern lab, two concrete cylinders (with lumps / without), water tube, drip, wall calendar, a scientist
// =====================================================================================================
function buildLab() {
  const L = group(scene, [200, 0, 0]); L.userData.name = 'lab'; LOC.lab = L; const B = {}; OBJ.lab = B;
  const tile = ctex(512, 512, (x) => { x.fillStyle = '#d9dde2'; x.fillRect(0, 0, 512, 512); x.strokeStyle = '#b4bac2'; x.lineWidth = 4; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 512); x.moveTo(0, i * 64); x.lineTo(512, i * 64); x.stroke(); } }, { repeat: [4, 4] });
  mesh(new T.PlaneGeometry(20, 20), std(0xffffff, .5, 0, { map: tile }), { parent: L, rot: [-Math.PI / 2, 0, 0], cast: false });
  const wallM = std(0xe8eef2, .9); mesh(new T.PlaneGeometry(20, 8), wallM, { parent: L, pos: [0, 4, -3.5], cast: false }); mesh(new T.PlaneGeometry(20, 8), wallM, { parent: L, pos: [-6, 4, 0], rot: [0, Math.PI / 2, 0], cast: false });
  mesh(new T.PlaneGeometry(20, 0.5), std(0x6fa8c8, .8), { parent: L, pos: [0, 1.2, -3.48], cast: false });
  // bench
  mesh(roundedBox(5.4, 0.12, 1.6, .04), std(0xf6f7f8, .4), { parent: L, pos: [0, 1.0, -1.2], ol: .015 }); mesh(roundedBox(5.2, 0.9, 1.4, .04), std(0x7f97ab, .6), { parent: L, pos: [0, 0.45, -1.2], ol: .015 });
  // cylinders
  const lt = concreteTex({ seed: 21, lumps: true, n: 34, repeat: [1, 1] }), pt = concreteTex({ seed: 22 });
  B.cylA = group(L, [-0.8, 1.06, -1.0]); B.cylB = group(L, [1.1, 1.06, -1.0]);
  for (const [g, tx, cr] of [[B.cylA, lt, 23], [B.cylB, pt, 29]]) {
    mesh(new T.CylinderGeometry(0.38, 0.38, 1.0, 40), std(0xffffff, .9, 0, { map: tx }), { parent: g, pos: [0, 0.5, 0], ol: .015 });
    const crT = crackTex(cr, { x0: .5, y0: .99, len: .98, steps: 12, w: 22 });
    g.userData.crack = new T.Mesh(new T.CylinderGeometry(0.385, 0.385, 1.0, 40, 1, true, -0.55, 1.1), crackMat(crT, 0x141214)); g.userData.crack.position.y = 0.5; g.add(g.userData.crack);
    g.userData.seam = new T.Mesh(new T.CylinderGeometry(0.388, 0.388, 1.0, 40, 1, true, -0.55, 1.1), crackMat(crT, 0xfffbf0, .5)); g.userData.seam.position.y = 0.5; g.add(g.userData.seam);
    mesh(new T.CylinderGeometry(0.42, 0.42, 0.06, 40), std(0x9aa3ad, .3, .8), { parent: g, pos: [0, -0.03, 0], ol: .01 });
  }
  for (let i = 0; i < 9; i++) { const q = rng(i + 7); const a = q() * 6.28, y = .1 + q() * .8; mesh(blobGeo(i, 0.05 + q() * .03, .3, 2), std(0xf6f2e6, .75), { parent: B.cylA, pos: [Math.sin(a) * .38, y, Math.cos(a) * .38], scl: [1, 1, .6], ol: .005 }); }
  // water rig: bottles on a stand, tubes down to each cylinder top, beakers below
  const glass = new T.MeshPhysicalMaterial({ color: 0xdff4ff, roughness: .05, transparent: true, opacity: .35, depthWrite: false, envMapIntensity: 1.5 });
  for (const [g, x] of [[B.cylA, -0.8], [B.cylB, 1.1]]) {
    mesh(new T.CylinderGeometry(0.02, 0.02, 2.2, 8), std(0x5a6470, .4, .7), { parent: L, pos: [x - 0.55, 2.2, -1.25] });
    mesh(new T.BoxGeometry(0.7, 0.04, 0.06), std(0x5a6470, .4, .7), { parent: L, pos: [x - 0.25, 3.1, -1.25] });
    mesh(lathe([[0, 0], [.18, 0], [.2, .05], [.2, .5], [.08, .62], [.08, .7], [0, .7]], 20), glass, { parent: L, pos: [x, 3.15, -1.2], cast: false });
    mesh(new T.CylinderGeometry(.17, .17, .38, 20), new T.MeshStandardMaterial({ color: 0x4fb6ff, transparent: true, opacity: .7, roughness: .1 }), { parent: L, pos: [x, 3.37, -1.2], cast: false });
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V3(x, 3.15, -1.2), V3(x + .05, 2.8, -1.1), V3(x, 2.3, -1.0), V3(x, 2.1, -1.0)]), 20, .025, 6), glass, { parent: L, cast: false });
    mesh(lathe([[0, 0], [.25, 0], [.27, .3], [.25, .3], [.23, .02], [0, .02]], 20), glass, { parent: L, pos: [x + .55, 1.06, -0.6], cast: false });
  }
  B.dripA = points(L, 50, .13, [[0, 'rgba(120,200,255,1)'], [1, 'rgba(90,170,255,0)']], { add: false });
  B.dripB = points(L, 80, .13, [[0, 'rgba(120,200,255,1)'], [1, 'rgba(90,170,255,0)']], { add: false });
  // calendar with 14 day pages, shelves, a screen with a falling curve
  B.cal = new T.Mesh(new T.PlaneGeometry(1.2, 1.4), new T.MeshStandardMaterial({ roughness: .8 })); B.cal.position.set(-0.2, 3.1, -3.45); L.add(B.cal);
  B.calT = []; for (let d = 1; d <= 15; d++) B.calT.push(ctex(256, 300, (x) => { x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 300); x.fillStyle = '#d6341f'; x.fillRect(0, 0, 256, 70); x.fillStyle = '#fff'; x.font = 'bold 40px Impact'; x.textAlign = 'center'; x.fillText('DAY', 128, 52); x.fillStyle = '#222'; x.font = '150px Impact'; x.fillText(String(d), 128, 245); x.strokeStyle = '#999'; x.lineWidth = 4; x.strokeRect(2, 2, 252, 296); }));
  B.cal.material.map = B.calT[0];
  B.page = new T.Mesh(new T.PlaneGeometry(1.2, 1.4), new T.MeshStandardMaterial({ roughness: .8 })); B.page.geometry.translate(0, -0.7, 0); B.page.position.set(-0.2, 3.8, -3.43); L.add(B.page);
  mesh(roundedBox(3.2, 0.08, 0.5, .02), std(0xc9d2da, .6), { parent: L, pos: [3.6, 2.4, -3.2] }); mesh(roundedBox(3.2, 0.08, 0.5, .02), std(0xc9d2da, .6), { parent: L, pos: [3.6, 3.3, -3.2] });
  for (let i = 0; i < 8; i++) { const col = [0x6fc0e8, 0xf2b632, 0x8ad07a, 0xe86a6a][i % 4]; mesh(lathe([[0, 0], [.12, 0], [.12, .22], [.05, .3], [.05, .38], [0, .38]], 14), new T.MeshPhysicalMaterial({ color: col, roughness: .1, transparent: true, opacity: .75 }), { parent: L, pos: [2.3 + (i % 4) * .8, 2.44 + Math.floor(i / 4) * .9, -3.15], cast: false }); }
  B.screen = new T.Mesh(new T.PlaneGeometry(1.4, .9), new T.MeshBasicMaterial({ color: 0xffffff })); B.screen.position.set(-3.0, 1.75, -1.5); B.screen.rotation.y = .35; L.add(B.screen);
  mesh(roundedBox(1.55, 1.02, .08, .03), std(0x2a2f36, .5), { parent: L, pos: [-3.02, 1.75, -1.56], rot: [0, .35, 0], ol: .012 }); mesh(new T.CylinderGeometry(.04, .04, .3, 8), std(0x2a2f36, .5), { parent: L, pos: [-3.0, 1.15, -1.55] });
  B.screenT = []; for (let k = 0; k <= 10; k++) B.screenT.push(ctex(280, 180, (x) => { x.fillStyle = '#0f2233'; x.fillRect(0, 0, 280, 180); x.strokeStyle = '#2d4f6b'; x.lineWidth = 1; for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(20, 20 + i * 22); x.lineTo(270, 20 + i * 22); x.stroke(); } x.strokeStyle = '#4fd0ff'; x.lineWidth = 5; x.beginPath(); for (let i = 0; i <= k * 2; i++) { const xx = 20 + i * 12.5, yy = 40 + (1 - Math.exp(-i / 6)) * 110; i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); x.fillStyle = '#9fe9ff'; x.font = 'bold 18px Arial'; x.fillText('FLOW', 22, 172); }));
  B.screen.material.map = B.screenT[0];
  L.add(OBJ.sci.root); OBJ.sci.root.position.set(-1.9, 0, 0.3);
  L.visible = false;
}
function labUpdate(t, o = {}) {
  const B = OBJ.lab;
  for (const [g, k] of [[B.cylA, 'A'], [B.cylB, 'B']]) { g.userData.crack.material.uniforms.reveal.value = o['crack' + k] ?? 0; g.userData.crack.visible = (o['crack' + k] ?? 0) > 0; g.userData.seam.material.uniforms.reveal.value = o['seam' + k] ?? 0; g.userData.seam.visible = (o['seam' + k] ?? 0) > 0; }
  const drip = (pts, x, rate, n) => { const p = pts.geometry.attributes.position; for (let i = 0; i < n; i++) { const per = .5 + hash(i) * .25, ph = ((t + hash(i + 4) * per) % per) / per, on = hash2(Math.floor((t + hash(i + 4) * per) / per), i) < rate;
      const y = ph < .5 ? lerp(2.08, 1.62, ph * 2) : lerp(1.05, 1.06, 0) + 0.02 - (ph - .5) * 2 * 0; p.setXYZ(i, on ? x + (hash(i + 1) - .5) * .04 + (ph < .5 ? 0 : .38 + (ph - .5) * .3) : 9999, on ? (ph < .5 ? y : lerp(1.5, 1.1, (ph - .5) * 2)) : 0, -1.0 + (ph < .5 ? 0 : .32)); } p.needsUpdate = true; };
  drip(B.dripA, 200 - 0.8, o.rateA ?? 0, 50); drip(B.dripB, 200 + 1.1, o.rateB ?? 0, 80);
  const day = clamp(Math.floor(o.day ?? 1), 1, 15); B.cal.material.map = B.calT[day - 1]; B.page.material.map = B.calT[Math.max(0, day - 2)]; const fl = o.flip ?? 0; B.page.visible = fl > 0 && fl < 1; B.page.rotation.x = -fl * Math.PI * .9;
  B.screen.material.map = B.screenT[clamp(Math.round((o.curve ?? 0) * 10), 0, 10)];
}

// =====================================================================================================
// RUINS: Roman harbour ruins in today's sea, a modern motorboat passing; a close-up slab of old stone with a white lump
// =====================================================================================================
function buildRuins() {
  const L = group(scene, [-200, 0, 0]); L.userData.name = 'ruins'; LOC.ruins = L; const R = {}; OBJ.ruins = R;
  R.sky = skyDome(L, 0x3f8fe0, 0xe2f2ff); for (const [x, y, z, s] of [[-50, 40, -150, 8], [60, 46, -120, 7], [20, 30, -200, 9]]) cloud(L, x, y, z, s);
  R.seaMat = waterMat(0x1f8db0, { amp: .25, chop: .8 }); waterPlane(L, 300, 300, R.seaMat, -0.4, .45);
  const ot = concreteTex({ seed: 41, old: true, lumps: true, n: 18, repeat: [2, 1] }); const om = std(0xffffff, .95, 0, { map: ot });
  // broken pier blocks and arches
  for (const [x, z, w, h, ry] of [[-6, -8, 4, 3.4, .1], [-1, -10, 3.2, 2.6, -.05], [4, -9, 4.5, 3.0, .08], [9.5, -11, 3, 2.2, .15], [-11, -12, 3.5, 2.0, -.1]]) {
    const g = group(L, [x, -1.0, z], [0, ry, 0]); const q = rng(Math.round(x * 13));
    mesh(roundedBox(w, h, 3, .25), om, { parent: g, pos: [0, h / 2, 0], ol: .03 }); for (let k = 0; k < 4; k++) mesh(blobGeo(k + x, .5 + q() * .5, .35, 1), om, { parent: g, pos: [(q() - .5) * w, h - .2 + q() * .3, (q() - .5) * 2], ol: .02 });
    mesh(new T.BoxGeometry(w + .05, .35, 3.05), std(0x3f6a4a, .9), { parent: g, pos: [0, 1.05, 0], cast: false }); }
  const ar = group(L, [2, -1, -16]); const sh = new T.Shape(); sh.moveTo(-4, 0); sh.lineTo(-4, 5); sh.lineTo(4, 5); sh.lineTo(4, 0); sh.lineTo(2.2, 0); sh.absarc(0, 0.6, 2.2, 0, Math.PI, false); sh.lineTo(-2.2, 0); sh.closePath();
  mesh(new T.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: true, bevelSize: .1, bevelThickness: .1, bevelSegments: 1 }), om, { parent: ar, pos: [0, 0, -1.5], ol: .03 }); mesh(blobGeo(9, 1.4, .4, 1), om, { parent: ar, pos: [3.2, 5.0, 0], ol: .02 });
  // distant modern shore
  mesh(new T.BoxGeometry(200, 3, 10), std(0xc9b48a, .95), { parent: L, pos: [0, -0.5, -70], cast: false });
  for (let i = 0; i < 26; i++) { const q = rng(i + 300); const h = 3 + q() * 9; mesh(roundedBox(4 + q() * 4, h, 4, .2), std([0xf4f4f0, 0xe8e2d8, 0xdfe6ec][i % 3], .9), { parent: L, pos: [-70 + i * 5.5, h / 2, -72 - q() * 6], ol: .05, cast: false }); }
  // motorboat with a wake
  R.boat = group(L); const hull = new T.Shape(); hull.moveTo(-2.4, .7); hull.lineTo(2.0, .7); hull.quadraticCurveTo(3.0, .5, 3.2, .9); hull.lineTo(2.6, -.3); hull.lineTo(-2.4, -.3); hull.closePath();
  mesh(new T.ExtrudeGeometry(hull, { depth: 1.6, bevelEnabled: true, bevelSize: .12, bevelThickness: .12, bevelSegments: 2 }), std(0xf7f7f4, .4), { parent: R.boat, pos: [0, 0, -.8], ol: .03 });
  mesh(roundedBox(1.6, .8, 1.3, .15), std(0x2d5f8f, .3, .2), { parent: R.boat, pos: [-.4, 1.2, 0], ol: .02 }); mesh(roundedBox(1.62, .25, 1.32, .08), std(0xd6341f, .5), { parent: R.boat, pos: [-.4, .7, 0] });
  R.wake = points(L, 160, .6, [[0, 'rgba(255,255,255,.9)'], [1, 'rgba(255,255,255,0)']], { add: false });
  // close-up slab: old stone face with one white lump (final shot)
  R.slab = group(L, [30, 0, 0]); const st = concreteTex({ seed: 44, old: true }); st.repeat.set(1, 1);
  mesh(roundedBox(3, 3, 1, .1), std(0xffffff, .95, 0, { map: st }), { parent: R.slab, pos: [0, 1.5, 0], ol: .02 });
  for (let i = 0; i < 40; i++) { const q = rng(i + 500); const x = -1.3 + q() * 2.6, y = .2 + q() * 2.6; if (Math.hypot(x, y - 1.5) < .45) continue; const rr = .04 + q() * .1; mesh(blobGeo(i, rr, .3, 1), [std(0x7d776c, .85, 0, { flat: true }), std(0x9a8a6e, .85, 0, { flat: true })][i % 2], { parent: R.slab, pos: [x, y, .5 + rr * .3], ol: .006 }); }
  R.lump = mesh(blobGeo(7.7, 0.13, .3, 3), std(0xf4f0e2, .8), { parent: R.slab, pos: [0, 1.5, .52], scl: [1, .85, .45], ol: .01 });
  L.visible = false;
}
function ruinsUpdate(t, o = {}) {
  const R = OBJ.ruins; const bx = lerp(-30, 26, clamp((t - (o.t0 ?? 0)) / 9)); R.boat.position.set(bx, -0.15 + nzf(t, 77, 1.2) * .06, -3.2); R.boat.rotation.set(nzf(t, 78, .9) * .04, 0, nzf(t, 79, 1.1) * .05);
  const wp = R.wake.geometry.attributes.position; for (let i = 0; i < 160; i++) { const ph = ((t * .8 + hash(i)) % 1); wp.setXYZ(i, bx - 2.4 - ph * 7, -0.3, -3.2 + (hash(i + 2) - .5) * (0.4 + ph * 3)); } wp.needsUpdate = true;
}

function buildAll() {
  ENV.day = makeEnv([.9, .95, 1.0], [.75, .78, .78], [.45, .42, .35], [{ p: [-9, 9, 12], s: [12, 8], c: [3, 2.9, 2.6] }, { p: [10, 4, -2], s: [8, 6], c: [1.2, 1.2, 1.2] }]);
  ENV.storm = makeEnv([.25, .3, .38], [.2, .24, .3], [.08, .09, .1], [{ p: [-9, 9, 12], s: [12, 8], c: [.8, .9, 1.1] }]);
  ENV.lab = makeEnv([1, 1, 1], [.85, .9, .95], [.5, .5, .55], [{ p: [0, 12, 4], s: [14, 10], c: [3, 3, 3] }, { p: [-10, 5, 2], s: [6, 6], c: [1.5, 1.6, 1.8] }]);
  makeCast(); buildSite(); buildXS(); buildLab(); buildRuins();
  const L = LOC.site; for (const c of [OBJ.yb, OBJ.master, ...OBJ.workers, OBJ.yb2]) { L.add(c.root); blob(c.root, 0, 0, 0, .7, .85); }
}
