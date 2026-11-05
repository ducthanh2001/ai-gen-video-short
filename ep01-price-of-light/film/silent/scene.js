// 1920s plate for "The Price of Light": a city street switches to electric light.
// ?card=1&l1=..&l2=..&l3=..  an intertitle (cream on black, ornamental border) instead of the street; bar = year on the left bar
// Tonal painting → Redraw (ink line, wash, hatching) → FilmPost (projected silver print). One colour: the warm electric light.
import { form, grey, setFrame, ellipsePts, rectPts, stroke } from '../engines/silent/ink.js';
import { Redraw } from '../engines/silent/redraw.js';
import { FilmPost, damage } from '../engines/silent/film.js';
import { loadNow } from '../common/tag.js';
import { overlay, qn, qs, T, wrap } from '../common/overlay.js';
import { drawFigure, walkPose, walkBob } from '../engines/silent/figure.js';
import { GENT, LADY } from './chars.js';
const YAW = +(new URLSearchParams(location.search).get('yaw') ?? 20);   // rig yaw: 0 = facing camera, 90 = profile, 180 = back

const W = 1440, H = 1080, OX = 240;
const out = document.getElementById('c').getContext('2d');
await Promise.all(['600 22px Inter', '300 56px Inter', '400 20px Inter', '700 20px Inter'].map(f => document.fonts.load(f))); await loadNow('stills/today_bare_1.jpg');
await document.fonts.load('900 60px "Playfair Display SC"'); await document.fonts.load('italic 400 30px "Old Standard TT"');
const mk = () => Object.assign(document.createElement('canvas'), { width: W, height: H });
const frame = mk(), f = frame.getContext('2d'), mask = mk(), m = mask.getContext('2d');
const RD = new Redraw(W, H), FP = new FilmPost(W, H);
const LIGHT = '#F4C55A';
const FG = Object.assign(document.createElement('canvas'), { width: W, height: H }).getContext('2d');
const VP = [720, 560];                                      // vanishing point
const lerp = (a, b, k) => a + (b - a) * k;

function paint(t) {
  setFrame(t);
  f.fillStyle = grey(.12); f.fillRect(0, 0, W, H);
  // night sky gradient
  const sky = f.createLinearGradient(0, 0, 0, 500); sky.addColorStop(0, grey(.1)); sky.addColorStop(1, grey(.38)); f.fillStyle = sky; f.fillRect(0, 0, W, 600);
  // street + pavements in perspective
  form(f, [[0, H], [W, H], [VP[0] + 40, VP[1]], [VP[0] - 40, VP[1]]], { v: .4, line: 0 });
  form(f, [[0, 900], [0, H], [VP[0] - 40, VP[1]], [VP[0] - 70, VP[1]]], { v: .58, line: 2 });
  form(f, [[W, 900], [W, H], [VP[0] + 40, VP[1]], [VP[0] + 70, VP[1]]], { v: .58, line: 2 });
  // buildings, both sides, receding
  for (const side of [-1, 1]) {
    for (let k = 0; k < 6; k++) {
      const u0 = k / 6, u1 = (k + 1) / 6, e0 = Math.pow(1 - u0, 1.6), e1 = Math.pow(1 - u1, 1.6);
      const x0 = lerp(VP[0] + side * 80, side < 0 ? -40 : W + 40, e0), x1 = lerp(VP[0] + side * 80, side < 0 ? -40 : W + 40, e1);
      const top0 = lerp(VP[1] - 70, 40 + 50 * (k % 2), e0), top1 = lerp(VP[1] - 70, 40 + 50 * (k % 2), e1), bot0 = lerp(VP[1] + 8, 900, e0), bot1 = lerp(VP[1] + 8, 900, e1);
      const v = .5 + .08 * ((k + (side > 0 ? 1 : 0)) % 2);
      form(f, [[x0, bot0], [x0, top0], [x1, top1], [x1, bot1]], { v, line: 2.4, shade: 10 });
      // lit windows (the light is the one colour)
      for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) {
        const a = (c + .3) / 2.2, b = (c + .7) / 2.2, yy = (r + .25) / 5.3, yy2 = (r + .7) / 5.3;
        const P = (uu, vv) => [lerp(x0, x1, uu), lerp(lerp(top0, bot0, vv), lerp(top1, bot1, vv), uu)];
        const lit = ((k * 7 + r * 3 + c + (side > 0 ? 5 : 0)) % 3) !== 0;
        const pts = [P(a, yy), P(b, yy), P(b, yy2), P(a, yy2)];
        form(f, pts, { v: lit ? .93 : .16, line: 1.4 });
        if (lit) { m.fillStyle = LIGHT; m.beginPath(); pts.forEach((p, i) => i ? m.lineTo(...p) : m.moveTo(...p)); m.fill(); }
      }
    }
  }
  // street lamps receding along both pavements, glowing
  for (const side of [-1, 1]) for (let k = 0; k < 6; k++) {
    const e = Math.pow(1 - k / 6, 1.7), x = lerp(VP[0] + side * 70, side < 0 ? 130 : W - 130, e), base = lerp(VP[1] + 10, 990, e), head = lerp(VP[1] - 18, 330, e), hgt = base - head, w = lerp(2, 12, e);
    form(f, rectPts(x - w / 2, base - hgt, w, hgt), { v: .1, line: 1.2 });
    const r = lerp(4, 30, e), by = base - hgt - r * .6;
    const glow = f.createRadialGradient(x, by, 0, x, by, r * 4); glow.addColorStop(0, grey(.95, .55)); glow.addColorStop(1, grey(.95, 0)); f.fillStyle = glow; f.fillRect(x - r * 4, by - r * 4, r * 8, r * 8);
    form(f, ellipsePts(x, by, r, r * 1.15), { v: .98, line: 1.4 });
    const mg = m.createRadialGradient(x, by, 0, x, by, r * 2.4); mg.addColorStop(0, LIGHT); mg.addColorStop(1, 'rgba(244,197,90,0)'); m.fillStyle = mg; m.fillRect(x - r * 2.4, by - r * 2.4, r * 4.8, r * 4.8);
  }
  // a couple walking up the street toward us (24 fps for a smooth walk); drawn on their own layer so the
  // colour plate (lit windows, lamps) is punched out wherever they stand in front of it
  if (!qn('walk', 1)) return;
  const u = Math.min(1, t / Math.max(6, T));
  FG.setTransform(1, 0, 0, 1, 0, 0); FG.clearRect(0, 0, W, H);
  for (const [ch, x0, ph0] of [[LADY, 700, .5], [GENT, 610, 0]]) {
    const ground = lerp(980, 1075, u), sc = lerp(70, 88, u), x = lerp(VP[0] + (x0 - VP[0]) * .7, x0, u), ph = t * .9 + ph0;
    drawFigure(FG, ch, { x, ground: ground + walkBob(ph, sc), scale: sc, yaw: YAW, pose: walkPose(ph), t });
  }
  f.drawImage(FG.canvas, 0, 0);
  m.save(); m.globalCompositeOperation = 'destination-out'; m.drawImage(FG.canvas, 0, 0); m.restore();
}

