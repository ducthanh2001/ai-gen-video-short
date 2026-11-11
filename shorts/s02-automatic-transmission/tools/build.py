"""Short 02 'Automatic transmission, cut in half': voice + music + foley mix (-14 LUFS), SRT, motion-blur average and encode.
usage: python build.py      (anime-hair-colors venv: numpy, scipy, soxr, soundfile, av, Pillow)
Times mirror film/index.html (TL).
"""
import json, math, os
import numpy as np, soundfile as sf, soxr, av
from PIL import Image
from scipy.signal import lfilter, butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FPS, SR, DUR, SUB = 30, 48000, 39.0, 4
L = int(DUR * SR); t = np.arange(L) / SR
rng = np.random.default_rng(5)
VO = {'h1': .25, 'h2': 4.45, 'a1': 6.6, 'a2': 9.05, 'a3': 13.3, 'b1': 16.3, 'b2': 19.5, 'b3': 23.3, 'b4': 26.0, 'c1': 30.0, 'c2': 34.2}
STOP0, STOP1, LIFT0, BACK0, LOW, DIRECT, REV, END = 13.0, 15.4, 15.8, 28.9, 19.7, 23.3, 26.0, 37.5
CLUTCH, TAGS = [30.6, 31.4, 32.2, 33.0], [34.5, 34.9, 35.3, 35.7]
bus = {k: np.zeros((2, L), np.float32) for k in ('voice', 'music', 'fx')}


def add(name, buf, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= L: return
    j = max(0, -i); i = max(0, i); seg = np.asarray(buf, np.float32)[j:j + L - i]
    lg, rg = math.cos((pan + 1) * math.pi / 4) * 1.414, math.sin((pan + 1) * math.pi / 4) * 1.414
    bus[name][0, i:i + len(seg)] += seg * gain * lg; bus[name][1, i:i + len(seg)] += seg * gain * rg


def sos(kind, f, x, order=2): return sosfilt(butter(order, f, kind, fs=SR, output='sos'), x).astype(np.float32)
def noise(n): return rng.normal(0, 1, n).astype(np.float32)
def env(n, a, d): u = np.arange(n) / SR; return (np.minimum(1, u / max(a, 1e-4)) * np.exp(-u / d)).astype(np.float32)
def win(x, a, b, f=.35): return np.clip((x - a) / f, 0, 1) * (1 - np.clip((x - b) / f, 0, 1))


# ------------------------------------------------------------------ voice
venv = np.zeros(L, np.float32)
for lid, t0 in VO.items():
    a, sr = sf.read(os.path.join(ROOT, 'voice', lid + '.wav'), dtype='float32')
    a = soxr.resample(a, sr, SR).astype(np.float32)
    a = a / (np.sqrt(np.mean(a ** 2)) + 1e-9) * 10 ** (-20 / 20)
    a = np.sign(a) * (1 - np.exp(-np.abs(a) * 3.2)) / (1 - math.exp(-3.2))
    add('voice', a * .55, t0)
    i = int(t0 * SR); venv[i:i + len(a)] = 1

# ------------------------------------------------------------------ music: 100 BPM, A minor, soft pluck arpeggio + sub bass + light kick; ducked under the voice
BPM = 100; beat = 60 / BPM
def pluck(f, d=.5, b=.25):
    n = int(d * SR); u = np.arange(n) / SR
    return ((np.sin(2 * np.pi * f * u) + b * np.sin(2 * np.pi * 2 * f * u) * np.exp(-u / .08)) * env(n, .004, .22)).astype(np.float32)
def sub(f, d):
    n = int(d * SR); u = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * u) * np.minimum(1, u / .02) * np.exp(-u / (d * .8))).astype(np.float32)
def kick():
    n = int(.3 * SR); u = np.arange(n) / SR
    return (np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-u * 30)) / SR) * np.exp(-u / .12)).astype(np.float32)
