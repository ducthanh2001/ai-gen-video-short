// Shot list for Ep 01. Each S()/G() call anchors shots to sentence ids; several shots in one call split the span equally.
// Coordinates: design space 1920x1080. Map shots: cam [lon,lat,zoom]; stage shots: cam [x,y,zoom]. Items default to screen/stage coords.
(function () {
  const SH = [], T = id => SENT.find(s => s.id === id).s, rel = (a, id) => T(id) - T(a);
  const S = (a, ...xs) => xs.forEach((x, i) => SH.push(Object.assign({}, x, { a, b: a, split: i > 0 })));
  const G = (a, b, ...xs) => xs.forEach((x, i) => SH.push(Object.assign({}, x, { a, b, split: i > 0 })));
  const B = (c, x, y, s, o = {}) => Object.assign({ k: 'bust', c, pos: [x, y], s }, o);
  const Pr = (n, x, y, s, o = {}) => Object.assign({ k: 'prop', n, pos: [x, y], s }, o);
  const Tx = (t, x, y, s, st, o = {}) => Object.assign({ k: 'text', t, pos: [x, y], s, st }, o);
  const Tr = (a, b, o = {}) => Object.assign({ k: 'trail', a, b }, o);
  const Pin = (t, lon, lat, o = {}) => Object.assign({ k: 'pin', t, pos: [lon, lat], sys: 'geo', s: 30 }, o);
  const Gl = (x, y, s, o = {}) => Object.assign({ k: 'glow', pos: [x, y], s }, o);
  const st = (bg, items, o = {}) => Object.assign({ bg, items }, o);          // stage shot
  const mp = (cam, items, o = {}) => Object.assign({ bg: 'map', cam, items }, o); // map shot
  const GREECE = [22.8, 38.6, 0.9], CRETE = [24.9, 35.3, 1.5], WIDE = [22, 38.5, 0.3];
  const row5 = (names, y, s, o = {}) => names.map((n, i) => B(n, 290 + i * 335, y, s, Object.assign({ at: 0.15 * i, ph: i }, typeof o === 'function' ? o(i) : o)));

  // ============================================================ HOOK
  S('h1_1',
    st('night', [B('zeus', 960, 640, 440, { e: [[0, 'grin'], [0.55, 'swallow']], look: 0.2 }), B('metis', 1560, 700, 260, { e: 'worry', at: 0.2, mv: { to: [1030, 520], u0: 0.5, u1: 0.8, bend: -80 }, until: 0.92 * 0 + 1.6 })],
      { cam: [960, 540, 1], cam2: [960, 560, 1.12], cut: true, sfx: [[0.0, 'thud', 1], [0.8, 'gulp', 1]], fx: [{ t: 'flash', u: 0.82, dur: 0.18, a: 0.5 }] }));
  S('h1_2',
    st('night', [B('metis', 960, 640, 400, { e: 'worry', look: 0 }), Pr('baby', 1380, 520, 190, { at: 0.4, bob: true }), Gl(1380, 520, 260, { at: 0.4 })], { cam2: [960, 540, 1.1], sfx: [[0.4, 'chime', 0.7]] }));
  S('h2_1',
    st('night', [B('zeus', 960, 650, 520, { e: 'smug', look: 0.3 })], { cam: [960, 560, 1.0], cam2: [960, 600, 1.2], fx: [{ t: 'dim', u0: 0, u1: 1, a: 0.15 }], sfx: [[0, 'sting', 0.8]] }));
  S('h2_2',
    st('parch', [B('hesiod', 640, 650, 340, { in: 'left' }), Pr('scroll', 1280, 560, 380, { at: 0.35, rot: -0.06, plain: true }), Tx('THEOGONY', 1280, 560, 62, 'label', { at: 0.6 })], { cam2: [960, 540, 1.08], sfx: [[0.35, 'whoosh', 0.6]] }));
  G('h3_1', 'h3_1',
    st('storm', [Tx('10 YEARS', 960, 250, 150, 'big', { at: 0.1 }), B('zeus', 960, 700, 380, { e: 'angry', at: 0.2 }), Pr('bolt', 1450, 560, 330, { at: 0.5, bob: true })], { fx: [{ t: 'flash', u: 0.3, dur: 0.2 }], sfx: [[0.3, 'thunder', 0.8]] }),
    st('storm', [B('typhoeus', 960, 700, 330, { e: 'shout', in: 'up' }), Tx('100 HEADS', 960, 190, 140, 'big', { at: 0.25 })], { fx: [{ t: 'shake', u0: 0, u1: 0.5, amp: 12 }], sfx: [[0.05, 'roar', 0.7]] }),
    st('sky', [B('zeus', 960, 690, 360, { e: 'grin' }), Pr('crown', 960, 220, 200, { in: 'drop', at: 0.3 }), B('hera', 380, 720, 230, { at: 0.5, e: 'smile' }), B('poseidon', 1540, 720, 230, { at: 0.65, e: 'smile', flip: true }), B('demeter', 200, 520, 170, { at: 0.8, e: 'smile' }), B('hades', 1720, 520, 170, { at: 0.95, e: 'smile', flip: true })], { sfx: [[0.3, 'ding', 0.8]] }));
  G('h4_1', 'h4_1',
    st('chaos', [Tx('◀◀', 960, 520, 420, 'big', { col: '#ffd36a', in: 'fade' }), Tx('GO BACK', 960, 800, 100, 'big', { at: 0.3 })], { sfx: [[0, 'rewind', 0.7]], cut: false }),
    st('night', [B('ouranos', 960, 640, 440, { e: 'angry', at: 0.05 }), B('cronos', 330, 760, 190, { e: 'scared', at: 0.5, flip: false }), B('titan', 1590, 760, 190, { e: 'scared', at: 0.65, flip: true })], { cam2: [960, 540, 1.1], sfx: [[0.05, 'sting', 0.6]] }));
  G('h5_1', 'h5_1',
    st('parch', [B('cronos', 600, 650, 380, { e: [[0, 'neutral'], [0.5, 'swallow']] }), Pr('stone', 1300, 560, 260, { at: 0.15, mv: { to: [800, 520], u0: 0.5, u1: 0.9, bend: -80 }, bob: true })], { sfx: [[0.9, 'gulp', 0.8]] }),
    { bg: 'photo', items: [{ k: 'photo', img: 't', kb: [[0.55, 0.45, 1.0], [0.45, 0.4, 1.35]] }], cap: true, dim: 0.0, sfx: [[0, 'sting', 0.7]] });

  // ============================================================ I. THE FIRST RULER OF THE SKY
  S('a1_1', mp(WIDE, [Tx('c. 700 BC', 960, 250, 150, 'year', { in: 'fade' }), Pin('', 23.0, 38.3, { at: 0.5 })], { cam2: [22.6, 38.4, 0.42], cut: true }));
  S('a1_2', mp([22.8, 38.4, 0.9], [B('hesiod', 960, 640, 400, { e: 'smile' }), Tx('HESIOD', 960, 215, 110, 'label', { at: 0.3 })], { cam2: [22.8, 38.4, 1.0] }));
  S('a1_3', st('parch', [Pr('scroll', 960, 520, 520, { rot: -0.05, plain: true }), Tx('THEOGONY', 960, 505, 80, 'label', { at: 0.2 }),
    B('zeus', 360, 800, 170, { at: 0.8, e: 'smile' }), B('hera', 640, 860, 150, { at: 1.1, e: 'smile' }), B('poseidon', 1280, 860, 150, { at: 1.4, e: 'smile', flip: true }), B('hades', 1560, 800, 170, { at: 1.7, e: 'smile', flip: true })], { cam2: [960, 540, 1.06] }));
  S('a2_1', st('chaos', [Tx('CHAOS', 960, 520, 230, 'label', { col: '#fff', in: 'fade', at: 0.2 })], { cam2: [960, 540, 1.15], sfx: [[0, 'rumble', 0.6]] }));
  S('a2_2', st('night', [Pr('stone', -999, -999, 1), { k: 'earth', pos: [960, 880], s: 520, in: 'up' }, B('gaia', 960, 700, 380, { e: 'smile', in: 'up', at: 0.15 }), Tx('GAIA · EARTH', 960, 150, 90, 'label', { at: 0.5, col: '#fff' })], { cam2: [960, 540, 1.06], sfx: [[0.15, 'chime', 0.8]] }));
  G('a2_3', 'a2_3',
    st('night', [{ k: 'earth', pos: [960, 960], s: 520 }, B('gaia', 960, 780, 300, { e: 'smile' }), B('ouranos', 960, 260, 150, { at: 0.3, mv: { to: [960, 280], u0: 0.2, u1: 0.5 }, e: 'smile' })], { cam2: [960, 540, 1.05] }),
    st('night', [{ k: 'earth', pos: [960, 1000], s: 560 }, B('gaia', 960, 800, 300, { e: 'smile' }), { k: 'dome', pos: [960, 700], s: 540, in: 'drop', at: 0.15 }, B('ouranos', 960, 330, 240, { at: 0.5, e: 'grin' }), Tx('OURANOS · SKY', 960, 120, 80, 'label', { at: 0.8, col: '#fff' })], { cam2: [960, 540, 1.06], sfx: [[0.15, 'thud', 0.7]] }));
  S('a3_1', st('night', [B('gaia', 520, 650, 330, { e: 'smile' }), B('ouranos', 1400, 650, 330, { e: 'smile', flip: true, at: 0.1 }), Pr('baby', 960, 380, 150, { at: 0.5, bob: true }), Pr('baby', 800, 270, 110, { at: 0.8, bob: true, ph: 1 }), Pr('baby', 1120, 270, 110, { at: 1.1, bob: true, ph: 2 })]));
  S('a3_2', st('parch', Array.from({ length: 12 }, (_, i) => B('titan', 250 + (i % 6) * 285, 430 + Math.floor(i / 6) * 330, 170, { at: 0.12 * i, e: 'neutral', ph: i, look: (i % 3 - 1) * 0.6 })).concat([Tx('12 TITANS', 960, 90, 90, 'label', { at: 0.2 })]), { cam2: [960, 540, 1.04] }));
  S('a3_3', st('parch', [B('cyclops', 400, 650, 270, { e: 'smile' }), B('cyclops', 960, 650, 270, { e: 'smile', at: 0.2 }), B('cyclops', 1520, 650, 270, { e: 'smile', at: 0.4 }), Pr('bolt', 960, 250, 200, { at: 0.8, bob: true }), Tx('3 CYCLOPES', 960, 90, 90, 'label', { at: 0.2 })]));
  G('a3_4', 'a3_4',
    st('parch', [B('cottus', 960, 700, 360, { e: 'grin' }), Tx('100 ARMS', 380, 260, 100, 'big', { at: 0.4, rot: -0.08 })], { cam2: [960, 540, 1.06] }),
    st('parch', [B('cottus', 960, 700, 360, { e: 'shout' }), Tx('50 HEADS', 1540, 260, 100, 'big', { at: 0.1, rot: 0.08 }), Tx('3 HUNDRED-HANDERS', 960, 90, 80, 'label')], { cam2: [960, 540, 1.06] }));
  S('a4_1', st('night', [B('ouranos', 960, 560, 460, { e: 'angry' }), B('cottus', 360, 800, 190, { e: 'scared', at: 0.3 }), B('cottus', 1560, 800, 190, { e: 'scared', at: 0.45, flip: true })], { fx: [{ t: 'shake', u0: 0.1, u1: 0.5, amp: 6 }] }));
  S('a4_2', st('night', [B('gaia', 960, 700, 420, { e: 'worry' }), B('ouranos', 960, 215, 170, { e: 'angry' }),
    B('titan', 420, 600, 200, { at: 0.2, mv: { to: [900, 700], u0: 0.35, u1: 0.55 }, until: 1.8 }), B('cyclops', 1500, 600, 200, { at: 0.8, mv: { to: [1020, 700], u0: 0.6, u1: 0.75 }, until: 2.5 })]));
  S('a5_1', st('night', [B('gaia', 960, 680, 460, { e: 'cry', sq: [0.1, 0.9, 0.04] }), Tx('...', 1450, 400, 120, 'big', { at: 0.4, col: '#ffd36a' })], { cam2: [960, 540, 1.1], sfx: [[0, 'rumble', 0.7]] }));
  G('a5_2', 'a5_2',
    st('night', [B('gaia', 640, 650, 340, { e: 'smile' }), Pr('sickle', 1320, 540, 380, { in: 'drop', at: 0.1, rot: 0.1 }), Pr('rock', 1000, 800, 160, { at: 0.2 })], { sfx: [[0.1, 'ding', 0.8]] }),
    st('night', [B('gaia', 330, 650, 300, { e: 'neutral' }), B('titan', 960, 650, 220, { at: 0.1, e: 'neutral' }), B('cyclops', 1360, 650, 220, { at: 0.25 }), B('cronos', 1680, 650, 220, { at: 0.4, flip: true }), Pr('sickle', 560, 480, 160, { mv: { to: [1360, 380], u0: 0.3, u1: 0.8, bend: -140 }, rot: 0.3 })]));
  S('a6_1', st('night', Array.from({ length: 4 }, (_, i) => B(['titan', 'titan', 'cyclops', 'titan'][i], 330 + i * 420, 640, 250, { e: 'scared', at: 0.12 * i, ph: i })), { fx: [{ t: 'shake', u0: 0, u1: 0.9, amp: 3 }] }));
  S('a6_2', st('night', [B('titan', 330, 640, 250, { e: 'scared', until: 0.5 }), B('titan', 750, 640, 250, { e: 'scared', until: 0.7 }), B('cyclops', 1170, 640, 250, { e: 'scared', until: 0.6 }), B('cronos', 1590, 640, 250, { e: 'neutral', flip: true, mv: { to: [960, 640], u0: 0.3, u1: 0.8 } })]));
  S('a6_3', st('parch', [B('cronos', 960, 650, 430, { e: 'smug' }), Tx('CRONOS', 960, 160, 110, 'label', { at: 0.2 })], { cam2: [960, 540, 1.1] }));
  S('a7_1', st('night', [Pr('rock', 520, 740, 330, { }), B('cronos', 560, 560, 260, { e: 'neutral', look: 0.6 }), B('gaia', 1300, 640, 330, { e: 'smile', flip: true, at: 0.2 }), Pr('sickle', 1180, 440, 200, { mv: { to: [640, 480], u0: 0.35, u1: 0.8, bend: -100 }, rot: 0.2, at: 0.5 })]));
  G('a7_2', 'a7_2',
    st('night', [Pr('star', 1650, 160, 150, {}), B('ouranos', 1100, 640, 380, { in: 'right', e: 'neutral', flip: true }), B('cronos', 480, 700, 250, { e: 'angry', at: 0.7, mv: { to: [840, 640], u0: 0.65, u1: 0.85 } }), Pr('sickle', 560, 520, 170, { at: 0.8, mv: { to: [1000, 600], u0: 0.75, u1: 0.95 }, spin: 8 })], { fx: [{ t: 'flash', u: 0.9, dur: 0.25 }, { t: 'shake', u0: 0.9, u1: 1, amp: 14 }], sfx: [[0.9, 'crash', 0.9]] }));
  S('a7_3', st('sky', [Pr('throne', 960, 640, 520, { in: 'drop' }), B('cronos', 960, 540, 300, { at: 0.3, e: 'grin' }), Pr('crown', 960, 255, 150, { at: 0.8, in: 'drop' }), B('ouranos', 330, 760, 160, { at: 0.5, e: 'dazed', tilt: -0.3 })], { sfx: [[0.8, 'ding', 0.8]] }));
  S('a8_1', st('night', [B('ouranos', 960, 650, 460, { e: 'shout' })], { cam: [960, 540, 1], cam2: [960, 560, 1.15], fx: [{ t: 'dim', u0: 0, u1: 1, a: 0.2 }] }));
  S('a8_2', st('night', [B('ouranos', 520, 650, 380, { e: 'shout' }), B('cronos', 1230, 740, 220, { e: 'scared', flip: true, at: 0.2 }), B('titan', 1560, 740, 220, { e: 'scared', flip: true, at: 0.35 }), Tx('"TITANS!"', 1100, 330, 130, 'big', { at: 0.5, col: '#ffd36a', rot: -0.05 })], { fx: [{ t: 'shake', u0: 0.5, u1: 0.8, amp: 10 }], sfx: [[0.5, 'thud', 0.8]] }));
  G('a8_3', 'a8_3',
    st('parch', [B('titan', 480, 680, 290, { e: 'angry', tilt: 0.2 }), B('titan', 1440, 680, 290, { e: 'angry', tilt: -0.2, flip: true, at: 0.1 }), Pr('chain', 960, 640, 520, { at: 0.2 }), Tx('"TO STRAIN"', 960, 200, 100, 'label', { at: 0.4 })], { cam2: [960, 540, 1.06] }),
    st('night', [B('ouranos', 960, 650, 440, { e: 'angry' }), Gl(960, 550, 700, { col: 'rgba(255,60,40,.45)' })], { cam2: [960, 540, 1.1], sfx: [[0, 'sting', 0.8]] }));
  S('a9_1', st('night', [B('ouranos', 960, 640, 480, { e: 'angry' }), Gl(960, 520, 760, { col: 'rgba(255,50,30,.5)' }), B('cronos', 1650, 820, 170, { e: 'scared', flip: true, at: 0.5 })], { cam2: [960, 540, 1.12], sfx: [[0, 'rumble', 0.9]] }));
  S('a10_1', { bg: 'dark', items: [Tx('Theogony', 960, 440, 110, 'card', { at: 0.6, in: 'fade' }), Tx('lines 207–210', 960, 580, 80, 'card', { at: 1.0, in: 'fade', col: '#d9c28a' })], cut: true, sfx: [[0, 'duck', 1]] });

  // ============================================================ II. THE STONE
  S('b1_1', st('sky', [Pr('throne', 960, 640, 520), B('cronos', 960, 540, 300, { e: 'grin', at: 0.2 }), Pr('crown', 960, 255, 150, { at: 0.5, in: 'drop' })], { sfx: [[0.5, 'ding', 0.8]] }));
  S('b1_2', st('parch', [B('gaia', 420, 650, 330, { e: 'neutral' }), B('ouranos', 1500, 650, 330, { e: 'neutral', flip: true, at: 0.1 }), Pr('scroll', 960, 560, 300, { at: 0.4, bob: true }), B('cronos', 960, 840, 140, { e: 'worry', at: 0.6 })]));
  S('b1_3', st('parch', [Pr('throne', 960, 700, 480, { crack: true }), B('cronos', 960, 610, 280, { e: 'scared' }), Pr('baby', 1450, 360, 210, { at: 0.5, bob: true }), Gl(1450, 360, 300, { at: 0.5 })], { sfx: [[0.5, 'sting', 0.9]], fx: [{ t: 'shake', u0: 0.5, u1: 0.8, amp: 6 }] }));
  S('b2_1', st('parch', [B('cronos', 600, 660, 400, { e: 'grin' }), Pr('scroll', 1370, 540, 360, { at: 0.3, rot: 0.05 }), Tx('THE RULE', 1370, 520, 62, 'label', { at: 0.6 })]));
  G('b2_2', 'b2_2',
    st('parch', [B('rhea', 520, 660, 360, { e: 'cry' }), Pr('baby', 1000, 560, 170, { bob: true, at: 0.1 }), B('cronos', 1480, 660, 360, { e: [[0, 'neutral'], [0.55, 'swallow']], flip: true }), Pr('baby', 1000, 560, 170, { mv: { to: [1420, 580], u0: 0.55, u1: 0.85, bend: -60 }, until: 2.5, at: 0.1 })], { sfx: [[0.85, 'gulp', 0.9]] }));
  G('b3_1', 'b3_6',
    st('parch', [Tx('5 CHILDREN', 960, 90, 100, 'label'),
      B('hestia', 290, 640, 230, { at: rel('b3_1', 'b3_2'), e: 'worry' }), B('demeter', 625, 640, 230, { at: rel('b3_1', 'b3_3'), e: 'worry' }), B('hera', 960, 640, 230, { at: rel('b3_1', 'b3_4'), e: 'worry' }), B('hades', 1295, 640, 230, { at: rel('b3_1', 'b3_5'), e: 'worry' }), B('poseidon', 1630, 640, 230, { at: rel('b3_1', 'b3_6'), e: 'worry' }),
      Tx('HESTIA', 290, 880, 42, 'label', { at: rel('b3_1', 'b3_2') + 0.1 }), Tx('DEMETER', 625, 880, 42, 'label', { at: rel('b3_1', 'b3_3') + 0.1 }), Tx('HERA', 960, 880, 42, 'label', { at: rel('b3_1', 'b3_4') + 0.1 }), Tx('HADES', 1295, 880, 42, 'label', { at: rel('b3_1', 'b3_5') + 0.1 }), Tx('POSEIDON', 1630, 880, 42, 'label', { at: rel('b3_1', 'b3_6') + 0.1 })], { cam2: [960, 540, 1.03], sfx: [[rel('b3_1', 'b3_2') / 3, 'pop', 0.8], [rel('b3_1', 'b3_3') / 3, 'pop', 0.8]] }));
  S('b4_1', st('parch', [B('rhea', 960, 650, 470, { e: 'cry' })], { cam2: [960, 560, 1.12] }));
  G('b4_2', 'b4_2',
    st('map-ish', [], {}),
    st('parch', [B('rhea', 420, 650, 330, { e: 'worry' }), Pr('baby', 600, 800, 120, { bob: true }), B('gaia', 1100, 650, 330, { e: 'neutral', flip: true, at: 0.3 }), B('ouranos', 1520, 650, 330, { e: 'neutral', flip: true, at: 0.45 })]));
  SH.pop(); SH.pop();
  G('b4_2', 'b4_2',
    st('parch', [B('rhea', 420, 650, 340, { e: 'worry' }), Pr('baby', 600, 840, 130, { bob: true }), Tx('A SIXTH?', 960, 220, 100, 'big', { at: 0.3 })]),
    st('parch', [B('rhea', 420, 650, 330, { e: 'worry', mv: { to: [700, 650], u0: 0, u1: 0.4 } }), B('gaia', 1170, 650, 330, { e: 'neutral', flip: true, at: 0.15 }), B('ouranos', 1560, 650, 300, { e: 'neutral', flip: true, at: 0.3 }), Pr('qmark', 960, 250, 150, { at: 0.8 })]));
  // Crete: map shot
  S('b5_1', mp([23.6, 37.4, 0.55], [B('rhea', 760, 640, 300, { e: 'worry', mv: { to: [1000, 760], u0: 0.15, u1: 0.8, bend: 80 } }), Tr([760, 450], [1000, 700], { u0: 0.1, u1: 0.8, bend: 40 })], { cam2: [24.6, 36.2, 0.7], crete: true, sfx: [[0.1, 'whoosh', 0.6]] }));
  G('b5_2', 'b5_2',
    mp(CRETE, [Tx('CRETE', 960, 200, 120, 'label', { in: 'fade' }), B('rhea', 420, 700, 260, { e: 'worry' }), Pr('baby', 560, 850, 120, {}), B('gaia', 1480, 700, 280, { e: 'smile', flip: true, at: 0.2 })], { crete: true, cut: false }),
    mp(CRETE, [{ k: 'prop', n: 'mount', cave: true, pos: [980, 640], s: 560 }, B('rhea', 360, 720, 240, { e: 'worry' }), B('gaia', 1520, 720, 260, { e: 'smile', flip: true }), Pr('baby', 560, 870, 130, { mv: { to: [1360, 870], u0: 0.05, u1: 0.4, bend: -120 } }), Pr('rock', 980, 640, 340, { in: 'drop', at: 0.6 })], { crete: true, sfx: [[0.6, 'thud', 0.9]] }));
  S('b6_1', st('parch', [B('cronos', 480, 660, 340, { e: 'neutral' }), B('gaia', 1440, 660, 340, { e: 'smile', flip: true }), Tr([1260, 540], [700, 540], { u0: 0.2, u1: 0.7, bend: -3 }), Pr('stone', 1220, 800, 190, { mv: { to: [700, 800], u0: 0.35, u1: 0.9, bend: -90 }, at: 0.2 })]));
  S('b6_2', st('parch', [B('cronos', 720, 650, 480, { e: 'smile' }), Pr('stone', 1260, 580, 230, { mv: { to: [900, 740], u0: 0, u1: 0.5 } })], { cam: [960, 540, 1], cam2: [900, 560, 1.15] }));
  S('b6_3', st('parch', [B('cronos', 720, 650, 480, { e: [[0, 'neutral'], [0.4, 'swallow'], [0.85, 'smile']], sq: [0.7, 0.95, 0.1] }), Pr('stone', 900, 740, 230, { mv: { to: [740, 480], u0: 0.1, u1: 0.55, bend: -50 }, until: 1.2 })], { cam: [900, 560, 1.15], cam2: [860, 560, 1.2], cut: true, sfx: [[0.55, 'gulp', 1]] }));
  S('b6_4', st('parch', [B('cronos', 620, 650, 420, { e: 'smug' }), B('gaia', 1400, 650, 300, { e: 'neutral', flip: true, wink: [[0.6, true]] }), Pr('baby', 1630, 330, 120, { bob: true, at: 0.5 }), Tx('z z z', 1630, 230, 70, 'big', { at: 0.9, col: '#fff' })], { cam2: [960, 540, 1.06] }));
  S('b7_1', mp(CRETE, [B('zeus', 960, 640, 440, { e: 'smile' }), Tx('ZEUS', 960, 160, 130, 'label', { at: 0.3 })], { crete: true, cam2: [24.9, 35.3, 1.6] }));
  S('b7_2', st('parch', [B('hestia', 330, 700, 170, { at: 0 }), B('demeter', 640, 700, 170, { at: 0.1 }), B('hera', 950, 700, 170, { at: 0.2 }), B('hades', 1260, 700, 170, { at: 0.3 }), B('poseidon', 1570, 700, 170, { at: 0.4 }), Pr('baby', 1640, 300, 160, { at: 0.8, bob: true }), Tx('YOUNGEST', 1640, 160, 70, 'label', { at: 0.9 })]));
  S('b7_3', st('parch', [B('hestia', 330, 700, 200, { alpha: 0.35, e: 'worry' }), B('demeter', 640, 700, 200, { alpha: 0.35, e: 'worry' }), B('hera', 950, 700, 200, { alpha: 0.35, e: 'worry' }), B('hades', 1260, 700, 200, { alpha: 0.35, e: 'worry' }), B('poseidon', 1570, 700, 200, { alpha: 0.35, e: 'worry' }), B('zeus', 960, 430, 330, { e: 'grin', at: 0.3 }), Gl(960, 430, 500, { at: 0.3 })], { sfx: [[0.3, 'chime', 0.8]] }));
  S('b8_1', st('parch', [B('hesiod', 700, 650, 380, { e: 'neutral' }), Tx('▶▶', 1340, 560, 330, 'big', { at: 0.4, col: '#ffd36a' })], { sfx: [[0.4, 'whoosh', 0.7]] }));
  S('b8_2', st('parch', [B('zeus', 360, 780, 170, { e: 'smile' }), B('zeus', 960, 720, 260, { e: 'smile', at: 0.4 }), B('zeus', 1560, 640, 380, { e: 'grin', at: 0.8 }), Tr([520, 780], [740, 740], { at: 0.2 }), Tx('▸', 650, 760, 90, 'big', { at: 0.3 }), Tx('▸', 1250, 720, 110, 'big', { at: 0.7 })]));
  S('b8_3', st('parch', [B('cronos', 1380, 660, 380, { e: 'dazed', at: 0.2, tilt: 0.25 }), B('zeus', 560, 660, 380, { e: 'angry', mv: { to: [760, 660], u0: 0.3, u1: 0.5 } }), B('gaia', 1150, 190, 150, { e: 'smug', wink: [[0.2, true]], at: 0.1 })], { fx: [{ t: 'shake', u0: 0.5, u1: 0.7, amp: 14 }, { t: 'flash', u: 0.5, dur: 0.15, a: 0.5 }], sfx: [[0.5, 'crash', 0.8]] }));
  S('b8_4', st('parch', [B('hesiod', 640, 650, 380, { e: 'neutral', tilt: -0.08 }), Pr('scroll', 1300, 560, 380, { rot: 0.05, plain: true }), Tx('...', 1300, 560, 130, 'big', { at: 0.4, col: '#4a3318' })]));
  S('b9_1', st('parch', [B('cronos', 960, 640, 480, { e: 'shout', sq: [0, 0.3, 0.05] }), ...['hestia', 'demeter', 'hera', 'hades', 'poseidon'].map((n, i) => B(n, 960, 520, 150, { at: 0.35 + i * 0.2, mv: { to: [330 + i * 315, 270 + (i % 2) * 40], u0: 0.1 + i * 0.1, u1: 0.35 + i * 0.1, bend: -40 }, e: 'shock' }))], { sfx: [[0.3, 'pop', 0.8]] }));
  S('b9_2', st('parch', [B('cronos', 960, 700, 380, { e: 'shout' }), Pr('stone', 960, 420, 220, { mv: { to: [330, 390], u0: 0.1, u1: 0.4, bend: -100 } }), Tx('FIRST', 330, 215, 90, 'label', { at: 0.5 }), Tx('LAST', 1630, 215, 90, 'label', { at: 0.6 }), Pr('baby', 1630, 400, 130, { at: 0.6 })]));
  G('b10_1', 'b10_1',
    mp([22.6, 38.5, 1.4], [B('zeus', 1000, 640, 260, { e: 'smile' }), Pr('stone', 1220, 800, 170, { bob: true })], { cam2: [22.5, 38.5, 1.6] }),
    mp([22.5, 38.5, 2.0], [Pin('DELPHI (PYTHO)', 22.50, 38.48, { s: 36 }), Pr('stone', 860, 560, 190, { in: 'drop' }), Tx('MOUNT PARNASSUS', 960, 290, 70, 'label', { at: 0.5 })], { cam2: [22.5, 38.5, 2.3], sfx: [[0.15, 'thud', 0.8]] }),
    mp([22.5, 38.5, 2.4], [Pin('DELPHI', 22.5, 38.48, { s: 36 }), Pr('stone', 960, 600, 200, { bob: true }), Pr('star', 780, 460, 90, { at: 0.2 }), Pr('star', 1170, 500, 70, { at: 0.5 }), B('hesiod', 380, 720, 220, { e: 'shock', at: 0.3 }), B('poseidon', 1540, 720, 220, { e: 'shock', flip: true, at: 0.5 })], { cam2: [22.5, 38.5, 2.5], sfx: [[0.2, 'chime', 0.8]] }));
  S('b11_1', mp([22.5, 38.5, 1.6], [Tx('800+ YEARS LATER', 960, 190, 110, 'year', { in: 'fade' }), B('pausanias', 520, 700, 300, { in: 'left', e: 'smile' }), Pin('DELPHI', 22.5, 38.48, { s: 34 })], { cam2: [22.5, 38.5, 1.7] }));
  S('b11_2', mp([22.5, 38.5, 2.4], [Pr('stone', 1100, 620, 210, { in: 'fade', bob: true }), B('pausanias', 560, 680, 360, { e: 'shock' }), Gl(1100, 620, 300, { at: 0.3 })], { cam2: [22.5, 38.5, 2.5], sfx: [[0.3, 'ding', 0.8]] }));
  S('b12_1', st('parch', [Pr('stone', 960, 700, 330), Pr('jug', 1240, 340, 220, { rot: -0.7, at: 0.3 }), Pr('oil', 1090, 530, 120, { at: 0.5 }), B('pausanias', 460, 640, 300, { e: 'smile' }), Pr('scroll', 460, 280, 150, { at: 0.2 })]));
  S('b12_2', st('parch', [Pr('stone', 960, 720, 330), Pr('wool', 960, 560, 260, { in: 'drop', at: 0.3 }), B('pausanias', 460, 640, 300, { e: 'smile' })], { sfx: [[0.3, 'pop', 0.8]] }));
  S('b12_3', st('parch', [Pr('stone', 960, 560, 300, { bob: true }), B('cronos', 360, 640, 280, { e: 'smug' }), Pr('baby', 1560, 620, 220, { bob: true, at: 0.4 }), Tx('=', 1260, 570, 150, 'big', { at: 0.3 }), Tx('?', 960, 200, 160, 'big', { at: 0.5, col: '#ffd36a' })]));
  G('b13_1', 'b13_1',
    st('hell', [B('cyclops', 450, 660, 300, { e: 'worry' }), B('cyclops', 960, 660, 300, { e: 'worry', at: 0.1 }), B('cyclops', 1470, 660, 300, { e: 'worry', at: 0.2 }), Pr('chain', 450, 840, 300, {}), Pr('chain', 960, 840, 300, {}), Pr('chain', 1470, 840, 300, {})], { cam2: [960, 540, 1.04] }),
    st('hell', [B('zeus', 960, 640, 360, { e: 'angry', in: 'up' }), B('cyclops', 360, 680, 250, { e: 'smile' }), B('cyclops', 1560, 680, 250, { e: 'smile', flip: true }), Pr('chain', 380, 360, 200, { mv: { to: [300, 120], u0: 0.2, u1: 0.6 }, rot: 0.5, until: 1.5 }), Pr('chain', 1540, 360, 200, { mv: { to: [1620, 120], u0: 0.2, u1: 0.6 }, rot: -0.5, until: 1.5 })], { fx: [{ t: 'flash', u: 0.2, dur: 0.25, a: 0.6 }], sfx: [[0.2, 'crash', 0.7]] }));
  S('b13_2', st('storm', [B('cyclops', 420, 660, 300, { e: 'grin' }), B('zeus', 1380, 660, 360, { e: 'grin', flip: true, at: 0.1 }), Pr('bolt', 860, 560, 300, { mv: { to: [1060, 540], u0: 0.3, u1: 0.8, bend: -60 }, bob: true })], { fx: [{ t: 'flash', u: 0.3, dur: 0.25 }], sfx: [[0.3, 'thunder', 0.9]] }));
  S('b13_3', st('storm', [B('gaia', 960, 650, 440, { e: 'smug', wink: [[0.5, true]] }), Pr('bolt', 1450, 480, 280, { at: 0.1, mv: { to: [1280, 600], u0: 0.0, u1: 0.5 }, alpha: 0.9 })], { cam2: [960, 540, 1.08] }));

  // ============================================================ III. THE TEN-YEAR WAR
  S('c1_1', mp([22.4, 39.6, 0.9], [Tx('THE WAR', 960, 200, 170, 'big', { in: 'drop' })], { cut: true, fx: [{ t: 'flash', u: 0.05, dur: 0.2, a: 0.5 }, { t: 'shake', u0: 0.05, u1: 0.4, amp: 10 }], sfx: [[0, 'thud', 1]] }));
  S('c1_2', mp([22.3, 39.2, 1.9], [Pin('MOUNT OTHRYS', 22.25, 39.12, { s: 34 }), B('titan', 640, 720, 260, { e: 'angry', at: 0.2 }), B('titan', 1000, 740, 260, { e: 'angry', at: 0.35 }), B('cyclops', 1360, 720, 260, { e: 'angry', at: 0.5 })], { cam2: [22.3, 39.2, 2.0] }));
  S('c1_3', mp([22.3, 39.9, 1.9], [Pin('OLYMPUS', 22.35, 40.08, { s: 34 }), B('zeus', 960, 700, 300, { e: 'grin', at: 0.2 }), B('hera', 560, 740, 230, { e: 'grin', at: 0.35 }), B('poseidon', 1360, 740, 230, { e: 'grin', flip: true, at: 0.5 }), B('hades', 1620, 760, 190, { e: 'grin', flip: true, at: 0.65 })], { cam2: [22.3, 39.9, 2.0] }));
  S('c2_1', st('parch', [B('hesiod', 700, 650, 400, { e: 'neutral', tilt: -0.08 }), Pr('qmark', 1350, 460, 380, { at: 0.3 })]));
  G('c2_2', 'c2_2',
    st('storm', [B('titan', 380, 660, 340, { e: 'angry' }), B('zeus', 1540, 660, 340, { e: 'angry', flip: true }), Pr('bolt', 960, 520, 300, { bob: true }), Tx('10 YEARS', 960, 170, 140, 'big', { at: 0.2 })], { fx: [{ t: 'flash', u: 0.4, dur: 0.2, a: 0.6 }], sfx: [[0.4, 'thunder', 0.7]] }),
    st('storm', [B('titan', 380, 660, 340, { e: 'angry', tilt: 0.1 }), B('zeus', 1540, 660, 340, { e: 'angry', flip: true, tilt: -0.1 }), Tx('=', 960, 520, 300, 'big', { col: '#ffd36a' }), Tx('NEITHER CAN WIN', 960, 170, 110, 'big')]));
  S('c3_1', st('parch', [B('gaia', 960, 650, 440, { e: 'smile', wink: [[0.6, true]] }), Gl(960, 560, 600, { col: 'rgba(120,220,100,.35)' })], { cam2: [960, 540, 1.1] }));
  S('c3_2', st('sky', [B('gaia', 420, 650, 330, { e: 'smile' }), B('zeus', 960, 660, 300, { e: 'neutral', flip: true, at: 0.15 }), B('cottus', 1500, 700, 240, { e: 'grin', flip: true, at: 0.6 }), Tx('+', 1240, 600, 150, 'big', { at: 0.5, col: '#ffd36a' }), Tx('WIN', 960, 150, 130, 'big', { at: 1.0 })]));
  S('c3_3', st('hell', [B('cottus', 480, 700, 280, { e: 'worry' }), B('cottus', 960, 700, 280, { e: 'worry', at: 0.15 }), B('cottus', 1440, 700, 280, { e: 'worry', at: 0.3 }), Pr('chain', 480, 880, 280), Pr('chain', 960, 880, 280), Pr('chain', 1440, 880, 280), B('ouranos', 960, 230, 170, { e: 'angry', at: 0.5 })], { cam2: [960, 560, 1.05] }));
  S('c4_1', st('sky', [B('cottus', 480, 940, 280, { e: 'smile', mv: { to: [480, 650], u0: 0.05, u1: 0.6 } }), B('cottus', 960, 960, 280, { e: 'smile', mv: { to: [960, 650], u0: 0.1, u1: 0.65 } }), B('cottus', 1440, 980, 280, { e: 'smile', mv: { to: [1440, 650], u0: 0.15, u1: 0.7 } }), Gl(960, 300, 800, { col: 'rgba(255,240,170,.7)' })], { sfx: [[0.1, 'whoosh', 0.7]] }));
  S('c4_2', st('sky', [B('cottus', 960, 680, 320, { e: 'smile' }), B('zeus', 420, 640, 260, { e: 'smile', at: 0.1 }), B('hera', 1500, 640, 250, { e: 'smile', flip: true, at: 0.2 }), Pr('nectar', 600, 500, 150, { mv: { to: [840, 560], u0: 0.4, u1: 0.8 } })]));
  S('c4_3', st('sky', [Pr('nectar', 560, 540, 330, { bob: true }), Pr('jug', 1360, 560, 300, { bob: true, at: 0.5 }), Tx('NECTAR', 560, 250, 90, 'label', { at: 0.2 }), Tx('AMBROSIA', 1360, 250, 90, 'label', { at: 0.7 })]));
  S('c5_1', st('sky', [B('cottus', 960, 680, 420, { e: 'grin' }), Pr('flame', 480, 700, 180, { at: 0.3 }), Pr('flame', 1440, 700, 180, { at: 0.4 })], { cam2: [960, 540, 1.1] }));
  S('c5_2', st('sky', [B('zeus', 500, 650, 340, { e: 'neutral' }), B('cottus', 1400, 650, 340, { e: 'grin', flip: true, at: 0.2 }), Tx('"HELP US"', 960, 220, 100, 'big', { at: 0.9, col: '#ffd36a' })]));
  S('c5_3', st('sky', [B('cottus', 960, 650, 440, { e: 'shout' }), Tx('COTTUS', 960, 150, 120, 'label', { at: 0.3 }), B('cottus', 330, 800, 160, { e: 'smile', at: 0.2 }), B('cottus', 1590, 800, 160, { e: 'smile', at: 0.35, flip: true })], { cam2: [960, 540, 1.08] }));
  S('c5_4', st('sky', [B('cottus', 480, 660, 330, { e: 'angry' }), B('cottus', 960, 660, 330, { e: 'angry', at: 0.1 }), B('cottus', 1440, 660, 330, { e: 'angry', at: 0.2 }), Tx('WE FIGHT', 960, 170, 130, 'big', { at: 0.3 })], { fx: [{ t: 'shake', u0: 0.3, u1: 0.8, amp: 8 }, { t: 'flash', u: 0.3, dur: 0.15, a: 0.5 }], sfx: [[0.3, 'thud', 0.9]] }));
  S('c6_1', st('sea', [Pr('ship', 700, 540, 300, { bob: true }), Pr('ship', 1300, 640, 220, { bob: true, ph: 2 }), Tx('♪ RING ♪', 960, 200, 120, 'big', { at: 0.2 })], { fx: [{ t: 'shake', u0: 0, u1: 0.6, amp: 8 }] }));
  S('c6_2', st('storm', [Pr('rock', 500, 300, 200, { in: 'drop' }), Pr('rock', 1000, 220, 260, { in: 'drop', at: 0.2 }), Pr('rock', 1450, 320, 170, { in: 'drop', at: 0.4 }), Tx('CRASH', 960, 650, 220, 'big', { at: 0.3, rot: -0.06 })], { fx: [{ t: 'shake', u0: 0.2, u1: 1, amp: 16 }], sfx: [[0.2, 'crash', 1]] }));
  G('c6_3', 'c6_3',
    st('sky', [Pr('mount', 960, 640, 700, { cave: false }), Pr('cloud', 560, 260, 240, { bob: true }), Pr('cloud', 1380, 300, 280, { bob: true, ph: 2 }), Tx('OLYMPUS', 960, 840, 90, 'label', { at: 0.3 })], { fx: [{ t: 'shake', u0: 0, u1: 1, amp: 10 }], sfx: [[0, 'rumble', 1]] }),
    st('hell', [{ k: 'ruler', pos: [960, 140], s: 100, len: 780 }, Tx('EARTH', 1160, 150, 70, 'label', { col: '#fff' }), Tx('TARTARUS', 1160, 900, 70, 'label', { col: '#fff' }), Pr('rock', 960, 150, 160, { mv: { to: [960, 900], u0: 0.1, u1: 0.85 }, spin: 6 })], { fx: [{ t: 'shake', u0: 0.8, u1: 1, amp: 14 }], sfx: [[0.85, 'thud', 1]] }));
  S('c7_1', st('storm', [B('zeus', 960, 650, 470, { e: 'angry' }), Pr('bolt', 380, 520, 300, { at: 0.2, bob: true }), Pr('bolt', 1540, 520, 300, { at: 0.35, bob: true, flip: true })], { cam2: [960, 540, 1.1], fx: [{ t: 'flash', u: 0.15, dur: 0.25 }], sfx: [[0.15, 'thunder', 1]] }));
  S('c7_2', st('storm', [B('zeus', 380, 280, 260, { e: 'shout', mv: { to: [1100, 700], u0: 0.1, u1: 0.75, bend: 80 } }), Pr('bolt', 680, 360, 240, { at: 0.2, mv: { to: [1500, 760], u0: 0.2, u1: 0.8 } }), Pr('bolt', 520, 460, 200, { at: 0.45, mv: { to: [1300, 820], u0: 0.4, u1: 0.9 } })], { fx: [{ t: 'flash', u: 0.5, dur: 0.2 }], sfx: [[0.1, 'whoosh', 0.8], [0.5, 'thunder', 0.7]] }));
  S('c7_3', st('storm', [Pr('flame', 400, 660, 330, { bob: true }), Pr('flame', 960, 620, 400, { bob: true, ph: 1 }), Pr('flame', 1500, 680, 300, { bob: true, ph: 2 }), Tx('CRACKLE', 960, 190, 130, 'big', { col: '#ffb347' })], { sfx: [[0, 'fire', 0.8]] }));
  S('c7_4', st('sea', [Pr('flame', 500, 640, 220, { bob: true }), Pr('flame', 960, 660, 260, { bob: true, ph: 1 }), Pr('flame', 1420, 650, 220, { bob: true, ph: 2 }), Pr('ship', 960, 800, 190, { bob: true }), Tx('BOIL', 960, 190, 150, 'big', { col: '#fff' })], { fx: [{ t: 'dim', u0: 0, u1: 1, col: '#ff5a1a', a: 0.15 }] }));
  S('c7_5', st('chaos', [Tx('CHAOS', 960, 520, 230, 'label', { col: '#ffb347' }), Gl(960, 540, 900, { col: 'rgba(255,120,40,.5)' }), Pr('flame', 450, 700, 230, { bob: true }), Pr('flame', 1470, 700, 230, { bob: true, ph: 1 })], { cam2: [960, 540, 1.1], sfx: [[0, 'rumble', 0.8]] }));
  S('c8_1', st('storm', [B('cottus', 380, 660, 300, { e: 'angry' }), B('cottus', 380, 660, 300, { e: 'angry' }), ...Array.from({ length: 6 }, (_, i) => Pr('rock', 600, 520, 120, { at: 0.2 + i * 0.25, mv: { to: [1500, 600 + (i % 3) * 60], u0: 0.2 + i * 0.1, u1: 0.45 + i * 0.1, bend: -140 }, until: 3 })), Tx('300 ROCKS', 960, 160, 130, 'big', { at: 0.4 }), B('titan', 1620, 700, 260, { e: 'scared', flip: true, at: 0.1 })], { fx: [{ t: 'shake', u0: 0.4, u1: 1, amp: 6 }] }));
  S('c8_2', st('hell', [{ k: 'earth', pos: [960, 760], s: 600 }, B('titan', 480, 600, 250, { e: 'dazed', mv: { to: [480, 900], u0: 0.3, u1: 0.7 } }), B('titan', 960, 580, 250, { e: 'dazed', mv: { to: [960, 920], u0: 0.35, u1: 0.75 } }), B('cyclops', 1440, 600, 250, { e: 'dazed', mv: { to: [1440, 920], u0: 0.4, u1: 0.8 } }), Pr('chain', 960, 840, 600, { at: 1.2 })], { sfx: [[0.4, 'thud', 0.9]] }));
  S('c9_1', st('night', [B('ouranos', 960, 650, 440, { e: 'smug' }), Tx('Theogony 207–210', 960, 130, 70, 'card', { at: 0.3, col: '#ffe9a0' })], { cam2: [960, 540, 1.1] }));
  S('c9_2', st('hell', [B('titan', 480, 680, 260, { e: 'dazed' }), B('titan', 960, 680, 260, { e: 'dazed', at: 0.1 }), B('cyclops', 1440, 680, 260, { e: 'dazed', at: 0.2 }), Pr('chain', 960, 880, 700), Tx('PAID', 960, 260, 220, 'big', { col: '#ff4a3a', rot: -0.08, in: 'drop', at: 0.5 })], { fx: [{ t: 'shake', u0: 0.55, u1: 0.8, amp: 14 }], sfx: [[0.55, 'thud', 1]] }));
  S('c10_1', st('hell', [Pr('qmark', 960, 460, 520), { k: 'ruler', pos: [260, 120], s: 100, len: 820 }, Tx('HOW DEEP?', 1180, 800, 110, 'big', { at: 0.2 })]));
  S('c10_2', st('parch', [Pr('scroll', 960, 500, 520, { rot: -0.04 }), B('hesiod', 400, 700, 260, { e: 'smile' }), Tx('A MEASUREMENT', 960, 830, 70, 'label', { at: 0.3 })]));
  G('c10_3', 'c10_3',
    st('hell', [{ k: 'ruler', pos: [420, 110], s: 100, len: 770 }, Tx('SKY', 600, 120, 70, 'label', { col: '#fff' }), Tx('EARTH', 640, 495, 70, 'label', { col: '#fff' }), Tx('TARTARUS', 700, 880, 70, 'label', { col: '#fff' }), Pr('anvil', 420, 130, 200, { mv: { to: [420, 495], u0: 0.0, u1: 0.95 } }), Tx('9', 1200, 440, 360, 'big', { count: [0, 9], u0: 0.0, u1: 0.95, suf: '', col: '#ffd36a' }), Tx('DAYS', 1200, 690, 110, 'big')], { sfx: [[0, 'whoosh', 0.8], [0.95, 'thud', 1]] }),
    st('hell', [{ k: 'ruler', pos: [420, 110], s: 100, len: 770 }, Tx('SKY', 600, 120, 70, 'label', { col: '#fff' }), Tx('EARTH', 640, 495, 70, 'label', { col: '#fff' }), Tx('TARTARUS', 700, 880, 70, 'label', { col: '#fff' }), Pr('anvil', 420, 495, 200, { mv: { to: [420, 870], u0: 0.0, u1: 0.95 } }), Tx('9', 1200, 440, 360, 'big', { count: [0, 9], u0: 0.0, u1: 0.95, col: '#ffd36a' }), Tx('MORE DAYS', 1200, 690, 110, 'big')], { sfx: [[0, 'whoosh', 0.8], [0.95, 'thud', 1]], fx: [{ t: 'shake', u0: 0.95, u1: 1, amp: 16 }] }));
  S('c11_1', st('hell', [Pr('gate', 960, 640, 560, { in: 'drop' }), B('poseidon', 400, 680, 300, { e: 'smile', at: 0.3 }), Pr('trident', 1560, 600, 300, { at: 0.5 })], { sfx: [[0.1, 'crash', 0.8]] }));
  S('c11_2', st('hell', [Pr('gate', 960, 640, 520), B('cottus', 400, 700, 280, { e: 'neutral' }), B('cottus', 1520, 700, 280, { e: 'neutral', flip: true, at: 0.2 }), Tx('GUARDS', 960, 170, 120, 'label', { at: 0.4, col: '#fff' })]));
  S('c12_1', st('sky', [B('cottus', 480, 660, 300, { e: 'grin' }), B('cottus', 960, 660, 300, { e: 'grin', at: 0.1 }), B('cottus', 1440, 660, 300, { e: 'grin', at: 0.2 }), Tx('THE KEY', 960, 150, 140, 'label', { at: 0.3 }), Gl(960, 560, 700)]));
  S('c12_2', st('sky', [B('zeus', 400, 660, 290, { e: 'worry' }), B('hera', 780, 660, 250, { e: 'worry', at: 0.1 }), B('poseidon', 1140, 660, 250, { e: 'worry', at: 0.2 }), B('hades', 1500, 660, 250, { e: 'worry', at: 0.3 }), Tx('10 YEARS', 960, 150, 120, 'big', { at: 0.3 })]));
  S('c12_3', st('hell', [B('ouranos', 520, 640, 330, { e: 'angry' }), B('cottus', 1340, 700, 280, { e: 'worry', flip: true }), Pr('chain', 1340, 880, 300, { at: 0.3 })]));
  G('c12_4', 'c12_4',
    st('sky', [B('cottus', 960, 680, 340, { e: 'smile' }), Pr('chain', 480, 480, 280, { rot: 0.4, mv: { to: [380, 220], u0: 0.1, u1: 0.8 }, until: 1.2 }), Tx('FREED', 960, 150, 130, 'big', { at: 0.2 })], { fx: [{ t: 'flash', u: 0.2, dur: 0.2, a: 0.6 }], sfx: [[0.2, 'crash', 0.7]] }),
    st('sky', [B('cottus', 1300, 680, 340, { e: 'grin', flip: true }), Pr('nectar', 560, 560, 240, { mv: { to: [1000, 560], u0: 0.2, u1: 0.7 } }), Tx('FED', 960, 150, 130, 'big', { at: 0.2 })]),
    st('sky', [B('zeus', 480, 660, 340, { e: 'neutral' }), B('cottus', 1440, 660, 340, { e: 'smile', flip: true, at: 0.2 }), Tx('"HELP US"', 960, 170, 120, 'big', { at: 0.3, col: '#ffd36a' })]));

  // ============================================================ IV. THE MONSTER
  S('d1_1', st('hell', [Pr('gate', 960, 640, 640), B('titan', 520, 700, 240, { e: 'dazed', alpha: 0.7 }), B('cyclops', 1400, 700, 240, { e: 'dazed', alpha: 0.7 })], { cam2: [960, 560, 1.08], dim: 0.15 }));
  S('d1_2', st('parch', [Pr('scroll', 960, 560, 640, { rot: -0.03 }), Pr('qmark', 960, 540, 240, { at: 0.3 })], { cam2: [960, 540, 1.1], sfx: [[0.3, 'sting', 0.8]] }));
  S('d2_1', st('night', [B('gaia', 960, 660, 460, { e: 'cry' }), Pr('baby', 1560, 380, 160, { at: 0.5, bob: true }), Gl(1560, 380, 260, { at: 0.5, col: 'rgba(120,255,140,.5)' })], { sfx: [[0.5, 'rumble', 0.8]] }));
  S('d2_2', st('storm', [B('typhoeus', 960, 720, 470, { e: 'shout', in: 'up' }), Tx('TYPHOEUS', 960, 130, 130, 'label', { at: 0.3, col: '#fff' })], { fx: [{ t: 'flash', u: 0.1, dur: 0.3 }, { t: 'shake', u0: 0.1, u1: 0.8, amp: 14 }], sfx: [[0.05, 'roar', 1]], cut: true }));
  S('d2_3', st('hell', [{ k: 'ruler', pos: [260, 100], s: 100, len: 820 }, B('typhoeus', 1100, 760, 300, { e: 'angry', mv: { to: [1100, 640], u0: 0.1, u1: 0.5 } }), Tx('FATHER: TARTARUS', 1100, 150, 80, 'label', { at: 0.3, col: '#fff' }), Tx('THE PIT', 520, 900, 70, 'label', { at: 0.3, col: '#fff' })]));
  G('d3_1', 'd3_1',
    st('storm', [B('typhoeus', 960, 720, 460, { e: 'angry' }), Tx('100 SNAKE HEADS', 960, 140, 110, 'big', { at: 0.2 })], { cam2: [960, 540, 1.1] }),
    st('storm', [B('typhoeus', 960, 720, 460, { e: 'shout' }), Pr('flame', 770, 640, 130, { at: 0.2, bob: true }), Pr('flame', 1150, 640, 130, { at: 0.3, bob: true, ph: 1 }), Tx('FIRE FROM THE EYES', 960, 140, 100, 'big', { at: 0.2, col: '#ffb347' })], { fx: [{ t: 'shake', u0: 0.2, u1: 0.5, amp: 6 }] }));
  S('d4_1', st('storm', [B('typhoeus', 960, 720, 470, { e: 'shout' }), Tx(')))', 360, 430, 300, 'big', { at: 0.3, col: '#ffd36a', rot: 0.1 }), Tx('(((', 1560, 430, 300, 'big', { at: 0.4, col: '#ffd36a', rot: -0.1 })], { fx: [{ t: 'shake', u0: 0.2, u1: 0.9, amp: 5 }] }));
  S('d4_2', st('storm', [B('typhoeus', 1380, 700, 400, { e: 'shout', flip: true }), B('zeus', 440, 700, 300, { e: 'scared' }), Tx('"...?"', 800, 330, 130, 'big', { at: 0.4, col: '#ffd36a' })]));
  G('d4_3', 'd4_3',
    st('storm', [B('typhoeus', 960, 700, 440, { e: 'shout' }), Tx('MOOO!', 960, 160, 200, 'big', { in: 'drop', col: '#ffb347', rot: -0.05 })], { fx: [{ t: 'shake', u0: 0.1, u1: 0.5, amp: 10 }], sfx: [[0.05, 'moo', 0.9]] }),
    st('storm', [B('typhoeus', 960, 700, 440, { e: 'shout' }), Tx('ROAR!', 960, 160, 200, 'big', { in: 'drop', col: '#ff5a3a', rot: 0.05 })], { fx: [{ t: 'shake', u0: 0.1, u1: 0.5, amp: 12 }], sfx: [[0.05, 'roar', 0.9]] }),
    st('storm', [B('typhoeus', 960, 700, 440, { e: 'smile' }), Tx('yip yip!', 960, 160, 170, 'big', { in: 'drop', col: '#fff', rot: -0.04 })], { sfx: [[0.05, 'yip', 0.8]] }),
    st('storm', [B('typhoeus', 960, 700, 440, { e: 'angry' }), Tx('SSSSS', 960, 160, 220, 'big', { in: 'drop', col: '#9fe870' })], { fx: [{ t: 'shake', u0: 0.1, u1: 1, amp: 5 }], sfx: [[0.05, 'hiss', 0.9]] }));
  S('d5_1', st('storm', [B('typhoeus', 960, 240, 600, { e: 'angry', alpha: 0.85 }), B('hesiod', 360, 820, 240, { e: 'worry', at: 0.2 }), Pr('qmark', 1560, 700, 300, { at: 0.5 })], { cam: [960, 400, 1.0], cam2: [960, 440, 1.1], dim: 0.15 }));
  G('d5_2', 'd5_2',
    st('storm', [Pr('throne', 960, 700, 520), B('typhoeus', 960, 520, 300, { e: 'grin' }), Pr('crown', 960, 240, 150, { at: 0.4, in: 'drop' }), Tx('IF NOT FOR...', 420, 300, 70, 'label', { at: 0.3, col: '#fff' })], { dim: 0.1 }),
    st('storm', [B('zeus', 700, 660, 400, { e: 'shock', in: 'up' }), Pr('eyeball', 1360, 560, 220, { at: 0.3 }), Pr('bolt', 1560, 700, 260, { at: 0.5, bob: true })], { fx: [{ t: 'flash', u: 0.3, dur: 0.2 }], sfx: [[0.3, 'ding', 0.8]] }));
  S('d6_1', st('storm', [B('zeus', 960, 650, 500, { e: 'shout' }), Pr('bolt', 380, 520, 330, { bob: true }), Pr('bolt', 1540, 520, 330, { bob: true, flip: true })], { fx: [{ t: 'flash', u: 0.1, dur: 0.3 }, { t: 'shake', u0: 0.1, u1: 0.7, amp: 16 }], sfx: [[0.1, 'thunder', 1]], cut: true }));
  S('d6_2', st('sky', [Pr('mount', 960, 700, 760), Pr('cloud', 620, 250, 260, { bob: true }), Pr('cloud', 1330, 280, 240, { bob: true, ph: 1 })], { fx: [{ t: 'shake', u0: 0, u1: 1, amp: 14 }], sfx: [[0, 'rumble', 1]] }));
  S('d6_3', st('hell', [B('hades', 520, 680, 330, { e: 'scared' }), B('titan', 1050, 700, 250, { e: 'scared', flip: true, at: 0.3 }), B('cyclops', 1500, 700, 250, { e: 'scared', flip: true, at: 0.4 })], { fx: [{ t: 'shake', u0: 0, u1: 1, amp: 6 }] }));
  S('d6_4', st('storm', [B('zeus', 400, 220, 280, { e: 'shout', mv: { to: [900, 600], u0: 0.1, u1: 0.55, bend: 60 } }), B('typhoeus', 1400, 700, 440, { e: 'angry', flip: true }), Pr('flame', 1240, 520, 160, { at: 0.55, bob: true }), Pr('flame', 1420, 450, 150, { at: 0.65, bob: true, ph: 1 }), Pr('flame', 1600, 520, 160, { at: 0.75, bob: true, ph: 2 })], { fx: [{ t: 'flash', u: 0.55, dur: 0.3 }], sfx: [[0.1, 'whoosh', 0.8], [0.55, 'fire', 1]] }));
  S('d7_1', st('hell', [B('typhoeus', 960, 640, 420, { e: 'dazed', tilt: 0.3, mv: { to: [960, 780], u0: 0.1, u1: 0.5 } }), Pr('flame', 640, 740, 200, { bob: true }), Pr('flame', 1280, 740, 200, { bob: true, ph: 1 })], { fx: [{ t: 'shake', u0: 0.4, u1: 0.8, amp: 14 }], sfx: [[0.45, 'thud', 1]] }));
  S('d7_2', st('hell', [Pr('rock', 960, 760, 400, { col: '#f26a1b' }), Pr('flame', 700, 640, 220, { bob: true }), Pr('flame', 1220, 640, 220, { bob: true, ph: 1 }), B('hesiod', 330, 680, 240, { e: 'shock' }), Tx('LIKE TIN', 960, 190, 150, 'big', { at: 0.3, col: '#ffb347' })]));
  S('d7_3', st('hell', [{ k: 'ruler', pos: [260, 120], s: 100, len: 820 }, B('typhoeus', 1000, 230, 360, { e: 'dazed', mv: { to: [1000, 780], u0: 0.15, u1: 0.8 }, tilt: 0.3 }), Tx('TARTARUS', 1000, 880, 80, 'label', { col: '#fff', at: 0.2 })], { fx: [{ t: 'shake', u0: 0.8, u1: 1, amp: 16 }], sfx: [[0.1, 'whoosh', 0.8], [0.82, 'thud', 1]] }));
  S('d8_1', st('sea', [Pr('wind', 360, 300, 300, { bob: true }), Pr('wind', 1100, 240, 340, { bob: true, ph: 2 }), Pr('ship', 700, 640, 300, { bob: true, rot: 0.3 }), Pr('ship', 1450, 700, 220, { bob: true, rot: -0.3, ph: 3 }), B('typhoeus', 960, 140, 180, { e: 'angry', alpha: 0.7 })], { fx: [{ t: 'shake', u0: 0, u1: 1, amp: 4 }], sfx: [[0, 'wind', 0.7]] }));
  S('d8_2', st('sky', [Pr('wind', 480, 520, 300, { at: 0.1 }), Pr('wind', 960, 520, 300, { at: 0.5 }), Pr('wind', 1440, 520, 300, { at: 0.9 }), Tx('NORTH', 480, 800, 80, 'label', { at: 0.2 }), Tx('SOUTH', 960, 800, 80, 'label', { at: 0.6 }), Tx('WEST', 1440, 800, 80, 'label', { at: 1.0 }), Tx('NOT HIS', 960, 150, 120, 'big', { at: 0.3 })]));

  // ============================================================ V. THE JAR IN MUNICH
  S('d9_1', { bg: 'photo', items: [{ k: 'photo', img: 'zt', kb: [[0.5, 0.5, 1.0], [0.5, 0.5, 1.1]] }], sfx: [[0, 'duck', 1]], cut: false });
  G('d10_1', 'd10_1',
    { bg: 'photo', items: [{ k: 'photo', img: 'zt', kb: [[0.5, 0.5, 1.1], [0.62, 0.48, 1.3]] }, Tx('HYDRIA · c. 540 BC', 330, 150, 60, 'card', { at: 0.4, in: 'fade', col: '#fff' })] },
    st('parch', [Tx('c. 700 BC', 480, 440, 150, 'year'), Tx('c. 540 BC', 1440, 440, 150, 'year', { at: 0.6 }), Tr([680, 560], [1240, 560], { u0: 0.3, u1: 0.7 }), Tx('~150 YEARS', 960, 700, 100, 'label', { at: 1.2 }), B('hesiod', 480, 840, 140, { at: 0.2 })]));
  S('d10_2', mp([11.6, 47.0, 0.6], [Pin('MUNICH', 11.58, 48.14, { s: 40 }), Tx('Staatliche Antikensammlungen', 960, 900, 62, 'card', { at: 0.5, col: '#3a2410' })], { cam2: [11.6, 47.9, 0.9], cut: false }));
  S('d11_1', { bg: 'photo', items: [{ k: 'photo', img: 'zt', kb: [[0.5, 0.5, 1.0], [0.2, 0.42, 2.1]] }, Tx('ZEUS', 380, 920, 70, 'card', { at: 0.5, in: 'fade', col: '#fff' })] });
  S('d11_2', { bg: 'photo', items: [{ k: 'photo', img: 'zt', kb: [[0.2, 0.42, 2.1], [0.3, 0.3, 3.4]] }, Tx('ΖΕΥΣ', 960, 880, 70, 'card', { at: 0.5, in: 'fade', col: '#ffd36a' })] });
  S('d12_1', { bg: 'photo', items: [{ k: 'photo', img: 'zt', kb: [[0.3, 0.3, 3.0], [0.74, 0.46, 1.8]] }] });
  G('d12_2', 'd12_2',
    { bg: 'photo', items: [{ k: 'photo', img: 't', kb: [[0.38, 0.3, 3.2], [0.36, 0.28, 3.5]] }, Tx('A HUMAN FACE', 960, 900, 62, 'card', { at: 0.3, in: 'fade', col: '#fff' })] },
    { bg: 'photo', items: [{ k: 'photo', img: 't', kb: [[0.25, 0.4, 2.0], [0.72, 0.35, 2.0]] }, Tx('HUGE WINGS', 960, 900, 62, 'card', { at: 0.3, in: 'fade', col: '#fff' })] },
    { bg: 'photo', items: [{ k: 'photo', img: 't', kb: [[0.3, 0.8, 1.5], [0.7, 0.78, 1.5]] }, Tx('A BODY OF SNAKES', 960, 900, 62, 'card', { at: 0.3, in: 'fade', col: '#fff' })] });
  G('d13_1', 'd13_1',
    st('parch', [B('typhoeus', 520, 640, 340, { e: 'angry' }), Tx('HESIOD', 520, 140, 80, 'label'), Tx('100 HEADS', 520, 870, 64, 'big', { at: 0.4 }), Tx('WINGS', 1400, 870, 64, 'big', { at: 0.9, col: '#ff6a5a' }), B('typhonW', 1400, 640, 340, { e: 'angry', at: 0.6 }), Tx('THE PAINTER', 1400, 140, 80, 'label', { at: 0.6 })]),
    { bg: 'photo', items: [{ k: 'photo', img: 't', kb: [[0.5, 0.35, 1.2], [0.5, 0.4, 1.35]] }, Tx('NO WINGS IN THE POEM', 960, 900, 62, 'card', { at: 0.3, in: 'fade', col: '#fff' })] });
  S('d14_1', { bg: 'photo', items: [{ k: 'photo', img: 'zt', kb: [[0.8, 0.55, 1.4], [0.2, 0.55, 1.4]] }, Tx('a pot is curved', 960, 900, 60, 'card', { at: 0.5, in: 'fade', col: '#fff' })] });

  // ============================================================ VI. WHY ZEUS SWALLOWED METIS
  S('e1_1', st('sky', [B('zeus', 960, 650, 440, { e: 'smile' }), B('typhoeus', 1560, 820, 150, { e: 'dazed', alpha: 0.4, at: 0 })], { cam2: [960, 540, 1.08] }));
  S('e2_1', st('sky', [B('zeus', 960, 660, 340, { e: 'neutral' }), B('hera', 330, 700, 220, { e: 'smile', at: 0.1 }), B('poseidon', 600, 780, 200, { e: 'smile', at: 0.2 }), B('hades', 1320, 780, 200, { e: 'smile', flip: true, at: 0.3 }), B('demeter', 1590, 700, 220, { e: 'smile', flip: true, at: 0.4 }), Pr('crown', 960, 255, 150, { in: 'drop', at: 0.7 })], { sfx: [[0.7, 'ding', 0.8]] }));
  S('e2_2', st('sky', [B('zeus', 960, 660, 300, { e: 'neutral' }), B('hera', 400, 700, 210, { e: 'smile' }), B('poseidon', 1520, 700, 210, { e: 'smile', flip: true }), B('gaia', 960, 250, 200, { e: 'smug', wink: [[0.3, true]], at: 0.2 }), Tr([860, 330], [520, 560], { u0: 0.3, u1: 0.8 }), Tr([1060, 330], [1400, 560], { u0: 0.4, u1: 0.9 })]));
  S('e3_1', st('parch', [B('cronos', 960, 650, 430, { e: 'angry' }), Pr('sickle', 1450, 520, 340, { rot: 0.2, bob: true, at: 0.2 })]));
  S('e3_2', st('sky', [B('zeus', 960, 650, 430, { e: 'neutral' }), Pr('crown', 960, 215, 170, { in: 'drop', at: 0.3 }), Tx('URGED', 960, 90, 90, 'label', { at: 0.4 })], { sfx: [[0.3, 'ding', 0.8]] }));
  S('e4_1', st('sky', [B('zeus', 960, 650, 340, { e: 'smile' }), B('hera', 340, 700, 200, { e: 'smile' }), B('poseidon', 640, 790, 190, { e: 'smile' }), B('hades', 1280, 790, 190, { e: 'smile', flip: true }), B('demeter', 1580, 700, 200, { e: 'smile', flip: true }), ...[[340, 480], [640, 570], [1280, 570], [1580, 480]].map(([x, y], i) => Pr('star', 960, 420, 110, { mv: { to: [x, y], u0: 0.1 + i * 0.15, u1: 0.35 + i * 0.15, bend: -60 }, at: 0.1 + i * 0.2 }))], { sfx: [[0.1, 'pop', 0.7], [0.35, 'pop', 0.7]] }));
  S('e4_2', st('sky', [B('hera', 360, 700, 220, { e: 'grin' }), B('poseidon', 660, 700, 220, { e: 'grin' }), B('hades', 1260, 700, 220, { e: 'grin', flip: true }), B('demeter', 1560, 700, 220, { e: 'grin', flip: true }), Pr('star', 360, 480, 120, {}), Pr('star', 660, 480, 120, {}), Pr('star', 1260, 480, 120, {}), Pr('star', 1560, 480, 120, {}), Tx('A SHARE EACH', 960, 160, 120, 'label', { at: 0.3 })]));
  S('e4_3', st('sky', [B('zeus', 760, 660, 400, { e: 'smile' }), B('metis', 1360, 680, 330, { e: 'smile', flip: true, at: 0.4 }), Tx('♥', 1060, 360, 190, 'big', { at: 0.9, col: '#ff6a8a' })], { sfx: [[0.9, 'chime', 0.8]] }));
  S('e5_1', st('parch', [B('metis', 960, 650, 440, { e: 'smile' }), Tx('METIS', 960, 150, 130, 'label', { at: 0.2 })], { cam2: [960, 540, 1.08] }));
  S('e5_2', st('parch', [B('metis', 960, 650, 400, { e: 'smug' }), Pr('star', 560, 380, 150, { bob: true, at: 0.3 }), Pr('star', 1380, 400, 130, { bob: true, ph: 1, at: 0.5 }), Pr('star', 1000, 200, 100, { bob: true, ph: 2, at: 0.7 }), Gl(960, 520, 600)]));
  S('e6_1', st('parch', [B('metis', 700, 650, 400, { e: 'smile' }), Pr('baby', 1360, 600, 280, { bob: true, at: 0.3 }), Tx('ATHENA', 1360, 300, 100, 'label', { at: 0.6 }), Gl(1360, 600, 380, { at: 0.3 })]));
  G('e6_2', 'e6_2',
    st('night', [B('zeus', 960, 650, 470, { e: 'smug' }), B('metis', 1500, 700, 220, { e: 'worry', at: 0.1 })], { cam2: [960, 560, 1.12] }),
    st('night', [B('zeus', 960, 650, 500, { e: [[0, 'neutral'], [0.4, 'swallow'], [0.9, 'smug']], sq: [0.75, 0.95, 0.06] }), B('metis', 1500, 700, 230, { e: 'cry', mv: { to: [1010, 520], u0: 0.35, u1: 0.65, bend: -70 }, until: 1.6 })], { cam2: [960, 560, 1.15], sfx: [[0.6, 'gulp', 1]], fx: [{ t: 'flash', u: 0.65, dur: 0.2, a: 0.5 }] }));
  S('e7_1', st('night', [B('gaia', 380, 650, 330, { e: 'smug', wink: [[0.5, true]] }), B('ouranos', 1540, 650, 330, { e: 'smug', flip: true, at: 0.1 }), B('zeus', 960, 760, 250, { e: 'neutral', at: 0.2 }), Tr([560, 480], [820, 640], { u0: 0.2, u1: 0.7 }), Tr([1360, 480], [1100, 640], { u0: 0.3, u1: 0.8 })]));
  S('e7_2', st('sky', [Pr('throne', 960, 660, 560), B('zeus', 960, 560, 320, { e: 'grin' }), Pr('crown', 960, 250, 160, { bob: true }), Tx('NO ONE ELSE', 960, 90, 100, 'label', { at: 0.3 }), Tx('Theogony 891–894', 1560, 940, 54, 'card', { at: 0.6, col: '#3a2410' })]));
  S('e8_1', st('parch', [Pr('baby', 600, 580, 300, { bob: true }), Pr('baby', 1320, 580, 300, { bob: true, ph: 1, at: 0.4 }), Tx('2', 960, 540, 330, 'big', { at: 0.2, col: '#ffd36a' }), B('metis', 960, 900, 150, { at: 0.1, e: 'neutral' })]));
  S('e8_2', st('parch', [Pr('baby', 700, 600, 340, { bob: true }), Pr('bolt', 1330, 480, 230, { at: 0.4, bob: true }), Pr('star', 1330, 780, 150, { at: 0.8, bob: true }), Tx('STRONG', 1330, 270, 90, 'label', { at: 0.4 }), Tx('WISE', 1330, 940, 90, 'label', { at: 0.8 }), Tx('DAUGHTER', 700, 300, 100, 'label')]));
  S('e8_3', st('night', [Pr('baby', 700, 640, 320, { bob: true }), Pr('crown', 700, 330, 170, { at: 0.5, bob: true }), Gl(700, 560, 450, { col: 'rgba(255,60,40,.5)', at: 0.5 }), Pr('throne', 1380, 620, 440, { crack: true, at: 0.9 }), Tx('SON', 700, 120, 110, 'label', { col: '#fff' })], { sfx: [[0.5, 'sting', 0.9]] }));
  S('e9_1', st('parch', [B('zeus', 480, 660, 330, { e: 'neutral', look: 0.6 }), Pr('baby', 1000, 820, 120, { at: 0.2 }), Pr('baby', 1280, 760, 190, { at: 0.5 }), B('zeus', 1580, 680, 250, { at: 0.8, e: 'neutral', alpha: 0.45 }), Tx('✖', 1000, 480, 200, 'big', { at: 1.2, col: '#ff4a3a' })]));
  S('e9_2', st('parch', [B('metis', 700, 660, 400, { e: 'smile' }), Pr('baby', 700, 760, 120, { alpha: 0.9, at: 0.2 }), Tx('✖', 1420, 520, 380, 'big', { at: 0.6, col: '#ff4a3a' })]));
  S('e9_3', st('night', [B('zeus', 960, 650, 520, { e: [[0, 'smug'], [0.3, 'swallow'], [0.8, 'smug']], sq: [0.55, 0.9, 0.07] }), B('metis', 1560, 700, 240, { e: 'cry', mv: { to: [1010, 500], u0: 0.3, u1: 0.55, bend: -80 }, until: 1.5 })], { cam2: [960, 560, 1.2], sfx: [[0.55, 'gulp', 1], [0.6, 'thud', 0.9]], fx: [{ t: 'flash', u: 0.55, dur: 0.25, a: 0.7 }, { t: 'shake', u0: 0.55, u1: 0.8, amp: 10 }] }));
  G('e10_1', 'e10_3',
    st('night', [B('ouranos', 330, 640, 300, { e: 'angry', at: rel('e10_1', 'e10_1') }), Pr('chain', 330, 880, 300, { at: rel('e10_1', 'e10_1') + 0.3 }),
      B('cronos', 960, 640, 300, { e: 'swallow', at: rel('e10_1', 'e10_2') }), Pr('baby', 960, 880, 150, { at: rel('e10_1', 'e10_2') + 0.3 }),
      B('zeus', 1590, 640, 300, { e: 'smug', flip: true, at: rel('e10_1', 'e10_3') }), B('metis', 1590, 880, 130, { e: 'cry', at: rel('e10_1', 'e10_3') + 0.3 }),
      Tx('1', 330, 180, 110, 'label', { col: '#fff', at: rel('e10_1', 'e10_1') }), Tx('2', 960, 180, 110, 'label', { col: '#fff', at: rel('e10_1', 'e10_2') }), Tx('3', 1590, 180, 110, 'label', { col: '#fff', at: rel('e10_1', 'e10_3') })], { cam2: [960, 540, 1.04], sfx: [[0.02, 'pop', 0.8], [0.35, 'gulp', 0.8], [0.7, 'gulp', 1]] }));
  S('e11_1', st('night', [B('gaia', 960, 650, 520, { e: 'smug', wink: [[0.6, true]] }), Gl(960, 540, 800, { col: 'rgba(120,220,100,.4)' })], { cam2: [960, 540, 1.12], sfx: [[0, 'rumble', 0.6]] }));
  G('e11_2', 'e11_7',
    st('night', [Gl(960, 540, 700, { col: 'rgba(120,220,100,.3)' }), B('gaia', 960, 640, 320, { e: 'smug' }),
      Pr('sickle', 150, 250, 150, { at: rel('e11_2', 'e11_2') }), Tx('MADE THE SICKLE', 450, 250, 40, 'label', { col: '#fff', at: rel('e11_2', 'e11_2') + 0.1 }),
      Pr('baby', 150, 520, 140, { at: rel('e11_2', 'e11_3') }), Tx('HID THE BABY', 450, 520, 40, 'label', { col: '#fff', at: rel('e11_2', 'e11_3') + 0.1 }),
      B('cronos', 150, 790, 120, { at: rel('e11_2', 'e11_4'), e: 'dazed' }), Tx('TRICKED CRONOS', 450, 790, 40, 'label', { col: '#fff', at: rel('e11_2', 'e11_4') + 0.1 }),
      Pr('bolt', 1770, 250, 150, { at: rel('e11_2', 'e11_5') }), Tx('WON THE WAR', 1470, 250, 40, 'label', { col: '#fff', at: rel('e11_2', 'e11_5') + 0.1 }),
      Pr('crown', 1770, 520, 120, { at: rel('e11_2', 'e11_6') }), Tx('MADE ZEUS KING', 1470, 520, 40, 'label', { col: '#fff', at: rel('e11_2', 'e11_6') + 0.1 }),
      B('zeus', 1770, 790, 120, { at: rel('e11_2', 'e11_7'), e: 'smug', flip: true }), Tx('PROTECTED HIS THRONE', 1470, 790, 38, 'label', { col: '#fff', at: rel('e11_2', 'e11_7') + 0.1 })], { cam2: [960, 540, 1.03] }));
  S('e12_1', st('night', [Pr('throne', 420, 780, 330), B('ouranos', 420, 700, 190, { e: 'neutral' }), Pr('throne', 960, 780, 330), B('cronos', 960, 700, 190, { e: 'neutral', at: 0.2 }), Pr('throne', 1500, 780, 330), B('zeus', 1500, 700, 190, { e: 'neutral', at: 0.4 }), B('gaia', 960, 400, 380, { e: 'smug', wink: [[0.7, true]], at: 0.3 }), Tr([760, 500], [420, 600], { u0: 0.3, u1: 0.8 }), Tr([960, 580], [960, 620], { u0: 0.3, u1: 0.8 }), Tr([1160, 500], [1500, 600], { u0: 0.3, u1: 0.8 })], { cam2: [960, 540, 1.06] }));

  // ============================================================ f. THE END
  G('f1_1', 'f1_1', st('sky', [Pr('throne', 420, 780, 360), B('ouranos', 420, 680, 230, { e: 'neutral' }), Pr('throne', 960, 780, 360), B('cronos', 960, 680, 230, { e: 'neutral', at: 0.2 }), Pr('throne', 1500, 780, 360), B('zeus', 1500, 680, 230, { e: 'neutral', at: 0.4 }), Tx('3 RULERS OF THE SKY', 960, 130, 90, 'label', { at: 0.3 })]));
  S('f1_2', st('night', [B('ouranos', 600, 650, 380, { e: 'dazed', tilt: -0.2 }), B('cronos', 1320, 650, 330, { e: 'angry', flip: true }), Pr('sickle', 960, 480, 230, { at: 0.2, spin: 5 }), Tx('1', 600, 130, 110, 'label', { col: '#fff' })], { fx: [{ t: 'flash', u: 0.3, dur: 0.2, a: 0.6 }] }));
  S('f1_3', st('sky', [B('cronos', 600, 650, 380, { e: 'dazed', tilt: 0.2 }), Pr('throne', 600, 760, 300, { crack: true }), B('zeus', 1320, 650, 330, { e: 'angry', flip: true }), Tx('2', 600, 130, 110, 'label')], { fx: [{ t: 'shake', u0: 0.2, u1: 0.5, amp: 10 }] }));
  S('f1_4', st('night', [B('zeus', 600, 650, 400, { e: 'smug' }), Pr('baby', 1320, 600, 280, { alpha: 0.28, bob: true }), Tx('✖', 1320, 600, 330, 'big', { col: '#ff4a3a', at: 0.8 }), Tx('3', 600, 130, 110, 'label', { col: '#fff' })], { cam2: [960, 540, 1.08] }));
  S('f2_1', st('parch', [B('hesiod', 960, 650, 430, { e: 'neutral', tilt: 0.06 })], { cam2: [960, 540, 1.08] }));
  S('f2_2', st('parch', [B('hesiod', 640, 650, 360, { e: 'smile' }), Pr('scroll', 1340, 540, 420, { rot: 0.05, plain: true }), Tx('"deception"', 1340, 540, 74, 'label', { at: 0.4 })]));
  S('f2_3', st('sky', [B('zeus', 640, 650, 400, { e: 'smile' }), B('shadow', 1340, 650, 330, { e: 'neutral', flip: true, at: 0.3 }), Tx('♥', 960, 300, 200, 'big', { at: 0.6, col: '#ff6a8a' })]));
  S('f3_1', st('night', [Pr('qmark', 960, 520, 700)], { cam2: [960, 540, 1.1], sfx: [[0, 'sting', 0.8]] }));
  S('f3_2', st('night', [B('zeus', 960, 650, 520, { e: 'smug' }), B('metis', 960, 730, 170, { e: 'cry', alpha: 0.6, at: 0.3 }), Pr('baby', 1560, 440, 190, { at: 0.5, bob: true }), Tx('BEFORE', 1560, 240, 80, 'label', { col: '#fff', at: 0.6 })]));
  G('f3_3', 'f3_3',
    st('parch', [B('hesiod', 640, 650, 340, { e: 'neutral' }), Pr('scroll', 1320, 540, 420, { plain: true }), Tx('"...from his own head"', 1320, 540, 46, 'label', { at: 0.4 })]),
    st('night', [B('zeus', 960, 650, 480, { e: 'shock' }), Gl(960, 230, 360, { at: 0.5, col: 'rgba(255,230,140,.8)' }), Pr('qmark', 1500, 330, 280, { at: 0.8 }), Pr('qmark', 420, 360, 220, { at: 1.1 })], { fx: [{ t: 'flash', u: 0.6, dur: 0.3, a: 0.7 }], sfx: [[0.6, 'chime', 1]] }));
  G('f4_1', 'f4_1',
    st('night', [B('zeus', 760, 640, 400, { e: 'neutral', look: 0.5 }), Gl(760, 230, 330, { col: 'rgba(255,230,140,.7)' }), Tx('NEXT TIME', 1360, 340, 120, 'label', { col: '#fff' }), Tx('ATHENA', 1360, 500, 150, 'label', { col: '#ffd36a', at: 0.3 }), Pr('qmark', 1360, 760, 220, { at: 0.8 })], { cam2: [960, 540, 1.06] }),
    st('night', [B('zeus', 520, 640, 340, { e: 'smile' }), Tx('NEXT TIME', 1360, 250, 100, 'label', { col: '#fff' }), Tx('ATHENA', 1360, 400, 130, 'label', { col: '#ffd36a' })], { cap: false, cam2: [960, 540, 1.04], w: 1.6 }));

  // a few gaps may remain between consecutive shots with identical anchors; fine. Shots whose bg is unknown fall back to parch.
  window.SHOT_DEFS = SH.map(s => { if (!['map', 'parch', 'night', 'chaos', 'hell', 'sky', 'storm', 'dark', 'sea', 'photo'].includes(s.bg)) s.bg = 'parch'; return s; });
})();
