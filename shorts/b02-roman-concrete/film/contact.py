"""contact sheet: one frame per shot from renders/frames (or any dir given as argv[1]); writes renders/b02-roman-concrete-contact-sheet.png"""
import json, subprocess, sys, os
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = r'C:\Users\PC\ffmpeg\bin\ffmpeg.exe'
D = sys.argv[1] if len(sys.argv) > 1 else os.path.join(EP, 'renders', 'frames')
TL = json.load(open(os.path.join(EP, 'film', 'timeline.json'))); SH = json.load(open(os.path.join(EP, 'film', 'shots.json')))
ends = [s[1] for s in SH[1:]] + [TL['total']]
fr = [int((a + (b - a) * .55) * 30) for (n, a), b in zip(SH, ends)]
fr += [fr[-1]] * (24 - len(fr))
rows = []
for r in range(4):
    ins = []
    for f in fr[r * 6:(r + 1) * 6]: ins += ['-i', os.path.join(D, f'{f:06d}.jpg')]
    out = os.path.join(EP, 'renders', f'_row{r}.png'); subprocess.run([FF, '-y', '-loglevel', 'error'] + ins + ['-filter_complex', 'hstack=inputs=6', out], check=True); rows.append(out)
subprocess.run([FF, '-y', '-loglevel', 'error'] + sum([['-i', r] for r in rows], []) + ['-filter_complex', 'vstack=inputs=4,scale=1800:-1', os.path.join(EP, 'renders', sys.argv[2] if len(sys.argv) > 2 else 'b02-roman-concrete-contact-sheet.png')], check=True)
for r in rows: os.remove(r)
print(fr)
