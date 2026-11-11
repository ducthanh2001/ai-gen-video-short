// shots_h.js (v2): new fast hook for line 1 (7 shots), shot 3 split into 3a/3b, merged 5a+5b and 11b+11c.
// Rule for the box prop: it is a closed case; it is always held at chest height in front of the body with the window toward the camera and the head ABOVE it.
'use strict';
for (const id of ['1a', '1b', '3', '5b', '11c']) { const i = SHOTS.findIndex(s => s.id === id); if (i >= 0) SHOTS.splice(i, 1); }
const sh = id => SHOTS.find(s => s.id === id);

// default court positions (restored every frame), and the lined-up layout used in the hook
const COURT_DEF = LOC.court ? null : null;
let _courtDef = null;
{ const prevBuild = buildMore; buildMore = () => { prevBuild && prevBuild(); _courtDef = LOC.court.map(c => ({ p: c.root.position.clone(), r: c.root.rotation.y })); }; }
{ const old = resetVis; resetVis = function () { old(); if (_courtDef) LOC.court.forEach((c, i) => { c.root.position.copy(_courtDef[i].p); c.root.rotation.y = _courtDef[i].r; }); OBJ.box.scale.setScalar(0.85); OBJ.box.userData.crank.visible = true; OBJ.box.visible = true; OBJ.crafter.root.position.set(80, 0, 80); OBJ.crafter.root.rotation.y = 0; }; }   // crafter parked far away unless a shot places him (keeps frames independent of render order)
const LINE_Z = [-0.5, -2.5, -4.5, -6.5];
function lineUp() {                      // courtiers lined up along both sides of the carpet, facing inward and a little to the camera
  LOC.court.forEach((c, i) => { const right = i < 4; c.root.position.set(right ? 2.3 : -2.3, 0, LINE_Z[i % 4]); c.root.rotation.y = right ? -(Math.PI / 2) + 0.4 : (Math.PI / 2) - 0.4; });
}
// hold the closed case at chest height in front of the body, window toward the camera, head above it. Returns nothing; poses the character.
function holdBox(c, box, bx, bz, yaw, o = {}) {
  const fwd = o.fwd ?? 0.56, oy = o.oy ?? 0.5, drop = o.drop ?? 0.08;
  c.root.position.set(bx, 0, bz); c.root.rotation.y = yaw; c.root.scale.setScalar(1);
  const f = V3(Math.sin(yaw), 0, Math.cos(yaw)), r = V3(Math.cos(yaw), 0, -Math.sin(yaw));
  box.scale.setScalar(0.8); box.position.set(bx, oy - drop, bz).addScaledVector(f, fwd); box.rotation.set(o.tilt ?? 0, yaw, 0); box.visible = true; box.userData.crank.visible = false;
  c.root.updateMatrixWorld(true); box.updateMatrixWorld(true);
  const side = 0.8 * 0.45 + 0.03, hy = oy - drop + 0.2;
  const hl = box.position.clone().addScaledVector(r, side).setY(hy), hr = box.position.clone().addScaledVector(r, -side).setY(hy);
  return Object.assign({ drop, handL: holdAt(c, hl), handR: holdAt(c, hr), bob: 0 }, o.pose || {});
}
const hookLight = (o = {}) => hallLight(Object.assign({ sun: { col: 0xfff0d6, int: 2.4, pos: [-3, 7, 4], target: [0, 1.2, -4], ext: 9, far: 30 }, hemi: [0xfff1de, 0xc98f66, 0.85], envInt: 0.5 }, o));
function hookCommon(t) { hallFlicker(t); setWindow(0); }
function courtMood(t, faces) { LOC.court.forEach((q, i) => { const p = POSE.stand(t, i, faces[i % faces.length]); p.head = [nzf(t, i + 1, 1.1) * .08, nzf(t, i + 9, .8) * .18, nzf(t, i + 5, 1) * .07]; poseChar(q, p); }); }
function kingSmug(t) { const p = kingPose(t, 'smug'); p.head = [nzf(t, 31, .9) * .06, nzf(t, 32, .7) * .1, .06 + nzf(t, 33, .8) * .06]; p.lean = [.04 + nzf(t, 34, .6) * .03, 0, 0]; return p; }

