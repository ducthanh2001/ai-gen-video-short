// props.js: the bronze box (with gears, dial, crank), the lump, flat gears
'use strict';
const BRONZE = () => std(0xb87333, 0.34, 0.9, { envInt: 1.2 });
const BRASS = () => std(0xd9a441, 0.3, 0.9, { envInt: 1.2 });
const DARKB = () => std(0x6a4524, 0.45, 0.8, { envInt: 1.0 });

function dialTex(maxV = 60, hi = 40) {
  return ctex(512, 512, (x) => {
    x.fillStyle = '#f6ead0'; x.beginPath(); x.arc(256, 256, 250, 0, 7); x.fill();
    x.strokeStyle = '#6a4524'; x.lineWidth = 12; x.beginPath(); x.arc(256, 256, 244, 0, 7); x.stroke();
    const a0 = Math.PI * .75, span = Math.PI * 1.5;
    for (let v = 0; v <= maxV; v++) { const a = a0 + v / maxV * span, big = v % 10 === 0, r1 = big ? 196 : 214, r2 = 232; x.strokeStyle = '#2a1a14'; x.lineWidth = big ? 9 : 4; x.beginPath(); x.moveTo(256 + Math.cos(a) * r1, 256 + Math.sin(a) * r1); x.lineTo(256 + Math.cos(a) * r2, 256 + Math.sin(a) * r2); x.stroke(); }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let v = 0; v <= maxV; v += 10) { const a = a0 + v / maxV * span, hl = v === hi; x.font = (hl ? 'bold 84px' : 'bold 58px') + ' Impact, Arial Black, sans-serif'; x.fillStyle = hl ? '#d6341f' : '#2a1a14'; x.fillText(String(v), 256 + Math.cos(a) * 152, 256 + Math.sin(a) * 152); }
    x.font = 'bold 40px Impact, Arial Black, sans-serif'; x.fillStyle = '#6a4524'; x.fillText('DAYS', 256, 380);
    x.fillStyle = '#b87333'; x.beginPath(); x.arc(256, 256, 26, 0, 7); x.fill();
  });
}

