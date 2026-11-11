def sub(s, old, new):
    assert old in s, old[:100]
    return s.replace(old, new, 1)
p = 'shots.js'; s = open(p, encoding='utf-8').read()
s = sub(s, "S('h1_1', st('night', [B('zeus', 960, 640, 440, { e: [[0, 'grin'], [0.55, 'swallow']], look: 0.2 }),", "S('h1_1', st('night', [B('zeus', 960, 640, 440, { in: 'none', e: [[0, 'grin'], [0.55, 'swallow']], look: 0.2 }),")
s = sub(s, "  G('h3_1', 'h3_1',\n    mp(", "  S('h3_1', mp(")
s = sub(s, "{ cam2: [22.3, 39.6, 1.25], sfx: [[0.2, 'thud', 0.8]] }),\n    st('storm', [B('typhoeus', 960, 760, 360, { e: 'angry', in: 'up' }), Tag('A MONSTER WITH 100 HEADS', 960, 90, 46)], { fx: [{ t: 'shake', u0: 0, u1: 0.5, amp: 10 }], sfx: [[0.05, 'roar', 0.7]] }),\n    st('olympus',",
           "{ cam2: [22.3, 39.6, 1.25], sfx: [[0.2, 'thud', 0.8]] }));\n  S('h3_2', st('storm', [B('typhoeus', 960, 760, 360, { e: 'angry', in: 'up' }), Tag('A MONSTER WITH 100 HEADS', 960, 90, 46)], { fx: [{ t: 'shake', u0: 0, u1: 0.5, amp: 10 }], sfx: [[0.05, 'roar', 0.7]] }));\n  S('h3_3', st('olympus',")
s = sub(s, "  G('h4_1', 'h4_1',\n    st('chaos', [Tx('◀◀', 960, 470, 380, 'big', { col: '#ffd36a', in: 'fade' }), Tag('BACK TO THE BEGINNING', 960, 800, 50, { at: 0.3 })], { sfx: [[0, 'rewind', 0.7]] }),\n    st('nighthills',",
           "  S('h4_1', st('chaos', [Tx('◀◀', 960, 470, 380, 'big', { col: '#ffd36a', in: 'fade' }), Tag('BACK TO THE BEGINNING', 960, 800, 50, { at: 0.3 })], { sfx: [[0, 'rewind', 0.7]] }));\n  S('h4_2', st('nighthills',")
s = sub(s, "  G('h5_1', 'h5_1',\n    st('parch', [B('cronos', 600, 650, 380,", "  S('h5_1', st('parch', [B('cronos', 600, 650, 380,")
s = sub(s, "Tag('A STONE FED TO A GOD', 1300, 220, 46, { at: 0.2 })], { sfx: [[0.9, 'gulp', 0.8]] }),\n    { bg: 'photo',",
           "Tag('A STONE FED TO A GOD', 1300, 220, 46, { at: 0.2 })], { sfx: [[0.9, 'gulp', 0.8]] }));\n  S('h5_2', { bg: 'photo',")
# a1: two sentences now
i0 = s.index("  S('a1_1', mp("); i1 = s.index("  S('a2_1',")
s = s[:i0] + """  G('a1_1', 'a1_1',
    st('parch', [Pr('scroll', 960, 470, 560, { rot: -0.03, plain: true }), Tx('THEOGONY', 960, 440, 80, 'label', { fit: 420 }), Tag('"THE BIRTH OF THE GODS"', 960, 560, 40, { at: 0.2 }), B('zeus', 300, 790, 150, { at: 0.2, e: 'smile' }), B('hera', 560, 800, 140, { at: 0.35, e: 'smile' }), B('poseidon', 1360, 800, 140, { at: 0.5, e: 'smile', flip: true }), B('hades', 1620, 790, 150, { at: 0.65, e: 'smile', flip: true })], { cam2: [960, 540, 1.05], cut: true }),
    st('parch', [Art('moreau', 1250, 470, 470, 620, [[0.42, 0.2, 1.7], [0.42, 0.22, 1.9]], 'Gustave Moreau imagines Hesiod as a young shepherd (1891)'), B('hesiod', 500, 650, 330, { e: 'smile', at: 0.2 }), Tag('HESIOD', 500, 150, 54, { at: 0.3 })], { cam2: [960, 540, 1.04] }));
  S('a1_2', mp([22.5, 38.6, 0.32], [Tx('c. 700 BC', 960, 200, 150, 'year', { in: 'fade' }), { k: 'zone', pos: [23.0, 38.3], sys: 'geo', s: 70, at: 0.6 }, GT('GREECE', 22.2, 39.4, 0, 46, { at: 0.4 })], { cam2: [22.6, 38.5, 0.42] }));
""" + s[i1:]
open(p, 'w', encoding='utf-8').write(s)
p = 'build_timing.py'; b = open(p, encoding='utf-8').read()
b = sub(b, "    if i == 'h5_1': return 0.7", "    if i == 'h5_2': return 0.7")
b = sub(b, "    if i in ('b6_4', 'b3_1'): return 0.45", "    if i in ('b6_4', 'b3_1', 'h1_2', 'h2_2'): return 0.45")
open(p, 'w', encoding='utf-8').write(b)
print('ok')
