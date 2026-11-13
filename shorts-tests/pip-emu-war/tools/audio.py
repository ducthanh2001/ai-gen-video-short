"""Emu War Short: voice + generated comedy score + SFX -> audio_mix.wav (48 kHz stereo, about -14 LUFS).
Event times come from film/tl.json, the same timeline the picture uses."""
import json, math, os
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(P, 'film', 'tl.json')))
SR = 48000; DUR = TL['total']; L = int(DUR * SR) + SR // 2
S = lambda i: TL['L'][i][0]; E = lambda i: TL['L'][i][1]
rng = np.random.default_rng(7)
bus = {k: np.zeros(L, np.float32) for k in ('voice', 'music', 'fx')}

def U(d): return np.arange(int(d * SR)) / SR
def add(name, x, at, g=1.0):
    i = int(at * SR)
    if i >= L: return
    x = x[:L - i]; bus[name][i:i + len(x)] += x.astype(np.float32) * g
def flt(x, kind, f, o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x).astype(np.float32)
def noise(n): return rng.normal(0, 1, n).astype(np.float32)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

# ---------- instruments ----------
def marimba(m, d=.5):
    u = U(d); f = mtof(m)
    return (np.sin(2*np.pi*f*u)*np.exp(-u/.22) + .35*np.sin(2*np.pi*f*4*u)*np.exp(-u/.05)) * np.minimum(1, u/.002)
def pizz(m, d=.45):
    u = U(d); f = mtof(m); x = sum(np.sin(2*np.pi*f*k*u)/k**1.4 for k in range(1, 6))
    return x * np.exp(-u/.16) * np.minimum(1, u/.004) * .6
def shaker(d=.06):
    u = U(d); return flt(noise(len(u)), 'highpass', 6000) * np.exp(-u/.018) * .25
def kick(d=.25):
    u = U(d); f = 45 + 90*np.exp(-u/.03); return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-u/.09)

# ---------- score: bouncy C major, 112 bpm, stops for the sad part ----------
BPM = 112; B = 60 / BPM
CH = [[48, 60, 64, 67], [53, 60, 65, 69], [55, 59, 62, 67], [48, 60, 64, 67]]
MEL = [72, None, 76, 74, 72, None, 69, 72, 74, None, 77, 76, 74, 72, 71, None]
music_end = S('L09') - .1
beat = 0; t = 0.0
while t < music_end:
    bar = (beat // 4) % 4; ch = CH[bar]
    add('music', pizz(ch[0] - 12 if beat % 2 == 0 else ch[0]), t, .55)
    if beat % 2 == 0: add('music', kick(), t, .35)
    for h in (0, .5): add('music', shaker(), t + h*B, .5 if h else .3)
    for h in (0, .5):
        n = MEL[(beat*2 + int(h*2)) % 16]
        if n is not None: add('music', marimba(n + (0 if bar < 2 else -3 if n % 12 == 4 else 0)), t + h*B, .3)
    beat += 1; t += B
# end sting after the last line: a cheeky "ta-da"
ts = E('L11') + .35
for k, m in enumerate([67, 72]): add('music', marimba(m, .9), ts + k*.14, .45); add('music', pizz(m - 24, .6), ts + k*.14, .6)
add('music', marimba(76, 1.4), ts + .28, .5); add('music', marimba(79, 1.4), ts + .28, .35)

# ---------- sfx ----------
def gunshot():
    u = U(.32); n = len(u)
    x = flt(noise(n), 'lowpass', 4500) * np.exp(-u/.035) * 1.1 + flt(noise(n), 'highpass', 2500) * np.exp(-u/.008) * .6
    f = 40 + 110*np.exp(-u/.025); x += np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-u/.07) * .9
    return x
def tink():
    u = U(.12); return np.sin(2*np.pi*(3500 + rng.random()*900)*u) * np.exp(-u/.03) * .25
def pop():
    u = U(.18); f = 300 + 900*u/.18; return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-u/.06) * .7
def tick():
    u = U(.03); return flt(noise(len(u)), 'bandpass', [2500, 5000]) * np.exp(-u/.006) * .5
def ding(f=1568):
    u = U(1.2); return (np.sin(2*np.pi*f*u)*np.exp(-u/.5) + .3*np.sin(2*np.pi*f*2.76*u)*np.exp(-u/.2)) * .4
def thud():
    u = U(.5); f = 40 + 70*np.exp(-u/.04)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-u/.12) + flt(noise(len(u)), 'lowpass', 1200)*np.exp(-u/.03)*.6
def whoosh(d=.45):
    u = U(d); k = u/d; return flt(noise(len(u)), 'bandpass', [400, 4000]) * np.sin(np.pi*k)**2 * .6
def step():
    u = U(.12); return flt(noise(len(u)), 'lowpass', 700) * np.exp(-u/.03) * .5