// the box: a CLOSED brass case (floor, four walls, closed lid with hinges, clasp and handle). The only openings are a deliberate glass window
// in the front (+z) showing two gear trains on a dark back plate, and the front dial with a small sun and moon indicator. Crank on the +x side.
function makeBox(o = {}) {
  const root = new T.Group(); const bz = BRONZE(), br = BRASS(), dk = std(0x2a1a10, .8, .2);
  const Wd = 0.9, Ht = 0.5, Dp = 0.62, th = 0.045, zf = Dp / 2 - th / 2;
  const body = new T.Group(); root.add(body);
  mesh(roundedBox(Wd, th * 1.4, Dp, 0.02), bz, { parent: body, pos: [0, th * .7, 0], ol: 0.012 });                                // floor
  mesh(roundedBox(Wd, Ht, th, 0.018), bz, { parent: body, pos: [0, Ht / 2, -zf], ol: 0.012 });                                    // back
  for (const s of [-1, 1]) mesh(roundedBox(th, Ht, Dp, 0.018), bz, { parent: body, pos: [s * (Wd / 2 - th / 2), Ht / 2, 0], ol: 0.012 });   // sides
  // front wall around the window (window x -0.41..0.0, y 0.07..0.43)
  mesh(roundedBox(Wd, 0.07, th, 0.015), bz, { parent: body, pos: [0, 0.465, zf], ol: 0.01 }); mesh(roundedBox(Wd, 0.07, th, 0.015), bz, { parent: body, pos: [0, 0.035, zf], ol: 0.01 });
  mesh(roundedBox(0.04, 0.36, th, 0.01), bz, { parent: body, pos: [-0.43, 0.25, zf], ol: 0.01 }); mesh(roundedBox(0.45, 0.36, th, 0.015), bz, { parent: body, pos: [0.225, 0.25, zf], ol: 0.01 });
  for (const [x, y, w, h] of [[-0.205, 0.44, 0.45, 0.02], [-0.205, 0.06, 0.45, 0.02], [-0.415, 0.25, 0.02, 0.4], [0.005, 0.25, 0.02, 0.4]]) mesh(roundedBox(w, h, 0.02, 0.006), br, { parent: body, pos: [x, y, zf + th / 2], ol: 0.006 });   // bezel
  const glass = new T.Mesh(new T.PlaneGeometry(0.41, 0.36), new T.MeshPhysicalMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.1, roughness: 0.05, depthWrite: false, envMapIntensity: 1.4 })); glass.position.set(-0.205, 0.25, zf + th / 2 - 0.002); body.add(glass);
  // closed lid, hinges, clasp, handle
  mesh(roundedBox(Wd + 0.03, 0.06, Dp + 0.03, 0.02), bz, { parent: body, pos: [0, Ht + 0.03, 0], ol: 0.012 });
  mesh(roundedBox(Wd + 0.04, 0.025, 0.05, 0.01), br, { parent: body, pos: [0, Ht + 0.012, zf + 0.012] });
  for (const s of [-1, 1]) mesh(new T.CylinderGeometry(0.026, 0.026, 0.1, 12), br, { parent: body, pos: [s * 0.28, Ht + 0.04, -Dp / 2 - 0.005], rot: [0, 0, Math.PI / 2], ol: 0.01 });
  mesh(roundedBox(0.09, 0.075, 0.03, 0.01), br, { parent: body, pos: [0, Ht - 0.01, Dp / 2 + 0.018], ol: 0.01 });
  mesh(new T.TorusGeometry(0.075, 0.016, 8, 20, Math.PI), br, { parent: body, pos: [0, Ht + 0.06, 0], ol: 0.01 });
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mesh(new T.SphereGeometry(0.028, 10, 8), br, { parent: body, pos: [x * (Wd / 2 - .015), Ht + 0.03, z * (Dp / 2 - .015)] });
  // inside: dark back plate and two gear trains (vertical, facing the window)
  mesh(new T.PlaneGeometry(0.44, 0.38), dk, { parent: body, pos: [-0.205, 0.25, -0.2], cast: false });
  const gm = [std(0xe8b33f, .3, .9, { emissive: 0xff9a30, ei: .3, envInt: 1.2 }), std(0xc98a3a, .35, .9, { emissive: 0xc06a20, ei: .25, envInt: 1.2 })];
  const m = 0.008;
  const build = (spec, z, start) => {
    const G = []; let px = start[0], py = start[1];
    spec.forEach(([N, ang], i) => {
      const r = N * m; if (i > 0) { const rp = G[i - 1].N * m; px += Math.cos(ang) * (rp + r); py += Math.sin(ang) * (rp + r); }
      const pg = group(body, [px, py, z]); const gmesh = mesh(gearGeo(N, r, 0.016, 0.022, { spokes: N >= 14 ? 5 : 0, hole: 0.01, spokeR: 0.18 }), gm[i % 2], { parent: pg, ol: false });
      mesh(new T.CylinderGeometry(0.008, 0.008, 0.12, 8), bz, { parent: pg, rot: [Math.PI / 2, 0, 0], cast: false });
      G.push({ g: gmesh, N, x: px, y: py, ang: i > 0 ? Math.atan2(py - G[i - 1].y, px - G[i - 1].x) : 0 });
    }); return G;
  };
  const G1 = build([[18, 0], [12, -0.5], [16, 0.35]], 0.12, [-0.25, 0.27]), G2 = build([[12, 0], [18, 0.6], [10, -0.4]], 0.04, [-0.3, 0.13]);
  root.userData.gears = G1; root.userData.chains = [G1, G2];
  // dial on the front, with the needle
  const dx = 0.26, dy = 0.19;
  mesh(new T.CylinderGeometry(0.155, 0.155, 0.03, 40), br, { parent: body, pos: [dx, dy, Dp / 2 + 0.003], rot: [Math.PI / 2, 0, 0], ol: 0.01 });
  const face = new T.Mesh(new T.CircleGeometry(0.14, 48), new T.MeshStandardMaterial({ map: dialTex(), roughness: 0.4, metalness: 0 })); face.position.set(dx, dy, Dp / 2 + 0.019); body.add(face);
  mesh(new T.TorusGeometry(0.147, 0.011, 8, 40), bz, { parent: body, pos: [dx, dy, Dp / 2 + 0.02] });
  const needle = group(body, [dx, dy, Dp / 2 + 0.028]);
  mesh(new T.BoxGeometry(0.011, 0.115, 0.005), std(0xb82a1c, .4), { parent: needle, pos: [0, 0.055, 0], cast: false });
  mesh(new T.SphereGeometry(0.016, 10, 8), br, { parent: needle, cast: false });
  root.userData.needle = needle;
  // small sun and moon indicator above the dial
  const mx = dx, my = 0.405;
  mesh(new T.CylinderGeometry(0.058, 0.058, 0.025, 28), br, { parent: body, pos: [mx, my, Dp / 2 + 0.003], rot: [Math.PI / 2, 0, 0], ol: 0.008 });
  const miniFace = new T.Mesh(new T.CircleGeometry(0.05, 28), new T.MeshStandardMaterial({ color: 0x1d2a52, roughness: .4, metalness: .2 })); miniFace.position.set(mx, my, Dp / 2 + 0.017); body.add(miniFace);
  const mini = group(body, [mx, my, Dp / 2 + 0.026]); const ms = group(mini), mm = group(mini);
  mesh(new T.SphereGeometry(0.016, 12, 8), std(0xffc23a, .3, 0, { emissive: 0xffa020, ei: 1.4 }), { parent: ms, pos: [0, 0.032, 0.004], cast: false });
  mesh(new T.SphereGeometry(0.013, 12, 8), std(0xf2f4f8, .3, 0, { emissive: 0xaabbdd, ei: .6 }), { parent: mm, pos: [0, -0.026, 0.004], cast: false });
  root.userData.mini = { ms, mm };
  // crank on +x
  const crank = group(body, [Wd / 2 + 0.02, 0.22, 0.0]);
  mesh(new T.CylinderGeometry(0.02, 0.02, 0.1, 10), br, { parent: crank, rot: [0, 0, Math.PI / 2], pos: [0.02, 0, 0] });
  const arm = group(crank, [0.075, 0, 0]);
  mesh(roundedBox(0.03, 0.16, 0.03, 0.012), br, { parent: arm, pos: [0, 0.07, 0], ol: 0.01 });
  mesh(new T.CylinderGeometry(0.03, 0.03, 0.09, 14), std(0x7a3a1c, 0.5), { parent: arm, pos: [0.06, 0.15, 0], rot: [0, 0, Math.PI / 2], ol: 0.01 });
  root.userData.crank = crank;
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mesh(new T.SphereGeometry(0.035, 10, 8), bz, { parent: body, pos: [x * 0.38, -0.01, z * 0.25], scl: [1, .6, 1] });
  root.userData.setAngle = (a, nv) => updateBoxGears(root, a, nv);
  root.userData.setAngle(0, 0);
  return root;
}

