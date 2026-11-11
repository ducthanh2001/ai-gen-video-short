// thumbs.js: thumbnail stills. Active only with ?thumb=a|b|c|d (use with nocap=1&nolabel=1): one frame, no whip, no shake, sharp, subject in the upper 70 percent.
'use strict';
{
  const TH = Q.get('thumb');
  if (TH) {
    const sh = id => SHOTS.find(s => s.id === id);
    const mk = (id, t, u, camFn, over) => Object.assign({}, sh(id), { t, u, cam: camFn, post: null, over: over || null, id: 'thumb_' + TH });
    const L10 = lineT('l10'), L11 = lineT('l11');
    const bang = (ctx) => { const s = H * 0.17; ctx.save(); ctx.translate(W * 0.78, H * 0.2); ctx.rotate(0.12); ctx.font = `${s}px Impact`; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = s * .16; ctx.strokeStyle = '#000'; ctx.strokeText('!', 0, 0); ctx.fillStyle = '#ff9f1c'; ctx.fillText('!', 0, 0); ctx.restore(); };
    if (TH === 'a') window.THUMB = mk('10a', L10 + 3.6, 0.95, () => ({ p: [0.3, 1.45, 3.7], l: [0.0, 1.25, 0.45], fov: 40, ap: 1.4, focus: 3.5, shake: 0 }), bang);
    if (TH === 'b') window.THUMB = mk('11a', L11 + 3.4, 0.5, () => ({ p: [0.7, 0.9, 7.2], l: [0, -0.25, 0], fov: 38, ap: 0.6, focus: 7.2, shake: 0 }));
    if (TH === 'c') { window.THUMB = mk('h3', TL.cuts.h3 + 0.9, 0.55, () => ({ p: [-1.3, 1.55, 0.4], l: [0.6, 0.65, -3.4], fov: 46, ap: 1.0, focus: 3.5, shake: 0 })); const b0 = window.THUMB.update; window.THUMB.update = (u, t, s) => { b0(u, t, s); const c = OBJ.crafter; const pose = holdBox(c, OBJ.box, 0, -2.5, -0.5, { oy: 0.55 }); poseChar(c, Object.assign(pose, { face: 'smug', head: [0.02, -0.15, 0.04] })); updateBoxGears(OBJ.box, 3, 40); }; }
    if (TH === 'd') window.THUMB = mk('h4', TL.cuts.h4 + 0.3, 0.4, () => ({ p: [-0.4, 1.7, 0.7], l: [2.75, 1.3, -0.55], fov: 48, ap: 1.0, focus: 2.9, shake: 0 }));
  }
}
