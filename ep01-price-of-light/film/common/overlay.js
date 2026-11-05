// Shared, time-driven overlay for every scene of Ep 01, configured from the URL so the edit (tools/plan.py) can cue it:
//   tags=key@t,key@t…   price tag: which era is shown from time t (switches with a quick flip)   tagpos=x,y,scale
//   now=0               hide the NOW inset (shown by default whenever a tag is shown)            nowpos=x,y,w
//   chap=I|Fire and oil  chapter title, in from cin (s), out after 3.4 s;  cf = font, cc = colour
//   say=Big line|small line   centred statement from sin (s) over a dark scrim
// Unit: 1,000 lumen-hours ≈ one 800-lumen bulb for 1¼ hours (FACTS.md §B).
import { drawTag, drawNow } from './tag.js';
const W = 1920, H = 1080;
const Q = new URLSearchParams(location.search);
export const qn = (k, d) => (Q.has(k) ? +Q.get(k) : d);
export const qs = (k, d) => (Q.has(k) ? Q.get(k) : d);
export const T = qn('T', 10);
const ease = u => (u = Math.max(0, Math.min(1, u)), u * u * (3 - 2 * u));

export const TAGS = {
  fire:    { era: 'EARLY HUMANS · an open fire', hours: 58, value: '58 hours', note: 'mostly spent gathering wood' },
  stone:   { era: 'STONE LAMP · burning animal fat', hours: 50, value: '50 hours' },
  babylon: { era: 'BABYLON · c. 1750 BC · sesame-oil lamp', hours: 41.5, value: '41½ hours' },
  1800:    { era: '1800 · tallow candle', hours: 5.387, value: '5.4 hours' },
  1870:    { era: '1870 · kerosene lamp', hours: 0.330, value: '20 minutes' },
  1900:    { era: '1900 · early electric light', hours: 0.2204, value: '13 minutes' },
  1920:    { era: '1920 · electric light', hours: 0.0135, value: '49 seconds' },
  1950:    { era: '1950 · electric light', hours: 0.00188, value: '7 seconds' },
  today:   { era: 'TODAY · LED', hours: 0.0000542, value: '0.2 seconds', note: 'electricity only · US average wage & power price, 2026', dark: true },
};
const tagList = (qs('tags', '') || '').split(',').filter(Boolean).map(s => { const [k, at] = s.split('@'); return { k, at: +(at ?? 0) }; });
const [TX, TY, TS] = (qs('tagpos', '110,96,1')).split(',').map(Number);
const [NX, NY, NW] = (qs('nowpos', `${W - 96 - 400},96,400`)).split(',').map(Number);

export function overlay(g, t) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  // —— price tag (+ NOW inset) ——
  let cur = null, prev = null;
  for (const e of tagList) if (t >= e.at) { prev = cur; cur = e; }
  if (cur && TAGS[cur.k]) {
    const u = ease((t - cur.at) / .35), first = !prev;
    g.save();
    if (first) { g.globalAlpha = u; g.translate(-40 * (1 - u), 0); }
    else if (u < 1) { g.globalAlpha = .4 + .6 * u; g.translate(TX, TY + 107 * TS); g.scale(1, Math.max(.05, Math.abs(1 - 2 * Math.min(u * 1.6, 1)) ** .7)); g.translate(-TX, -(TY + 107 * TS)); }
    drawTag(g, { ...TAGS[(!first && u < .31) ? prev.k : cur.k], x: TX, y: TY, scale: TS });
    g.restore();
    if (qn('now', 1)) { const v = ease((t - tagList[0].at - .25) / .4); g.save(); g.globalAlpha = v; drawNow(g, { x: NX, y: NY, w: NW }); g.restore(); }
  }
  // —— chapter title ——
  const chap = qs('chap', '');
  if (chap) {
    const t0 = qn('cin', .3), a = ease((t - t0) / .6) * (1 - ease((t - t0 - 3.4) / .7));
    if (a > 0) {
      const [num, title] = chap.split('|'), font = qs('cf', 'IM Fell English'), col = qs('cc', '#f4efe6');
      g.globalAlpha = a; g.textBaseline = 'alphabetic'; g.textAlign = 'center';
      g.fillStyle = 'rgba(10,9,8,.55)'; g.fillRect(0, H / 2 - 120, W, 240);
      g.fillStyle = col; g.font = `400 34px "${font}"`; g.fillText(`CHAPTER ${num}`.split('').join(' '), W / 2, H / 2 - 40);
      g.font = `400 92px "${font}"`; g.fillText(title, W / 2 + (1 - a) * 20, H / 2 + 62);
      g.globalAlpha = 1;
    }
  }
  // —— a centred statement ——
  const say = qs('say', '');
  if (say) {
    const t0 = qn('sin', .5), a = ease((t - t0) / .7), [l1, l2] = say.split('|');
    g.globalAlpha = a * .62; g.fillStyle = '#0d0c10'; g.fillRect(0, 0, W, H); g.globalAlpha = a;
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#f4efe6';
    wrap(g, l1, W / 2, H / 2 - (l2 ? 40 : -20), 1500, 76, '300 68px Inter');
    if (l2) { g.globalAlpha = ease((t - qn('sin2', t0 + 1.2)) / .7); g.fillStyle = '#e9a27f'; wrap(g, l2, W / 2, H / 2 + 110, 1400, 48, '400 36px Inter'); }
  }
  g.restore();
}

export function wrap(g, s, x, y, maxW, lh, font) {
  g.font = font; const words = s.split(' '), lines = []; let cur = '';
  for (const w of words) { const n = cur ? cur + ' ' + w : w; if (g.measureText(n).width > maxW && cur) { lines.push(cur); cur = w; } else cur = n; }
  if (cur) lines.push(cur);
  const y0 = y - (lines.length - 1) * lh / 2; lines.forEach((l, i) => g.fillText(l, x, y0 + i * lh)); return lines.length;
}
