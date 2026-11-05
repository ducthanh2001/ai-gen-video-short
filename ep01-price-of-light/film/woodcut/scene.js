// Woodcut plates for "The Price of Light": ?plate=babylon (default) | sleep | fire
// Edit cues (common/overlay.js): tags, chap, say · carve=<s> live carving at the start · sleep: stamp=<s>, hl=1@t,2@t,3@t
// Black wood, white cuts; the ONE colour is reserved for the flame (the thing that burns).
// Every era plate carries the price tag (what the light cost in work) and the NOW inset (today's desk, 0.2 s).
import * as WC from '../engines/woodcut/index.js';
import { clamp } from '/core/lib.js';
import { loadNow } from '../common/tag.js';
import { overlay, qn, qs as qstr } from '../common/overlay.js';

const W = 1920, H = 1080, M = 64;
const qs = new URLSearchParams(location.search), PLATE = qs.get('plate') || 'babylon', BARE = qs.get('bare');
const out = document.getElementById('c').getContext('2d');
await document.fonts.load('400 40px "IM Fell English"'); await Promise.all(['600 22px Inter', '300 56px Inter', '400 20px Inter', '700 20px Inter', '800 40px Inter'].map(f => document.fonts.load(f)));
await loadNow('stills/today_bare_1.jpg');
const [mask, m] = WC.canvas(), [col, c] = WC.canvas(), P = WC.makePrinter();
const INKC = '#141210', FLAME = '#E8742A';

