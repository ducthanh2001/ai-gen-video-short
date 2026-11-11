"""voice + synthesised SFX + quiet room tone -> audio_mix.wav (44.1k stereo, pre-master) + sfx_log.json. Run with the anime venv python."""
import os, json, numpy as np, soundfile as sf, soxr
from scipy import signal
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(EP, 'film', 'timeline.json')))
SR = 44100; TOTAL = TL['total']; N = int(SR * (TOTAL + .3))
L = TL['lines']; rs = np.random.RandomState(7)
def lt(i, off=0): return L[i]['start'] + off
# shot starts (must match film/shots_*.js)
C = TL['cuts']
SH = {'2': L['l02']['start'] - .09, '3': C['h8'], '4': L['l04']['start'] - .1, '5a': L['l05']['start'] - .1, '6': L['l06']['start'] - .05, '7': L['l07']['start'] - .1,
      '8': L['l08']['start'] - .08, '9': L['l09']['start'] - .12, '10a': L['l10']['start'] - .06, '10b': C['x_roman'] + .08, '11a': L['l11']['start'] - .04, '11b': C['x_one'] - .06,
      '12': L['l12']['start'] - .12, '13': L['l13']['start'] - .12}
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

# --- SFX list (17 events; tied to caption words and cuts) ---
W = {w['raw'] + str(i): w for i, w in enumerate(TL['words'])}
def wt(line, raw):
    for w in TL['words']:
        if w['line'] == line and w['raw'].strip('.,:;') == raw: return w['t0']
put(0.05, ticks([i * .055 for i in range(16)]), .13, 'gear ticks (box, hook)', room=False)
put(C['h2'] - .16, whoosh(.45, 300, 5000), .10, 'whip whoosh (box to king)')
put(C['slap'], thud(.3, 120, .4) * 1.2, .26, 'throne arm slap', att=.004)
put(wt('l02', 'gods'), ding(1175, 1.4), .09, 'ding (gods)')
put(SH['3'] - .12, whoosh(.5, 300, 4000), .09, 'whoosh (cut to king)')
put(wt('l03', 'head') - .02, thud(.6, 70), .30, 'thud (head)', att=.006)
put(SH['4'] + .15, scrape(2.7), .12, 'file scrape')
put(wt('l05', 'forty') + .0, ding(1568, 1.6), .10, 'ding (forty)')
_sw = np.zeros(int(SR * 3.0)); _sw[:int(2.0 * SR)] += swell(2.0); _o = int((wt('l07', 'dark') - (SH['7'] + 0.9)) * SR); _th = thud(1.1, 52) * 1.2; _sw[_o:_o + len(_th)] += _th
put(SH['7'] + 0.9, _sw, .24, 'rumble swell + low thud (eclipse, dark)', att=.03)
_b = boom(1.7); _t2 = thud(1.2, 44) * 1.3; _b[:len(_t2)] += _t2
put(wt('l08', 'laughed') + .05, _b, .34, 'boom + sub thud (nobody laughed)', att=.006)
put(SH['10a'] - .1, whoosh(.5, 200, 1800, True), .08, 'whoosh (cut to sea)')
put(SH['10b'] + .62, pop(), .22, 'pop (gear spotted)')
put(SH['11a'] - .1, zap(.7), .13, 'zap (x-ray)')
put(wt('l11', 'thirty') - .05, ticks([i * .033 for i in range(30)], 3200), .10, 'counter ticks 0-30', room=False)
put(C['x_19'], ding(1480, 1.4), .10, 'ding (19 years label)')
put(C['x_223'], ding(1760, 1.5), .10, 'ding (223 months label)')
put(SH['12'] - .1, whoosh(.55, 400, 5000), .09, 'whoosh (cut to mechanism)')
put(SH['13'] - .1, whoosh(.9, 150, 900, True), .10, 'low whoosh (pull-out)')
n_sfx = len(log)
# --- room tone, one bed per location, crossfaded (very quiet) ---
def bed(kind, d):
    n = int(SR * d); t = np.arange(n) / SR
    if kind == 'hall': x = lp(noise(n), 500) * .5 + np.sin(2 * np.pi * 110 * t) * .02
    elif kind == 'shop': x = lp(noise(n), 900) * .4 + np.sin(2 * np.pi * 85 * t) * .03 + (rs.rand(n) > .9995) * noise(n) * .2
    elif kind == 'sky': x = lp(noise(n), 1500) * .35
    elif kind == 'void': x = np.sin(2 * np.pi * 60 * t) * .06 + lp(noise(n), 200) * .3
    elif kind == 'sea': x = lp(noise(n), 350, 3) * .9 * (0.7 + 0.3 * np.sin(2 * np.pi * .3 * t))
    elif kind == 'museum': x = lp(noise(n), 300) * .25 + np.sin(2 * np.pi * 120 * t) * .01
    elif kind == 'xray': x = np.sin(2 * np.pi * 220 * t) * .03 + np.sin(2 * np.pi * 330.5 * t) * .02 + hp(noise(n), 4000) * .03
    else: x = lp(noise(n), 600) * .3 + np.sin(2 * np.pi * 150 * t) * .02
    return x
segs = [('hall', 0, SH['4']), ('shop', SH['4'], SH['7']), ('sky', SH['7'], SH['8']), ('hall', SH['8'], SH['9']), ('void', SH['9'], SH['10a']), ('sea', SH['10a'], SH['10b']), ('museum', SH['10b'], SH['11a']), ('xray', SH['11a'], SH['12']), ('hall', SH['12'], SH['13']), ('sea', SH['13'], TOTAL + .3)]
rt = np.zeros(N)
for k, a, b in segs:
    i0, i1 = int(max(0, a - .15) * SR), min(N, int((b + .15) * SR)); x = bed(k, (i1 - i0) / SR + .01)[:i1 - i0]; w = np.ones(len(x)); f = int(.3 * SR); w[:f] = np.linspace(0, 1, f); w[-f:] = np.linspace(1, 0, f); rt[i0:i1] += x * w
# --- voice ---
voice = np.zeros(N)
for lid, v in L.items():
    a, sr = sf.read(os.path.join(EP, 'voice', lid + '.wav'), dtype='float64'); a = soxr.resample(a, sr, SR); i = int(v['start'] * SR); voice[i:i + len(a)] += a
sf.write(os.path.join(EP, 'film', 'voice_raw.wav'), voice, SR)
sf.write(os.path.join(EP, 'film', 'sfx_raw.wav'), mix, SR)
sf.write(os.path.join(EP, 'film', 'room_raw.wav'), rt, SR)
json.dump({'n_sfx': n_sfx, 'per_min': round(n_sfx / TOTAL * 60, 1), 'events': log, 'rt_note': 'room tone per location, about -50 dBFS'}, open(os.path.join(EP, 'film', 'sfx_log.json'), 'w'), indent=1)
print('sfx', n_sfx, 'per min', round(n_sfx / TOTAL * 60, 1))
