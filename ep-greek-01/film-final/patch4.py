def sub(s, old, new):
    assert old in s, old[:100]
    return s.replace(old, new, 1)

# ---------------- chars
p = 'chars.js'; c = open(p, encoding='utf-8').read()
c = sub(c, "cronos:   { skin: '#dba27a', robe: '#8e3f56', trim: '#f0cf7a', hair: '#3a2a20', style: 'cap', beard: '#3a2a20', short: true,",
           "cronos:   { skin: '#dba27a', robe: '#8e3f56', trim: '#f0cf7a', hair: '#3a2a20', style: 'cap', beard: '#6a4630', short: true,")
c = sub(c, "themis:   { skin: '#f0bd98', robe: '#9a92b8', trim: '#f4e6b0', hair: '#4a3a3a', style: 'veil', veil: '#e0d8ec', emblem: 'scales' },",
           "themis:   { skin: '#f0bd98', robe: '#9a92b8', trim: '#f4e6b0', hair: '#c9a060', style: 'long', wreath: '#d9d2ea', emblem: 'scales' },")
# short beard = chin beard below the mouth, with a skin gap
c = sub(c, "if (o.short) { ctx.moveTo(-0.42, -0.38); ctx.bezierCurveTo(-0.4, -0.05, 0.4, -0.05, 0.42, -0.38); }",
           "if (o.short) { ctx.moveTo(-0.36, -0.3); ctx.bezierCurveTo(-0.32, 0.0, 0.32, 0.0, 0.36, -0.3); ctx.quadraticCurveTo(0, -0.12, -0.36, -0.3); ctx.closePath(); ctx.fill(); ctx.lineWidth = 0.03; ctx.strokeStyle = OL; ctx.stroke(); ctx.beginPath(); }")
c = sub(c, "const my = o.beard ? -0.17 : -0.22;", "const my = o.short ? -0.23 : (o.beard ? -0.17 : -0.22);")
# brows of wild-haired characters sit lower, below the fringe
c = sub(c, "by = (o.cyc ? -0.82 : -0.72) + up,", "by = (o.cyc ? -0.82 : (o.style === 'wild' ? -0.67 : -0.72)) + up,")
# jug with neck and handle
c = sub(c, "jug: (c, t) => { ctx.fillStyle = '#c9783a'; ctx.beginPath(); ctx.moveTo(-0.2, -0.5);",
           "jug: (c, t) => { ctx.strokeStyle = OL; ctx.lineWidth = 0.09; ctx.beginPath(); ctx.arc(0.36, -0.12, 0.2, -1.4, 1.4); ctx.stroke(); ctx.strokeStyle = '#c9783a'; ctx.lineWidth = 0.05; ctx.stroke(); ctx.strokeStyle = OL; ctx.lineWidth = 0.05; ctx.fillStyle = '#c9783a'; ctx.fillRect(-0.12, -0.75, 0.24, 0.3); ctx.strokeRect(-0.12, -0.75, 0.24, 0.3); ctx.beginPath(); ctx.moveTo(-0.2, -0.5);")
c = sub(c, "ctx.beginPath(); ctx.moveTo(0, -0.55); ctx.quadraticCurveTo(0.05, -0.9 - Math.sin(t * 6) * 0.03, 0.0, -1.4); ctx.stroke(); } },",
           "ctx.beginPath(); ctx.moveTo(0, -0.78); ctx.quadraticCurveTo(0.05, -1.1 - Math.sin(t * 6) * 0.03, 0.0, -1.6); ctx.stroke(); } },")
c = sub(c, "ctx.fillStyle = '#b5612a'; ctx.beginPath(); ctx.ellipse(0, -0.52, 0.22, 0.07, 0, 0, 7); ctx.fill(); ctx.stroke();",
           "ctx.fillStyle = '#b5612a'; ctx.beginPath(); ctx.ellipse(0, -0.76, 0.16, 0.06, 0, 0, 7); ctx.fill(); ctx.stroke();")
