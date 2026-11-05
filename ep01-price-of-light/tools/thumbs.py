"""Alternative thumbnails for Ep 01 (1280×720) → film/thumb_B.jpg, film/thumb_C.jpg, film/thumbs_compare.jpg
B: split — people by a woodcut fire, "A WEEK of work"  |  today's LED desk, "0.2 SEC"
C: one image — the woodcut fire scene with a big hanging price tag: "1 WEEK OF WORK" (today: 0.2 sec)
Both claims hold: early humans' fire ≈ 58 h and Babylon ≈ 41.5 h, i.e. more than a 40-hour working week (FACTS.md §A1)."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); F = os.path.join(EP, 'film')
FONT = os.path.join(F, 'fonts', 'Inter.ttf')
def inter(sz, w):
    f = ImageFont.truetype(FONT, sz); f.set_variation_by_axes([ax['default'] if ax['name'] != b'Weight' else w for ax in f.get_variation_axes()]); return f
fire = Image.open(os.path.join(F, 'stills', 'fire_bare_10.jpg')).convert('RGB')
desk = Image.open(os.path.join(F, 'stills', 'today_bare_1.jpg')).convert('RGB')
W, H, ORANGE, CREAM = 1280, 720, (255, 122, 56), (244, 239, 230)
def txt(d, xy, s, f, fill, anchor='la', stroke=8):
    d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(10, 9, 8))

# —— B: split ——
B = Image.new('RGB', (W, H))
L = fire.crop((300, 210, 1000, 1010)).resize((704, 720), Image.LANCZOS)
R = desk.crop((250, 90, 1010, 1040)).resize((576, 720), Image.LANCZOS)
R = ImageEnhance.Brightness(R).enhance(1.12)
B.paste(L, (0, 0)); B.paste(R, (704, 0))
d = ImageDraw.Draw(B)
d.rectangle((700, 0, 707, H), fill=ORANGE)
txt(d, (34, 22), 'A WEEK', inter(150, 900), CREAM)
txt(d, (512, 190), 'of work', inter(56, 800), CREAM, 'ra', stroke=6)
txt(d, (992, 560), '0.2 SEC', inter(118, 900), ORANGE, 'ma')
txt(d, (992, 488), 'today', inter(52, 800), CREAM, 'ma', stroke=6)
B.save(os.path.join(F, 'thumb_B.jpg'), quality=92)

# —— C: one scene + a price tag ——
C = fire.crop((72, 330, 1262, 999)).resize((W, H), Image.LANCZOS)
tag = Image.new('RGBA', (560, 330), (0, 0, 0, 0)); t = ImageDraw.Draw(tag)
t.polygon([(70, 20), (540, 20), (540, 310), (70, 310), (10, 165)], fill=(243, 237, 226, 255), outline=(20, 18, 16, 255), width=6)
t.ellipse((44, 148, 76, 180), fill=(20, 18, 16, 255))
t.text((330, 118), '1 WEEK', font=inter(100, 900), fill=(20, 18, 16), anchor='mm')
t.text((330, 218), 'OF WORK', font=inter(64, 800), fill=(200, 80, 42), anchor='mm')
t.text((330, 278), 'for 1 hour of light', font=inter(30, 600), fill=(70, 64, 58), anchor='mm')
tag = tag.rotate(8, resample=Image.BICUBIC, expand=True); tag = tag.resize((int(tag.width * .74), int(tag.height * .74)), Image.LANCZOS)
sh = Image.new('RGBA', tag.size, (0, 0, 0, 0)); sh.putalpha(tag.getchannel('A').point(lambda v: v * .55)); sh = sh.filter(ImageFilter.GaussianBlur(10))
d = ImageDraw.Draw(C)
d.line((885, -10, 875, 40), fill=CREAM, width=5)                                  # the string
C.paste(sh, (840 + 14, 6 + 18), sh); C.paste(tag, (840, 6), tag)
txt(d, (1240, 640), 'TODAY: 0.2 SEC', inter(58, 900), ORANGE, 'ra', stroke=7)
C.save(os.path.join(F, 'thumb_C.jpg'), quality=92)

# —— side-by-side, plus how they look small (YouTube home on a phone ≈ 360 px wide) ——
A = Image.open(os.path.join(F, 'thumbnail.jpg')).convert('RGB')
cmp_ = Image.new('RGB', (3 * 640 + 40, 360 + 200 + 30), (240, 240, 240))
for i, im in enumerate([A, B, C]):
    cmp_.paste(im.resize((640, 360), Image.LANCZOS), (i * 660, 0))
    cmp_.paste(im.resize((320, 180), Image.LANCZOS), (i * 660 + 160, 390))
    ImageDraw.Draw(cmp_).text((i * 660 + 10, 370), 'ABC'[i], font=inter(26, 800), fill=(20, 20, 20))
cmp_.save(os.path.join(F, 'thumbs_compare.jpg'), quality=90)
print('ok')