function flamePoly(x, y, w, h) { const o = []; for (let i = 0; i <= 30; i++) { const u = i / 30, a = u * Math.PI; o.push([x - Math.sin(a) * w * (1 - u * .35), y - u * h]); } for (let i = 30; i >= 0; i--) { const u = i / 30, a = u * Math.PI; o.push([x + Math.sin(a) * w * (1 - u * .35), y - u * h]); } return o; }
function jarPoly(cx, by, w, h) {
  const pts = [[0, 0], [.18, -.02], [.42, -.18], [.5, -.42], [.45, -.62], [.26, -.76], [.17, -.84], [.16, -.95], [.22, -1]];
  return [...pts.map(([x, y]) => [cx + x * w, by + y * h]), ...pts.slice().reverse().map(([x, y]) => [cx - x * w, by + y * h])];
}
const marginFrame = () => { m.fillStyle = '#fff'; m.fillRect(0, 0, W, M); m.fillRect(0, H - M, W, M); m.fillRect(0, 0, M, H); m.fillRect(W - M, 0, M, H); };
function caption(l, r) {
  out.save(); out.fillStyle = INKC; out.textBaseline = 'middle'; out.font = '400 30px "IM Fell English"';
  out.textAlign = 'left'; out.fillText(l, M + 4, H - M / 2 + 2); out.textAlign = 'right'; out.fillText(r, W - M - 4, H - M / 2 + 2); out.restore();
}
const scale = (poly, cx, cy, k, dx = 0, dy = 0) => poly.map(([x, y]) => [cx + (x - cx) * k + dx, cy + (y - cy) * k + dy]);
// live carving: the light is cut first (key = distance from the light), the figures and the flame appear when the cutting is done
const CARVE = qn('carve', 0);
const RV = (cx, cy, R, a = 0, b = 1) => CARVE ? { t0: .05 + a * CARVE, t1: b * CARVE, key: (x, y) => clamp(Math.hypot(x - cx, y - cy) / R), speed: 2200, jit: .1 } : undefined;
const RR = (a = 0, b = 1) => CARVE ? { t0: .05 + a * CARVE, t1: b * CARVE, jit: .5, speed: 1800 } : undefined;
const flick = (t, s = 0) => 1 + .07 * Math.sin(t * 9.1 + s) + .04 * Math.sin(t * 15.7 + s * 2) + .03 * Math.sin(t * 23.3 + s * 3);
const shown = t => !CARVE || t > CARVE * .8;
// solid black silhouettes with a white halo, a white rim on the lit side and white detail cuts (the readable woodcut figure)
function drawSils(sils) {
  for (const S of sils) {
    const path = () => { m.beginPath(); for (const p of S.polys) { m.moveTo(...p[0]); for (const q of p.slice(1)) m.lineTo(...q); m.closePath(); } };
    m.save(); m.lineJoin = m.lineCap = 'round';
    if (S.fill) { path(); m.fillStyle = S.fill; m.fill(); m.restore(); continue; }
    path(); m.strokeStyle = '#fff'; m.lineWidth = S.halo || 12; m.stroke(); m.fillStyle = '#000'; m.fill();
    if (S.rim) { m.save(); path(); m.clip(); m.fillStyle = '#fff'; m.fill(); m.translate(...S.rim); path(); m.fillStyle = '#000'; m.fill(); m.restore(); }
    m.strokeStyle = '#fff'; for (const [pts, w] of S.cuts || []) { m.lineWidth = w; m.beginPath(); m.moveTo(...pts[0]); for (const q of pts.slice(1)) m.lineTo(...q); m.stroke(); }
    m.restore();
  }
}
const sk = (cx, cy, k, mirror = false) => poly => poly.map(([x, y]) => [cx + (mirror ? -1 : 1) * (x - cx) * k, cy + (y - cy) * k]);
// a person sitting on the ground hugging the knees, facing LEFT (mirror = facing right); bx,by = hip on the ground
function sitter(bx, by, k, mirror, rim) {
  const K = sk(bx, by, k, mirror);
  return { rim, halo: 14, polys: [
    K([[bx + 40, by], [bx + 52, by - 70], [bx + 40, by - 150], [bx + 16, by - 196], [bx - 22, by - 188], [bx - 40, by - 130], [bx - 24, by - 40]]),
    K([[bx - 20, by - 30], [bx - 110, by - 128], [bx - 136, by - 118], [bx - 150, by - 8], [bx - 104, by], [bx - 112, by - 82], [bx - 40, by - 4]]),
    K([[bx + 2, by - 176], [bx - 100, by - 136], [bx - 126, by - 112], [bx - 112, by - 98], [bx - 82, by - 112], [bx - 20, by - 150]]),
    K(WC.ellipse(bx - 6, by - 232, 33, 38)),
    K([[bx - 36, by - 244], [bx - 52, by - 226], [bx - 38, by - 222]]),
    K([[bx - 6, by - 210], [bx + 8, by - 210], [bx + 10, by - 186], [bx - 8, by - 186]]),
    K([[bx - 8, by - 272], [bx + 26, by - 260], [bx + 34, by - 228], [bx + 22, by - 200], [bx + 8, by - 224], [bx - 4, by - 250], [bx - 26, by - 262]])],
  cuts: [[K([[bx - 112, by - 98], [bx - 82, by - 112], [bx - 20, by - 150]]), 5],
         [K([[bx - 26, by - 262], [bx - 4, by - 250], [bx + 8, by - 224], [bx + 22, by - 200]]), 4],
         [K([[bx - 26, by - 238], [bx - 16, by - 236]]), 4]] };
}
// a person walking LEFT with a bundle of firewood on the shoulder; cx = between the feet, gy = ground
function woodCarrier(cx, gy, k, rim) {
  const K = sk(cx, gy, k);
  return { rim, halo: 14, polys: [
    K(WC.ellipse(cx - 6, gy - 372, 30, 34)),
    K([[cx - 33, gy - 380], [cx - 48, gy - 364], [cx - 33, gy - 360]]),
    K([[cx - 12, gy - 344], [cx + 10, gy - 344], [cx + 12, gy - 326], [cx - 12, gy - 326]]),
    K([[cx - 40, gy - 330], [cx + 34, gy - 334], [cx + 44, gy - 252], [cx + 34, gy - 168], [cx - 34, gy - 168], [cx - 48, gy - 250]]),
    K([[cx - 36, gy - 172], [cx - 2, gy - 172], [cx - 60, gy - 10], [cx - 58, gy], [cx - 108, gy], [cx - 102, gy - 10], [cx - 92, gy - 14]]),
    K([[cx - 6, gy - 172], [cx + 30, gy - 172], [cx + 62, gy - 16], [cx + 86, gy - 6], [cx + 84, gy], [cx + 40, gy], [cx + 36, gy - 12]]),
    K([[cx - 30, gy - 322], [cx + 4, gy - 326], [cx - 16, gy - 384], [cx - 44, gy - 404], [cx - 56, gy - 390], [cx - 38, gy - 372]]),
    K([[cx - 120, gy - 382], [cx + 160, gy - 436], [cx + 166, gy - 404], [cx - 114, gy - 350]]),     // the bundle of sticks
    K([[cx + 8, gy - 330], [cx + 40, gy - 250], [cx + 30, gy - 196], [cx + 14, gy - 200], [cx + 18, gy - 250], [cx - 6, gy - 300]])],
  cuts: [[K([[cx - 100, gy - 372], [cx + 150, gy - 420]]), 4], [K([[cx - 104, gy - 360], [cx + 156, gy - 410]]), 3],
         [K([[cx - 22, gy - 378], [cx - 14, gy - 377]]), 4]] };
}

