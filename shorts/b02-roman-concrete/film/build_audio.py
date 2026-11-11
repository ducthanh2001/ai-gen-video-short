"""voice + synthesised SFX + quiet room tone -> audio_mix.wav (44.1k stereo, pre-master) + sfx_log.json. Run with the anime venv python."""
import os, json, numpy as np, soundfile as sf, soxr
from scipy import signal
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(EP, 'film', 'timeline.json')))
SR = 44100; TOTAL = TL['total']; N = int(SR * (TOTAL + .3))
L = TL['lines']; rs = np.random.RandomState(7)
def lt(i, off=0): return L[i]['start'] + off
# shot starts (must match film/shots_*.js)
def env_exp(n, tau): return np.exp(-np.arange(n) / (SR * tau))
def noise(n): return rs.randn(n)
def lp(x, fc, o=2): b, a = signal.butter(o, fc / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, fc, o=2): b, a = signal.butter(o, fc / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, lo, hi, o=2): b, a = signal.butter(o, [lo / (SR / 2), hi / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def whoosh(d=.5, f0=400, f1=4000, down=False):
    n = int(SR * d); x = noise(n); out = np.zeros(n); k = 16; seg = n // k
    for i in range(k):
        a = i / (k - 1); f = f0 * (f1 / f0) ** ((1 - a) if down else a); s = slice(i * seg, (i + 1) * seg if i < k - 1 else n)
        out[s] = bp(x[s] if len(x[s]) > 30 else np.pad(x[s], (0, 30)), max(80, f * .6), min(f * 1.5, 18000))[:len(out[s])]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6; return out * e * 1.2
def ding(f=1318, d=1.2):
    n = int(SR * d); t = np.arange(n) / SR; x = np.zeros(n)
    for m, a, tau in [(1, 1, .6), (2.0, .35, .35), (2.76, .25, .2), (4.1, .08, .1)]: x += a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / tau)
    x[:int(.002 * SR)] *= np.linspace(0, 1, int(.002 * SR)); return x * .6
def pop(d=.14):
    n = int(SR * d); t = np.arange(n) / SR; f = 700 * np.exp(-t * 18) + 120; ph = 2 * np.pi * np.cumsum(f) / SR; return np.sin(ph) * np.exp(-t / .035)
def thud(d=.5, f=70, hard=1):
    n = int(SR * d); t = np.arange(n) / SR; fr = f * np.exp(-t * 6) + f * .5; x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / .16) + lp(noise(n), 300) * np.exp(-t / .05) * .6 * hard; return x
def boom(d=1.6):
    n = int(SR * d); t = np.arange(n) / SR; x = thud(d, 52) * 1.1 + lp(noise(n), 160) * np.exp(-t / .5) * .8; return x
def scrape(d=2.4):
    n = int(SR * d); t = np.arange(n) / SR; x = bp(noise(n), 1800, 6500); stroke = (0.5 + 0.5 * np.sin(2 * np.pi * 5 * t - 1.2)) ** 2; x *= stroke * .8; x += hp(noise(n), 5000) * stroke * .15
    return x * np.minimum(1, np.minimum(t / .1, (d - t) / .2))
def ticks(times, f=2400):
    out = np.zeros(int(SR * (times[-1] + .2)))
    for tm in times:
        i = int(tm * SR); n = int(.02 * SR); tt = np.arange(n) / SR; c = (np.sin(2 * np.pi * f * tt) * .7 + noise(n) * .3) * np.exp(-tt / .004); out[i:i + n] += c
    return out
def swell(d=1.8):
    n = int(SR * d); t = np.arange(n) / SR; e = (t / d) ** 2; x = lp(noise(n), 400) * e * 1.2 + np.sin(2 * np.pi * 48 * t) * e * .5 + np.sin(2 * np.pi * 96 * t) * e * .2; return x * np.minimum(1, (d - t) / .25 + .0)
def zap(d=.7):
    n = int(SR * d); t = np.arange(n) / SR; f = 300 + 3200 * (t / d) ** 2; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - t / d) * .5 + bp(noise(n), 2000, 9000) * np.sin(np.pi * t / d) * .25; return x

mix = np.zeros(N); log = []
def make_ir(d=.55):
    n = int(SR * d); t = np.arange(n) / SR; ir = lp(noise(n), 5000) * np.exp(-t / .12); ir[:int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR)); ir /= np.sqrt((ir ** 2).sum()); return ir
IR = make_ir()
def soften(x, att=.012, wet=.22, room=True):
    x = x.copy(); n = int(att * SR)
    if len(x) > n: x[:n] *= np.linspace(0, 1, n) ** 1.5
    x = lp(x, 9000, 1)                               # take the digital edge off
    if room: x = x + wet * signal.fftconvolve(x, IR)[:len(x)] * 1.6
    return x