// ---------- 1A: the glowing box, gears and the sun/moon indicator in motion, fast push then a whip toward the king ----------
SHOTS.push({ id: 'h1', t0: 0, locs: ['hall'], light: hookLight({ sun: { col: 0xfff0d6, int: 1.6, pos: [2, 6, -1], target: [0, 1.0, -4], ext: 6, far: 20 }, pts: [{ p: [0.5, 0.75, -4.9], col: 0xffc070, int: 2.2, dist: 4 }], hemi: [0xfff1de, 0xc98f66, 0.7], envInt: 0.4, grade: { tint: [1.05, 1.0, .94], sat: 1.15, vig: .38, bloom: .5 } }),
  cam: (u, t) => { const e = ein(clamp(u / 0.9)), p0 = [0.45, 1.12, -6.0], p1 = [0.12, 1.02, -5.0]; const w = sstep(0.74, 0.98, u);
    const l = lerp3([0, 1.28, -3.8], [-4.5, 1.5, -4.8], w); return { p: lerp3(p0, p1, e), l, fov: lerp(54, 46, e), roll: lerp(0.07, -0.02, e) + w * .08, ap: 3.0, focus: lerp(2.2, 1.35, e), shk: 0.05 }; },
  post: (u, t) => { const w = sstep(0.74, 0.98, u); U.whip.value.set(w * w * 0.05, 0); },
  update: (u, t) => {
    const c = OBJ.crafter; const pose = holdBox(c, OBJ.box, 0, -3.4, Math.PI);
    poseChar(c, Object.assign(pose, { face: 'smug', head: [0.05 + nzf(t, 3, 1) * .06, nzf(t, 4, 1) * .15, nzf(t, 5, 1) * .1], lean: [0.05, 0, 0] }));
    updateBoxGears(OBJ.box, t * 4.5, 40 * sstep(0, 0.7, t));
    kingBase(t); courtMood(t, ['smile', 'smug', 'grin', 'smile']); lineUp(); hookCommon(t);
  } });
function kingBase(t) { poseChar(LOC.king, kingSmug(t)); LOC.exec.root.visible = false; LOC.axe.visible = false; }

// ---------- 1B: the king on his throne, smug smirk ----------
SHOTS.push({ id: 'h2', t0: TL.cuts.h2, locs: ['hall'], light: hookLight({ sun: { col: 0xfff0d6, int: 3.0, pos: [3, 7, 6], target: [0, 2, -9], ext: 9, far: 30 }, rim: { col: 0xffe0b0, int: 2.0, pos: [0, 4, -4], target: [0, 2, -9] }, pts: [{ p: [0.5, 2.5, -7.8], col: 0xffb060, int: 7, dist: 9 }] }),
  cam: (u, t) => { const e = eout(clamp(u)); const k = clamp((t - TL.cuts.h2) / 0.2); return { p: lerp3([0.3, 1.5, -6.0], [0.1, 1.9, -7.5], e), l: lerp3([-2.6, 2.4, -10.2], [0.0, 2.65, -10.2], eout(k)), fov: lerp(40, 30, e), ap: 2.2, focus: lerp(4.3, 3.0, e), shk: 0.05, roll: lerp(-0.04, 0.02, e) }; },
  post: (u, t) => { const k = 1 - clamp((t - TL.cuts.h2) / 0.2); U.whip.value.set(k * k * 0.04, 0); },
  update: (u, t) => { kingBase(t); const c = OBJ.crafter; c.root.position.set(0, 0, -3.4); OBJ.box.visible = false; courtMood(t, ['smile', 'smug', 'grin']); lineUp(); hookCommon(t); } });

// ---------- 1C: wide of the hall: craftsman small in the centre holding the case, king behind, courtiers lined up ----------
SHOTS.push({ id: 'h3', t0: TL.cuts.h3, locs: ['hall'], light: hookLight({ sun: { col: 0xfff0d6, int: 3.0, pos: [-3, 10, 6], target: [0, 1, -4], ext: 12, far: 40 } }),
  cam: (u, t) => { const e = eio(u); return { p: lerp3([0.0, 2.8, 3.8], [0.1, 2.45, 2.0], e), l: lerp3([0, 0.85, -6], [0, 1.1, -7.5], e), fov: lerp(60, 54, e), ap: 1.6, focus: lerp(6.2, 4.5, e), shk: 0.02, roll: lerp(-0.03, 0.02, e) }; },
  update: (u, t) => {
    const c = OBJ.crafter; const pose = holdBox(c, OBJ.box, 0, -2.5, 0, { oy: 0.55 });
    poseChar(c, Object.assign(pose, { face: 'smug', head: [0.0 + nzf(t, 6, 1) * .05, nzf(t, 7, 1) * .12, 0] })); updateBoxGears(OBJ.box, t * 4.5, 40);
    kingBase(t); courtMood(t, ['smile', 'smug', 'grin', 'worry', 'smile', 'smug']); LOC.court.forEach((q, i) => { if (i % 3 === 0 && u > .45 + i * .02) poseChar(q, courtPose(i, t, .5)); }); lineUp(); hookCommon(t);
  } });

