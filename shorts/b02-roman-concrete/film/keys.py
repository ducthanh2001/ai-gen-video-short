"""Key stills: one frame per shot (at fraction F of the shot, default 0.55) rendered at W x H, tiled 5 per row.
usage: python keys.py [out.png] [W] [H] [F] [extra params]   frames dir: renders/keys (or reuse renders/frames_final with --from DIR)"""
import os, sys, json, subprocess
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = r'C:\Users\PC\ffmpeg\bin\ffmpeg.exe'; CAP = r'C:\Users\PC\.claude\skills\cinecode\scripts\capture.mjs'
args = [a for a in sys.argv[1:] if not a.startswith('--')]; src = None
if '--from' in sys.argv: src = sys.argv[sys.argv.index('--from') + 1]; args = [a for a in args if a != src]
out = args[0] if args else os.path.join(EP, 'renders', 'keys.png'); W = int(args[1]) if len(args) > 1 else 540; H = int(args[2]) if len(args) > 2 else 960
Fr = float(args[3]) if len(args) > 3 else 0.55; extra = args[4] if len(args) > 4 else ''
TL = json.load(open(os.path.join(EP, 'film', 'timeline.json')))
starts = sorted(v for k, v in TL['cuts'].items() if k.startswith('s') and k[1].isdigit()); ends = starts[1:] + [TL['total']]
fr = [int((a + (b - a) * Fr) * 30) for a, b in zip(starts, ends)]
d = src or os.path.join(EP, 'renders', 'keys')
if not src:
    subprocess.run(['node', CAP, '--url', os.path.join(EP, 'film', 'index.html'), '--out', d, '--frames', ','.join(map(str, fr)), '--format', 'jpeg', '--quality', '0.9', '--params', f'w={W}&h={H}' + extra, '--fresh'], check=True)
ext = 'jpg'
ins = []; n = len(fr); cols = 5; rows = (n + cols - 1) // cols
for f in fr + [fr[-1]] * (rows * cols - n): ins += ['-i', os.path.join(d, f'{f:06d}.{ext}')]
lay = '|'.join(f'{(i % cols)}*w0_{(i // cols)}*h0'.replace('*w0', '*w0').replace('0*w0', '0').replace('_0*h0', '_0') for i in range(rows * cols))
lay = '|'.join(f"{'+'.join(['w0'] * (i % cols)) or '0'}_{'+'.join(['h0'] * (i // cols)) or '0'}" for i in range(rows * cols))
subprocess.run([FF, '-y', '-loglevel', 'error'] + ins + ['-filter_complex', f'xstack=inputs={rows * cols}:layout={lay},scale=1800:-1', out], check=True)
print(out, fr)