chords = [(220.0, 261.63, 329.63, 392.0), (174.61, 220.0, 261.63, 329.63), (196.0, 246.94, 293.66, 392.0), (164.81, 207.65, 246.94, 329.63)]   # Am7 Fmaj7 G E7
roots = [55.0, 43.65, 49.0, 41.2]
nb = int(DUR / beat) + 1
for b in range(nb):
    tb = b * beat; bar = (b // 4) % 4; ch = chords[bar]
    if tb > DUR: break
    for s in range(2):                                   # 8th-note arpeggio
        add('music', pluck(ch[(b * 2 + s) % 4] * (2 if (b + s) % 3 == 0 else 1), .45), tb + s * beat / 2, .16, (-.3, .3)[s])
    if b % 4 == 0: add('music', sub(roots[bar], beat * 4), tb, .55)
    if b % 2 == 0 and 6 < tb < END: add('music', kick(), tb, .35)
# a short drop while the wheels stop, so the line lands
bus['music'] *= (1 - .7 * win(t, STOP0 + .2, STOP1 - .2, .3))[None, :]
duck = 1 - (1 - 10 ** (-10 / 20)) * np.clip(sos('lowpass', 4, venv, 1), 0, 1)
bus['music'] *= duck[None, :]

# ------------------------------------------------------------------ foley
def whoosh(d=.7, lo=250, hi=4000):
    n = int(d * SR); u = np.linspace(0, 1, n)
    return sos('bandpass', [lo, hi], noise(n)) * np.sin(np.pi * u) ** 2 * .6
def clunk(big=1.0):
    n = int(.5 * SR); u = np.arange(n) / SR
    body = np.sin(2 * np.pi * (70 * np.exp(-u * 8) + 60) * u) * np.exp(-u / .09)
    metal = sum(a * np.sin(2 * np.pi * f * u) * np.exp(-u / dd) for f, a, dd in ((820, .35, .08), (1930, .2, .05), (3400, .1, .03)))
    return ((body * .9 + metal + noise(n) * np.exp(-u / .006) * .4) * big).astype(np.float32)
def hiss(d=.45):
    n = int(d * SR); u = np.arange(n) / SR
    return sos('bandpass', [1500, 7000], noise(n)) * np.minimum(1, u / .02) * np.exp(-u / (d * .4)) * .5
def click(f=2600):
    n = int(.08 * SR); u = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * u) * np.exp(-u / .008) + noise(n) * np.exp(-u / .002) * .5).astype(np.float32)

# hook impact (also lands after the end riser when the Short loops)
n = int(1.4 * SR); u = np.arange(n) / SR
add('fx', np.sin(2 * np.pi * np.cumsum(32 + 60 * np.exp(-u * 10)) / SR) * np.exp(-u / .5) + sos('lowpass', 900, noise(n)) * np.exp(-u / .08) * .6, 0, .8)
# engine/drivetrain bed: a low turning hum with blade-pass texture from the converter
blade = 30 * (1 - .15 * win(t, STOP0, STOP1, .5))                         # 30 blades x 1 rev/s
hum = (np.sin(2 * np.pi * 41 * t) * .5 + np.sin(2 * np.pi * 82 * t + 1) * .25) * (1 + .3 * np.sin(2 * np.pi * np.cumsum(blade) / SR))
fluid = sos('bandpass', [250, 1600], noise(L)) * (.5 + .5 * np.sin(2 * np.pi * np.cumsum(blade) / SR))
slip = win(t, STOP0, STOP1 + .3, .6)
conv = win(t, 5.8, 16.0, .6)
add('fx', hum * (.10 + .08 * (1 - conv)), 0)
add('fx', fluid * (.10 * conv + .22 * slip), 0)
# transitions
for a0, d in ((5.85, .8), (LIFT0 - .1, 1.2), (BACK0, 1.2)): add('fx', whoosh(d), a0, .5)
n = int(1.2 * SR); u = np.linspace(0, 1, n); add('fx', sos('bandpass', [400, 6000], noise(n)) * u ** 2.5 * .7, DUR - 1.2, .6)
# the hero set: gear ticks at the sun/planet mesh rate, a clunk and a hydraulic hiss at each hold
hs = 110.0
for a0, a1, wc in ((17.8, LOW, .45 * hs), (LOW, DIRECT, hs * 28 / 96), (REV, BACK0, 0.0)):
    rate = abs(hs - wc) / 360 * 28 / 2
    if rate < .5: continue
    k = a0
    while k < a1 - .05:
        add('fx', click(3000 + rng.uniform(-300, 300)) * .12, k, 1, rng.uniform(-.3, .3)); k += 1 / rate