// —— plate 1: Babylon — one big oil lamp, its flame the only colour ——
function babylon() {
  const FX = 1010, FY = 600, L = WC.light(-.6, -.35, .55);
  const glow = (x, y) => Math.pow(clamp(1 - Math.hypot((x - FX) * .85, y - FY) / 860), 1.4);
  const wallReg = new WC.Region([[[M, M], [W - M, M], [W - M, 760], [M, 760]]], { res: 3 });
  const wall = WC.hatch(wallReg, { dir: WC.dirAngle(0), tone: glow, sp: 11, lo: .1, hi: .95, seed: 4, reveal: RV(1010, 600, 1100) });
  const joints = []; for (let r = 0; r < 8; r++) for (let k = 0; k < 14; k++) { const y = M + 40 + r * 84, x = M + 60 + k * 140 + (r % 2) * 70; if (glow(x, y) > .2 && y < 740) joints.push(...WC.cutAlong([[x, y], [x, y + 60]], { w: 3 + 5 * glow(x, y), kind: 'v', seed: r * 31 + k, reveal: RR(.35, .9) })); }
  const rays = WC.rays(FX, FY - 40, { n: 56, r0: 110, r1: [240, 560], w: 10, seed: 3, a0: Math.PI * 1.02, a1: Math.PI * 1.98, reveal: RR(0, .45) });
  const table = WC.shape([[[M, 760], [W - M, 750], [W - M, H - M], [M, H - M]]], { light: L, sp: 10, dir: .02, reveal: RV(FX, FY, 1100, .1, 1), tone: () => (x, y) => .18 + .8 * glow(x, y - 160) });
  // the lamp: a big slipper-shaped clay lamp, nozzle to the right, scaled up so it reads at a glance
  const lampBase = [[690, 790], [740, 728], [850, 704], [985, 706], [1095, 716], [1150, 690], [1192, 676], [1204, 690], [1150, 728], [1075, 774], [930, 800], [775, 804]];
  const lamp = scale(lampBase, 1204, 690, 1.45, -194, 4);
  const lampS = WC.shape([lamp], { light: L, sp: 7, halo: 0, seed: 5, white: true, reveal: RV(FX, FY, 900, .3, 1), tone: () => (x, y) => .3 + .5 * glow(x, y) });
  const hole = WC.ellipse(560, 742, 95, 16);
  const jars = [jarPoly(1450, 760, 170, 380), jarPoly(1640, 766, 130, 290)].map((p, i) => WC.shape([p], { light: L, sp: 8, halo: 8, seed: 9 + i, dir: 'contour', reveal: RV(FX, FY, 1100, .3, 1) }));
  return t => {
    m.fillStyle = '#000'; m.fillRect(0, 0, W, H); c.clearRect(0, 0, W, H);
    WC.drawStrokes(m, wall, { t }); WC.drawStrokes(m, joints, { t }); WC.drawStrokes(m, rays, { t });
    table.draw(m, t); for (const j of jars) j.draw(m, t);
    lampS.draw(m, t); WC.fillPoly(m, [hole], '#000');
    if (shown(t)) { const flame = flamePoly(FX, FY + 70, 34 * flick(t, 1), 190 * flick(t)); WC.fillPoly(m, [flame], '#fff'); WC.plate(c, [flame], 1); }
    marginFrame();
    out.drawImage(P.render(mask, col, { seed: 4, plate: FLAME }), 0, 0);
    caption('BABYLON · c. 1750 BC · a clay lamp burning sesame oil', 'Source: W. Nordhaus (1996)');
    overlay(out, t);
  };
}