# bronze gate
c = sub(c, "gate: () => { ctx.fillStyle = '#b5793a';", "gate: () => { ctx.fillStyle = '#b87333';")
c = sub(c, "ctx.beginPath(); ctx.moveTo(-0.7, 0.1); ctx.lineTo(0.7, 0.1); ctx.stroke(); },", "ctx.beginPath(); ctx.moveTo(-0.7, 0.1); ctx.lineTo(0.7, 0.1); ctx.stroke(); ctx.fillStyle = 'rgba(80,160,130,.45)'; for (const [x, y, r] of [[-0.5, 0.4, 0.08], [0.45, -0.2, 0.06], [-0.2, -0.5, 0.05], [0.3, 0.45, 0.07]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } },")
open(p, 'w', encoding='utf-8').write(c)

# ---------------- engine
p = 'engine.js'; e = open(p, encoding='utf-8').read()
e = sub(e, "else if (type === 'section') { const L = [[0, 0.24, '#9fd0f0', '#cfe8f6'], [0.24, 0.40, '#7aa84e', '#8a6a3e'], [0.40, 0.80, '#4a2e1e', '#2a1410'], [0.80, 1, '#3a0e0a', '#6a1a0e']];",
           "else if (type === 'section') { const eY = sh.earthY || 0.24, L = [[0, eY, '#9fd0f0', '#cfe8f6'], [eY, eY + 0.16, '#7aa84e', '#8a6a3e'], [eY + 0.16, 0.80, '#4a2e1e', '#2a1410'], [0.80, 1, '#3a0e0a', '#6a1a0e']];")
e = sub(e, "ctx.fillStyle = '#5f9a3e'; ctx.fillRect(0, 0.24 * H, W, 10 * SX);", "ctx.fillStyle = '#5f9a3e'; ctx.fillRect(0, eY * H, W, 10 * SX);")
e = sub(e, "for (const [txt, y] of [['SKY', 0.07], ['EARTH', 0.32], ['TARTARUS', 0.86]])", "for (const [txt, y] of [['SKY', 0.07], ['EARTH', eY + 0.08], ['TARTARUS', 0.83]])")
e = sub(e, "ctx.font = `700 ${30 * SX}px \"Playfair Display SC\",Georgia,serif`; const w = ctx.measureText(ch.label).width + 60 * SX, h = 62 * SX;",
           "ctx.font = `700 ${36 * SX}px \"Playfair Display SC\",Georgia,serif`; const w = ctx.measureText(ch.label).width + 64 * SX, h = 70 * SX;")
open(p, 'w', encoding='utf-8').write(e)

# ---------------- shots
p = 'shots.js'; s = open(p, encoding='utf-8').read()
# map fixes
s = sub(s, "Tr([22.4, 37.9], [24.6, 35.3], { sys: 'geo', u0: 0.1, u1: 0.75, bend: 20 })", "Tr([22.4, 37.9], [24.6, 35.4], { sys: 'geo', u0: 0.1, u1: 0.75, bend: 0.3 })")
s = sub(s, "GT('DELPHI, ALSO CALLED PYTHO', ...DELPHI, 100, 40, { at: 0.4 }), { k: 'prop', n: 'stoneBare', pos: [22.5, 38.3], sys: 'geo', s: 120, in: 'drop', at: 0.4 }",
           "GT('DELPHI, ALSO CALLED PYTHO', ...DELPHI, 130, 40, { at: 0.4 }), { k: 'prop', n: 'stoneBare', pos: [22.5, 38.47], sys: 'geo', d: [-170, 10], s: 110, in: 'drop', at: 0.4 }")