// ---------- 1D: reaction cuts: courtier laughing with tears and pointing, another slapping his knee, the king slapping the throne arm ----------
SHOTS.push({ id: 'h4', t0: TL.cuts.h4, locs: ['hall'], light: hookLight({ sun: { col: 0xfff0d6, int: 3.0, pos: [-1, 8, 6], target: [2.3, 1.5, -1], ext: 7, far: 25 } }),
  cam: (u, t) => { const e = eio(u); return { p: lerp3([-0.4, 1.7, 0.7], [0.1, 1.85, 0.2], e), l: lerp3([2.2, 1.1, -0.6], [2.3, 1.15, -0.5], e), fov: lerp(50, 44, e), ap: 2.2, focus: lerp(2.9, 2.5, e), shk: 0.06, roll: lerp(0.05, -0.04, e) }; },
  update: (u, t) => {
    lineUp(); courtMood(t, ['laugh_1']); const q = LOC.court[0]; const p = courtPose(0, t * 1.1 + 3, 1.3); p.face = 'laugh_1'; p.handR = [-0.85, 0.95, 0.26]; p.point = 1; p.head = [-.25 + p.head[0] * .5, .25, p.head[2]]; poseChar(q, p);
    poseChar(LOC.court[1], courtPose(1, t + 1, 1.0)); kingBase(t); OBJ.box.visible = false; hookCommon(t);
  } });
SHOTS.push({ id: 'h5', t0: TL.cuts.h5, locs: ['hall'], light: hookLight({ sun: { col: 0xfff0d6, int: 3.0, pos: [3, 8, 6], target: [-2.3, 1.5, -2.5], ext: 7, far: 25 } }),
  cam: (u, t) => { const e = eio(u); return { p: lerp3([-0.2, 1.55, -1.0], [-0.5, 1.75, -1.6], e), l: lerp3([-2.4, 1.4, -2.3], [-2.3, 1.45, -2.6], e), fov: lerp(46, 40, e), ap: 2.2, focus: lerp(2.6, 2.2, e), shk: 0.07, roll: lerp(-0.05, 0.05, e) }; },
  update: (u, t) => {
    lineUp(); courtMood(t, ['laugh_0']); const q = LOC.court[5]; const p = courtPose(5, t * 1.2 + 8, 1.5); p.face = 'laugh_0'; p.head = [-.4, -.2, p.head[2]]; poseChar(q, p);
    poseChar(LOC.court[4], courtPose(4, t + 2, 1.2)); poseChar(LOC.court[6], courtPose(6, t + 3, 1.2)); kingBase(t); OBJ.box.visible = false; hookCommon(t);
  } });
SHOTS.push({ id: 'h6', t0: TL.cuts.h6, locs: ['hall'], light: hookLight({ sun: { col: 0xfff0d6, int: 3.2, pos: [3, 7, 6], target: [0, 2, -9], ext: 9, far: 30 }, rim: { col: 0xffe0b0, int: 2.2, pos: [0, 4, -4], target: [0, 2, -9] }, pts: [{ p: [0.5, 2.5, -7.8], col: 0xffb060, int: 8, dist: 9 }] }),
  cam: (u, t) => { const e = eout(u), sk = Math.exp(-Math.max(0, t - TL.cuts.slap) * 4); return { p: lerp3([0.35, 1.7, -6.8], [0.05, 1.95, -7.5], e), l: [0, 2.55, -10.2], fov: lerp(34, 29, e), ap: 2.0, focus: lerp(3.8, 3.0, e), shk: 0.03 + 0.12 * sk, roll: lerp(0.04, -0.02, e) }; },
  update: (u, t) => {
    const slap = Math.max(0, Math.sin((t - TL.cuts.slap) * 15)) * (t < TL.cuts.slap + 0.6 && t >= TL.cuts.slap ? 1 : 0), p = kingPose(t, 'laugh', 2); p.face = 'laugh_1'; p.handR = [-0.84, 0.62 + slap * 0.32, 0.12]; p.bob += slap * .03; p.head[0] -= .1; poseChar(LOC.king, p);
    LOC.exec.root.visible = false; LOC.axe.visible = false; OBJ.box.visible = false; courtMood(t, ['laugh_1']); lineUp(); hookCommon(t);
  } });

