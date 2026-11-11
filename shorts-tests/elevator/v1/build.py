"""ELEVATOR: sound design + motion-blur average + encode (numpy, scipy, PyAV; no ffmpeg).
usage: python build.py   (reads ../sub/s_<8k+j>.jpg, writes ../elevator.mp4); AUDIO_ONLY=1 writes only audio_mix.wav
The running joke is the score: polite elevator bossa that keeps playing through every fight, until the power dies on 29.
Events are in story time (tau) and mapped to real time with tl.py (the same speed ramps as the page).
"""
import math, os, wave
import numpy as np
import av
from PIL import Image
from scipy.signal import lfilter, butter, sosfilt, fftconvolve
from tl import TL, real_of, tau_of, speed, ROOT

FPS, SR, SUB = 30, 48000, 4
NFR = int(math.ceil(real_of(TL['dur']) * FPS)); DUR = NFR / FPS
L = int(DUR * SR); t = np.arange(L) / SR
rng = np.random.default_rng(3)
R = real_of
bus = {k: np.zeros((2, L), np.float32) for k in ('music', 'fx', 'amb', 'verb')}


def add(name, buf, at, gain=1.0, pan=0.0, verb=0.0):
    i = int(round(at * SR))
    if i >= L or len(buf) == 0: return
    j = max(0, -i); i = max(0, i); seg = np.asarray(buf, np.float32)[j:j + L - i]
    lg, rg = math.cos((pan + 1) * math.pi / 4) * 1.414, math.sin((pan + 1) * math.pi / 4) * 1.414
    for nm, g in ((name, gain), ('verb', gain * verb)):
        if g: bus[nm][0, i:i + len(seg)] += seg * g * lg; bus[nm][1, i:i + len(seg)] += seg * g * rg


def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x).astype(np.float32)
def lpf(x, fc, o=2): return sosfilt(butter(o, fc, 'lowpass', fs=SR, output='sos'), x).astype(np.float32)
def hpf(x, fc, o=2): return sosfilt(butter(o, fc, 'highpass', fs=SR, output='sos'), x).astype(np.float32)
def noise(n): return rng.normal(0, 1, n).astype(np.float32)
def U(d): return np.arange(int(d * SR)) / SR
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def sm(*xs):
    out = np.zeros(max(len(x) for x in xs), np.float32)
    for x in xs: out[:len(x)] += x
    return out


def thump(f0=110, f1=38, d=.5, dec=.12):
    u = U(d); f = f1 + (f0 - f1) * np.exp(-u / .04)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u / dec)).astype(np.float32)


def hit(size=1.0):
    d = .8 + .5 * size; u = U(d); n = len(u)
    x = thump(130, 42, d, .1 + .05 * size) * 1.1 + hpf(noise(n), 1800) * np.exp(-u / .012) * .9 + bp(noise(n), 300, 2500) * np.exp(-u / .04) * .8
    if size > 1.2: x += thump(70, 30, d, .25 * size) * .6 * size
    return x * (.7 + .3 * size)


def whoosh(d=.3, lo=300, hi=3500, up=False):
    u = U(d); n = len(u); k = u / d; env = np.sin(np.pi * k) ** 2 * (k if up else 1 - .5 * k); x = noise(n); m = k if up else 1 - k
    return ((bp(x, lo * .6, lo * 2) * (1 - m) + bp(x, hi * .4, min(15000, hi * 1.5)) * m) * env * 1.6).astype(np.float32)


def ding(f=1318.5, d=2.2):     # the car's chime: a soft bell
    u = U(d)
    return (sum(a * np.sin(2 * np.pi * f * r * u) * np.exp(-u / dd) for r, a, dd in ((1, .6, .9), (2.0, .2, .4), (2.76, .12, .25), (5.4, .05, .1))) * np.minimum(1, u / .003)).astype(np.float32)


def door(open_=True, d=.5):    # door panels: a smooth rumble that ends in a soft clunk
    u = U(d); n = len(u)
    r = bp(noise(n), 120, 900) * np.sin(np.pi * u / d) ** 1.5 * .6 + np.sin(2 * np.pi * 70 * u) * np.sin(np.pi * u / d) * .2
    return sm(r.astype(np.float32), np.zeros(int(d * SR) - 1, np.float32), thump(140, 70, .2, .03) * (.5 if open_ else .8))


def clunk(): return sm(thump(100, 50, .3, .05), bp(noise(int(.3 * SR)), 1500, 5000) * np.exp(-U(.3) / .02) * .4)


def footstep(): u = U(.12); return (thump(90, 55, .12, .025) * .7 + bp(noise(len(u)), 300, 2500) * np.exp(-u / .012) * .4).astype(np.float32)


