def sub(s, old, new):
    assert old in s, old[:80]
    return s.replace(old, new, 1)
p = 'engine.js'; e = open(p, encoding='utf-8').read()

# 1. clamp to the safe area (above the caption band, below the top edge)
e = sub(e, "  let pop = 1, alpha = 1, ox = 0, oy = 0; const x0 = tl - (it.at || 0), inn = it.in || 'pop';",
"""  if (!it.free && (it.k === 'bust' || it.k === 'prop' || it.k === 'text')) {
    const s0 = (it.s || 100) * zs, o = it.k === 'bust' ? (CHAR[it.c] || {}) : {};
    const top = it.k === 'bust' ? s0 * (o.monster ? 1.45 : (o.heads || o.hat || o.staff || o.wings ? 1.32 : 1.1)) : (it.k === 'text' ? s0 * 0.6 * String(it.t).split('\\n').length : s0 * 0.5);
    const bot = it.k === 'bust' ? s0 * 0.64 : (it.k === 'text' ? s0 * 0.6 : s0 * 0.5);
    const yMin = 28 * SX + top, yMax = 922 * SX - bot; if (yMin <= yMax) y = Math.min(Math.max(y, yMin), yMax);
  }
  let pop = 1, alpha = 1, ox = 0, oy = 0; const x0 = tl - (it.at || 0), inn = it.in || 'pop';""")

# 2. text: tag style + fit
e = sub(e, "  const fnt = st === 'label' || st === 'year' ? `italic 900 ${size}px \"Playfair Display SC\",Georgia,serif` : st === 'card' ? `italic 400 ${size}px \"Old Standard TT\",Georgia,serif` : `900 ${size}px \"Segoe UI Black\",\"Arial Black\",Arial,sans-serif`;\n  ctx.font = fnt; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = (st === 'label' ? size * 0.1 : 0) + 'px';",
"""  const fnt = st === 'label' || st === 'year' ? `italic 900 ${size}px "Playfair Display SC",Georgia,serif` : st === 'card' ? `italic 400 ${size}px "Old Standard TT",Georgia,serif` : st === 'tag' ? `700 ${size}px "Segoe UI",Arial,sans-serif` : `900 ${size}px "Segoe UI Black","Arial Black",Arial,sans-serif`;
  ctx.font = fnt; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = (st === 'label' ? size * 0.08 : 0) + 'px';
  if (it.fit) { const wmax = Math.max(...lines.map(l => ctx.measureText(l).width)), lim = it.fit * (r.s / (it.s || 100)); if (wmax > lim) { const k = lim / wmax; ctx.scale(k, k); } }
  if (st === 'tag') { const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + size * 1.0, h = size * 1.12 * lines.length + size * 0.5; ctx.fillStyle = it.bg || 'rgba(28,16,8,.82)'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, size * 0.35); ctx.fill(); ctx.strokeStyle = 'rgba(255,230,170,.55)'; ctx.lineWidth = Math.max(1, size * 0.05); ctx.stroke(); }""")
e = sub(e, "    else if (st === 'card') { ctx.fillStyle = it.col || '#f2e6c8'; ctx.fillText(ln, 0, yy); }",
"    else if (st === 'card') { ctx.fillStyle = it.col || '#f2e6c8'; ctx.fillText(ln, 0, yy); }\n    else if (st === 'tag') { ctx.fillStyle = it.col || '#fff'; ctx.fillText(ln, 0, yy + size * 0.04); }")

# 3. art frame, zone, better trails
e = sub(e, "  else if (it.k === 'photo') { drawPhoto(it, tl, dur); }",
"""  else if (it.k === 'photo') { drawPhoto(it, tl, dur); }
  else if (it.k === 'art') { const im = IMG[it.img]; if (!im || !im.complete) return; const k = r.s / (it.s || 100), w = (it.w || 900) * k, h = (it.h || 600) * k, u2 = sm(tl / dur), [a0, b0] = it.kb || [[0.5, 0.5, 1], [0.5, 0.5, 1.08]];
    const z = a0[2] + (b0[2] - a0[2]) * u2, fx = a0[0] + (b0[0] - a0[0]) * u2, fy = a0[1] + (b0[1] - a0[1]) * u2, base = Math.max(w / im.naturalWidth, h / im.naturalHeight) * z, dw = im.naturalWidth * base, dh = im.naturalHeight * base;
    ctx.save(); ctx.translate(r.x, r.y); ctx.scale(r.pop, r.pop); ctx.rotate(it.rot || 0); ctx.globalAlpha = r.alpha;
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(-w / 2 + 14 * SX, -h / 2 + 18 * SX, w, h);
    const fw = 16 * SX; ctx.fillStyle = '#b8892e'; ctx.fillRect(-w / 2 - fw, -h / 2 - fw, w + fw * 2, h + fw * 2); ctx.strokeStyle = '#5a3a10'; ctx.lineWidth = 3 * SX; ctx.strokeRect(-w / 2 - fw, -h / 2 - fw, w + fw * 2, h + fw * 2); ctx.strokeStyle = '#ffe2a0'; ctx.lineWidth = 2 * SX; ctx.strokeRect(-w / 2 - fw * 0.5, -h / 2 - fw * 0.5, w + fw, h + fw);
    ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); let ox2 = -fx * dw + w / 2, oy2 = -fy * dh + h / 2; ox2 = Math.min(-w / 2 + w / 2, Math.max(w / 2 - dw, ox2)) ; oy2 = Math.min(0, Math.max(h - dh, oy2)); ctx.drawImage(im, -w / 2 + ox2, -h / 2 + oy2, dw, dh); ctx.restore();
    if (it.cap) drawText({ t: it.cap, st: 'tag', s: 30 }, { x: r.x, y: r.y + h / 2 + 52 * SX * k, s: 30 * SX * k, pop: r.pop, alpha: r.alpha }); }
  else if (it.k === 'zone') { ctx.save(); ctx.globalAlpha = r.alpha * 0.85; ctx.beginPath(); ctx.arc(r.x, r.y, r.s * r.pop, 0, 7); ctx.fillStyle = it.col || 'rgba(201,98,58,.55)'; ctx.fill(); ctx.fillStyle = HATCH; ctx.fill(); ctx.strokeStyle = '#7a2e18'; ctx.lineWidth = 4 * SX; ctx.stroke(); ctx.restore(); }""")
