// shots.js (B02): 20 shots keyed to TL.cuts. Adjacent shots never share the same move or size.
'use strict';
const C_ = TL.cuts;
const SITE_O = [0, 0, 0], XS_O = [0, 0, -300], LAB_O = [200, 0, 0], RU_O = [-200, 0, 0];
const add3 = (o, p) => [o[0] + p[0], o[1] + p[1], o[2] + p[2]];
const bump = (t, t0, dur) => Math.sin(clamp((t - t0) / dur) * Math.PI);           // one single rise and fall
function resetVis() {
  for (const c of [OBJ.yb, OBJ.master, ...OBJ.workers, OBJ.yb2]) { c.root.visible = true; c.root.position.set(500, 0, 500); c.root.rotation.set(0, 0, 0); }
  setOpacity(OBJ.yb2, 1); OBJ.site.sack.position.set(500, 0, 500); OBJ.site.bucket.position.set(500, 0, 500); OBJ.site.powder.visible = false; OBJ.site.pour.visible = false;
}
const dayLight = (tg, o = {}) => Object.assign({ bg: [0.75, 0.86, 0.95], hemi: [0xffffff, 0xb59a74, 0.95], sun: { col: 0xfff2dc, int: 3.0, pos: [-8, 14, 10], target: tg, ext: 9, far: 50 }, rim: { col: 0xffe2b8, int: 1.3, pos: [6, 5, -8], target: tg },
  fog: [0xcfe6f5, 0.006], env: 'day', envInt: 0.55, grade: { tint: [1.03, 1.0, 0.96], sat: 1.12, vig: 0.3, bloom: 0.25 } }, o);
const stormLight = (tg, o = {}) => Object.assign({ bg: [0.2, 0.24, 0.3], hemi: [0x9fb0cc, 0x2a2e36, 0.6], sun: { col: 0xc8d6f0, int: 1.6, pos: [-6, 10, 12], target: tg, ext: 12, far: 50 }, rim: { col: 0x9fc0ff, int: 1.2, pos: [4, 6, -8], target: tg },
  fog: [0x4b5868, 0.018], env: 'storm', envInt: 0.6, grade: { tint: [0.88, 0.96, 1.12], sat: 0.95, con: 1.08, vig: 0.45, bloom: 0.3 } }, o);
const xsLight = (o = {}) => Object.assign({ bg: [0.04, 0.06, 0.09], hemi: [0x9fb8d8, 0x202428, 0.65], sun: { col: 0xfff0e0, int: 2.8, pos: [4, 7, 10], target: add3(XS_O, [0, 0, 1]), ext: 7, far: 30 }, rim: { col: 0x8fc8ff, int: 1.8, pos: [-6, 4, -2], target: add3(XS_O, [0, 0, 1]) },
  pts: [{ p: add3(XS_O, [0, 1, 4]), col: 0xbfe6ff, int: 4, dist: 9 }], env: 'day', envInt: 0.3, grade: { tint: [0.97, 1.0, 1.04], sat: 1.1, vig: 0.42, bloom: 0.4 } }, o);
const labLight = (o = {}) => Object.assign({ bg: [0.9, 0.93, 0.95], hemi: [0xffffff, 0xc0c8d0, 1.0], sun: { col: 0xffffff, int: 2.2, pos: [3, 8, 6], target: add3(LAB_O, [0, 1, -1]), ext: 6, far: 25 }, rim: { col: 0xd8ecff, int: 1.0, pos: [-4, 4, -4], target: add3(LAB_O, [0, 1, -1]) },
  env: 'lab', envInt: 0.7, grade: { tint: [0.98, 1.0, 1.03], sat: 1.08, vig: 0.28, bloom: 0.22 } }, o);
const ruinsLight = (tg) => dayLight(tg, { bg: [0.7, 0.85, 0.97], fog: [0xd2e8f7, 0.004], grade: { tint: [1.0, 1.0, 1.0], sat: 1.15, vig: 0.28, bloom: 0.25 } });