s = s.replace("GT('OTHRYS', ...OTHRYS, -80)", "GT('OTHRYS', ...OTHRYS, 80)")
s = sub(s, "Tx('10 YEARS', 960, 140, 130, 'big', { at: 0.2 })], { sfx: [[0.2, 'thud', 0.8]] }),", "Tx('10 YEARS', 1480, 560, 110, 'big', { at: 0.2 })], { sfx: [[0.2, 'thud', 0.8]] }),")
s = sub(s, "S('d10_2', mp([17.0, 43.5, 0.17],", "S('d10_2', mp([18.0, 44.0, 0.15],")
s = sub(s, "{ cam2: [17.0, 43.6, 0.18] }));", "{ cam2: [18.0, 44.0, 0.16] }));")
# violence-looking crosses removed
s = sub(s, "S('e9_2', st('parch', [B('metis', 760, 650, 400, { e: 'worry', belly: true }), Pr('cross', 760, 720, 220, { at: 0.6 }), Tag('NOT EVEN BORN', 1450, 400, 48, { at: 0.5 })]));",
           "S('e9_2', st('parch', [B('metis', 760, 650, 400, { e: 'worry', belly: true }), Tag('THE SON IS NOT EVEN BORN', 1420, 380, 46, { at: 0.3 }), Tag('NO WAITING', 1420, 560, 46, { at: 0.8 })]));")
s = sub(s, "Pr('unborn', 1320, 600, 320, { alpha: 0.7 }), Pr('cross', 1320, 600, 300, { at: 0.8 }),", "Pr('unborn', 1320, 600, 320, { alpha: 0.7, until: 3.0 }),")
s = sub(s, "Pr('crown', 1480, 560, 180, { at: 0.6 }), Pr('cross', 1180, 620, 220, { at: 1.0 })]));", "Pr('crown', 1480, 560, 180, { at: 0.6 }), Tag('NOT GOING TO WAIT', 1180, 300, 46, { at: 1.0 })]));")
# things on faces
s = sub(s, "S('a4_2', st('night', [{ k: 'earth', pos: [960, 940], s: 760 }, B('gaia', 960, 600, 300, { e: 'worry' }), B('ouranos', 1620, 300, 170, { e: 'angry', flip: true }),\n    ...[['titan', 0.05, 380], ['cyclops', 0.3, 960], ['cottus', 0.55, 1540]].map(([n, u, x]) => B(n, x, 300, 90, { free: true, at: u * 3, mv: { to: [960, 1010], u0: u, u1: u + 0.3 }, until: (u + 0.3) * 3.2 })),",
           "S('a4_2', st('night', [{ k: 'earth', pos: [960, 940], s: 760 }, ...[['titan', 0.05, 380, 520], ['cyclops', 0.3, 760, 960], ['cottus', 0.55, 1180, 1400]].map(([n, u, x, x2]) => B(n, x, 240, 90, { free: true, at: u * 3, mv: { to: [x2, 1010], u0: u, u1: u + 0.3 }, until: (u + 0.3) * 3.2 })), B('gaia', 960, 600, 300, { e: 'worry' }), B('ouranos', 1720, 220, 150, { e: 'angry', flip: true }),")
s = sub(s, "Pr('sickle', 600, 520, 170, { at: 0.75, mv: { to: [990, 560], u0: 0.72, u1: 0.92 }, spin: 8 })", "Pr('sickle', 700, 440, 170, { at: 2.0, mv: { to: [990, 560], u0: 0.72, u1: 0.92 }, spin: 8 })")
s = sub(s, "[[0.52, 0.2, 2.3], [0.56, 0.18, 2.5]], 'Vasari & Gherardi, Palazzo Vecchio, Florence (1550s)'", "[[0.60, 0.26, 1.9], [0.62, 0.25, 2.0]], 'Vasari & Gherardi, The Mutilation of Uranus by Saturn (Florence, 1550s)'")
s = sub(s, "st('parch', [B('titan', 420, 640, 280, { e: 'angry', tilt: 0.18, v: 0 }), B('titan', 1500, 640, 280, { e: 'angry', tilt: -0.18, flip: true, at: 0.1, v: 3 }), Pr('rope', 960, 800, 560, { at: 0.2 }),",
           "st('parch', [Pr('rope', 960, 840, 600, { at: 0.2 }), B('titan', 420, 580, 260, { e: 'angry', tilt: 0.18, v: 0 }), B('titan', 1500, 580, 260, { e: 'angry', tilt: -0.18, flip: true, at: 0.1, v: 3 }),")
