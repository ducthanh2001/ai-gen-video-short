// chars.js: toy characters (round white head with a drawn meme face, capsule body, stick limbs, outlines), poses and props
'use strict';
const INK = '#16101e', INKH = 0x16101e;
const FACE_RES = W > 700 ? 2048 : 1024;
const faceCache = {};

// ---------- face painter (equirect on the head sphere; front of the face is at x = 25% of the width) ----------
function faceTex(expr, gaze = 0, base = '#fff8ee', fl = '') {
  const key = [expr, gaze, base, fl].join('|'); if (faceCache[key]) return faceCache[key];
  const t = ctex(FACE_RES, FACE_RES / 2, (x, w, h) => {
    const k = w / 2048;
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    x.save(); x.scale(k, k);
    const cx = 512, cy = 540;
    x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = INK; x.fillStyle = INK;
    const ex = 104, ey = cy - 36;
    const hood = fl.includes('h');
    if (hood) {                                           // executioner hood: two slits
      for (const s of [-1, 1]) { x.fillStyle = '#e8e0d0'; x.beginPath(); x.ellipse(cx + s * 100, ey, 46, 20, s * -.15, 0, 7); x.fill(); x.fillStyle = '#c0392b'; x.beginPath(); x.arc(cx + s * 100 + gaze * 8, ey, 10, 0, 7); x.fill(); }
      x.restore(); return;
    }
    // cheeks
    x.fillStyle = 'rgba(255,120,120,0.35)'; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(cx + s * 180, cy + 52, 42, 26, 0, 0, 7); x.fill(); }
    x.fillStyle = INK;
    const E = (s, o = {}) => {                           // one eye
      const px = cx + s * ex, rx = o.rx ?? 60, ry = o.ry ?? 70;
      x.fillStyle = '#fff'; x.strokeStyle = INK; x.lineWidth = 16;
      x.save(); if (o.clip) { x.beginPath(); o.clip(px, ey, s); x.clip(); }
      x.beginPath(); x.ellipse(px, ey, rx, ry, 0, 0, 7); x.fill();
      x.fillStyle = INK; const pr = o.pr ?? 25; const gx = px + (gaze * 0.5 * (rx - pr)) + (o.gx ?? 0) * s, gy = ey + (o.gy ?? 6);
      x.beginPath(); x.arc(gx, gy, pr, 0, 7); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(gx - pr * .32, gy - pr * .34, pr * .3, 0, 7); x.fill();
      x.restore();
      x.beginPath(); x.ellipse(px, ey, rx, ry, 0, 0, 7); x.strokeStyle = INK; x.lineWidth = 16; x.stroke();
    };
    const browA = (s, dy, tiltDeg, len = 74, wd = 20) => { // tilt > 0: inner end lower (angry); < 0: inner end higher (worried)
      const px = cx + s * ex, py = ey + dy, a = tiltDeg * Math.PI / 180;
      const ox = px + s * len, oy = py - Math.sin(a) * len * 0.5 * 0 - Math.sin(a) * len;            // outer end goes up when angry
      const ix = px - s * len, iy = py + Math.sin(a) * len;
      x.strokeStyle = INK; x.lineWidth = wd; x.beginPath(); x.moveTo(ix, iy); x.lineTo(ox, oy); x.stroke();
    };
    const arcEye = (s, up = true, wd = 22) => { x.strokeStyle = INK; x.lineWidth = wd; x.beginPath(); x.arc(cx + s * ex, ey + (up ? 28 : -10), 48, up ? Math.PI * 1.08 : Math.PI * .08, up ? Math.PI * 1.92 : Math.PI * .92); x.stroke(); };
    const my = cy + 112;
    const mouthOpen = (wd, ht, tongue = true) => {
      x.fillStyle = '#4a0f22'; x.strokeStyle = INK; x.lineWidth = 16;
      x.beginPath(); x.moveTo(cx - wd, my - ht * .35); x.quadraticCurveTo(cx, my - ht * .1, cx + wd, my - ht * .35); x.bezierCurveTo(cx + wd * .9, my + ht, cx - wd * .9, my + ht, cx - wd, my - ht * .35); x.closePath(); x.fill();
      x.save(); x.clip();
      if (tongue) { x.fillStyle = '#ff7b8e'; x.beginPath(); x.ellipse(cx, my + ht * .85, wd * .6, ht * .55, 0, 0, 7); x.fill(); }
      x.fillStyle = '#fff'; x.fillRect(cx - wd, my - ht * .45, wd * 2, ht * .28);
      x.restore(); x.stroke();
    };
    const tears = () => { x.fillStyle = '#7fd4ff'; x.strokeStyle = '#2b7fb8'; x.lineWidth = 6; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const px = cx + s * (ex + 60 + i * 34), py = ey + 40 + i * 30 + (gaze ? 8 : 0); x.beginPath(); x.ellipse(px, py, 15, 22, s * (.5 + i * .15), 0, 7); x.fill(); x.stroke(); } };
    const kind = expr.split('_')[0], v = +(expr.split('_')[1] || 0);
    if (kind === 'calm') { E(-1); E(1); browA(-1, -104, -4); browA(1, -104, -4); x.strokeStyle = INK; x.lineWidth = 18; x.beginPath(); x.moveTo(cx - 40, my); x.quadraticCurveTo(cx, my + 14, cx + 40, my); x.stroke(); }
    else if (kind === 'smile') { E(-1); E(1); browA(-1, -106, -8); browA(1, -106, -8); x.strokeStyle = INK; x.lineWidth = 18; x.beginPath(); x.arc(cx, my - 30, 62, .2 * Math.PI, .8 * Math.PI); x.stroke(); }
    else if (kind === 'smug') {
      const lid = (px, py, s) => { x.rect(px - 90, py - 5, 180, 120); };
      E(-1, { clip: (px, py, s) => x.rect(px - 90, py - 6, 180, 120), ry: 70 }); E(1, { clip: (px, py, s) => x.rect(px - 90, py - 6, 180, 120), ry: 70 });
      for (const s of [-1, 1]) { x.strokeStyle = INK; x.lineWidth = 20; x.beginPath(); x.moveTo(cx + s * ex - 66, ey - 6); x.lineTo(cx + s * ex + 66, ey - 6); x.stroke(); }
      browA(-1, -92, -6); browA(1, -128, 14);
      x.strokeStyle = INK; x.lineWidth = 18; x.beginPath(); x.moveTo(cx - 46, my + 8); x.quadraticCurveTo(cx + 10, my + 18, cx + 62, my - 24); x.stroke();
    }
    else if (kind === 'angry') {
      E(-1, { ry: 56, pr: 20, clip: (px, py, s) => { x.moveTo(px - 90, py - 90 - s * 0); x.lineTo(px + 90, py - 90); x.lineTo(px + 90, py + 90); x.lineTo(px - 90, py + 90); } });
      E(1, { ry: 56, pr: 20 });
      browA(-1, -78, 26, 78, 24); browA(1, -78, 26, 78, 24);
      x.fillStyle = '#fff'; x.strokeStyle = INK; x.lineWidth = 16; x.beginPath(); x.rect(cx - 70, my - 22, 140, 52); x.fill(); x.stroke();
      x.lineWidth = 8; for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(cx + i * 28, my - 22); x.lineTo(cx + i * 28, my + 30); x.stroke(); }
      x.beginPath(); x.moveTo(cx - 70, my + 4); x.lineTo(cx + 70, my + 4); x.stroke();
    }
    else if (kind === 'laugh') {
      arcEye(-1); arcEye(1); browA(-1, -92, -16); browA(1, -92, -16); tears();
      const o = v ? 1 : 0.62; mouthOpen(96, 150 * o + 20, true);
    }
    else if (kind === 'shock') {
      E(-1, { rx: 76, ry: 90, pr: 11, gy: 0 }); E(1, { rx: 76, ry: 90, pr: 11, gy: 0 }); browA(-1, -150, -12, 70); browA(1, -150, -12, 70);
      x.fillStyle = '#4a0f22'; x.strokeStyle = INK; x.lineWidth = 16; x.beginPath(); x.ellipse(cx, my + 14, 50, 70, 0, 0, 7); x.fill(); x.stroke();
      x.fillStyle = '#ff7b8e'; x.beginPath(); x.ellipse(cx, my + 50, 30, 20, 0, 0, 7); x.fill();
    }
    else if (kind === 'worry') {
      E(-1, { pr: 22 }); E(1, { pr: 22 }); browA(-1, -112, -26); browA(1, -112, -26);
      x.strokeStyle = INK; x.lineWidth = 18; x.beginPath(); x.moveTo(cx - 54, my + 10); for (let i = 1; i <= 6; i++) x.lineTo(cx - 54 + i * 18, my + 10 + (i % 2 ? -12 : 6)); x.stroke();
      x.fillStyle = '#7fd4ff'; x.strokeStyle = '#2b7fb8'; x.lineWidth = 6; x.beginPath(); x.moveTo(cx + 250, ey - 120); x.quadraticCurveTo(cx + 290, ey - 50, cx + 250, ey - 30); x.quadraticCurveTo(cx + 210, ey - 50, cx + 250, ey - 120); x.fill(); x.stroke();
    }
    else if (kind === 'focus') {
      E(-1, { ry: 50, pr: 22, gy: 14, clip: (px, py, s) => x.rect(px - 90, py - 36, 180, 120) }); E(1, { ry: 50, pr: 22, gy: 14, clip: (px, py, s) => x.rect(px - 90, py - 36, 180, 120) });
      for (const s of [-1, 1]) { x.strokeStyle = INK; x.lineWidth = 18; x.beginPath(); x.moveTo(cx + s * ex - 62, ey - 34); x.lineTo(cx + s * ex + 62, ey - 34); x.stroke(); }
      browA(-1, -92, 6); browA(1, -92, 6);
      x.strokeStyle = INK; x.lineWidth = 18; x.beginPath(); x.moveTo(cx - 34, my + 4); x.lineTo(cx + 34, my + 4); x.stroke();
    }
    else if (kind === 'awe') {
      E(-1, { rx: 70, ry: 82, pr: 38, gy: -2 }); E(1, { rx: 70, ry: 82, pr: 38, gy: -2 }); browA(-1, -140, -12); browA(1, -140, -12);
      x.fillStyle = '#4a0f22'; x.strokeStyle = INK; x.lineWidth = 16; x.beginPath(); x.ellipse(cx, my + 10, 36, 44, 0, 0, 7); x.fill(); x.stroke();
    }
    else if (kind === 'grin') {
      E(-1, { pr: 24 }); E(1, { pr: 24 }); browA(-1, -112, 8); browA(1, -112, 8); mouthOpen(70, 70, false);
    }
    if (fl.includes('s')) { x.fillStyle = '#4a3a2a'; x.strokeStyle = INK; x.lineWidth = 8; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(cx, my - 52); x.bezierCurveTo(cx + s * 40, my - 70, cx + s * 110, my - 56, cx + s * 130, my - 6); x.bezierCurveTo(cx + s * 90, my - 34, cx + s * 40, my - 30, cx, my - 36); x.fill(); x.stroke(); } }
    if (fl.includes('g')) { x.strokeStyle = INK; x.lineWidth = 14; for (const s of [-1, 1]) { x.beginPath(); x.arc(cx + s * ex, ey, 88, 0, 7); x.stroke(); } x.lineWidth = 12; x.beginPath(); x.moveTo(cx - 18, ey - 6); x.lineTo(cx + 18, ey - 6); x.stroke();
      x.fillStyle = 'rgba(190,230,255,0.28)'; for (const s of [-1, 1]) { x.beginPath(); x.arc(cx + s * ex, ey, 86, 0, 7); x.fill(); } }
    x.restore();
  });
  t.wrapS = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
  return faceCache[key] = t;
}