def sparkle():
    out = np.zeros(int(.6*SR), np.float32)
    for k, m in enumerate([88, 91, 95]):
        u = U(.4); x = np.sin(2*np.pi*mtof(m)*u)*np.exp(-u/.12)*.18; i = int(k*.06*SR); out[i:i+len(x)] += x
    return out
def trombone(m, d, bend=0):
    u = U(d); f = mtof(m) * 2 ** (bend * np.minimum(1, u/d) / 12) * (1 + .012*np.sin(2*np.pi*5.5*u*np.minimum(1, u/.3)))
    ph = np.cumsum(f)/SR; x = sum(np.sin(2*np.pi*ph*k) * (.9**k) for k in range(1, 9))
    env = np.minimum(1, u/.04) * np.minimum(1, (d-u)/.08)
    return flt(x*env, 'lowpass', 2200) * .22

add('fx', pop(), S('L02') - .25, .9)
# v2 shot cuts: crash zoom, gun slide-in + clank + pat, whip pan
def clank():
    u = U(.6); return sum(np.sin(2*np.pi*f*u)*np.exp(-u/dd)*a for f, a, dd in ((420, .5, .15), (1130, .35, .08), (2650, .2, .05))) + flt(noise(len(u)), 'highpass', 3000)*np.exp(-u/.01)*.4
WITH_T = next(c[0] for c in TL['caps'] if c[2][0][0] == 'WITH') - .05
add('fx', whoosh(.3), S('L02') - .2, 1.0)
add('fx', whoosh(.35), WITH_T - .05, .9); add('fx', clank(), WITH_T + .33, .9); add('fx', thud()*.5, WITH_T + .9, .7)
add('fx', whoosh(.3), S('L06') + 2.8, 1.1)
t0 = S('L03')
for k in range(26): add('fx', tick(), t0 + k*.05, .5)
add('fx', ding(), t0 + 1.3, .6)
t0 = S('L04')
for k in range(7): add('fx', step(), t0 + .15 + k*.35, .8)
add('fx', sparkle(), S('L05') + .15, 1)
t0 = S('L06'); dur = S('L07') - t0; k = 0
while .25 + k*.13 < dur - .25:
    at = t0 + .25 + k*.13; add('fx', gunshot(), at, .55 * (.85 + .3*rng.random()))
    if k % 3 == 1: add('fx', tink(), at + .55 + rng.random()*.2, .8)
    k += 1
add('fx', whoosh(.5), t0 + .3, .9); add('fx', whoosh(.4), t0 + .8, .6)
t0 = S('L07'); add('fx', pop(), t0, .6)
for k in range(32): add('fx', tick(), t0 + .35 + k*.05, .45)
add('fx', ding(1760), t0 + 1.95, .6)
add('fx', pop(), S('L08') - .1, .6); add('fx', ding(1175), S('L08') + .2, .4)
add('fx', thud(), S('L09') - .05, 1.1)
tb = S('L10') - .55
for k, (m, d, b) in enumerate([(55, .42, 0), (54, .42, 0), (53, .42, 0), (52, 1.3, -1)]):
    add('fx', trombone(m, d, b), tb + k*.45, 1)
for k in range(5): add('fx', step(), S('L10') + k*.39, .6)
add('fx', pop(), S('L11') + .9, .5)

# ---------- voice ----------
for lid in TL['L']:
    a, sr = sf.read(os.path.join(P, 'voice', lid + '.wav'), dtype='float32')
    if a.ndim > 1: a = a.mean(1)
    a = resample_poly(a, SR, sr).astype(np.float32)
    a = a / (np.sqrt(np.mean(a**2)) + 1e-9) * .12
    add('voice', a, S(lid))

# ---------- mix: duck music under voice ----------
env = np.abs(bus['voice']); win = int(.08*SR)
env = np.convolve(env, np.ones(win)/win, 'same'); env = np.minimum(1, env / .05)
duck = 1 - .6*flt(env, 'lowpass', 6, 1)
mix = bus['voice'] * 1.0 + bus['music'] * .55 * duck + bus['fx'] * .7
mix = flt(mix, 'highpass', 35)
# loudness to about -14 LUFS (K-weighting approximated by a gentle high shelf/highpass), then a soft limiter
kw = flt(flt(mix, 'highpass', 100), 'highpass', 60)
rms = np.sqrt(np.mean(kw**2)); lufs = 20*np.log10(rms + 1e-9) - .691
mix *= 10 ** ((-14 - lufs) / 20)
mix = np.tanh(mix * 1.05) * .97
st = np.stack([mix, mix], 1)
sf.write(os.path.join(P, 'audio_mix.wav'), st, SR)
print('wrote audio_mix.wav', round(len(mix)/SR, 2), 's; approx LUFS before gain', round(lufs, 1), '; peak', round(float(np.abs(mix).max()), 3))