const CARD = qn('card', 0), card = mk(), cg = card.getContext('2d'), blank = mk();
function intertitle(t) {   // the silent-era title card: cream letters on black, a thin double border, a small ornament
  cg.setTransform(1, 0, 0, 1, 0, 0); cg.fillStyle = '#0b0a09'; cg.fillRect(0, 0, W, H);
  cg.strokeStyle = '#d9d0bd'; cg.lineWidth = 3; cg.strokeRect(90, 90, W - 180, H - 180); cg.lineWidth = 1.2; cg.strokeRect(108, 108, W - 216, H - 216);
  for (const [x, y] of [[90, 90], [W - 90, 90], [90, H - 90], [W - 90, H - 90]]) { cg.beginPath(); cg.arc(x, y, 9, 0, 7); cg.fillStyle = '#d9d0bd'; cg.fill(); }
  cg.fillStyle = '#e8e0cc'; cg.textAlign = 'center'; cg.textBaseline = 'alphabetic';
  const ls = ['l1', 'l2', 'l3'].map(k => qs(k, '')).filter(Boolean);
  let y = H / 2 - (ls.length - 1) * 95;
  ls.forEach((l, i) => {
    const big = i === 0 && qn('big', 1);
    const n = wrap(cg, l, W / 2, y, 1080, big ? 92 : 64, big ? '900 80px "Playfair Display SC"' : 'italic 400 54px "Old Standard TT"');
    y += (big ? 92 : 64) * (n - 1) / 2 + (big ? 92 : 64) * (n + 1) / 2 + 60;
    if (i === 0 && ls.length > 1) { cg.fillRect(W / 2 - 90, y - 34, 180, 2); cg.beginPath(); cg.arc(W / 2, y - 33, 6, 0, 7); cg.fill(); y += 56; }
  });
}
window.render = t => {
  t = t ?? 2;
  const fr = Math.round(t * 24);
  out.fillStyle = '#050505'; out.fillRect(0, 0, 1920, 1080);
  if (CARD) {
    intertitle(t);
    out.drawImage(FP.render(card, { frame: fr, strength: .6, sepia: .15 }, blank), OX, 0); damage(out, OX, 0, W, H, fr, .5);
  } else {
    f.setTransform(1, 0, 0, 1, 0, 0); m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, W, H);
    paint(t);
    const inked = RD.render(frame, { frame: fr });
    const print = FP.render(inked, { frame: fr, strength: .6, sepia: .15 }, mask);
    out.drawImage(print, OX, 0); damage(out, OX, 0, W, H, fr, .5);
  }
  out.save(); out.fillStyle = '#d8d0bf'; out.textAlign = 'center'; out.textBaseline = 'middle';
  out.font = '900 64px "Playfair Display SC"'; const tl = qs('tags', '').split(',').filter(Boolean).map(e => e.split('@')).filter(([k, at]) => /^\d{4}$/.test(k) && t >= +at); out.fillText(tl.length ? tl[tl.length - 1][0] : qs('bar', '1920'), OX / 2, 470);
  out.restore();
  overlay(out, t);
};
window.DUR = 4; window.READY = true;
render(2);
