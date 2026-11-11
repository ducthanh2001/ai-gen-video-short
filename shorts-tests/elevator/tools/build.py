"""ELEVATOR v2: score + sound design + motion-blur average + encode (numpy, scipy, PyAV; no ffmpeg).
usage: python build.py   (reads ../sub/s_<8k+j>.jpg, writes ../elevator.mp4); AUDIO_ONLY=1 writes only audio_mix.wav
Inside the car: polite elevator bossa. Out on each floor: an action score that gets heavier floor by floor
(lobby: drums + bass; office: + string ostinato; dojo: + taiko and higher strings; boiler room: slow, heavy, brass hits).
Events are in story time (tau) and mapped to real time with tl.py.
"""
import math, os, wave
import numpy as np
import av
from PIL import Image
from scipy.signal import lfilter, butter, sosfilt, fftconvolve
from tl import TL, real_of, tau_of, speed, slow_only, ROOT

FPS, SR, SUB = 30, 48000, 4
NFR = int(math.ceil(real_of(TL['dur']) * FPS)); DUR = NFR / FPS
L = int(DUR * SR); t = np.arange(L) / SR
rng = np.random.default_rng(5)
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
def saw(f, u): ph = np.cumsum(np.broadcast_to(f, u.shape)) / SR; return (2 * (ph % 1) - 1).astype(np.float32)


def thump(f0=110, f1=38, d=.5, dec=.12):
    u = U(d); f = f1 + (f0 - f1) * np.exp(-u / .04)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u / dec)).astype(np.float32)
def hit(size=1.0):
    d = .8 + .5 * size; u = U(d); n = len(u)
    x = thump(130, 42, d, .1 + .05 * size) * 1.1 + hpf(noise(n), 1800) * np.exp(-u / .012) * .9 + bp(noise(n), 300, 2500) * np.exp(-u / .04) * .8
    if size > 1.2: x = x + thump(70, 30, d, .25 * size) * .6 * size
    return (x * (.7 + .3 * size)).astype(np.float32)
def whoosh(d=.25, lo=300, hi=3500, up=False):
    u = U(d); n = len(u); k = u / d; env = np.sin(np.pi * k) ** 2 * (k if up else 1 - .5 * k); x = noise(n); m = k if up else 1 - k
    return ((bp(x, lo * .6, lo * 2) * (1 - m) + bp(x, hi * .4, min(15000, hi * 1.5)) * m) * env * 1.6).astype(np.float32)
def ding(f=1318.5, d=2.0):
    u = U(d); return (sum(a * np.sin(2 * np.pi * f * r * u) * np.exp(-u / dd) for r, a, dd in ((1, .6, .9), (2.0, .2, .4), (2.76, .12, .25))) * np.minimum(1, u / .003)).astype(np.float32)
def door(d=.5):
    u = U(d); r = bp(noise(len(u)), 120, 900) * np.sin(np.pi * u / d) ** 1.5 * .6 + np.sin(2 * np.pi * 70 * u) * np.sin(np.pi * u / d) * .2
    return sm(r.astype(np.float32), np.concatenate([np.zeros(len(u) - 1, np.float32), thump(140, 70, .2, .03) * .6]))
def footstep(heavy=False):
    u = U(.2 if heavy else .12); return (thump(70 if heavy else 90, 40 if heavy else 55, len(u) / SR, .06 if heavy else .025) * (1.4 if heavy else .7) + bp(noise(len(u)), 300, 2500) * np.exp(-u / .012) * .4).astype(np.float32)
def wood(f=420, d=.3):
    u = U(d); return (sum(a * np.sin(2 * np.pi * f * r * u) * np.exp(-u / dd) for r, a, dd in ((1, .8, .05), (2.3, .4, .03), (4.1, .2, .02))) + bp(noise(len(u)), 800, 4000) * np.exp(-u / .01) * .5).astype(np.float32)
def crash_wood(d=1.0):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(9): i = int(rng.uniform(0, .5) * SR); w = wood(rng.uniform(250, 700)); out[i:i + len(w)] += w[:len(out) - i] * rng.uniform(.4, 1)
    return out + thump(90, 40, d, .2)