s = sub(s, "Tag('\"A TERRIBLE THING\"', 960, 100, 46, { at: 0.3 })", "Tag('\"A FEARFUL DEED\"', 960, 100, 46, { at: 0.3 })")
s = sub(s, "Tag('Theogony 207–210 · \"SOMEONE WILL PAY\"', 960, 100, 40, { at: 0.3 })", "Tag('THEOGONY 207–210: \"VENGEANCE ... WOULD COME AFTERWARDS\"', 960, 100, 38, { at: 0.3 })")
s = sub(s, "S('b9_1', st('parch', [B('cronos', 960, 680, 400, { e: 'shout' }), ...kids.map((n, i) => B(n, 960, 650, 120, { at: 0.2 + i * 0.25, mv: { to: [300 + i * 330, 240], u0: 0.08 + i * 0.12, u1: 0.3 + i * 0.12, bend: -60 }, e: 'shock' }))],",
           "S('b9_1', st('parch', [Pr('stoneBare', 960, 610, 110, { mv: { to: [300, 330], u0: 0.03, u1: 0.25, bend: -80 } }), B('cronos', 960, 680, 400, { e: 'shout' }), ...kids.map((n, i) => B(n, 960, 610, 110, { at: (0.3 + 0.12 * i) * 2.2, mv: { to: [620 + i * 260, 240], u0: 0.3 + i * 0.12, u1: 0.5 + i * 0.12, bend: -60 }, e: 'shock' }))],")
s = sub(s, "Pr('jug', 1170, 470, 200, { rot: 2.55, at: 0.2, pour: true })", "Pr('jug', 1240, 470, 190, { rot: 2.3, at: 0.2, pour: true })")
s = sub(s, "Tag('SPEECH THE GODS UNDERSTAND', 1180, 640, 40, { at: 0.5 })", "Tag('SPEECH THE GODS UNDERSTAND', 960, 110, 44, { at: 0.5 })")
s = sub(s, "Ph('t', [[0.58, 0.2, 1.8], [0.58, 0.18, 2.0]])", "Ph('t', [[0.40, 0.22, 1.6], [0.40, 0.22, 1.8]])")
s = s.replace("...HH.map((n, i) => B(n, 480 + i * 480, 690, 260, { e: 'angry', at: 0.1 * i }))", "...HH.map((n, i) => B(n, 480 + i * 480, 690, 260, { e: 'shout', at: 0.1 * i }))")
s = s.replace("...HH.map((n, i) => B(n, 200 + i * 230, 700, 150, { e: 'angry', at: 0.05 * i }))", "...HH.map((n, i) => B(n, 200 + i * 230, 700, 150, { e: 'shout', at: 0.05 * i }))")
s = sub(s, "S('d2_3', st('section', [B('typhoeus', 960, 900, 260, { free: true, e: 'angry', mv: { to: [960, 780], u0: 0.1, u1: 0.5 } }), Tag('HIS FATHER: TARTARUS, THE PIT', 700, 450, 44, { at: 0.3 })]));",
           "S('d2_3', st('section', [B('typhoeus', 960, 900, 240, { free: true, e: 'angry', mv: { to: [960, 700], u0: 0.1, u1: 0.5 } }), Tag('HIS FATHER: TARTARUS, THE PIT', 520, 150, 44, { at: 0.3 })]));")
