import sys, math, pathlib
import numpy as np
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from blackfig import *

OUT = pathlib.Path(__file__).parent / "out"; OUT.mkdir(exist_ok=True)
ART = pathlib.Path(__file__).parents[1] / "research" / "artifact"


def label(cv, x, y, s, size=34):
    f = ImageFont.truetype(FONTS + "PlayfairDisplaySC-Black.ttf", int(size * S))
    w = cv.d.textlength(s, font=f) / S
    cv.d.text(((x - w / 2) * S, y * S), s, font=f, fill=CREAM)


def bolt_prop(cv, hand, flip=1, size=120):
    # forked thunderbolt held in the hand
    x, y = hand
    for k, a in enumerate((-0.5, 0.0, 0.5)):
        cv.line([(x, y), (x + flip * size * 0.35, y - size * (0.3 + 0.1 * k) * math.cos(a) - 20), (x + flip * size * (0.15 + a * 0.5), y - size)], 5, BLACK)
        cv.line([(x, y), (x + flip * size * 0.35, y - size * 0.4), (x + flip * size * (0.15 + a * 0.5), y - size)], 2, CREAM)


def snake_coil(cv, pts, w0, w1):
    sm = smooth(pts, False, 8)
    n = len(sm)
    for i in range(n - 1):
        w = w0 + (w1 - w0) * i / n
        cv.limb(sm[i], sm[i + 1], w, w + (w1 - w0) / n)
    # scale dots
    for i in range(0, n - 1, 3):
        cv.circle(sm[i], max(2, (w0 + (w1 - w0) * i / n) * 0.18), CREAM)


def snake_head(cv, c, ang, r=26):
    ca, sa = math.cos(ang), math.sin(ang)
    pts = [(-1.0, -0.6), (0.3, -0.7), (1.8, -0.15), (1.9, 0.15), (0.2, 0.75), (-1.0, 0.6)]
    cv.poly(smooth([(c[0] + (x * ca - y * sa) * r, c[1] + (x * sa + y * ca) * r) for x, y in pts]), BLACK)
    e = (c[0] + (0.5 * ca - (-0.2) * sa) * r, c[1] + (0.5 * sa + (-0.2) * ca) * r)
    cv.circle(e, r * 0.14, CREAM)
    tip = (c[0] + 1.9 * ca * r, c[1] + 1.9 * sa * r)
    cv.line([tip, (tip[0] + 0.9 * ca * r, tip[1] + 0.9 * sa * r), (tip[0] + 1.2 * ca * r + 0.3 * r * -sa, tip[1] + 1.2 * sa * r + 0.3 * r * ca)], 2)


def wing(cv, root, span, up, flip=1):
    rx, ry = root
    outline = [(0, 0), (0.25, -0.55), (0.75, -1.0), (1.0, -0.8), (0.95, -0.35), (0.7, 0.05), (0.3, 0.12)]
    cv.poly(smooth([(rx + flip * x * span, ry + y * up) for x, y in outline]), BLACK)
    for k in range(7):
        t = k / 6
        a = (rx + flip * (0.12 + 0.1 * t) * span, ry - (0.1 + 0.4 * t) * up)
        b = (rx + flip * (0.92 - 0.1 * t) * span, ry - (0.7 - 0.55 * t) * up)
        cv.line([a, b], 1.8)


