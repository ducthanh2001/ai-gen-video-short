// main.js: shot machinery, lighting rig, captions, render contract (window.READY / window.captureFrame)
'use strict';

function applyLight(P, kid) {
  scene.background = new T.Color(...(P.bg ?? [0, 0, 0]));
  hemi.color.set(P.hemi?.[0] ?? 0xffffff); hemi.groundColor.set(P.hemi?.[1] ?? 0x888888); hemi.intensity = P.hemi?.[2] ?? 0.8;
  const s = P.sun ?? { int: 0 };
  sun.color.set(s.col ?? 0xffffff); sun.intensity = s.int ?? 0;
  const tg = s.target ?? [0, 0, 0], off = s.pos ?? [-4, 9, 8];
  sun.target.position.set(...tg); sun.position.set(tg[0] + off[0], tg[1] + off[1], tg[2] + off[2]);
  const e = s.ext ?? 8, sc = sun.shadow.camera; sc.left = -e; sc.right = e; sc.top = e; sc.bottom = -e; sc.near = 0.5; sc.far = (s.far ?? 40); sc.updateProjectionMatrix();
  sun.castShadow = (s.int ?? 0) > 0 && s.shadow !== false;
  const r = P.rim ?? { int: 0 }; rim.color.set(r.col ?? 0xffffff); rim.intensity = r.int ?? 0; const rt = r.target ?? tg, ro = r.pos ?? [0, 4, -8]; rim.target.position.set(...rt); rim.position.set(rt[0] + ro[0], rt[1] + ro[1], rt[2] + ro[2]);
  for (let i = 0; i < 3; i++) { const q = P.pts?.[i]; const p = pts[i]; if (q) { p.color.set(q.col); p.intensity = q.int; p.distance = q.dist ?? 10; p.position.set(...q.p); } else p.intensity = 0; }
  scene.fog.color.set(P.fog?.[0] ?? 0x000000); scene.fog.density = P.fog?.[1] ?? 0;
  scene.environment = P.env ? ENV[P.env] : null; scene.environmentIntensity = P.envInt ?? 0.5;
  const g = P.grade ?? {};
  U.tint.value.set(...(g.tint ?? [1, 1, 1])); U.sat.value = g.sat ?? 1.1; U.con.value = g.con ?? 1.04; U.vig.value = g.vig ?? 0.32; U.expo.value = g.expo ?? 1.0; U.bloom.value = g.bloom ?? 0.25; U.lift.value.set(...(g.lift ?? [0, 0, 0]));
  U.grain.value = g.grain ?? 0.012;
}

function shotAt(t) { for (let i = SHOTS.length - 1; i >= 0; i--) if (t >= SHOTS[i].t0 - 1e-6) return SHOTS[i]; return SHOTS[0]; }

// ---------- captions ----------
const CAP_BASE = 0.788, NOCAP = !!Q.get('nocap');
function drawCaptions(ctx, t) {
  if (NOCAP) return null;
  const cap = TL.caps.find(c => t >= c.t0 - 1e-6 && t < c.t1);
  if (!cap) return null;
  const capH = 0.055 * H; let fs = capH / 0.74;
  ctx.font = `${fs}px Impact, "Arial Black", sans-serif`; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  let gap = fs * 0.28, ws = cap.w.map(w => ctx.measureText(w.t).width), tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  if (tot > 0.8 * W) { const k = 0.8 * W / tot; fs *= k; ctx.font = `${fs}px Impact, "Arial Black", sans-serif`; gap = fs * 0.28; ws = cap.w.map(w => ctx.measureText(w.t).width); tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1); }
  let x = (W - tot) / 2; const y = CAP_BASE * H;           // block centre at 76 percent of the frame height (YouTube Shorts covers the bottom 18 to 20 percent)
  const box = [x, y - capH, tot, capH];
  const stroke = capH * 0.14;
  for (let i = 0; i < cap.w.length; i++) {
    ctx.lineWidth = stroke * 2; ctx.strokeStyle = '#000'; ctx.strokeText(cap.w[i].t, x, y);
    ctx.fillStyle = cap.w[i].k ? '#ff9f1c' : '#fff'; ctx.fillText(cap.w[i].t, x, y);
    x += ws[i] + gap;
  }
  return box;
}

// ---------- the frame ----------
let curShot = null;
function setupShot(s) {
  for (const k in LOC) { const v = LOC[k]; if (v && v.isObject3D && v.userData.name) v.visible = s.locs.includes(v.userData.name); }
}
function renderFrame(i) {
  const TH = window.THUMB;
  const t = TH ? TH.t : Math.min(i / FPS, TOTAL - 1e-4);
  TIMEU.value = t; U.frame.value = i;
  const s = TH || shotAt(t), u = TH ? TH.u : clamp((t - s.t0) / (s.t1 - s.t0));
  setupShot(s);
  applyLight(typeof s.light === 'function' ? s.light(u, t) : s.light);
  const c = s.cam(u, t, s); applyCam(c, t);
  if (window.resetVis) resetVis();
  s.update && s.update(u, t, s);
  scene.updateMatrixWorld(true);
  const gr = typeof s.grade === 'function' ? s.grade(u, t, s) : null; if (gr) { if (gr.tint) U.tint.value.set(...gr.tint); if (gr.expo !== undefined) U.expo.value = gr.expo; if (gr.sat !== undefined) U.sat.value = gr.sat; if (gr.vig !== undefined) U.vig.value = gr.vig; if (gr.bloom !== undefined) U.bloom.value = gr.bloom; }
  U.fade.value = 0; U.flash.value = 0; U.whip.value.set(0, 0);
  if (s.post) s.post(u, t, s);
  // fade out at the very end
  if (t > TOTAL - 0.8) U.fade.value = Math.max(U.fade.value, 0.78 * sstep(TOTAL - 0.8, TOTAL - 0.03, t));
  renderer.setRenderTarget(rtColor); renderer.clear(); renderer.render(scene, camera);
  postProcess();
  g2.clearRect(0, 0, W, H); g2.drawImage(canvas, 0, 0);
  if (s.over) s.over(g2, u, t, s, c);
  const box = drawCaptions(g2, t);
  return { s, u, t, box };
}
window.renderFrame = renderFrame;
window.captureFrame = i => { renderFrame(i); return out2.toDataURL('image/jpeg', 0.93); };
window.captureAt = t => { const r = renderFrame(Math.round(t * FPS)); return out2.toDataURL('image/png'); };
window.shotsInfo = () => SHOTS.map(s => ({ id: s.id, t0: s.t0, t1: s.t1 }));
window.READY = (async () => {
  if (document.fonts && document.fonts.load) { try { await document.fonts.load('40px Impact'); } catch (e) { } }
  buildAll();
  SHOTS.sort((a, b) => a.t0 - b.t0);
  for (let k = 0; k < SHOTS.length; k++) SHOTS[k].t1 = k + 1 < SHOTS.length ? SHOTS[k + 1].t0 : TOTAL;
  renderFrame(0);
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return { frames: FRAMES, fps: FPS, width: W, height: H, renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'webgl2' };
})();
