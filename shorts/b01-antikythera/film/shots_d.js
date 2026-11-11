// shots_d.js: extra set dressing for the sea, the void and the reconstructed mechanism (wraps the per-frame updates of shots_c.js)
'use strict';
const DR = {};
function starGeo(n, ro, ri, depth) { const s = new T.Shape(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, a = i / (n * 2) * 6.2832; (i ? s.lineTo : s.moveTo).call(s, Math.cos(a) * r, Math.sin(a) * r); } s.closePath(); return new T.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 2 }); }
{ const prev = buildMore; buildMore = () => { prev && prev(); dressSea(); dressVoid(); dressMech(); }; }
function dressSea() {
  const L = SEA.L, r = rng(99), wood = std(0x6a4a30, .85), wood2 = std(0x7d5a3c, .85);
  // loose planks and beams around the wreck and the lump
  for (let i = 0; i < 16; i++) { const x = (r() - .5) * 12, z = -5 + r() * 8; if (Math.hypot(x, z) < 2.2) continue; mesh(roundedBox(.16, .1, 1.2 + r() * 1.6, .03), i % 2 ? wood : wood2, { parent: L, pos: [x, seaH(x, z) + .06, z], rot: [(r() - .5) * .3, r() * 6, (r() - .5) * .3], ol: .012 }); }
  for (const [x, z, ry] of [[-1.5, -1.0, .7], [1.7, -1.3, -.4], [-1.0, 1.6, 1.4]]) mesh(roundedBox(.2, .14, 1.9, .04), wood, { parent: L, pos: [x, .08, z], rot: [0, ry, .1], ol: .014 });
  // a pile of amphorae and half buried ones next to the lump
  const amp = () => { const gg = group(null); mesh(lathe([[0, 0], [0.1, 0.03], [0.26, 0.35], [0.28, 0.65], [0.15, 0.95], [0.11, 1.1], [0.17, 1.18], [0.12, 1.2], [0.0, 1.18]], 20), std(0xc9703f, .75), { parent: gg, ol: .018 }); mesh(new T.TorusGeometry(0.265, 0.018, 6, 20), std(0x6a3a1c, .8), { parent: gg, pos: [0, .5, 0], rot: [Math.PI / 2, 0, 0] }); return gg; };
  for (const [x, z, rx, ry, rz, s] of [[-1.7, -0.5, 1.4, .5, 0, .8], [-3.4, -2.6, 1.3, 2, .2, .9], [-3.7, -2.9, 1.5, 3.2, .6, .85], [-3.2, -3.2, 1.2, 1.1, -.3, .9], [2.2, 0.8, 1.5, -.4, .3, .7], [3.4, -0.6, .4, 1.4, .8, .8]]) { const a = amp(); a.scale.setScalar(s); a.position.set(x, seaH(x, z) + .1, z); a.rotation.set(rx, ry, rz); L.add(a); }
  // starfish, shells
  for (const [x, z, s, col] of [[.75, .55, 1, 0xff7a4a], [-.7, .8, .8, 0xf2b632], [1.6, -.4, .9, 0xe8627a], [-2.2, 1.9, 1.1, 0xff7a4a]]) mesh(starGeo(5, .2 * s, .085 * s, .04), std(col, .7), { parent: L, pos: [x, seaH(x, z) + .03, z], rot: [-Math.PI / 2, 0, r() * 6], ol: .008 });
  for (let i = 0; i < 12; i++) { const x = (r() - .5) * 8, z = -2 + r() * 5; if (Math.hypot(x, z) < 1.2) continue; mesh(new T.SphereGeometry(.09 + r() * .05, 10, 8, 0, 6.28, 0, 1.7), std(0xf2e6d0, .6), { parent: L, pos: [x, seaH(x, z) + .02, z], scl: [1, .6, 1], rot: [0, r() * 6, 0], ol: .006 }); }
  // anchor
  const iron = std(0x3a3f4a, .5, .7), an = group(L, [-4.6, 0.55, -3.5]); an.rotation.set(.2, .7, .35);
  mesh(new T.CylinderGeometry(.06, .06, 1.8, 10), iron, { parent: an, ol: .01 }); mesh(new T.TorusGeometry(.14, .035, 8, 16), iron, { parent: an, pos: [0, .95, 0] }); mesh(new T.CylinderGeometry(.05, .05, .9, 10), iron, { parent: an, pos: [0, .65, 0], rot: [0, 0, Math.PI / 2] });
  mesh(new T.TorusGeometry(.5, .06, 8, 24, Math.PI), iron, { parent: an, pos: [0, -.85, 0], rot: [0, 0, Math.PI], ol: .01 });
  // coral clusters (more of them, bigger)
  for (let i = 0; i < 14; i++) { const x = (r() - .5) * 14, z = -5 + r() * 9; if (Math.hypot(x, z) < 2.4) continue; const cc = group(L, [x, seaH(x, z), z]); const col2 = [0xe8627a, 0xf0a04a, 0xb070d0, 0x59c3ff][i % 4]; for (let k = 0; k < 7; k++) mesh(new T.CapsuleGeometry(.05 + r() * .04, .3 + r() * .7, 4, 8), std(col2, .7), { parent: cc, pos: [(r() - .5) * .6, .25, (r() - .5) * .6], rot: [(r() - .5) * .9, 0, (r() - .5) * .9], ol: .01 }); }
  // jellyfish
  DR.jelly = []; for (let i = 0; i < 4; i++) { const j = group(L); mesh(new T.SphereGeometry(.28, 20, 12, 0, 6.28, 0, 1.6), new T.MeshPhysicalMaterial({ color: [0xff9ad0, 0xb0a0ff, 0x9affe0, 0xffd0a0][i], transparent: true, opacity: .55, roughness: .2, emissive: [0xff4aa0, 0x6a5aff, 0x2affb0, 0xff9a4a][i], emissiveIntensity: .5, depthWrite: false }), { parent: j, cast: false }); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; mesh(new T.CapsuleGeometry(.015, .5, 3, 6), std(0xffd0f0, .5, 0, { transparent: true, opacity: .5 }), { parent: j, pos: [Math.cos(a) * .15, -.3, Math.sin(a) * .15], cast: false }); } DR.jelly.push(j); }
  // marine snow + second, bigger bubble system (bursts from the helmets)
  const sn = new Float32Array(260 * 3); DR.snowB = new Float32Array(260 * 3); for (let i = 0; i < 260; i++) { DR.snowB[i * 3] = (r() - .5) * 16; DR.snowB[i * 3 + 1] = r() * 7; DR.snowB[i * 3 + 2] = -9 + r() * 16; }
  DR.snow = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(sn, 3)), new T.PointsMaterial({ map: glowTex([[0, 'rgba(230,255,255,.9)'], [1, 'rgba(230,255,255,0)']]), size: .07, transparent: true, depthWrite: false, fog: true, opacity: .8 })); DR.snow.frustumCulled = false; L.add(DR.snow);
  DR.bub = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(150 * 3), 3)), new T.PointsMaterial({ map: SEA.bub.material.map, size: .24, transparent: true, depthWrite: false, fog: false, opacity: .95 })); DR.bub.frustumCulled = false; L.add(DR.bub);
  for (let i = 0; i < 6; i++) { const m = new T.Mesh(new T.PlaneGeometry(1.2 + r() * 1.4, 18), SEA.rays[0].material.clone()); m.position.set(-9 + i * 3.4, 8, -9 + (i % 3) * 3); m.rotation.set(0, r() * 3, -.15); L.add(m); SEA.rays.push(m); }
}
{ const old = seaCommon; seaCommon = function (t) { old(t);
  DR.jelly.forEach((j, i) => { const a = t * .12 + i * 1.7; j.position.set(Math.cos(a) * (4 + i * .7), 3.4 + i * .6 + nzs(t * 1.3 + i) * .35, -4 + Math.sin(a) * 3.5); const p = 1 + nzs(t * 3 + i) * .1; j.scale.set(1 / p, p, 1 / p); j.rotation.y = t * .3; });
  const p = DR.snow.geometry.attributes.position; for (let i = 0; i < 260; i++) p.setXYZ(i, DR.snowB[i * 3] + nzs(t * .35 + i) * .3, (DR.snowB[i * 3 + 1] - t * .12 + 700) % 7, DR.snowB[i * 3 + 2] + Math.cos(t * .3 + i * 1.3) * .3); p.needsUpdate = true;
  const b = DR.bub.geometry.attributes.position, srcs = [SEA.dA, SEA.dB, SEA.dC];
  for (let i = 0; i < 150; i++) { const s = srcs[i % 3], per = 1.6, ph = ((t + hash(i) * per + (i % 3) * .5) % per) / per, burst = Math.floor((t + hash(i) * per) / per); const wp = s.root.position; b.setXYZ(i, wp.x + (hash(i + burst) - .5) * .35 + Math.sin(ph * 14 + i) * .07, wp.y + 1.95 + ph * 7.5, wp.z + (hash(i + 3 + burst) - .5) * .3); }
  b.needsUpdate = true;
}; }

