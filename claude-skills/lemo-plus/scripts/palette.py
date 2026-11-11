#!/usr/bin/env python3
"""Look board and measured palette, from reference stills (Python 3 + Pillow; no ffmpeg).

  python palette.py measure <img|dir> [<img|dir> ...] --out <project>/research/direction.json
  python palette.py board --row "A|<label>|<dir or images, comma separated>" --row "B|..." [--row "C|..."] \
         --out <project>/review/directions.jpg
  python palette.py compare <frame.png> --against <project>/research/direction.json

Measured per still and pooled: a 5-colour palette (k-means in CIELAB, dark to light; accent = the most chromatic),
luminance percentiles (p5, p50, p95), contrast (p95 - p5), dark and bright shares, saturation (mean chroma),
warmth (mean b* of the mid-tones) and vignette (corners vs centre). `compare` measures a style frame the same way and
prints how far it sits from the picked direction, with what to change.

Film stills are copyrighted: they are thumbnails for choosing and measuring only, never in a frame, never shipped.
Pillow: Lemo's $LIB/.venv has it after `setup.sh deps`, or `python -m pip install pillow` in any venv.
Adapted from cinecode's direction.py by Sarp Yildiz (MIT).
"""
import argparse
import json
import math
import os
import random
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("palette.py needs Pillow: use Lemo's .venv python, or `python -m pip install pillow` in a venv")

W = 96
EXT = (".jpg", ".jpeg", ".png", ".webp", ".bmp")


def files_of(paths):
    out = []
    for p in paths:
        for q in p.split(","):
            q = q.strip()
            if os.path.isdir(q):
                out += sorted(os.path.join(q, f) for f in os.listdir(q) if f.lower().endswith(EXT))
            elif q:
                out.append(q)
    return out


def srgb_to_lab(r, g, b):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = lin(r), lin(g), lin(b)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


def lab_to_hex(L, a, b):
    fy = (L + 16) / 116
    fx, fz = fy + a / 500, fy - b / 200
    inv = lambda t: t ** 3 if t ** 3 > 0.008856 else (t - 16 / 116) / 7.787
    x, y, z = inv(fx) * 0.95047, inv(fy), inv(fz) * 1.08883
    r = 3.2406 * x - 1.5372 * y - 0.4986 * z
    g = -0.9689 * x + 1.8758 * y + 0.0415 * z
    bb = 0.0557 * x - 0.2040 * y + 1.0570 * z
    gam = lambda c: 255 * (12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055)
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(gam(c)))) for c in (r, g, bb))


def pixels(path):
    im = Image.open(path).convert("RGB")
    h = max(1, round(im.height * W / im.width))
    im = im.resize((W, h), Image.BILINEAR)
    data = im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata()
    return list(data), W, h


def kmeans(labs, k=5, iters=12, seed=7):
    rng = random.Random(seed)
    pts = labs if len(labs) <= 6000 else rng.sample(labs, 6000)
    cents = [pts[0]]
    while len(cents) < k:                                   # k-means++ start
        d = [min(sum((p[i] - c[i]) ** 2 for i in range(3)) for c in cents) for p in pts]
        tot = sum(d) or 1
        r, acc = rng.random() * tot, 0
        for p, dd in zip(pts, d):
            acc += dd
            if acc >= r:
                cents.append(p)
                break
    for _ in range(iters):
        groups = [[] for _ in cents]
        for p in pts:
            j = min(range(len(cents)), key=lambda i: sum((p[t] - cents[i][t]) ** 2 for t in range(3)))
            groups[j].append(p)
        cents = [tuple(sum(p[t] for p in g) / len(g) for t in range(3)) if g else c for g, c in zip(groups, cents)]
    shares = [len(g) / len(pts) for g in groups]
    return sorted(zip(cents, shares), key=lambda cs: cs[0][0])


def pct(vals, q):
    s = sorted(vals)
    return s[min(len(s) - 1, max(0, int(q / 100 * (len(s) - 1))))]


def measure_labs(labs, w, h):
    Ls = [p[0] for p in labs]
    chroma = [math.hypot(p[1], p[2]) for p in labs]
    mids = [p[2] for p in labs if 30 <= p[0] <= 70] or [p[2] for p in labs]
    corner = [labs[y * w + x][0] for y in range(h) for x in range(w)
              if (x < w * 0.15 or x > w * 0.85) and (y < h * 0.15 or y > h * 0.85)]
    centre = [labs[y * w + x][0] for y in range(h) for x in range(w)
              if w * 0.35 < x < w * 0.65 and h * 0.35 < y < h * 0.65]
    pal = kmeans(labs)
    accent = max(pal, key=lambda cs: math.hypot(cs[0][1], cs[0][2]))[0]
    return {
        "palette": [{"hex": lab_to_hex(*c), "share": round(s, 3)} for c, s in pal],
        "accent": lab_to_hex(*accent),
        "L_p5": round(pct(Ls, 5), 1), "L_p50": round(pct(Ls, 50), 1), "L_p95": round(pct(Ls, 95), 1),
        "contrast": round(pct(Ls, 95) - pct(Ls, 5), 1),
        "dark_share": round(sum(1 for L in Ls if L < 20) / len(Ls), 3),
        "bright_share": round(sum(1 for L in Ls if L > 85) / len(Ls), 3),
        "saturation": round(sum(chroma) / len(chroma), 1),
        "warmth": round(sum(mids) / len(mids), 1),
        "vignette": round((sum(centre) / max(1, len(centre))) - (sum(corner) / max(1, len(corner))), 1),
    }


