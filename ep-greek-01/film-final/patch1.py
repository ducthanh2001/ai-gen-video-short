def sub(s, old, new, count=1):
    assert old in s, old[:70]
    return s.replace(old, new, count)

# engine
p = 'engine.js'; e = open(p, encoding='utf-8').read()
e = sub(e, "for (const it of (sh.items || [])) drawItem(it, sh, cam, tl, dur, bg, t);", "const its = sh.items || []; for (const it of its) if (it.k === 'glow') drawItem(it, sh, cam, tl, dur, bg, t); for (const it of its) if (it.k !== 'glow') drawItem(it, sh, cam, tl, dur, bg, t);")
e = sub(e, "cave: it.cave,", "cave: it.cave, plain: it.plain,")
open(p, 'w', encoding='utf-8').write(e)

# chars
p = 'chars.js'; c = open(p, encoding='utf-8').read()
c = sub(c, "const PR = PROPS[k]; if (PR) PR(c, t);", "c._k = s * pp; const PR = PROPS[k]; if (PR) PR(c, t);")
c = sub(c, "mount: (c) => mount(0, 0.45, 0.85, '#b79a68', c.cave),", "mount: (c) => { const k = c._k; ctx.save(); ctx.scale(1 / k, 1 / k); mount(0, 0.45 * k, 0.85 * k, '#b79a68', c.cave); ctx.restore(); },")
c = sub(c, "ctx.strokeStyle = '#7b6038'; ctx.lineWidth = 0.035; for (let i = 0; i < 5; i++) {", "ctx.strokeStyle = '#7b6038'; ctx.lineWidth = 0.035; for (let i = 0; i < (c.plain ? 0 : 5); i++) {")
c = sub(c, "scroll: () => {", "scroll: (c) => {")
open(p, 'w', encoding='utf-8').write(c)

# shots
p = 'shots.js'; s = open(p, encoding='utf-8').read()
for n, x in [('HESTIA', 290), ('DEMETER', 625), ('HERA', 960), ('HADES', 1295), ('POSEIDON', 1630)]:
    s = sub(s, "Tx('%s', %d, 870, 62, 'label'" % (n, x), "Tx('%s', %d, 880, 42, 'label'" % (n, x))
