// shots_a.js: build everything + the throne hall shots (1a 1b 2 3 6 8)
'use strict';
const OBJ = {};            // shared props
function holdAt(ch, wp) { ch.root.updateMatrixWorld(true); const v = ch.root.worldToLocal(wp.clone()); return [v.x, v.y, v.z]; }
function setWindow(k, glow = 1) {          // k: 0 sun in the window .. 1 total eclipse
  const W_ = LOC.win.userData; W_.sky.material.color.setRGB(lerp(1, .06, k), lerp(1, .09, k), lerp(1, .22, k));
  W_.sunDisc.material.color.setRGB(3 * (1 - k * .98) , 2.6 * (1 - k * .98), 1.2 * (1 - k * .98)); W_.moon.visible = k > 0.001; W_.moon.position.x = (1 - k) * 1.5; W_.moon.position.y = 0.7 + (1 - k) * 0.3;
  W_.sunHalo.material.opacity = lerp(1, .35, k) * glow; W_.sunHalo.scale.setScalar(lerp(1, 1.25, k));
}
const hallLight = (o = {}) => Object.assign({
  bg: [0.08, 0.06, 0.05], hemi: [0xfff1de, 0xc98f66, 1.0], sun: { col: 0xfff0d6, int: 3.0, pos: [-5, 9, 8], target: [0, 1, 0], ext: 12, far: 40 },
  rim: { col: 0xffd7a0, int: 1.5, pos: [0, 3, -9], target: [0, 1.5, 0] },
  pts: [{ p: [-3.6, 2.2, -7], col: 0xff9a40, int: 10, dist: 8 }, { p: [3.6, 2.2, -7], col: 0xff9a40, int: 10, dist: 8 }],
  fog: [0x2a1c18, 0.006], env: 'hall', envInt: 0.6, grade: { tint: [1.03, 1.0, 0.96], sat: 1.12, con: 1.05, vig: 0.3, bloom: 0.3 } }, o);

function buildAll() {
  ENV.hall = makeEnv([1.0, .92, .78], [.9, .66, .46], [.4, .25, .17], [{ p: [-9, 9, 12], s: [12, 8], c: [3, 2.8, 2.4] }, { p: [10, 4, -2], s: [8, 6], c: [1.4, 1.1, .9] }, { p: [0, 12, 0], s: [10, 10], c: [1.2, 1.1, 1.0] }]);
  ENV.cold = makeEnv([.25, .35, .6], [.2, .27, .45], [.08, .09, .15], [{ p: [-9, 9, 12], s: [12, 8], c: [.9, 1.1, 1.8] }]);
  ENV.sea = makeEnv([.6, .95, 1.0], [.25, .6, .65], [.12, .28, .28], [{ p: [0, 12, 2], s: [14, 10], c: [2.2, 3, 3] }]);
  buildHall();
  OBJ.crafter = makeChar({ body: 0xc8643c, hat: g => capHat(g, 0x7a4a2a), flags: 's', deco: c => {
    mesh(new T.CylinderGeometry(0.315, 0.315, 0.62, 28, 1, true, -0.95, 1.9), std(0xe9d3a6, .9, 0, { side: T.DoubleSide }), { parent: c.bg, pos: [0, 0.36, 0], ol: false });
    mesh(new T.TorusGeometry(0.31, 0.025, 8, 28), std(0x6a4524, .8), { parent: c.bg, pos: [0, 0.62, 0], rot: [Math.PI / 2, 0, 0] });
  } });
  LOC.hall.add(OBJ.crafter.root);
  blob(OBJ.crafter.root, 0, 0, 0, .65, .9);
  OBJ.box = makeBox(); OBJ.box.scale.setScalar(0.85); LOC.hall.add(OBJ.box);
  buildMore && buildMore();
}
var buildMore = null;
function resetVis() { LOC.court.forEach(q => q.root.visible = true); [LOC.exec, LOC.king, OBJ.crafter].forEach(c => c.root.visible = true); LOC.axe.visible = false; OBJ.box.visible = true; }