e = sub(e, "    ctx.save(); ctx.strokeStyle = it.col || '#fffaf0'; ctx.lineWidth = 9 * SX; ctx.lineCap = 'round'; ctx.setLineDash([1, 22 * SX]);",
"    ctx.save(); ctx.strokeStyle = it.col || '#fffaf0'; ctx.lineWidth = (it.w || 9) * SX; ctx.lineCap = 'round'; if (!it.solid) ctx.setLineDash([1, 22 * SX]);")
e = sub(e, "i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();",
"""i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]);
    if (it.arrow && prog > 0.05) { const q = prog, aa = 1 - q, ex2 = aa * aa * a[0] + 2 * aa * q * mid[0] + q * q * b[0], ey2 = aa * aa * a[1] + 2 * aa * q * mid[1] + q * q * b[1], q2 = Math.max(0, q - 0.04), a2 = 1 - q2, px = a2 * a2 * a[0] + 2 * a2 * q2 * mid[0] + q2 * q2 * b[0], py = a2 * a2 * a[1] + 2 * a2 * q2 * mid[1] + q2 * q2 * b[1], ang = Math.atan2(ey2 - py, ex2 - px), L = (it.w || 9) * 3.2 * SX;
      ctx.fillStyle = it.col || '#fffaf0'; ctx.beginPath(); ctx.moveTo(ex2 + Math.cos(ang) * L * 0.6, ey2 + Math.sin(ang) * L * 0.6); ctx.lineTo(ex2 + Math.cos(ang + 2.5) * L, ey2 + Math.sin(ang + 2.5) * L); ctx.lineTo(ex2 + Math.cos(ang - 2.5) * L, ey2 + Math.sin(ang - 2.5) * L); ctx.closePath(); ctx.fill(); }
    ctx.restore();""")