s = sub(s, "Pr('scroll', 1280, 560, 380, { at: 0.35, rot: -0.06 })", "Pr('scroll', 1280, 560, 380, { at: 0.35, rot: -0.06, plain: true })")
s = sub(s, "Pr('scroll', 960, 520, 520, { rot: -0.05 }), Tx('THEOGONY'", "Pr('scroll', 960, 520, 520, { rot: -0.05, plain: true }), Tx('THEOGONY'")
s = sub(s, "Pr('scroll', 960, 520, 520, { rot: -0.04 }), B('hesiod', 400, 700, 260, { e: 'smile' }), Tx('A MEASUREMENT', 960, 520, 70, 'label', { at: 0.3 })", "Pr('scroll', 960, 500, 520, { rot: -0.04 }), B('hesiod', 400, 700, 260, { e: 'smile' }), Tx('A MEASUREMENT', 960, 830, 70, 'label', { at: 0.3 })")
s = sub(s, "Pr('scroll', 1340, 540, 420, { rot: 0.05 }), Tx('\"deception\"', 1340, 540, 74, 'label', { at: 0.4 })", "Pr('scroll', 1340, 540, 420, { rot: 0.05, plain: true }), Tx('\"deception\"', 1340, 540, 74, 'label', { at: 0.4 })")
s = sub(s, "Pr('scroll', 1320, 540, 420), Tx('\"...from his own head\"', 1320, 540, 52, 'label', { at: 0.4 })", "Pr('scroll', 1320, 540, 420, { plain: true }), Tx('\"...from his own head\"', 1320, 540, 46, 'label', { at: 0.4 })")
s = sub(s, "Pr('scroll', 1300, 560, 380, { rot: 0.05 }), Tx('...', 1300, 560, 130, 'big', { at: 0.4, col: '#4a3318' })", "Pr('scroll', 1300, 560, 380, { rot: 0.05, plain: true }), Tx('...', 1300, 560, 130, 'big', { at: 0.4, col: '#4a3318' })")
s = sub(s, "B('zeus', 560, 660, 380, { e: 'angry', mv: { to: [800, 660], u0: 0.3, u1: 0.5 } }), B('gaia', 960, 250, 170, { e: 'smug', wink: [[0.2, true]], at: 0.1 })", "B('zeus', 560, 660, 380, { e: 'angry', mv: { to: [760, 660], u0: 0.3, u1: 0.5 } }), B('gaia', 1150, 190, 150, { e: 'smug', wink: [[0.2, true]], at: 0.1 })")
s = s.replace("{ k: 'ruler', pos: [420, 110], s: 100, len: 840 }", "{ k: 'ruler', pos: [420, 110], s: 100, len: 770 }")
s = s.replace("Tx('EARTH', 640, 520, 70, 'label', { col: '#fff' }), Tx('TARTARUS', 700, 940, 70, 'label', { col: '#fff' })", "Tx('EARTH', 640, 495, 70, 'label', { col: '#fff' }), Tx('TARTARUS', 700, 880, 70, 'label', { col: '#fff' })")
s = sub(s, "Pr('anvil', 420, 130, 200, { mv: { to: [420, 500], u0: 0.0, u1: 0.95 } })", "Pr('anvil', 420, 130, 200, { mv: { to: [420, 495], u0: 0.0, u1: 0.95 } })")
s = sub(s, "Pr('anvil', 420, 500, 200, { mv: { to: [420, 900], u0: 0.0, u1: 0.95 } })", "Pr('anvil', 420, 495, 200, { mv: { to: [420, 870], u0: 0.0, u1: 0.95 } })")
s = sub(s, "B('typhoeus', 1000, 230, 360, { e: 'dazed', mv: { to: [1000, 900], u0: 0.15, u1: 0.8 }, tilt: 0.3 }), Tx('TARTARUS', 1000, 960, 80, 'label', { col: '#fff', at: 0.2 })", "B('typhoeus', 1000, 230, 360, { e: 'dazed', mv: { to: [1000, 780], u0: 0.15, u1: 0.8 }, tilt: 0.3 }), Tx('TARTARUS', 1000, 880, 80, 'label', { col: '#fff', at: 0.2 })")
s = sub(s, "Tx('IF NOT FOR...', 960, 90, 90, 'label', { at: 0.3, col: '#fff' })", "Tx('IF NOT FOR...', 420, 300, 70, 'label', { at: 0.3, col: '#fff' })")
s = sub(s, "st('parch', [B('typhoeus', 520, 650, 380, { e: 'angry' }), Tx('HESIOD', 520, 215, 90, 'label'), Tx('100 HEADS', 520, 900, 70, 'big', { at: 0.4 }), Tx('NO WINGS', 1400, 900, 70, 'big', { at: 0.9, col: '#ff6a5a' }), B('typhonW', 1400, 650, 380, { e: 'angry', at: 0.6 }), Tx('THE PAINTER', 1400, 215, 90, 'label', { at: 0.6 })]),", "st('parch', [B('typhoeus', 520, 640, 340, { e: 'angry' }), Tx('HESIOD', 520, 140, 80, 'label'), Tx('100 HEADS', 520, 870, 64, 'big', { at: 0.4 }), Tx('WINGS', 1400, 870, 64, 'big', { at: 0.9, col: '#ff6a5a' }), B('typhonW', 1400, 640, 340, { e: 'angry', at: 0.6 }), Tx('THE PAINTER', 1400, 140, 80, 'label', { at: 0.6 })]),")
i0 = s.index("  G('e11_2', 'e11_7',"); i1 = s.index("  S('e12_1'")
new = """  G('e11_2', 'e11_7',
    st('night', [Gl(960, 540, 700, { col: 'rgba(120,220,100,.3)' }), B('gaia', 960, 650, 400, { e: 'smug' }),
      Pr('sickle', 170, 250, 170, { at: rel('e11_2', 'e11_2') }), Tx('MADE THE SICKLE', 520, 250, 46, 'label', { col: '#fff', at: rel('e11_2', 'e11_2') + 0.1 }),
      Pr('baby', 170, 520, 150, { at: rel('e11_2', 'e11_3') }), Tx('HID THE BABY', 520, 520, 46, 'label', { col: '#fff', at: rel('e11_2', 'e11_3') + 0.1 }),
      B('cronos', 170, 790, 130, { at: rel('e11_2', 'e11_4'), e: 'dazed' }), Tx('TRICKED CRONOS', 520, 790, 46, 'label', { col: '#fff', at: rel('e11_2', 'e11_4') + 0.1 }),
      Pr('bolt', 1750, 250, 160, { at: rel('e11_2', 'e11_5') }), Tx('WON THE WAR', 1400, 250, 46, 'label', { col: '#fff', at: rel('e11_2', 'e11_5') + 0.1 }),
      Pr('crown', 1750, 520, 130, { at: rel('e11_2', 'e11_6') }), Tx('MADE ZEUS KING', 1400, 520, 46, 'label', { col: '#fff', at: rel('e11_2', 'e11_6') + 0.1 }),
      B('zeus', 1750, 790, 130, { at: rel('e11_2', 'e11_7'), e: 'smug', flip: true }), Tx('PROTECTED HIS THRONE', 1400, 790, 42, 'label', { col: '#fff', at: rel('e11_2', 'e11_7') + 0.1 })], { cam2: [960, 540, 1.03] }));
"""
s = s[:i0] + new + s[i1:]
open(p, 'w', encoding='utf-8').write(s)
print('ok')