def paper(d=.8): u = U(d); return (bp(noise(len(u)), 2000, 9000) * (np.abs(np.sin(u * 40)) ** 3) * np.exp(-u / .3) * .6).astype(np.float32)
def hiss(d): u = U(d); return (bp(noise(len(u)), 2500, 11000) * np.minimum(1, u / .05)).astype(np.float32)
def whoom(d=1.2):
    u = U(d); f = 180 * np.exp(-u * 2.2) + 35
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.minimum(1, u / d)) * .9 + lpf(noise(len(u)), 400) * np.exp(-u / .3) * .6).astype(np.float32)


# ------------------------------------------------------------------ the muzak (inside the car): soft bossa
BPM = 120; beat = 60 / BPM; bar = 4 * beat
CH = [([50, 53, 57, 60, 64], 38, 45), ([53, 59, 64, 69], 43, 50), ([52, 55, 59, 62], 36, 43), ([55, 58, 61, 64], 45, 52)]
MEL = [[(.5, 69), (1.0, 72), (2.5, 74)], [(.5, 71), (1.5, 69), (3.0, 67)], [(.5, 67), (1.0, 71), (2.5, 74)], [(.5, 73), (1.5, 70), (3.0, 69)]]
def rhodes(m, d=1.0, v=1.0):
    u = U(d); f = mtof(m); trem = 1 + .18 * np.sin(2 * np.pi * 5 * u)
    return ((np.sin(2 * np.pi * f * u) * np.exp(-u / .9) + .3 * np.sin(4 * np.pi * f * u) * np.exp(-u / .3) + .12 * np.sin(2 * np.pi * f * 7.1 * u) * np.exp(-u / .03)) * trem * np.minimum(1, u / .004) * v).astype(np.float32)
def put(buf, at, x, g=1.0):
    i = int(at * SR)
    if 0 <= i < L: seg = x[:L - i]; buf[i:i + len(seg)] += seg * g
muz = np.zeros(L, np.float32)
for b in range(int(DUR / bar) + 1):
    t0 = b * bar; ch, root, fifth = CH[b % 4]
    for hb in (0, 1.5, 3.0):
        for m in ch: put(muz, t0 + hb * beat, rhodes(m, 1.0, .11))
    u = U(.9)
    for at, m, g in ((0, root, .45), (2, fifth, .4)): put(muz, t0 + at * beat, ((np.sin(2 * np.pi * mtof(m) * u) + .25 * np.sin(4 * np.pi * mtof(m) * u)) * np.exp(-u / .45)).astype(np.float32), g)
    for hb, m in MEL[b % 4]: u = U(1.4); put(muz, t0 + hb * beat, (np.sin(2 * np.pi * mtof(m) * u) * np.exp(-u / .7)).astype(np.float32), .15)
    for e in range(8): u = U(.08); put(muz, t0 + (e * .5 + (.08 if e % 2 else 0)) * beat, hpf(noise(len(u)), 5000) * np.exp(-u / .03), .07)
muz = bp(muz, 180, 7000)                                                    # through the car's little speaker
def gate(spans, fade=.25):
    g = np.zeros(L, np.float32)
    for a, b in spans:
        a, b = R(a), R(b); g = np.maximum(g, np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1))
    return g
g_muz = gate([[0, 2.75], [7.35, 9.65], [15.85, 18.05], [34.05, 37.0]]) + gate([[24.45, 26.65]]) * .9
dark = gate([[24.45, 26.65]])
muz = muz * (1 - dark) + lpf(muz, 500) * dark                                     # the boiler-room ride: muffled, uneasy
add('music', muz * g_muz * .55, 0)

# ------------------------------------------------------------------ the action score: one continuous driving track, 140 bpm, D minor
# Intensity per stretch of the story (tau): 0 = muzak only, 1 = tense pulse under the lift rides, 2..5 = the four floors, each heavier.
LEVELS = [(0, 1.9, 0), (1.9, 2.65, 1), (2.65, 7.35, 2), (7.35, 9.6, 1), (9.6, 15.85, 3), (15.85, 18.0, 1), (18.0, 24.45, 4), (24.45, 26.6, 1),
          (26.6, 34.05, 5), (34.05, 36.3, 1), (36.3, 99, 0)]