// —— plate 2: myth check — three panels: first sleep · awake · second sleep ——
function sleep() {
  const PW = (W - 2 * M - 2 * 24) / 3, PX = i => M + i * (PW + 24), TOP = 150, BOT = H - 150;
  const shapes = [], strokes = [], flames = [];
  const room = (i, fx, fy, r) => {   // a dark room lit by one glow
    const x0 = PX(i), reg = new WC.Region([[[x0, TOP], [x0 + PW, TOP], [x0 + PW, BOT], [x0, BOT]]], { res: 3 });
    strokes.push(...WC.hatch(reg, { dir: WC.dirRadial(fx, fy), tone: (x, y) => Math.pow(clamp(1 - Math.hypot(x - fx, y - fy) / r), 1.5), sp: 11, lo: .12, seed: 10 + i, reveal: RV(fx, fy, r * 1.6) }));
  };
  const L = WC.light(-.5, -.4, .55);
  const bed = (x0) => shapes.push(WC.shape([[[x0 + 70, BOT - 40], [x0 + 70, BOT - 170], [x0 + 110, BOT - 186], [x0 + PW - 70, BOT - 170], [x0 + PW - 40, BOT - 120], [x0 + PW - 40, BOT - 40]]], { light: L, sp: 8, halo: 8, seed: x0 | 0, reveal: RV(x0 + PW / 2, BOT - 100, 900, .2, 1) }));
  const sils = [];   // figures: see drawSils
  // a sleeper lying on her side, head on the left: white pillow, black head + shoulder + arm over a pale blanket
  const sleeper = (x0, rim) => {
    const hx = x0 + 150, hy = BOT - 205, K = sk(hx, BOT - 170, 1.4), LS = WC.light(.6, -.6, .5);
    shapes.push(WC.shape([K([[hx + 40, BOT - 190], [hx + 70, BOT - 236], [hx + 150, BOT - 250], [hx + 260, BOT - 236], [x0 + PW - 90, BOT - 206], [x0 + PW - 80, BOT - 178], [hx + 30, BOT - 166]]).map(([x, y]) => [Math.min(x, x0 + PW - 60), y])], { light: LS, sp: 7, halo: 8, seed: 52, dir: 'contour', tone: () => (x, y) => .6 + .25 * Math.sin(x * .02) }));   // blanket over hip and shoulder
    sils.push({ fill: '#fff', polys: [K(WC.ellipse(hx + 6, hy + 30, 80, 27))] });                                            // pillow (plain white)
    sils.push({ rim, polys: [K(WC.ellipse(hx, hy, 36, 31)),                                                                  // head
      K([[hx - 6, hy - 33], [hx + 32, hy - 28], [hx + 48, hy + 2], [hx + 44, hy + 28], [hx + 16, hy + 10], [hx + 6, hy - 14], [hx - 20, hy - 24]]),   // hair
      K([[hx + 34, hy + 8], [hx + 80, hy - 22], [hx + 110, hy - 26], [hx + 96, hy + 4], [hx + 48, hy + 22]]),               // shoulder
      K([[hx + 60, BOT - 214], [hx + 130, BOT - 222], [hx + 160, BOT - 212], [hx + 104, BOT - 198], [hx + 44, BOT - 196]])],   // forearm on the blanket
      cuts: [[K([[hx - 24, hy - 2], [hx - 12, hy + 1]]), 4]] });                                                              // the closed eye
  };
  // 1 · first sleep: moonlight from a window
  const NIGHT_WIN = [PX(0) + PW - 220, TOP + 50, 160, 200];
  const nightStars = WC.flecks([[NIGHT_WIN[0] + 30, NIGHT_WIN[1] + 40, 6], [NIGHT_WIN[0] + 110, NIGHT_WIN[1] + 70, 5], [NIGHT_WIN[0] + 60, NIGHT_WIN[1] + 130, 6], [NIGHT_WIN[0] + 125, NIGHT_WIN[1] + 160, 4], [NIGHT_WIN[0] + 40, NIGHT_WIN[1] + 175, 4]], { seed: 5 });
  const nightFrame = WC.cutAlong([[NIGHT_WIN[0], NIGHT_WIN[1]], [NIGHT_WIN[0] + 160, NIGHT_WIN[1]], [NIGHT_WIN[0] + 160, NIGHT_WIN[1] + 200], [NIGHT_WIN[0], NIGHT_WIN[1] + 200], [NIGHT_WIN[0], NIGHT_WIN[1]]], { w: 7, kind: 'v', seed: 21 });
  { const x0 = PX(0); room(0, x0 + PW * .5, BOT - 160, 300); bed(x0); sleeper(x0, [-8, 7]); }
  // 2 · awake by the fire
  { const x0 = PX(1), fx = x0 + 150, fy = BOT - 120; room(1, fx, fy - 60, 420);
    shapes.push(WC.shape([[[x0 + 60, BOT - 30], [x0 + 60, BOT - 260], [x0 + 290, BOT - 260], [x0 + 290, BOT - 30], [x0 + 250, BOT - 30], [x0 + 250, BOT - 220], [x0 + 100, BOT - 220], [x0 + 100, BOT - 30]]], { light: L, sp: 7, halo: 7, seed: 31 }));
    flames.push([fx - 20, BOT - 40, 30, 130], [fx + 34, BOT - 40, 22, 90]);
    sils.push(sitter(x0 + 430, BOT - 32, 1.45, false, [11, 3]));   // the one awake, hugging her knees, facing the fire
  }
  // 3 · second sleep until dawn: light through the window
  { const x0 = PX(2); room(2, x0 + PW * .78, TOP + 110, 700); bed(x0); sleeper(x0, [-9, 8]);
    strokes.push(...WC.rays(x0 + PW * .78, TOP + 110, { n: 22, r0: 70, r1: [160, 330], w: 7, seed: 41, a0: Math.PI * .6, a1: Math.PI * 1.25, reveal: RR(0, .6) }));
    strokes.push(...WC.cutAlong([[x0 + PW - 200, TOP + 40], [x0 + PW - 60, TOP + 40], [x0 + PW - 60, TOP + 200], [x0 + PW - 200, TOP + 200], [x0 + PW - 200, TOP + 40]], { w: 6, kind: 'v', seed: 23 })); }
  const STAMP = qn('stamp', 0), HL = (qstr('hl', '') || '').split(',').filter(Boolean).map(e => e.split('@').map(Number));
  return t => {
    m.fillStyle = '#fff'; m.fillRect(0, 0, W, H); c.clearRect(0, 0, W, H);
    for (let i = 0; i < 3; i++) { m.fillStyle = '#000'; m.fillRect(PX(i), TOP, PW, BOT - TOP); }
    WC.drawStrokes(m, strokes, { t }); for (const s of shapes) s.draw(m, t);
    if (shown(t)) drawSils(sils);
    m.fillStyle = '#000'; m.fillRect(...NIGHT_WIN); WC.drawStrokes(m, nightFrame, { t }); WC.drawStrokes(m, nightStars, { t });
    if (shown(t)) { const fl = flames.map(([x, y, w, h], i) => flamePoly(x, y, w * flick(t, i * 2), h * flick(t, i * 2 + 1))); WC.fillPoly(m, fl, '#fff'); WC.plate(c, fl, 1); }
    out.drawImage(P.render(mask, col, { seed: 7, plate: FLAME }), 0, 0);
    let hl = 0; for (const [k, at] of HL) if (t >= at) hl = k;   // spotlight one panel: dim the other two
    if (hl) { out.fillStyle = 'rgba(239,233,223,.72)'; for (let i = 0; i < 3; i++) if (i !== hl - 1) out.fillRect(PX(i) - 2, TOP - 2, PW + 4, BOT - TOP + 100); }
    // the readable layer: title, panel labels, verdict
    out.save(); out.textBaseline = 'alphabetic';
    out.font = '800 40px Inter'; out.fillStyle = INKC; out.textAlign = 'left'; out.fillText('MYTH CHECK:  did people sleep in two shifts?', M, 104);
    const labs = [['1 · FIRST SLEEP', 'to bed early in the evening'], ['2 · AWAKE ~1 HOUR', 'in the dark: pray, talk, tend the fire'], ['3 · SECOND SLEEP', 'until dawn']];
    labs.forEach(([a, b], i) => { out.font = '700 26px Inter'; out.fillStyle = INKC; out.fillText(a, PX(i), BOT + 46); out.font = '400 22px Inter'; out.fillStyle = 'rgba(20,18,16,.7)'; out.fillText(b, PX(i), BOT + 78); });
    const su = clamp((t - STAMP) / .18);
    if (su > 0) { out.translate(W - M - 230, TOP + 90); out.rotate(-.12); out.scale(2.2 - 1.2 * su, 2.2 - 1.2 * su); out.globalAlpha = su; out.strokeStyle = '#c8502a'; out.lineWidth = 6; out.beginPath(); out.roundRect(-160, -46, 320, 92, 10); out.stroke();
    out.font = '800 40px Inter'; out.fillStyle = '#c8502a'; out.textAlign = 'center'; out.fillText('PARTLY TRUE', 0, 14); }
    out.restore(); overlay(out, t);
  };
}