// ---------- 2-bone IK ----------
const _d = new T.Vector3(), _p = new T.Vector3();
function ik(S, Tg, a, b, pole, out) {
  _d.copy(Tg).sub(S); let L = _d.length(); const mx = a + b - 1e-3; if (L > mx) { _d.multiplyScalar(mx / L); L = mx; }
  if (L < 1e-3) { _d.set(0, -1e-3, 0); L = 1e-3; }
  const dir = _d.clone().multiplyScalar(1 / L); const x = (L * L + a * a - b * b) / (2 * L), h = Math.sqrt(Math.max(a * a - x * x, 0));
  _p.copy(pole).addScaledVector(dir, -pole.dot(dir)).normalize();
  out.elbow = S.clone().addScaledVector(dir, x).addScaledVector(_p, h); out.hand = S.clone().add(_d); return out;
}
const Y_UP = V3(0, 1, 0);
function place(m, A, B) { const d = B.clone().sub(A), l = d.length(); m.position.copy(A).addScaledVector(d, .5); m.scale.set(1, Math.max(l, 1e-3), 1); m.quaternion.setFromUnitVectors(Y_UP, d.normalize()); }

// ---------- accessories ----------
function crown(parent) {
  const gold = std(0xf2b632, 0.3, 0.8), g = group(parent, [0, 0.43, 0]);
  mesh(lathe([[0.30, 0], [0.34, 0.02], [0.35, 0.16], [0.31, 0.18]], 32), gold, { parent: g, ol: 0.018 });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mesh(new T.ConeGeometry(0.06, 0.2, 8), gold, { parent: g, pos: [Math.sin(a) * 0.31, 0.26, Math.cos(a) * 0.31], ol: 0.014 });
    mesh(new T.SphereGeometry(0.035, 10, 8), std(i % 2 ? 0xe03a4a : 0x3ac3e0, 0.2, 0.1), { parent: g, pos: [Math.sin(a) * 0.31, 0.38, Math.cos(a) * 0.31] }); }
  mesh(new T.SphereGeometry(0.04, 10, 8), std(0xe03a4a, 0.2, 0.1), { parent: g, pos: [0, 0.09, 0.355] });
  return g;
}
function capHat(parent, col = 0x8a5a36) {
  const g = group(parent, [0, 0.40, 0.02]); const m = std(col, 0.8);
  mesh(new T.SphereGeometry(0.38, 28, 14, 0, 6.2832, 0, 1.15), m, { parent: g, scl: [1, .62, 1], ol: 0.02 });
  mesh(new T.CylinderGeometry(0.40, 0.40, 0.045, 28), m, { parent: g, pos: [0, 0.01, 0.05], ol: 0.014 });
  return g;
}
function turban(parent, col = 0xe9e2d0) {
  const g = group(parent, [0, 0.38, 0]); const m = std(col, 0.8);
  mesh(new T.SphereGeometry(0.40, 28, 18, 0, 6.2832, 0, 1.3), m, { parent: g, scl: [1, .8, 1.02], ol: 0.02 });
  mesh(new T.TorusGeometry(0.4, 0.09, 12, 32), m, { parent: g, pos: [0, -0.02, 0], rot: [Math.PI / 2 - 0.12, 0, 0], ol: 0.016 });
  mesh(new T.SphereGeometry(0.05, 10, 8), std(0xd9a21b, 0.3, 0.8), { parent: g, pos: [0, 0.0, 0.43] });
  return g;
}
function laurel(parent, col = 0x4f9a4a) {
  const g = group(parent, [0, 0.33, 0]); const m = std(col, 0.7);
  mesh(new T.TorusGeometry(0.43, 0.035, 8, 40), m, { parent: g, rot: [Math.PI / 2 - 0.1, 0, 0] });
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.2832; mesh(new T.SphereGeometry(0.06, 8, 6), m, { parent: g, pos: [Math.sin(a) * 0.43, -0.04 * Math.cos(a), Math.cos(a) * 0.43], scl: [1, .5, 1.5], rot: [0, a, 0] }); }
  return g;
}
function pointHat(parent, col = 0x7a3fb0) {
  const g = group(parent, [0, 0.40, 0]); const m = std(col, 0.7);
  mesh(new T.ConeGeometry(0.34, 0.62, 24), m, { parent: g, pos: [0, 0.26, 0], rot: [-.08, 0, 0], ol: 0.02 });
  mesh(new T.TorusGeometry(0.34, 0.04, 8, 28), std(0xf2b632, .4, .6), { parent: g, rot: [Math.PI / 2, 0, 0], pos: [0, -0.02, 0] });
  return g;
}
function beard(parent, col = 0xf1efe8, big = 1) {
  const g = group(parent, [0, -0.52, 0.22]); const m = std(col, 0.9);
  mesh(new T.SphereGeometry(0.26, 24, 16), m, { parent: g, scl: [0.95 * big, 1.45 * big, .42], pos: [0, -0.1 * big, 0.0], ol: 0.016 });
  return g;
}
function helmet(parent) {
  const g = group(parent, [0, 0, 0]);
  const brass = std(0xc98f2e, 0.32, 0.85), glass = new T.MeshPhysicalMaterial({ color: 0xcfeeff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.2, depthWrite: false, envMapIntensity: 1.6, clearcoat: 1 });
  mesh(new T.SphereGeometry(0.72, 32, 24), glass, { parent: g, cast: false, recv: false });
  mesh(new T.TorusGeometry(0.6, 0.06, 12, 40), brass, { parent: g, pos: [0, -0.34, 0], rot: [Math.PI / 2, 0, 0], ol: 0.02 });
  mesh(new T.CylinderGeometry(0.55, 0.66, 0.2, 32, 1, true), brass, { parent: g, pos: [0, -0.42, 0], ol: 0.015 });
  mesh(new T.TorusGeometry(0.5, 0.045, 10, 36, Math.PI * 1.1), brass, { parent: g, pos: [0, 0.0, 0.12], rot: [0, 0, 0.0], cast: false });
  mesh(new T.CylinderGeometry(0.06, 0.06, 0.1, 12), brass, { parent: g, pos: [0, 0.72, 0] });
  mesh(new T.SphereGeometry(0.1, 12, 8), brass, { parent: g, pos: [0, 0.78, 0] });
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; mesh(new T.SphereGeometry(0.03, 8, 6), brass, { parent: g, pos: [Math.sin(a) * 0.605, -0.34, Math.cos(a) * 0.605], cast: false }); }
  return g;
}
// ---------- the character ----------
// o: {body: hex, size, hat: fn(headGroup), beard, base (head colour), flags ('s' moustache, 'g' glasses, 'h' hood), deco: 'apron'|'king'|'coat'|'robe'|..., legCol}
function makeChar(o = {}) {
  const root = new T.Group(); const sz = o.size ?? 1; root.scale.setScalar(sz);
  const stick = std(0x241d2e, 0.6);
  const skin = std(0xfff4e4, 0.5);
  const bodyMat = std(o.body ?? 0xd9674a, 0.7);
  const bg = new T.Group(); root.add(bg);            // body group (pivot at the hip)
  const body = mesh(new T.CapsuleGeometry(0.3, 0.42, 8, 24), bodyMat, { parent: bg, pos: [0, 0.40, 0], ol: 0.03 });
  const headMat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0, map: faceTex('calm', 0, o.base ?? '#fff8ee', o.flags ?? '') });
  if (o.hood) headMat.roughness = .8;
  const hg = group(bg, [0, 1.23, 0]);
  const head = mesh(new T.SphereGeometry(0.5, 56, 40), headMat, { parent: hg, ol: 0.032, olc: INKH }); head.rotation.y = 0;
  // texture maps u=0.25 to +z when the sphere is rotated by -90deg about y (three: x = -cos(phi) sin(theta), z = sin(phi) sin(theta))
  const c = { root, bg, hg, head, headMat, size: sz, o, flags: o.flags ?? '', base: o.base ?? '#fff8ee' };
  const hand = () => mesh(new T.SphereGeometry(0.085, 16, 12), skin, { ol: 0.02 });
  const limb = () => mesh(new T.CylinderGeometry(0.042, 0.042, 1, 8), stick, { cast: true });
  const joint = () => mesh(new T.SphereGeometry(0.05, 10, 8), stick);
  c.arm = [0, 1].map(() => { const a = { u: limb(), l: limb(), j: joint(), e: joint(), h: hand(), fin: mesh(new T.CapsuleGeometry(0.03, 0.13, 4, 8), skin, { ol: 0.012 }) }; a.fin.visible = false; root.add(a.u, a.l, a.j, a.e, a.h, a.fin); return a; });
  c.leg = [0, 1].map(() => { const a = { u: limb(), l: limb(), j: joint(), e: joint(), f: mesh(new T.SphereGeometry(0.13, 14, 10), std(o.shoe ?? 0x3a2a24, 0.6), { scl: [1, .6, 1.5], ol: 0.02 }) }; root.add(a.u, a.l, a.j, a.e, a.f); return a; });
  for (const l of c.leg) { l.u.scale.x = l.u.scale.z = 1.15; }
  if (o.hat) c.hat = o.hat(hg);
  if (o.beard) c.beard = beard(hg, o.beard, o.beardBig ?? 1);
  if (o.helmet) c.helmet = helmet(hg);
  if (o.deco) o.deco(c);
  // head UV fix: rotate so the face sits at +z
  head.rotation.y = -Math.PI / 2 * 0;      // set below after checking: see FACE_YAW
  head.rotation.y = FACE_YAW;
  return c;
}
const FACE_YAW = 0;   // adjusted by the test render if the face is not on +z

