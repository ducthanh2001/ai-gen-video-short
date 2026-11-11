"""Clay & Myth banner: rebuild the Gemini frieze into YouTube's 2560x1440 banner.
Safe area for all devices: 1546x423 centred (x 507..2053, y 508..932).
Run: python make_banner.py   (needs Pillow + numpy)
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = Path(__file__).parent
SRC = HERE / "source" / "banner-gemini-original.png"
FONTS = Path("C:/Users/PC/kenh-youtube/ep01-price-of-light/film/fonts")
W, H = 2560, 1440
BLACK = (20, 16, 16); ORANGE = (196, 99, 41); CREAM = (242, 227, 198)
SAFE_X0, SAFE_X1, SAFE_Y0, SAFE_Y1 = 507, 2053, 508, 932
STRIP_TOP = (512, 556); STRIP_BOT = (884, 928)      # meander strips inside the safe band
ORANGE_Y = (456, 984)                                # orange field; black outside (TV only)
SCALE = 0.795

rng = np.random.default_rng(7)
src = Image.open(SRC).convert("RGB")

# 1. canvas: black, orange field with a little clay grain
canvas = np.zeros((H, W, 3), np.float32); canvas[:] = BLACK
oy0, oy1 = ORANGE_Y
grain = rng.normal(0, 1.7, (oy1 - oy0, W, 1)).astype(np.float32)
canvas[oy0:oy1] = np.array(ORANGE, np.float32) + grain
img = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8))
d = ImageDraw.Draw(img)
d.rectangle((0, oy0, W, oy0 + 3), fill=CREAM); d.rectangle((0, oy1 - 4, W, oy1 - 1), fill=CREAM)

# 2. sprites: cut the figure groups, alpha = distance from the clay orange
def sprite(box):
    c = src.crop(box)
    a = np.asarray(c, np.float32)
    dist = np.sqrt(((a - np.array(ORANGE, np.float32)) ** 2).sum(-1))
    alpha = np.clip((dist - 25) / 50, 0, 1)
    rgba = np.dstack([a, alpha * 255]).astype(np.uint8)
    s = Image.fromarray(rgba, "RGBA")
    return s.resize((round(s.width * SCALE), round(s.height * SCALE)), Image.LANCZOS)

SY0 = 185          # source y where the crops start
CUT = 606          # source y where the crops end (below the feet, above the old border)
left = sprite((0, SY0, 560, CUT))
right = sprite((930, SY0, 1376, CUT))
sprite_top = STRIP_TOP[1] - round(10 * SCALE) + 6   # sink the feet under the bottom strip so the old border remnant is hidden
img.paste(left, (0, sprite_top), left)
img.paste(right, (W - right.width, sprite_top), right)

# 3. meander strips (drawn at 4x then downsampled)
def meander(width, height):
    k = 4
    s = Image.new("RGB", (width * k, height * k), ORANGE)
    g = ImageDraw.Draw(s)
    line = 4 * k
    g.rectangle((0, 0, width * k, line), fill=BLACK)
    g.rectangle((0, height * k - line, width * k, height * k), fill=BLACK)
    inner_top, inner_bot = line + 3 * k, height * k - line - 3 * k
    u = (inner_bot - inner_top) / 5.0
    t = max(3 * k, round(u * 0.5))
    unit = 6 * u
    x = u * 0.5
    while x < width * k + unit:
        pts = [(0, 5), (0, 0), (5, 0), (5, 4), (2, 4), (2, 2), (3, 2)]
        pts = [(x + px * u, inner_top + py * u) for px, py in pts]
        g.line(pts, fill=BLACK, width=t, joint="curve")
        g.line([(x - u, inner_bot), (x + 0, inner_bot)], fill=BLACK, width=t)   # baseline link
        x += unit
    return s.resize((width, height), Image.LANCZOS)

for (y0, y1) in (STRIP_TOP, STRIP_BOT):
    img.paste(meander(W, y1 - y0), (0, y0))

# 4. plaque with the channel name
PX0, PX1, PY0, PY1 = 640, 1920, 572, 868
d = ImageDraw.Draw(img)
d.rectangle((PX0, PY0, PX1, PY1), fill=BLACK)
d.rectangle((PX0 + 10, PY0 + 10, PX1 - 10, PY1 - 10), outline=CREAM, width=2)

def tracked(text, font, tracking):
    ws = [d.textlength(ch, font=font) for ch in text]
    return ws, sum(ws) + tracking * (len(text) - 1)

title = "CLAY & MYTH"
fs = 168
while True:
    ft = ImageFont.truetype(str(FONTS / "PlayfairDisplaySC-Black.ttf"), fs)
    ws, total = tracked(title, ft, 10)
    if total <= 1040: break
    fs -= 4
cx = W / 2
x = cx - total / 2
asc, desc = ft.getmetrics()
ty = 600
for ch, w in zip(title, ws):
    d.text((x, ty), ch, font=ft, fill=CREAM); x += w + 10
title_bottom = ty + asc

# divider with a small diamond
dy = title_bottom + 22
d.line((cx - 170, dy, cx - 16, dy), fill=CREAM, width=2); d.line((cx + 16, dy, cx + 170, dy), fill=CREAM, width=2)
d.polygon([(cx, dy - 8), (cx + 8, dy), (cx, dy + 8), (cx - 8, dy)], fill=CREAM)

tag = "Greek myths, told from the objects that survived."
fsz = 52
while True:
    fg = ImageFont.truetype(str(FONTS / "OldStandard-Italic.ttf"), fsz)
    tw = d.textlength(tag, font=fg)
    if tw <= 1040: break
    fsz -= 2
d.text((cx - tw / 2, dy + 22), tag, font=fg, fill=CREAM)

img.save(HERE / "banner-2560x1440.png", optimize=True)
img.convert("RGB").save(HERE / "banner-2560x1440.jpg", quality=95)

# 5. previews: what each device shows
prev = img.copy(); pd = ImageDraw.Draw(prev)
pd.rectangle((0, SAFE_Y0, W - 1, SAFE_Y1), outline=(0, 200, 255), width=4)
pd.rectangle((SAFE_X0, SAFE_Y0, SAFE_X1, SAFE_Y1), outline=(255, 255, 0), width=4)
prev.resize((1280, 720)).save(HERE / "preview-safe-areas.png")
img.crop((0, SAFE_Y0, W, SAFE_Y1)).save(HERE / "preview-desktop.png")
img.crop((SAFE_X0, SAFE_Y0, SAFE_X1, SAFE_Y1)).save(HERE / "preview-mobile.png")
print("title font", fs, "tagline font", fsz, "title width", round(total), "tag width", round(tw))