// ---------- 1E: the craftsman's calm face, one beat before "You see" ----------
SHOTS.push({ id: 'h7', t0: TL.cuts.h7, locs: ['hall'], light: hookLight({ sun: { col: 0xfff0d6, int: 2.6, pos: [-2, 6, 4], target: [0, 1.6, -2.5], ext: 6, far: 20 }, rim: { col: 0xffd7a0, int: 1.8, pos: [2, 3, -6], target: [0, 1.6, -2.5] } }),
  cam: (u, t) => { const e = eio(u); return { p: lerp3([0.25, 1.75, -0.2], [0.08, 1.72, -0.8], e), l: [0, 1.3, -2.5], fov: lerp(40, 32, e), ap: 2.4, focus: lerp(2.35, 1.8, e), shk: 0.012, roll: lerp(0.03, -0.01, e) }; },
  update: (u, t) => {
    const c = OBJ.crafter; const pose = holdBox(c, OBJ.box, 0, -2.5, 0, { oy: 0.55 }); updateBoxGears(OBJ.box, t * 4.5, 40);
    const h7 = TL.cuts.h7, nod = Math.sin(clamp((t - h7 - 0.23) / 0.45) * Math.PI) * 0.12;                      // one single slow nod
    poseChar(c, Object.assign(pose, { face: 'calm', gaze: t < h7 + 0.17 ? -1 : (t < h7 + 0.29 ? 0 : 1), head: [nod + nzf(t, 8, 1) * .02, lerp(-.15, 0, sstep(h7 + .05, h7 + .45, t)), nzf(t, 9, 1) * .03] }));
    kingBase(t); courtMood(t, ['laugh_1', 'smile']); LOC.court.forEach((q, i) => poseChar(q, courtPose(i, t, 1.0))); lineUp(); hookCommon(t);
  } });

// ---------- 3a: low angle, the king looming and pointing, the craftsman small at the bottom, the axe behind ----------
SHOTS.push({ id: 'h8', t0: lineT('l03') - 0.1, locs: ['hall'], light: hallLight({ sun: { col: 0xfff0d6, int: 3.2, pos: [3, 7, 6], target: [0, 2, -9], ext: 9, far: 30 }, rim: { col: 0xffe0b0, int: 2.4, pos: [0, 4, -4], target: [0, 2, -9] },
    pts: [{ p: [0.5, 2.5, -7.8], col: 0xffb060, int: 9, dist: 9 }], hemi: [0xffe9d0, 0xb07a55, 0.9] }),
  cam: (u) => { const e = eio(u); return { p: lerp3([0.2, 0.5, -2.8], [-0.1, 0.62, -3.5], e), l: lerp3([-0.2, 1.6, -8.6], [-0.4, 2.0, -9.3], e), fov: lerp(60, 52, e), ap: 1.8, focus: lerp(7.5, 6.3, u), roll: lerp(0.04, -0.02, u), shk: 0.012 }; },
  update: (u, t) => {
    const c = OBJ.crafter; c.root.position.set(-0.7, 0, -7.4); c.root.rotation.y = -1.0; c.root.scale.setScalar(1); OBJ.box.visible = false;
    poseChar(c, { face: 'worry', lean: [0.3, 0, 0], head: [0.12 + nzf(t, 12, .5) * .04, 0.1, 0.06], drop: 0.03, handL: [0.28, 0.5, 0.36], handR: [-0.28, 0.5, 0.36], bob: 0 });
    const p = kingPose(t, 'point'); p.handR = [-0.3, 1.0, 0.72]; p.head = [.05 + nzf(t, 13, .7) * .03, nzf(t, 14, .6) * .05, 0]; poseChar(LOC.king, p);
    const ex = LOC.exec; ex.root.position.set(2.0, 0.0, -10.9); ex.root.rotation.y = -0.15; poseChar(ex, { face: 'calm', handR: [-0.46, 1.5, 0.12], handL: [0.4, .7, .1], head: [0, -0.1, 0], bob: nzf(t, 15, .8) * .006 });
    LOC.axe.visible = true; LOC.axe.position.set(-0.46, 1.38, 0.12); LOC.axe.rotation.set(0, 0, -0.18 + nzf(t, 16, .5) * .03);
    courtMood(t, ['worry', 'calm', 'smug', 'angry']); hallFlicker(t); setWindow(0);
  } });

