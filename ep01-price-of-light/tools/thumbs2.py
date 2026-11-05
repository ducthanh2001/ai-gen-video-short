"""Two more Ep 01 thumbnails built on an incongruity (1280×720):
D: a modern glowing bulb wearing a price tag "A WEEK OF WORK"  (what that much light cost before modern lighting)
E: a price line in free fall, "A WEEK" → "0.2 SEC", with the woodcut fire at the top and the bulb at the bottom
→ film/thumb_D.jpg, film/thumb_E.jpg, film/thumbs_compare2.jpg (B, C, D, E at full and phone size)"""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); F = os.path.join(EP, 'film')
def inter(sz, w):
    f = ImageFont.truetype(os.path.join(F, 'fonts', 'Inter.ttf'), sz)
    f.set_variation_by_axes([ax['default'] if ax['name'] != b'Weight' else w for ax in f.get_variation_axes()]); return f
W, H = 1280, 720
INK, CREAM, ORANGE, ACC = (20, 18, 16), (244, 239, 230), (255, 122, 56), (200, 80, 42)

def dark_bg(c0=(10, 9, 14), c1=(32, 26, 30)):
    yy, xx = np.mgrid[0:H, 0:W]; r = np.hypot(xx - W * .35, yy - H * .45) / 900
    a = np.clip(r, 0, 1)[..., None]; img = (np.array(c1) * (1 - a) + np.array(c0) * a)
    img += np.random.default_rng(1).normal(0, 2.2, img.shape); return img
def add_glow(img, cx, cy, r, color, strength):
    yy, xx = np.mgrid[0:H, 0:W]; d = np.hypot(xx - cx, yy - cy) / r
    g = np.exp(-d * d * 1.6)[..., None] * strength; return img + g * np.array(color)
def bulb(d, cx, cy, r, lit=True):
    glass = (255, 246, 214) if lit else (235, 230, 220)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=glass)
    d.polygon([(cx - r * .62, cy + r * .72), (cx + r * .62, cy + r * .72), (cx + r * .42, cy + r * 1.3), (cx - r * .42, cy + r * 1.3)], fill=glass)
    d.rectangle((cx - r * .44, cy + r * 1.3, cx + r * .44, cy + r * 1.95), fill=(150, 142, 130))
    for i in range(1, 5): d.line((cx - r * .44, cy + r * (1.3 + i * .13), cx + r * .44, cy + r * (1.3 + i * .13) - 6), fill=(90, 84, 76), width=4)
    d.polygon([(cx - r * .2, cy + r * 1.95), (cx + r * .2, cy + r * 1.95), (cx, cy + r * 2.12)], fill=(60, 56, 50))
    fil = [(cx - r * .3, cy + r * 1.05), (cx - r * .3, cy + r * .05)] + [(cx - r * .3 + i * r * .1, cy + r * (-.08 if i % 2 else .08)) for i in range(7)] + [(cx + r * .3, cy + r * 1.05)]
    d.line(fil, fill=(255, 150, 60) if lit else (120, 110, 100), width=max(3, int(r * .035)), joint='curve')
def txt(d, xy, s, f, fill, anchor='la', stroke=8): d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(8, 7, 6))

# —— D: the price tag on a bulb ——
img = dark_bg(); img = add_glow(img, 400, 330, 330, (255, 190, 110), 1.1); img = add_glow(img, 400, 330, 130, (255, 235, 190), .9)
D = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(D)
bulb(d, 400, 300, 150)
# string from the bulb's base to the tag
d.line([(452, 590), (540, 600), (632, 500)], fill=CREAM, width=4, joint='curve')
tag = Image.new('RGBA', (560, 330), (0, 0, 0, 0)); t = ImageDraw.Draw(tag)
t.polygon([(70, 20), (540, 20), (540, 310), (70, 310), (10, 165)], fill=(243, 237, 226, 255), outline=INK + (255,), width=6)
t.ellipse((40, 149, 70, 179), fill=INK + (255,))
t.text((306, 112), 'A WEEK', font=inter(94, 900), fill=INK, anchor='mm')
t.text((306, 214), 'OF WORK', font=inter(70, 800), fill=ACC, anchor='mm')
t.text((306, 276), 'the price of this light, long ago', font=inter(26, 600), fill=(80, 74, 66), anchor='mm')
tag = tag.rotate(-7, resample=Image.BICUBIC, expand=True); tag = tag.resize((int(tag.width * .9), int(tag.height * .9)), Image.LANCZOS)
sh = Image.new('RGBA', tag.size, (0, 0, 0, 0)); sh.putalpha(tag.getchannel('A').point(lambda v: v * .6)); sh = sh.filter(ImageFilter.GaussianBlur(12))
D.paste(sh, (618, 318), sh); D.paste(tag, (600, 300), tag)
d = ImageDraw.Draw(D)
txt(d, (1230, 60), 'TODAY: 0.2 SEC', inter(54, 900), ORANGE, 'ra', 7)
D.save(os.path.join(F, 'thumb_D.jpg'), quality=92)

# —— E: the price in free fall ——
img = dark_bg((8, 8, 10), (24, 22, 26))
E = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(E)
for i in range(1, 6): d.line((0, i * 120, W, i * 120), fill=(40, 38, 42), width=1)
fire = Image.open(os.path.join(F, 'stills', 'fire_bare_10.jpg')).convert('RGB').crop((560, 470, 1360, 1010)).resize((300, 202), Image.LANCZOS)
m = Image.new('L', fire.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, *fire.size), 18, fill=255)
E.paste(fire, (60, 60), m); d.rounded_rectangle((60, 60, 360, 262), 18, outline=CREAM, width=4)
# the falling line (log-like drop), thick, with a glow
pts = [(360 + (1180 - 360) * u, 160 + 470 * (1 - (1 - u) ** 3.2)) for u in np.linspace(0, 1, 80)]
glow = Image.new('RGB', (W, H)); ImageDraw.Draw(glow).line(pts, fill=(255, 110, 40), width=34, joint='curve'); glow = glow.filter(ImageFilter.GaussianBlur(18))
E = Image.fromarray(np.clip(np.asarray(E).astype(int) + np.asarray(glow).astype(int) * .55, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(E)
d.line(pts, fill=ORANGE, width=16, joint='curve')
x1, y1 = pts[-1]; d.polygon([(x1 + 40, y1 + 6), (x1 - 18, y1 - 30), (x1 - 26, y1 + 34)], fill=ORANGE)   # arrow head
bulb(d, 1205, 330, 40)
txt(d, (400, 70), 'A WEEK', inter(132, 900), CREAM)
txt(d, (1085, 560), '0.2 SEC', inter(112, 900), ORANGE, 'rs')
E.save(os.path.join(F, 'thumb_E.jpg'), quality=92)

# —— compare B, C, D, E ——
ims = [Image.open(os.path.join(F, f'thumb_{k}.jpg')) for k in 'BCDE']
cmp_ = Image.new('RGB', (4 * 480 + 60, 270 + 150 + 40), (240, 240, 240)); dc = ImageDraw.Draw(cmp_)
for i, im in enumerate(ims):
    cmp_.paste(im.resize((480, 270), Image.LANCZOS), (i * 500, 0)); cmp_.paste(im.resize((240, 135), Image.LANCZOS), (i * 500 + 120, 300))
    dc.text((i * 500 + 8, 278), 'BCDE'[i], font=inter(22, 800), fill=(20, 20, 20))
cmp_.save(os.path.join(F, 'thumbs_compare2.jpg'), quality=90)
print('ok')