def measure_files(files):
    per, pooled = {}, []
    for f in files:
        try:
            px, w, h = pixels(f)
        except Exception as e:
            print(f"! skipped {f}: {e}", file=sys.stderr)
            continue
        labs = [srgb_to_lab(*p) for p in px]
        per[os.path.basename(f)] = measure_labs(labs, w, h)
        pooled += labs
    if not per:
        sys.exit("no readable images")
    keys = ["L_p5", "L_p50", "L_p95", "contrast", "dark_share", "bright_share", "saturation", "warmth", "vignette"]
    mean = {k: round(sum(m[k] for m in per.values()) / len(per), 3) for k in keys}
    pal = kmeans(pooled)
    accent = max(pal, key=lambda cs: math.hypot(cs[0][1], cs[0][2]))[0]
    mean["palette"] = [{"hex": lab_to_hex(*c), "share": round(s, 3)} for c, s in pal]
    mean["accent"] = lab_to_hex(*accent)
    return {"stills": len(per), "pooled": mean, "per_still": per}


def describe(m):
    tone = "low-key" if m["L_p50"] < 35 else "high-key" if m["L_p50"] > 65 else "mid-key"
    warm = "warm" if m["warmth"] > 8 else "cool" if m["warmth"] < -4 else "neutral"
    sat = "muted" if m["saturation"] < 15 else "rich" if m["saturation"] > 35 else "moderate"
    con = "soft" if m["contrast"] < 45 else "hard" if m["contrast"] > 75 else "medium"
    return f"{tone}, {con} contrast, {sat} colour, {warm} mid-tones" + (", vignetted" if m["vignette"] > 8 else "")


def cmd_measure(a):
    data = measure_files(files_of(a.paths))
    data["read"] = describe(data["pooled"])
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=1)
    p = data["pooled"]
    print(f"{data['stills']} stills: {data['read']}")
    print("palette " + " ".join(c["hex"] for c in p["palette"]) + f"  accent {p['accent']}")
    print(f"wrote {a.out}  (write the palette into the treatment's look notes; STYLE.md colour rules still win)")


def font(size):
    for name in ("arial.ttf", "DejaVuSans.ttf", "Helvetica.ttc"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def cmd_board(a):
    rows = []
    for r in a.row:
        parts = r.split("|")
        if len(parts) < 3:
            sys.exit(f"--row needs 'ID|label|dir or images': {r}")
        rows.append((parts[0], parts[1], files_of([parts[2]])[:4]))
    tw, th, pad, sw = 360, 203, 16, 60
    width = pad + 240 + 4 * (tw + pad) + 5 * sw + pad
    height = pad + len(rows) * (th + 40 + pad)
    board = Image.new("RGB", (width, height), (24, 24, 24))
    d = ImageDraw.Draw(board)
    big, small = font(30), font(16)
    for i, (rid, label, files) in enumerate(rows):
        y = pad + i * (th + 40 + pad)
        d.text((pad, y + 10), rid, fill=(255, 255, 255), font=big)
        d.text((pad, y + 56), label[:28], fill=(210, 210, 210), font=small)
        x = pad + 240
        for f in files:
            try:
                im = Image.open(f).convert("RGB")
                im.thumbnail((tw, th))
                board.paste(im, (x + (tw - im.width) // 2, y + (th - im.height) // 2))
            except Exception:
                pass
            x += tw + pad
        x = pad + 240 + 4 * (tw + pad)
        if files:
            m = measure_files(files)["pooled"]
            for c in m["palette"]:
                d.rectangle([x, y, x + sw - 6, y + th], fill=c["hex"], outline=(110, 110, 110))
                x += sw
            d.text((pad + 240, y + th + 8), describe(m), fill=(200, 200, 200), font=small)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    board.save(a.out, quality=88)
    print(f"wrote {a.out}  (show the user: one row per direction, mood only)")


def cmd_compare(a):
    with open(a.against, encoding="utf-8") as fh:
        ref = json.load(fh)["pooled"]
    m = measure_files([a.frame])["pooled"]
    print(f"frame: {describe(m)}\nref:   {describe(ref)}")
    notes = []
    checks = [("L_p50", 8, "overall brightness", "darker", "brighter"),
              ("contrast", 10, "contrast", "softer", "harder"),
              ("saturation", 6, "saturation", "less saturated", "more saturated"),
              ("warmth", 4, "warmth", "cooler", "warmer"),
              ("vignette", 6, "vignette", "less vignette", "more vignette")]
    for k, tol, name, down, up in checks:
        diff = m[k] - ref[k]
        if abs(diff) > tol:
            notes.append(f"{name}: frame {m[k]} vs ref {ref[k]} -> make it {down if diff > 0 else up}")
    print("\n".join(notes) if notes else "within tolerance of the direction")
    return 0


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    m = sub.add_parser("measure")
    m.add_argument("paths", nargs="+")
    m.add_argument("--out", required=True)
    b = sub.add_parser("board")
    b.add_argument("--row", action="append", required=True)
    b.add_argument("--out", required=True)
    c = sub.add_parser("compare")
    c.add_argument("frame")
    c.add_argument("--against", required=True)
    a = ap.parse_args(argv)
    return {"measure": cmd_measure, "board": cmd_board, "compare": cmd_compare}[a.cmd](a) or 0


if __name__ == "__main__":
    for _s in (sys.stdout, sys.stderr):
        getattr(_s, "reconfigure", lambda **k: None)(encoding="utf-8", errors="replace")
    sys.exit(main(sys.argv[1:]))
