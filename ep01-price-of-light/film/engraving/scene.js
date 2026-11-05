// Copperplate plates for "The Price of Light". Ink only (lines, never fills); the hand-laid wash is reserved for flames.
//   ?plate=lamps (default)  three illuminants of the 1850s: tallow candle, whale-oil lamp, rock-oil lamp
//   ?plate=silliman         New Haven 1855: fuels burned side by side; the fourth is rock oil   (k1 = when rock oil is named)
//   ?plate=quote            Stotz 1938: "...and life to the few remaining whales."
//   ?plate=next             next episode: frozen water (Boston → Calcutta, 1833)
// Edit cues: common/overlay.js (tags, chap, say); es = engraving speed (1 = the plate is cut in ~4 s)
import { B, engraveShape, Wash, drawSheet, engraveText } from '../engines/engraving/index.js';
import { loadNow } from '../common/tag.js';
import { overlay, qn, qs } from '../common/overlay.js';

const W = 1920, H = 1080;
const ctx = document.getElementById('c').getContext('2d');
await Promise.all(['600 22px Inter', '300 56px Inter', '400 20px Inter', '700 20px Inter', '400 34px "IM Fell English"'].map(f => document.fonts.load(f))); await loadNow('stills/today_bare_1.jpg');
await document.fonts.load('600 40px "Bodoni Moda"'); await document.fonts.load('italic 400 40px "Bodoni Moda"');
const PLATE = qs('plate', 'lamps'), ES = qn('es', 1), K1 = qn('k1', 6);
const ink = new B.Ink(), LIGHT = [-0.6, -0.7], groups = [], wash = new Wash({ scale: 1.5 }), flames = [];
let gi = 0;
function part(d, x, y, s, o = {}) {
  const g = 'p' + (gi++) + '_';
  const r = engraveShape(d, { at: B.xf(x, y, s), light: LIGHT, spacing: o.spacing ?? 4.2, style: o.style ?? 'contour', wMax: o.wMax ?? 1.9, ink, g, seed: gi });
  groups.push(g); return r;
}
const FLAME = 'M0 0 C20 -24 16 -62 0 -104 C-16 -62 -20 -24 0 0 Z';
function flame(x, y, s, t0) {
  const r = part(FLAME, x, y, s, { spacing: 3.2, wMax: 1.1 });
  flames.push({ shape: r.shape, origin: [x, y - 50 * s], t0 });
}
const texts = [];   // [str, x, y, opts, t0, dur]
const T_ = (str, x, y, o, t0, dur = 1) => texts.push([str, x, y, o, t0 / ES, dur / ES]);

