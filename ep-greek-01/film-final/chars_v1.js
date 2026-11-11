// Sticker library: half-body busts and props, drawn in code. Unit = head diameter (bust) / 1 (prop). Uses global ctx, OL.
const OL = '#33200f';
const CHAR = {
  gaia:   { skin: '#f0bd98', robe: '#4f9a4a', trim: '#f4e6b0', hair: '#2e1a10', style: 'long', wreath: '#86c552' },
  cronos: { skin: '#dba27a', robe: '#8e3f56', trim: '#f0cf7a', hair: '#b0aaa0', style: 'cap', beard: '#b0aaa0', brow: '#8e8a80' },
  rhea:   { skin: '#f0bd98', robe: '#3f6fa8', trim: '#f4e6b0', hair: '#7a4a28', style: 'veil', veil: '#e6d8b8' },
  ouranos:{ skin: '#8fa4d8', robe: '#23306a', trim: '#f0cf7a', hair: '#e8ecf8', style: 'long', beard: '#e8ecf8', brow: '#c9d2ee', stars: true },
  zeus:   { skin: '#e2ae82', robe: '#f2ead6', trim: '#7a4aa8', hair: '#6b5238', style: 'cap', beard: '#6b5238', brow: '#4a3822', wreath: '#e6c25a' },
  metis:  { skin: '#f0bd98', robe: '#6b4aa8', trim: '#f4e6b0', hair: '#3a2150', style: 'long', wreath: '#e6c25a' },
  hestia: { skin: '#f0bd98', robe: '#d9743a', trim: '#f4e6b0', hair: '#7a3a1c', style: 'veil', veil: '#f2d9b0' },
  demeter:{ skin: '#f0bd98', robe: '#d9b13a', trim: '#f4e6b0', hair: '#b07a2c', style: 'long', wreath: '#e6c25a' },
  hera:   { skin: '#f0bd98', robe: '#6b3a8e', trim: '#f0cf7a', hair: '#2e1a10', style: 'long', crown: true },
  hades:  { skin: '#cfc0c8', robe: '#2c2630', trim: '#8e8a98', hair: '#14101a', style: 'cap', beard: '#14101a', brow: '#14101a' },
  poseidon:{ skin: '#d9a07a', robe: '#2e8aa0', trim: '#e8f4f6', hair: '#2a4a5a', style: 'cap', beard: '#2a4a5a', brow: '#1c3440' },
  cottus: { skin: '#9fb08a', robe: '#8a5a3a', trim: '#d9c28a', hair: '#2a2018', style: 'wild', brow: '#2a2018', hands: 8 },
  cyclops:{ skin: '#c9a07a', robe: '#7a5a3a', trim: '#d9c28a', hair: '#1c1410', style: 'wild', brow: '#1c1410', cyc: true },
  titan:  { skin: '#c98a62', robe: '#6a5a4a', trim: '#b0a080', hair: '#2a1a10', style: 'wild', beard: '#2a1a10', brow: '#2a1a10' },
  typhoeus:{ skin: '#7fa080', robe: '#4a3a5a', trim: '#8a2a2a', hair: '#243028', style: 'bald', brow: '#142018', snakes: 9 },
  typhonW:{ skin: '#c9a078', robe: '#3a2a3a', trim: '#8a2a2a', hair: '#243028', style: 'long', brow: '#142018', wings: true },
  shadow: { skin: '#3a3330', robe: '#3a3330', trim: '#4a4340', hair: '#3a3330', style: 'long' },
  pausanias:{ skin: '#dba27a', robe: '#8a7a5a', trim: '#e8dcb8', hair: '#5a4630', style: 'cap', beard: '#5a4630', brow: '#3a2c1c', hat: true },
  hesiod: { skin: '#dba27a', robe: '#7a5a3a', trim: '#e8dcb8', hair: '#8a8478', style: 'cap', beard: '#8a8478', brow: '#6a665c', wreath: '#7a9a3c' },
};
const ell = (x, y, rx, ry, fill, stroke = true, lw = 0.03) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = OL; ctx.stroke(); } };
function eyeAt(x, y, o, ex, lk, sg, blink, wink, t) {
  if (ex === 'swallow' || ex === 'sleep' || blink || wink) { ctx.strokeStyle = OL; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.arc(x, y + 0.02, 0.08, Math.PI * 1.1, Math.PI * 1.9, ex !== 'swallow' && ex !== 'sleep' ? true : (ex === 'sleep')); ctx.stroke(); return; }
  if (ex === 'dazed') { ctx.strokeStyle = OL; ctx.lineWidth = 0.04; ctx.beginPath(); ctx.moveTo(x - 0.07, y - 0.07); ctx.lineTo(x + 0.07, y + 0.07); ctx.moveTo(x + 0.07, y - 0.07); ctx.lineTo(x - 0.07, y + 0.07); ctx.stroke(); return; }
  const big = ex === 'shock' ? 1.25 : (ex === 'scared' ? 1.3 : 1);
  ell(x, y, 0.115 * big, 0.14 * big, '#fff', true, 0.025);
  ctx.fillStyle = '#1b0f0a'; const pr = (ex === 'scared' ? 0.045 : 0.065) * big; ctx.beginPath(); ctx.arc(x + lk * 0.04, y + 0.01, pr, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + lk * 0.04 + 0.02, y - 0.03, 0.02, 0, 7); ctx.fill();
  if (ex === 'smug') { ctx.fillStyle = o.skin; ctx.beginPath(); ctx.ellipse(x, y - 0.05, 0.125, 0.1, 0, Math.PI, 0); ctx.fill(); ctx.lineWidth = 0.03; ctx.strokeStyle = OL; ctx.beginPath(); ctx.moveTo(x - 0.12, y); ctx.lineTo(x + 0.12, y); ctx.stroke(); }
}
function bust(c) {
  const o = CHAR[c.kind], t = c.t || 0, s = c.s || 170, ex = c.expr || 'neutral', pp = c.pop ?? 1; if (!o || pp <= 0.001) return;
  const bob = Math.sin(t * 2.6 + (c.ph || 0)) * 0.025, flip = c.flip ? -1 : 1, sq = c.squash || 0;
  ctx.save(); ctx.translate(c.x, c.y + bob * s); ctx.rotate((c.tilt || 0) + Math.sin(t * 1.7 + (c.ph || 0)) * 0.025); ctx.scale(s * pp * flip * (1 + sq), s * pp * (1 - sq));
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.globalAlpha *= (c.alpha ?? 1);
  const OLW = 0.035, skin = c.skin || o.skin;
  // drop shadow
  ctx.save(); ctx.translate(0.07, 0.09); ctx.fillStyle = 'rgba(50,30,10,.28)'; ctx.beginPath(); ctx.ellipse(0, -0.55, 0.52, 0.52, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-0.66, 0.62); ctx.quadraticCurveTo(-0.7, 0.1, -0.3, 0.0); ctx.lineTo(0.3, 0); ctx.quadraticCurveTo(0.7, 0.1, 0.66, 0.62); ctx.fill(); ctx.restore();
  // behind: wings, snakes, arms, long hair
  if (o.wings) for (const sg of [-1, 1]) { ctx.save(); ctx.scale(sg, 1); ctx.fillStyle = '#7c2a1c'; ctx.beginPath(); ctx.moveTo(0.3, -0.2); ctx.bezierCurveTo(0.9, -1.1, 1.6, -1.0, 1.7, -0.3); ctx.bezierCurveTo(1.5, -0.4, 1.4, -0.2, 1.3, 0.0); ctx.bezierCurveTo(1.2, -0.15, 1.1, 0.0, 1.0, 0.15); ctx.bezierCurveTo(0.8, 0.05, 0.6, 0.2, 0.4, 0.3); ctx.closePath(); ctx.fill(); ctx.lineWidth = OLW; ctx.strokeStyle = OL; ctx.stroke(); ctx.strokeStyle = 'rgba(40,10,6,.5)'; ctx.lineWidth = 0.02; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0.5 + i * 0.2, -0.1 + i * 0.05); ctx.lineTo(0.9 + i * 0.2, -0.7 + i * 0.1); ctx.stroke(); } ctx.restore(); }
  if (o.snakes) for (let i = 0; i < o.snakes; i++) { const a = Math.PI * (1.08 + i * (0.84 / (o.snakes - 1))), L = 0.55 + 0.25 * Math.sin(i * 2.1 + 1), w = Math.sin(t * 3 + i * 1.3) * 0.12; const bx = Math.cos(a) * 0.35, by = -0.55 + Math.sin(a) * 0.35, ex2 = Math.cos(a) * (0.35 + L) + w, ey2 = -0.55 + Math.sin(a) * (0.35 + L);
    ctx.strokeStyle = OL; ctx.lineWidth = 0.17; ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo((bx + ex2) / 2 + w * 1.4, (by + ey2) / 2, ex2, ey2); ctx.stroke(); ctx.strokeStyle = i % 2 ? '#5f8a5a' : '#79a56a'; ctx.lineWidth = 0.12; ctx.stroke();
    ell(ex2, ey2, 0.11, 0.09, i % 2 ? '#5f8a5a' : '#79a56a', true, 0.03); ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.arc(ex2 - 0.03, ey2 - 0.02, 0.025, 0, 7); ctx.arc(ex2 + 0.04, ey2 - 0.02, 0.025, 0, 7); ctx.fill(); ctx.strokeStyle = '#c8281e'; ctx.lineWidth = 0.02; ctx.beginPath(); ctx.moveTo(ex2, ey2 + 0.08); ctx.lineTo(ex2 + 0.02, ey2 + 0.16); ctx.stroke(); }
  if (o.hands) for (let i = 0; i < o.hands; i++) { const a = Math.PI * (0.98 + i * (1.04 / (o.hands - 1))) , wv = Math.sin(t * 4 + i) * 0.1, R = 0.75 + (i % 2) * 0.18, x1 = Math.cos(a) * R + wv, y1 = 0.15 + Math.sin(a) * R * 0.95; ctx.strokeStyle = OL; ctx.lineWidth = 0.17; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 0.45, 0.2 + Math.sin(a) * 0.3); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = skin; ctx.lineWidth = 0.11; ctx.stroke(); ell(x1, y1, 0.1, 0.1, skin, true, 0.03); }
  if (o.style === 'long') { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.moveTo(-0.5, -0.7); ctx.bezierCurveTo(-0.7, -0.2, -0.62, 0.3, -0.52, 0.6); ctx.lineTo(0.52, 0.6); ctx.bezierCurveTo(0.62, 0.3, 0.7, -0.2, 0.5, -0.7); ctx.closePath(); ctx.fill(); ctx.lineWidth = 0.03; ctx.strokeStyle = OL; ctx.stroke(); }
  // body
  ctx.fillStyle = o.robe; ctx.beginPath(); ctx.moveTo(-0.66, 0.62); ctx.quadraticCurveTo(-0.72, 0.12, -0.3, 0.0); ctx.lineTo(0.3, 0.0); ctx.quadraticCurveTo(0.72, 0.12, 0.66, 0.62); ctx.closePath(); ctx.fill(); ctx.lineWidth = OLW; ctx.strokeStyle = OL; ctx.stroke();
  if (o.stars) { ctx.save(); ctx.clip(); ctx.fillStyle = '#ffe9a0'; for (const [x, y, r] of [[-0.45, 0.35, 0.04], [-0.2, 0.2, 0.03], [0.1, 0.4, 0.045], [0.4, 0.25, 0.035], [0.5, 0.5, 0.03], [-0.1, 0.52, 0.03], [-0.55, 0.55, 0.03]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } ctx.restore(); }
  ctx.strokeStyle = o.trim; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(-0.3, 0.02); ctx.quadraticCurveTo(0, 0.2, 0.3, 0.02); ctx.stroke();
  ctx.fillStyle = skin; ctx.fillRect(-0.09, -0.12, 0.18, 0.2); ctx.lineWidth = 0.03; ctx.strokeStyle = OL; ctx.strokeRect(-0.09, -0.12, 0.18, 0.2);
  // head
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -0.55, 0.5, 0, 7); ctx.fill(); ctx.lineWidth = OLW; ctx.strokeStyle = OL; ctx.stroke();
  ell(-0.5, -0.5, 0.07, 0.1, skin); ell(0.5, -0.5, 0.07, 0.1, skin); ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, -0.55, 0.49, 0, 7); ctx.fill();
  const hairCap = () => { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.arc(0, -0.55, 0.515, Math.PI * 1.03, Math.PI * 1.97); ctx.quadraticCurveTo(0.3, -0.78, 0.0, -0.76); ctx.quadraticCurveTo(-0.35, -0.8, -0.5, -0.4); ctx.closePath(); ctx.fill(); ctx.lineWidth = 0.03; ctx.strokeStyle = OL; ctx.stroke(); };
  if (o.style === 'veil') { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.arc(0, -0.55, 0.5, Math.PI * 1.1, Math.PI * 1.9); ctx.quadraticCurveTo(0.15, -0.72, -0.2, -0.64); ctx.quadraticCurveTo(-0.4, -0.6, -0.48, -0.42); ctx.closePath(); ctx.fill();
    ctx.fillStyle = o.veil; ctx.beginPath(); ctx.arc(0, -0.55, 0.62, Math.PI * 0.96, Math.PI * 2.04); ctx.lineTo(0.68, 0.24); ctx.lineTo(0.5, 0.2); ctx.lineTo(0.5, -0.5); ctx.arc(0, -0.55, 0.5, 0, Math.PI, true); ctx.lineTo(-0.5, 0.2); ctx.lineTo(-0.68, 0.24); ctx.closePath(); ctx.fill(); ctx.lineWidth = 0.03; ctx.strokeStyle = OL; ctx.stroke(); }
  else if (o.style === 'wild') { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.moveTo(-0.55, -0.35); for (let i = 0; i <= 9; i++) { const a = Math.PI * (1.0 + i * 0.1), r = i % 2 ? 0.66 : 0.52; ctx.lineTo(Math.cos(a) * r, -0.55 + Math.sin(a) * r); } ctx.lineTo(0.55, -0.35); ctx.quadraticCurveTo(0.2, -0.75, -0.2, -0.7); ctx.quadraticCurveTo(-0.45, -0.62, -0.55, -0.35); ctx.closePath(); ctx.fill(); ctx.lineWidth = 0.03; ctx.strokeStyle = OL; ctx.stroke(); }
  else if (o.style !== 'long' && o.style !== 'bald') hairCap();
  else if (o.style === 'long') { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.arc(0, -0.55, 0.515, Math.PI * 1.03, Math.PI * 1.97); ctx.quadraticCurveTo(0.3, -0.78, 0.0, -0.76); ctx.quadraticCurveTo(-0.35, -0.8, -0.5, -0.4); ctx.closePath(); ctx.fill(); ctx.lineWidth = 0.03; ctx.strokeStyle = OL; ctx.stroke(); }
  if (o.wreath) for (let i = 0; i < 10; i++) { const a = Math.PI * (1.12 + i * 0.076); ctx.fillStyle = i % 2 ? shade(o.wreath, -25) : o.wreath; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 0.52, -0.55 + Math.sin(a) * 0.52, 0.08, 0.045, a + Math.PI / 2, 0, 7); ctx.fill(); ctx.lineWidth = 0.02; ctx.strokeStyle = OL; ctx.stroke(); }
  if (o.crown) { ctx.fillStyle = '#f0c63a'; ctx.beginPath(); ctx.moveTo(-0.32, -0.95); ctx.lineTo(-0.34, -1.2); ctx.lineTo(-0.16, -1.05); ctx.lineTo(0, -1.26); ctx.lineTo(0.16, -1.05); ctx.lineTo(0.34, -1.2); ctx.lineTo(0.32, -0.95); ctx.closePath(); ctx.fill(); ctx.lineWidth = 0.035; ctx.strokeStyle = OL; ctx.stroke(); }
  // eyes + face
  const lk = c.look ?? 0.3, blink = (t % 3.4) < 0.12, wink = !!c.wink;
  if (o.cyc) { eyeAt(0, -0.52, o, ex, lk, 0, blink, false, t); }
  else for (const sg of [-1, 1]) eyeAt(sg * 0.2, -0.52, o, ex, lk, sg, blink, wink && sg === 1, t);
  // brows
  const bc = o.brow || (o.hair === '#7a4a28' ? '#5a3418' : o.hair);
  for (const sg of [-1, 1]) { const x = sg * 0.2, up = ex === 'shock' || ex === 'scared' ? -0.06 : (ex === 'smug' && sg === 1 ? -0.05 : 0), by = -0.52 - 0.2 + up, inner = ex === 'worry' || ex === 'cry' || ex === 'scared' ? -0.06 : (ex === 'angry' ? 0.07 : 0);
    if (o.cyc && sg === 1) continue; ctx.strokeStyle = bc; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(x - 0.1, by + (sg === 1 ? inner : 0)); ctx.lineTo(x + 0.1, by + (sg === -1 ? inner : 0)); ctx.stroke(); }
  ctx.fillStyle = 'rgba(230,110,100,.35)'; ell(-0.3, -0.35, 0.07, 0.045, ctx.fillStyle, false); ell(0.3, -0.35, 0.07, 0.045, ctx.fillStyle, false);
  ctx.fillStyle = 'rgba(120,70,40,.5)'; ctx.beginPath(); ctx.ellipse(0.0, -0.42, 0.03, 0.045, 0, 0, 7); ctx.fill();
  if (o.beard) { ctx.fillStyle = o.beard; ctx.beginPath(); ctx.moveTo(-0.44, -0.36); ctx.bezierCurveTo(-0.5, 0.05, 0.5, 0.05, 0.44, -0.36); ctx.quadraticCurveTo(0.2, -0.26, 0, -0.27); ctx.quadraticCurveTo(-0.2, -0.26, -0.44, -0.36); ctx.fill(); ctx.lineWidth = 0.03; ctx.strokeStyle = OL; ctx.stroke(); }
  // mouth
  const my = o.beard ? -0.17 : -0.22; ctx.strokeStyle = OL; ctx.lineWidth = 0.035;
  if (ex === 'swallow' || ex === 'shock' || ex === 'scared' || ex === 'shout') { const big = ex === 'swallow' || ex === 'shout'; ell(0, my + 0.03, big ? 0.15 : 0.07, big ? 0.13 : 0.1, '#4a1510', true, 0.03); if (big) ell(0, my + 0.09, 0.09, 0.045, '#d4685a', false); }
  else if (ex === 'worry' || ex === 'cry' || ex === 'dazed') { ctx.beginPath(); ctx.arc(0, my + 0.1, 0.09, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  else if (ex === 'angry') { ctx.beginPath(); ctx.arc(0, my + 0.1, 0.1, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
  else if (ex === 'grin') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, my - 0.06, 0.16, Math.PI * 0.12, Math.PI * 0.88); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else if (ex === 'smile' || ex === 'smug') { ctx.beginPath(); ctx.arc(ex === 'smug' ? 0.04 : 0, my - 0.06, 0.14, Math.PI * 0.18, Math.PI * 0.82); ctx.stroke(); }
  else if (ex === 'sleep') { ctx.beginPath(); ctx.arc(0, my + 0.02, 0.04, 0, 7); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-0.07, my + 0.02); ctx.lineTo(0.07, my + 0.02); ctx.stroke(); }
  if (ex === 'cry') { ctx.fillStyle = '#7ec8f0'; for (const sg of [-1, 1]) { const ty = ((t * 1.4 + (sg > 0 ? 0.5 : 0)) % 1); ctx.beginPath(); ctx.ellipse(sg * 0.26, -0.4 + ty * 0.35, 0.03, 0.05, 0, 0, 7); ctx.fill(); } }
  if (ex === 'scared') { ctx.fillStyle = '#7ec8f0'; ctx.beginPath(); ctx.ellipse(0.42, -0.85, 0.04, 0.07, 0.3, 0, 7); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 0.02; ctx.stroke(); }
  if (o.hat) { ctx.fillStyle = '#6a5a3a'; ctx.beginPath(); ctx.ellipse(0, -0.86, 0.74, 0.14, 0, 0, 7); ctx.fill(); ctx.lineWidth = 0.035; ctx.strokeStyle = OL; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-0.38, -0.88); ctx.quadraticCurveTo(-0.34, -1.3, 0, -1.3); ctx.quadraticCurveTo(0.34, -1.3, 0.38, -0.88); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#d9c28a'; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(-0.37, -0.95); ctx.quadraticCurveTo(0, -0.88, 0.37, -0.95); ctx.stroke(); }
  ctx.restore();
}
function shade(hex, d) { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, v + d)); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); }

