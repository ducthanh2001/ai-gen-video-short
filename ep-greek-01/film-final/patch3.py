def sub(s, old, new, count=1):
    assert old in s, old[:90]
    return s.replace(old, new) if count == 0 else s.replace(old, new, count)

p = 'engine.js'; e = open(p, encoding='utf-8').read()
e = sub(e, "ctx.save(); ctx.globalAlpha *= r.alpha; prop({ n: it.n, x: r.x, y: r.y, s: r.s, t, pop: r.pop, rot: (it.rot || 0) + (it.spin ? tl * it.spin : 0), flip: it.flip, bob: it.bob, col: it.col, crack: it.crack, cave: it.cave, plain: it.plain, alpha: it.alpha, ph: it.ph }); ctx.restore();",
        "ctx.save(); ctx.globalAlpha *= r.alpha; prop(Object.assign({}, it, { x: r.x, y: r.y, s: r.s, t, pop: r.pop, rot: (it.rot || 0) + (it.spin ? tl * it.spin : 0) })); ctx.restore();")
e = sub(e, "(it.k === 'text' ? s0 * 0.6 * String(it.t).split('\\n').length : s0 * 0.5);", "(it.k === 'text' ? s0 * 0.9 * String(it.t).split('\\n').length : s0 * 0.5);")
e = sub(e, "const bot = it.k === 'bust' ? s0 * 0.64 : (it.k === 'text' ? s0 * 0.6 : s0 * 0.5);", "const bot = it.k === 'bust' ? s0 * 0.64 : (it.k === 'text' ? s0 * 0.9 : (it.n === 'bars' ? s0 * 0.68 : s0 * 0.5));")
e = sub(e, "if (it.cap) drawText({ t: it.cap, st: 'tag', s: 30 }, { x: r.x, y: r.y + h / 2 + 52 * SX * k, s: 30 * SX * k, pop: r.pop, alpha: r.alpha }); }",
        "if (it.cap) drawText({ t: it.cap, st: 'tag', s: 34 }, { x: r.x, y: r.y + h / 2 + 56 * SX * k, s: 34 * SX * k, pop: r.pop, alpha: r.alpha }); }")
open(p, 'w', encoding='utf-8').write(e)

p = 'shots.js'; s = open(p, encoding='utf-8').read()
s = s.replace("bend: 25, u0:", "bend: 1.2, u0:")
s = sub(s, "st('parch', TREE('a3_4'), { cam: [960, 540, 1.02], cam2: [1300, 640, 1.4] })", "st('parch', TREE('a3_4'), { cam: [960, 540, 1.02], cam2: [1250, 600, 1.25] })")
s = sub(s, "B(n, x, 980, 90, { free: true, alpha: 0.75, e: 'worry' })", "B(n, x, 860, 90, { free: true, alpha: 0.75, e: 'worry' })")
s = sub(s, "Pr('rock', 540, 810, 460), B('gaia', 1400, 640, 320", "Pr('rock', 540, 870, 400), B('gaia', 1400, 640, 320")
s = sub(s, "[[0.6, 0.32, 1.7], [0.64, 0.3, 1.9]]", "[[0.52, 0.2, 2.3], [0.56, 0.18, 2.5]]")
s = sub(s, "{ k: 'prop', n: 'stoneBare', pos: [22.38, 38.46], sys: 'geo', s: 130, in: 'drop', at: 0.4 }", "{ k: 'prop', n: 'stoneBare', pos: [22.25, 38.40], sys: 'geo', s: 130, in: 'drop', at: 0.4 }")
s = sub(s, "GT('DELPHI, ALSO CALLED PYTHO', ...DELPHI, 70, 40, { at: 0.4 })", "GT('DELPHI, ALSO CALLED PYTHO', ...DELPHI, 100, 40, { at: 0.4 })")
s = sub(s, "S('c1_2', mp([22.3, 39.25, 1.8],", "S('c1_2', mp([22.3, 39.0, 1.8],")
s = sub(s, "Tag('THE TITANS', 600, 560, 40, { at: 0.5 })], { cam2: [22.3, 39.25, 1.9] }));", "Tag('THE TITANS', 600, 470, 40, { at: 0.5 })], { cam2: [22.3, 39.0, 1.9] }));")
s = sub(s, "Tag('ZEUS AND THE YOUNG GODS', 1450, 560, 40, { at: 0.6 })", "Tag('ZEUS AND THE YOUNG GODS', 1450, 470, 40, { at: 0.6 })")
s = sub(s, "    st('dark', [Art('titans', 960, 470, 1150, 640, [[0.5, 0.18, 1.9], [0.45, 0.16, 2.1]], 'Cornelis van Haarlem, The Fall of the Titans (1588–90)')]));",
        "    st('battle', [...[600, 960, 1320].map((x, i) => B('titan', x, 800, 150, { e: 'dazed', v: i })), ...Array.from({ length: 14 }, (_, i) => Pr('rock', 470 + (i % 7) * 160, 640 + Math.floor(i / 7) * 90 - (i % 2) * 30, 150, { at: 0.05 * i, in: 'drop' })), Tag('ONE ON TOP OF ANOTHER', 960, 110, 50, { at: 0.2 })], { fx: [{ t: 'shake', u0: 0.1, u1: 0.8, amp: 6 }], sfx: [[0.05, 'crash', 0.8]] }));")
s = s.replace("...[600, 960, 1320].map((x, i) => B('titan', x, 780, 170, { e: 'dazed', v: i })), Pr('bars', 960, 770, 560)", "...[600, 960, 1320].map((x, i) => B('titan', x, 720, 150, { e: 'dazed', v: i })), Pr('bars', 960, 650, 440)")
s = sub(s, "...[600, 960, 1320].map(x => Pr('chain', x, 820, 260, { at: 0.4 }))", "...[600, 960, 1320].map(x => Pr('chain', x, 820, 180, { at: 0.4 }))")
s = sub(s, "...[700, 1000, 1300].map(x => Pr('chain', x, 820, 230))", "...[700, 1000, 1300].map(x => Pr('chain', x, 820, 170))")
s = sub(s, "Tx('TYPHOEUS', 960, 120, 110, 'label', { at: 0.3, col: '#fff' })", "Tag('TYPHOEUS', 1650, 300, 60, { at: 0.3 })")
s = sub(s, "S('d10_2', mp([17.0, 43.5, 0.2],", "S('d10_2', mp([17.0, 43.5, 0.17],")
s = sub(s, "{ cam2: [16.0, 44.5, 0.24] }));", "{ cam2: [17.0, 43.6, 0.18] }));")
s = sub(s, "Ph('t', [[0.37, 0.25, 1.8], [0.37, 0.22, 2.1]])", "Ph('t', [[0.58, 0.2, 1.8], [0.58, 0.18, 2.0]])")
s = sub(s, "Tx('\"a deception\"', 1320, 520, 64, 'label', { at: 0.3, fit: 300 })", "Tag('\"A DECEPTION\"', 1320, 520, 46, { at: 0.3 })")
s = sub(s, "Tx('\"...from his own head\"', 1320, 520, 56, 'label', { at: 0.3, fit: 320 })", "Tag('\"...FROM HIS OWN HEAD\"', 1320, 520, 38, { at: 0.3 })")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