// king: seated; mode 'laugh' | 'calm' | 'point' | 'shock'
function kingPose(t, mode, ph = 0) {
  const base = { drop: 0, footL: [0.17, -0.1, 0.2], footR: [-0.17, -0.1, 0.2], handL: [0.52, 0.56, 0.2], handR: [-0.52, 0.56, 0.2] };
  if (mode === 'laugh') { const s = lsh(t, ph, 24), s2 = lsh(t, ph + 2, 15); return Object.assign(base, { face: 'laugh_' + (nzf(t, ph + 4, 4) > 0 ? 1 : 0), bob: Math.abs(s) * .05, lean: [-.15, s2 * .06, s * .05], head: [-.3 + s * .1, 0, s2 * .1], handL: [0.3, .52, .35] }); }
  if (mode === 'point') return Object.assign(base, { face: 'angry', lean: [.08, 0, 0], head: [.05, 0, 0], handR: [-0.2, 0.95, 0.78], point: 1, bob: nzs(t * 3) * .004 });
  if (mode === 'shock') return Object.assign(base, { face: 'shock', lean: [-.06, 0, 0], head: [-.05, 0, 0], handL: [0.5, 0.75, 0.25], handR: [-0.5, 0.75, 0.25] });
  return Object.assign(base, { face: 'smug' });
}
function showAll() { LOC.court.forEach(q => q.root.visible = true); LOC.exec.root.visible = true; }
const LFACE = ['laugh_1', 'laugh_0', 'grin', 'laugh_1', 'smug', 'laugh_0', 'smile', 'laugh_1'];
const SFACE = ['shock', 'awe', 'worry', 'shock', 'awe', 'worry', 'shock', 'awe'];
const STFACE = ['worry', 'calm', 'smug', 'angry', 'worry', 'calm', 'shock', 'smug'];
function courtPose(i, t, k = 1) { const p = POSE.laugh(t + i * .13, i * 1.7, k); const f = LFACE[i]; p.face = f.startsWith('laugh') ? 'laugh_' + (nzf(t, i * 3.1, 4) > 0 ? 1 : 0) : f; if (f === 'smug' || f === 'smile') p.head[2] += Math.sin(t * 9 + i) * .1; return p; }
function courtLaugh(t, k = 1) { LOC.court.forEach((c, i) => poseChar(c, courtPose(i, t, k))); }

// ----- shot 1a: ECU on the box, king's point of view -----
SHOTS.push({ id: '1a', t0: 0, locs: ['hall'], light: hallLight({ sun: { col: 0xfff0d6, int: 1.7, pos: [-2, 6, -3], target: [-0.3, 1.2, 2], ext: 6, far: 20 }, rim: { col: 0xffd7a0, int: 1.0, pos: [3, 3, 3], target: [-0.3, 1.2, 2] }, pts: [{ p: [0.4, 2.0, 0.6], col: 0xffc880, int: 1.5, dist: 6 }], hemi: [0xfff1de, 0xc98f66, 0.7], envInt: 0.35 }),
  cam: (u) => { const e = ein(u); return { p: lerp3([0.8, 2.15, 0.1], [0.1, 1.82, 1.0], e), l: lerp3([-0.3, 1.35, 1.95], [-0.3, 1.3, 1.95], u), fov: lerp(40, 34, u), ap: 4.0, focus: lerp(1.9, 0.95, e), shake: 0.005 }; },
  update: (u, t) => {
    const c = OBJ.crafter; c.root.position.set(-0.3, 0, 2.4); c.root.rotation.y = Math.PI;
    OBJ.box.position.set(-0.3, 1.3, 1.95); OBJ.box.rotation.set(-0.8, Math.PI, 0);
    updateBoxGears(OBJ.box, t * 7, 40 * sstep(0, 1.4, t));
    OBJ.box.updateMatrixWorld(true);
    c.root.updateMatrixWorld(true);
    poseChar(c, { face: 'smug', head: [0.06, 0, 0], handL: holdAt(c, V3(-0.3 + 0.4, 1.15, 1.9)), handR: holdAt(c, V3(-0.3 - 0.4, 1.15, 1.9)), bob: nzs(t * 2) * 0.01 });
    hallFlicker(t); setWindow(0); LOC.king.root.visible = true; poseChar(LOC.king, kingPose(t, 'laugh')); courtLaugh(t, 1);
    LOC.exec.root.position.set(2.4, 0.9, -10.4); LOC.exec.root.rotation.y = 0.2; poseChar(LOC.exec, POSE.stand(t)); LOC.axe.visible = false;
  } });