// ----- void: floating dim gears, light cone, rune rings -----
function dressVoid() {
  const L = VD.L, r = rng(55); DR.vg = [];
  for (let i = 0; i < 16; i++) { const N = 10 + Math.floor(r() * 16), rad = N * .02 * (1 + r() * .9); const g = new T.Mesh(gearGeo(N, rad, .05, .04, { hole: rad * .15, spokes: N > 16 ? 4 : 0, spokeR: .18 }), new T.MeshBasicMaterial({ color: new T.Color(.1, .22, .55), transparent: true, opacity: .16 + r() * .14, blending: T.AdditiveBlending, depthWrite: false, fog: false })); const a = r() * 6.28, d = 2.8 + r() * 4; g.position.set(Math.cos(a) * d, .3 + r() * 5, Math.sin(a) * d - 1.5); g.rotation.set(r() * .6, r() * 6, r() * .6); g.userData = { sp: (r() - .5) * .8, y0: g.position.y, ph: r() * 6 }; L.add(g); DR.vg.push(g); }
  const cone = new T.Mesh(new T.CylinderGeometry(.4, 2.2, 8, 32, 1, true), new T.MeshBasicMaterial({ map: ctex(4, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(110,160,255,.5)'); g.addColorStop(1, 'rgba(110,160,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }), transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false, opacity: .8 })); cone.position.set(0, 4, 0); L.add(cone); DR.cone = cone;
  DR.rings = [1.1, 1.8, 2.6].map((rr, i) => { const m = new T.Mesh(new T.RingGeometry(rr, rr + .04, 64), new T.MeshBasicMaterial({ color: new T.Color(.25, .5, 1.2), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false, side: T.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.y = .02 + i * .001; L.add(m); return m; });
}
{ const s9 = SHOTS.find(s => s.id === '9'); const old = s9.update; s9.update = (u, t, s) => { old(u, t, s);
  DR.vg.forEach(g => { g.rotation.z += g.userData.sp * .0333 * 0; g.rotation.z = g.userData.ph + t * g.userData.sp; g.position.y = g.userData.y0 + nzs(t * .5 + g.userData.ph) * .2; });
  DR.rings.forEach((m, i) => m.material.opacity = (.35 + .3 * nzs(t * 1.4 - i * 1.1)) * (1 - sstep(.6, 1, u)));
  DR.cone.material.opacity = .8 * (1 - sstep(.55, 1, u) * .6);
}; }

// ----- mechanism: loose gears, scrolls, candles, orrery ring, light shaft -----
function dressMech() {
  const L = MC.L, r = rng(71), br = BRASS(), bz = BRONZE();
  for (const [x, z, N] of [[1.8, .6, 16], [-1.9, 1.0, 22], [1.2, -1.7, 12], [-1.4, -1.6, 28], [.3, 2.0, 14]]) mesh(gearGeo(N, N * .016, .04, .05, { hole: .02, spokes: N > 18 ? 5 : 0, spokeR: .2 }), r() < .5 ? br : bz, { parent: L, pos: [x, -1.27, z], rot: [-Math.PI / 2, 0, r() * 6], ol: .01 });
  for (const [x, z, ry] of [[2.2, -.6, .5], [-2.3, -.4, -.3]]) { mesh(new T.CylinderGeometry(.09, .09, .8, 14), std(0xe9d8b0, .85), { parent: L, pos: [x, -1.2, z], rot: [0, ry, Math.PI / 2], ol: .01 }); }
  DR.flames = [];
  for (const [x, z] of [[1.0, 1.6], [-1.0, 1.9]]) { const c = group(L, [x, -1.3, z]); mesh(new T.CylinderGeometry(.06, .06, .25, 12), std(0xf6ecd2, .8), { parent: c, pos: [0, .125, 0], ol: .008 }); const f = new T.Mesh(new T.ConeGeometry(.03, .1, 8), new T.MeshBasicMaterial({ color: new T.Color(3, 1.8, .5) })); f.position.y = .3; c.add(f); DR.flames.push(f); const gl = new T.Mesh(new T.PlaneGeometry(.7, .7), new T.MeshBasicMaterial({ map: glowTex([[0, 'rgba(255,200,110,.8)'], [1, 'rgba(255,170,60,0)']]), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false })); gl.position.y = .32; c.add(gl); }
  DR.orrery = group(L, [0, 1.7, 0]); mesh(new T.TorusGeometry(1.9, .015, 8, 80), br, { parent: DR.orrery, rot: [Math.PI / 2, 0, 0], cast: false }); DR.orrery.rotation.set(.25, 0, .15);
  DR.planets = [0xe8627a, 0x59c3ff, 0xf2b632, 0xb070d0, 0x7ad97a].map((col, i) => mesh(new T.SphereGeometry(.07 + (i % 2) * .03, 14, 10), std(col, .35, .3, { emissive: col, ei: .25 }), { parent: DR.orrery, ol: .01, cast: false }));
  // glass back panel so the reconstructed case is closed on every side (gears stay visible through it)
  const gb = new T.Mesh(new T.PlaneGeometry(1.5, 1.9), new T.MeshPhysicalMaterial({ color: 0xcfe8ff, transparent: true, opacity: .16, roughness: .05, depthWrite: false, side: T.DoubleSide, envMapIntensity: 1.4 })); gb.position.set(0, 0, -0.18); MC.M.add(gb);
  const beam = new T.Mesh(new T.CylinderGeometry(.9, 2.4, 7, 32, 1, true), new T.MeshBasicMaterial({ map: ctex(4, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,220,150,.4)'); g.addColorStop(1, 'rgba(255,220,150,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }), transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false, opacity: .8 })); beam.position.set(0, 2.2, 0); L.add(beam);
  const mp = new Float32Array(140 * 3); DR.motes = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(mp, 3)), new T.PointsMaterial({ map: glowTex([[0, 'rgba(255,230,170,1)'], [1, 'rgba(255,200,100,0)']]), size: .07, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })); DR.motes.frustumCulled = false; L.add(DR.motes);
}
{ const old = mechUpdate; mechUpdate = function (t) { old(t);
  DR.planets.forEach((p, i) => { const a = t * (.5 + i * .13) + i * 1.26; p.position.set(Math.cos(a) * 1.9, Math.sin(a * 2 + i) * .06, Math.sin(a) * 1.9); });
  DR.orrery.rotation.y = t * .1;
  DR.flames.forEach((f, i) => { f.scale.set(1, 1 + Math.sin(t * 13 + i) * .12, 1); });
  const m = DR.motes.geometry.attributes.position; for (let i = 0; i < 140; i++) { const a = hash(i) * 6.28, rr = .3 + hash(i + 4) * 2.2, f = (t * .08 + hash(i + 9)) % 1; m.setXYZ(i, Math.cos(a + t * .15) * rr, -1.2 + f * 4.5, Math.sin(a + t * .15) * rr); } m.needsUpdate = true;
}; }

{ const old = resetVis; resetVis = function () { old(); [SEA.dA, SEA.dB, SEA.dC].forEach(q => q.root.visible = true); if (DR.bub) { DR.bub.visible = true; SEA.bub.visible = true; } }; }
{ const s13 = SHOTS.find(s => s.id === '13'); const old13 = s13.update; s13.update = (u, t, s) => { old13(u, t, s); DR.bub.visible = false; SEA.bub.visible = false; }; }
