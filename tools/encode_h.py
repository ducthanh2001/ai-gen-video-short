"""Encode a folder of <prefix><t>.jpg frames → MP4 (libx264 + AAC) with PyAV, no ffmpeg executable needed.
Size comes from the first frame (16:9 or 9:16). Audio: a WAV if given, otherwise a soft synthetic projector whirr.
Audio is normalised to -14 LUFS (BS.1770, gated) with a -1.5 dBFS ceiling.
usage: python encode_h.py <frames_dir> <out.mp4> [wav] [--fps 24] [--prefix fr_]"""
import os, sys, glob, numpy as np, soundfile as sf, soxr, av
from PIL import Image
from scipy.signal import lfilter
args = sys.argv[1:]
def opt(k, d):
    if k in args: i = args.index(k); v = args[i + 1]; del args[i:i + 2]; return v
    return d
FPS, PREFIX = float(opt('--fps', 24)), opt('--prefix', 'fr_')
FRDIR, OUT = args[0], args[1]; WAV = args[2] if len(args) > 2 else None
SR = 48000

def lufs(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)
    blk, hop = int(.4 * SR), int(.1 * SR)
    ms = np.array([(y[i:i + blk] ** 2).mean(0).sum() for i in range(0, max(1, len(y) - blk), hop)])
    l = -0.691 + 10 * np.log10(np.maximum(ms, 1e-12))
    g = ms[l > -70]; rel = -0.691 + 10 * np.log10(g.mean()) - 10
    return -0.691 + 10 * np.log10(ms[(l > -70) & (l > rel)].mean())

frames = sorted(glob.glob(os.path.join(FRDIR, PREFIX + '*.jpg')), key=lambda f: float(os.path.basename(f)[len(PREFIX):-4]))
nf = len(frames); dur = nf / FPS; N = int(round(dur * SR))
W, H = Image.open(frames[0]).size

if WAV:
    a, sr = sf.read(WAV, dtype='float64', always_2d=True)
    if sr != SR: a = soxr.resample(a, sr, SR)
    if a.shape[1] == 1: a = np.repeat(a, 2, 1)
else:   # projector: filtered noise bed + a soft claw tick every frame
    rng = np.random.default_rng(3); n = rng.standard_normal(N)
    bed = lfilter([1], [1, -.97], n) * .02
    t = np.arange(N) / SR; tick = np.zeros(N)
    for k in range(int(dur * FPS)):
        i = int(k / FPS * SR); L = min(600, N - i); tick[i:i + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / 90) * .25
    tick = lfilter([1, -1], [1, -.6], tick)
    m = (bed + tick) * (.85 + .15 * np.sin(2 * np.pi * .7 * t))
    a = np.stack([m, np.roll(m, 37)], 1)
a = a[:N] if len(a) >= N else np.vstack([a, np.zeros((N - len(a), 2))])
fade = int(.3 * SR); a[:fade] *= np.linspace(0, 1, fade)[:, None]; a[-fade:] *= np.linspace(1, 0, fade)[:, None]
L0 = lufs(a); a *= 10 ** ((-14 - L0) / 20); ceil = 10 ** (-1.5 / 20); a = np.clip(a, -ceil, ceil)

c = av.open(OUT, 'w', options={'movflags': '+faststart'})
vs = c.add_stream('libx264', rate=int(FPS)); vs.width, vs.height, vs.pix_fmt = W, H, 'yuv420p'
vs.options = {'crf': '18', 'preset': 'medium', 'profile': 'high', 'colorprim': 'bt709', 'transfer': 'bt709', 'colormatrix': 'bt709'}
au = c.add_stream('aac', rate=SR); au.layout = 'stereo'; au.bit_rate = 192000
for i, f in enumerate(frames):
    fr = av.VideoFrame.from_image(Image.open(f).convert('RGB')); fr.pts = i
    for pk in vs.encode(fr): c.mux(pk)
for pk in vs.encode(): c.mux(pk)
pcm = a.T.astype(np.float32).copy()
for i in range(0, pcm.shape[1], 1024):
    af = av.AudioFrame.from_ndarray(np.ascontiguousarray(pcm[:, i:i + 1024]), format='fltp', layout='stereo'); af.sample_rate = SR; af.pts = i
    for pk in au.encode(af): c.mux(pk)
for pk in au.encode(): c.mux(pk)
c.close()
print(OUT, f'{W}x{H}, {nf} frames, {dur:.2f} s, {os.path.getsize(OUT) / 1e6:.1f} MB')