// ---------- poses ----------
function holdSack(c, sackPos, sackRot, face, extra = {}) {
  const S = OBJ.site; S.sack.position.set(...sackPos); S.sack.rotation.set(...sackRot); S.sack.updateMatrixWorld(true); c.root.updateMatrixWorld(true);
  const l = new T.Vector3(0.3, 0.05, 0).applyMatrix4(S.sack.matrixWorld), r = new T.Vector3(-0.3, 0.05, 0).applyMatrix4(S.sack.matrixWorld);
  poseChar(c, Object.assign({ face, handL: holdAt(c, l), handR: holdAt(c, r), lean: [0.12, 0, 0] }, extra));
}
function powderStream(t, from, to, n = 120, spread = .12, k = 1) {
  const P = OBJ.site.powder; P.visible = k > 0.01; const p = P.geometry.attributes.position;
  for (let i = 0; i < n; i++) { const ph = ((t * (1.6 + hash(i) * .8) + hash(i + 2)) % 1); const x = lerp(from[0], to[0], ph) + (hash(i + 3) - .5) * spread * (0.3 + ph), y = lerp(from[1], to[1], ph * ph * .6 + ph * .4), z = lerp(from[2], to[2], ph) + (hash(i + 5) - .5) * spread * (0.3 + ph); p.setXYZ(i, x, y, z); }
  p.needsUpdate = true; P.material.opacity = k;
}
const sh = (o) => SHOTS.push(o);
const YB = [9.0, 0, 3.05];

// 1a: the young builder tips the sack into the already bubbling mix (push in)
sh({ id: 's1a', t0: C_.s1a, locs: ['site'], light: dayLight([9, 0.8, 2]),
  cam: (u) => { const e = eout(u); return { p: lerp3([7.7, 2.15, -1.4], [8.15, 2.0, -0.7], e), l: lerp3([9.1, 1.05, 2.1], [9.1, 1.05, 2.1], e), fov: lerp(48, 42, e), ap: 1.6, focus: 3.4, shk: 0.02 }; },
  update: (u, t) => { const c = OBJ.yb; c.root.position.set(...YB); c.root.rotation.y = Math.PI;
    const tip = lerp(-0.6, -1.5, eio(clamp(t / 1.0))); holdSack(c, [9.0, 1.12 + nzf(t, 1, 2) * .02, 2.05], [tip, 0, nzf(t, 2, 2) * .08], 'grin', { head: [-0.05, nzf(t, 3, .8) * .1, 0] });
    powderStream(t, [9.0, 0.98, 1.82], [9.05, 0.56, 1.55], 120, .14, 1); siteUpdate(t, { mix: lerp(.65, .9, u), steam: .35, patch: lerp(.25, .6, u) });
    workersBack(t); } });
// 1b: overhead on the mix, bubbles boiling up (overhead rotate)
sh({ id: 's1b', t0: C_.s1b, locs: ['site'], light: dayLight([9, 0.6, 1.5]),
  cam: (u) => { const a = lerp(-0.55, 0.3, u); return { p: [9 + Math.sin(a) * 1.5, 1.75 - u * .15, 1.4 - Math.cos(a) * 1.5], l: [9.05, 0.6, 1.5], fov: 40, ap: 2.0, focus: 1.9, shk: 0.01, roll: lerp(.05, -.05, u) }; },
  update: (u, t) => { const c = OBJ.yb; c.root.position.set(...YB); c.root.rotation.y = Math.PI; holdSack(c, [9.0, 1.12, 2.05], [-1.5, 0, nzf(t, 2, 2) * .1], 'grin');
    powderStream(t, [9.0, 0.98, 1.82], [9.05, 0.56, 1.55], 120, .16, lerp(1, .3, u)); siteUpdate(t, { mix: lerp(.9, 1, u), steam: lerp(.25, .4, u), steamSize: 0.5, patch: lerp(.6, 1, u) }); } });
