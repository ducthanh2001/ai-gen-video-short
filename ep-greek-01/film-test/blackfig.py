"""Black-figure puppet toolkit (PIL). Draws flat black silhouettes with cream incised lines on clay orange.
Everything is code, nothing is AI-generated. Figures face right; pass flip=-1 to face left."""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, S = 1920, 1080, 2          # canvas size and supersample factor
BLACK = (20, 16, 16); ORANGE = (196, 99, 41); CREAM = (242, 227, 198); STONE = (58, 42, 36)
FONTS = "C:/Users/PC/kenh-youtube/ep01-price-of-light/film/fonts/"


def smooth(pts, closed=True, n=6):
    P = list(pts); m = len(P); out = []
    rng = range(m) if closed else range(m - 1)
    for i in rng:
        p0 = P[(i - 1) % m] if (closed or i > 0) else P[0]
        p1 = P[i]; p2 = P[(i + 1) % m]
        p3 = P[(i + 2) % m] if (closed or i + 2 < m) else P[-1]
        for t in range(n):
            u = t / n
            f = lambda a, b, c, d: 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u ** 3)
            out.append((f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])))
    if not closed:
        out.append(P[-1])
    return out


class Canvas:
    def __init__(self, transparent=False, size=(W, H)):
        self.w, self.h = size
        if transparent:
            self.img = Image.new("RGBA", (self.w * S, self.h * S), (0, 0, 0, 0))
        else:
            base = np.zeros((self.h * S, self.w * S, 3), np.float32); base[:] = ORANGE
            base += np.random.default_rng(3).normal(0, 1.6, (self.h * S, self.w * S, 1)).astype(np.float32)
            self.img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert("RGBA")
        self.d = ImageDraw.Draw(self.img)

    def P(self, pts): return [(x * S, y * S) for x, y in pts]
    def poly(self, pts, fill=BLACK): self.d.polygon(self.P(pts), fill=fill)
    def line(self, pts, w=2, fill=CREAM): self.d.line(self.P(pts), fill=fill, width=max(1, round(w * S)), joint="curve")
    def circle(self, c, r, fill=BLACK): self.d.ellipse([(c[0] - r) * S, (c[1] - r) * S, (c[0] + r) * S, (c[1] + r) * S], fill=fill)

    def limb(self, a, b, wa, wb, fill=BLACK):
        dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1; nx, ny = -dy / L, dx / L
        self.poly([(a[0] + nx * wa / 2, a[1] + ny * wa / 2), (b[0] + nx * wb / 2, b[1] + ny * wb / 2),
                   (b[0] - nx * wb / 2, b[1] - ny * wb / 2), (a[0] - nx * wa / 2, a[1] - ny * wa / 2)], fill)
        self.circle(a, wa / 2, fill); self.circle(b, wb / 2, fill)

    def paste(self, other, at=(0, 0)):
        self.img.alpha_composite(other.img, (int(at[0] * S), int(at[1] * S)))

    def out(self, size=None):
        im = self.img.convert("RGB")
        return im.resize(size or (self.w, self.h), Image.LANCZOS)


# ---------------------------------------------------------------- heads
HEAD = [(-0.55, 0.55), (-0.64, 0.10), (-0.50, -0.40), (-0.15, -0.62), (0.25, -0.52), (0.50, -0.22), (0.52, 0.00),
        (0.80, 0.20), (0.56, 0.31), (0.62, 0.42), (0.52, 0.52), (0.60, 0.66), (0.30, 0.86), (0.0, 0.78), (-0.30, 0.72)]
BEARD = [(0.46, 0.45), (0.68, 0.64), (0.72, 0.98), (0.45, 1.30), (0.08, 1.12), (-0.22, 0.78)]
HAIR = [(-0.66, 0.30), (-0.78, -0.10), (-0.58, -0.58), (-0.12, -0.80), (0.32, -0.66), (0.54, -0.30), (0.22, -0.38), (-0.18, -0.30), (-0.44, 0.0), (-0.58, 0.62)]


