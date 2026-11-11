"""Engine cutaway demo: sound design + motion-blur average + encode (numpy, scipy, PyAV; no ffmpeg).
usage: python build.py            (reads ../sub/s_<8k+j>.jpg, writes ../engine-cutaway-demo.mp4)
Timing mirrors film/index.html: TL (fast 0-1.4, slow-down 1.4-2.2, one 720-degree cycle at 144 deg/s 2.2-7.2, speed-up 7.2-8).
"""
import math, os
import numpy as np
import av
from PIL import Image
from scipy.signal import lfilter, butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FPS, SR, DUR, SUB = 30, 48000, 8.0, 4
L = int(DUR * SR); t = np.arange(L) / SR
rng = np.random.default_rng(11)
FAST_END, SLOW_START, SLOW_END, W1 = 1.4, 2.2, 7.2, 144.0
W0 = (720 * 4 - W1 * .8) / 2.2
T = lambda deg: SLOW_START + deg / W1           # crank degrees in the slow cycle -> seconds


def omega(x):                                   # crank speed, deg/s (same piecewise-linear ramps as the film)
    if x < FAST_END: return W0
    if x < SLOW_START: return W0 + (W1 - W0) * (x - FAST_END) / (SLOW_START - FAST_END)
    if x <= SLOW_END: return W1
    return W1 + (W0 - W1) * (x - SLOW_END) / (DUR - SLOW_END)


bus = {k: np.zeros((2, L), np.float32) for k in ('engine', 'fx', 'bed')}


def add(name, buf, at, gain=1.0, pan=0.0):
    i = int(round(at * SR));
    if i >= L: return
    j = max(0, -i); i = max(0, i); seg = buf[j:j + L - i]
    lg, rg = math.cos((pan + 1) * math.pi / 4) * 1.414, math.sin((pan + 1) * math.pi / 4) * 1.414
    bus[name][0, i:i + len(seg)] += seg * gain * lg; bus[name][1, i:i + len(seg)] += seg * gain * rg


def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x).astype(np.float32)
def lpf(x, fc, order=2): return sosfilt(butter(order, fc, 'lowpass', fs=SR, output='sos'), x).astype(np.float32)
def hpf(x, fc, order=2): return sosfilt(butter(order, fc, 'highpass', fs=SR, output='sos'), x).astype(np.float32)
def noise(n): return rng.normal(0, 1, n).astype(np.float32)
def env(n, a, d): u = np.arange(n) / SR; return (np.minimum(1, u / max(a, 1e-4)) * np.exp(-u / d)).astype(np.float32)


# ------------------------------------------------------------------ the running engine: a 4-cylinder at 3,000 rpm fires 100 times a second
w = np.array([omega(x) for x in t], np.float32)
k = w / W0                                         # 1 = real-time feel, ~0.11 in the slow cycle
f_fire = 100.0 * k                                 # firing frequency follows the crank speed (tape-stop / spin-up)
ph = np.cumsum(f_fire) / SR; fr = ph % 1.0
amp = 1 + .25 * np.sin(2 * np.pi * ph / 4 * 1.0) + .15 * rng.normal(0, 1, int(ph[-1]) + 2)[ph.astype(int)]
pulse = (np.exp(-fr * 7) - .2) * amp
comb = noise(L) * np.exp(-fr * 5) * .5
eng = lpf(pulse + comb, 900) + .35 * bp(noise(L) * np.exp(-fr * 3), 300, 2400)
level = np.clip((k - .12) / .3, 0, 1) ** 1.3       # fades out as it slows into the slow cycle, back in for the loop
eng = hpf(eng, 35) * level
add('engine', eng * .5, 0)

# ------------------------------------------------------------------ the bed: a low drone for the slow cycle, room tone throughout
slow_in = np.clip((t - 1.5) / .8, 0, 1) * np.clip((DUR - .2 - t) / .7, 0, 1)
drone = (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.5 * t + 1) + .25 * np.sin(2 * np.pi * 110.3 * t)) * .22
drone += lpf(noise(L), 200) * .5
add('bed', drone * slow_in, 0)
add('bed', lpf(noise(L), 1200) * .05, 0)

# tape-stop whoosh into slow motion, and the riser back out (the loop)
n = int(1.0 * SR); u = np.arange(n) / SR
dn = bp(noise(n), 200, 3000) * np.sin(np.pi * u / 1.0) ** 2 * np.exp(-u * 1.5)
add('fx', dn * .5, 1.35)
n = int(.85 * SR); u = np.arange(n) / SR
up = bp(noise(n), 400, 6000) * (u / .85) ** 2.5
add('fx', up * .6, 7.15)


# ------------------------------------------------------------------ the slow cycle, event by event
def clack(f=1800, d=.06, g=1.0):                 # a valve seating: a metallic tick on a dull knock
    n = int(.35 * SR); u = np.arange(n) / SR
    m = sum(a * np.sin(2 * np.pi * f * r * u) * np.exp(-u / (d * dd)) for r, a, dd in ((1, 1, 1), (2.7, .5, .6), (5.1, .25, .35)))
    knock = np.sin(2 * np.pi * 140 * u) * np.exp(-u / .03)
    return ((m * .5 + knock * .8 + noise(n) * np.exp(-u / .003) * .5) * g).astype(np.float32)