// 1c: "boil": a steam burst at the camera (fast pull back)
sh({ id: 's1c', t0: C_.s1c, locs: ['site'], light: dayLight([9, 0.6, 1.5], { grade: { tint: [1.03, 1.0, 0.96], sat: 1.05, vig: 0.3, bloom: 0.6 } }),
  cam: (u) => { const e = eout(u); return { p: lerp3([9.25, 1.0, -0.1], [9.45, 1.4, -1.6], e), l: [9.0, 1.15, 2.4], fov: lerp(40, 52, e), ap: 2.0, focus: 1.6, shk: 0.07 * (1 - u) + 0.02 }; },
  post: (u) => { U.flash.value = bump(u, 0.05, 0.5) * 0.35; U.flashCol.value.set(1, 1, 1); },
  update: (u, t) => { const c = OBJ.yb; c.root.position.set(...YB); c.root.rotation.y = Math.PI; holdSack(c, [9.0, 1.05, 2.35], [-0.4, 0, 0], 'shock', { lean: [-0.25, 0, 0], head: [-0.25, 0, 0] });
    siteUpdate(t, { mix: 1, steam: .7, patch: 1, burst: eout(u) * .8 }); } });
function workersBack(t) { const W = OBJ.workers; W[0].root.position.set(12.6, 0, -2.4); W[0].root.rotation.y = -0.5; poseChar(W[0], POSE.stand(t, 1, 'calm')); W[2].root.position.set(14.8, 0, 3.0); W[2].root.rotation.y = 0.4; poseChar(W[2], POSE.stand(t, 2, 'focus')); }
// 2: the master screams, arm thrown out; workers duck from the steam (low angle, tilt up)
sh({ id: 's2', t0: C_.s2, locs: ['site'], light: dayLight([11.6, 1.5, -0.2], { sun: { col: 0xfff2dc, int: 3.0, pos: [-4, 10, 10], target: [11.6, 1.5, -0.2], ext: 7, far: 40 } }),
  cam: (u) => { const e = eio(u); return { p: lerp3([10.0, 0.75, 2.0], [10.25, 0.9, 1.55], e), l: lerp3([11.5, 1.6, -0.1], [11.55, 2.05, -0.15], e), fov: lerp(44, 40, e), ap: 2.0, focus: 2.6, shk: 0.015 + 0.04 * Math.exp(-u * 4) }; },
  update: (u, t) => { const m = OBJ.master; m.root.position.set(11.6, 0, -0.2); m.root.rotation.y = -0.68; const s = lsh(t, 3, 14) * .5;
    poseChar(m, { face: 'shout', lean: [0.18 + s * .03, 0, s * .03], head: [0.05 + s * .05, 0, s * .04], handR: [-0.62, 1.12, 0.62], point: 1, handL: [0.48, 0.55 + s * .03, 0.25], bob: 0 });
    const W = OBJ.workers; W[1].root.position.set(12.9, 0, -2.0); W[1].root.rotation.y = -0.4; W[3].root.position.set(10.3, 0, -2.6); W[3].root.rotation.y = 0.3;
    for (const [w, ph] of [[W[1], 1], [W[3], 2]]) { const d = eout(clamp(u * 3)); poseChar(w, { face: 'shock', drop: 0.28 * d, lean: [0.45 * d, 0, 0], head: [0.3 * d, nzf(t, ph, 1) * .2, 0], handL: [0.25, 1.35 - .25 * d, 0.2], handR: [-0.25, 1.35 - .25 * d, 0.2] }); }
    const c = OBJ.yb; c.root.position.set(...YB); c.root.rotation.y = Math.PI; poseChar(c, POSE.stand(t, 4, 'shock'));
    siteUpdate(t, { mix: 1, steam: .9, patch: 1, burst: .4 }); } });
