// House-style information cards for Ep 01 (2D, cream paper, one accent). ?kind=hours|unit|years|things|fuel|gap|wages|ekirch|caveat
// Cue times come from the edit: k1, k2, k3 (seconds into the shot), T = shot length. Every number is from FACTS.md.
import { overlay, qn, qs, T, wrap } from '../common/overlay.js';

const W = 1920, H = 1080, INK = '#1c1d20', INK2 = 'rgba(28,29,32,.62)', ACC = '#c8502a', PAPER = '#efe9df', FLAMEC = '#E8742A';
const g = document.getElementById('c').getContext('2d');
await Promise.all(['300 80px Inter', '400 30px Inter', '600 30px Inter', '700 30px Inter', '800 60px Inter', '400 20px JBMono', '400 60px "IM Fell English"', 'italic 400 40px "IM Fell English"'].map(f => document.fonts.load(f)));
const KIND = qs('kind', 'hours'), K1 = qn('k1', 4), K2 = qn('k2', 7), K3 = qn('k3', 9);
const cl = x => Math.max(0, Math.min(1, x)), ease = u => (u = cl(u), u * u * (3 - 2 * u)), outE = u => 1 - (1 - cl(u)) ** 3;
const fin = (t, t0, d = .5) => ease((t - t0) / d);
function T_(s, x, y, font, color = INK, align = 'center', a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); g.restore(); }
function paper() {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const v = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,40,20,.13)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}
function source(s) { T_(s, 96, H - 60, '400 20px JBMono', INK2, 'left'); }
// —— little drawn icons ——
function candle(x, y, s = 1, a = 1) {   // y = base
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#f7f1e3'; g.strokeStyle = INK; g.lineWidth = 2 / s; g.beginPath(); g.roundRect(-9, -46, 18, 46, 2); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(0, -46); g.lineTo(0, -52); g.stroke();
  g.fillStyle = FLAMEC; g.beginPath(); g.moveTo(0, -50); g.bezierCurveTo(8, -56, 6, -66, 0, -76); g.bezierCurveTo(-6, -66, -8, -56, 0, -50); g.fill();
  g.restore();
}
function bulb(x, y, r, glow) {   // y = centre of the glass
  g.save();
  if (glow > 0) { const gr = g.createRadialGradient(x, y, r * .2, x, y, r * 3.2); gr.addColorStop(0, `rgba(255,214,140,${.75 * glow})`); gr.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = gr; g.fillRect(x - r * 3.4, y - r * 3.4, r * 6.8, r * 6.8); }
  g.fillStyle = glow > 0 ? '#fff6dd' : '#f6f2ea'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.arc(x, y, r, Math.PI * .78, Math.PI * .22); g.lineTo(x + r * .42, y + r * 1.25); g.lineTo(x - r * .42, y + r * 1.25); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#b9b2a6'; g.fillRect(x - r * .44, y + r * 1.25, r * .88, r * .62); g.strokeRect(x - r * .44, y + r * 1.25, r * .88, r * .62);
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x - r * .44, y + r * 1.25 + i * r * .155); g.lineTo(x + r * .44, y + r * 1.25 + i * r * .155 - 6); g.stroke(); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - r * .2, y + r * 1.87); g.lineTo(x + r * .2, y + r * 1.87); g.lineTo(x, y + r * 2.05); g.fill();
  g.strokeStyle = glow > 0 ? ACC : INK2; g.lineWidth = 3; g.beginPath(); g.moveTo(x - r * .3, y + r * 1.1); g.lineTo(x - r * .3, y + r * .1);
  for (let i = 0; i <= 6; i++) g.lineTo(x - r * .3 + i * r * .1, y + r * (i % 2 ? -.05 : .1)); g.lineTo(x + r * .3, y + r * 1.1); g.stroke();
  g.restore();
}
function clock(x, y, r, ang) {
  g.save(); g.strokeStyle = INK; g.lineWidth = 6; g.fillStyle = '#f7f2e8'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.lineWidth = i % 3 ? 3 : 6; g.beginPath(); g.moveTo(x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8); g.lineTo(x + Math.cos(a) * r * .92, y + Math.sin(a) * r * .92); g.stroke(); }
  g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang / 12 - Math.PI / 2) * r * .5, y + Math.sin(ang / 12 - Math.PI / 2) * r * .5); g.stroke();
  g.strokeStyle = ACC; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang - Math.PI / 2) * r * .75, y + Math.sin(ang - Math.PI / 2) * r * .75); g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.restore();
}
function strike(x0, x1, y, u) { if (u <= 0) return; g.save(); g.strokeStyle = ACC; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + (x1 - x0) * outE(u), y - 6 * outE(u)); g.stroke(); g.restore(); }
function chip(x, y, w, h, label, icon, a, o = {}) {
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(0, 20 * (1 - a));
  g.fillStyle = o.fill ?? '#f8f4ec'; g.strokeStyle = o.stroke ?? INK; g.lineWidth = 2.5; if (o.dash) g.setLineDash([10, 8]);
  g.beginPath(); g.roundRect(x, y, w, h, 10); g.fill(); g.stroke(); g.setLineDash([]);
  if (icon) icon(x + w / 2, y + h * .58);
  T_(label, x + w / 2, y + h - 26, '600 30px Inter', o.color ?? INK);
  g.restore();
}
const drop = (x, y) => { g.fillStyle = '#8a6a3a'; g.beginPath(); g.moveTo(x, y - 60); g.bezierCurveTo(x + 30, y - 18, x + 30, y + 10, x, y + 10); g.bezierCurveTo(x - 30, y + 10, x - 30, y - 18, x, y - 60); g.fill(); };
const gasF = (x, y) => { g.fillStyle = '#4f78c4'; g.beginPath(); g.moveTo(x, y + 6); g.bezierCurveTo(x + 26, y - 6, x + 18, y - 40, x, y - 62); g.bezierCurveTo(x - 18, y - 40, x - 26, y - 6, x, y + 6); g.fill(); g.fillStyle = '#9fc0f0'; g.beginPath(); g.ellipse(x, y - 10, 8, 16, 0, 0, 7); g.fill(); };
const bolt = (x, y) => { g.fillStyle = '#d9a21b'; g.beginPath(); g.moveTo(x + 8, y - 64); g.lineTo(x - 22, y - 10); g.lineTo(x - 2, y - 10); g.lineTo(x - 12, y + 12); g.lineTo(x + 24, y - 30); g.lineTo(x + 4, y - 30); g.closePath(); g.fill(); };

