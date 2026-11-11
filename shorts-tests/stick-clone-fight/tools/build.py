"""SUBJECT 07 clone-fight test: sound design + motion-blur average + encode (numpy, scipy, PyAV; no ffmpeg).
usage: python build.py   (reads ../sub/s_<8k+j>.jpg, writes ../subject07-clone-fight.mp4); AUDIO_ONLY=1 writes only audio_mix.wav
Every event is placed in story time (tau) and mapped to real time with tl.py, the same speed ramps the page uses.
"""
import math, os
import numpy as np
import av
from PIL import Image
from scipy.signal import lfilter, butter, sosfilt, fftconvolve
from tl import TL, real_of, tau_of, speed, ROOT

FPS, SR, SUB = 30, 48000, 4
NFR = int(math.ceil(real_of(TL['dur']) * FPS)); DUR = NFR / FPS
L = int(DUR * SR); t = np.arange(L) / SR
rng = np.random.default_rng(7)
R = real_of
bus = {k: np.zeros((2, L), np.float32) for k in ('music', 'fx', 'amb', 'verb')}


def add(name, buf, at, gain=1.0, pan=0.0, verb=0.0):
    i = int(round(at * SR))
    if i >= L or len(buf) == 0: return
    j = max(0, -i); i = max(0, i); seg = buf[j:j + L - i]
    lg, rg = math.cos((pan + 1) * math.pi / 4) * 1.414, math.sin((pan + 1) * math.pi / 4) * 1.414
    for nm, g in ((name, gain), ('verb', gain * verb)):
        if g: bus[nm][0, i:i + len(seg)] += seg * g * lg; bus[nm][1, i:i + len(seg)] += seg * g * rg


def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x).astype(np.float32)
def lpf(x, fc, o=2): return sosfilt(butter(o, fc, 'lowpass', fs=SR, output='sos'), x).astype(np.float32)
def hpf(x, fc, o=2): return sosfilt(butter(o, fc, 'highpass', fs=SR, output='sos'), x).astype(np.float32)
def noise(n): return rng.normal(0, 1, n).astype(np.float32)
def U(d): return np.arange(int(d * SR)) / SR
def saw(f, u, det=0.0): ph = np.cumsum(np.broadcast_to(f, u.shape) * (1 + det)) / SR; return (2 * (ph % 1) - 1).astype(np.float32)


# ------------------------------------------------------------------ building blocks
def sm(*xs):                               # sum sounds of different lengths
    out = np.zeros(max(len(x) for x in xs), np.float32)
    for x in xs: out[:len(x)] += x
    return out


def thump(f0=110, f1=38, d=.5, dec=.12):
    u = U(d); f = f1 + (f0 - f1) * np.exp(-u / .04)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u / dec)).astype(np.float32)


def hit(size=1.0):                       # punch / kick: body thump, a crack, a mid smack
    d = .9 + .6 * size; u = U(d); n = len(u)
    body = thump(130, 42, d, .1 + .06 * size) * 1.1
    crack = hpf(noise(n), 1800) * np.exp(-u / .012) * .9
    smack = bp(noise(n), 300, 2500) * np.exp(-u / .04) * .8
    sub = thump(70, 30, d, .25 * size) * (.6 * size) if size > 1.2 else 0
    return (body + crack + smack + sub) * (.7 + .3 * size)


def whoosh(d=.35, lo=300, hi=3000, up=False):
    u = U(d); n = len(u); k = u / d
    env = np.sin(np.pi * k) ** 2 * (k if up else 1 - .5 * k)
    x = noise(n); m = k if up else 1 - k                 # cross-fade a low band into a high band (a sweep without filter clicks)
    y = bp(x, lo * .6, lo * 2) * (1 - m) + bp(x, hi * .4, min(15000, hi * 1.5)) * m
    return (y * env * 1.6).astype(np.float32)