const DEF = { L: [0.40, 0.70, 0.04], R: [-0.40, 0.70, 0.04], FL: [0.14, 0, 0.02], FR: [-0.14, 0, 0.02] };
const _S = new T.Vector3(), _T = new T.Vector3(), _o = {}, _pole = new T.Vector3(), _q = new T.Quaternion(), _e = new T.Euler();
// pose: {face, gaze, drop, lean[x,y,z], head:[nod,yaw,tilt], handL:[x,y,z], handR, footL, footR, kneeL?, bob}
// +x is the character's LEFT side (as seen when it faces the camera it is on the camera's right)
function poseChar(c, p) {
  const drop = p.drop ?? 0, bob = p.bob ?? 0;
  const piv = V3(0, 0.45 - drop + bob, 0);
  _e.set(p.lean?.[0] ?? 0, p.lean?.[1] ?? 0, p.lean?.[2] ?? 0, 'YXZ'); _q.setFromEuler(_e);
  c.bg.position.copy(piv); c.bg.quaternion.copy(_q);
  const hh = p.head ?? [0, 0, 0]; c.hg.rotation.set(hh[0], hh[1], hh[2], 'YXZ');
  const fx = p.face ?? 'calm';
  c.headMat.map = faceTex(fx, p.gaze ?? 0, c.base, c.flags);
  // arms
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1, a = c.arm[i];
    _S.set(s * 0.31, 0.72, 0).applyQuaternion(_q).add(piv);
    const tgt = (i === 0 ? p.handL : p.handR) ?? (i === 0 ? DEF.L : DEF.R);
    _T.set(tgt[0], tgt[1] + bob * 0.5, tgt[2]);
    _pole.set(s * 0.5, -0.8, -0.35); if (p.poleArm) _pole.set(...(i === 0 ? p.poleArm[0] : p.poleArm[1]));
    ik(_S, _T, 0.34, 0.34, _pole, _o);
    place(a.u, _S, _o.elbow); place(a.l, _o.elbow, _o.hand); a.j.position.copy(_S); a.e.position.copy(_o.elbow); a.h.position.copy(_o.hand);
    a.fin.visible = p.point === i;
    if (a.fin.visible) { const dd = _o.hand.clone().sub(_o.elbow).normalize(); a.fin.position.copy(_o.hand).addScaledVector(dd, 0.13); a.fin.quaternion.setFromUnitVectors(Y_UP, dd); }
  }
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1, a = c.leg[i];
    _S.set(s * 0.14, 0.42 - drop + bob, 0);
    const tgt = (i === 0 ? p.footL : p.footR) ?? (i === 0 ? DEF.FL : DEF.FR);
    _T.set(tgt[0], tgt[1] + 0.08, tgt[2]);
    ik(_S, _T, 0.27, 0.27, V3(0, 0.1, 1), _o);
    place(a.u, _S, _o.elbow); place(a.l, _o.elbow, _o.hand); a.j.position.copy(_S); a.e.position.copy(_o.elbow);
    a.f.position.set(tgt[0], tgt[1] + 0.06, tgt[2] + 0.06); a.f.rotation.set(tgt[3] ?? 0, 0, 0);
  }
}

