import sys, os
from PIL import Image, ImageDraw
src, a, b, st, outp = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
idx = list(range(a, b + 1, st)); w, h = 384, 216; cols = 5; rows = (len(idx) + cols - 1) // cols
sh = Image.new('RGB', (cols * w, rows * h))
for i, k in enumerate(idx):
    im = Image.open(os.path.join(src, f'p_{k}.00.jpg')).resize((w, h)); d = ImageDraw.Draw(im); d.text((5, 4), f'{k} ({k/30:.2f}s)', fill=(255, 255, 0))
    sh.paste(im, ((i % cols) * w, (i // cols) * h))
sh.save(outp, quality=85)
