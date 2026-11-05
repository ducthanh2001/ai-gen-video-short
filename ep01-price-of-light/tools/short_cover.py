"""Vertical cover (1080×1920) for Short 1 "Light used to cost a WEEK of work": the bulb with the price tag (thumbnail D, re-laid for 9:16).
Text sits inside the area Shorts never covers (title/buttons overlay the bottom ~25% and the right edge). → shorts/short1-cover.jpg"""
import os, sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); F = os.path.join(EP, 'film')
def inter(sz, w):
    f = ImageFont.truetype(os.path.join(F, 'fonts', 'Inter.ttf'), sz)
    f.set_variation_by_axes([ax['default'] if ax['name'] != b'Weight' else w for ax in f.get_variation_axes()]); return f
W, H = 1080, 1920
INK, CREAM, ORANGE, ACC = (20, 18, 16), (244, 239, 230), (255, 122, 56), (200, 80, 42)
yy, xx = np.mgrid[0:H, 0:W]
img = np.ones((H, W, 3)) * np.array([12, 11, 15]); img += np.random.default_rng(2).normal(0, 2.2, img.shape)
def glow(cx, cy, r, col, s):
    global img; d = np.hypot(xx - cx, yy - cy) / r; img = img + np.exp(-d * d * 1.6)[..., None] * s * np.array(col)
CX, CY, R = 540, 600, 165
glow(CX, CY, 460, (255, 190, 110), 1.0); glow(CX, CY, 180, (255, 235, 190), .9)
im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
glass = (255, 246, 214)
d.ellipse((CX - R, CY - R, CX + R, CY + R), fill=glass)
d.polygon([(CX - R * .62, CY + R * .72), (CX + R * .62, CY + R * .72), (CX + R * .42, CY + R * 1.3), (CX - R * .42, CY + R * 1.3)], fill=glass)
d.rectangle((CX - R * .44, CY + R * 1.3, CX + R * .44, CY + R * 1.95), fill=(150, 142, 130))
for i in range(1, 5): d.line((CX - R * .44, CY + R * (1.3 + i * .13), CX + R * .44, CY + R * (1.3 + i * .13) - 8), fill=(90, 84, 76), width=5)
d.polygon([(CX - R * .2, CY + R * 1.95), (CX + R * .2, CY + R * 1.95), (CX, CY + R * 2.12)], fill=(60, 56, 50))
fil = [(CX - R * .3, CY + R * 1.05), (CX - R * .3, CY + R * .05)] + [(CX - R * .3 + i * R * .1, CY + R * (-.08 if i % 2 else .08)) for i in range(7)] + [(CX + R * .3, CY + R * 1.05)]
d.line(fil, fill=(255, 150, 60), width=8, joint='curve')
def txt(xy, s, f, fill, anchor='ma', stroke=9): d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(8, 7, 6))
txt((W / 2, 130), 'LIGHT USED', inter(118, 900), CREAM)
txt((W / 2, 255), 'TO COST', inter(118, 900), CREAM)
# the tag, hanging from the bulb's base
tag = Image.new('RGBA', (640, 380), (0, 0, 0, 0)); t = ImageDraw.Draw(tag)
t.polygon([(80, 22), (620, 22), (620, 358), (80, 358), (12, 190)], fill=(243, 237, 226, 255), outline=INK + (255,), width=7)
t.ellipse((46, 172, 82, 208), fill=INK + (255,))
t.text((356, 132), 'A WEEK', font=inter(110, 900), fill=INK, anchor='mm')
t.text((356, 250), 'OF WORK', font=inter(80, 800), fill=ACC, anchor='mm')
tag = tag.rotate(-6, resample=Image.BICUBIC, expand=True); tag = tag.resize((int(tag.width * .9), int(tag.height * .9)), Image.LANCZOS)
sh = Image.new('RGBA', tag.size, (0, 0, 0, 0)); sh.putalpha(tag.getchannel('A').point(lambda v: v * .6)); sh = sh.filter(ImageFilter.GaussianBlur(14))
d.line([(CX, CY + R * 2.1), (CX - 20, 1010), (CX - 150, 1050)], fill=CREAM, width=5, joint='curve')
TX, TY = 170, 990
im.paste(sh, (TX + 18, TY + 22), sh); im.paste(tag, (TX, TY), tag)
d = ImageDraw.Draw(im)
txt((W / 2, 1385), 'TODAY: 0.2 SEC', inter(84, 900), ORANGE)
out = os.path.join(EP, 'shorts', 'short1-cover.jpg'); im.save(out, quality=92)
pv = im.copy(); dp = ImageDraw.Draw(pv)   # preview: the zones the Shorts player covers
dp.rectangle((0, int(H * .78), W, H), outline=(0, 160, 255), width=6); dp.rectangle((int(W * .86), int(H * .45), W, H), outline=(0, 160, 255), width=6)
pv.resize((540, 960)).save(os.path.join(EP, 'shorts', 'short1-cover_preview.jpg'))
print(out)
