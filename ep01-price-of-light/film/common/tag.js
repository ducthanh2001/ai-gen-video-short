// Shared data overlay for every era: the price tag (what the same light cost, in work) and the NOW inset.
// Unit everywhere: 1,000 lumen-hours ≈ one ordinary 800-lumen bulb burning for 1¼ hours (FACTS.md §B).
const W = 1920, H = 1080;
export const UNIT = 'Light of one bulb for 1¼ hours cost';

// workday bar: 8-hour days, filled by the hours of work
function dayBar(g, x, y, hours, dark) {
  const days = hours / 8, n = Math.max(1, Math.ceil(days)), bw = Math.min(64, 420 / n), gap = 8;
  for (let i = 0; i < n; i++) {
    const f = Math.max(0, Math.min(1, days - i));
    g.strokeStyle = dark ? 'rgba(244,239,230,.7)' : 'rgba(28,29,32,.55)'; g.lineWidth = 2; g.strokeRect(x + i * (bw + gap), y, bw, 22);
    g.fillStyle = '#c8502a'; g.fillRect(x + i * (bw + gap) + 2, y + 2, Math.max(hours > 0.01 ? 2 : 0, (bw - 4) * f), 18);
  }
  g.font = '400 18px Inter'; g.fillStyle = dark ? 'rgba(244,239,230,.75)' : 'rgba(28,29,32,.65)'; g.textAlign = 'left';
  const lab = days >= 1 ? `≈ ${days.toFixed(1)} working days (8 h)` : hours >= 1 ? `≈ ${Math.round(hours / 8 * 100)}% of a working day` : 'not even a sliver of a working day';
  g.fillText(lab, x, y + 46);
}

// o: { era, hours, value, note, x, y, dark }
export function drawTag(g, o) {
  const sc = o.scale ?? 1, x0 = o.x ?? 96, y0 = o.y ?? (H - 320);
  g.save(); g.translate(x0, y0); g.scale(sc, sc);
  const x = 0, y = 0, w = 580, h = o.note ? 246 : 214, dark = !!o.dark;
  g.globalAlpha = .93; g.fillStyle = dark ? '#16151c' : '#f3ede2'; g.beginPath(); g.roundRect(x, y, w, h, 8); g.fill(); g.globalAlpha = 1;
  g.fillStyle = '#c8502a'; g.fillRect(x, y, 6, h);
  const ink = dark ? '#f4efe6' : '#1c1d20', ink2 = dark ? 'rgba(244,239,230,.72)' : 'rgba(28,29,32,.66)';
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.font = '600 22px Inter'; g.fillStyle = ink; g.fillText(o.era, x + 28, y + 40);
  g.font = '400 20px Inter'; g.fillStyle = ink2; g.fillText(UNIT, x + 28, y + 70);
  g.font = '300 56px Inter'; g.fillStyle = o.hours < .001 ? '#c8502a' : ink; g.fillText(o.value + ' of work', x + 26, y + 128);
  dayBar(g, x + 28, y + 148, o.hours, dark);
  if (o.note) { g.font = '400 16px Inter'; g.fillStyle = ink2; g.fillText(o.note, x + 28, y + h - 18); }
  g.restore();
}

// NOW inset: a small window onto today's desk, always in the same corner
let NOW = null;
export async function loadNow(url = 'stills/today_bare.jpg') { NOW = new Image(); NOW.src = url; await NOW.decode().catch(() => { NOW = null; }); }
export function drawNow(g, o = {}) {
  if (!NOW) return;
  const w = o.w ?? 400, h = Math.round(w * 9 / 16), x = o.x ?? (W - w - 96), y = o.y ?? 96;
  g.save();
  g.fillStyle = '#16151c'; g.fillRect(x - 6, y - 6, w + 12, h + 66);
  g.drawImage(NOW, x, y, w, h);
  g.font = '700 20px Inter'; g.fillStyle = '#f4efe6'; g.textAlign = 'left'; g.fillText('NOW', x + 4, y + h + 26);
  g.font = '400 20px Inter'; g.fillStyle = '#e9a27f'; g.textAlign = 'right'; g.fillText('same light: 0.2 seconds of work', x + w - 4, y + h + 26);
  g.font = '400 14px Inter'; g.fillStyle = 'rgba(244,239,230,.6)'; g.fillText('electricity only', x + w - 4, y + h + 46);
  g.restore();
}