// ---------- poses (functions of time) ----------
const POSE = {
  stand(t, ph = 0, face = 'calm') { return { face, bob: nzs(t * 2.2 + ph) * 0.008, head: [0, nzs(t * .8 + ph) * .05, 0], handL: [0.40 + nzs(t * 1.3 + ph) * .01, 0.68, 0.04], handR: [-0.40, 0.68, 0.04] }; },
  laugh(t, ph = 0, k = 1) {   // belly laugh: shaking body, head thrown back, one hand on the belly, one slapping the knee
    const s = lsh(t, ph, 25), s2 = lsh(t, ph * 2 + 3, 17);
    return { face: 'laugh_' + (nzf(t, ph * 3, 4) > 0 ? 1 : 0), bob: Math.abs(s) * 0.06 * k, lean: [-.16 - .1 * Math.abs(s2) * k, s2 * .08 * k, s * .06 * k], head: [-.28 + s * .12 * k, 0, s2 * .12 * k],
      handL: [0.30, 0.56 + s * .05 * k, 0.32], handR: [-0.56, 0.5 + Math.abs(s2) * .22 * k, 0.1], footL: [0.17, Math.max(0, s) * .04, 0.02] }; },
  shock(t, ph = 0) { return { face: 'shock', bob: Math.sin(t * 30 + ph) * .004, lean: [-.1, 0, 0], head: [-.06, 0, 0], handL: [0.44, 0.9, 0.2], handR: [-0.44, 0.9, 0.2] }; },
};
// shadow blob under things that stand on the floor (cheap contact shadow)
let BLOB_TEX = null;
function blobTex() { return BLOB_TEX || (BLOB_TEX = ctex(128, 128, (x, w, h) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.6, 'rgba(0,0,0,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); })); }
function blob(parent, x, y, z, r, a = 1) { const m = new T.Mesh(new T.PlaneGeometry(r * 2, r * 2), new T.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: a, fog: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.01, z); m.renderOrder = 1; parent.add(m); return m; }