def glass(d=1.4, dens=1.0):
    u = U(d); n = len(u); out = hpf(noise(n), 2500) * np.exp(-u / .08) * 1.0
    for _ in range(int(120 * dens)):
        at = rng.exponential(.18); f = rng.uniform(2500, 9000); i = int(at * SR)
        if i >= n: continue
        m = min(n - i, int(.12 * SR)); v = np.arange(m) / SR
        out[i:i + m] += np.sin(2 * np.pi * f * v) * np.exp(-v / rng.uniform(.01, .05)) * rng.uniform(.1, .45) * math.exp(-at * 2)
    return out.astype(np.float32)


def splash(d=1.0):
    u = U(d); n = len(u)
    return (lpf(noise(n), 1500) * np.exp(-u / .25) * np.minimum(1, u / .02) + bp(noise(n), 1500, 6000) * np.exp(-u / .1) * .4).astype(np.float32)


def scrape(d):
    u = U(d); n = len(u); gr = (rng.random(n) < .02).astype(np.float32) * rng.normal(0, 1, n)
    return (bp(noise(n), 600, 3500) * .5 + lpf(gr, 2000) * 2) * np.sin(np.pi * u / d) ** .5


def footstep(): u = U(.15); return (thump(90, 50, .15, .03) * .8 + bp(noise(len(u)), 200, 1500) * np.exp(-u / .015) * .4).astype(np.float32)


def zing():
    u = U(.6); f = 2400 * np.exp(-u * 3) + 300
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u / .2) * .5 + bp(noise(len(u)), 3000, 8000) * np.exp(-u / .05) * .3 + np.sign(np.sin(2 * np.pi * 100 * u)) * .08 * np.exp(-u / .3)).astype(np.float32)


def whoom(d=1.2):                          # slow-motion entry: a pitch-falling swell
    u = U(d); f = 180 * np.exp(-u * 2.2) + 35
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.minimum(1, u / d)) * .9 + lpf(noise(len(u)), 400) * np.exp(-u / .3) * .6).astype(np.float32)


def metal_ring(d=2.2):
    u = U(d)
    return sum(a * np.sin(2 * np.pi * f * u) * np.exp(-u / dd) for f, a, dd in ((523, .5, .9), (1187, .35, .6), (1879, .25, .45), (2711, .2, .3), (3613, .12, .2))).astype(np.float32)


# ------------------------------------------------------------------ ambience: room tone, drone, bubbles
add('amb', lpf(noise(L), 300) * .35 + lpf(noise(L), 3000) * .03, 0)
dr = (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.4 * t + 1)) * .25 * (np.clip(t / 2, 0, 1))
add('amb', dr.astype(np.float32), 0)
for k in range(70):                                   # bubbles inside the tanks until they break, then only in the far tanks
    tau = rng.uniform(0, 3.9); u = U(.08); f = rng.uniform(380, 1000) * (1 + 2 * u / .08)
    add('amb', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u / .02) * .12, R(tau), pan=rng.uniform(-.7, .7))
# HUD typing (characters typed from tau .4 to 2.0)
for k in range(57): add('fx', hpf(noise(int(.02 * SR)), 2500) * np.exp(-U(.02) / .003) * .12, R(.4 + 1.6 * k / 57), pan=-.5)

# ------------------------------------------------------------------ score
# opening pad (Am), fades out as the drive starts
pad = np.zeros(L, np.float32)
for f in (110, 130.8, 164.8, 220):
    pad += saw(f, t, .003) * .12 + saw(f, t, -.004) * .12
