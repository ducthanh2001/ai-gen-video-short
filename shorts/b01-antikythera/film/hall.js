// hall.js: the throne hall (location A) with its court
'use strict';
const LOC = {};            // location groups, toggled per shot
const ENV = {};            // environment maps

function paintGod(x, kind, cx, cy, s) {
  const ink = '#2a1a22'; x.lineJoin = x.lineCap = 'round'; x.lineWidth = 7 * s;
  const head = (hx, hy, r) => { x.fillStyle = '#fbe9d2'; x.strokeStyle = ink; x.beginPath(); x.arc(hx, hy, r, 0, 7); x.fill(); x.stroke(); };
  const eyes = (hx, hy, r) => { x.fillStyle = ink; for (const k of [-1, 1]) { x.beginPath(); x.arc(hx + k * r * .38, hy - r * .05, r * .09, 0, 7); x.fill(); } x.lineWidth = 5 * s; x.beginPath(); x.arc(hx, hy + r * .25, r * .22, .2, Math.PI - .2); x.stroke(); };
  const robe = (col, top, bot, w1, w2) => { x.fillStyle = col; x.strokeStyle = ink; x.beginPath(); x.moveTo(cx - w1, top); x.lineTo(cx + w1, top); x.quadraticCurveTo(cx + w2 * 1.1, (top + bot) / 2, cx + w2, bot); x.lineTo(cx - w2, bot); x.quadraticCurveTo(cx - w2 * 1.1, (top + bot) / 2, cx - w1, top); x.closePath(); x.fill(); x.stroke(); };
  const arm = (x1, y1, x2, y2) => { x.strokeStyle = ink; x.lineWidth = 16 * s; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); x.strokeStyle = '#fbe9d2'; x.lineWidth = 9 * s; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); x.lineWidth = 7 * s; };
  if (kind === 'zeus') {
    robe('#e8943a', cy - 40 * s, cy + 260 * s, 55 * s, 90 * s); arm(cx + 50 * s, cy - 20 * s, cx + 130 * s, cy - 120 * s, 1);
    x.fillStyle = '#ffd23f'; x.strokeStyle = ink; x.beginPath(); x.moveTo(cx + 140 * s, cy - 210 * s); x.lineTo(cx + 105 * s, cy - 130 * s); x.lineTo(cx + 135 * s, cy - 130 * s); x.lineTo(cx + 110 * s, cy - 50 * s); x.lineTo(cx + 180 * s, cy - 150 * s); x.lineTo(cx + 148 * s, cy - 150 * s); x.lineTo(cx + 175 * s, cy - 205 * s); x.closePath(); x.fill(); x.stroke();
    head(cx, cy - 100 * s, 55 * s); x.fillStyle = '#f4f0e8'; x.beginPath(); x.ellipse(cx, cy - 55 * s, 48 * s, 42 * s, 0, 0, Math.PI); x.fill(); x.stroke(); eyes(cx, cy - 110 * s, 55 * s);
  } else if (kind === 'poseidon') {
    robe('#2fa7b8', cy - 40 * s, cy + 260 * s, 55 * s, 85 * s); arm(cx - 50 * s, cy - 20 * s, cx - 120 * s, cy + 20 * s);
    x.strokeStyle = '#b08a2a'; x.lineWidth = 12 * s; x.beginPath(); x.moveTo(cx - 125 * s, cy + 180 * s); x.lineTo(cx - 125 * s, cy - 170 * s); x.stroke();
    x.beginPath(); x.moveTo(cx - 160 * s, cy - 130 * s); x.quadraticCurveTo(cx - 125 * s, cy - 100 * s, cx - 90 * s, cy - 130 * s); x.moveTo(cx - 160 * s, cy - 130 * s); x.lineTo(cx - 160 * s, cy - 175 * s); x.moveTo(cx - 90 * s, cy - 130 * s); x.lineTo(cx - 90 * s, cy - 175 * s); x.moveTo(cx - 125 * s, cy - 170 * s); x.lineTo(cx - 125 * s, cy - 195 * s); x.stroke();
    head(cx, cy - 100 * s, 55 * s); x.fillStyle = '#3d6f8f'; x.beginPath(); x.ellipse(cx, cy - 55 * s, 48 * s, 42 * s, 0, 0, Math.PI); x.fill(); x.stroke(); eyes(cx, cy - 110 * s, 55 * s);
  } else if (kind === 'athena') {
    robe('#e8e0ee', cy - 40 * s, cy + 260 * s, 52 * s, 80 * s); arm(cx + 50 * s, cy - 20 * s, cx + 110 * s, cy + 40 * s);
    x.strokeStyle = '#7a5a2a'; x.lineWidth = 9 * s; x.beginPath(); x.moveTo(cx + 115 * s, cy + 200 * s); x.lineTo(cx + 115 * s, cy - 190 * s); x.stroke();
    x.fillStyle = '#6a8fd0'; x.strokeStyle = ink; x.beginPath(); x.arc(cx - 85 * s, cy + 60 * s, 52 * s, 0, 7); x.fill(); x.stroke();
    head(cx, cy - 100 * s, 55 * s); x.fillStyle = '#d6a21b'; x.beginPath(); x.arc(cx, cy - 112 * s, 58 * s, Math.PI, 0); x.fill(); x.stroke(); x.fillRect(cx - 6 * s, cy - 195 * s, 12 * s, 40 * s); eyes(cx, cy - 100 * s, 55 * s);
  } else if (kind === 'helios') {
    x.fillStyle = '#ffd23f'; x.strokeStyle = ink; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; x.beginPath(); x.moveTo(cx + Math.cos(a - .12) * 80 * s, cy + Math.sin(a - .12) * 80 * s); x.lineTo(cx + Math.cos(a) * 150 * s, cy + Math.sin(a) * 150 * s); x.lineTo(cx + Math.cos(a + .12) * 80 * s, cy + Math.sin(a + .12) * 80 * s); x.closePath(); x.fill(); x.stroke(); }
    x.fillStyle = '#ffb92e'; x.beginPath(); x.arc(cx, cy, 82 * s, 0, 7); x.fill(); x.stroke(); eyes(cx, cy, 90 * s);
  }
}
function fresco(w, h, gods, bg) {
  return ctex(w, h, (x, W2, H2) => {
    const g = x.createLinearGradient(0, 0, 0, H2); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); x.fillStyle = g; x.fillRect(0, 0, W2, H2);
    const r = rng(5); x.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 6; i++) { const cx2 = r() * W2, cy2 = r() * H2; x.beginPath(); for (let k = 0; k < 4; k++) x.arc(cx2 + k * 40, cy2 + (k % 2) * 10, 34, 0, 7); x.fill(); }
    for (const [kind, cx2, cy2, s2] of gods) paintGod(x, kind, cx2 * W2, cy2 * H2, s2 * W2 / 512);
    x.lineWidth = 26; x.strokeStyle = '#b3532f'; x.strokeRect(13, 13, W2 - 26, H2 - 26); x.lineWidth = 6; x.strokeStyle = '#ffd98a'; x.strokeRect(34, 34, W2 - 68, H2 - 68);
  });
}
function glowTex(stops) { return ctex(256, 256, (x) => { const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); for (const [o, c] of stops) g.addColorStop(o, c); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }); }