const KINDS = {
  hours(t) {
    paper();
    T_('HOW DO YOU COMPARE PRICES ACROSS CENTURIES?', W / 2, 170, '700 30px Inter', INK2, 'center', fin(t, .2));
    const mA = fin(t, .5) * (1 - .7 * fin(t, K1, .6));
    T_('MONEY?', W / 2, 360, '300 120px Inter', INK, 'center', mA);
    T_('a dollar in 1800 is not a dollar today', W / 2, 420, '400 30px Inter', INK2, 'center', mA * fin(t, 1.6));
    strike(W / 2 - 230, W / 2 + 230, 322, (t - (K1 - .9)) / .35 * (mA > 0 ? 1 : 0));
    const a = fin(t, K1, .6);
    if (a > 0) {
      g.save(); g.globalAlpha = a;
      const spin = (t - K1) * 4 * Math.max(0, 1 - (t - K1) / 3) + Math.min(3, t - K1) * 4 * .5;
      clock(560, 650, 110, spin * Math.PI);
      T_('HOURS OF WORK', 720, 680, '800 104px Inter', INK, 'left');
      g.restore();
      g.globalAlpha = fin(t, K1 + 1.2); g.fillStyle = INK2; g.textAlign = 'center'; wrap(g, 'How long would an ordinary worker have to work to buy it?', W / 2, 830, 1400, 50, '400 42px Inter'); g.globalAlpha = 1;
    }
  },
  unit(t) {
    paper();
    const mv = ease((t - K1) / .8), cx = W / 2 - 430 * mv;
    T_('TONIGHT’S UNIT', cx, 170, '700 30px Inter', INK2, 'center', fin(t, .2));
    bulb(cx, 420, 120, fin(t, .5, .6));
    T_('1,000 lumen-hours', cx, 790, '300 84px Inter', INK, 'center', fin(t, 1));
    T_('≈ one ordinary 800-lumen bulb', cx, 850, '400 32px Inter', INK2, 'center', fin(t, 2.4));
    T_('burning for 1¼ hours', cx, 892, '400 32px Inter', INK2, 'center', fin(t, 3.6));
    if (t > K1) {
      T_('=', W / 2 + 10, 520, '300 120px Inter', INK, 'center', fin(t, K1 + .4));
      for (let i = 0; i < 60; i++) { const r = Math.floor(i / 10), c = i % 10, a = fin(t, K1 + .6 + i * .035, .25); candle(1150 + c * 66, 330 + r * 92, 1, a); }
      T_('≈ 60 candles', 1150 + 4.5 * 66, 850, '300 72px Inter', INK, 'center', fin(t, K1 + 2.6));
      T_('a wax candle gives about 13 lumens', 1150 + 4.5 * 66, 900, '400 28px Inter', INK2, 'center', fin(t, K1 + 3));
    }
    source('Unit and candle output: W. Nordhaus (1996)');
  },
  years(t) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0d0c0b'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(239,233,223,.5)'; g.lineWidth = 2; g.strokeRect(64, 64, W - 128, H - 128);
    const u = ease((t - .2) / Math.max(1, T - 1.2)), yr = Math.round(-1750 + 3050 * u);
    const s = yr < 0 ? `${-yr} BC` : `AD ${Math.max(1, yr)}`;
    T_(s, W / 2, 600, '400 190px "IM Fell English"', '#efe9df', 'center', fin(t, .1, .4));
    T_('… and light was still a luxury', W / 2, 740, 'italic 400 54px "IM Fell English"', 'rgba(239,233,223,.75)', 'center', fin(t, 1));
    const fl = 1 + .08 * Math.sin(t * 11) + .05 * Math.sin(t * 17);
    g.save(); g.translate(W / 2, 330); g.scale(1.6, 1.6 * fl); g.fillStyle = FLAMEC; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(16, -12, 12, -34, 0, -58); g.bezierCurveTo(-12, -34, -16, -12, 0, 0); g.fill(); g.restore();
  },
  things(t) {
    paper();
    const a0 = fin(t, .1, .4) * (1 - fin(t, K1 - .3, .4));
    T_('Here’s where it gets strange.', W / 2, H / 2 + 30, '300 96px Inter', INK, 'center', a0);
    if (t < K1 - .4) return;
    T_('What official price statistics track:', W / 2, 250, '600 44px Inter', INK, 'center', fin(t, K1));
    T_('the price of THINGS', W / 2, 310, '400 34px Inter', INK2, 'center', fin(t, K1 + .8));
    const items = [['candles', (x, y) => candle(x, y + 30, 1.4)], ['lamp oil', drop], ['gas', gasF], ['electricity', bolt]];
    items.forEach(([l, ic], i) => chip(170 + i * 330, 420, 280, 260, l, ic, fin(t, K2 + i * .45, .35)));
    chip(170 + 4 * 330, 420, 280, 260, 'LIGHT', (x, y) => bulb(x, y - 40, 34, 0), fin(t, K3, .4), { dash: true, fill: 'rgba(248,244,236,.5)', color: ACC, stroke: ACC });
    T_('not measured', 170 + 4 * 330 + 140, 740, '700 30px Inter', ACC, 'center', fin(t, K3 + .5));
  },
  fuel(t) {
    paper();
    const A = 1 - fin(t, K1 - .3, .5);
    if (A > 0) {   // light per dollar: candle → kerosene lamp → bulb (schematic)
      g.save(); g.globalAlpha = A;
      T_('Light you get for the money', W / 2, 220, '600 44px Inter', INK, 'center', fin(t, .1));
      const rows = [['candle', 90, .2], ['kerosene lamp', 420, 1.3], ['electric bulb', 1300, 3.3]];
      rows.forEach(([l, w, t0], i) => {
        const y = 380 + i * 170, u = outE((t - t0) / 1.2);
        T_(l, 560, y + 50, '400 36px Inter', INK, 'right', fin(t, t0 - .2));
        g.fillStyle = i === 2 ? '#e3a64a' : '#d8c6a4'; g.fillRect(600, y, w * u, 76);
      });
      T_('schematic, not to scale', W - 96, H - 60, '400 20px JBMono', INK2, 'right');
      g.restore();
    }
    const B = fin(t, K1, .5);
    if (B > 0) {   // fuel price can rise while the price of light falls through the floor
      g.save(); g.globalAlpha = B;
      const X0 = 300, X1 = 1620, Y0 = 760, u = outE((t - K1 - .3) / 3);
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(X0, 230); g.lineTo(X0, Y0); g.lineTo(X1, Y0); g.stroke();
      T_('time →', X1, Y0 + 50, '400 28px Inter', INK2, 'right'); T_('price', X0 - 20, 250, '400 28px Inter', INK2, 'right');
      g.strokeStyle = '#7d7568'; g.lineWidth = 7; g.beginPath(); for (let i = 0; i <= 100 * u; i++) { const x = X0 + (X1 - X0) * i / 100; g.lineTo(x, 520 - 120 * (i / 100) - 14 * Math.sin(i * .25)); } g.stroke();
      T_('price of the fuel', X0 + (X1 - X0) * .62, 380, '600 34px Inter', '#5f584d', 'left', fin(t, K1 + 1.6));
      g.strokeStyle = ACC; g.lineWidth = 9; g.beginPath(); for (let i = 0; i <= 100 * u; i++) { const x = X0 + (X1 - X0) * i / 100, k = i / 100; g.lineTo(x, 470 + 520 * k * k); } g.stroke();
      T_('price of LIGHT', X0 + (X1 - X0) * .5, 820, '700 38px Inter', ACC, 'left', fin(t, K1 + 2.6));
      T_('…through the floor', X0 + (X1 - X0) * .5, 864, '400 30px Inter', ACC, 'left', fin(t, K1 + 3.2));
      g.fillStyle = PAPER; g.fillRect(X1 + 4, 0, W, H);
      T_('schematic', W - 96, H - 60, '400 20px JBMono', INK2, 'right');
      g.restore();
    }
  },
  gap(t) {
    paper();
    const D = [[1800, 5.387], [1860, 1.152], [1870, .330], [1900, .2204], [1910, .0921], [1920, .0135], [1950, .00188], [1992, .00012]];
    const X0 = 300, X1 = 1500, YT = 220, YB = 860, LX = y => X0 + (y - 1800) / 192 * (X1 - X0), LY = v => YT + (1 - Math.log10(v)) / 5 * (YB - YT);
    T_('What 1,000 lumen-hours cost, in hours of work (log scale)', 96, 120, '600 36px Inter', INK, 'left', fin(t, .1));
    g.strokeStyle = 'rgba(28,29,32,.25)'; g.lineWidth = 1.5;
    [[10, '10 hours'], [1, '1 hour'], [.1, '6 minutes'], [.01, '36 seconds'], [.001, '3.6 seconds'], [.0001, '0.36 s']].forEach(([v, l]) => { g.beginPath(); g.moveTo(X0, LY(v)); g.lineTo(X1, LY(v)); g.stroke(); T_(l, X0 - 16, LY(v) + 8, '400 22px Inter', INK2, 'right', fin(t, .2)); });
    [1800, 1850, 1900, 1950, 1992].forEach(y => T_(String(y), LX(y), YB + 40, '400 24px Inter', INK2, 'center', fin(t, .2)));
    const u = outE((t - .5) / 3), uT = outE((t - K1 + 2.2) / 2.2);
    // the traditional-index line (schematic): same start, ending ~1,200× above the true price in 1992
    const trad = y => 5.387 * Math.pow(.00012 * 1200 / 5.387, (y - 1800) / 192);
    const yEnd = 1800 + 192 * u;
    if (uT > 0) {
      g.fillStyle = 'rgba(200,80,42,.12)'; g.beginPath();
      for (let y = 1800; y <= 1800 + 192 * uT; y += 2) g.lineTo(LX(y), LY(trad(y)));
      for (let y = 1800 + 192 * uT; y >= 1800; y -= 2) { const v = interp(D, y); g.lineTo(LX(y), LY(v)); }
      g.fill();
      g.strokeStyle = '#7d7568'; g.lineWidth = 5; g.setLineDash([14, 10]); g.beginPath(); for (let y = 1800; y <= 1800 + 192 * uT; y += 2) g.lineTo(LX(y), LY(trad(y))); g.stroke(); g.setLineDash([]);
      T_('what traditional price indexes implied', LX(1905), LY(trad(1905)) - 26, '600 28px Inter', '#5f584d', 'left', fin(t, K1 - 1.2));
    }
    g.strokeStyle = ACC; g.lineWidth = 7; g.beginPath(); for (let y = 1800; y <= yEnd; y += 1) g.lineTo(LX(y), LY(interp(D, y))); g.stroke();
    D.forEach(([y, v]) => { if (y <= yEnd) { g.fillStyle = ACC; g.beginPath(); g.arc(LX(y), LY(v), 8, 0, 7); g.fill(); } });
    T_('the true price of light', LX(1880), LY(.02) + 60, '700 30px Inter', ACC, 'left', fin(t, 2));
    const b = fin(t, K1, .4);
    if (b > 0) {
      const xa = LX(1992) + 30, y1 = LY(trad(1992)), y2 = LY(.00012);
      g.save(); g.globalAlpha = b; g.strokeStyle = ACC; g.lineWidth = 4; g.beginPath(); g.moveTo(xa, y1); g.lineTo(xa + 20, y1); g.lineTo(xa + 20, y2); g.lineTo(xa, y2); g.stroke();
      T_('overstated by', xa + 40, (y1 + y2) / 2 - 22, '400 30px Inter', ACC, 'left');
      T_('900–1,600×', xa + 40, (y1 + y2) / 2 + 30, '800 50px Inter', ACC, 'left'); g.restore();
    }
    source('True price: W. Nordhaus (1996), Table 1.4 · dashed line schematic; only its end gap (900–1,600×) is from the paper');
  },
  wages(t) {
    paper();
    T_('Real wages, 1800 → 1992: how many times better off?', 96, 160, '600 44px Inter', INK, 'left', fin(t, .1));
    const X0 = 520, S = 1250 / 200;
    const bar = (y, v, label, val, col, t0, dash) => {
      const u = outE((t - t0) / 1.2); if (u <= 0) return;
      T_(label, X0 - 30, y + 52, '400 34px Inter', INK, 'right', fin(t, t0 - .2));
      if (dash) { g.strokeStyle = col; g.lineWidth = 4; g.setLineDash([12, 10]); g.strokeRect(X0, y, v * S * u, 80); g.setLineDash([]); }
      else { g.fillStyle = col; g.fillRect(X0, y, v * S * u, 80); }
      T_(val, X0 + v * S * u + 24, y + 58, '800 52px Inter', col, 'left', fin(t, t0 + .8));
    };
    bar(330, 13, 'official statistics', '×13', '#6f685c', K1);
    bar(500, 40, 'Nordhaus estimate', '×40', ACC, K2);
    bar(670, 190, 'high-end estimate', '×190?', ACC, K3, true);
    source('W. Nordhaus (1996): conventional ×13; "low-bias" ×40 and "high-bias" ×190 estimates');
  },
  ekirch(t) {
    paper();
    T_('A. Roger Ekirch, historian', W / 2, 200, '600 52px Inter', INK, 'center', fin(t, .1));
    T_('found “first sleep” and “second sleep” in…', W / 2, 270, '400 36px Inter', INK2, 'center', fin(t, 1.2));
    ['court records', 'medical books', 'letters & diaries'].forEach((l, i) => chip(300 + i * 460, 340, 400, 140, l, null, fin(t, 3 + i * .9, .35)));
    const langs = [['English', 'first sleep'], ['French', 'premier sommeil'], ['Italian', 'primo sonno'], ['Latin', 'primo somno']];
    langs.forEach(([l, w], i) => {
      const a = fin(t, K1 + i * .5, .35); if (a <= 0) return;
      const x = 260 + i * 360;
      T_(l.toUpperCase(), x + 150, 620, '700 26px Inter', INK2, 'center', a);
      T_(w, x + 150, 680, 'italic 400 48px "IM Fell English"', INK, 'center', a);
    });
    source('A. R. Ekirch, At Day’s Close (2005) and later papers');
  },
  caveat(t) {
    paper();
    T_('BUT', W / 2, 280, '800 150px Inter', ACC, 'center', fin(t, .1, .3));
    g.save(); g.globalAlpha = fin(t, K1); g.fillStyle = INK; g.textAlign = 'center'; wrap(g, 'It doesn’t appear everywhere: one sleep researcher found no trace of it in Japan.', W / 2, 480, 1400, 64, '400 50px Inter'); g.restore();
    g.save(); g.globalAlpha = fin(t, K2); g.fillStyle = INK; g.textAlign = 'center'; wrap(g, 'The evidence: “suggestive, not definitive.”', W / 2, 700, 1400, 64, '600 50px Inter'); g.restore();
    source('Japan: B. Steger · "suggestive, not definitive": a 2007 review of the evidence');
  },
};
function interp(D, y) {
  for (let i = 1; i < D.length; i++) if (y <= D[i][0]) { const [y0, v0] = D[i - 1], [y1, v1] = D[i], k = (y - y0) / (y1 - y0); return Math.pow(10, Math.log10(v0) + k * (Math.log10(v1) - Math.log10(v0))); }
  return D[D.length - 1][1];
}
window.render = (t = 99) => { KINDS[KIND](t); overlay(g, t); };
window.DUR = 10; window.READY = true;
render(99);
