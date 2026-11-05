"""YouTube banner for Ink & Ages (2560×1440): the eight engraved objects from banner-ai.png, re-laid in ONE row inside the
band every device shows (y 508–931; the 1546×423 centre is visible on phones too), with the title set in Bodoni Moda.
usage: python make_banner.py → banner.png + banner_preview.png (safe zones drawn)"""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageFilter
D = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(D, '..', 'ep01-price-of-light', 'film', 'fonts')
src = Image.open(os.path.join(D, 'banner-ai.png')).convert('RGB')
a = np.asarray(src).astype(np.float32)
BG = np.median(a[310:480, 100:1300].reshape(-1, 3), 0)               # the paper colour of the empty middle band
print('paper', BG.round())

# —— find the eight objects in the top row by their ink columns ——
row = a[60:300]
ink = ((BG - row).max(2) > 60)
cols = ink.sum(0) > 2
segs, i = [], 0
while i < len(cols):
    if cols[i]:
        j = i
        while j < len(cols) and (cols[j] or cols[j:j + 14].any()): j += 1
        if j - i > 30: segs.append((i, j))
        i = j
    else: i += 1
def split(x0, x1, n):   # cut a merged run at its emptiest columns, away from the ends
    if n == 1: return [(x0, x1)]
    prof = ink[:, x0:x1].sum(0).astype(float); w = x1 - x0
    best = min(range(int(w * .3), int(w * .7)), key=lambda k: prof[k - 3:k + 4].sum())
    return split(x0, x0 + best, 1) + split(x0 + best, x1, n - 1)
segs = [p for x0, x1 in segs for p in split(x0, x1, 2 if x1 - x0 > 240 else 1)]
objs = []
for x0, x1 in segs:
    m = ink[:, x0:x1].any(1); ys = np.where(m)[0]
    objs.append((x0 - 1, 60 + ys[0] - 4, x1 + 1, 60 + ys[-1] + 4))
print(len(objs), 'objects', objs)
assert len(objs) == 8, 'expected 8 objects in the top row'

# —— canvas: paper + soft grain ——
W, H = 2560, 1440
rng = np.random.default_rng(3)
paper = np.ones((H, W, 3), np.float32) * BG
grain = rng.normal(0, 3.2, (H // 2, W // 2)); grain = np.asarray(Image.fromarray(grain.astype(np.float32)).resize((W, H), Image.BILINEAR))
paper += grain[..., None]
yy, xx = np.mgrid[0:H, 0:W]; vig = 1 - .06 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
paper *= vig[..., None]
canvas = Image.fromarray(np.clip(paper, 0, 255).astype(np.uint8))

def put(box, cx, base, h):
    """multiply an object (its paper made white) onto the canvas, scaled to height h, centred at cx, standing on base"""
    o = np.asarray(src.crop(box)).astype(np.float32) / BG * 255
    from scipy import ndimage   # drop stray ink from a neighbour: keep only blobs centred in the middle 80% of the crop
    lab, n = ndimage.label(ndimage.binary_dilation((255 - o).max(2) > 40, iterations=3))
    for k, sl in enumerate(ndimage.find_objects(lab), 1):
        bx = (sl[1].start + sl[1].stop) / 2
        if (bx < o.shape[1] * .1 or bx > o.shape[1] * .9) and (sl[1].stop - sl[1].start) < o.shape[1] * .3: o[lab == k] = 255
    im = Image.fromarray(np.clip(o, 0, 255).astype(np.uint8))
    k = h / im.height; im = im.resize((round(im.width * k), round(h)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
    x, y = round(cx - im.width / 2), round(base - im.height)
    reg = canvas.crop((x, y, x + im.width, y + im.height))
    canvas.paste(ImageChops.multiply(reg, im), (x, y))
    return im.width

# —— layout: band y 508–931, title in the middle, four objects each side ——
BAND0, BAND1, BASE = 508, 931, 830
heights = [190, 215, 190, 190, 270, 235, 250, 210]            # lamp, quill, compass, watch | ship, train, gramophone, bulb
widths = [(b[2] - b[0]) * h / (b[3] - b[1]) for b, h in zip(objs, heights)]
def row(idx, x_left, x_right, gap=26):
    k = min(1, (x_right - x_left - gap * (len(idx) - 1)) / sum(widths[i] for i in idx))   # shrink the group to fit
    tot = sum(widths[i] * k for i in idx); gap = (x_right - x_left - tot) / (len(idx) - 1)
    x = x_left
    for i in idx: put(objs[i], x + widths[i] * k / 2, BASE + (8 if i == 4 else 0), heights[i] * k); x += widths[i] * k + gap
row([0, 1, 2, 3], 60, 790)
row([4, 5, 6, 7], 1770, 2500)

d = ImageDraw.Draw(canvas)
def font(file, size, wght=None):
    f = ImageFont.truetype(os.path.join(FONTS, file), size)
    if wght:
        try: f.set_variation_by_axes([wght if ax['name'] in (b'Weight', 'Weight') else ax['default'] for ax in f.get_variation_axes()])
        except Exception as e: print('axes', e)
    return f
INK, ACC = (28, 26, 24), (200, 80, 42)
TF, SF = font('BodoniModa.ttf', 124, 600), font('BodoniModa-Italic.ttf', 54, 400)
title = 'INK & AGES'
# tracked caps
track = 14; ws = [d.textlength(ch, font=TF) for ch in title]; tw = sum(ws) + track * (len(title) - 1)
x = W / 2 - tw / 2
for ch, w in zip(title, ws):
    d.text((x, 700), ch, font=TF, fill=ACC if ch == '&' else INK, anchor='ls'); x += w + track
# rule with a diamond, then the tagline
d.line((W / 2 - 260, 742, W / 2 - 22, 742), fill=INK, width=3); d.line((W / 2 + 22, 742, W / 2 + 260, 742), fill=INK, width=3)
d.polygon([(W / 2, 730), (W / 2 + 12, 742), (W / 2, 754), (W / 2 - 12, 742)], fill=ACC)
d.text((W / 2, 820), 'History, told in ink', font=SF, fill=(70, 64, 58), anchor='ms')
# thin double rules framing the band (they read as a printed frieze; outside the band is TV-only)
for y in (BAND0 + 14, BAND0 + 22, BAND1 - 22, BAND1 - 14): d.line((40, y, W - 40, y), fill=(60, 55, 50), width=2 if y in (BAND0 + 14, BAND1 - 14) else 1)
canvas.save(os.path.join(D, 'banner.png'), optimize=True)
pv = canvas.copy(); dp = ImageDraw.Draw(pv)
dp.rectangle((507, 508, 2053, 931), outline=(0, 150, 255), width=6); dp.rectangle((0, 508, 2559, 931), outline=(0, 200, 120), width=4)
pv.resize((1280, 720), Image.LANCZOS).save(os.path.join(D, 'banner_preview.png'))
print('banner.png', canvas.size, os.path.getsize(os.path.join(D, 'banner.png')) // 1024, 'KB')