pad = lpf(pad, 700) * np.clip(t / 2.5, 0, 1) * np.clip((R(4.7) - t) / 1.0, 0, 1)
add('music', pad, 0)
# the drive: 128 bpm, bass sixteenths on A, kick on beats, hats on off-beats, from tau 4.55 to the end of the alarm
BPM = 128; beat = 60 / BPM; t0, t1 = R(4.55), R(12.72)
notes = [45, 45, 57, 45, 45, 48, 45, 43] * 2
bass = np.zeros(L, np.float32); kick = np.zeros(L, np.float32); hat = np.zeros(L, np.float32)
k = 0; x = t0
while x < t1:
    i = int(x * SR); m = int(beat / 4 * SR * .9); f = 440 * 2 ** ((notes[k % 16] - 69) / 12)
    v = np.arange(m) / SR; seg = saw(f, v) * np.exp(-v / .08) + saw(f * 2.003, v) * .3 * np.exp(-v / .05)
    bass[i:i + m] += seg[:L - i]
    if k % 4 == 0:
        kk = thump(150, 45, .35, .09); kick[i:i + len(kk)] += kk[:L - i] * 1.1
    if k % 4 == 2:
        hh = hpf(noise(int(.05 * SR)), 7000) * np.exp(-U(.05) / .012); hat[i:i + len(hh)] += hh[:L - i] * .35
    k += 1; x += beat / 4
bass = lpf(bass, 900) * .55
music = bass + kick + hat
# a rising string-like tension layer under the fight
ten = (saw(220, t, .002) + saw(329.6, t, -.003) + saw(440, t, .004)) * .07
ten = lpf(ten, 1200) * np.clip((t - t0) / 6, 0, 1) * np.clip((t1 - t) / .3, 0, 1)
music += ten
# slow motion: the score goes under water (low-passed and ducked) while time is stretched
slow = 1 - speed(tau_of(t))
slow_k = np.clip(slow / .85, 0, 1).astype(np.float32)
music = music * (1 - slow_k) + lpf(music, 280) * slow_k * .7
add('music', music, 0)
# alarm siren (two tones), tau 2.8 to 12.7, ducked under the fight
al0, al1 = R(TL['alarm'][0]), R(TL['alarm'][1])
sw = np.where((t * 1.6) % 1 < .5, 660.0, 880.0); sir = np.sign(np.sin(2 * np.pi * np.cumsum(sw) / SR)) * .5 + np.sin(2 * np.pi * np.cumsum(sw) / SR) * .5
sir = bp(sir.astype(np.float32), 400, 2500) * np.clip((t - al0) / .1, 0, 1) * np.clip((al1 - t) / .3, 0, 1)
sir *= np.where(t < R(4.6), .35, .12)
add('fx', sir, 0, verb=.3)
# power down when the alarm stops
u = U(1.0); add('fx', np.sin(2 * np.pi * np.cumsum(400 * np.exp(-u * 3) + 40) / SR) * np.exp(-u / .5) * .5, al1, verb=.3)

# ------------------------------------------------------------------ the story, in story time
for tau in (3.15, 3.25, 3.3): add('fx', zing(), R(tau), .5, pan=.3, verb=.3)            # eyes open
for k in range(40):                                                                        # glass cracking
    tau = 3.45 + .42 * (k / 40) ** .6; add('fx', hpf(noise(400), 3000) * np.exp(-np.arange(400) / 60) * rng.uniform(.2, .6), R(tau), pan=rng.uniform(-.2, .8))
add('fx', glass(1.8, 1.4), R(3.9), 1.1, pan=.3, verb=.4)                                   # shatter: three tanks
add('fx', thump(90, 35, 1.2, .3), R(3.9), .9, verb=.3)
add('fx', splash(1.2), R(3.93), .7, pan=.3)
for tau, pn in ((4.15, .1), (4.18, .4), (4.2, .7)): add('fx', sm(hit(.5) * .6, splash(.4) * .4), R(tau), .7, pan=pn)
# footsteps in the runs: [start, end, pan]
for a, b, pn in ((4.66, 5.12, .2), (6.86, 7.48, .3), (7.66, 8.22, .7), (10.3, 10.64, .4), (10.36, 10.64, -.2), (11.48, 11.64, 0)):
    x = a
    while x < b: add('fx', footstep(), R(x), .55, pan=pn); x += 1 / 5.2
# whooshes
for tau, d, g, pn in ((5.12, .4, .8, .1), (5.28, .5, .6, -.1), (5.95, .3, .8, -.2), (6.05, .25, 1., -.3), (7.42, .35, .9, -.2), (7.52, .25, 1., 0),
                      (8.32, .45, .8, 0), (8.5, .3, .7, 0), (8.62, .3, .8, .1), (8.78, .2, 1., .1), (10.6, .2, .8, -.2), (10.62, .2, .8, .2),
                      (11.46, .3, 1., -.1), (11.68, .2, 1., .1)):
    add('fx', whoosh(d, 300, 4000), R(tau) - d * .3, g * .8, pan=pn)