// ---------------------------------------------------------------- props (origin = centre, ~1 unit wide)
function prop(c) {
  const k = c.n, t = c.t || 0, s = c.s || 100, pp = c.pop ?? 1; if (pp <= 0.001) return;
  ctx.save(); ctx.translate(c.x, c.y + (c.bob ? Math.sin(t * 2.4 + (c.ph || 0)) * 0.04 * s : 0)); ctx.rotate(c.rot || 0); ctx.scale(s * pp * (c.flip ? -1 : 1), s * pp); ctx.globalAlpha *= (c.alpha ?? 1);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 0.05; ctx.strokeStyle = OL;
  c._k = s * pp; const PR = PROPS[k]; if (PR) PR(c, t); ctx.restore();
}
const PROPS = {
  stone: (c) => bundleDraw('stone'), baby: (c) => bundleDraw('baby'),
  sickle: () => { ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.roundRect(-0.05, 0.0, 0.1, 0.55, 0.04); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#9aa0a6'; ctx.beginPath(); ctx.moveTo(0.0, 0.02); ctx.bezierCurveTo(-0.5, -0.05, -0.55, -0.55, -0.1, -0.7); ctx.bezierCurveTo(-0.4, -0.45, -0.3, -0.2, 0.05, -0.12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.03; ctx.beginPath(); ctx.moveTo(-0.12, -0.5); ctx.quadraticCurveTo(-0.3, -0.35, -0.2, -0.2); ctx.stroke(); },
  bolt: (c, t) => { const g = 0.6 + 0.4 * Math.sin(t * 12); ctx.shadowColor = `rgba(255,230,90,${0.7 * g})`; ctx.shadowBlur = 30; ctx.fillStyle = '#ffd92e'; ctx.beginPath(); ctx.moveTo(0.1, -0.7); ctx.lineTo(-0.32, 0.05); ctx.lineTo(-0.04, 0.05); ctx.lineTo(-0.16, 0.7); ctx.lineTo(0.34, -0.12); ctx.lineTo(0.04, -0.12); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke(); ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.moveTo(0.06, -0.5); ctx.lineTo(-0.12, -0.06); ctx.lineTo(0.0, -0.06); ctx.closePath(); ctx.fill(); },
  anvil: () => { ctx.fillStyle = '#5c636b'; ctx.beginPath(); ctx.moveTo(-0.6, -0.3); ctx.lineTo(0.5, -0.3); ctx.quadraticCurveTo(0.8, -0.28, 0.82, -0.12); ctx.lineTo(0.3, -0.1); ctx.lineTo(0.2, 0.1); ctx.lineTo(0.38, 0.4); ctx.lineTo(-0.38, 0.4); ctx.lineTo(-0.2, 0.1); ctx.lineTo(-0.3, -0.1); ctx.lineTo(-0.6, -0.12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-0.5, -0.27, 0.9, 0.05); },
  gate: () => { ctx.fillStyle = '#b5793a'; ctx.beginPath(); ctx.moveTo(-0.7, 0.6); ctx.lineTo(-0.7, -0.1); ctx.quadraticCurveTo(-0.7, -0.75, 0, -0.75); ctx.quadraticCurveTo(0.7, -0.75, 0.7, -0.1); ctx.lineTo(0.7, 0.6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#6a3f18'; ctx.lineWidth = 0.06; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 0.25, 0.6); ctx.lineTo(i * 0.25, -0.62 + Math.abs(i) * 0.1); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-0.7, 0.1); ctx.lineTo(0.7, 0.1); ctx.stroke(); ctx.fillStyle = '#e6c25a'; ctx.beginPath(); ctx.arc(-0.1, 0.1, 0.07, 0, 7); ctx.arc(0.1, 0.1, 0.07, 0, 7); ctx.fill(); },
  chain: () => { for (let i = -2; i <= 2; i++) { ctx.strokeStyle = OL; ctx.lineWidth = 0.1; ctx.beginPath(); ctx.ellipse(i * 0.3, 0, 0.2, i % 2 ? 0.09 : 0.14, 0, 0, 7); ctx.stroke(); ctx.strokeStyle = '#a9b0b8'; ctx.lineWidth = 0.055; ctx.stroke(); } },
  throne: (c) => { ctx.fillStyle = '#d9b13a'; ctx.beginPath(); ctx.roundRect(-0.38, -0.75, 0.76, 0.85, 0.12); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#8e3f56'; ctx.beginPath(); ctx.roundRect(-0.27, -0.62, 0.54, 0.6, 0.08); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d9b13a'; ctx.beginPath(); ctx.roundRect(-0.5, 0.0, 1.0, 0.2, 0.06); ctx.fill(); ctx.stroke(); ctx.fillRect(-0.45, 0.2, 0.12, 0.45); ctx.fillRect(0.33, 0.2, 0.12, 0.45); ctx.strokeRect(-0.45, 0.2, 0.12, 0.45); ctx.strokeRect(0.33, 0.2, 0.12, 0.45);
    if (c.crack) { ctx.strokeStyle = '#2a170c'; ctx.lineWidth = 0.07; ctx.beginPath(); ctx.moveTo(0.0, -0.75); ctx.lineTo(-0.1, -0.5); ctx.lineTo(0.08, -0.35); ctx.lineTo(-0.06, -0.1); ctx.lineTo(0.1, 0.1); ctx.stroke(); } },
  crown: () => { ctx.fillStyle = '#f0c63a'; ctx.beginPath(); ctx.moveTo(-0.5, 0.3); ctx.lineTo(-0.55, -0.35); ctx.lineTo(-0.25, -0.05); ctx.lineTo(0, -0.5); ctx.lineTo(0.25, -0.05); ctx.lineTo(0.55, -0.35); ctx.lineTo(0.5, 0.3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d6322e'; ctx.beginPath(); ctx.arc(0, 0.1, 0.07, 0, 7); ctx.fill(); },
  scroll: (c) => { ctx.fillStyle = '#f2e6c8'; ctx.beginPath(); ctx.roundRect(-0.5, -0.4, 1.0, 0.8, 0.06); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d9c28a'; ctx.beginPath(); ctx.roundRect(-0.58, -0.46, 0.16, 0.92, 0.07); ctx.roundRect(0.42, -0.46, 0.16, 0.92, 0.07); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#7b6038'; ctx.lineWidth = 0.035; for (let i = 0; i < (c.plain ? 0 : 5); i++) { ctx.beginPath(); ctx.moveTo(-0.32, -0.25 + i * 0.13); ctx.lineTo(0.32 - (i === 4 ? 0.25 : 0), -0.25 + i * 0.13); ctx.stroke(); } },
  jug: (c, t) => { ctx.fillStyle = '#c9783a'; ctx.beginPath(); ctx.moveTo(-0.2, -0.5); ctx.quadraticCurveTo(-0.5, -0.2, -0.4, 0.2); ctx.quadraticCurveTo(-0.3, 0.55, 0, 0.55); ctx.quadraticCurveTo(0.3, 0.55, 0.4, 0.2); ctx.quadraticCurveTo(0.5, -0.2, 0.2, -0.5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#b5612a'; ctx.beginPath(); ctx.ellipse(0, -0.52, 0.22, 0.07, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#7a3f18'; ctx.lineWidth = 0.04; ctx.beginPath(); ctx.moveTo(-0.38, 0.0); ctx.lineTo(0.38, 0.0); ctx.stroke(); },
  oil: (c, t) => { ctx.fillStyle = '#b9c43a'; for (let i = 0; i < 3; i++) { const y = ((t * 1.2 + i * 0.33) % 1); ctx.beginPath(); ctx.ellipse(-0.05 + i * 0.05, -0.1 + y * 0.9, 0.05, 0.08, 0, 0, 7); ctx.fill(); ctx.stroke(); } },
  wool: () => { ctx.fillStyle = '#fdfaf2'; ctx.beginPath(); for (const [x, y, r] of [[-0.3, 0.05, 0.28], [0, -0.1, 0.34], [0.3, 0.05, 0.28], [0, 0.15, 0.3]]) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 7); } ctx.fill(); ctx.stroke(); },
  flame: (c, t) => { const w = Math.sin(t * 9) * 0.05; ctx.fillStyle = '#f26a1b'; ctx.beginPath(); ctx.moveTo(0, -0.7 + w); ctx.bezierCurveTo(0.45, -0.2, 0.5, 0.2, 0.25, 0.4); ctx.bezierCurveTo(0.1, 0.55, -0.1, 0.55, -0.25, 0.4); ctx.bezierCurveTo(-0.5, 0.2, -0.4, -0.2, 0, -0.7 + w); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.moveTo(0, -0.25); ctx.bezierCurveTo(0.22, 0.0, 0.2, 0.3, 0, 0.38); ctx.bezierCurveTo(-0.2, 0.3, -0.2, 0.0, 0, -0.25); ctx.fill(); },
  qmark: (c) => { ctx.font = '900 1.5px "Playfair Display SC",Georgia,serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 0.14; ctx.strokeStyle = OL; ctx.strokeText('?', 0, 0); ctx.fillStyle = c.col || '#ffd36a'; ctx.fillText('?', 0, 0); },
  ship: (c, t) => { ctx.rotate(Math.sin(t * 2) * 0.06); ctx.fillStyle = '#7a4a28'; ctx.beginPath(); ctx.moveTo(-0.6, 0.0); ctx.lineTo(0.6, 0.0); ctx.lineTo(0.4, 0.3); ctx.lineTo(-0.4, 0.3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#4a2c18'; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -0.8); ctx.stroke(); ctx.fillStyle = '#f4ead0'; ctx.strokeStyle = OL; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(0.04, -0.78); ctx.quadraticCurveTo(0.5, -0.4, 0.45, -0.08); ctx.lineTo(0.04, -0.08); ctx.closePath(); ctx.fill(); ctx.stroke(); },
  wind: (c, t) => { ctx.strokeStyle = OL; for (const [y, w] of [[-0.2, 0.9], [0.0, 1.1], [0.2, 0.8]]) { ctx.lineWidth = 0.11; ctx.beginPath(); ctx.moveTo(-0.6, y); ctx.bezierCurveTo(-0.2, y - 0.2 + Math.sin(t * 6) * 0.05, 0.2, y + 0.2, w * 0.5, y - 0.05); ctx.stroke(); ctx.strokeStyle = '#dff1f5'; ctx.lineWidth = 0.06; ctx.stroke(); ctx.strokeStyle = OL; } },
  mount: (c) => { const k = c._k; ctx.save(); ctx.scale(1 / k, 1 / k); mount(0, 0.45 * k, 0.85 * k, '#b79a68', c.cave); ctx.restore(); },
  star: () => { ctx.fillStyle = '#ffe28a'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.22 : 0.5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); },
  rock: () => { ctx.fillStyle = '#8a7a68'; ctx.beginPath(); ctx.moveTo(-0.5, 0.3); ctx.quadraticCurveTo(-0.6, -0.2, -0.2, -0.45); ctx.quadraticCurveTo(0.3, -0.55, 0.55, -0.05); ctx.quadraticCurveTo(0.6, 0.3, 0.45, 0.35); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.ellipse(-0.1, -0.2, 0.2, 0.1, -0.3, 0, 7); ctx.fill(); },
  cloud: () => { ctx.fillStyle = '#fdfdfb'; ctx.beginPath(); for (const [x, y, r] of [[-0.45, 0.1, 0.3], [-0.1, -0.1, 0.4], [0.3, 0.0, 0.34], [0.55, 0.15, 0.25], [0.05, 0.18, 0.3]]) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 7); } ctx.fill(); ctx.stroke(); },
  hands: () => { ctx.fillStyle = '#e6b48f'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-0.3 + i * 0.3, 0, 0.14, 0.22, 0, 0, 7); ctx.fill(); ctx.stroke(); } },
  trident: () => { ctx.strokeStyle = OL; ctx.lineWidth = 0.13; ctx.beginPath(); ctx.moveTo(0, 0.7); ctx.lineTo(0, -0.5); ctx.moveTo(-0.3, -0.7); ctx.lineTo(-0.3, -0.25); ctx.quadraticCurveTo(-0.3, -0.1, 0, -0.1); ctx.quadraticCurveTo(0.3, -0.1, 0.3, -0.25); ctx.lineTo(0.3, -0.7); ctx.stroke(); ctx.strokeStyle = '#e6c25a'; ctx.lineWidth = 0.07; ctx.stroke(); },
  nectar: () => { ctx.fillStyle = '#e6c25a'; ctx.beginPath(); ctx.moveTo(-0.3, -0.4); ctx.lineTo(0.3, -0.4); ctx.quadraticCurveTo(0.3, 0.1, 0.05, 0.12); ctx.lineTo(0.05, 0.4); ctx.lineTo(0.25, 0.46); ctx.lineTo(-0.25, 0.46); ctx.lineTo(-0.05, 0.4); ctx.lineTo(-0.05, 0.12); ctx.quadraticCurveTo(-0.3, 0.1, -0.3, -0.4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d6322e'; ctx.fillRect(-0.26, -0.36, 0.52, 0.22); },
  eyeball: () => { ell(0, 0, 0.5, 0.35, '#fff', true, 0.05); ctx.fillStyle = '#2a6aa8'; ctx.beginPath(); ctx.arc(0, 0, 0.2, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, 0, 0.1, 0, 7); ctx.fill(); },
  drop: () => { ctx.fillStyle = '#5fb0e0'; ctx.beginPath(); ctx.moveTo(0, -0.5); ctx.quadraticCurveTo(0.4, 0.05, 0.25, 0.3); ctx.quadraticCurveTo(0, 0.55, -0.25, 0.3); ctx.quadraticCurveTo(-0.4, 0.05, 0, -0.5); ctx.fill(); ctx.stroke(); },
};
function bundleDraw(kind) {
  ctx.save(); ctx.lineWidth = 0.05; ctx.strokeStyle = OL;
  ctx.fillStyle = 'rgba(50,30,10,.25)'; ctx.beginPath(); ctx.ellipse(0.06, 0.12, 0.4, 0.34, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#f2e6c8'; ctx.beginPath(); ctx.ellipse(0, 0.04, 0.42, 0.34, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#c9b27a'; ctx.lineWidth = 0.04; ctx.beginPath(); ctx.arc(0, 0.04, 0.26, Math.PI * 0.12, Math.PI * 0.88); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0.04, 0.26, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); ctx.strokeStyle = OL;
  if (kind === 'stone') { ctx.fillStyle = '#8f897f'; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(-0.2, -0.22); ctx.lineTo(-0.08, -0.46); ctx.lineTo(0.14, -0.43); ctx.lineTo(0.26, -0.24); ctx.lineTo(0.1, -0.12); ctx.lineTo(-0.12, -0.12); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else { ctx.fillStyle = '#f0bd98'; ctx.beginPath(); ctx.arc(0, -0.28, 0.27, 0, 7); ctx.fill(); ctx.lineWidth = 0.045; ctx.strokeStyle = OL; ctx.stroke(); ctx.fillStyle = '#1b0f0a'; ctx.beginPath(); ctx.arc(-0.09, -0.3, 0.04, 0, 7); ctx.arc(0.09, -0.3, 0.04, 0, 7); ctx.fill(); ctx.lineWidth = 0.03; ctx.beginPath(); ctx.arc(0, -0.2, 0.05, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); ctx.fillStyle = 'rgba(230,110,100,.4)'; ctx.beginPath(); ctx.arc(-0.17, -0.2, 0.035, 0, 7); ctx.arc(0.17, -0.2, 0.035, 0, 7); ctx.fill(); }
  ctx.restore();
}
// mountain glyph (shared with map)
function mount(x, y, s, shade2 = '#b79a68', cave) { ctx.save(); ctx.translate(x, y); ctx.lineJoin = 'round'; ctx.strokeStyle = '#7b6038'; ctx.lineWidth = Math.max(2, s * 0.02);
  const R = [[-1, 0], [-0.6, -0.5], [-0.42, -0.36], [-0.08, -1.0], [0.12, -0.62], [0.34, -0.82], [0.72, -0.3], [1, 0]];
  ctx.fillStyle = '#e8d6a6'; ctx.beginPath(); R.forEach(([a, b], i) => i ? ctx.lineTo(a * s, b * s) : ctx.moveTo(a * s, b * s)); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade2; ctx.beginPath(); ctx.moveTo(-0.08 * s, -1.0 * s); ctx.lineTo(0.12 * s, -0.62 * s); ctx.lineTo(0.34 * s, -0.82 * s); ctx.lineTo(0.72 * s, -0.3 * s); ctx.lineTo(s, 0); ctx.lineTo(0.2 * s, 0); ctx.lineTo(0.02 * s, -0.45 * s); ctx.closePath(); ctx.fill();
  ctx.beginPath(); R.forEach(([a, b], i) => i ? ctx.lineTo(a * s, b * s) : ctx.moveTo(a * s, b * s)); ctx.closePath(); ctx.stroke();
  if (s > 120) { ctx.fillStyle = '#f7f3e6'; ctx.beginPath(); ctx.moveTo(-0.08 * s, -1.0 * s); ctx.lineTo(0.12 * s, -0.62 * s); ctx.lineTo(0.02 * s, -0.66 * s); ctx.lineTo(-0.1 * s, -0.58 * s); ctx.lineTo(-0.19 * s, -0.66 * s); ctx.lineTo(-0.2 * s, -0.74 * s); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  if (cave) { ctx.fillStyle = '#2a170c'; ctx.beginPath(); ctx.moveTo(-0.2 * s, 0); ctx.quadraticCurveTo(-0.2 * s, -0.43 * s, 0, -0.45 * s); ctx.quadraticCurveTo(0.2 * s, -0.43 * s, 0.2 * s, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = Math.max(2, s * 0.018); ctx.stroke(); }
  ctx.restore(); }