for at_, g in ((LOW, 1.0), (DIRECT, .9), (REV, 1.1)):
    add('fx', clunk(g), at_ - .02, .8); add('fx', hiss(), at_ - .08, .6)
# clutches: a solenoid click, then the pack clamps
for c in CLUTCH:
    add('fx', click(4200), c - .15, .5, -.4); add('fx', clunk(.7), c, .6, .1); add('fx', hiss(.3), c - .1, .4, -.2)
for k in TAGS: add('fx', click(2400) * .5, k, .5)

# ------------------------------------------------------------------ master
mix = bus['voice'] * 1.0 + bus['music'] * .55 + bus['fx'] * .7
def lufs(x):
    k = [lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, .73248077421585], ch) for ch in x]
    k = [lfilter([1., -2., 1.], [1, -1.99004745483398, .99007225036621], ch) for ch in k]
    blk, hop = int(.4 * SR), int(.1 * SR)
    z = np.array([sum(np.mean(ch[i:i + blk] ** 2) for ch in k) for i in range(0, len(k[0]) - blk, hop)])
    lk = -.691 + 10 * np.log10(z + 1e-12); z1 = z[lk > -70]; rel = -.691 + 10 * np.log10(z1.mean()) - 10
    return -.691 + 10 * np.log10(z[lk > rel].mean())
for _ in range(3):
    mix *= 10 ** ((-14 - lufs(mix)) / 20); mix = np.tanh(mix / .89) * .89
print(f"master: {lufs(mix):.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS")
sf.write(os.path.join(ROOT, 'audio_mix.wav'), mix.T, SR)

# ------------------------------------------------------------------ subtitles
lines = dict(json.load(open(os.path.join(ROOT, 'narration.json'), encoding='utf-8')))
durs = json.load(open(os.path.join(ROOT, 'voice', 'durations.json')))
fmt = lambda s: f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(round(s % 1 * 1000)) % 1000:03d}"
with open(os.path.join(ROOT, 'automatic-transmission-cut-in-half.srt'), 'w', encoding='utf-8') as f:
    for i, (lid, t0) in enumerate(VO.items(), 1):
        f.write(f"{i}\n{fmt(t0)} --> {fmt(t0 + durs[lid] + .1)}\n{lines[lid]}\n\n")

# ------------------------------------------------------------------ picture
if os.environ.get('AUDIO_ONLY'): raise SystemExit
OUT = os.path.join(ROOT, 'automatic-transmission-cut-in-half.mp4'); nfr = int(DUR * FPS)
c = av.open(OUT, 'w', options={'movflags': '+faststart'})
vs = c.add_stream('libx264', rate=FPS); vs.width, vs.height, vs.pix_fmt = 1080, 1920, 'yuv420p'
vs.options = {'crf': '17', 'preset': 'medium', 'profile': 'high', 'colorprim': 'bt709', 'transfer': 'bt709', 'colormatrix': 'bt709'}
au = c.add_stream('aac', rate=SR); au.layout = 'stereo'; au.bit_rate = 192000
for fi in range(nfr):
    acc = None
    for j in range(SUB):
        a = np.asarray(Image.open(os.path.join(ROOT, 'sub', f's_{8 * fi + j}.jpg')).convert('RGB'), np.float32)
        acc = a if acc is None else acc + a
    fr = av.VideoFrame.from_image(Image.fromarray(np.clip(acc / SUB + .5, 0, 255).astype(np.uint8))); fr.pts = fi
    for pk in vs.encode(fr): c.mux(pk)
for pk in vs.encode(): c.mux(pk)
pcm = mix[:, :int(nfr / FPS * SR)].astype(np.float32).copy()
for i in range(0, pcm.shape[1], 1024):
    af = av.AudioFrame.from_ndarray(np.ascontiguousarray(pcm[:, i:i + 1024]), format='fltp', layout='stereo'); af.sample_rate = SR; af.pts = i
    for pk in au.encode(af): c.mux(pk)
for pk in au.encode(): c.mux(pk)
c.close()
print(f"{OUT}: {nfr} frames, {nfr / FPS:.1f} s, {os.path.getsize(OUT) / 1e6:.1f} MB")