// ---------- 3b: close on the craftsman, a single non-repeating reaction timed to the words ----------
const gulpT = TL.cuts.be, flinchT = TL.cuts.lose;
SHOTS.push({ id: 'h9', t0: TL.cuts.h9, locs: ['hall'], light: hallLight({ sun: { col: 0xfff0d6, int: 1.3, pos: [-3, 4, -2], target: [0.3, 1.6, -6.2], ext: 6, far: 20 }, rim: { col: 0xffd7a0, int: 1.0, pos: [2, 3, 2], target: [0.3, 1.6, -6.2] }, hemi: [0xffe9d0, 0xb07a55, 0.6], envInt: 0.3 }),
  cam: (u, t) => { const e = eio(u), j = Math.exp(-Math.max(0, t - (flinchT + 0.02)) * 7) * (t > flinchT ? 1 : 0); return { p: lerp3([0.0, 1.5, -9.4], [0.15, 1.6, -8.7], e), l: lerp3([0.3, 1.28, -6.2], [0.3, 1.3, -6.2], e), fov: lerp(36, 31, e), ap: 2.4, focus: lerp(3.2, 2.5, e), shk: 0.006 + 0.07 * j }; },
  update: (u, t) => {
    const c = OBJ.crafter; c.root.position.set(0.3, 0, -6.2); c.root.rotation.y = Math.PI; c.root.scale.setScalar(1); OBJ.box.visible = false;
    const gu = clamp((t - gulpT) / 0.4), gulp = Math.sin(gu * Math.PI), fl = clamp((t - flinchT) / 0.28), flinch = eout(fl) * (1 - sstep(flinchT + 0.9, flinchT + 1.5, t));
    const face = t < gulpT - 0.05 ? 'focus' : (t < flinchT ? 'worry' : (t < flinchT + 1.1 ? 'shock' : 'worry'));
    poseChar(c, { face, lean: [-0.28 * flinch + gulp * .08, 0, 0], head: [-0.32 * flinch + gulp * .16 + nzf(t, 21, 2) * .01 * (t > flinchT + 1.2 ? 3 : 1), flinch * .12, nzf(t, 22, 1) * .03], handL: [0.3, 0.6 + flinch * .3, 0.3], handR: [-0.3, 0.6 + flinch * .3, 0.3], bob: -gulp * .02, gaze: 0 });
    poseChar(LOC.king, kingPose(t, 'point')); LOC.exec.root.visible = false; LOC.axe.visible = false; courtMood(t, ['worry', 'calm', 'smug', 'angry']); hallFlicker(t); setWindow(0);
  },
  over: (ctx, u, t) => {      // the axe's shadow sweeps across his face on "lose your head"
    const k = (t - (flinchT + 0.05)) / 0.5; if (k <= 0 || k >= 1) return; const x = lerp(-0.5 * W, 1.5 * W, eio(k)); ctx.save(); ctx.translate(x, H * 0.45); ctx.rotate(-0.5);
    const g = ctx.createLinearGradient(-W * 0.22, 0, W * 0.22, 0); g.addColorStop(0, 'rgba(10,6,20,0)'); g.addColorStop(0.18, 'rgba(10,6,20,.62)'); g.addColorStop(0.82, 'rgba(10,6,20,.62)'); g.addColorStop(1, 'rgba(10,6,20,0)'); ctx.fillStyle = g; ctx.fillRect(-W * 0.22, -H, W * 0.44, H * 2); ctx.restore();
  } });

// ---------- 5 (merged 5a + 5b): the crank, then a push onto the dial ----------
{ const s5 = sh('5a'); const L5 = lineT('l05'); const t0 = L5 - 0.1;
  s5.cam = (u, t) => { const eA = eio(clamp((t - t0) / 1.7)), eB = eio(clamp((t - (L5 + 1.5)) / 2.6)), w = eio(clamp((t - (L5 + 1.15)) / 0.7));
    const A = { p: lerp3([60.3, 2.0, 1.9], [60.35, 1.8, 1.4], eA), l: lerp3([60.35, 1.25, -0.7], [60.35, 1.2, -0.7], eA), fov: 38, focus: lerp(2.7, 2.2, eA) };
    const B = { p: lerp3([60.5, 1.4, 1.0], [60.33, 1.36, 0.3], eB), l: [60.32, 1.2, -0.4], fov: lerp(34, 28, eB), focus: lerp(1.55, 0.9, eB) };
    return { p: lerp3(A.p, B.p, w), l: lerp3(A.l, B.l, w), fov: lerp(A.fov, B.fov, w), ap: 3.0, focus: lerp(A.focus, B.focus, w), shake: lerp(0.01, 0.003, w) }; }; }

