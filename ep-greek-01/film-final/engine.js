// Scene engine: antique map + stage backgrounds, stickers, props, camera, captions, chapter chips, progress bar.
const W = innerWidth, H = innerHeight, cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const SX = W / 1920, GOLD = '#ffd36a';
let seed = 5; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x), cl = x => Math.max(0, Math.min(1, x));
const backOut = x => { x = cl(x); const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const easeOut = x => 1 - Math.pow(1 - cl(x), 3);
const SHOTS = compileShots(window.SHOT_DEFS);

// ------------------------------------------------------------ map
const KPX = 420, COS = Math.cos(37 * Math.PI / 180);
const P = (lon, lat) => [(lon - 25) * COS * KPX, -(lat - 37) * KPX];
const rings = window.LAND.map(r => r.map(([lo, la]) => P(lo, la)));
const landPath = new Path2D(); const pathOf = (pt, r) => { pt.moveTo(r[0][0], r[0][1]); for (let i = 1; i < r.length; i++) pt.lineTo(r[i][0], r[i][1]); pt.closePath(); };
rings.forEach(r => pathOf(landPath, r));
const creteRing = window.LAND.findIndex(r => { const xs = r.map(c => c[0]), ys = r.map(c => c[1]); return Math.min(...xs) > 23 && Math.max(...xs) < 26.5 && Math.min(...ys) > 34.8 && Math.max(...ys) < 35.8; });
const cretePath = new Path2D(); pathOf(cretePath, rings[creteRing]);
const RB = rings.map(r => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of r) { if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > d) d = y; } return [a, b, c, d]; });
function inLand(x, y) { for (let k = 0; k < rings.length; k++) { const b = RB[k]; if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue; const r = rings[k]; let ins = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; } if (ins) return true; } return false; }
const GLYPHS = []; for (let lo = 5.5; lo < 44.5; lo += 0.22) for (let la = 30; la < 49.5; la += 0.22) { const [x, y] = P(lo + (rnd() - .5) * .18, la + (rnd() - .5) * .18); if (rnd() < 0.36 && inLand(x, y)) GLYPHS.push([x, y, 26 + rnd() * 26]); }
const mk = (draw) => { const c = document.createElement('canvas'); c.width = c.height = 256; draw(c.getContext('2d')); return ctx.createPattern(c, 'repeat'); };
const NOISE = mk(x => { for (let i = 0; i < 3500; i++) { x.fillStyle = `rgba(${rnd() < .5 ? '60,40,10' : '255,250,230'},${rnd() * .10})`; x.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 2, 1 + rnd() * 2); } });
const HATCH = (() => { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 4; x.beginPath(); x.moveTo(-4, 28); x.lineTo(28, -4); x.stroke(); return ctx.createPattern(c, 'repeat'); })();
const STARS = Array.from({ length: 160 }, () => [rnd() * 1920, rnd() * 1080, rnd() * 2.2 + 0.6, rnd() * 6.3]);
const EMBERS = Array.from({ length: 50 }, () => [rnd() * 1920, rnd(), rnd() * 5 + 2, rnd() * 6.3]);
const IMG = {}; (window.IMAGES || []).forEach(([k, src]) => { const im = new Image(); im.src = src; IMG[k] = im; });