// 3: wide: the half-built sea wall, waves slam its base, harbour and town behind (crane up)
sh({ id: 's3', t0: C_.s3, locs: ['site'], light: dayLight([-4, 1, -2], { sun: { col: 0xfff2dc, int: 3.0, pos: [-10, 16, 14], target: [-4, 1, -2], ext: 20, far: 70 } }),
  cam: (u) => { const e = eio(u); return { p: lerp3([-2.5, 1.6, 17.5], [-5.5, 6.2, 15.5], e), l: lerp3([-3.5, 1.8, -3], [-4.5, 1.0, -8], e), fov: lerp(50, 54, e), ap: 0.6, focus: 20 }; },
  update: (u, t) => { for (const [i, x, y, z, ry] of [[0, -4.4, 1.15, 2.25, 0.3], [1, -1.4, 1.15, 2.2, -0.4], [2, 8.5, 0, 2.0, -1.0], [4, -2.9, 2.0, 3.0, 0.1], [3, 6.2, 0, -2.4, 1.2]]) { const w = OBJ.workers[i]; w.root.position.set(x, y, z); w.root.rotation.y = ry; const p = POSE.stand(t, i, 'calm'); if (i < 2) { p.lean = [0.5, 0, 0]; p.handL = [0.25, 0.35, 0.55]; p.handR = [-0.25, 0.4, 0.55]; } poseChar(w, p); }
    const c = OBJ.yb; c.root.position.set(...YB); c.root.rotation.y = Math.PI; poseChar(c, POSE.stand(t, 4, 'calm')); const m = OBJ.master; m.root.position.set(11.6, 0, -0.2); m.root.rotation.y = -0.68; poseChar(m, POSE.stand(t, 5, 'angry'));
    siteUpdate(t, { mix: 1, steam: .6, patch: 1, seaK: 1.9, sprayK: 2.0, spraySize: 2.4 }); } });
// 4a: the others soak their lime first: calm troughs, water poured from a bucket (lateral truck)
sh({ id: 's4a', t0: C_.s4a, locs: ['site'], light: dayLight([15.5, 0.8, 3]),
  cam: (u) => { const e = eio(u); return { p: lerp3([13.5, 1.5, 1.2], [15.4, 1.55, 1.1], e), l: lerp3([14.4, 1.05, 4.3], [15.8, 1.05, 3.6], e), fov: 46, ap: 1.6, focus: 3.4 }; },
  update: (u, t) => { const W = OBJ.workers, S = OBJ.site;
    const a = W[2]; a.root.position.set(14.6, 0, 4.95); a.root.rotation.y = Math.PI - 0.2; a.root.updateMatrixWorld(true);
    const bp = V3(14.55, 0.72 + nzf(t, 11, 1) * .02, 4.08); S.bucket.position.copy(bp); S.bucket.rotation.set(0.95 + nzf(t, 12, .8) * .08, 0, 0);
    poseChar(a, { face: 'calm', handL: holdAt(a, V3(14.8, 0.8, 4.15)), handR: holdAt(a, V3(14.32, 0.84, 4.15)), lean: [0.2, 0, 0], head: [0.25, 0, 0] });
    const P = S.pour; P.visible = true; const pp = P.geometry.attributes.position; for (let i = 0; i < 70; i++) { const ph = ((t * 2.2 + hash(i)) % 1); pp.setXYZ(i, 14.55 + (hash(i + 1) - .5) * .06, lerp(0.7, 0.5, ph), lerp(3.86, 3.8, ph)); } pp.needsUpdate = true;
    const b = W[4]; b.root.position.set(17.9, 0, 2.6); b.root.rotation.y = -1.5; poseChar(b, { face: 'calm', lean: [0.25, 0, 0], handL: [0.15 + nzf(t, 13, 1.2) * .1, 0.65, 0.55], handR: [-0.15 + nzf(t, 13, 1.2) * .1, 0.75, 0.5], head: [0.3, 0, 0] });
    const c = OBJ.yb; c.root.position.set(...YB); c.root.rotation.y = Math.PI; poseChar(c, POSE.stand(t, 4, 'calm'));
    siteUpdate(t, { mix: .4, steam: .15, patch: 1 }); } });
