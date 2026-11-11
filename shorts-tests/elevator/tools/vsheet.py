import sys, os, glob
from PIL import Image, ImageDraw
src, outp, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 9
fs = sorted(glob.glob(os.path.join(src, '*.jpg')), key=lambda f: float(os.path.basename(f).split('_')[1][:-4]))
if len(sys.argv) > 5: a, b = float(sys.argv[4]), float(sys.argv[5]); fs = [f for f in fs if a <= float(os.path.basename(f).split('_')[1][:-4]) <= b]
w, h = 216, 384; rows = (len(fs) + cols - 1) // cols
sh = Image.new('RGB', (cols * w, rows * h))
for i, f in enumerate(fs):
    im = Image.open(f).resize((w, h)); ImageDraw.Draw(im).text((4, 4), os.path.basename(f).split('_')[1][:-4], fill=(255, 255, 0)); sh.paste(im, ((i % cols) * w, (i // cols) * h))
sh.save(outp, quality=85)