function mapView(cam) { const [x, y] = P(cam[0], cam[1]); return { cx: x, cy: y, z: cam[2] * SX }; }
function mapScreen(lon, lat, cam) { const v = mapView(cam), [x, y] = P(lon, lat); return [W / 2 + (x - v.cx) * v.z, H / 2 + (y - v.cy) * v.z]; }
function drawMapBG(cam, t, hl) {
  const v = mapView(cam), z = v.z, half = Math.max(W, H) / z;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-v.cx, -v.cy);
  ctx.fillStyle = '#76a1ab'; ctx.fillRect(v.cx - half, v.cy - half, half * 2, half * 2);
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 3; for (let lo = 0; lo <= 50; lo += 1) { const [x] = P(lo, 0); ctx.beginPath(); ctx.moveTo(x, v.cy - half); ctx.lineTo(x, v.cy + half); ctx.stroke(); } for (let la = 25; la <= 55; la += 1) { const [, y] = P(0, la); ctx.beginPath(); ctx.moveTo(v.cx - half, y); ctx.lineTo(v.cx + half, y); ctx.stroke(); }
  ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(170,206,212,.55)'; ctx.lineWidth = 46; ctx.stroke(landPath); ctx.strokeStyle = 'rgba(190,222,226,.55)'; ctx.lineWidth = 22; ctx.stroke(landPath);
  ctx.save(); ctx.translate(10, 14); ctx.fillStyle = 'rgba(40,60,70,.28)'; ctx.fill(landPath); ctx.restore();
  ctx.fillStyle = '#dcc896'; ctx.fill(landPath); ctx.strokeStyle = '#8a7246'; ctx.lineWidth = 5; ctx.stroke(landPath);
  const vis = (x, y) => Math.abs(x - v.cx) < half && Math.abs(y - v.cy) < half;
  for (const [x, y, s] of GLYPHS) if (vis(x, y)) mount(x, y + s * 0.4, s * 0.55);
  if (hl && hl.crete) { ctx.save(); ctx.globalAlpha = hl.crete; ctx.fillStyle = '#c9623a'; ctx.fill(cretePath); ctx.fillStyle = HATCH; ctx.fill(cretePath); ctx.strokeStyle = '#7a2e18'; ctx.lineWidth = 6; ctx.stroke(cretePath); ctx.restore(); }
  ctx.restore();
}
// ------------------------------------------------------------ stage backgrounds
function stageView(cam) { return { cx: cam[0], cy: cam[1], z: cam[2] * (H / 1080) }; }
function stageScreen(x, y, cam) { const v = stageView(cam); return [W / 2 + (x - v.cx) * v.z, H / 2 + (y - v.cy) * v.z]; }
function drawStageBG(type, cam, t, sh) {
  const v = stageView(cam);
  if (type === 'parch') { const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 1.0); g.addColorStop(0, '#ecdcb0'); g.addColorStop(1, '#cdb67e'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  else if (type === 'night') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#080c2a'); g.addColorStop(1, '#262a66'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; for (const [x, y, r, ph] of STARS) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.6 + ph); ctx.beginPath(); ctx.arc(((x - v.cx * 0.15) % 1920 + 1920) % 1920 * SX, y * SX * 1.0 % H, r * SX, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  else if (type === 'chaos') { const g = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, H); g.addColorStop(0, '#3a1f5a'); g.addColorStop(1, '#07030f'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 9; i++) { const a = t * 0.25 + i * 0.7, r = 120 + i * 60; ctx.fillStyle = `rgba(${80 + i * 12},${40 + i * 8},${140 + i * 8},0.16)`; ctx.beginPath(); ctx.ellipse(W / 2 + Math.cos(a) * r * 0.8, H / 2 + Math.sin(a * 1.3) * r * 0.5, 200 + i * 25, 110 + i * 12, a, 0, 7); ctx.fill(); } }
  else if (type === 'hell') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1218'); g.addColorStop(1, '#5a1a0e'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ff9a3a'; for (const [x, y, r, ph] of EMBERS) { const yy = ((y - t * 0.05 * r * 0.2) % 1 + 1) % 1; ctx.globalAlpha = 0.6 * (1 - yy); ctx.beginPath(); ctx.arc(x * SX, yy * H, r * 0.7 * SX, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  else if (type === 'sky') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7fc0ee'); g.addColorStop(1, '#f4ecd2'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  else if (type === 'storm') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a2233'); g.addColorStop(1, '#3a4660'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(190,210,235,.28)'; ctx.lineWidth = 2; for (let i = 0; i < 70; i++) { const x = (i * 97 + t * 500) % (W + 200) - 100, y = ((i * 53 + t * 900) % (H + 100)) - 50; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y + 46); ctx.stroke(); } }
  else if (type === 'dark') { ctx.fillStyle = '#0b0805'; ctx.fillRect(0, 0, W, H); }
  else if (type === 'olympus') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8cc8f0'); g.addColorStop(1, '#f6eed6'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); const px = -v.cx * 0.08 * SX;
    for (const [x, y, s, sh] of [[200, 1080, 520, '#a9b4c4'], [760, 1080, 760, '#b9c2d0'], [1450, 1080, 560, '#a9b4c4'], [1880, 1080, 420, '#b0bacb']]) { ctx.save(); ctx.translate(px * 0.5, 0); ctx.fillStyle = sh; ctx.beginPath(); ctx.moveTo((x - s) * SX, y * SX); ctx.lineTo(x * SX, (y - s * 0.95) * SX); ctx.lineTo((x + s) * SX, y * SX); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f4f7fb'; ctx.beginPath(); ctx.moveTo((x - s * 0.22) * SX, (y - s * 0.74) * SX); ctx.lineTo(x * SX, (y - s * 0.95) * SX); ctx.lineTo((x + s * 0.22) * SX, (y - s * 0.74) * SX); ctx.lineTo((x + s * 0.08) * SX, (y - s * 0.7) * SX); ctx.lineTo((x - s * 0.06) * SX, (y - s * 0.76) * SX); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.globalAlpha = 0.9; for (const [x, y, s] of [[300, 260, 140], [1500, 200, 170], [980, 120, 110]]) { ctx.save(); ctx.translate((x + Math.sin(t * 0.2 + x) * 20) * SX + px, y * SX); ctx.scale(s * SX, s * SX); ctx.lineWidth = 0.05; ctx.strokeStyle = 'rgba(255,255,255,0)'; ctx.fillStyle = '#fff'; for (const [a, b, rr] of [[-0.45, 0.1, 0.3], [-0.1, -0.1, 0.4], [0.3, 0.0, 0.34], [0.55, 0.15, 0.25], [0.05, 0.18, 0.3]]) { ctx.beginPath(); ctx.arc(a, b, rr, 0, 7); ctx.fill(); } ctx.restore(); } ctx.globalAlpha = 1; }
  else if (type === 'cave') { ctx.fillStyle = '#1e120c'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, H * 0.42, 50 * SX, W / 2, H * 0.42, 620 * SX); g.addColorStop(0, '#7a5232'); g.addColorStop(1, '#2a1a10'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(160 * SX, H); for (let i = 0; i <= 20; i++) { const a = Math.PI * (1 - i / 20), r = 800 + 40 * Math.sin(i * 2.7); ctx.lineTo(W / 2 + Math.cos(a) * r * SX, H * 0.98 - Math.sin(a) * r * 0.95 * SX); } ctx.lineTo(W - 160 * SX, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#140c08'; for (let i = 0; i < 9; i++) { const x = (220 + i * 190) * SX, L = (60 + (i * 53) % 110) * SX; ctx.beginPath(); ctx.moveTo(x - 30 * SX, 0); ctx.lineTo(x, L + 120 * SX); ctx.lineTo(x + 30 * SX, 0); ctx.fill(); } ctx.fillStyle = 'rgba(255,200,120,.08)'; ctx.fillRect(0, H * 0.8, W, H * 0.2); }
  else if (type === 'section') { const eY = sh.earthY || 0.24, L = [[0, eY, '#9fd0f0', '#cfe8f6'], [eY, eY + 0.16, '#7aa84e', '#8a6a3e'], [eY + 0.16, 0.80, '#4a2e1e', '#2a1410'], [0.80, 1, '#3a0e0a', '#6a1a0e']]; for (const [a, b, c1, c2] of L) { const g = ctx.createLinearGradient(0, a * H, 0, b * H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, a * H, W, (b - a) * H); }
    ctx.fillStyle = '#5f9a3e'; ctx.fillRect(0, eY * H, W, 10 * SX); ctx.fillStyle = 'rgba(255,150,60,.5)'; for (const [x, y, r, ph] of EMBERS) { const yy = 0.82 + ((y - t * 0.03 * r * 0.2) % 1 + 1) % 1 * 0.18; ctx.beginPath(); ctx.arc(x * SX, yy * H, r * 0.6 * SX, 0, 7); ctx.fill(); }
    if (!sh.noLayerTags) { ctx.save(); ctx.font = `700 ${30 * SX}px "Segoe UI",Arial`; ctx.textBaseline = 'middle'; for (const [txt, y] of [['SKY', 0.07], ['EARTH', eY + 0.08], ['TARTARUS', 0.83]]) { const w = ctx.measureText(txt).width + 30 * SX; ctx.fillStyle = 'rgba(28,16,8,.75)'; ctx.beginPath(); ctx.roundRect(W - w - 40 * SX, y * H - 22 * SX, w, 44 * SX, 12 * SX); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(txt, W - w - 25 * SX, y * H); } ctx.restore(); } }
  else if (type === 'battle') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a2233'); g.addColorStop(1, '#4a4a5a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#2a2e3a'; for (const [x, s] of [[230, 520], [1690, 560]]) { ctx.beginPath(); ctx.moveTo((x - s) * SX, H); ctx.lineTo(x * SX, (1080 - s * 0.9) * SX); ctx.lineTo((x + s) * SX, H); ctx.fill(); } ctx.strokeStyle = 'rgba(190,210,235,.25)'; ctx.lineWidth = 2; for (let i = 0; i < 60; i++) { const x = (i * 97 + t * 500) % (W + 200) - 100, y = ((i * 53 + t * 900) % (H + 100)) - 50; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y + 46); ctx.stroke(); } }
  else if (type === 'nighthills') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#080c2a'); g.addColorStop(1, '#2a2e66'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; for (const [x, y, r, ph] of STARS) { if (y > 700) continue; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.6 + ph); ctx.beginPath(); ctx.arc(x * SX, y * SX * 0.8, r * SX, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; ctx.fillStyle = '#141a3a'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= 1920; x += 40) ctx.lineTo(x * SX, (900 - 60 * Math.sin(x / 300) - 30 * Math.sin(x / 97)) * SX); ctx.lineTo(W, H); ctx.fill(); }
  else if (type === 'sea') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9bc9d6'); g.addColorStop(1, '#2d6f8a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 4; for (let i = 0; i < 26; i++) { const x = (i * 211) % 2000 * SX, y = (H * 0.45 + (i * 83) % (H * 0.55)); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30, y - 12 + Math.sin(t * 1.5 + i) * 5, x + 60, y); ctx.stroke(); } }
}
// ------------------------------------------------------------ placement
function resolve(it, sh, cam, tl, dur, bg) {
  const sys = it.sys || (bg === 'map' ? 'sp' : 'p'); let pos = it.pos || [960, 540];
  const proj = (p) => sys === 'geo' ? mapScreen(p[0], p[1], cam) : (sys === 'p' ? stageScreen(p[0], p[1], cam) : [p[0] * SX, p[1] * SX]);
  const zs = sys === 'p' ? stageView(cam).z : SX * (it.nz ? 1 : 1);
  let A = proj(pos), x = A[0], y = A[1];
  if (it.d) { x += it.d[0] * SX; y += it.d[1] * SX; A = [x, y]; }
  if (it.mv) { const m = it.mv, u = cl((tl / dur - m.u0) / (m.u1 - m.u0)), e = sm(u); let B = proj(m.to); if (it.d) B = [B[0] + it.d[0] * SX, B[1] + it.d[1] * SX]; const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1; const bend = (m.bend || 0) * SX * Math.sin(Math.PI * e); x = A[0] + dx * e + (-dy / L) * bend; y = A[1] + dy * e + (dx / L) * bend; }
  if (!it.free && (it.k === 'bust' || it.k === 'prop' || it.k === 'text')) {
    const s0 = (it.s || 100) * zs, o = it.k === 'bust' ? (CHAR[it.c] || {}) : {};
    const top = it.k === 'bust' ? s0 * (o.monster ? 1.45 : (o.heads || o.hat || o.staff || o.wings ? 1.32 : 1.1)) : (it.k === 'text' ? s0 * 0.9 * String(it.t).split('\n').length : s0 * 0.5);
    const bot = it.k === 'bust' ? s0 * 0.64 : (it.k === 'text' ? s0 * 0.9 : (it.n === 'bars' ? s0 * 0.68 : s0 * 0.5));
    const yMin = 28 * SX + top, yMax = 922 * SX - bot; if (yMin <= yMax) y = Math.min(Math.max(y, yMin), yMax);
  }
  let pop = 1, alpha = 1, ox = 0, oy = 0; const x0 = tl - (it.at || 0), inn = it.in || 'pop';
  if (x0 < 0) return null;
  if (inn === 'pop') pop = backOut(x0 / 0.38); else if (inn === 'fade') alpha = easeOut(x0 / 0.4); else if (inn === 'left') ox = -(1 - easeOut(x0 / 0.5)) * 700 * SX; else if (inn === 'right') ox = (1 - easeOut(x0 / 0.5)) * 700 * SX; else if (inn === 'up') oy = (1 - easeOut(x0 / 0.5)) * 500 * SX; else if (inn === 'drop') { const e = x0 / 0.55; oy = -(1 - backOut(e)) * 520 * SX * (e < 1 ? 1 : 0); pop = 1; alpha = cl(x0 / 0.1); }
  if (it.until !== undefined && tl > it.until) { const e = cl((tl - it.until) / 0.25); pop *= 1 - e; alpha *= 1 - e; if (e >= 1) return null; }
  return { x: x + ox, y: y + oy, s: (it.s || 100) * zs, pop, alpha, t: tl };
}
const pick = (v, u, dflt) => { if (!Array.isArray(v)) return v ?? dflt; let r = dflt; for (const [uu, val] of v) if (u >= uu) r = val; return r; };
function drawText(it, r) {
  const st = it.st || 'label', size = (it.s || 100) * (r.s / (it.s || 100)); ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(it.rot || 0); ctx.scale(r.pop, r.pop); ctx.globalAlpha = r.alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const lines = String(it.t).split('\n');
  const fnt = st === 'label' || st === 'year' ? `italic 900 ${size}px "Playfair Display SC",Georgia,serif` : st === 'card' ? `italic 400 ${size}px "Old Standard TT",Georgia,serif` : st === 'tag' ? `700 ${size}px "Segoe UI",Arial,sans-serif` : `900 ${size}px "Segoe UI Black","Arial Black",Arial,sans-serif`;
  ctx.font = fnt; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = (st === 'label' ? size * 0.08 : 0) + 'px';
  if (it.fit) { const wmax = Math.max(...lines.map(l => ctx.measureText(l).width)), lim = it.fit * (r.s / (it.s || 100)); if (wmax > lim) { const k = lim / wmax; ctx.scale(k, k); } }
  if (st === 'tag') { const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + size * 1.0, h = size * 1.12 * lines.length + size * 0.5; ctx.fillStyle = it.bg || 'rgba(28,16,8,.82)'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, size * 0.35); ctx.fill(); ctx.strokeStyle = 'rgba(255,230,170,.55)'; ctx.lineWidth = Math.max(1, size * 0.05); ctx.stroke(); }
  lines.forEach((ln, i) => { const yy = (i - (lines.length - 1) / 2) * size * 1.12;
    if (st === 'label') { ctx.lineWidth = size * 0.12; ctx.strokeStyle = 'rgba(255,248,226,.92)'; ctx.strokeText(ln, 0, yy); ctx.fillStyle = '#4a3318'; ctx.fillText(ln, 0, yy); }
    else if (st === 'year') { ctx.lineWidth = size * 0.1; ctx.strokeStyle = 'rgba(255,248,226,.95)'; ctx.strokeText(ln, 0, yy); ctx.fillStyle = '#3a2410'; ctx.fillText(ln, 0, yy); }
    else if (st === 'card') { ctx.fillStyle = it.col || '#f2e6c8'; ctx.fillText(ln, 0, yy); }
    else if (st === 'tag') { ctx.fillStyle = it.col || '#fff'; ctx.fillText(ln, 0, yy + size * 0.04); }
    else { ctx.lineWidth = size * 0.16; ctx.strokeStyle = OL; ctx.strokeText(ln, 0, yy); ctx.fillStyle = it.col || '#fff'; ctx.fillText(ln, 0, yy); } });
  ctx.restore();
}
function drawItem(it, sh, cam, tl, dur, bg, t) {
  const u = cl(tl / dur), r = resolve(it, sh, cam, tl, dur, bg); if (!r) return;
  if (it.k === 'bust') {
    let sq = 0; if (it.sq) { const [a, b, amp] = it.sq; if (u > a && u < b) sq = amp * Math.sin((u - a) / (b - a) * Math.PI); }
    ctx.save(); ctx.globalAlpha *= r.alpha; bust({ kind: it.c, x: r.x, y: r.y, s: r.s, t, ph: it.ph || 0, pop: r.pop, expr: pick(it.e, u, 'neutral'), look: it.look ?? 0.3, flip: pick(it.flip, u, false), tilt: it.tilt || 0, wink: pick(it.wink, u, false), squash: sq, skin: it.skin, alpha: it.alpha, belly: it.belly, v: it.v, noEmblem: it.noEmblem }); ctx.restore();
  } else if (it.k === 'prop') {
    ctx.save(); ctx.globalAlpha *= r.alpha; prop(Object.assign({}, it, { x: r.x, y: r.y, s: r.s, t, pop: r.pop, rot: (it.rot || 0) + (it.spin ? tl * it.spin : 0) })); ctx.restore();
  } else if (it.k === 'text') { let it2 = it; if (it.count) { const k = sm((u - it.u0) / (it.u1 - it.u0)); it2 = Object.assign({}, it, { t: Math.round(it.count[0] + (it.count[1] - it.count[0]) * k) + (it.suf || '') }); } drawText(it2, r); }
  else if (it.k === 'pin') { ctx.save(); ctx.translate(r.x, r.y); ctx.scale(r.pop, r.pop); ctx.globalAlpha = r.alpha; const s = (it.s || 40);
    ctx.fillStyle = '#d6322e'; ctx.strokeStyle = OL; ctx.lineWidth = s * 0.08; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-s * 0.7, -s * 0.8, -s * 0.5, -s * 1.7, 0, -s * 1.7); ctx.bezierCurveTo(s * 0.5, -s * 1.7, s * 0.7, -s * 0.8, 0, 0); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -s * 1.15, s * 0.22, 0, 7); ctx.fill();
    if (it.t) { ctx.font = `italic 900 ${s * 1.1}px "Playfair Display SC",Georgia,serif`; ctx.textAlign = 'center'; ctx.lineWidth = s * 0.16; ctx.strokeStyle = 'rgba(255,248,226,.95)'; ctx.strokeText(it.t, 0, s * 0.8); ctx.fillStyle = '#4a3318'; ctx.fillText(it.t, 0, s * 0.8); } ctx.restore(); }
  else if (it.k === 'trail') {
    const sys = it.sys || (bg === 'map' ? 'sp' : 'p'), proj = (p) => sys === 'geo' ? mapScreen(p[0], p[1], cam) : (sys === 'p' ? stageScreen(p[0], p[1], cam) : [p[0] * SX, p[1] * SX]);
    const a = proj(it.a), b = proj(it.b), prog = sm((tl / dur - (it.u0 ?? 0)) / ((it.u1 ?? 0.6) - (it.u0 ?? 0))); if (tl < (it.at || 0) || prog <= 0) return;
    const mid = [(a[0] + b[0]) / 2 + (-(b[1] - a[1])) * (it.bend || 0) * 0.002 * SX * 100, (a[1] + b[1]) / 2 + (b[0] - a[0]) * (it.bend || 0) * 0.002 * SX * 100];
    ctx.save(); ctx.strokeStyle = it.col || '#fffaf0'; ctx.lineWidth = (it.w || 9) * SX; ctx.lineCap = 'round'; if (!it.solid) ctx.setLineDash([1, 22 * SX]); ctx.shadowColor = 'rgba(40,25,10,.5)'; ctx.shadowBlur = 4; ctx.beginPath();
    for (let i = 0; i <= 50; i++) { const q = i / 50 * prog, aa = 1 - q, x = aa * aa * a[0] + 2 * aa * q * mid[0] + q * q * b[0], y = aa * aa * a[1] + 2 * aa * q * mid[1] + q * q * b[1]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]);
    if (it.arrow && prog > 0.05) { const q = prog, aa = 1 - q, ex2 = aa * aa * a[0] + 2 * aa * q * mid[0] + q * q * b[0], ey2 = aa * aa * a[1] + 2 * aa * q * mid[1] + q * q * b[1], q2 = Math.max(0, q - 0.04), a2 = 1 - q2, px = a2 * a2 * a[0] + 2 * a2 * q2 * mid[0] + q2 * q2 * b[0], py = a2 * a2 * a[1] + 2 * a2 * q2 * mid[1] + q2 * q2 * b[1], ang = Math.atan2(ey2 - py, ex2 - px), L = (it.w || 9) * 3.2 * SX;
      ctx.fillStyle = it.col || '#fffaf0'; ctx.beginPath(); ctx.moveTo(ex2 + Math.cos(ang) * L * 0.6, ey2 + Math.sin(ang) * L * 0.6); ctx.lineTo(ex2 + Math.cos(ang + 2.5) * L, ey2 + Math.sin(ang + 2.5) * L); ctx.lineTo(ex2 + Math.cos(ang - 2.5) * L, ey2 + Math.sin(ang - 2.5) * L); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  } else if (it.k === 'glow') { ctx.save(); const g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.s); g.addColorStop(0, it.col || 'rgba(255,230,140,.8)'); g.addColorStop(1, 'rgba(255,230,140,0)'); ctx.globalAlpha = r.alpha * (0.7 + 0.3 * Math.sin(t * 5)); ctx.fillStyle = g; ctx.fillRect(r.x - r.s, r.y - r.s, r.s * 2, r.s * 2); ctx.restore(); }
  else if (it.k === 'dome') { ctx.save(); ctx.globalAlpha = r.alpha; ctx.fillStyle = '#1c2760'; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.s * 1.6, r.s * 0.9, 0, Math.PI, 0); ctx.ellipse(r.x, r.y, r.s * 1.35, r.s * 0.7, 0, 0, Math.PI, true); ctx.fill(); ctx.lineWidth = 6 * SX; ctx.strokeStyle = OL; ctx.stroke(); ctx.fillStyle = '#ffe9a0'; for (let i = 0; i < 14; i++) { const a = Math.PI * (1.08 + i * 0.062); ctx.beginPath(); ctx.arc(r.x + Math.cos(a) * r.s * 1.48, r.y + Math.sin(a) * r.s * 0.8, 5 * SX, 0, 7); ctx.fill(); } ctx.restore(); }
  else if (it.k === 'earth') { ctx.save(); ctx.globalAlpha = r.alpha; ctx.fillStyle = '#6a9a46'; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.s * 1.7, r.s * 0.55, 0, Math.PI, 0); ctx.lineTo(r.x + r.s * 1.7, r.y + 400); ctx.lineTo(r.x - r.s * 1.7, r.y + 400); ctx.closePath(); ctx.fill(); ctx.lineWidth = 6 * SX; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore(); }
  else if (it.k === 'ruler') { ctx.save(); ctx.globalAlpha = r.alpha; const x0 = r.x, y0 = r.y, y1 = r.y + (it.len || 700) * (r.s / (it.s || 100)); ctx.strokeStyle = '#f2e6c8'; ctx.lineWidth = 8 * SX; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.stroke(); ctx.lineWidth = 6 * SX; for (const yy of [y0, y1]) { ctx.beginPath(); ctx.moveTo(x0 - 40 * SX, yy); ctx.lineTo(x0 + 40 * SX, yy); ctx.stroke(); } ctx.restore(); }
  else if (it.k === 'photo') { drawPhoto(it, tl, dur); }
  else if (it.k === 'art') { const im = IMG[it.img]; if (!im || !im.complete) return; const k = r.s / (it.s || 100), w = (it.w || 900) * k, h = (it.h || 600) * k, u2 = sm(tl / dur), [a0, b0] = it.kb || [[0.5, 0.5, 1], [0.5, 0.5, 1.08]];
    const z = a0[2] + (b0[2] - a0[2]) * u2, fx = a0[0] + (b0[0] - a0[0]) * u2, fy = a0[1] + (b0[1] - a0[1]) * u2, base = Math.max(w / im.naturalWidth, h / im.naturalHeight) * z, dw = im.naturalWidth * base, dh = im.naturalHeight * base;
    ctx.save(); ctx.translate(r.x, r.y); ctx.scale(r.pop, r.pop); ctx.rotate(it.rot || 0); ctx.globalAlpha = r.alpha;
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(-w / 2 + 14 * SX, -h / 2 + 18 * SX, w, h);
    const fw = 16 * SX; ctx.fillStyle = '#b8892e'; ctx.fillRect(-w / 2 - fw, -h / 2 - fw, w + fw * 2, h + fw * 2); ctx.strokeStyle = '#5a3a10'; ctx.lineWidth = 3 * SX; ctx.strokeRect(-w / 2 - fw, -h / 2 - fw, w + fw * 2, h + fw * 2); ctx.strokeStyle = '#ffe2a0'; ctx.lineWidth = 2 * SX; ctx.strokeRect(-w / 2 - fw * 0.5, -h / 2 - fw * 0.5, w + fw, h + fw);
    ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); let ox2 = -fx * dw + w / 2, oy2 = -fy * dh + h / 2; ox2 = Math.min(0, Math.max(w - dw, ox2)); oy2 = Math.min(0, Math.max(h - dh, oy2)); ctx.drawImage(im, -w / 2 + ox2, -h / 2 + oy2, dw, dh); ctx.restore();
    if (it.cap) drawText({ t: it.cap, st: 'tag', s: 34 }, { x: r.x, y: r.y + h / 2 + 56 * SX * k, s: 34 * SX * k, pop: r.pop, alpha: r.alpha }); }
  else if (it.k === 'zone') { ctx.save(); ctx.globalAlpha = r.alpha * 0.85; ctx.beginPath(); ctx.arc(r.x, r.y, r.s * r.pop, 0, 7); ctx.fillStyle = it.col || 'rgba(201,98,58,.55)'; ctx.fill(); ctx.fillStyle = HATCH; ctx.fill(); ctx.strokeStyle = '#7a2e18'; ctx.lineWidth = 4 * SX; ctx.stroke(); ctx.restore(); }
  else if (it.k === 'rect') { ctx.save(); ctx.globalAlpha = r.alpha * (it.a ?? 1); ctx.fillStyle = it.col || '#000'; const w = (it.w || 400) * r.s / (it.s || 100), h = (it.h || 100) * r.s / (it.s || 100); ctx.beginPath(); ctx.roundRect(r.x - w / 2, r.y - h / 2, w, h, (it.r || 0) * SX); ctx.fill(); ctx.restore(); }
}
function drawPhoto(it, tl, dur) {
  const im = IMG[it.img]; if (!im || !im.complete) return; const u = cl(tl / dur), e = sm(u), [a, b] = it.kb || [[0.5, 0.5, 1], [0.5, 0.5, 1.06]];
  const z = a[2] + (b[2] - a[2]) * e, fx = a[0] + (b[0] - a[0]) * e, fy = a[1] + (b[1] - a[1]) * e, base = Math.max(W / im.naturalWidth, H / im.naturalHeight) * z, dw = im.naturalWidth * base, dh = im.naturalHeight * base;
  let x0 = W / 2 - fx * dw, y0 = H / 2 - fy * dh; if (dw >= W) x0 = Math.min(0, Math.max(W - dw, x0)); else x0 = (W - dw) / 2; if (dh >= H) y0 = Math.min(0, Math.max(H - dh, y0)); else y0 = (H - dh) / 2; ctx.save(); ctx.drawImage(im, x0, y0, dw, dh); ctx.restore();
}
// ------------------------------------------------------------ shots
function shotIndex(t) { let lo = 0, hi = SHOTS.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SHOTS[m].t0 <= t) lo = m; else hi = m - 1; } return lo; }
function camOf(sh, t, prev) {
  const bg = sh.bg || 'map', c1 = sh.cam || (bg === 'map' ? [24, 38, 0.5] : [960, 540, 1]), c2 = sh.cam2 || (bg === 'map' ? [c1[0], c1[1], c1[2] * 1.05] : [c1[0], c1[1], c1[2] * 1.05]);
  const u = cl((t - sh.t0) / (sh.t1 - sh.t0)), e = sm(u); let c = c1.map((v, i) => v + (c2[i] - v) * (sh.ease === 'lin' ? u : e));
  if (prev && !sh.cut && (prev.bg || 'map') === bg && (bg === 'map' || sh.travel)) { const pe = prev._endCam, k = sm((t - sh.t0) / (sh.trav || 0.7)); if (k < 1 && pe) { if (bg === 'map') { const zf = Math.log(c[2] / pe[2]), zz = pe[2] * Math.exp(zf * k); c = [pe[0] + (c[0] - pe[0]) * k, pe[1] + (c[1] - pe[1]) * k, zz]; } else c = c.map((v, i) => pe[i] + (v - pe[i]) * k); } }
  return c;
}
SHOTS.forEach(sh => { const bg = sh.bg || 'map', c1 = sh.cam || (bg === 'map' ? [24, 38, 0.5] : [960, 540, 1]), c2 = sh.cam2 || [c1[0], c1[1], c1[2] * 1.05]; sh._endCam = c2.slice(); });
function drawShot(sh, t, prev) {
  const bg = sh.bg || 'map', tl = t - sh.t0, dur = sh.t1 - sh.t0, u = cl(tl / dur), cam = camOf(sh, t, prev);
  ctx.save();
  if (sh.fx) for (const f of sh.fx) if (f.t === 'shake' && u >= f.u0 && u <= f.u1) { const a = (f.amp || 10) * SX * (1 - (u - f.u0) / (f.u1 - f.u0)); ctx.translate(Math.sin(t * 90) * a, Math.cos(t * 77) * a); }
  if (bg === 'map') drawMapBG(cam, t, { crete: sh.crete ? (sh.crete === true ? sm(tl / 0.5) : sh.crete) : 0 }); else if (bg === 'photo') { ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H); } else drawStageBG(bg, cam, t, sh);
  const its = sh.items || []; for (const it of its) if (it.k === 'glow') drawItem(it, sh, cam, tl, dur, bg, t); for (const it of its) if (it.k !== 'glow') drawItem(it, sh, cam, tl, dur, bg, t);
  ctx.restore();
  if (sh.fx) for (const f of sh.fx) { if (f.t === 'flash') { const x = (tl - f.u * dur) / (f.dur || 0.25); if (x >= 0 && x < 1) { ctx.fillStyle = f.col || '#fff'; ctx.globalAlpha = (1 - x) * (f.a ?? 0.9); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; } } else if (f.t === 'dim' && u >= f.u0 && u <= f.u1) { ctx.fillStyle = f.col || '#000'; ctx.globalAlpha = f.a ?? 0.5; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; } else if (f.t === 'fadein') { const x = tl / (f.dur || 0.5); if (x < 1) { ctx.fillStyle = f.col || '#000'; ctx.globalAlpha = 1 - x; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; } } }
}
// ------------------------------------------------------------ overlays
const capEl = document.getElementById('cap'); let capKey = '';
const NAMES = /\b(Zeus|Gaia|Cronos|Ouranos|Rhea|Metis|Typhoeus|Hesiod|Titans?|Hundred-Handers|Cyclopes|Pausanias|Tartarus|Olympus|Othrys|Delphi|Crete|Poseidon|Hades|Hera|Hestia|Demeter|Athena|Cottus|Chaos|Theogony|Pytho|Parnassus|Munich)\b|\b(ten|hundred|three|nine|five|twelve|fifty|eight hundred|seven hundred|one|two)\b/gi;
function chunksOf(text) { const w = text.split(' '), out = []; let cur = []; for (const x of w) { cur.push(x); if (cur.length >= 4 || /[,.:;?!]$/.test(x)) { out.push(cur.join(' ')); cur = []; } } if (cur.length) out.push(cur.join(' ')); if (out.length > 1 && out[out.length - 1].split(' ').length === 1) { const l = out.pop(); out[out.length - 1] += ' ' + l; } return out; }
function caption(t, hide) {
  let txt = ''; if (!hide) for (const s of SENT) { if (t >= s.s && t < s.e + 0.12) { const ch = chunksOf(s.text), tot = ch.reduce((n, c) => n + c.length, 0); let acc = 0; for (const c of ch) { const s0 = s.s + (s.e - s.s) * acc / tot; acc += c.length; if (t >= s0) txt = c; } break; } }
  if (txt !== capKey) { capKey = txt; capEl.innerHTML = txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(NAMES, m => `<b>${m}</b>`); }
}
function chip(t) { // chapter chip, top-left
  const ch = (window.CHAPTERS || []).filter(c => t >= c.t).pop(); if (!ch || !ch.label) return; const a = t - ch.t; if (a > 3.4) return; const k = backOut(a / 0.4) * (a > 3.0 ? 1 - (a - 3.0) / 0.4 : 1);
  ctx.save(); ctx.translate(60 * SX, 70 * SX); ctx.scale(k, k); ctx.font = `700 ${36 * SX}px "Playfair Display SC",Georgia,serif`; const w = ctx.measureText(ch.label).width + 64 * SX, h = 70 * SX; ctx.fillStyle = 'rgba(240,226,190,.96)'; ctx.strokeStyle = OL; ctx.lineWidth = 4 * SX; ctx.beginPath(); ctx.roundRect(0, -h / 2, w, h, 12 * SX); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#4a3318'; ctx.textBaseline = 'middle'; ctx.fillText(ch.label, 30 * SX, 2 * SX); ctx.restore();
}
function progress(t) { const h = 7 * SX; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, H - h, W, h); ctx.fillStyle = GOLD; ctx.fillRect(0, H - h, W * cl(t / window.END), h); ctx.fillStyle = '#33200f'; for (const c of (window.CHAPTERS || [])) if (c.t > 0.5) ctx.fillRect(W * c.t / window.END - SX, H - h, 2 * SX, h); }
function frame(t) {
  const i = shotIndex(t), sh = SHOTS[i], prev = i > 0 ? SHOTS[i - 1] : null;
  const dis = (prev && !sh.cut && (prev.bg || 'map') !== (sh.bg || 'map')) ? cl((t - sh.t0) / 0.22) : 1;
  if (dis < 1) { drawShot(prev, Math.min(prev.t1 - 0.001, t), SHOTS[i - 2] || null); ctx.save(); ctx.globalAlpha = dis; drawShot(sh, t, prev); ctx.restore(); } else drawShot(sh, t, prev);
  if (sh.bg !== 'photo') { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = NOISE; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.0); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,18,6,.40)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (sh.dim) { ctx.fillStyle = 'rgba(0,0,0,' + sh.dim + ')'; ctx.fillRect(0, 0, W, H); }
  chip(t); progress(t); caption(t, sh.cap === false);
}
window.DUR = window.END; window.render = t => frame(t);
Promise.all([document.fonts.load('900 40px "Playfair Display SC"'), document.fonts.load('italic 400 40px "Old Standard TT"'), ...Object.values(IMG).map(im => im.decode ? im.decode().catch(() => { }) : 0)]).then(() => { window.READY = true; frame(0); });