// 4b: he shakes dry quicklime straight in (close, push in from the side)
sh({ id: 's4b', t0: C_.s4b, locs: ['site'], light: dayLight([9, 1, 2.2]),
  cam: (u) => { const e = eio(u); return { p: lerp3([11.2, 2.05, 4.6], [10.6, 1.95, 4.1], e), l: lerp3([9.1, 1.3, 2.5], [9.1, 1.3, 2.5], e), fov: lerp(44, 38, e), ap: 2.4, focus: 2.0, shk: 0.012 }; },
  update: (u, t) => { const c = OBJ.yb; c.root.position.set(...YB); c.root.rotation.y = Math.PI; const sk = lsh(t, 7, 11) * .12;
    holdSack(c, [9.0, 1.15 + sk * .5, 2.05], [-1.35 + sk, 0, sk * .6], 'smug', { head: [0.0, 0.25, 0.06] });
    powderStream(t, [9.0, 1.0, 1.85], [9.05, 0.56, 1.5], 120, .3, 1); siteUpdate(t, { mix: .9, steam: .5, patch: 1 }); } });
// 5: his finished wall: white lumps in grey concrete (vertical slide down the end face)
sh({ id: 's5', t0: C_.s5, locs: ['site'], light: dayLight([4.1, 1.2, 0], { sun: { col: 0xfff2dc, int: 3.2, pos: [8, 9, 6], target: [4.1, 1.2, 0], ext: 5, far: 30 } }),
  cam: (u) => { const e = eio(u); return { p: lerp3([6.0, 2.4, 0.9], [5.6, 0.95, 0.1], e), l: lerp3([4.1, 2.0, 0.1], [4.1, 0.8, -0.2], e), fov: 38, ap: 1.6, focus: 1.9 }; },
  update: (u, t) => { siteUpdate(t, { mix: .3, steam: 0, patch: 1 }); } });
// 6a: "Sloppy": the master jabs a lump, workers laugh (orbit)
sh({ id: 's6a', t0: C_.s6a, locs: ['site'], light: dayLight([5, 1.2, 0.6]),
  cam: (u) => { const e = eio(u); return { p: lerp3([7.4, 1.85, 2.9], [6.7, 1.75, 3.5], e), l: lerp3([4.95, 1.25, -0.8], [5.05, 1.25, -0.7], e), fov: 52, ap: 1.0, focus: 4.4 }; },
  update: (u, t) => { const m = OBJ.master; m.root.position.set(4.6, 0, -0.6); m.root.rotation.y = 0.57; m.root.updateMatrixWorld(true);
    const lp = new T.Vector3(); OBJ.site.jabLump.getWorldPosition(lp); const jab = bump(t, C_.sloppy - 0.1, 0.45); const tgt = lp.clone().add(V3(0.32 - jab * 0.14, -0.02, 0));
    poseChar(m, { face: 'smug', handR: holdAt(m, tgt), point: 1, lean: [0.04, 0, 0], head: [0.05, 0.1, -0.06], handL: [0.45, 0.6, 0.15] });
    const W = OBJ.workers; [[1, 5.25, -2.2, 0.55], [3, 6.05, -1.85, 0.45], [0, 6.55, -0.75, 0.2]].forEach(([i, x, z, ry], k) => { const w = W[i]; w.root.position.set(x, 0, z); w.root.rotation.y = ry; const p = POSE.laugh(t * 1.15 + k * .3, k * 2.1, 1.6); p.face = ['laugh_1', 'laugh_1', 'laugh_1'][k]; p.head = [-.35 + p.head[0] * .5, 0.15 * (k - 1), p.head[2]]; if (k === 1) { p.handR = [-0.45, 1.0, 0.5]; p.point = 1; } poseChar(w, p); });
    siteUpdate(t, { mix: .2, steam: 0, patch: 1 }); } });