function buildHall() {
  const L = group(scene); LOC.hall = L; L.userData.name = 'hall';
  const wall = std(0xf3d9b4, 0.9), terra = std(0xd9703c, 0.7), stone = std(0xe6d3bd, 0.8), gold = std(0xf2b632, 0.3, 0.75), dark = std(0x4a2a1c, 0.8);
  // floor: marble checker
  const floorT = ctex(512, 512, (x, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#f1e2cd' : '#e8c9a8'; x.fillRect(i * 64, j * 64, 64, 64); }
    const r = rng(3); for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(150,110,80,${r() * .06})`; x.fillRect(r() * 512, r() * 512, 2 + r() * 14, 1 + r() * 2); } x.strokeStyle = 'rgba(120,80,60,.25)'; x.lineWidth = 2; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 512); x.moveTo(0, i * 64); x.lineTo(512, i * 64); x.stroke(); } }, { repeat: [4, 7] });
  const floor = mesh(new T.PlaneGeometry(16, 28), std(0xffffff, 0.35, 0, { map: floorT }), { parent: L, rot: [-Math.PI / 2, 0, 0], pos: [0, 0, 0], cast: false }); floor.material.envMapIntensity = .5;
  // walls
  const wallT = ctex(512, 512, (x) => { x.fillStyle = '#f3d9b4'; x.fillRect(0, 0, 512, 512); const r = rng(9); for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(${r() < .5 ? '200,150,100' : '255,240,210'},${r() * .06})`; x.beginPath(); x.arc(r() * 512, r() * 512, 6 + r() * 30, 0, 7); x.fill(); } }, { repeat: [3, 3] });
  const wallM = std(0xffffff, 0.92, 0, { map: wallT });
  const back = mesh(new T.PlaneGeometry(18, 13), wallM, { parent: L, pos: [0, 6.5, -12], cast: false });
  for (const s of [-1, 1]) mesh(new T.PlaneGeometry(26, 13), wallM, { parent: L, pos: [s * 9, 6.5, 0], rot: [0, -s * Math.PI / 2, 0], cast: false });
  mesh(new T.PlaneGeometry(18, 28), std(0x5a3a2a, 0.9), { parent: L, pos: [0, 13, 0], rot: [Math.PI / 2, 0, 0], cast: false });     // ceiling
  mesh(new T.PlaneGeometry(18, 28), std(0x2a1c18, 1), { parent: L, pos: [0, 13.5, 0], rot: [Math.PI / 2, 0, 0], cast: false });
  // dado band with meander on the three walls
  const meander = ctex(512, 64, (x) => { x.fillStyle = '#b3532f'; x.fillRect(0, 0, 512, 64); x.strokeStyle = '#f6d58e'; x.lineWidth = 7; for (let i = 0; i < 8; i++) { const o = i * 64; x.beginPath(); x.moveTo(o + 8, 56); x.lineTo(o + 8, 8); x.lineTo(o + 56, 8); x.lineTo(o + 56, 40); x.lineTo(o + 24, 40); x.lineTo(o + 24, 24); x.lineTo(o + 40, 24); x.stroke(); } }, { repeat: [3, 1] });
  mesh(new T.PlaneGeometry(18, 0.9), std(0xffffff, .8, 0, { map: meander }), { parent: L, pos: [0, 1.1, -11.98], cast: false });
  for (const s of [-1, 1]) mesh(new T.PlaneGeometry(26, 0.9), std(0xffffff, .8, 0, { map: meander }), { parent: L, pos: [s * 8.98, 1.1, 0], rot: [0, -s * Math.PI / 2, 0], cast: false });
  // frescoes: gods
  const fl = fresco(768, 1536, [['zeus', .5, .5, .9], ['helios', .5, .12, .45]], ['#7cc8d8', '#b9e3e6']);
  const fr = fresco(768, 1536, [['poseidon', .5, .5, .9], ['helios', .5, .12, .45]], ['#f7c2a0', '#fbe4c8']);
  const fa = fresco(768, 1536, [['athena', .5, .5, .9], ['helios', .5, .12, .45]], ['#b9a3e0', '#e4d9f4']);
  for (const [tx, px] of [[fl, -5.6], [fa, 5.6]]) mesh(new T.PlaneGeometry(3.6, 7.2), std(0xffffff, 0.8, 0, { map: tx, emissive: 0xffffff, ei: 0.0 }), { parent: L, pos: [px, 6.4, -11.96], cast: false });
  mesh(new T.PlaneGeometry(3.6, 7.2), std(0xffffff, 0.8, 0, { map: fr }), { parent: L, pos: [-8.96, 5.6, -4], rot: [0, Math.PI / 2, 0], cast: false });
  mesh(new T.PlaneGeometry(3.6, 7.2), std(0xffffff, 0.8, 0, { map: fl }), { parent: L, pos: [8.96, 5.6, -5], rot: [0, -Math.PI / 2, 0], cast: false });
  mesh(new T.PlaneGeometry(3.6, 7.2), std(0xffffff, 0.8, 0, { map: fa }), { parent: L, pos: [8.96, 5.6, 1], rot: [0, -Math.PI / 2, 0], cast: false });
  mesh(new T.PlaneGeometry(3.6, 7.2), std(0xffffff, 0.8, 0, { map: fa }), { parent: L, pos: [-8.96, 5.6, 1.5], rot: [0, Math.PI / 2, 0], cast: false });
  // window with the sun above the throne
  const WIN = group(L, [0, 8.2, -11.9]); LOC.win = WIN;
  const sky = new T.Mesh(new T.PlaneGeometry(3.3, 5.2), new T.MeshBasicMaterial({ map: ctex(64, 256, (x) => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#6fb8ff'); g.addColorStop(1, '#d8efff'); x.fillStyle = g; x.fillRect(0, 0, 64, 256); }), toneMapped: false, fog: false })); WIN.add(sky); WIN.userData.sky = sky;
  const sunHalo = new T.Mesh(new T.PlaneGeometry(6, 6), new T.MeshBasicMaterial({ map: glowTex([[0, 'rgba(255,250,200,1)'], [.25, 'rgba(255,220,120,.8)'], [1, 'rgba(255,200,80,0)']]), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false })); sunHalo.position.set(0, 0.7, 0.05); WIN.add(sunHalo);
  const sunDisc = new T.Mesh(new T.CircleGeometry(0.75, 40), new T.MeshBasicMaterial({ color: new T.Color(3, 2.6, 1.2), fog: false })); sunDisc.position.set(0, 0.7, 0.08); WIN.add(sunDisc);
  const moon = new T.Mesh(new T.CircleGeometry(0.78, 40), new T.MeshBasicMaterial({ color: 0x151826, fog: false })); moon.position.set(0, 0.7, 0.1); moon.visible = false; WIN.add(moon);
  WIN.userData.sunHalo = sunHalo; WIN.userData.sunDisc = sunDisc; WIN.userData.moon = moon;
  // arch frame
  const frame = std(0xc9643a, 0.6); const arch = new T.Shape(); arch.moveTo(-2.2, -3); arch.lineTo(-2.2, 1.0); arch.absarc(0, 1.0, 2.2, Math.PI, 0, true); arch.lineTo(2.2, -3); arch.lineTo(1.65, -3); arch.lineTo(1.65, 1.0); arch.absarc(0, 1.0, 1.65, 0, Math.PI, false); arch.lineTo(-1.65, -3);
  mesh(new T.ExtrudeGeometry(arch, { depth: 0.3, bevelEnabled: true, bevelSize: .04, bevelThickness: .04, bevelSegments: 2 }), frame, { parent: WIN, pos: [0, -0.1, 0.0], scl: [1, 0.96, 1], cast: false });
  mesh(new T.PlaneGeometry(3.3, 0.14), frame, { parent: WIN, pos: [0, -1.0, 0.2], cast: false });
  // god rays: soft additive planes falling from the window
  const rayT = ctex(64, 256, (x) => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,236,170,0.55)'); g.addColorStop(1, 'rgba(255,236,170,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 256); const h = x.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(.5, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = h; x.fillRect(0, 0, 64, 256); });
  const rays = group(L); LOC.rays = rays;
  for (let i = 0; i < 4; i++) { const m = new T.Mesh(new T.PlaneGeometry(1.2, 11), new T.MeshBasicMaterial({ map: rayT, transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false, opacity: .6 }));
    m.position.set(-1.5 + i * 1.0, 3.6, -9.5 + i * 0.35); m.rotation.set(0.0, 0.0, 0.0); m.rotation.z = -0.05 + i * .03; m.rotation.x = -0.34; rays.add(m); }
  // columns
  const colMat = std(0xe58a4a, 0.55);
  const col = () => { const g = new T.Group(); mesh(lathe([[0.62, 0], [0.62, 0.22], [0.5, 0.3], [0.44, 0.9], [0.42, 9.2], [0.5, 9.5], [0.78, 9.7], [0.8, 10.2]], 32), colMat, { parent: g, ol: false }); mesh(new T.CylinderGeometry(0.9, 0.9, 0.2, 4), dark, { parent: g, pos: [0, 10.3, 0], rot: [0, Math.PI / 4, 0] }); mesh(new T.TorusGeometry(0.43, .06, 8, 28), std(0x2a1c18, .8), { parent: g, pos: [0, 9.3, 0], rot: [Math.PI / 2, 0, 0] }); mesh(new T.TorusGeometry(0.46, .06, 8, 28), std(0x2a1c18, .8), { parent: g, pos: [0, 0.35, 0], rot: [Math.PI / 2, 0, 0] }); return g; };
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const c = col(); c.position.set(s * 7.2, 0, 7 - i * 4.0); L.add(c); }
  // carpet, dais, throne
  const carpetT = ctex(256, 1024, (x) => { x.fillStyle = '#c63d3d'; x.fillRect(0, 0, 256, 1024); x.strokeStyle = '#f2b632'; x.lineWidth = 14; x.strokeRect(10, 10, 236, 1004); x.lineWidth = 5; x.strokeRect(30, 30, 196, 964); x.fillStyle = '#f2b632'; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(128, 80 + i * 110); x.lineTo(160, 118 + i * 110); x.lineTo(128, 156 + i * 110); x.lineTo(96, 118 + i * 110); x.closePath(); x.fill(); } });
  mesh(roundedBox(3.2, 0.06, 17, 0.025), std(0xffffff, 0.9, 0, { map: carpetT }), { parent: L, pos: [0, 0.03, 1.2], cast: false });
  for (let i = 0; i < 3; i++) mesh(roundedBox(7.5 - i * 1.1, 0.3, 3.4 - i * 0.9, 0.06), i === 2 ? std(0xe2a23a, .5) : stone, { parent: L, pos: [0, 0.15 + i * 0.3, -9.6 + 0.0 + i * 0.35 - (i === 0 ? 0 : 0)] });
  const th = group(L, [0, 0.9, -10.2]); LOC.throne = th;
  mesh(roundedBox(2.0, 0.28, 1.5, 0.12), gold, { parent: th, pos: [0, 0.14, 0], ol: 0.03 });
  mesh(roundedBox(1.7, 0.2, 1.25, 0.09), std(0xc0283a, 0.8), { parent: th, pos: [0, 0.34, 0.05] });
  mesh(roundedBox(2.2, 3.7, 0.35, 0.12), gold, { parent: th, pos: [0, 2.2, -0.65], ol: 0.03 });
  mesh(new T.CylinderGeometry(1.1, 1.1, 0.35, 28), gold, { parent: th, pos: [0, 4.05, -0.65], rot: [Math.PI / 2, 0, 0], ol: 0.03 });
  mesh(new T.CylinderGeometry(0.75, 0.75, 0.1, 28), std(0xc0283a, .6), { parent: th, pos: [0, 4.05, -0.45], rot: [Math.PI / 2, 0, 0] });
  for (const s of [-1, 1]) { mesh(roundedBox(0.28, 0.9, 1.4, 0.1), gold, { parent: th, pos: [s * 1.05, 0.95, 0.05], ol: 0.025 }); mesh(new T.SphereGeometry(0.2, 14, 10), gold, { parent: th, pos: [s * 1.05, 1.5, 0.6], ol: 0.02 }); }
  // braziers
  LOC.flames = [];
  for (const [bx, bz] of [[-3.6, -7], [3.6, -7], [-3.6, 4.5], [3.6, 4.5]]) {
    const b = group(L, [bx, 0, bz]);
    mesh(lathe([[0.1, 0], [0.2, 0.05], [0.12, 0.25], [0.14, 1.0], [0.5, 1.3], [0.55, 1.45], [0.46, 1.4], [0.3, 1.2]], 20), std(0x3a2a24, .5, .5), { parent: b, ol: 0.02 });
    const f1 = mesh(new T.ConeGeometry(0.3, 0.9, 12), new T.MeshBasicMaterial({ color: new T.Color(3, 1.2, 0.2), fog: false }), { parent: b, pos: [0, 1.85, 0], cast: false }); const f2 = mesh(new T.ConeGeometry(0.18, 0.7, 10), new T.MeshBasicMaterial({ color: new T.Color(3, 2.4, 0.9), fog: false }), { parent: b, pos: [0, 1.75, 0], cast: false });
    LOC.flames.push([f1, f2, bx * 1.3 + bz]);
  }
  // banners
  const banT = ctex(256, 512, (x) => { x.fillStyle = '#2b5fb4'; x.fillRect(0, 0, 256, 512); x.strokeStyle = '#f2b632'; x.lineWidth = 14; x.strokeRect(10, 10, 236, 492); x.fillStyle = '#f2b632'; x.beginPath(); x.arc(128, 200, 56, 0, 7); x.fill(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.beginPath(); x.moveTo(128 + Math.cos(a - .1) * 66, 200 + Math.sin(a - .1) * 66); x.lineTo(128 + Math.cos(a) * 96, 200 + Math.sin(a) * 96); x.lineTo(128 + Math.cos(a + .1) * 66, 200 + Math.sin(a + .1) * 66); x.fill(); } x.beginPath(); x.moveTo(10, 502); x.lineTo(128, 440); x.lineTo(246, 502); x.fillStyle = '#1d3f80'; x.fill(); });
  for (const [bx, bz, ry] of [[-3.2, -11.8, 0], [3.2, -11.8, 0], [-8.8, -1, Math.PI / 2], [8.8, -1, -Math.PI / 2], [-8.8, 6, Math.PI / 2], [8.8, 6, -Math.PI / 2]]) mesh(new T.PlaneGeometry(1.5, 3.0), std(0xffffff, .9, 0, { map: banT, side: T.DoubleSide }), { parent: L, pos: [bx, 6.4, bz], rot: [0, ry, 0], cast: false });
  // dust in the light
  const dp = new Float32Array(160 * 3), r = rng(21); for (let i = 0; i < 160; i++) { dp[i * 3] = (r() - .5) * 8; dp[i * 3 + 1] = r() * 9; dp[i * 3 + 2] = -10 + r() * 14; }
  const dust = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(dp, 3)), new T.PointsMaterial({ map: glowTex([[0, 'rgba(255,240,200,1)'], [1, 'rgba(255,240,200,0)']]), size: 0.08, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: .8, fog: false })); L.add(dust); LOC.dust = dust; dust.userData.base = dp.slice();
  // people
  const kingHat = g => crown(g);
  LOC.king = makeChar({ body: 0x7a3fb0, hat: kingHat, beard: 0xf1efe8, beardBig: 1.2, flags: '', size: 1.0, deco: c => {
    mesh(new T.TorusGeometry(0.31, 0.07, 10, 28), std(0xf4f0e8, .9), { parent: c.bg, pos: [0, 0.98, 0], rot: [Math.PI / 2, 0, 0], ol: 0.015 });
    mesh(new T.TorusGeometry(0.31, 0.05, 10, 28), gold, { parent: c.bg, pos: [0, 0.34, 0], rot: [Math.PI / 2, 0, 0] });
    const cape = mesh(new T.CylinderGeometry(0.46, 0.5, 1.15, 28, 1, true, Math.PI * .6, Math.PI * .8), std(0xc0283a, .8, 0, { side: T.DoubleSide }), { parent: c.bg, pos: [0, 0.5, -0.08], rot: [0, Math.PI, 0] });
  } }); L.add(LOC.king.root);
  LOC.king.root.position.set(0, 1.0, -10.2);
  LOC.exec = makeChar({ body: 0x1d1520, base: '#1d1520', flags: 'h', hood: true, hat: g => { const c = mesh(new T.ConeGeometry(.42, .5, 20), std(0x1d1520, .9), { parent: g, pos: [0, .5, 0], ol: .02 }); return c; }, size: 1.05, shoe: 0x0e0a10, deco: c => { c.arm.forEach(a => a.h.material = std(0x1d1520, .8)); } }); L.add(LOC.exec.root);
  const axe = group(LOC.exec.root); LOC.axe = axe;
  mesh(new T.CylinderGeometry(0.04, 0.04, 2.2, 8), std(0x3a2418, .7), { parent: axe, pos: [0, 0, 0] });
  const blade = new T.Shape(); blade.moveTo(0, 0.5); blade.quadraticCurveTo(0.7, 0.8, 0.55, 0); blade.quadraticCurveTo(0.7, -0.8, 0, -0.5); blade.lineTo(0, 0.5);
  mesh(new T.ExtrudeGeometry(blade, { depth: 0.06, bevelEnabled: true, bevelSize: .02, bevelThickness: .02, bevelSegments: 1 }), std(0xb9c3cf, 0.25, 0.9), { parent: axe, pos: [0.02, 0.8, -0.03], ol: 0.02 });
  // the court: 8 round heads
  const cols = [0x2fa7b8, 0xe9b43a, 0xe27a6b, 0x9a7ad0, 0x5cb87a, 0xe86a9a, 0x4a86d6, 0xd98a3a];
  const hats = [g => laurel(g), g => turban(g), null, g => pointHat(g, 0xe24b6b), g => laurel(g, 0xb8a238), g => turban(g, 0xd9e8f2), g => capHat(g, 0x5a8f6a), null];
  LOC.court = [];
  const spots = [[2.5, 0.9, -1], [3.7, -0.5, -1], [2.4, -2.0, -1], [3.6, -3.5, -1], [-3.2, 3.0, 1], [-4.6, 0.6, 1], [-3.0, -2.2, 1], [-4.5, -4.2, 1]];
  for (let i = 0; i < 8; i++) {
    const c = makeChar({ body: cols[i], hat: hats[i], size: .98 + (i % 3) * .03, beard: i === 2 || i === 5 ? 0x6a5a4a : 0, beardBig: .7, flags: i === 6 ? 'g' : (i === 1 ? 's' : '') }); c.root.position.set(spots[i][0], 0, spots[i][1]); c.root.rotation.y = spots[i][2] * (Math.PI / 2 - 0.4);
    L.add(c.root); LOC.court.push(c);
  }
  // blob shadows under feet (cheap contact shadow)
  for (const c of [...LOC.court, LOC.exec]) blob(c.root, 0, 0, 0, 0.65, 0.9);
  L.visible = false;
}

function hallFlicker(t) {
  for (const [f1, f2, ph] of LOC.flames) { const k = 1 + Math.sin(t * 13 + ph) * .1 + Math.sin(t * 7.3 + ph * 2) * .08; f1.scale.set(1 / k, k, 1 / k); f2.scale.set(1 / k, k * 1.1, 1 / k); f1.rotation.z = Math.sin(t * 6 + ph) * .08; f2.rotation.z = Math.sin(t * 9 + ph) * .1; }
  const dp = LOC.dust.geometry.attributes.position, b = LOC.dust.userData.base;
  for (let i = 0; i < dp.count; i++) { dp.setXYZ(i, b[i * 3] + Math.sin(t * .4 + i) * .25, b[i * 3 + 1] + Math.sin(t * .3 + i * 1.7) * .3 + ((t * .08 + i * .037) % 1) * 0.5, b[i * 3 + 2] + Math.cos(t * .35 + i * 2.3) * .25); }
  dp.needsUpdate = true;
}