s = sub(s, "S('d5_1', st('storm', [B('typhoeus', 1100, 800, 440, { e: 'angry' }),", "S('d5_1', st('storm', [B('typhoeus', 1150, 700, 380, { e: 'angry' }),")
# low-severity fixes
s = sub(s, "st('parch', TREE('a3_4'), { cam: [960, 540, 1.02], cam2: [1250, 600, 1.25] })", "st('parch', TREE('a3_4'), { cam: [960, 540, 1.02], cam2: [1150, 560, 1.15] })")
s = sub(s, "B(n, x, 860, 90, { free: true, alpha: 0.75, e: 'worry' })", "B(n, x, 800, 90, { free: true, alpha: 0.5, e: 'worry' })")
s = sub(s, "'Gustave Moreau, Hesiod and the Muse (1891)'", "'Gustave Moreau imagines Hesiod as a young shepherd (1891)'")
s = sub(s, "Pr('babyZ', 560, 800, 140, { mv: { to: [1360, 800], u0: 0.35, u1: 0.8, bend: -120 } }), Tag('IN A CAVE ON A MOUNTAIN', 960, 100, 44, { at: 0.2 })], { crete: true }),",
           "Pr('babyZ', 560, 800, 140, { mv: { to: [1360, 800], u0: 0.35, u1: 0.8, bend: -120 } }), Tag('GAIA TAKES THE BABY', 960, 100, 44, { at: 0.2 })], { crete: true }),")
s = sub(s, "st('cave', [B('gaia', 1450, 650, 320, { e: 'smile', flip: true }), Pr('babyZ', 1250, 760, 150,", "st('cave', [Tag('IN A CAVE ON A MOUNTAIN', 960, 100, 44, { at: 0.2 }), B('gaia', 1450, 650, 320, { e: 'smile', flip: true }), Pr('babyZ', 1250, 760, 150,")
s = sub(s, "B('gaia', 1120, 260, 170, { e: 'smug', wink: [[0.2, true]] }), Tr([1050, 330], [1300, 470], { u0: 0.05, u1: 0.4 }),", "B('gaia', 1000, 190, 150, { e: 'smug', wink: [[0.2, true]] }), Tr([1080, 260], [1300, 470], { u0: 0.05, u1: 0.4 }),")
s = sub(s, "B('cyclops', 660, 780, 170, { e: 'smile', at: 0.1 })", "B('cyclops', 580, 800, 160, { e: 'smile', at: 0.1 })")
s = sub(s, "Pr('bolt', 640, 360, 220, { at: 0.2, mv: { to: [1500, 760], u0: 0.2, u1: 0.8 } }), Pr('bolt', 520, 460, 180, { at: 0.45, mv: { to: [1300, 820], u0: 0.4, u1: 0.9 } })",
           "Pr('bolt', 900, 300, 220, { at: 1.5, mv: { to: [1500, 760], u0: 0.5, u1: 0.85 } }), Pr('bolt', 1000, 380, 180, { at: 1.8, mv: { to: [1300, 820], u0: 0.55, u1: 0.95 } })")
s = sub(s, "st('section', [Pr('anvil', 420, 90, 150, { free: true, mv: { to: [420, 250], u0: 0.0, u1: 0.95 } }),", "st('section', [Pr('anvil', 420, 80, 150, { free: true, mv: { to: [420, 470], u0: 0.0, u1: 0.95 } }),")
s = sub(s, "Tag('DAYS TO REACH THE EARTH', 1250, 760, 44)], { sfx: [[0, 'whoosh', 0.8], [0.95, 'thud', 1]] }),", "Tag('DAYS TO REACH THE EARTH', 1250, 760, 44)], { earthY: 0.45, sfx: [[0, 'whoosh', 0.8], [0.95, 'thud', 1]] }),")
s = sub(s, "st('section', [Pr('anvil', 420, 260, 150, { mv: { to: [420, 850], u0: 0.0, u1: 0.95 } }),", "st('section', [Pr('anvil', 420, 470, 150, { mv: { to: [420, 850], u0: 0.0, u1: 0.95 } }),")
s = sub(s, "Tag('MORE DAYS TO TARTARUS', 1250, 760, 44)], { sfx:", "Tag('MORE DAYS TO TARTARUS', 1250, 760, 44)], { earthY: 0.45, sfx:")
s = sub(s, "Pr('gate', 960, 780, 300), B('cottus', 520, 760, 140, { e: 'neutral' }), B('briareos', 1400, 760, 140, { e: 'neutral', flip: true, at: 0.15 }), B('gyes', 960, 470, 120, { e: 'neutral', at: 0.3 }),",
           "Pr('gate', 960, 780, 300), B('cottus', 420, 760, 140, { e: 'neutral' }), B('briareos', 1480, 760, 140, { e: 'neutral', flip: true, at: 0.15 }), B('gyes', 1720, 760, 120, { e: 'neutral', flip: true, at: 0.3 }),")