# intake: air rushing in while the intake valve is open (-10..230 deg), swelling with the valve lift
a0, a1 = T(-10), T(230); n = int((a1 - a0) * SR); u = np.linspace(0, 1, n)
lift = np.sin(np.pi * u) ** 2
suck = bp(noise(n), 500, 4000) * lift * .9 + bp(noise(n), 150, 600) * lift * .5
add('fx', suck, a0, .55, -.35)
add('fx', clack(1500, .05, .8), T(230), .7, -.3)                       # intake valve closes

# compression: a rising strain
a0, a1 = T(232), T(345); n = int((a1 - a0) * SR); u = np.linspace(0, 1, n)
fq = 90 + 170 * u ** 1.5; strain = np.sin(2 * np.pi * np.cumsum(fq) / SR) * u ** 2 * .5 + bp(noise(n), 800, 3000) * u ** 3 * .25
add('fx', strain, a0, .6)

# spark: three crackles
for i, d in enumerate((345, 347.5, 350)):
    n = int(.05 * SR); u = np.arange(n) / SR
    zap = hpf(noise(n), 2500) * np.exp(-u / .008) + np.sin(2 * np.pi * 6200 * u) * np.exp(-u / .01) * .4
    add('fx', zap, T(d), .9 - i * .2, .05)

# combustion: the loudest moment, a deep boom with a pitch drop and a long tail
n = int(1.8 * SR); u = np.arange(n) / SR
boom = np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-u * 9)) / SR) * np.exp(-u / .45) * 1.2
crack = lpf(noise(n), 2200) * np.exp(-u / .05) * 1.1
roar = lpf(noise(n), 500) * np.exp(-u / .5) * np.minimum(1, u / .03) * .8
add('fx', boom + crack + roar, T(352), 1.0)

# exhaust: the valve cracks open with a pop, then the burnt gas rushes out
add('fx', clack(1300, .06, .9), T(490), .8, .3)
n = int(.25 * SR); u = np.arange(n) / SR
add('fx', lpf(noise(n), 1500) * np.exp(-u / .06) * 1.2, T(492), .7, .35)
a0, a1 = T(492), T(730); n = int((a1 - a0) * SR); u = np.linspace(0, 1, n)
rush = (bp(noise(n), 120, 900) * .9 + bp(noise(n), 900, 3500) * .35) * np.sin(np.pi * u) ** 1.5 * (1 - .4 * u)
add('fx', rush, a0, .6, .4)
add('fx', clack(1700, .05, .6), T(710), .5, -.3)                       # intake opens for the next cycle

# a soft UI tick on each stroke change
for s in (1, 2, 3):
    n = int(.12 * SR); u = np.arange(n) / SR
    add('fx', np.sin(2 * np.pi * 2400 * u) * np.exp(-u / .02) * .25, T(180 * s))

# ------------------------------------------------------------------ master
mix = bus['engine'] * 1.0 + bus['bed'] * .55 + bus['fx'] * .8


def lufs(x):
    k = [lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, .73248077421585], ch) for ch in x]
    k = [lfilter([1., -2., 1.], [1, -1.99004745483398, .99007225036621], ch) for ch in k]
    blk, hop = int(.4 * SR), int(.1 * SR)
    z = np.array([sum(np.mean(ch[i:i + blk] ** 2) for ch in k) for i in range(0, len(k[0]) - blk, hop)])
    lk = -.691 + 10 * np.log10(z + 1e-12)
    z1 = z[lk > -70]; rel = -.691 + 10 * np.log10(z1.mean()) - 10
    return -.691 + 10 * np.log10(z[lk > rel].mean())


for _ in range(3):
    mix *= 10 ** ((-14 - lufs(mix)) / 20)
    mix = np.tanh(mix / .89) * .89
print(f"master: {lufs(mix):.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS")

# ------------------------------------------------------------------ picture: average 4 subframes per frame (motion blur), encode
OUT = os.path.join(ROOT, 'engine-cutaway-demo.mp4')
nfr = int(DUR * FPS)
c = av.open(OUT, 'w', options={'movflags': '+faststart'})
vs = c.add_stream('libx264', rate=FPS); vs.width, vs.height, vs.pix_fmt = 1080, 1920, 'yuv420p'
vs.options = {'crf': '17', 'preset': 'medium', 'profile': 'high', 'colorprim': 'bt709', 'transfer': 'bt709', 'colormatrix': 'bt709'}
au = c.add_stream('aac', rate=SR); au.layout = 'stereo'; au.bit_rate = 192000
for fi in range(nfr):
    acc = None
    for j in range(SUB):
        a = np.asarray(Image.open(os.path.join(ROOT, 'sub', f's_{8 * fi + j}.jpg')).convert('RGB'), np.float32)
        acc = a if acc is None else acc + a
    im = Image.fromarray(np.clip(acc / SUB + .5, 0, 255).astype(np.uint8))
    fr = av.VideoFrame.from_image(im); fr.pts = fi
    for pk in vs.encode(fr): c.mux(pk)
for pk in vs.encode(): c.mux(pk)
pcm = mix[:, :int(nfr / FPS * SR)].astype(np.float32).copy()
for i in range(0, pcm.shape[1], 1024):
    af = av.AudioFrame.from_ndarray(np.ascontiguousarray(pcm[:, i:i + 1024]), format='fltp', layout='stereo'); af.sample_rate = SR; af.pts = i
    for pk in au.encode(af): c.mux(pk)
for pk in au.encode(): c.mux(pk)
c.close()
print(f"{OUT}: {nfr} frames, {nfr / FPS:.1f} s, {os.path.getsize(OUT) / 1e6:.1f} MB")
