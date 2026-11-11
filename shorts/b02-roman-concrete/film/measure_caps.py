"""Measure the caption block on the final video: frame from the mp4 vs the same frame rendered without captions (nocap=1).
usage: python measure_caps.py <video.mp4>   (needs numpy; run with the anime venv python)"""
import os, sys, json, subprocess, numpy as np
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = r'C:\Users\PC\ffmpeg\bin\ffmpeg.exe'; CAP = r'C:\Users\PC\.claude\skills\cinecode\scripts\capture.mjs'
vid = sys.argv[1]; W, H = 1080, 1920
TL = json.load(open(os.path.join(EP, 'film', 'timeline.json')))
caps = TL['caps']; sel = caps[3::6][:14]
frames = [int((c['t0'] + min(0.15, (c['t1'] - c['t0']) / 2)) * 30) for c in sel]
out = os.path.join(EP, 'renders', '_nocap'); os.makedirs(out, exist_ok=True)
subprocess.run(['node', CAP, '--url', os.path.join(EP, 'film', 'index.html'), '--out', out, '--frames', ','.join(map(str, frames)), '--format', 'png', '--params', f'w={W}&h={H}&nocap=1', '--fresh'], check=True, capture_output=True)
def gray(src, vf=None):
    cmd = [FF, '-loglevel', 'error', '-i', src] + (['-vf', vf] if vf else []) + ['-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'gray', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.uint8).reshape(H, W).astype(int)
res = []
for f, c in zip(frames, sel):
    a = gray(vid, f'select=eq(n\\,{f})'); b = gray(os.path.join(out, f'{f:06d}.png'))
    d = np.abs(a - b) > 70
    rows = np.where(d.sum(1) > 6)[0]; cols = np.where(d.sum(0) > 6)[0]
    if len(rows) == 0: continue
    r0, r1, c0, c1 = rows.min(), rows.max(), cols.min(), cols.max()
    res.append((f, ' '.join(w['t'] for w in c['w']), r0 / H, r1 / H, (r0 + r1) / 2 / H, c0 / W, c1 / W))
    print(f'frame {f:5d} {res[-1][1]:16s} top {r0 / H:.3f} bottom {r1 / H:.3f} centre {res[-1][4]:.3f} x {c0 / W:.3f}-{c1 / W:.3f}')
print('median centre', round(float(np.median([r[4] for r in res])), 3), 'max bottom', round(max(r[3] for r in res), 3), 'min x', round(min(r[5] for r in res), 3), 'max x', round(max(r[6] for r in res), 3))