// 6b: the young builder shrugs, half smile, "Give it time" (slow push on a close-up)
sh({ id: 's6b', t0: C_.s6b, locs: ['site'], light: dayLight([7, 1.6, 2.6]),
  cam: (u) => { const e = eio(u); return { p: lerp3([4.6, 1.75, 4.4], [4.9, 1.72, 4.1], e), l: lerp3([7.0, 1.3, 2.5], [7.0, 1.35, 2.5], e), fov: lerp(46, 41, e), ap: 2.2, focus: 2.2 }; },
  update: (u, t) => { const c = OBJ.yb; c.root.position.set(7.0, 0, 2.5); c.root.rotation.y = -1.0; const t0 = C_.shrugged - 0.1, s = eio(clamp((t - t0) / 0.3)) * (1 - eio(clamp((t - t0 - 0.65) / 0.35)));
    const face = t < C_.shrugged - 0.15 ? 'calm' : 'half';
    poseChar(c, { face, gaze: t < C_.shrugged ? -1 : 0, handL: [0.42 + s * .3, 0.66 + s * .42, 0.06 + s * .32], handR: [-0.42 - s * .3, 0.66 + s * .42, 0.06 + s * .32], lean: [-0.06 * s, 0, 0], head: [-0.08 * s + nzf(t, 21, .8) * .02, 0.1, s * .22 + nzf(t, 22, .7) * .03], bob: s * .09, drop: -s * .02 });
    const m = OBJ.master; m.root.position.set(5.0, 0, 0.55); m.root.rotation.y = 0.9; poseChar(m, POSE.stand(t, 5, 'angry'));
    siteUpdate(t, { mix: .2, steam: 0, patch: 1 }); } });
// 7: years later, a storm: a huge wave hits, a crack zig-zags up the wall (handheld shake + zoom)
sh({ id: 's7', t0: C_.s7, locs: ['site'], light: stormLight([-9, 1.5, 1.2]),
  cam: (u, t) => { const k = Math.exp(-Math.max(0, t - C_.storm - .5) * 3) * (t > C_.storm + .5 ? 1 : 0); const sw = eio(clamp((t - C_.storm - 0.12) / 0.55)); return { p: lerp3([0.6, 4.0, 6.8], [-8.4, 1.6, 6.6], sw), l: lerp3([-9.6, 1.4, 3.2], [-9.0, 1.45, 1.2], sw), fov: lerp(52, 44, sw), ap: 0.8, focus: 8.5, shk: 0.04 + 0.22 * k }; },
  post: (u, t) => { const f = Math.max(0, 1 - Math.abs(t - C_.storm) * 5) + Math.max(0, 1 - Math.abs(t - C_.storm - 0.5) * 7) * .6; U.flash.value = clamp(f) * .55; U.flashCol.value.set(.9, .95, 1.1); },
  update: (u, t) => { siteUpdate(t, { storm: 1, finished: true, wave: clamp((t - C_.storm + 0.55) / 0.95), crack: eout(clamp((t - C_.cracked7) / 0.35)) }); } });
// 8: dive into the crack: the water thread runs down and touches the white lump (forward dive)
sh({ id: 's8', t0: C_.s8, locs: ['xs'], light: xsLight(),
  cam: (u) => { const e = ein(u) * .4 + eio(u) * .6, X = OBJ.xs; return { p: lerp3(add3(XS_O, [0.6, 3.2, 13]), add3(XS_O, [X.lumpX + 0.9, X.lumpY + 1.0, 4.4]), e), l: lerp3(add3(XS_O, [0, 1.5, 0]), add3(XS_O, [X.lumpX + 0.2, X.lumpY + 0.2, 1.8]), e), fov: lerp(50, 42, e), ap: 1.4, focus: lerp(12, 2.8, e) }; },
  update: (u, t) => { xsUpdate(t, { water: eio(clamp((t - C_.s8 - 0.1) / (C_.hit - C_.s8 + 0.05))) }); } });
// 9: climax: the lump fizzes and dissolves into a milky stream; crystals begin to grow (slow arc on a close-up)
sh({ id: 's9', t0: C_.s9, locs: ['xs'], light: xsLight({ pts: [{ p: add3(XS_O, [0, 1, 4]), col: 0xbfe6ff, int: 5, dist: 9 }] }),
  cam: (u) => { const X = OBJ.xs, a = lerp(-0.45, 0.4, eio(u)); const c = add3(XS_O, [X.lumpX + 0.1, X.lumpY - 0.2, 1.8]); return { p: [c[0] + Math.sin(a) * 3.2, c[1] + 0.6 - u * .3, c[2] + Math.cos(a) * 3.2], l: c, fov: 40, ap: 1.8, focus: 3.2 }; },
  update: (u, t) => { xsUpdate(t, { water: 1, fizz: sstep(C_.s9 + .3, C_.never, t), dissolve: eio(clamp((t - C_.never) / (C_.hardened - C_.never + 0.4))), crystals: 0.5 * eout(clamp((t - C_.hardened) / 1.2)) }); } });
