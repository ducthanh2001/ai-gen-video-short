// Evaluate timing + shots in node and export absolute-time cues for the audio builder.
import fs from 'fs'; import vm from 'vm';
const dir = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['timing.js', 'timeline.js', 'shots.js']) vm.runInContext(fs.readFileSync(dir + f, 'utf8'), ctx, { filename: f });
const shots = ctx.compileShots(ctx.SHOT_DEFS);
const out = { end: ctx.END, sent: ctx.SENT, chapters: ctx.CHAPTERS, shots: shots.map(s => {
  const dur = s.t1 - s.t0, pops = [];
  (s.items || []).forEach(it => { if ((it.k === 'bust' || it.k === 'prop') && (it.in || 'pop') === 'pop' && (it.at || 0) < dur && !(it.pos && it.pos[0] < 0)) pops.push(+(s.t0 + (it.at || 0)).toFixed(3)); });
  return { t0: +s.t0.toFixed(3), t1: +s.t1.toFixed(3), bg: s.bg || 'map', sfx: (s.sfx || []).map(([u, n, g]) => [+(s.t0 + u * dur).toFixed(3), n, g ?? 1]), pops, cut: !!s.cut, travel: s.bg === 'map' && !s.cut };
}) };
fs.writeFileSync(dir + 'cues.json', JSON.stringify(out));
console.log('shots', out.shots.length, 'end', out.end, 'avg shot', (out.end / out.shots.length).toFixed(2) + 's');
const long = out.shots.filter(s => s.t1 - s.t0 > 6); console.log('shots >6s:', long.map(s => `${s.t0.toFixed(0)}(${(s.t1 - s.t0).toFixed(1)})`).join(' '));
