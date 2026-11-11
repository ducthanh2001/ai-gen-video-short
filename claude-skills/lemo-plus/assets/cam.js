// lemo-plus cam.js: named camera moves, easing, retiming and transitions as PURE FUNCTIONS OF TIME.
// For Lemo-Opuscar pages that expose window.render(t): the same t always gives the same frame.
// Copy this file into the project folder and load it before your scene code:
//   <script src="cam.js"></script>            -> window.CAM, window.EASE, window.TR, window.retime
//   or: import './cam.js'  (it attaches to globalThis as well)
//
// 2D (Canvas / SVG): a camera is { x, y, zoom, rot } in WORLD units around the frame centre.
//   const c = CAM.dolly(CAM.base(960, 540), e, 1.0, 1.3);   CAM.apply(ctx, c, W, H);  ...draw the world...
//   SVG: group.setAttribute('transform', CAM.svg(c, W, H))
// Depth planes (parallax): CAM.plane(ctx, c, depth, W, H) before drawing a layer; depth 1 = the focus plane,
//   > 1 farther (moves less), < 1 nearer (moves more).
// three.js: CAM.three.* return plain {x,y,z} positions / targets / fov numbers; you copy them onto the camera.
//
// Adapted from cinecode's camera vocabulary (references/camera-moves.md, starter/camera.mjs) by Sarp Yildiz (MIT).
(function (root) {
  'use strict';
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = k => k * k * (3 - 2 * k);

  // ------------------------------------------------------------------ easing (k in 0..1)
  const EASE = {
    linear: k => clamp(k),
    in: k => { k = clamp(k); return k * k * k; },                    // gathering force; endings
    out: k => { k = clamp(k); return 1 - Math.pow(1 - k, 3); },       // fastest on frame 0: hook shots
    inOut: k => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
    inertia: k => { k = clamp(k); return 0.35 * k + 0.65 * smooth(k); }, // moving at frame 0 and at the cut (default)
    back: k => { k = clamp(k); const s = 1.70158; return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); },
  };

  // progress of time t through a shot [t0, t0+dur], eased
  function prog(t, t0, dur, ease = 'inertia') {
    const f = typeof ease === 'function' ? ease : EASE[ease] || EASE.inertia;
    return f(dur > 0 ? (t - t0) / dur : 1);
  }

  // ------------------------------------------------------------------ time remapping
  // retime(t, [[t1, speed1], [t2, speed2], ...]): from t1 the clock runs at speed1, from t2 at speed2...
  //   slow motion: [[1, 1], [1.4, 0.25]]   time-lapse: [[0, 24]]   freeze: [[2, 1], [2, 0]]
  // A ramp between two speeds is linear over `ramp` seconds (0.3–0.6 s reads as a punctuation).
  function retime(t, keys, ramp = 0) {
    if (!keys || !keys.length) return t;
    const ks = keys.slice().sort((a, b) => a[0] - b[0]);
    let out = Math.min(t, ks[0][0]), speed = ks[0][1];
    for (let i = 0; i < ks.length; i++) {
      const start = ks[i][0], end = i + 1 < ks.length ? ks[i + 1][0] : Infinity;
      if (t <= start) break;
      const prev = i > 0 ? ks[i - 1][1] : 1, s = ks[i][1];
      const seg = Math.min(t, end) - start;
      if (ramp > 0 && prev !== s) {
        const r = Math.min(seg, ramp);
        out += r * prev + (s - prev) * r * r / (2 * ramp) + Math.max(0, seg - ramp) * s;
      } else out += seg * s;
      speed = s;
    }
    return out;
  }

  // ------------------------------------------------------------------ seeded noise for handheld
  function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function noise1(x, seed = 0) {           // smooth value noise, -1..1
    const i = Math.floor(x), f = x - i;
    return lerp(hash(i + seed * 101.3), hash(i + 1 + seed * 101.3), smooth(f)) * 2 - 1;
  }
  function wobble(t, seed, freq) {         // low-frequency drift: two octaves, never per-frame jitter
    return 0.7 * noise1(t * freq, seed) + 0.3 * noise1(t * freq * 2.3, seed + 7);
  }

  // ------------------------------------------------------------------ 2D camera
  const CAM = {
    base: (x = 0, y = 0, zoom = 1, rot = 0) => ({ x, y, zoom, rot, blur: 0, focus: 1 }),
    with: (c, o) => Object.assign({}, c, o),

    // turns on the spot: in 2D the world slides with no parallax. dx in frames of width (0.4 = 40% of W)
    pan: (c, e, from, to, W = 1920) => CAM.with(c, { x: c.x + lerp(from, to, e) * W }),
    tilt: (c, e, from, to, H = 1080) => CAM.with(c, { y: c.y + lerp(from, to, e) * H }),
    // travels toward / away: scale changes (use CAM.plane for parallax). 1.3 -> 0.8 etc. are zoom factors
    dolly: (c, e, z0, z1) => CAM.with(c, { zoom: c.zoom * lerp(z0, z1, e) }),
    zoom: (c, e, z0, z1) => CAM.with(c, { zoom: c.zoom * lerp(z0, z1, e), flat: true }), // flat: planes ignore depth
    truck: (c, e, from, to, W = 1920) => CAM.with(c, { x: c.x + lerp(from, to, e) * W, truck: true }),
    crane: (c, e, from, to, H = 1080) => CAM.with(c, { y: c.y - lerp(from, to, e) * H }),
    roll: (c, e, deg0, deg1) => CAM.with(c, { rot: c.rot + lerp(deg0, deg1, e) * Math.PI / 180 }),
    // pushTo: dolly toward an off-centre detail (world point px,py), ending on it at zoom z1
    pushTo: (c, e, px, py, z0, z1) => CAM.with(c, { x: lerp(c.x, px, e), y: lerp(c.y, py, e), zoom: c.zoom * lerp(z0, z1, e) }),
    // pull-back reveal: start tight on a detail, travel out to the context
    pullBack: (c, e, px, py, zTight, zWide) => CAM.with(c, { x: lerp(px, c.x, e), y: lerp(py, c.y, e), zoom: c.zoom * lerp(zTight, zWide, e) }),
    // orbit in 2.5D: planes slide against each other as if circling; degrees of arc
    orbit: (c, e, deg0, deg1) => CAM.with(c, { orbit: lerp(deg0, deg1, e) }),
    // dolly zoom (vertigo): the focus plane keeps its size, far planes grow / shrink. Once per film.
    dollyZoom: (c, e, bg0, bg1) => CAM.with(c, { vertigo: lerp(bg0, bg1, e) }),
    // handheld: amount 0.2–0.4 drone / hand, 0.5–1 subtle presence, 3+ an impact. Seeded, smooth.
    handheld: (c, t, amount = 1, seed = 1) => CAM.with(c, {
      x: c.x + wobble(t, seed, 0.9) * 6 * amount,
      y: c.y + wobble(t, seed + 3, 0.7) * 4 * amount,
      rot: c.rot + wobble(t, seed + 9, 0.5) * 0.004 * amount,
    }),
    // rack focus: focus distance goes from plane depth d0 to d1; blurFor(depth) gives a px blur for a layer
    rackFocus: (c, e, d0, d1, maxBlur = 10) => CAM.with(c, { focus: lerp(d0, d1, e), maxBlur }),
    blurFor: (c, depth) => c.focus == null ? 0 : Math.min(c.maxBlur || 10, Math.abs(Math.log(depth / c.focus)) * (c.maxBlur || 10)),
    // follow: trail a moving subject a fraction of a second, like an operator. subjectAt(t) -> {x,y}
    follow: (c, t, subjectAt, lag = 0.25, lead = 0) => {
      const p = subjectAt(t - lag), q = subjectAt(t - lag + 0.04);
      return CAM.with(c, { x: p.x + (q.x - p.x) * lead * 25, y: p.y + (q.y - p.y) * lead * 25 });
    },
    // path: one continuous shot through keys [{t, x, y, zoom, rot?}], Catmull-Rom between keys, never stops on one
    path: (keys, t) => {
      const k = keys.slice().sort((a, b) => a.t - b.t);
      if (t <= k[0].t) return CAM.base(k[0].x, k[0].y, k[0].zoom, k[0].rot || 0);
      if (t >= k[k.length - 1].t) { const l = k[k.length - 1]; return CAM.base(l.x, l.y, l.zoom, l.rot || 0); }
      let i = 0; while (k[i + 1].t < t) i++;
      const p0 = k[Math.max(0, i - 1)], p1 = k[i], p2 = k[i + 1], p3 = k[Math.min(k.length - 1, i + 2)];
      const u = (t - p1.t) / (p2.t - p1.t);
      const cr = (a, b, c2, d) => 0.5 * ((2 * b) + (-a + c2) * u + (2 * a - 5 * b + 4 * c2 - d) * u * u + (-a + 3 * b - 3 * c2 + d) * u * u * u);
      const f = n => cr(p0[n] ?? 0, p1[n] ?? 0, p2[n] ?? 0, p3[n] ?? 0);
      return CAM.base(f('x'), f('y'), Math.max(0.01, f('zoom')), f('rot'));
    },

    // apply to a Canvas 2D context (call inside ctx.save()/restore())
    apply(ctx, c, W, H) {
      ctx.translate(W / 2, H / 2);
      ctx.rotate(c.rot || 0);
      ctx.scale(c.zoom, c.zoom);
      ctx.translate(-c.x, -c.y);
    },
    // a depth plane: depth 1 = focus plane. Farther planes move and scale less (parallax).
    plane(ctx, c, depth, W, H) {
      const d = Math.max(0.05, depth);
      let z = c.flat ? c.zoom : 1 + (c.zoom - 1) / d;
      if (c.vertigo) z *= Math.pow(c.vertigo, 1 - 1 / d);          // far planes warp, the focus plane holds
      const ox = (c.orbit || 0) * 8 * (1 - 1 / d);                  // orbit: planes slide against each other
      ctx.translate(W / 2, H / 2);
      ctx.rotate(c.rot || 0);
      ctx.scale(z, z);
      ctx.translate(-c.x / d + ox, -c.y / d);
    },
    svg: (c, W, H) => `translate(${W / 2} ${H / 2}) rotate(${(c.rot || 0) * 180 / Math.PI}) scale(${c.zoom}) translate(${-c.x} ${-c.y})`,
  };

  // ------------------------------------------------------------------ three.js helpers (plain numbers)
  const V = (x, y, z) => ({ x, y, z });
  CAM.three = {
    dolly: (pos, tgt, e, d0, d1) => {           // along the line from target to camera, distance d0 -> d1
      const dx = pos.x - tgt.x, dy = pos.y - tgt.y, dz = pos.z - tgt.z, L = Math.hypot(dx, dy, dz) || 1, d = lerp(d0, d1, e);
      return V(tgt.x + dx / L * d, tgt.y + dy / L * d, tgt.z + dz / L * d);
    },
    orbit: (tgt, e, r, deg0, deg1, h = 0) => { const a = lerp(deg0, deg1, e) * Math.PI / 180; return V(tgt.x + Math.sin(a) * r, tgt.y + h, tgt.z + Math.cos(a) * r); },
    crane: (pos, e, h0, h1) => V(pos.x, pos.y + lerp(h0, h1, e), pos.z),
    truck: (pos, e, x0, x1) => V(pos.x + lerp(x0, x1, e), pos.y, pos.z),
    pan: (pos, tgt, e, deg0, deg1) => {          // turn the target around the camera (no parallax)
      const a = lerp(deg0, deg1, e) * Math.PI / 180, dx = tgt.x - pos.x, dz = tgt.z - pos.z;
      return V(pos.x + dx * Math.cos(a) - dz * Math.sin(a), tgt.y, pos.z + dx * Math.sin(a) + dz * Math.cos(a));
    },
    zoom: (e, fov0, fov1) => lerp(fov0, fov1, e),
    // dolly zoom: keep the subject's size while the distance changes. returns {dist, fov}
    dollyZoom: (e, d0, d1, fov0) => {
      const d = lerp(d0, d1, e), w = 2 * d0 * Math.tan(fov0 * Math.PI / 360);
      return { dist: d, fov: 2 * Math.atan(w / (2 * d)) * 180 / Math.PI };
    },
    handheld: (t, amount = 1, seed = 1) => V(wobble(t, seed, 0.9) * 0.02 * amount, wobble(t, seed + 3, 0.7) * 0.015 * amount, 0),
    rackFocus: (e, d0, d1) => lerp(d0, d1, e),
  };

  // ------------------------------------------------------------------ transitions (k = 0..1 through the transition)
  // Each returns what to draw: alphas, offsets, a clip radius. The incoming scene is B.
  const TR = {
    cut: k => ({ a: k < 1 ? 1 : 0, b: k >= 1 ? 1 : 0 }),
    dissolve: k => ({ a: 1 - EASE.inOut(k), b: EASE.inOut(k) }),                     // 0.4–1.5 s: time passing
    whip: (k, W = 1920, dir = 1) => {                                                  // 0.2–0.35 s: energy
      const e = EASE.inOut(k);
      return { a: k < 0.5 ? 1 : 0, b: k >= 0.5 ? 1 : 0, ax: -dir * e * W, bx: dir * (1 - e) * W, blur: Math.sin(Math.PI * k) * 60 };
    },
    iris: (k, W = 1920, H = 1080) => ({ r: EASE.inOut(k) * Math.hypot(W, H) / 2 }),    // clip B to a circle of r
    wipe: (k, W = 1920, dir = 1) => ({ edge: dir > 0 ? EASE.inOut(k) * W : (1 - EASE.inOut(k)) * W }),
    match: (k, dx = 0, dy = 0) => ({ bx: dx * (1 - EASE.out(k)), by: dy * (1 - EASE.out(k)) }), // B settles from A's position
  };

  root.CAM = CAM; root.EASE = EASE; root.TR = TR; root.retime = retime; root.camProg = prog;
  if (typeof module !== 'undefined' && module.exports) module.exports = { CAM, EASE, TR, retime, prog };
})(typeof globalThis !== 'undefined' ? globalThis : this);