// 10: crystals zip the crack shut, then a fast pull back out to the wall: a thin white seam, waves still hitting
sh({ id: 's10', t0: C_.s10, locs: ['site'], light: stormLight([-9, 1.5, 1.2], { bg: [0.32, 0.38, 0.46], hemi: [0xb8c8e0, 0x3a3e46, 0.85], fog: [0x6a7888, 0.012], grade: { tint: [0.92, 0.98, 1.08], sat: 1.0, vig: 0.4, bloom: 0.3 } }),
  cam: (u) => { const e = eio(u); return { p: lerp3([-8.6, 1.75, 6.6], [-8.85, 1.35, 4.3], e), l: lerp3([-9.0, 1.3, 1.2], [-9.0, 1.15, 1.2], e), fov: lerp(44, 40, e), ap: 0.8, focus: lerp(5.4, 3.1, e), shk: 0.012 }; },
  update: (u, t) => { siteUpdate(t, { storm: 1, finished: true, crack: 1, seam: eout(clamp((t - 33.95) / 0.75)), sprayK: 0.6 }); } });
// 11: "that builder's made up": he fades; the camera slides onto one white lump (lateral slide)
sh({ id: 's11', t0: C_.s11, locs: ['site'], light: dayLight([4.6, 1.3, 0.6], { grade: { tint: [1.02, 1.0, 0.97], sat: 1.05, vig: 0.34, bloom: 0.25 } }),
  cam: (u) => { const e = eio(u); return { p: lerp3([7.9, 1.65, 3.0], [6.0, 1.45, 0.75], e), l: lerp3([5.6, 1.5, 1.6], [4.15, 1.2, 0.05], e), fov: lerp(42, 36, e), ap: lerp(1.4, 2.2, e), focus: lerp(2.6, 1.9, e) }; },
  update: (u, t) => { const c = OBJ.yb2; c.root.position.set(5.6, 0, 1.6); c.root.rotation.y = -1.9; poseChar(c, Object.assign(POSE.stand(t, 3, 'smug'), { head: [0, 0.3, 0.05] }));
    setOpacity(c, 1 - sstep(C_.madeup - 0.1, C_.madeup + 0.6, t)); siteUpdate(t, { mix: 0, steam: 0, patch: 0, finished: true, seam: 0 }); } });
// 12: the lab: a cylinder made the Roman way, then cracked (orbit)
sh({ id: 's12', t0: C_.s12, locs: ['lab'], light: labLight(),
  cam: (u) => { const a = lerp(-0.75, 0.35, eio(u)), r = lerp(3.4, 2.5, eio(u)), c = add3(LAB_O, [-0.3, 1.45, -1.0]); return { p: [c[0] + Math.sin(a) * r, 1.85, c[2] + Math.cos(a) * r], l: c, fov: 44, ap: 1.4, focus: r, shk: 0.01 }; },
  update: (u, t) => { const s = OBJ.sci; s.root.position.set(200 - 1.9, 0, -0.35); s.root.rotation.y = 0.85; const tap = bump(t, C_.cracked12 - 0.25, 0.4);
    poseChar(s, { face: t > C_.cracked12 ? 'awe' : 'focus', lean: [0.15 + tap * .1, 0, 0], head: [0.15, 0.2, 0], handR: [-0.1, 1.0 + tap * .15, 0.55 - tap * .1], handL: [0.4, 0.7, 0.2], bob: 0 });
    labUpdate(t, { crackA: 0.55 * eout(clamp((t - C_.s12 - 1.3) / 0.35)) + 0.45 * eout(clamp((t - C_.cracked12) / 0.3)), rateA: 0, day: 1, curve: 0 }); } });