add('fx', whoosh(1.1, 400, 5000, up=True), R(11.8), .9, pan=.2, verb=.3)                  # C2 launched upward
# slow-motion entries
for a, b, m in TL['slow'][:3]: add('fx', whoom(1.4), R(a - .04), .8, verb=.4)
add('fx', thump(60, 40, .5, .15) * .9, R(5.40), .8); add('fx', thump(60, 40, .5, .15) * .7, R(5.48) + .25, .7)   # heartbeat in the dodge
# impacts
for m in TL['impacts']:
    at, sz = R(m['tau']), m['size']
    if m.get('crack'):
        add('fx', sm(glass(.8, .5) * .8, hit(.6) * .6), at, .9, pan=-.5, verb=.3); continue
    add('fx', hit(sz), at, .9 + .2 * sz, pan=0, verb=.25 + .15 * sz)
    if m.get('floor'):
        u = U(1.5); add('fx', thump(80, 28, 1.5, .4) * 1.3 + lpf(noise(len(u)), 800) * np.exp(-u / .35) * .8, at, 1.1, verb=.5)
        for k in range(18): add('fx', bp(noise(800), 1000, 5000) * np.exp(-np.arange(800) / 150) * .4, at + rng.uniform(.1, .9), pan=rng.uniform(-.6, .6))
    if m.get('ring'):
        add('fx', metal_ring(2.4), at, .55, verb=.6)
        u = U(.45); add('fx', (lpf(noise(len(u)), 2000) * (u / .45) ** 3).astype(np.float32), at - .45, .7)     # reverse swell into the clash
        add('fx', thump(60, 25, 2.0, .6) * 1.2, at, 1.0, verb=.4)
    if m.get('flash'): add('fx', hpf(noise(int(.08 * SR)), 4000) * np.exp(-U(.08) / .02), at, .7)
add('fx', sm(thump(90, 40, .6, .12) * .8, splash(.3) * .3), R(6.75), .7, pan=-.6)            # C1 slumps against the tank
for tau in (8.05, 8.2, 8.32): add('fx', hit(.4) * .5, R(tau), .7, pan=.5)                # C2 rolls
add('fx', hit(.7) * .8, R(9.38), .9, pan=-.2)                                             # hero lands
add('fx', scrape(.4), R(10.86), .8, pan=-.4); add('fx', scrape(.4), R(10.86), .8, pan=.4)  # both slide back
# the reveal: tanks light up one by one, a braam grows into the cut to black
rev = sorted([TL['reveal'] + abs(x - 120) / 1700 * 1.3 for x in (-920, -560, 1160, 1480)])
for k, tau in enumerate(rev): add('fx', thump(70, 40, .8, .2) * .9 + bp(noise(int(.8 * SR)), 80, 400) * np.exp(-U(.8) / .3) * .5, R(tau), .8, pan=(-.6, -.3, .4, .7)[k], verb=.5)
for k in range(12): add('fx', hpf(noise(600), 1500) * np.exp(-np.arange(600) / 120) * .2, R(TL['reveal'] + .3 + k * .1), pan=rng.uniform(-.8, .8), verb=.4)
b0, b1 = R(13.6), R(TL['black'])
u = U(b1 - b0); env = (u / (b1 - b0)) ** 2.2
br = sum(saw(f, u) for f in (55, 55.4, 82.4, 110.2, 109.7)) * .2
fc_br = lpf(br * env, 600) * .8 + lpf(br * env, 2200) * env * .4
add('music', fc_br.astype(np.float32), b0, 1.0, verb=.3)
# the cut to black: one massive hit, then the title tone
u = U(4.0); boom = thump(70, 26, 4.0, .9) * 1.4 + lpf(noise(len(u)), 500) * np.exp(-u / .6) * .9 + sum(saw(f, u) for f in (55, 82.4, 110)) * np.exp(-u / 1.2) * .25
add('fx', lpf(boom.astype(np.float32), 1800), b1, 1.2, verb=.7)
u = U(3.0); tone = (np.sin(2 * np.pi * 880 * u) * .2 + np.sin(2 * np.pi * 1318.5 * u) * .12) * np.sin(np.pi * np.minimum(1, u / 3)) ** 2
add('fx', tone.astype(np.float32), R(16.15), .35, verb=.6)