def put(t, x, g, name, room=True, att=.012):
    x = soften(x, att, room=room); i = int(t * SR); x = x * g; x = x[:max(0, N - i)]; mix[i:i + len(x)] += x; log.append({'t': round(t, 3), 'name': name, 'gain_db': round(20 * np.log10(g), 1)})

# --- SFX list (B02) ---
W = {w['raw'] + str(i): w for i, w in enumerate(TL['words'])}
C = TL['cuts']
def bubbling(d=3.8, rate=28):
    n = int(SR * d); out = np.zeros(n); k = int(d * rate)
    for i in range(k):
        st = rs.rand() * (d - .1); f0 = 140 + rs.rand() * 380; m = int(.06 * SR); t = np.arange(m) / SR
        x = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * t / .06)) / SR) * np.exp(-t / .018); j = int(st * SR); out[j:j + m] += x[:max(0, n - j)] * (0.4 + rs.rand() * .6)
    return lp(out, 2500) * np.minimum(1, np.arange(n) / (SR * .2))
def hiss(d=1.4):
    n = int(SR * d); t = np.arange(n) / SR; x = bp(noise(n), 2500, 11000) * np.exp(-t / (d * .45)) * np.minimum(1, t / .03); return x
def pour(d=2.0):
    n = int(SR * d); t = np.arange(n) / SR; x = bp(noise(n), 400, 3500) * (0.6 + 0.4 * lp(noise(n), 8) * 4); x += bubbling(d, 18) * .4; return x * np.minimum(1, np.minimum(t / .1, (d - t) / .3))
def crackle(d=.6):
    n = int(SR * d); t = np.arange(n) / SR; x = hp(noise(n), 1500) * np.exp(-t / .03) * 1.2
    for i in range(14): j = int(rs.rand() * d * .7 * SR); m = int(.006 * SR); x[j:j + m] += hp(noise(m), 2500) * (rs.rand() * .8) * np.exp(-np.arange(m) / (SR * .002))
    return x + thud(d, 90, .3) * .5
def slam(d=2.2):
    n = int(SR * d); t = np.arange(n) / SR; x = boom(d) * .9 + lp(noise(n), 1800) * np.exp(-t / .5) * np.minimum(1, t / .02) * .9; return x
def thunder(d=2.5):
    n = int(SR * d); t = np.arange(n) / SR; x = lp(noise(n), 220, 3) * (np.exp(-t / .9)) * 2.5 + lp(noise(n), 900) * np.exp(-t / .12) * .6; return x
def fizz(d=2.6):
    n = int(SR * d); t = np.arange(n) / SR; x = hp(noise(n), 4500) * .25 * np.minimum(1, np.minimum(t / .3, (d - t) / .6))
    for i in range(int(d * 40)): j = int(rs.rand() * (d - .05) * SR); m = int(.01 * SR); x[j:j + m] += np.sin(2 * np.pi * (2000 + rs.rand() * 4000) * np.arange(m) / SR) * np.exp(-np.arange(m) / (SR * .002)) * .35
    return x
def tinkle(d=1.6):
    n = int(SR * d); out = np.zeros(n)
    for i in range(9): st = i * .09 + rs.rand() * .04; f = 2200 + rs.rand() * 2600; m = int(.5 * SR); tt = np.arange(m) / SR; j = int(st * SR); out[j:j + m] += (np.sin(2 * np.pi * f * tt) + .4 * np.sin(2 * np.pi * f * 2.7 * tt)) * np.exp(-tt / .12) * .4
    return out
def drips(d=2.6, slow=True):
    n = int(SR * d); out = np.zeros(n); t = 0.0; k = 0
    while t < d - .15: j = int(t * SR); x = pop(.12) * .7; x = lp(x, 3000); out[j:j + len(x)] += x[:n - j] * (1 - .6 * t / d if slow else 1); k += 1; t += (.18 + k * .05 if slow else .16 + rs.rand() * .05)
    return out
def motor(d=3.3):
    n = int(SR * d); t = np.arange(n) / SR; x = (np.sin(2 * np.pi * 62 * t) * .4 + np.sin(2 * np.pi * 124 * t) * .25 + lp(noise(n), 400) * .5) * np.sin(np.pi * t / d) ** 2; return x