def head(cv, c, r, flip=1, beard=False, hair=True, veil=False, crown=False):
    m = lambda p: (c[0] + flip * p[0] * r, c[1] + p[1] * r)
    cv.poly(smooth([m(p) for p in HEAD]), BLACK)
    if hair:
        cv.poly(smooth([m(p) for p in HAIR]), BLACK)
        for k in range(4):
            a = [(-0.25 + k * 0.18, -0.62), (-0.30 + k * 0.18, -0.35), (-0.5 + k * 0.1, -0.05)]
            cv.line([m(p) for p in smooth(a, False, 4)], 1.4)
    if beard:
        cv.poly(smooth([m(p) for p in BEARD]), BLACK)
        for k in range(5):
            cv.line([m((0.45 - k * 0.12, 0.62 + k * 0.1)), m((0.55 - k * 0.14, 1.05 + k * 0.03))], 1.3)
    if veil:
        cv.poly(smooth([m(p) for p in [(-0.7, 0.9), (-0.95, 0.1), (-0.7, -0.6), (-0.1, -0.85), (0.4, -0.65), (0.5, -0.35), (-0.1, -0.4), (-0.4, 0.1), (-0.5, 1.1)]]), BLACK)
        cv.line([m((-0.1, -0.7)), m((-0.6, -0.1)), m((-0.65, 0.7))], 1.4)
    if crown:
        for k in range(5):
            x = -0.3 + k * 0.2
            cv.line([m((x, -0.62)), m((x + 0.04, -0.92))], 2)
    ex, ey = m((0.30, -0.03))
    cv.poly([(ex - 0.16 * r, ey), (ex, ey - 0.09 * r), (ex + 0.16 * r, ey), (ex, ey + 0.09 * r)], CREAM)
    cv.circle((ex + flip * 0.02 * r, ey), 0.055 * r, BLACK)


# ---------------------------------------------------------------- bodies
def figure(cv, ox, gy, h, pose, flip=1, robe=True, tunic=False, beard=False, hair=True, veil=False, crown=False,
           folds=6, hem=True):
    """ox = x of the figure's middle, gy = ground y, h = height. Pose points are in units of h, y=0 head top, y=1 feet."""
    T = lambda p: (ox + flip * p[0] * h, gy - h + p[1] * h)
    far_leg, near_leg = pose["legs"]
    far_arm, near_arm = pose["arms"]
    aw = 0.052 * h
    def arm(a):
        s, e, hd = [T(p) for p in a]
        cv.limb(s, e, aw, aw * 0.8); cv.limb(e, hd, aw * 0.8, aw * 0.6); cv.circle(hd, aw * 0.45)
    arm(far_arm)
    # torso
    cv.poly(smooth([T(p) for p in [(-0.075, 0.17), (0.06, 0.17), (0.085, 0.30), (0.06, 0.50), (-0.075, 0.50), (-0.09, 0.32)]]), BLACK)
    if robe:
        L = T((-0.07, 0.47)); R = T((0.06, 0.47))
        bl = T((-0.175 * pose.get("flare", 1), 0.97)); br = T((0.17 * pose.get("flare", 1), 0.97))
        cv.poly(smooth([L, R, T((0.10, 0.70)), br, T((0.0, 0.985)), bl, T((-0.12, 0.70))]), BLACK)
        for k in range(folds):
            t = (k + 0.5) / folds
            x0 = -0.05 + t * 0.10; x1 = -0.15 + t * 0.30
            cv.line([T((x0, 0.50)), T(((x0 + x1) / 2 + 0.01, 0.74)), T((x1, 0.94))], 1.4)
        if hem:
            cv.line([T((-0.172, 0.935)), T((0.0, 0.95)), T((0.168, 0.935))], 1.8)
        # feet peeking out
        for lg in (far_leg, near_leg):
            f = T(lg[2]); cv.limb((f[0], f[1] - 0.02 * h), (f[0] + flip * 0.06 * h, f[1] - 0.005 * h), 0.03 * h, 0.022 * h)
    else:
        for lg in (far_leg, near_leg):
            hp, kn, ft = [T(p) for p in lg]
            cv.limb(hp, kn, 0.085 * h, 0.06 * h); cv.limb(kn, ft, 0.06 * h, 0.04 * h)
            cv.limb((ft[0], ft[1] - 0.012 * h), (ft[0] + flip * 0.07 * h, ft[1] - 0.004 * h), 0.03 * h, 0.02 * h)
            cv.line([hp, kn], 1.2)
        if tunic:
            cv.poly(smooth([T(p) for p in [(-0.09, 0.46), (0.08, 0.46), (0.12, 0.60), (0.0, 0.64), (-0.12, 0.60)]]), BLACK)
            cv.line([T((-0.115, 0.585)), T((0.0, 0.62)), T((0.115, 0.585))], 1.8)
    # belt
    cv.line([T((-0.075, 0.48)), T((0.065, 0.48))], 2.2)
    cv.limb(T((-0.005, 0.14)), T((0.0, 0.19)), 0.05 * h, 0.06 * h)
    head(cv, T(pose.get("head", (0.015, 0.075))), 0.062 * h, flip, beard, hair, veil, crown)
    arm(near_arm)