s = sub(s, "st('storm', [Pr('throne', 960, 620, 520), B('typhoeus', 960, 640, 280, { e: 'grin' }), Pr('crown', 1250, 260, 140, { at: 0.4, in: 'drop' }),",
           "st('storm', [Pr('throne', 960, 560, 600), B('typhoeus', 960, 720, 240, { e: 'grin' }), Pr('crown', 1250, 200, 130, { at: 0.4, mv: { to: [960, 300], u0: 0.3, u1: 0.7 } }),")
s = sub(s, "B('hades', 520, 650, 220, { e: 'scared' }), Tag('HADES', 520, 450, 38, { at: 0.2 }), B('titan', 1150, 830, 150, { e: 'scared', flip: true, at: 0.3, v: 0 }), B('titan', 1450, 830, 150, { e: 'scared', flip: true, at: 0.4, v: 3 }), Tag('THE TITANS', 1300, 640, 38, { at: 0.5 })",
           "B('hades', 520, 650, 220, { e: 'scared' }), Tag('HADES', 520, 380, 38, { at: 0.2 }), B('titan', 1150, 900, 130, { e: 'scared', flip: true, at: 0.3, v: 0 }), B('titan', 1450, 900, 130, { e: 'scared', flip: true, at: 0.4, v: 3 }), Tag('THE TITANS', 1700, 780, 38, { at: 0.5 })")
s = sub(s, "S('d9_1', { bg: 'photo', items: [Ph('zt', [[0.5, 0.5, 1.0], [0.5, 0.5, 1.08]])]", "S('d9_1', { bg: 'photo', items: [Ph('zt', [[0.5, 0.5, 0.86], [0.5, 0.5, 1.0]])]")
s = sub(s, "Tag('1', 330, 120, 60, { at: 0 }), B('ouranos', 330, 560, 270, { e: 'angry' }), B('cottus', 330, 860, 100, { at: 0.3, e: 'worry' }), Pr('chain', 330, 900, 160, { at: 0.4 }),",
           "Tag('1', 330, 120, 60, { at: 0 }), B('ouranos', 330, 500, 240, { e: 'angry' }), B('cottus', 330, 780, 110, { at: 0.3, e: 'worry' }), Pr('chain', 330, 860, 140, { at: 0.4 }),")
s = sub(s, "Tag('2 · OVERTHROWN BY HIS', 960, 90, 46)", "Tag('2 · OVERTHROWN BY HIS SON', 960, 90, 46)")
s = sub(s, "B('metis', 760, 700, 150, { e: 'cry', alpha: 0.55, at: 0.3, belly: true }), Tag('SWALLOWED BEFORE ATHENA WAS BORN', 1380, 300, 40, { at: 0.5 })",
           "B('metis', 760, 840, 120, { e: 'cry', alpha: 0.5, at: 0.3, belly: true }), Tag('SWALLOWED BEFORE ATHENA WAS BORN', 1460, 300, 40, { at: 0.5 })")
