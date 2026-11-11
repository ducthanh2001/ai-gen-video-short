// thumbs.js (B02): caption-free thumbnail stills, ?thumb=a|b|c|d (with nocap=1). One frame, no shake or whip, subject in the upper 70 percent.
'use strict';
{
  const TH = Q.get('thumb');
  if (TH) {
    const shot = id => SHOTS.find(s => s.id === id);
    const mk = (id, t, u, camFn, extra = {}) => Object.assign({}, shot(id), { t, u, cam: camFn, post: null, over: null, id: 'thumb_' + TH }, extra);
    if (TH === 'a') window.THUMB = mk('s10', C_.s10 + 1.9, 0.9, () => ({ p: [-8.3, 1.25, 4.6], l: [-9.0, 0.55, 1.2], fov: 46, ap: 0.6, focus: 3.5, shake: 0 }));
    if (TH === 'b') window.THUMB = mk('s6a', C_.sloppy + 0.12, 0.5, () => ({ p: [6.6, 1.7, 3.0], l: [4.6, 1.05, -0.1], fov: 44, ap: 0.6, focus: 3.6, shake: 0 }));
    if (TH === 'c') window.THUMB = mk('s1a', 0.9, 0.7, () => ({ p: [8.1, 2.25, -0.9], l: [9.05, 0.8, 1.8], fov: 46, ap: 1.0, focus: 3.0, shake: 0 }));
    if (TH === 'd') window.THUMB = mk('s14', C_.s14 + 1.6, 0.5, () => ({ p: [200.0, 1.95, 3.6], l: [200.0, 1.3, -1.0], fov: 44, ap: 0.4, focus: 4.6, shake: 0 }));
  }
}