# poses (x, y in units of h; x positive = forward)
STAND = {"legs": [[(-0.02, 0.5), (-0.03, 0.74), (-0.05, 0.97)], [(0.0, 0.5), (0.02, 0.74), (0.04, 0.97)]],
         "arms": [[(-0.02, 0.19), (-0.06, 0.34), (-0.03, 0.47)], [(0.02, 0.19), (0.05, 0.34), (0.02, 0.47)]]}
STRIDE = {"legs": [[(-0.03, 0.5), (-0.12, 0.74), (-0.2, 0.97)], [(0.0, 0.5), (0.11, 0.72), (0.2, 0.97)]], "flare": 1.25,
          "arms": [[(-0.02, 0.19), (0.07, 0.30), (0.17, 0.30)], [(0.02, 0.19), (0.10, 0.08), (0.10, -0.03)]]}


def bolt(cv, a, b, w=3, fill=CREAM, seed=1, jag=26):
    rng = np.random.default_rng(seed)
    n = 7; pts = [a]
    for i in range(1, n):
        t = i / n
        pts.append((a[0] + (b[0] - a[0]) * t + rng.uniform(-jag, jag), a[1] + (b[1] - a[1]) * t + rng.uniform(-jag, jag)))
    pts.append(b)
    cv.line(pts, w, fill)


def meander(cv, y0, y1, x0=0, x1=W):
    cv.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], ORANGE)
    cv.poly([(x0, y0), (x1, y0), (x1, y0 + 6), (x0, y0 + 6)], BLACK); cv.poly([(x0, y1 - 6), (x1, y1 - 6), (x1, y1), (x0, y1)], BLACK)
    u = (y1 - y0 - 24) / 5.0; t = max(2.5, u * 0.5); x = x0 + u * 0.5
    while x < x1:
        pts = [(0, 5), (0, 0), (5, 0), (5, 4), (2, 4), (2, 2), (3, 2)]
        pts = [(x + px * u, y0 + 12 + py * u) for px, py in pts]
        cv.line(pts, t, BLACK); cv.line([(x - u, y0 + 12 + 5 * u), (x, y0 + 12 + 5 * u)], t, BLACK)
        x += 6 * u


def frame(cv, ground=960):
    meander(cv, 36, 92); meander(cv, 978, 1040)
    cv.poly([(0, ground), (W, ground), (W, 978), (0, 978)], BLACK)


def text_plate(cv, box, lines, size, font="PlayfairDisplaySC-Black.ttf", fill=CREAM, plate=BLACK, pad=26, tracking=6):
    x0, y0, x1, y1 = box
    cv.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], plate)
    f = ImageFont.truetype(FONTS + font, int(size * S))
    cy = y0 + pad
    for ln in lines:
        ws = [cv.d.textlength(c, font=f) / S for c in ln]; tot = sum(ws) + tracking * (len(ln) - 1)
        x = (x0 + x1) / 2 - tot / 2
        for c, w in zip(ln, ws):
            cv.d.text((x * S, cy * S), c, font=f, fill=fill); x += w + tracking
        cy += size * 1.15