// ---------- 11 (merged 11b + 11c): dial A "19 YEARS", then a move over to dial B "223 MONTHS" ----------
{ const s11 = sh('11b'); const l0 = lineT('l11'); const t0 = TL.cuts.x_one - 0.06; s11.t0 = t0; const tsw = l0 + X223 - 1.0;
  s11.cam = (u, t) => { const eA = eio(clamp((t - t0) / (tsw - t0 + .5))), eB = eio(clamp((t - (tsw + .6)) / 3.0)), w = eio(clamp((t - tsw) / 0.8));
    const A = { p: lerp3([0.5, 1.2, 4.0], [0.9, 0.75, 2.35], eA), l: lerp3([0.1, -0.3, 0], [0.5, 0.0, 0.4], eA), focus: lerp(4.2, 2.4, eA) };
    const B = { p: lerp3([-0.2, 0.2, 3.9], [-0.75, -0.05, 2.2], eB), l: lerp3([0.0, -0.3, 0], [-0.5, -0.3, 0.4], eB), focus: lerp(4.0, 2.3, eB) };
    return { p: lerp3(A.p, B.p, w), l: lerp3(A.l, B.l, w), fov: 36, ap: 1.0, focus: lerp(A.focus, B.focus, w) }; };
  const oldOver = s11.over; s11.over = (ctx, u, t) => { counterOver(ctx, 30, false); if (!NOLABEL && t > l0 + X19 - .18 && t < l0 + X223 - .9) { const [x, y] = projAnchor(XR.dA.d, [0, 0, 0]); const px = clamp(x, W * .3, W * .7), py = Math.max(H * 0.2, y - H * 0.2); ctx.strokeStyle = '#ff9f1c'; ctx.lineWidth = 4 * S; ctx.beginPath(); ctx.moveTo(px, py + H * .03); ctx.lineTo(x, y - H * .06); ctx.stroke(); pill(ctx, px, py, '19 YEARS'); }
    if (!NOLABEL && t > l0 + X223 - .14) { const [x, y] = projAnchor(XR.dB.d, [0, 0, 0]); const px = clamp(x, W * .3, W * .7), py = Math.max(H * 0.2, y - H * 0.22); ctx.strokeStyle = '#ff9f1c'; ctx.lineWidth = 4 * S; ctx.beginPath(); ctx.moveTo(px, py + H * .03); ctx.lineTo(x, y - H * .06); ctx.stroke(); pill(ctx, px, py, '223 MONTHS'); } }; }

// ---------- shot 2 (the wide of the hall): the craftsman now holds the closed case properly ----------
{ const s2 = sh('2'); s2.update = (u, t) => {
    const c = OBJ.crafter; const pose = holdBox(c, OBJ.box, -0.3, 2.4, Math.PI); poseChar(c, Object.assign(pose, { face: 'calm' })); updateBoxGears(OBJ.box, t * 2, 0);
    LOC.court.forEach((q, i) => poseChar(q, courtPose(i, t * 0.6, .35))); poseChar(LOC.king, kingPose(t, 'smug')); LOC.exec.root.visible = false; hallFlicker(t); setWindow(0); }; }

// the hall had no wall behind the camera side (z+): add one so shots toward the entrance are not an empty void
{ const prevBuild = buildMore; buildMore = () => { prevBuild && prevBuild(); const L = LOC.hall; const wm = std(0xf0d3a8, 0.9);
    mesh(new T.PlaneGeometry(18, 13), wm, { parent: L, pos: [0, 6.5, 13.8], rot: [0, Math.PI, 0], cast: false });
    for (const sx of [-1, 1]) { mesh(new T.CylinderGeometry(0.55, 0.62, 9.6, 24), std(0xe58a4a, 0.55), { parent: L, pos: [sx * 3.4, 4.8, 13.4] }); }
    mesh(new T.PlaneGeometry(5.0, 6.2), std(0x6a3a1c, 0.8), { parent: L, pos: [0, 3.1, 13.75], rot: [0, Math.PI, 0], cast: false });
    mesh(new T.PlaneGeometry(18, 0.9), std(0xb3532f, 0.8), { parent: L, pos: [0, 1.1, 13.78], rot: [0, Math.PI, 0], cast: false }); }; }