# 4. new stage backgrounds
e = sub(e, "  else if (type === 'dark') { ctx.fillStyle = '#0b0805'; ctx.fillRect(0, 0, W, H); }",
"""  else if (type === 'dark') { ctx.fillStyle = '#0b0805'; ctx.fillRect(0, 0, W, H); }
  else if (type === 'olympus') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8cc8f0'); g.addColorStop(1, '#f6eed6'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); const px = -v.cx * 0.08 * SX;
    for (const [x, y, s, sh] of [[200, 1080, 520, '#a9b4c4'], [760, 1080, 760, '#b9c2d0'], [1450, 1080, 560, '#a9b4c4'], [1880, 1080, 420, '#b0bacb']]) { ctx.save(); ctx.translate(px * 0.5, 0); ctx.fillStyle = sh; ctx.beginPath(); ctx.moveTo((x - s) * SX, y * SX); ctx.lineTo(x * SX, (y - s * 0.95) * SX); ctx.lineTo((x + s) * SX, y * SX); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f4f7fb'; ctx.beginPath(); ctx.moveTo((x - s * 0.22) * SX, (y - s * 0.74) * SX); ctx.lineTo(x * SX, (y - s * 0.95) * SX); ctx.lineTo((x + s * 0.22) * SX, (y - s * 0.74) * SX); ctx.lineTo((x + s * 0.08) * SX, (y - s * 0.7) * SX); ctx.lineTo((x - s * 0.06) * SX, (y - s * 0.76) * SX); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.globalAlpha = 0.9; for (const [x, y, s] of [[300, 260, 140], [1500, 200, 170], [980, 120, 110]]) { ctx.save(); ctx.translate((x + Math.sin(t * 0.2 + x) * 20) * SX + px, y * SX); ctx.scale(s * SX, s * SX); ctx.lineWidth = 0.05; ctx.strokeStyle = 'rgba(255,255,255,0)'; ctx.fillStyle = '#fff'; for (const [a, b, rr] of [[-0.45, 0.1, 0.3], [-0.1, -0.1, 0.4], [0.3, 0.0, 0.34], [0.55, 0.15, 0.25], [0.05, 0.18, 0.3]]) { ctx.beginPath(); ctx.arc(a, b, rr, 0, 7); ctx.fill(); } ctx.restore(); } ctx.globalAlpha = 1; }
  else if (type === 'cave') { ctx.fillStyle = '#1e120c'; ctx.fillRect(0, 0, W, H); const g = ctx.createRadialGradient(W / 2, H * 0.42, 50 * SX, W / 2, H * 0.42, 620 * SX); g.addColorStop(0, '#7a5232'); g.addColorStop(1, '#2a1a10'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(160 * SX, H); for (let i = 0; i <= 20; i++) { const a = Math.PI * (1 - i / 20), r = 800 + 40 * Math.sin(i * 2.7); ctx.lineTo(W / 2 + Math.cos(a) * r * SX, H * 0.98 - Math.sin(a) * r * 0.95 * SX); } ctx.lineTo(W - 160 * SX, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#140c08'; for (let i = 0; i < 9; i++) { const x = (220 + i * 190) * SX, L = (60 + (i * 53) % 110) * SX; ctx.beginPath(); ctx.moveTo(x - 30 * SX, 0); ctx.lineTo(x, L + 120 * SX); ctx.lineTo(x + 30 * SX, 0); ctx.fill(); } ctx.fillStyle = 'rgba(255,200,120,.08)'; ctx.fillRect(0, H * 0.8, W, H * 0.2); }
  else if (type === 'section') { const L = [[0, 0.24, '#9fd0f0', '#cfe8f6'], [0.24, 0.40, '#7aa84e', '#8a6a3e'], [0.40, 0.80, '#4a2e1e', '#2a1410'], [0.80, 1, '#3a0e0a', '#6a1a0e']]; for (const [a, b, c1, c2] of L) { const g = ctx.createLinearGradient(0, a * H, 0, b * H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, a * H, W, (b - a) * H); }
    ctx.fillStyle = '#5f9a3e'; ctx.fillRect(0, 0.24 * H, W, 10 * SX); ctx.fillStyle = 'rgba(255,150,60,.5)'; for (const [x, y, r, ph] of EMBERS) { const yy = 0.82 + ((y - t * 0.03 * r * 0.2) % 1 + 1) % 1 * 0.18; ctx.beginPath(); ctx.arc(x * SX, yy * H, r * 0.6 * SX, 0, 7); ctx.fill(); }
    if (!sh.noLayerTags) { ctx.save(); ctx.font = `700 ${30 * SX}px "Segoe UI",Arial`; ctx.textBaseline = 'middle'; for (const [txt, y] of [['SKY', 0.07], ['EARTH', 0.32], ['TARTARUS', 0.86]]) { const w = ctx.measureText(txt).width + 30 * SX; ctx.fillStyle = 'rgba(28,16,8,.75)'; ctx.beginPath(); ctx.roundRect(W - w - 40 * SX, y * H - 22 * SX, w, 44 * SX, 12 * SX); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(txt, W - w - 25 * SX, y * H); } ctx.restore(); } }
  else if (type === 'battle') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a2233'); g.addColorStop(1, '#4a4a5a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#2a2e3a'; for (const [x, s] of [[230, 520], [1690, 560]]) { ctx.beginPath(); ctx.moveTo((x - s) * SX, H); ctx.lineTo(x * SX, (1080 - s * 0.9) * SX); ctx.lineTo((x + s) * SX, H); ctx.fill(); } ctx.strokeStyle = 'rgba(190,210,235,.25)'; ctx.lineWidth = 2; for (let i = 0; i < 60; i++) { const x = (i * 97 + t * 500) % (W + 200) - 100, y = ((i * 53 + t * 900) % (H + 100)) - 50; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y + 46); ctx.stroke(); } }
  else if (type === 'nighthills') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#080c2a'); g.addColorStop(1, '#2a2e66'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; for (const [x, y, r, ph] of STARS) { if (y > 700) continue; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.6 + ph); ctx.beginPath(); ctx.arc(x * SX, y * SX * 0.8, r * SX, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; ctx.fillStyle = '#141a3a'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= 1920; x += 40) ctx.lineTo(x * SX, (900 - 60 * Math.sin(x / 300) - 30 * Math.sin(x / 97)) * SX); ctx.lineTo(W, H); ctx.fill(); }""")
open(p, 'w', encoding='utf-8').write(e)

# list of images
p = 'index.html'; h = open(p, encoding='utf-8').read()
h = sub(h, "window.IMAGES=[['zt','img/zt.jpg'],['t','img/t.jpg']];", "window.IMAGES=[['zt','img/zt.jpg'],['t','img/t.jpg'],['vasari','img/vasari.jpg'],['rhea','img/rhea_relief.jpg'],['titans','img/titans.jpg'],['moreau','img/moreau.jpg'],['athena','img/athena_f32.jpg']];")
open(p, 'w', encoding='utf-8').write(h)
print('ok')