def wood(f=420):              # staff clatter / catch
    u = U(.25); return (sum(a * np.sin(2 * np.pi * f * r * u) * np.exp(-u / dd) for r, a, dd in ((1, .8, .05), (2.3, .4, .03), (4.1, .2, .02))) + bp(noise(len(u)), 800, 4000) * np.exp(-u / .01) * .5).astype(np.float32)


# ------------------------------------------------------------------ the car: motor whine that follows the car's speed
FLOOR_K = [[0, 1], [0.7, 1], [2.6, 3], [5.6, 3], [7.2, 7], [10.8, 7], [12.0, 12], [16.25, 12], [16.45, 15], [17.05, 15], [17.27, 18], [17.85, 18],
           [18.07, 21], [18.65, 21], [18.87, 24], [19.45, 24], [19.67, 27], [20.25, 27], [22.0, 29], [26.0, 29], [27.4, 30]]
def io(k): k = np.clip(k, 0, 1); return np.where(k < .5, 4 * k ** 3, 1 - (-2 * k + 2) ** 3 / 2)
def floor_at(tau):
    tau = np.asarray(tau, float); out = np.full(tau.shape, float(FLOOR_K[-1][1]))
    for (a, va), (b, vb) in zip(FLOOR_K[:-1], FLOOR_K[1:]):
        m = (tau >= a) & (tau < b); out[m] = va + (vb - va) * io((tau[m] - a) / (b - a))
    out[tau < FLOOR_K[0][0]] = FLOOR_K[0][1]; return out
tau_t = tau_of(t)
fl = floor_at(tau_t); vel = np.abs(np.gradient(fl) * SR)                 # floors per real second
vel = lpf(vel.astype(np.float32), 8); mv = np.clip(vel / 3.0, 0, 1.6)
ph = np.cumsum(60 + 140 * mv) / SR
motor = (np.sin(2 * np.pi * ph) + .4 * np.sin(4 * np.pi * ph + 1) + .2 * np.sin(6 * np.pi * ph)) * np.clip(mv * 1.5, 0, 1) * .18
motor += bp(noise(L), 200, 1200) * np.clip(mv, 0, 1) * .12
add('amb', motor.astype(np.float32), 0)
add('amb', lpf(noise(L), 250) * .25 + np.sin(2 * np.pi * 50 * t).astype(np.float32) * .03, 0)   # room tone and the hum of the light

# ------------------------------------------------------------------ the muzak: soft bossa, Dm9 G13 Cmaj9 A7b9 at 120 bpm
BPM = 120; beat = 60 / BPM; bar = 4 * beat
CH = [([50, 53, 57, 60, 64], 38, 45), ([53, 59, 64, 69], 43, 50), ([52, 55, 59, 62], 36, 43), ([55, 58, 61, 64], 45, 52)]
def rhodes(m, d=1.2, v=1.0):
    u = U(d); f = mtof(m); trem = 1 + .18 * np.sin(2 * np.pi * 5 * u)
    x = (np.sin(2 * np.pi * f * u) * np.exp(-u / .9) + .3 * np.sin(4 * np.pi * f * u) * np.exp(-u / .3) + .12 * np.sin(2 * np.pi * f * 7.1 * u) * np.exp(-u / .03)) * trem
    return (x * np.minimum(1, u / .004) * v).astype(np.float32)
def bassn(m, d=.9): u = U(d); f = mtof(m); return ((np.sin(2 * np.pi * f * u) + .25 * np.sin(4 * np.pi * f * u)) * np.exp(-u / .45) * np.minimum(1, u / .01)).astype(np.float32)
def vibe(m, d=1.4): u = U(d); f = mtof(m); return (np.sin(2 * np.pi * f * u) * np.exp(-u / .7) * (1 + .3 * np.sin(2 * np.pi * 6 * u)) * np.minimum(1, u / .002)).astype(np.float32)
mus = np.zeros(L, np.float32)
def put(buf, at, g=1.0):
    i = int(at * SR)
    if 0 <= i < L: seg = buf[:L - i]; mus[i:i + len(seg)] += seg * g