def level_at(tau):
    for a, b, lv in LEVELS:
        if a <= tau < b: return lv
    return 0
BPM2 = 140; ST = 60 / BPM2 / 4
PROG = [50, 50, 46, 48]                           # Dm | Dm | Bb | C, one bar each
RIFF = [0, 0, 12, 0, 0, 10, 0, 7, 0, 0, 12, 0, 3, 0, 5, 7]
def supersaw(f, u, n=5, spread=.012):
    return sum(saw(f * (1 + spread * (k - (n - 1) / 2) / ((n - 1) / 2)), u + k * 1e-3) for k in range(n)) / n
kick_t = []
drums = np.zeros(L, np.float32); bass = np.zeros(L, np.float32); strings = np.zeros(L, np.float32); top = np.zeros(L, np.float32)
n_steps = int(DUR / ST)
for k in range(n_steps):
    x = k * ST; lv = level_at(float(tau_of(x))); st = k % 16; bar = (k // 16) % 4; root = PROG[bar]
    if lv == 0: continue
    # pulse: sub bass eighths + a ticking rim (the clock of the ride)
    if lv == 1:
        if st % 2 == 0: u = U(ST * 1.8); put(bass, x, (np.sin(2 * np.pi * mtof(root - 24) * u) * np.exp(-u / .12)).astype(np.float32), .9)
        if st % 4 == 2: put(top, x, (bp(noise(int(.03 * SR)), 2500, 6000) * np.exp(-U(.03) / .006)).astype(np.float32), .5)
        if st == 0: put(drums, x, thump(90, 40, .5, .2), .9); kick_t.append(x)
        continue
    # drums
    if st % 4 == 0 or (lv >= 5 and st in (6, 14)) or (lv >= 3 and st == 11):
        put(drums, x, sm(thump(160, 45, .4, .1) * 1.3, hpf(noise(int(.01 * SR)), 3000) * .4), 1.0); kick_t.append(x)
    if st in (4, 12):
        u = U(.25); put(drums, x, sm(bp(noise(len(u)), 1200, 8000) * np.exp(-u / .07), thump(240, 180, .25, .05) * .6), .9)
    put(drums, x, (hpf(noise(int(.035 * SR)), 7000) * np.exp(-U(.035) / (.012 if st % 2 else .006))).astype(np.float32), .28 if st % 2 else .18)
    if lv >= 4 and st in (0, 3, 6, 10):   # taiko
        put(drums, x, sm(thump(95, 52, .6, .22) * 1.2, bp(noise(int(.6 * SR)), 70, 600) * np.exp(-U(.6) / .09) * .7), .9)
    if lv >= 4 and st == 0 and bar == 0:  # crash
        u = U(1.6); put(drums, x, (hpf(noise(len(u)), 4000) * np.exp(-u / .5)).astype(np.float32), .35)
    # bass: driving sixteenths
    u = U(ST * .95); f = mtof(root - 24 + (12 if st % 4 == 2 else 0))
    put(bass, x, (lpf(supersaw(f, u, 3, .006) * np.exp(-u / .09), 700) * 1.0 + np.sin(2 * np.pi * mtof(root - 24) * u) * np.exp(-u / .12) * .8).astype(np.float32), .75)
    # strings: staccato ostinato (+ octave from the dojo on)
    if lv >= 3:
        u = U(ST * .8); f = mtof(root + RIFF[st])
        s1 = lpf(supersaw(f, u) * np.exp(-u / .06) * np.minimum(1, u / .004), 3500)
        if lv >= 4: s1 = s1 + lpf(supersaw(f * 2, u) * np.exp(-u / .05), 5000) * .5
        put(strings, x, s1.astype(np.float32), .38)
    # brass stab every bar in the boss fight, arpeggio sparkle on top
    if lv >= 5 and st == 0:
        u = U(.9); br = sum(supersaw(mtof(m), u, 3, .008) for m in (root - 12, root - 5, root)) * np.exp(-u / .35) * np.minimum(1, u / .015)
        put(strings, x, lpf(br.astype(np.float32), 1600), .32)
    if lv >= 5 and st % 2 == 0:
        u = U(ST * 1.6); put(top, x, (np.sin(2 * np.pi * mtof(root + 24 + [0, 3, 7, 12, 7, 3, 0, -2][(st // 2) % 8]) * u) * np.exp(-u / .1)).astype(np.float32), .12)
# sidechain pump: bass and strings duck under every kick, which is what makes it drive
pump = np.ones(L, np.float32)
for kt in kick_t:
    i = int(kt * SR); n = int(.18 * SR); seg = 1 - .65 * np.exp(-np.arange(n) / SR / .06); pump[i:i + n] = np.minimum(pump[i:i + n], seg[:L - i])
score = drums * 1.0 + (bass * 1.0 + strings) * pump + top
slow_k = np.clip((1 - slow_only(tau_of(t))) / .8, 0, 1).astype(np.float32)
score = score * (1 - slow_k) + lpf(score, 300) * slow_k * .9                        # slow motion: the score goes under water
MG = float(os.environ.get('MG', '.85'))
add('music', score * MG, 0)
# risers into each floor reveal, braams when the doors open on the fighters
for d0 in (2.7, 9.1, 17.5, 26.0):
    u = U(1.0); add('music', (bp(noise(len(u)), 400, 6000) * (u / 1.0) ** 2.5 * .6 + np.sin(2 * np.pi * np.cumsum(200 + 600 * u) / SR) * (u / 1.0) ** 3 * .2).astype(np.float32), R(d0) - 1.0, .7)
    u = U(2.2); br = sum(saw(mtof(m), u) for m in (26, 33, 38, 38.1)) * np.exp(-u / 1.0) * np.minimum(1, u / .03)
    add('music', lpf(br.astype(np.float32), 700) * .3 + thump(60, 30, 2.2, .7) * .8, R(d0) + .05, .8, verb=.3)

# ------------------------------------------------------------------ the car and the doors
for a in TL['dings']: add('fx', ding(), R(a), .45, verb=.3)
DOOR_K = [[0, 0], [2.7, 0], [3.2, 1], [3.8, 1], [4.25, 0], [5.95, 0], [6.4, 1], [6.9, 1], [7.4, 0], [9.1, 0], [9.6, 1], [10.2, 1], [10.65, 0], [14.85, 0], [15.3, 1], [15.6, 1], [15.9, 0],
          [17.5, 0], [18.0, 1], [18.5, 1], [18.95, 0], [23.15, 0], [23.6, 1], [24.0, 1], [24.5, 0], [26.0, 0], [26.6, 1], [27.05, 1], [27.5, 0], [32.9, 0], [33.35, 1], [33.65, 1], [34.1, 0], [37.0, 0], [37.5, 1]]
for (a, va), (b, vb) in zip(DOOR_K[:-1], DOOR_K[1:]):
    if va != vb: add('fx', door(R(b) - R(a)), R(a), .45)
add('fx', thump(120, 80, .15, .03) * .4, R(1.38), .5, pan=-.4)                    # call button
add('fx', thump(120, 80, .15, .03) * .4, R(34.5), .5, pan=.4)                     # "30"
FLOOR_K = [[0, 4], [2.6, 1], [7.6, 1], [9.0, 8], [16.1, 8], [17.4, 17], [24.7, 17], [26.0, 26], [34.4, 26], [36.3, 30]]
def io(k): k = np.clip(k, 0, 1); return np.where(k < .5, 4 * k ** 3, 1 - (-2 * k + 2) ** 3 / 2)
tt = tau_of(t); fl = np.full(L, 30.0)
for (a, va), (b, vb) in zip(FLOOR_K[:-1], FLOOR_K[1:]):
    m = (tt >= a) & (tt < b); fl[m] = va + (vb - va) * io((tt[m] - a) / (b - a))
fl[tt < 0] = 4
vel = lpf((np.abs(np.gradient(fl)) * SR).astype(np.float32), 8); mv = np.clip(vel / 3, 0, 1.4)
pov = gate([[7.4, 9.6], [15.9, 18.0], [24.5, 26.6], [34.1, 39.45]], .05)
ph = np.cumsum(60 + 140 * mv) / SR
add('amb', ((np.sin(2 * np.pi * ph) + .4 * np.sin(4 * np.pi * ph)) * np.clip(mv * 1.5, 0, 1) * .16 * pov + bp(noise(L), 200, 1200) * np.clip(mv, 0, 1) * .1 * pov).astype(np.float32), 0)
add('amb', lpf(noise(L), 250) * .22, 0)
# footsteps
for a, b, heavy, pn in ((0.05, 1.25, False, -.5), (3.3, 3.55, False, 0), (6.0, 6.85, False, 0), (9.7, 10.05, False, 0), (10.15, 10.28, False, .4), (14.9, 15.55, False, .2),
                        (18.05, 18.4, False, 0), (18.45, 18.62, False, -.5), (19.35, 19.5, False, -.4), (22.5, 22.62, False, .3), (23.6, 23.85, False, 0),
                        (26.65, 26.95, False, 0), (27.0, 27.1, False, .1), (33.05, 33.6, False, -.1), (30.0, 30.2, False, -.3)):
    x = a
    while x < b: add('fx', footstep(heavy), R(x), .45, pan=pn); x += .18
for tau in (28.15, 28.5, 28.85): add('fx', footstep(True), R(tau), 1.0, verb=.4)         # the brute's steps
# a whoosh before every blow, then the blow
for m in TL['impacts']:
    at, sz = R(m['tau']), m['size']
    if m.get('nospark'): continue
    add('fx', whoosh(.2), at - .13, .7 * min(1.2, .6 + sz * .4))
    add('fx', hit(max(.5, sz)), at, .85 + .2 * sz, verb=.15 + .12 * sz)
    if m.get('flash'): add('fx', hpf(noise(int(.08 * SR)), 4000) * np.exp(-U(.08) / .02), at, .6)
for a, b, s in TL['slow']: add('fx', whoom(1.0), R(a - .03), .7, verb=.4)
# set pieces
add('fx', sm(crash_wood(1.0), paper(1.2)), R(5.6), .9, pan=.5, verb=.3)                  # over the reception desk
add('fx', wood(1800, .25) * .6, R(10.9), .6, pan=.2)                                   # the knife hits the floor
add('fx', paper(.8), R(10.88), .5, pan=-.3)
add('fx', sm(crash_wood(1.2), paper(1.4), hpf(noise(int(.3 * SR)), 2000) * np.exp(-U(.3) / .05)), R(12.4), 1.0, pan=-.6, verb=.3)   # desk + monitor
u = U(1.6); add('fx', (lpf(noise(len(u)), 2500) * np.exp(-u / .3) + bp(noise(len(u)), 300, 1500) * np.exp(-u / .6) * .6).astype(np.float32), R(13.25), 1.0, pan=.5, verb=.3)  # water cooler bursts
add('fx', thump(90, 50, .4, .08) * .7, R(13.27), .7, pan=.4)
add('fx', sm(paper(1.0) * 1.5, thump(80, 45, .5, .1) * .7), R(22.35), 1.0, pan=-.6, verb=.3)   # through the paper screen
add('fx', crash_wood(1.4), R(23.3), 1.0, pan=.6, verb=.3)                                     # weapon rack
add('fx', sm(wood(320, .35), hpf(noise(int(.3 * SR)), 2500) * np.exp(-U(.3) / .02)), R(27.15), 1.0, verb=.3)   # the staff snaps
for k, tau in enumerate((27.55, 27.62)): add('fx', wood(500 + 120 * k), R(tau + .25), .5, pan=(-.3, .4)[k])
u = U(1.2); add('fx', (thump(80, 40, 1.2, .3) + sum(a * np.sin(2 * np.pi * f * u) * np.exp(-u / .5) for f, a in ((180, .3), (410, .2), (690, .1)))).astype(np.float32), R(27.8), 1.0, pan=-.5, verb=.5)  # into the pipe
add('fx', hiss(R(34.1) - R(27.8)) * .07, R(27.8), 1.0, pan=-.5)                         # the burst pipe keeps hissing
u = U(.5); add('fx', (np.sin(2 * np.pi * np.cumsum(500 + 300 * np.sin(u * 30)) / SR) * .2 * np.sin(np.pi * u / .5)).astype(np.float32), R(29.4), .6, pan=-.2)   # valve squeal
add('fx', hiss(R(30.6) - R(29.55)) * np.minimum(1, U(R(30.6) - R(29.55)) / .05).astype(np.float32) * .8, R(29.55), 1.0, pan=-.3, verb=.3)   # steam in his face
add('fx', sm(thump(70, 28, 1.5, .4) * 1.4, bp(noise(int(1.5 * SR)), 200, 3000) * np.exp(-U(1.5) / .2)), R(29.1), 1.1, verb=.5)   # fists into the floor
add('fx', sm(thump(60, 25, 2.0, .6) * 1.5, bp(noise(int(2 * SR)), 100, 4000) * np.exp(-U(2) / .4)), R(31.8), 1.2, verb=.6)       # the grating gives way
add('fx', thump(50, 25, 1.5, .5), R(32.3), .6, verb=.8)                                           # ... and he lands far below
for k in range(5): add('fx', np.sign(np.sin(2 * np.pi * (800 + 400 * (k % 3)) * U(.05))).astype(np.float32) * .15, R(36.45 + k * .08), .6)   # the panel glitches to 1
add('fx', whoosh(.55, 300, 4000, up=True), R(31.15), 1.0, verb=.3)
add('fx', sm(thump(60, 25, 2.0, .7) * 1.6, hpf(noise(int(.2 * SR)), 2000) * np.exp(-U(.2) / .03)), R(31.75), 1.2, verb=.6)
# the ending: silence, a braam, the comic sting, then everyone raises their fists
u = U(3.0); br = sum(saw(mtof(m), u) for m in (26, 26.1, 33, 38, 41)) * np.exp(-u / 1.4) * np.minimum(1, u / .05)
add('music', (lpf(br.astype(np.float32), 900) * .4 + thump(55, 25, 3.0, 1.0) * 1.0), R(37.05), 1.0, verb=.5)
for k, (m, at) in enumerate(((64, 37.75), (63, 38.0), (62, 38.3))): add('music', rhodes(m, 1.6, .5), R(at), .9)
add('music', sm(thump(90, 35, 1.2, .3) * 1.4, bp(noise(int(SR)), 100, 3000) * np.exp(-U(1) / .15)), R(38.76), 1.0, verb=.4)
for k in range(6): add('music', sm(thump(100, 60, .4, .12), bp(noise(int(.4 * SR)), 80, 500) * np.exp(-U(.4) / .06) * .5), R(38.85) + k * .07, .5 + .1 * k)
add('music', sm(thump(70, 25, 2.5, .8) * 1.6, lpf(noise(int(2.5 * SR)), 600) * np.exp(-U(2.5) / .5)), R(39.2), 1.2, verb=.6)

# ------------------------------------------------------------------ master
ir_n = int(1.8 * SR); ir_u = np.arange(ir_n) / SR
ir = [lpf(noise(ir_n), 6000) * np.exp(-ir_u / .4) for _ in range(2)]
verb = np.stack([fftconvolve(bus['verb'][c], ir[c])[:L] for c in range(2)]).astype(np.float32) * .05
mix = bus['music'] * .9 + bus['fx'] * .7 + bus['amb'] * .5 + verb
if os.environ.get('STEMS'):
    for nm, gg in (('music', .9), ('fx', .7)):
        x = bus[nm] * gg
        for a, b in ((4, 7), (12, 16), (22, 26), (32, 36)):
            seg = x[:, int(a * SR):int(b * SR)]; print(nm, a, b, f'{20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9):.1f} dB RMS')
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
vs.options = {'crf': '19', 'preset': 'medium', 'profile': 'high', 'colorprim': 'bt709', 'transfer': 'bt709', 'colormatrix': 'bt709'}
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
