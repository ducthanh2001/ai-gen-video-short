"""Thumbnail (1280x720) + style-frame review board for Ep 01. usage: python board.py <film_dir>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
D = sys.argv[1]; S = os.path.join(D, 'stills'); F = os.path.join(D, 'fonts')

def font(name, size, wght=None):
    f = ImageFont.truetype(os.path.join(F, name), size)
    if wght is not None:
        try: f.set_variation_by_axes([wght] if name != 'Inter.ttf' else [14, wght])
        except Exception:
            try: f.set_variation_by_axes([wght])
            except Exception: pass
    return f

# ——— thumbnail: carved lamp (left) vs bright modern light (right) ———
TW, TH = 1280, 720
th = Image.new('RGB', (TW, TH), '#f3ead8')
wc = Image.open(os.path.join(S, 'wc_babylon_bare_10.jpg')).convert('RGB').crop((240, 240, 1140, 1010)).resize((690, 590), Image.LANCZOS)
th.paste(wc, (0, 65))
d = ImageDraw.Draw(th)
d.rectangle([0, 0, 690, 64], fill='#141210'); d.rectangle([0, 655, 690, TH], fill='#141210')
# right: today's real desk render
td = Image.open(os.path.join(S, 'today_bare_1.jpg')).convert('RGB').crop((300, 0, 1900, 1080)).resize((590, 398), Image.LANCZOS)
d.rectangle([690, 0, TW, TH], fill='#16151c'); th.paste(td, (690, 64))
d = ImageDraw.Draw(th)
big = font('Inter.ttf', 120, 900); mid = font('Inter.ttf', 44, 700)
def outlined(xy, s, f, fill, stroke, w, anchor='mm'): d.text(xy, s, font=f, fill=fill, stroke_width=w, stroke_fill=stroke, anchor=anchor)
outlined((345, 560), '41½ HOURS', font('Inter.ttf', 108, 900), '#ffffff', '#141210', 8)
outlined((985, 560), '0.2 SEC', big, '#ff7a45', '#16151c', 6)
outlined((985, 640), 'TODAY', mid, '#f4efe6', '#16151c', 3)
outlined((345, 640), 'BABYLON', mid, '#E8742A', '#141210', 4)
th.save(os.path.join(D, 'thumbnail.jpg'), quality=92)

# ——— review board: 6 frames, 2 x 3, with captions ———
items = [
    ('house_1.jpg', '0:00 Mở đầu · các chồng đĩa: 1 đĩa = 1 giờ lao động'),
    ('wc_babylon_10.jpg', '1:05 Chương 1 · khắc gỗ · đèn dầu vừng Babylon'),
    ('eng_10.jpg', '2:05 Chương 2 · khắc đồng · ba loại đèn thập niên 1850'),
    ('sil_2.jpg', '3:20 Chương 3 · phim câm 1920s · phố lên đèn điện'),
    ('wc_sleep_10.jpg', '5:40 Hộp "Chuyện đồn" · khắc gỗ · giấc ngủ thứ nhất'),
    ('today_1.jpg', '6:40 HÔM NAY · đèn LED trên bàn học: 0,2 giây lao động'),
    ('thumb', 'Ảnh bìa YouTube (1280×720)'),
]
cw, ch, cap, pad = 900, 506, 56, 24
B = Image.new('RGB', (2 * cw + 3 * pad, 4 * (ch + cap) + 5 * pad + 70), '#1b1a20')
bd = ImageDraw.Draw(B); hf = font('Inter.ttf', 34, 700); cf = font('Inter.ttf', 26, 500)
bd.text((pad, 22), 'THE PRICE OF LIGHT · Ep 01 · style frames (duyệt hình)', font=hf, fill='#f2e6c8')
for i, (fn, label) in enumerate(items):
    x = pad + (i % 2) * (cw + pad); y = 70 + pad + (i // 2) * (ch + cap + pad)
    im = (th if fn == 'thumb' else Image.open(os.path.join(S, fn)).convert('RGB')).resize((cw, ch), Image.LANCZOS)
    B.paste(im, (x, y)); bd.rectangle([x, y + ch, x + cw, y + ch + cap], fill='#2a2834'); bd.text((x + 14, y + ch + 12), label, font=cf, fill='#ece6f8')
B.save(os.path.join(D, 'style-frames.jpg'), quality=90)
print('thumbnail.jpg', th.size, '· style-frames.jpg', B.size)
