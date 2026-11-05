// Original 1920s passers-by for "The Price of Light" (silent-film figure rig). Values are print densities (0 = black, 1 = white).
import { form, stroke, catmull } from '../engines/silent/ink.js';
import { PROFILE_ADULT, FRONT_ADULT } from '../engines/silent/heads.js';

const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// blend a head-local shape between the front and profile sets (same point count), in head units
function headShape(H, frontPts, profPts) {
  const w = ss(.35, .95, H.p), fm = H.front >= 0 ? H.f : -H.f;
  return frontPts.map((q, i) => { const r = profPts[i]; return [lerp(q[0] * fm, r[0] * H.f, w) * H.sc, lerp(q[1], r[1], w) * H.sc]; });
}
const loop = (pts, n = 5) => catmull(pts, true, n);

// —— the gentleman: dark overcoat, fedora ——
const crownF = [[-.33, -.3], [-.35, -.5], [-.2, -.66], [0, -.6], [.2, -.66], [.35, -.5], [.33, -.3], [0, -.33]];
const crownP = [[-.38, -.26], [-.38, -.48], [-.22, -.64], [.02, -.6], [.22, -.64], [.36, -.48], [.36, -.28], [0, -.3]];
const brimF = [[-.62, -.24], [-.5, -.33], [0, -.37], [.5, -.33], [.62, -.24], [.3, -.19], [0, -.18], [-.3, -.19]];
const brimP = [[-.62, -.18], [-.48, -.3], [0, -.34], [.56, -.3], [.74, -.2], [.38, -.16], [0, -.15], [-.34, -.15]];
export const GENT = {
  name: 'Gent', body: 'adult', line: .03,
  skin: { v: .74 }, handW: .36, neckW: .42,
  leg: { v: .2, w: [.56, .46, .4], folds: true },
  shoe: { v: .08 },
  arm: { v: .17, w: [.5, .44, .38], sleeve: 1 },
  torso: { v: .17, grad: .2 },
  torsoW: 1.1, torsoD: 1.25,
  skirt: { front: false, v: .16, top: 1.25, len: 2.7, wz: .82, fx: -.3, hemW: 1.28 },     // the overcoat's skirt
  head: {
    skin: .74, jaw: 1.06, chinW: .56, brow: 1.8, lip: .42, profile: PROFILE_ADULT, front: FRONT_ADULT, nose: 1.0,
    hat(g, H) {
      form(g, loop(headShape(H, crownF, crownP), 5), { v: .14, line: H.lw, grad: .22, hatch: .35, seed: 621 });
      const band = headShape(H, [[-.34, -.31], [0, -.34], [.34, -.31]], [[-.38, -.27], [0, -.31], [.36, -.29]]);
      stroke(g, catmull(band, false, 5), H.lw * 2.2, { seed: 622 });
      form(g, loop(headShape(H, brimF, brimP), 4), { v: .12, line: H.lw, grad: .15, hatch: .3, seed: 623 });
    },
  },
};

// —— the lady: long coat, pale stockings, bobbed hair under a cloche ——
const clocheF = [[-.42, -.1], [-.46, -.3], [-.36, -.55], [0, -.64], [.36, -.55], [.46, -.3], [.42, -.1], [.2, -.17], [0, -.19], [-.2, -.17]];
const clocheP = [[-.5, 0], [-.52, -.28], [-.38, -.56], [-.02, -.66], [.3, -.56], [.44, -.32], [.47, -.13], [.25, -.15], [0, -.17], [-.27, -.05]];
const bobF = [[-.44, .22], [-.46, -.08], [0, -.3], [.46, -.08], [.44, .22], [.22, .08], [0, .02], [-.22, .08]];
const bobP = [[-.48, .3], [-.52, 0], [-.2, -.3], [.2, -.2], [.12, 0], [0, .12], [-.12, .22], [-.32, .34]];
export const LADY = {
  name: 'Lady', body: 'adult', line: .03,
  skin: { v: .82 }, handW: .32, neckW: .34,
  leg: { v: .78, w: [.4, .32, .28], folds: false },
  shoe: { v: .1 },
  arm: { v: .34, w: [.42, .37, .32], sleeve: 1 },
  torso: { v: .34, grad: .18 },
  torsoW: .96,
  skirt: { front: true, v: .34, top: .95, len: 2.45, wz: .72, fx: .46, topW: 1, hemW: 1.28, hatch: .2 },
  collar(g, J, pr, s, lw) {   // a pale fur collar
    const n = pr.P(J.neck);
    form(g, loop([[n[0] - s * .42, n[1] - s * .1], [n[0] + s * .42, n[1] - s * .1], [n[0] + s * .46, n[1] + s * .12], [n[0], n[1] + s * .2], [n[0] - s * .46, n[1] + s * .12]], 4), { v: .85, line: lw * .8, seed: 631 });
  },
  head: {
    skin: .82, jaw: .92, chinW: .48, brow: 1.2, lip: .46, profile: PROFILE_ADULT, front: FRONT_ADULT, makeup: .6, nose: .9,
    hairBack(g, H) { form(g, loop(headShape(H, bobF, bobP)), { v: .16, line: H.lw * .8, grad: .1, hatch: .3, seed: 641 }); },
    hat(g, H) {
      form(g, loop(headShape(H, clocheF, clocheP), 5), { v: .62, line: H.lw, grad: .22, hatch: .15, seed: 651 });
      const band = headShape(H, [[-.44, -.24], [0, -.28], [.44, -.24]], [[-.5, -.18], [0, -.25], [.45, -.22]]);
      stroke(g, catmull(band, false, 5), H.lw * 2, { seed: 652, alpha: .8 });
    },
  },
};