// proper meshing for each chain: gear i is placed in the gap of gear i-1 at the contact angle
function updateBoxGears(box, a, needleV) {
  box.userData.crank.rotation.x = a;
  box.userData.chains.forEach((G, ci) => {
    let phi = a * (ci ? -0.9 : 0.7); G[0].g.rotation.z = phi;
    for (let i = 1; i < G.length; i++) { const A = G[i - 1], B = G[i], al = B.ang; const phiB = al + Math.PI - Math.PI / B.N - (phi - al) * A.N / B.N; B.g.rotation.z = phiB; phi = phiB; }
  });
  box.userData.needle.rotation.z = -(-135 + needleV / 60 * 270) * Math.PI / 180;
  if (box.userData.mini) { box.userData.mini.ms.rotation.z = -a * 0.35; box.userData.mini.mm.rotation.z = -a * 2.6 + 1; }
}

function smoothNormals(g) {
  g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal, m = new Map(), keys = [];
  for (let i = 0; i < p.count; i++) { const k = p.getX(i).toFixed(4) + ',' + p.getY(i).toFixed(4) + ',' + p.getZ(i).toFixed(4); keys.push(k); const a = m.get(k) || [0, 0, 0]; a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); m.set(k, a); }
  for (let i = 0; i < p.count; i++) { const a = m.get(keys[i]), l = Math.hypot(a[0], a[1], a[2]) || 1; n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
}
// ---------- the corroded lump ----------
function makeLump(seed = 4, size = 1, opt = {}) {
  const r = rng(seed), g = new T.IcosahedronGeometry(0.5, 5), p = g.attributes.position, col = new Float32Array(p.count * 3), c = new T.Color(), v = new T.Vector3();
  const pal = [0x3f7f64, 0x5b9a74, 0x6e5a3a, 0x8a6a3e, 0x2f5d4f, 0x9bb59a];
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), p.getZ(i)); const n = v.clone().normalize();
    const big = vnoise(n.x * 2.2 + seed, n.y * 2.2 + n.z * 1.3) , mid = vnoise(n.x * 6 + 9, n.z * 6 + n.y * 4) , fine = vnoise(n.x * 18 + 3, n.y * 18 + n.z * 11);
    const rr = 0.5 * (0.82 + big * 0.42 + mid * 0.12 + fine * 0.04) * (1 + 0.1 * Math.sin(n.y * 5 + seed)) ;
    v.copy(n).multiplyScalar(rr * (1 + (n.y < -0.55 ? -0.12 * (-n.y - 0.55) : 0)));
    p.setXYZ(i, v.x * 1.1, v.y * 0.85, v.z);
    const pick = Math.floor(clamp(mid * 0.6 + fine * 0.5 + big * 0.4 - 0.05, 0, .999) * pal.length);
    c.setHex(pal[pick]); const sh = 0.8 + fine * 0.4; col[i * 3] = c.r * sh; col[i * 3 + 1] = c.g * sh; col[i * 3 + 2] = c.b * sh;
  }
  g.setAttribute('color', new T.BufferAttribute(col, 3)); smoothNormals(g);
  const root = new T.Group();
  const lump = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.05, flatShading: false })); lump.castShadow = lump.receiveShadow = true; root.add(lump);
  addOutline(lump, 0.012);
  // barnacles / coral bits
  for (let i = 0; i < 16; i++) { const a = r() * 6.28, b = Math.acos(r() * 2 - 1); const n = V3(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)); const m = new T.Mesh(new T.ConeGeometry(0.03 + r() * .03, 0.07 + r() * .06, 7), std(0xe9e1cf, 0.9)); m.position.copy(n).multiplyScalar(0.45); m.quaternion.setFromUnitVectors(Y_UP, n); m.castShadow = true; root.add(m); }
  if (opt.gear) {                      // a brass gear edge poking out of the crust
    const gg = new T.Group(); gg.position.set(0.2, 0.12, 0.38); gg.rotation.set(0.2, -0.45, 0.35); root.add(gg);
    mesh(gearGeo(18, 0.21, 0.06, 0.06, { hole: 0.02, spokes: 0 }), std(0xe8b33f, 0.22, 0.95, { envInt: 1.5 }), { parent: gg, pos: [0, 0.0, 0], ol: 0.008 });
    root.userData.gearTip = gg;
  }
  root.scale.setScalar(size); return root;
}