def typhoeus(cv, cx, gy, s=1.0, flip=-1):
    # coils on ground, human torso, wings, snake heads
    base = gy - 20
    coil = [(cx - flip * 340 * s, base - 30 * s), (cx - flip * 200 * s, base - 120 * s), (cx - flip * 20 * s, base - 30 * s),
            (cx + flip * 160 * s, base - 140 * s), (cx + flip * 300 * s, base - 40 * s), (cx + flip * 420 * s, base - 70 * s)]
    snake_coil(cv, coil, 78 * s, 14 * s)
    coil2 = [(cx + flip * 40 * s, base - 150 * s), (cx - flip * 120 * s, base - 70 * s), (cx - flip * 260 * s, base - 150 * s), (cx - flip * 420 * s, base - 60 * s)]
    snake_coil(cv, coil2, 64 * s, 12 * s)
    tx, ty = cx, base - 270 * s
    wing(cv, (tx, ty - 90 * s), 360 * s, 330 * s, flip)
    wing(cv, (tx, ty - 90 * s), 360 * s, 330 * s, -flip)
    # torso
    cv.poly(smooth([(tx - 70 * s, ty - 140 * s), (tx + 70 * s, ty - 140 * s), (tx + 90 * s, ty + 40 * s), (tx + 60 * s, ty + 160 * s), (tx - 60 * s, ty + 160 * s), (tx - 90 * s, ty + 40 * s)]), BLACK)
    for k in range(4):
        cv.line([(tx - 40 * s, ty - 90 * s + k * 40 * s), (tx + 40 * s, ty - 70 * s + k * 40 * s)], 2)
    head(cv, (tx, ty - 195 * s), 62 * s, flip, beard=True, hair=True)
    # snake heads rising from shoulders
    for ang, off in ((-2.6 if flip < 0 else -0.5, (-85, -120)), (-1.2, (0, -250)), (-0.5 if flip < 0 else -2.6, (85, -120))):
        base_pt = (tx + off[0] * s, ty + off[1] * s * 0.6)
        end = (base_pt[0] + 70 * math.cos(ang) * s * 2, base_pt[1] + 70 * math.sin(ang) * s * 2)
        snake_coil(cv, [(tx + off[0] * s * 0.3, ty - 120 * s), base_pt, end], 26 * s, 14 * s)
        snake_head(cv, end, ang, 22 * s)


GOD = dict(beard=True, hair=True, crown=True)


def scene_hook():
    cv = Canvas(); frame(cv)
    # Zeus, large, left; Metis outline inside his belly
    figure(cv, 720, 960, 760, STAND, flip=1, robe=True, folds=9, **GOD)
    # belly cavity: cream outline of a small woman, curled
    bx, by = 735, 640
    cv.circle((bx - 20, by - 70), 22, CREAM)
    cv.poly(smooth([(bx - 50, by - 45), (bx + 10, by - 45), (bx + 40, by + 20), (bx + 10, by + 90), (bx - 60, by + 80), (bx - 70, by + 10)]), CREAM)
    cv.poly(smooth([(bx - 36, by - 28), (bx - 4, by - 28), (bx + 16, by + 20), (bx - 2, by + 66), (bx - 44, by + 58), (bx - 50, by + 10)]), BLACK)
    cv.line([(bx - 30, by - 5), (bx - 8, by + 40)], 2)
    # swirl lines around belly
    cv.line(smooth([(bx - 120, by - 60), (bx - 140, by + 20), (bx - 100, by + 110)], False, 6), 3)
    cv.line(smooth([(bx + 100, by - 70), (bx + 130, by + 10), (bx + 90, by + 110)], False, 6), 3)
    # title
    text_plate(cv, (1130, 270, 1840, 640), ["HE", "SWALLOWED", "HER"], 96, tracking=8)
    cv.d.rectangle([1146 * S, 286 * S, 1824 * S, 624 * S], outline=CREAM, width=3 * S)
    label(cv, 1485, 690, "THEOGONY 886 TO 894", 30)
    return cv.out()


def swaddled_stone(cv, c, r=70):
    # bundle: stone in baby clothes
    cv.poly(smooth([(c[0] - r, c[1]), (c[0] - r * 0.7, c[1] - r * 0.7), (c[0] + r * 0.2, c[1] - r * 0.85), (c[0] + r * 0.95, c[1] - r * 0.3),
                    (c[0] + r * 0.9, c[1] + r * 0.5), (c[0] + r * 0.2, c[1] + r * 0.9), (c[0] - r * 0.7, c[1] + r * 0.6)]), STONE)
    for k in range(5):
        a = -0.8 + k * 0.4
        cv.line([(c[0] - r * 0.8, c[1] + a * r * 0.5), (c[0] + r * 0.8, c[1] + a * r * 0.5 + 12)], 2.2)
    cv.line([(c[0] - r * 0.1, c[1] - r * 0.8), (c[0] + r * 0.1, c[1] + r * 0.85)], 2.2)
    cv.circle(c, r * 1.05, None) if False else None