// ----- shot 1b: the whole court laughs -----
SHOTS.push({ id: '1b', t0: 2.3, locs: ['hall'], light: hallLight({ sun: { col: 0xfff0d6, int: 3.0, pos: [-6, 9, 5], target: [1, 1, 0], ext: 12, far: 40 } }),
  cam: (u) => ({ p: lerp3([-1.9, 1.5, 5.6], [-1.3, 1.6, 4.8], eio(u)), l: lerp3([1.4, 1.7, 0.0], [1.6, 1.8, -0.8], u), fov: 56, ap: 2.6, focus: lerp(8.5, 7.5, u) }),
  update: (u, t) => {
    const c = OBJ.crafter; c.root.position.set(0.1, 0, 1.2); c.root.rotation.y = 0.6;
    OBJ.box.position.set(0.1 + 0.31, 1.05, 1.2 + 0.46); OBJ.box.rotation.set(0, 0.6, 0); updateBoxGears(OBJ.box, t * 6, 20);
    c.root.updateMatrixWorld(true);
    poseChar(c, { face: 'smile', head: [-0.04, 0.0, 0], handL: holdAt(c, V3(0.41 + 0.35, 1.03, 1.66 - 0.23)), handR: holdAt(c, V3(0.41 - 0.35, 1.03, 1.66 + 0.23)), bob: 0 });
    courtLaugh(t, 1); LOC.court.forEach((q, i) => q.root.visible = i < 4); poseChar(LOC.king, kingPose(t, 'laugh', 1)); LOC.axe.visible = false; LOC.exec.root.visible = false;
    hallFlicker(t); setWindow(0);
  } });

// ----- shot 2: wide of the hall, camera drifts up to the gods and the window -----
SHOTS.push({ id: '2', t0: lineT('l02') - 0.09, locs: ['hall'], light: hallLight({ sun: { col: 0xfff0d6, int: 3.0, pos: [-5, 12, 8], target: [0, 3, -4], ext: 16, far: 50 } }),
  cam: (u) => { const e = eio(u); return { p: lerp3([0.0, 2.0, 7.5], [0.0, 8.4, 4.2], e), l: lerp3([0, 2.6, -10.5], [0, 8.4, -12], e), fov: lerp(46, 50, e), ap: 2.2, focus: lerp(17, 15, u) }; },
  update: (u, t) => {
    const c = OBJ.crafter; c.root.position.set(-0.3, 0, 2.4); c.root.rotation.y = Math.PI; OBJ.box.position.set(-0.3, 1.1, 1.95); OBJ.box.rotation.set(0, Math.PI, 0); updateBoxGears(OBJ.box, t * 2, 0);
    c.root.updateMatrixWorld(true); poseChar(c, { face: 'calm', handL: holdAt(c, V3(0.08, 1.05, 1.9)), handR: holdAt(c, V3(-0.68, 1.05, 1.9)) });
    LOC.court.forEach((q, i) => poseChar(q, courtPose(i, t * 0.6, .35))); poseChar(LOC.king, kingPose(t, 'smug')); LOC.exec.root.visible = false; hallFlicker(t); setWindow(0);
  } });

// ----- shot 3: low angle on the king, executioner behind, craftsman bowing small in front -----
SHOTS.push({ id: '3', t0: lineT('l03') - 0.1, locs: ['hall'], light: hallLight({ sun: { col: 0xfff0d6, int: 3.2, pos: [3, 7, 6], target: [0, 2, -9], ext: 9, far: 30 }, rim: { col: 0xffe0b0, int: 2.4, pos: [0, 4, -4], target: [0, 2, -9] },
    pts: [{ p: [0.5, 2.5, -7.8], col: 0xffb060, int: 9, dist: 9 }], hemi: [0xffe9d0, 0xb07a55, 0.9] }),
  cam: (u) => { const e = eio(u); return { p: lerp3([-0.7, 0.6, -2.6], [-0.4, 0.8, -3.4], e), l: lerp3([0.3, 1.9, -9.0], [0.3, 2.0, -9.0], e), fov: lerp(60, 56, e), ap: 1.6, focus: lerp(4.6, 4.2, u), roll: lerp(0.03, -0.02, u) }; },
  update: (u, t) => {
    const c = OBJ.crafter; c.root.position.set(0.7, 0, -6.6); c.root.rotation.y = -1.0; c.root.scale.setScalar(1);
    OBJ.box.visible = false;
    poseChar(c, { face: 'worry', lean: [0.35 + nzs(t * 1.5) * .05, 0, 0], head: [0.1, 0.15, 0.06], drop: 0.03, handL: [0.28, 0.5, 0.36], handR: [-0.28, 0.5, 0.36], bob: Math.sin(t * 9) * .006 });
    poseChar(LOC.king, kingPose(t, 'point'));
    const ex = LOC.exec; ex.root.position.set(-1.9, 0.0, -10.9); ex.root.rotation.y = 0.15; poseChar(ex, { face: 'calm', handR: [-0.46, 1.5, 0.12], handL: [0.4, .7, .1], head: [0, -0.1, 0], bob: nzs(t * 2) * .004 });
    LOC.axe.visible = true; LOC.axe.position.set(-0.46, 1.38, 0.12); LOC.axe.rotation.set(0, 0, -0.18);
    LOC.court.forEach((q, i) => { const p = POSE.stand(t, i, STFACE[i]); p.head = [nzs(t * 1.7 + i) * .06, nzs(t * .9 + i * 2) * .12, nzs(t * 1.3 + i) * .04]; poseChar(q, p); }); hallFlicker(t); setWindow(0);
  } });