// —— plate 3: early humans — a night fire; one sits by it, one brings more wood (the work that light cost) ——
function fire() {
  const FX = 960, FY = 840, L = WC.light(-.2, -.6, .6);
  const glow = (x, y) => Math.pow(clamp(1 - Math.hypot((x - FX) * .8, (y - FY + 80) * 1.15) / 900), 1.3);
  const skyReg = new WC.Region([[[M, M], [W - M, M], [W - M, 770], [M, 770]]], { res: 3 });
  const sky = WC.hatch(skyReg, { dir: WC.dirRadial(FX, FY - 100), tone: (x, y) => .92 * glow(x, y), sp: 12, lo: .1, hi: .95, seed: 61, reveal: RV(FX, FY, 1200) });
  const rays = WC.rays(FX, FY - 130, { n: 52, r0: 160, r1: [260, 620], w: 10, seed: 62, a0: Math.PI * 1.04, a1: Math.PI * 1.96, reveal: RR(0, .45) });
  const stars = []; { let r = 7; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 70; i++) { const x = M + 20 + rnd() * (W - 2 * M - 40), y = M + 20 + rnd() * 520; if (glow(x, y) < .05) stars.push([x, y, 2 + rnd() * 4]); } }
  const starF = WC.flecks(stars, { seed: 63 });
  const ground = WC.shape([[[M, 770], [W - M, 760], [W - M, H - M], [M, H - M]]], { light: L, sp: 10, dir: .03, reveal: RV(FX, FY, 1100, .1, 1), tone: () => (x, y) => .12 + .85 * glow(x, y - 120) });
  const logs = [[[FX - 190, FY + 46], [FX + 110, FY - 6], [FX + 124, FY + 24], [FX - 176, FY + 80]], [[FX + 190, FY + 46], [FX - 110, FY - 6], [FX - 124, FY + 24], [FX + 176, FY + 80]]]
    .map((p, i) => WC.shape([p], { light: L, sp: 6, halo: 8, seed: 64 + i, dir: 'contour', reveal: RV(FX, FY, 900, .3, 1) }));
  const stones = []; for (let i = 0; i < 9; i++) { const a = Math.PI * (.02 + i / 8 * .96); stones.push(WC.shape([WC.ellipse(FX + Math.cos(a) * 250, FY + 70 - Math.sin(a) * 14 + 12, 36, 22)], { light: L, sp: 6, halo: 6, seed: 70 + i, reveal: RV(FX, FY, 900, .3, 1) })); }
  const pile = [0, 1, 2, 3].map(i => WC.shape([[[1560 + i * 14, 900 - i * 26], [1790, 880 - i * 30], [1796, 900 - i * 30], [1556 + i * 14, 922 - i * 26]]], { light: L, sp: 6, halo: 6, seed: 80 + i, dir: 'contour', reveal: RV(FX, FY, 1100, .4, 1) }));
  const sils = [sitter(560, 905, 1.55, true, [-11, 3]), woodCarrier(1380, 915, 1.12, [11, 3])];
  return t => {
    m.fillStyle = '#000'; m.fillRect(0, 0, W, H); c.clearRect(0, 0, W, H);
    WC.drawStrokes(m, sky, { t }); WC.drawStrokes(m, rays, { t }); WC.drawStrokes(m, starF, { t });
    ground.draw(m, t); for (const s of pile) s.draw(m, t);
    if (shown(t)) drawSils(sils);
    for (const s of stones) s.draw(m, t);
    if (shown(t)) {
      const fl = [flamePoly(FX, FY + 30, 76 * flick(t, 1), 300 * flick(t)), flamePoly(FX - 74, FY + 36, 38 * flick(t, 3), 170 * flick(t, 4)), flamePoly(FX + 80, FY + 36, 32 * flick(t, 5), 150 * flick(t, 6))];
      WC.fillPoly(m, fl, '#fff'); WC.plate(c, fl, 1);
    }
    for (const s of logs) s.draw(m, t);
    marginFrame();
    out.drawImage(P.render(mask, col, { seed: 9, plate: FLAME }), 0, 0);
    caption('EARLY HUMANS · an open fire, and the wood it eats', 'Source: W. Nordhaus (1996)');
    overlay(out, t);
  };
}

const draw = { babylon, sleep, fire }[PLATE]();
window.render = t => draw(t ?? 10);
window.DUR = 4; window.READY = true;
render(10);