put(0.0, bubbling(C['s2'] + 0.3), .22, 'bubbling mix (hook)', att=.002)
put(C['boil'] - .03, hiss(1.6), .16, 'steam hiss burst (boil)', att=.004)
put(C['s3'] - .12, whoosh(.55, 300, 3500), .09, 'whoosh (cut to the wide)')
put(C['soaked'] - .2, pour(2.0), .12, 'water poured on lime')
put(C['threw'] + .05, whoosh(.5, 900, 6000), .07, 'powder shake (quicklime)')
put(C['lumps'], ding(1175, 1.3), .09, 'ding (lumps)')
put(C['sloppy'] + .02, pop(), .2, 'pop (master jabs a lump)', att=.003)
_s = np.zeros(int(SR * 3.4)); _a = thunder(2.6); _s[:len(_a)] += _a; _b = slam(2.2); _o = int(.35 * SR); _s[_o:_o + len(_b)] += _b
put(C['storm'] - .25, _s, .3, 'thunder + wave slam (storm)', att=.01)
put(C['cracked7'] - .02, crackle(.7), .3, 'crack (wall)', att=.002)
put(C['s8'] - .1, whoosh(.7, 2400, 300, True), .09, 'whoosh dive into the crack')
put(C['hit'], pop(.18), .16, 'drip hits the lump', att=.003)
put(C['never'] - .2, fizz(C['hardened'] - C['never'] + 1.4), .16, 'fizz (lump dissolving)')
put(C['sealed'] - .05, tinkle(1.8), .12, 'crystal tinkle (sealed)')
put(C['madeup'], ding(988, 1.2), .07, 'soft ding (made up)')
put(C['s12'] - .12, whoosh(.55, 400, 4500), .08, 'whoosh to the lab')
put(C['cracked12'] - .02, crackle(.5), .22, 'crack snap (cylinder)', att=.002)
put(C['two13'] - .3, drips(C['stopped'] - C['two13'] + .3, True), .2, 'lab drips slowing', room=False)
put(C['s14'] + .1, pour(2.6), .1, 'water pouring through (no quicklime)')
n_sfx = len(log)
# --- room tone, one bed per location, crossfaded (very quiet) ---
def bed(kind, d):
    n = int(SR * d); t = np.arange(n) / SR
    if kind == 'site': x = lp(noise(n), 700) * .45 * (0.75 + 0.25 * lp(noise(n), 3) * 8) + hp(lp(noise(n), 3000), 1200) * .05
    elif kind == 'storm': x = lp(noise(n), 2500) * .55 + lp(noise(n), 200, 3) * .9
    elif kind == 'xs': x = np.sin(2 * np.pi * 55 * t) * .05 + lp(noise(n), 300) * .3
    elif kind == 'lab': x = lp(noise(n), 900) * .2 + np.sin(2 * np.pi * 120 * t) * .02
    else: x = lp(noise(n), 600) * .45 * (0.75 + 0.25 * lp(noise(n), 3) * 8)
    return x
segs = [('site', 0, C['s7']), ('storm', C['s7'], C['s8']), ('xs', C['s8'], C['s10'] + (C['s11'] - C['s10']) * .5), ('storm', C['s10'] + (C['s11'] - C['s10']) * .5, C['s11']),
        ('site', C['s11'], C['s12']), ('lab', C['s12'], C['s15a']), ('ruins', C['s15a'], TOTAL + .3)]
rt = np.zeros(N)
for k, a, b in segs:
    i0, i1 = int(max(0, a - .15) * SR), min(N, int((b + .15) * SR)); x = bed(k, (i1 - i0) / SR + .01)[:i1 - i0]; w = np.ones(len(x)); f = int(.3 * SR); w[:f] = np.linspace(0, 1, f); w[-f:] = np.linspace(1, 0, f); rt[i0:i1] += x * w
# --- voice ---
voice = np.zeros(N)
for lid, v in L.items():
    a, sr = sf.read(os.path.join(EP, 'voice', lid + '.wav'), dtype='float64'); a = soxr.resample(a, sr, SR)
    if lid in ('l06c', 'l15a'): a = lp(a, 6500, 1) * 0.72          # slower, softer take
    i = int(v['start'] * SR); voice[i:i + len(a)] += a[:max(0, N - i)]
sf.write(os.path.join(EP, 'film', 'voice_raw.wav'), voice, SR)
sf.write(os.path.join(EP, 'film', 'sfx_raw.wav'), mix, SR)
sf.write(os.path.join(EP, 'film', 'room_raw.wav'), rt, SR)
json.dump({'n_sfx': n_sfx, 'per_min': round(n_sfx / TOTAL * 60, 1), 'events': log, 'rt_note': 'room tone per location, about -50 dBFS'}, open(os.path.join(EP, 'film', 'sfx_log.json'), 'w'), indent=1)
print('sfx', n_sfx, 'per min', round(n_sfx / TOTAL * 60, 1))