# ------------------------------------------------------------------ reverb and master
ir_n = int(2.6 * SR); ir_u = np.arange(ir_n) / SR
ir = [lpf(noise(ir_n), 5000) * np.exp(-ir_u / .55) for _ in range(2)]
verb = np.stack([fftconvolve(bus['verb'][c], ir[c])[:L] for c in range(2)]).astype(np.float32) * .05
mix = bus['music'] * .55 + bus['fx'] * .8 + bus['amb'] * .5 + verb
mix *= np.clip((DUR - t) / .4, 0, 1)


def lufs(x):
    k = [lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, .73248077421585], ch) for ch in x]
    k = [lfilter([1., -2., 1.], [1, -1.99004745483398, .99007225036621], ch) for ch in k]
    blk, hop = int(.4 * SR), int(.1 * SR)
    z = np.array([sum(np.mean(ch[i:i + blk] ** 2) for ch in k) for i in range(0, len(k[0]) - blk, hop)])
    lk = -.691 + 10 * np.log10(z + 1e-12); z1 = z[lk > -70]; rel = -.691 + 10 * np.log10(z1.mean()) - 10
    return -.691 + 10 * np.log10(z[lk > rel].mean())


for _ in range(4):
    mix *= 10 ** ((-14 - lufs(mix)) / 20); mix = np.tanh(mix / .9) * .9
print(f"duration {DUR:.2f} s ({NFR} frames), master {lufs(mix):.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS")
import wave
with wave.open(os.path.join(ROOT, 'audio_mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype('<i2').tobytes())
if os.environ.get('AUDIO_ONLY'): raise SystemExit

# ------------------------------------------------------------------ picture: average 4 subframes per frame (motion blur), encode
OUT = os.path.join(ROOT, 'subject07-clone-fight.mp4')
c = av.open(OUT, 'w', options={'movflags': '+faststart'})
vs = c.add_stream('libx264', rate=FPS); vs.width, vs.height, vs.pix_fmt = 1920, 1080, 'yuv420p'
vs.options = {'crf': '18', 'preset': 'medium', 'profile': 'high', 'colorprim': 'bt709', 'transfer': 'bt709', 'colormatrix': 'bt709'}
au = c.add_stream('aac', rate=SR); au.layout = 'stereo'; au.bit_rate = 192000
for fi in range(NFR):
    acc = None
    for j in range(SUB):
        a = np.asarray(Image.open(os.path.join(ROOT, 'sub', f's_{8 * fi + j}.jpg')).convert('RGB'), np.float32)
        acc = a if acc is None else acc + a
    fr = av.VideoFrame.from_image(Image.fromarray(np.clip(acc / SUB + .5, 0, 255).astype(np.uint8))); fr.pts = fi
    for pk in vs.encode(fr): c.mux(pk)
for pk in vs.encode(): c.mux(pk)
pcm = mix[:, :int(NFR / FPS * SR)].astype(np.float32).copy()
for i in range(0, pcm.shape[1], 1024):
    af = av.AudioFrame.from_ndarray(np.ascontiguousarray(pcm[:, i:i + 1024]), format='fltp', layout='stereo'); af.sample_rate = SR; af.pts = i
    for pk in au.encode(af): c.mux(pk)
for pk in au.encode(): c.mux(pk)
c.close()
print(f"{OUT}: {NFR} frames, {NFR / FPS:.2f} s, {os.path.getsize(OUT) / 1e6:.1f} MB")