MEL = [[(.5, 69), (1.0, 72), (2.5, 74)], [(.5, 71), (1.5, 69), (3.0, 67)], [(.5, 67), (1.0, 71), (2.5, 74)], [(.5, 73), (1.5, 70), (3.0, 69)]]
n_bars = int(DUR / bar) + 1
for b in range(n_bars):
    t0 = b * bar; ch, root, fifth = CH[b % 4]
    for hb in (0, 1.5, 3.0):                                         # bossa comping
        for m in ch: put(rhodes(m, 1.0, .11), t0 + hb * beat + .006 * rng.random())
    put(bassn(root), t0, .45); put(bassn(fifth), t0 + 2 * beat, .4); put(bassn(root), t0 + 3.5 * beat, .25)
    for hb, m in MEL[b % 4]: put(vibe(m), t0 + hb * beat, .16)
    for e in range(8):                                               # brushes, swung eighths
        sw = e * .5 + (.08 if e % 2 else 0); u = U(.09)
        put(hpf(noise(len(u)), 5000) * np.exp(-u / .03) * (.06 if e % 2 else .09), t0 + sw * beat)
# montage: a kick and snare join in while the floors fly by
m0, m1 = R(16.3), R(20.3); x = m0
while x < m1:
    put(thump(140, 48, .3, .08) * .55, x); put(bp(noise(int(.15 * SR)), 1500, 6000) * np.exp(-U(.15) / .04) * .25, x + beat); x += 2 * beat
# the power cut on 29: the music sags in pitch-less fashion (low-pass + fade), silence, then returns mid-phrase
d0, d1 = R(TL['dark'][0]), R(TL['dark'][1])
gate = np.ones(L, np.float32); fade = (t >= d0 - .35) & (t < d0); gate[fade] = ((d0 - t[fade]) / .35); gate[(t >= d0) & (t < d1)] = 0
back = (t >= d1) & (t < d1 + .25); gate[back] = (t[back] - d1) / .25
dull = np.clip((t - (d0 - .35)) / .35, 0, 1) * (t < d0)
mus = mus * (1 - dull) + lpf(mus, 400) * dull
mus *= gate
slow_k = np.clip((1 - speed(tau_t)) / .8, 0, 1).astype(np.float32)          # slow motion: the muzak goes under water
mus = mus * (1 - slow_k) + lpf(mus, 300) * slow_k * .8
add('music', mus, 0)
# comic sting when he sees floor 1: two falling notes on the rhodes
put2 = lambda m, at, g: add('music', rhodes(m, 1.6, g), at)
put2(64, R(28.75), .35); put2(63, R(29.05), .35); put2(62, R(29.4), .4)

# ------------------------------------------------------------------ story events
for a in TL['arrive']: add('fx', ding(), R(a), .5, verb=.3)
for b in TL['beats']: add('fx', ding(1318.5, 1.0), R(b - .02), .35)
for a in (2.8, 7.35, 12.15, 22.3, 28.1): add('fx', door(True), R(a), .5)
add('fx', door(False, .6), 0, .4)
for a in (4.95, 10.25, 15.7, 25.4, 30.7): add('fx', door(False), R(a), .5)
add('fx', clunk(), R(.5), .4, pan=-.6)                                            # button
for a, b, pn in ((3.4, 3.85, .3), (8.0, 8.2, .3), (12.7, 13.15, .3), (23.05, 23.6, 0), (30.45, 30.85, .3)):
    x = a
    while x < b: add('fx', footstep(), R(x), .45, pan=pn); x += .33
for k in range(8): add('fx', whoosh(.12, 400, 2500), R(7.35 + k * .065), .35, pan=.3)  # staff spin in the doorway
for tau, d, g, pn in ((3.98, .25, .8, .1), (4.28, .25, 1., -.2), (8.3, .3, 1., .1), (8.9, .3, 1., 0), (9.2, .3, .9, -.1), (13.3, .2, .8, -.1),
                      (13.85, .3, 1., -.3), (14.4, .35, .8, -.3), (14.66, .2, 1., -.1), (24.42, .18, 1.1, -.1), (24.7, .25, 1., 0)):
    add('fx', whoosh(d), R(tau) - d * .4, g * .8, pan=pn)