if (PLATE === 'lamps') {
  const X1 = 330, Y1 = 640, X2 = 740, Y2 = 660, X3 = 1150, Y3 = 690;
  part('M-150 170 C-150 205 150 205 150 170 L118 146 L-118 146 Z', X1, Y1, 1);
  part('M118 160 C175 150 190 112 160 92 C140 80 124 96 132 112', X1, Y1, 1, { style: 'hatch' });
  part('M-34 146 L-34 -150 C-34 -162 34 -162 34 -150 L34 146 Z', X1, Y1, 1);
  part('M34 -120 C48 -96 44 -60 38 -40 L34 -40 L34 -120 Z', X1, Y1, 1, { spacing: 3.4 });
  flame(X1, Y1 - 166, 1.05);
  part('M-110 140 C-110 172 110 172 110 140 L76 120 L-76 120 Z', X2, Y2, 1);
  part('M-20 120 L-20 30 L20 30 L20 120 Z', X2, Y2, 1);
  part('M-96 30 C-136 -20 -122 -96 -50 -110 L50 -110 C122 -96 136 -20 96 30 Z', X2, Y2, 1);
  part('M-14 -110 L-14 -158 L14 -158 L14 -110 Z', X2, Y2, 1, { spacing: 3.4 });
  flame(X2, Y2 - 164, .9);
  part('M-120 130 C-120 162 120 162 120 130 L84 112 L-84 112 Z', X3, Y3, 1);
  part('M-24 112 L-24 50 L24 50 L24 112 Z', X3, Y3, 1);
  part('M-104 50 C-140 4 -118 -52 -56 -62 L56 -62 C118 -52 140 4 104 50 Z', X3, Y3, 1);
  part('M-50 -62 L-50 -96 L50 -96 L50 -62 Z', X3, Y3, 1, { spacing: 3.4 });
  part('M-36 -96 C-74 -140 -74 -196 -26 -228 L-22 -380 L22 -380 L26 -228 C74 -196 74 -140 36 -96 Z', X3, Y3, 1, { spacing: 6.5, wMax: 1.0 });
  flame(X3, Y3 - 110, 1.0);
  T_('THE PRICE OF LIGHT.', 740, 150, { size: 54, weight: 600, track: 0.16 }, .5);
  T_('Three illuminants of the eighteenth & nineteenth centuries.', 740, 205, { size: 30, italic: true }, 1);
  for (const [x, s] of [[X1, 'Fig. 1.  Tallow candle.'], [X2, 'Fig. 2.  Whale-oil lamp.'], [X3, 'Fig. 3.  Rock-oil (kerosene) lamp.']]) T_(s, x, 905, { size: 28, italic: true }, 3);
  T_('Source: W. Nordhaus (1996)', 740, 975, { size: 22, italic: true }, 3.5);
}
if (PLATE === 'silliman') {
  T_('NEW HAVEN, 1855.', W / 2, 190, { size: 58, weight: 600, track: 0.16 }, .2);
  T_('Benjamin Silliman Jr., chemist at Yale, burns lamp fuels side by side', W / 2, 262, { size: 34, italic: true }, .9, 1.4);
  T_('and measures how much light each gives for the money.', W / 2, 308, { size: 34, italic: true }, 1.8, 1.2);
  part('M-640 0 L640 0 L640 26 L-640 26 Z', W / 2, 760, 1, { style: 'hatch' });                       // the bench
  const XS = [-480, -160, 160, 480];
  XS.forEach((dx, i) => {
    const x = W / 2 + dx, y = 760, last = i === 3;
    part('M-70 0 C-70 -18 70 -18 70 0 L50 -10 L-50 -10 Z', x, y, 1);                                   // foot
    part('M-14 -10 L-14 -70 L14 -70 L14 -10 Z', x, y, 1);                                              // stem
    part('M-70 -70 C-96 -110 -84 -170 -36 -178 L36 -178 C84 -170 96 -110 70 -70 Z', x, y, 1);         // font
    part('M-28 -178 C-54 -206 -54 -246 -18 -268 L-16 -360 L16 -360 L18 -268 C54 -246 54 -206 28 -178 Z', x, y, 1, { spacing: 6.5, wMax: 1.0 });
    flame(x, y - 190, last ? 1.0 : .62 + i * .06, last ? K1 : undefined);
  });
  T_('other fuels of the day', W / 2 - 160, 860, { size: 28, italic: true }, 3);
  T_('ROCK OIL', W / 2 + 480, 860, { size: 34, weight: 600, track: .14 }, K1 * ES);
  T_('(petroleum)', W / 2 + 480, 902, { size: 28, italic: true }, K1 * ES + .6);
}
if (PLATE === 'quote') {
  // a sperm whale, natural-history style
  part('M-330 0 C-332 -70 -290 -104 -200 -108 L120 -92 C220 -80 280 -50 320 -16 L370 -50 C392 -62 404 -40 392 -20 L356 6 L392 32 C404 54 386 66 368 56 L320 26 C260 52 150 70 40 72 L-220 68 C-300 64 -330 44 -330 0 Z', W / 2, 760, 1.15);
  part('M-318 30 C-260 52 -180 56 -120 50 L-124 60 C-190 66 -270 60 -320 40 Z', W / 2, 760, 1.15, { spacing: 3 });   // lower jaw
  T_('“...the discovery of petroleum in Pennsylvania', W / 2, 250, { size: 50, italic: true }, .2, 1.4);
  T_('gave kerosene to the world,', W / 2, 322, { size: 50, italic: true }, 1.4, 1);
  T_('and life to the few remaining whales.”', W / 2, 394, { size: 50, italic: true }, 2.3, 1.2);
  T_('— Louis Stotz, 1938', W / 2, 470, { size: 30, weight: 600, track: .12 }, 3.4);
}
if (PLATE === 'next') {
  // a block of ice: three faces, the light face nearly bare
  part('M0 0 L220 -90 L220 150 L0 240 Z', W / 2 + 360, 600, 1, { spacing: 7, wMax: .9 });
  part('M0 0 L-200 -80 L-200 160 L0 240 Z', W / 2 + 360, 600, 1, { spacing: 4 });
  part('M0 0 L220 -90 L20 -170 L-200 -80 Z', W / 2 + 360, 600, 1, { spacing: 9, wMax: .7 });
  T_('NEXT TIME', W / 2 - 300, 330, { size: 34, weight: 600, track: .3 }, .2);
  T_('FROZEN WATER.', W / 2 - 300, 430, { size: 96, weight: 600, track: .08 }, .6, 1.2);
  T_('In 1833, a ship carried New England ice', W / 2 - 300, 540, { size: 36, italic: true }, 2, 1.2);
  T_('some 16,000 miles, to Calcutta.', W / 2 - 300, 590, { size: 36, italic: true }, 2.8, 1.2);
}

// cutting order: outlines first, then the three hatching passes
const G = k => groups.map(g => g + k);
ink.schedule(G('ol'), 0, 1.4 / ES, { conc: 4 }); ink.schedule(G('h1'), 1.0 / ES, 2.6 / ES, { conc: 60 }); ink.schedule(G('h2'), 2.0 / ES, 3.2 / ES, { conc: 60 }); ink.schedule(G('h3'), 2.8 / ES, 3.8 / ES, { conc: 60 });
ink.build();
flames.forEach((f, i) => wash.add({ path: f.shape.path, polys: f.shape.polys, color: '#E8742A', origin: f.origin, t0: f.t0 ?? (4.0 + i * .3) / ES, dur: 1.0, alpha: .9 }));

window.render = t => {
  t = t ?? 10;
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawSheet(ctx);
  wash.draw(ctx, t); ink.draw(ctx, t);
  for (const [str, x, y, o, t0, dur] of texts) engraveText(ctx, str, x, y, { ...o, p: (t - t0) / dur });
  overlay(ctx, t);
};
window.DUR = 6; window.READY = true;
render(10);