// 13: water runs through; 14 days on the calendar; the drip slows to nothing; a white seam fills (push in + tilt)
sh({ id: 's13', t0: C_.s13, locs: ['lab'], light: labLight(),
  cam: (u) => { const e = eio(u); return { p: lerp3(add3(LAB_O, [-0.2, 1.7, 1.6]), add3(LAB_O, [-0.5, 1.95, 0.6]), e), l: lerp3(add3(LAB_O, [-0.6, 1.6, -1.0]), add3(LAB_O, [-0.5, 2.45, -1.8]), e), fov: lerp(46, 40, e), ap: 0.8, focus: lerp(2.7, 2.6, e) }; },
  update: (u, t) => { const d0 = C_.two13 - 0.2, d1 = C_.stopped - 0.1; const k = clamp((t - d0) / (d1 - d0)); const day = 1 + k * 13; const fl = (day % 1);
    labUpdate(t, { crackA: 1, seamA: eio(k), rateA: 1 - sstep(.6, 1, k) - (t > d1 ? 1 : 0), day: Math.floor(day), flip: k > 0 && k < 1 ? fl : 0, curve: k });
    const s = OBJ.sci; s.root.position.set(200 - 1.9, 0, -0.35); s.root.rotation.y = 0.85; poseChar(s, Object.assign(POSE.stand(t, 6, k > .9 ? 'awe' : 'focus'), { head: [0.1, 0.25, 0] })); } });
// 14: without quicklime: water keeps pouring through the second cylinder (lateral truck)
sh({ id: 's14', t0: C_.s14, locs: ['lab'], light: labLight(),
  cam: (u) => { const e = eio(u); return { p: lerp3(add3(LAB_O, [-0.15, 1.8, 3.5]), add3(LAB_O, [0.15, 1.75, 3.2]), e), l: add3(LAB_O, [0, 1.5, -1.0]), fov: 46, ap: 0.6, focus: 4.1 }; },
  update: (u, t) => { labUpdate(t, { crackA: 1, seamA: 1, crackB: 1, rateA: 0, rateB: 1, day: 14, curve: 1, puddle: 0.35 + 0.65 * eout(clamp((t - C_.s14) / 2.5)) });
    const s = OBJ.sci; s.root.position.set(200 + 2.6, 0, -0.2); s.root.rotation.y = -0.6; poseChar(s, Object.assign(POSE.stand(t, 7, 'worry'), { head: [0.15, -0.2, 0] })); } });
// 15a: Roman harbour ruins in today's sea, a motorboat passing (crane drift)
sh({ id: 's15a', t0: C_.s15a, locs: ['ruins'], light: ruinsLight(add3(RU_O, [0, 1, -10])),
  cam: (u) => { const e = eio(u); return { p: lerp3(add3(RU_O, [-7, 1.6, 12]), add3(RU_O, [-4.5, 3.4, 9.5]), e), l: lerp3(add3(RU_O, [0, 1.6, -10]), add3(RU_O, [1, 1.2, -12]), e), fov: 50, ap: 0.5, focus: 18 }; },
  update: (u, t) => { ruinsUpdate(t, { t0: C_.s15a - 2 }); } });
// 15b: final close-up: one white lump in the old stone; hard cut on "years" (push in)
sh({ id: 's15b', t0: C_.s15b, locs: ['ruins'], light: ruinsLight(add3(RU_O, [30, 1.5, 0])),
  cam: (u) => { const e = eout(u); return { p: lerp3(add3(RU_O, [30.35, 1.7, 3.4]), add3(RU_O, [30.08, 1.55, 1.75]), e), l: add3(RU_O, [30, 1.48, 0.5]), fov: lerp(40, 34, e), ap: 1.6, focus: lerp(2.9, 1.25, e) }; },
  update: (u, t) => { ruinsUpdate(t, { t0: C_.s15a - 2 }); } });