for b in TL['beats']: add('fx', whoosh(.2), R(b + .2), .8)
add('fx', whoosh(.5, 500, 4000, up=True), R(9.4), .5)                             # the staff flies
add('fx', wood(380), R(9.82), .8, pan=-.2)                                         # caught
for k in range(5): add('fx', whoosh(.1, 500, 3000), R(9.9 + k * .05), .3)          # twirl
add('fx', wood(300) + hpf(noise(int(.25 * SR)), 2500) * np.exp(-U(.25) / .02), R(13.36), 1.0, verb=.3)   # the staff snaps
for tau in (13.7, 13.75): add('fx', wood(520 + 80 * (tau > 13.72)), R(tau + .2), .5, pan=.3)                # halves clatter
add('fx', thump(120, 60, .25, .05) * .6, R(13.92), .7, pan=-.5)                  # feet hit the wall
# impacts
for m in TL['impacts']:
    at, sz = R(m['tau']), m['size']
    if m.get('wall'):
        u = U(1.4); add('fx', thump(90, 35, 1.4, .35) * 1.2 + bp(noise(len(u)), 200, 2500) * np.exp(-u / .08) + sum(a * np.sin(2 * np.pi * f * u) * np.exp(-u / .5) for f, a in ((180, .3), (410, .2), (690, .1))), at, 1.0, pan=-.4, verb=.5); continue
    if m.get('nospark'):
        u = U(1.6); add('fx', thump(70, 28, 1.6, .45) * 1.3 + lpf(noise(len(u)), 600) * np.exp(-u / .3) * .7, at, 1.0, verb=.5); continue
    if m.get('snap'): continue
    add('fx', hit(sz), at, .9 + .2 * sz, verb=.2 + .12 * sz)
    if m.get('flash'): add('fx', hpf(noise(int(.08 * SR)), 4000) * np.exp(-U(.08) / .02), at, .6)
for tau in (4.85, 9.95): add('fx', thump(90, 45, .5, .1) * .7, R(tau), .6, pan=.3)  # bodies land in the corridor
add('fx', thump(100, 45, .4, .08) * .8, R(15.15), .7, pan=-.3)                    # hero lands
# power failure on 29
for k in range(10):
    tau = TL['dark'][0] - .8 + k * .08
    if rng.random() > .4: add('fx', (np.sign(np.sin(2 * np.pi * 120 * U(.05))) * .2 + hpf(noise(int(.05 * SR)), 3000) * .3).astype(np.float32), R(tau), .5)
u = U(1.2); add('fx', np.sin(2 * np.pi * np.cumsum(300 * np.exp(-u * 3) + 30) / SR) * np.exp(-u / .5) * .6, R(TL['dark'][0]), .7, verb=.3)
add('amb', (lpf(noise(int((d1 - d0) * SR)), 120) * .5 + np.sin(2 * np.pi * 41 * U(d1 - d0)) * .15).astype(np.float32), d0, .8)   # dark drone
u = U(.7); add('fx', (np.sin(2 * np.pi * np.cumsum(220 + 120 * np.sin(u * 9)) / SR) * .15 + bp(noise(len(u)), 300, 1500) * .3) * np.sin(np.pi * u / .7), R(23.7), .7, pan=-.4, verb=.4)  # hatch creaks
add('fx', thump(110, 55, .3, .06) * .7, R(24.05), .7, pan=-.3)                    # ninja lands
u = U(.3); add('fx', np.sin(2 * np.pi * np.cumsum(5200 - 3000 * u) / SR) * np.exp(-u / .08) * .3 + hpf(noise(len(u)), 5000) * np.exp(-u / .05) * .4, R(24.42), .8, pan=-.1)  # blade
add('fx', clunk() * 1.2, R(25.15), .9, pan=-.4, verb=.4)                          # hatch slams
for k in range(10): add('fx', hpf(noise(500), 3000) * np.exp(-np.arange(500) / 100) * .25, R(25.2 + k * .06), pan=-.4)
add('fx', (np.sign(np.sin(2 * np.pi * 120 * U(.25))) * .15).astype(np.float32), R(TL['dark'][1]), .5)   # lights back
# the panel glitches 30 -> 1
for k in range(6):
    u = U(.05); add('fx', np.sign(np.sin(2 * np.pi * (800 + 500 * (k % 3)) * u)) * .2 * np.exp(-u / .03), R(27.65 + k * .05), .6)

# ------------------------------------------------------------------ master
ir_n = int(1.6 * SR); ir_u = np.arange(ir_n) / SR
ir = [lpf(noise(ir_n), 6000) * np.exp(-ir_u / .3) for _ in range(2)]                # a small metal room
verb = np.stack([fftconvolve(bus['verb'][c], ir[c])[:L] for c in range(2)]).astype(np.float32) * .06
mix = bus['music'] * .5 + bus['fx'] * .8 + bus['amb'] * .5 + verb
mix *= np.clip((DUR - t) / .3, 0, 1)


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
with wave.open(os.path.join(ROOT, 'audio_mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype('<i2').tobytes())
if os.environ.get('AUDIO_ONLY'): raise SystemExit

OUT = os.path.join(ROOT, 'elevator.mp4')
c = av.open(OUT, 'w', options={'movflags': '+faststart'})
vs = c.add_stream('libx264', rate=FPS); vs.width, vs.height, vs.pix_fmt = 1080, 1920, 'yuv420p'
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