def scene_stone():
    cv = Canvas(); frame(cv)
    # Gaia veiled (left, facing right) holding the bundle out; Cronos (right, facing left) receiving
    GAIA = dict(STAND); GAIA["arms"] = [[(-0.02, 0.19), (0.07, 0.29), (0.18, 0.32)], [(0.02, 0.19), (0.12, 0.30), (0.24, 0.34)]]
    figure(cv, 560, 960, 640, GAIA, flip=1, robe=True, veil=True, folds=8)
    CR = dict(STAND); CR["arms"] = [[(-0.02, 0.19), (0.08, 0.30), (0.19, 0.34)], [(0.02, 0.19), (0.12, 0.29), (0.23, 0.33)]]
    figure(cv, 1360, 960, 690, CR, flip=-1, robe=True, beard=True, folds=8)
    swaddled_stone(cv, (960, 960 - 640 + 0.34 * 640 - 10), 66)
    label(cv, 560, 150, "GAIA", 44); label(cv, 1360, 150, "CRONOS", 44)
    label(cv, 960, 205, "A GREAT STONE, WRAPPED IN BABY CLOTHES", 28)
    return cv.out()


def scene_typhon():
    cv = Canvas(); frame(cv)
    Z = dict(STRIDE)
    Z["arms"] = [[(-0.02, 0.19), (0.09, 0.12), (0.18, 0.18)], [(0.02, 0.19), (0.10, 0.05), (0.13, -0.08)]]
    figure(cv, 470, 960, 720, Z, flip=1, robe=False, tunic=True, **GOD)
    hx = 470 + 0.13 * 720; hy = 960 - 720 - 0.08 * 720 + 720 * 0.0
    bolt_prop(cv, (hx, 960 - 720 + (-0.08) * 720 + 80), 1, 150)
    typhoeus(cv, 1330, 960, 1.0, -1)
    bolt(cv, (700, 330), (1010, 520), 3, CREAM, 4); bolt(cv, (720, 300), (1050, 430), 2, CREAM, 8, 20)
    label(cv, 470, 150, "ZEUS", 44); label(cv, 1330, 130, "TYPHOEUS", 44)
    label(cv, 960, 205, "A HUNDRED SNAKE HEADS. FIRE FROM EVERY EYE.", 28)
    return cv.out()


def scene_vase():
    cv = Canvas(); frame(cv)
    ph = Image.open(ART / "Zeus_Typhon_Staatliche_Antikensammlungen_596.jpg").convert("RGB")
    ph = ph.resize((1180, round(1180 * ph.height / ph.width)), Image.LANCZOS)
    panel = Image.new("RGB", (ph.width + 24, ph.height + 24), (20, 16, 16)); panel.paste(ph, (12, 12))
    cv.img.paste(panel.convert("RGBA"), (360 * S, 190 * S))
    # lowres paste above is at S scale origin; re-scale: paste again correctly
    return cv, panel


def scene_vase_final():
    cv = Canvas(); frame(cv)
    ph = Image.open(ART / "Zeus_Typhon_Staatliche_Antikensammlungen_596.jpg").convert("RGB")
    w = 1240; ph = ph.resize((w, round(w * ph.height / ph.width)), Image.LANCZOS)
    big = ph.resize((ph.width * S, ph.height * S), Image.LANCZOS).convert("RGBA")
    x0, y0 = 340, 120
    cv.d.rectangle([(x0 - 14) * S, (y0 - 14) * S, (x0 + ph.width + 14) * S, (y0 + ph.height + 14) * S], fill=BLACK)
    cv.img.paste(big, (x0 * S, y0 * S))
    label(cv, 960, y0 + ph.height + 40, "CHALCIDIAN HYDRIA, MUNICH, ABOUT 540 BC", 34)
    label(cv, 960, y0 + ph.height + 90, "Photo: Bibi Saint-Pol, Wikimedia Commons", 20)
    return cv.out()


if __name__ == "__main__":
    which = sys.argv[1:] or ["hook", "stone", "typhon", "vase"]
    fn = {"hook": scene_hook, "stone": scene_stone, "typhon": scene_typhon, "vase": scene_vase_final}
    for k in which:
        fn[k]().save(OUT / f"{k}.png"); print("saved", k)