s = sub(s, "Tag('\"A DECEPTION\"', 1320, 520, 46, { at: 0.3 })", "Tag('\"A DECEPTION\"', 1320, 520, 38, { at: 0.3 })")
s = sub(s, "Tag('\"...FROM HIS OWN HEAD\"', 1320, 520, 38, { at: 0.3 })", "Tag('\"...FROM HIS OWN HEAD\"', 1320, 520, 30, { at: 0.3 })")
s = sub(s, "[[0.45, 0.35, 1.25], [0.42, 0.3, 1.4]], 'Birth of Athena", "[[0.40, 0.40, 1.15], [0.40, 0.36, 1.25]], 'Birth of Athena")
# variety: break the repetitive runs
s = sub(s, "S('a8_1', st('nighthills', [B('ouranos', 960, 640, 440, { e: 'shout' })], { cam: [960, 540, 1], cam2: [960, 560, 1.12], fx: [{ t: 'dim', u0: 0, u1: 1, a: 0.15 }] }));",
           "S('a8_1', st('sky', [Pr('throne', 1350, 620, 460), B('cronos', 1350, 560, 260, { e: 'smug' }), B('ouranos', 520, 700, 320, { e: 'shout', tilt: -0.1 }), Tag('ONE LAST THING TO SAY', 520, 110, 44, { at: 0.3 })], { cam2: [960, 540, 1.05] }));")
s = sub(s, "S('e1_1', st('olympus', [B('zeus', 960, 650, 420, { e: 'smile' }), Tag('THE WAR IS OVER', 960, 100, 50, { at: 0.3 })], { cam2: [960, 540, 1.06] }));",
           "S('e1_1', mp([22.35, 39.85, 1.5], [Pin(...OLYMPUS), GT('MOUNT OLYMPUS', ...OLYMPUS, -85, 42), B('zeus', 1300, 700, 280, { e: 'smile' }), Tag('THE WAR IS OVER', 600, 760, 50, { at: 0.3 })], { cam2: [22.35, 39.85, 1.6] }));")
s = sub(s, "S('e2_2', st('olympus', [B('zeus', 860, 680, 300,", "S('e2_2', st('sky', [B('zeus', 860, 680, 300,")
s = sub(s, "S('c12_1', st('olympus', [Gl(960, 560, 700), ...HH.map((n, i) => B(n, 480 + i * 480, 700, 220, { e: 'grin', at: 0.1 * i })), Pr('chainBroken', 960, 300, 260, { at: 0.3 }), Tag('THE KEY TO VICTORY', 960, 100, 50, { at: 0.4 })]));",
           "S('c12_1', mp([22.3, 39.6, 1.25], [Pin(...OTHRYS), Pin(...OLYMPUS), GT('OTHRYS', ...OTHRYS, 80), GT('OLYMPUS', ...OLYMPUS, -80), Tr(OLYMPUS, OTHRYS, { sys: 'geo', col: '#4aa8ff', w: 16, solid: true, arrow: true, bend: 1.2, u0: 0.1, u1: 0.6 }), ...HH.map((n, i) => B(n, 1300 + i * 200, 780, 130, { e: 'grin', at: 0.2 + 0.1 * i })), Tag('THE KEY TO VICTORY', 960, 110, 50, { at: 0.4 })]));")
s = sub(s, "    st('olympus', [...HH.map((n, i) => B(n, 480 + i * 480, 700, 200, { e: 'smile' })), Pr('chainBroken', 960, 330, 280, { at: 0.1 }), Tag('FREED', 960, 100, 60, { at: 0.2 })], { fx: [{ t: 'flash', u: 0.15, dur: 0.2, a: 0.35 }], sfx: [[0.15, 'crash', 0.7]] }),",
           "    st('section', [...HH.map((n, i) => B(n, 600 + i * 360, 700, 130, { free: true, e: 'smile', mv: { to: [600 + i * 360, 300], u0: 0.15, u1: 0.8 } })), ...[600, 960, 1320].map(x => Pr('chainBroken', x, 820, 160, { at: 0.1 })), Tag('FREED', 960, 470, 60, { at: 0.2 })], { fx: [{ t: 'flash', u: 0.15, dur: 0.2, a: 0.35 }], sfx: [[0.15, 'crash', 0.7]] }),")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