// ----- shot 6: the court laughs harder, one points at the sky -----
SHOTS.push({ id: '6', t0: lineT('l06') - 0.05, locs: ['hall'], light: hallLight({ sun: { col: 0xfff0d6, int: 3.0, pos: [-5, 8, 6], target: [3.6, 1, 0], ext: 9, far: 30 } }),
  cam: (u) => { const e = eio(u); return { p: lerp3([-0.3, 1.4, 4.2], [0.4, 1.6, 3.4], e), l: lerp3([3.0, 1.9, 0.4], [3.0, 2.0, -0.6], e), fov: lerp(50, 46, e), ap: 2.8, focus: lerp(5.8, 4.8, u) }; },
  update: (u, t) => {
    LOC.court.forEach((q, i) => { poseChar(q, courtPose(i, t * 1.25 + i * .17, 1.5)); q.root.visible = i < 4; });
    const q = LOC.court[1]; const s = lsh(t, 2, 11); poseChar(q, { face: 'laugh_' + (nzf(t, 9, 4) > 0 ? 1 : 0), bob: Math.abs(s) * .04, lean: [-.2, 0, .1 * s], head: [-.55, .3, 0], handL: [0.42, 1.55, 0.35], handR: [-0.3, 0.55, 0.3], point: 0, poleArm: [[0.6, -0.2, -0.4], [-0.5, -0.8, -0.35]] });
    const c = OBJ.crafter; c.root.position.set(-0.6, 0, 2.4); c.root.rotation.y = -2.4; poseChar(c, { face: 'calm' }); OBJ.box.position.set(0, -10, 0);
    poseChar(LOC.king, kingPose(t, 'laugh', 2)); LOC.exec.root.visible = false; LOC.axe.visible = false; hallFlicker(t); setWindow(0);
  } });

// ----- shot 8: the court frozen in the dim, then the king -----
SHOTS.push({ id: '8', t0: lineT('l08') - 0.08, locs: ['hall'], light: (u, t) => hallLight({ bg: [0.03, 0.04, 0.08], hemi: [0x8fa6ff, 0x30304f, 0.55], sun: { col: 0xa9c0ff, int: 1.5, pos: [-5, 8, 6], target: [2, 1, -2], ext: 12, far: 40 }, rim: { col: 0x7aa0ff, int: 1.0, pos: [0, 3, -9], target: [0, 1.5, 0] },
    pts: [{ p: [-3.6, 2.2, -7], col: 0xff8a40, int: 5, dist: 8 }, { p: [3.6, 2.2, -7], col: 0xff8a40, int: 5, dist: 8 }], fog: [0x0b1020, 0.01], env: 'cold', envInt: 0.7, grade: { tint: [0.86, 0.96, 1.18], sat: 0.95, con: 1.08, vig: 0.42, bloom: 0.35 } }),
  cam: (u) => { const w = sstep(0.52, 0.78, u); const pa = lerp3([-2.2, 1.7, 2.4], [-1.9, 1.75, 1.2], u), pb = lerp3([0.0, 1.9, -5.4], [0.0, 2.0, -5.9], u); const lk = lerp3([3.8, 2.0, -1.0], [0.0, 2.55, -10.2], w);
    const P = lerp3(pa, pb, w); return { p: P, l: lk, fov: lerp(46, 34, w), ap: 2.6, focus: lerp(7, 5, w), shake: lerp(0.002, 0.006, w) }; },
  update: (u, t) => {
    LOC.court.forEach((q, i) => { const p = POSE.shock(t, i); p.face = SFACE[i]; p.head = [-.06 + nzs(t * 2.2 + i) * .02, nzs(t * 1.1 + i * 2) * .08, nzs(t * 1.9 + i) * .03]; if (SFACE[i] === 'worry') { p.handL = [0.3, 0.95, 0.3]; p.handR = [-0.3, 0.95, 0.3]; } p.bob = 0; poseChar(q, p); }); poseChar(LOC.king, kingPose(0, 'shock'));
    const c = OBJ.crafter; c.root.position.set(-0.6, 0, 2.4); c.root.rotation.y = -2.4; poseChar(c, { face: 'calm' }); OBJ.box.position.set(0, -10, 0); LOC.exec.root.visible = false; LOC.axe.visible = false;
    hallFlicker(t); setWindow(1);
  } });
