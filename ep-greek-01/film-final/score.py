"""Audio for Ep 01 (Greek): voice + original score (sampled instruments, CC0 libraries via lemo sampler) + sfx timed to cues.json.
Output: audio_mix.wav (48 kHz stereo, before loudness normalisation)."""
import os, sys, json, numpy as np, soundfile as sf, soxr
from scipy.signal import lfilter, butter, sosfilt
sys.path.insert(0, r'C:/Users/PC/lemo-opuscar')
from core.audio import sampler as S, sfx as X
from core.audio.sfx import SR, add
HERE = os.path.dirname(os.path.abspath(__file__))
C = json.load(open(os.path.join(HERE, 'cues.json'))); END = C['end']; N = int((END + 2) * SR)
S.seed(11); rng = np.random.default_rng(5)
chap = {c['label'][:3].strip(' ·'): c['t'] for c in C['chapters'] if c['label']}
T = {s['id']: s for s in C['sent']}
def sec(a, b): return (T[a]['s'], T[b]['s'] if b in T else END)
SECT = {'hook': (0, T['a1_1']['s']), 'I': (T['a1_1']['s'], T['b1_1']['s']), 'II': (T['b1_1']['s'], T['c1_1']['s']), 'III': (T['c1_1']['s'], T['d1_1']['s']),
        'IV': (T['d1_1']['s'], T['d9_1']['s']), 'V': (T['d9_1']['s'], T['e1_1']['s']), 'VI': (T['e1_1']['s'], T['f4_1']['s']), 'end': (T['f4_1']['s'], END + 2)}

# ---------------------------------------------------------------- voice
v, r = sf.read(os.path.join(HERE, 'narration.wav')); assert r == 24000
v = soxr.resample(v.astype(np.float32), 24000, SR); voice = np.zeros((N, 2), np.float32); voice[:len(v), 0] = v[:N]; voice[:len(v), 1] = v[:N]
voice *= 0.9

# ---------------------------------------------------------------- music
music = np.zeros((N, 2), np.float32)
def place(a, x):
    i = int(a * SR); j = min(N, i + len(x)); music[i:j] += x[:j - i]
def section(name, events, pad=3.0):
    a, b = SECT[name]; d = b - a + pad
    x = S.render([e for e in events if e[0] < d - .2], dur=d, master=False); x = S.room(x, size=.5, mix=.22)
    f_in, f_out = int(.8 * SR), int(pad * SR); x[:f_in] *= np.linspace(0, 1, f_in)[:, None]; x[-f_out:] *= np.linspace(1, 0, f_out)[:, None] ** 1.5
    place(a, x)
def arp(ev, t0, d, notes, inst, step, vel, pan=0.2, dur=2.0, jitter=0.0):
    t = t0; i = 0
    while t < d - 1:
        ev.append((t, inst, notes[i % len(notes)], dur, vel * (1 + 0.15 * ((i % 4) == 0)), pan * (1 if i % 2 else -1))); t += step; i += 1

# hook: low strings, pulse that tightens, timpani hit on the first line
a, b = SECT['hook']; d = b - a + 3
ev = [(0, 'cellos', 'D2', d, .45, -.2), (0, 'contrabass', 'D2', d, .35, .1), (4, 'violas', 'A3', d - 4, .25, .3), (10, 'violins_trem', 'D4', d - 10, .18, -.3), (0.0, 'timpani', 'D3', 3.0, .7, 0)]
t = 3.0
while t < d - 2: ev.append((t, 'cellos_spic', 'D3', .2, .3 + .2 * (t / d), -.2)); ev.append((t + .25, 'cellos_spic', 'A2', .2, .22, .2)); t += 0.5 if t < 18 else 0.375
section('hook', ev)
# I: ancient drone + harp, D Dorian
a, b = SECT['I']; d = b - a + 3
ev = [(0, 'cellos', 'D2', d, .4, -.2), (0, 'cellos', 'A2', d, .3, .2), (14, 'contrabass', 'D2', d - 14, .3, 0), (30, 'violas', 'F3', d - 30, .18, .3)]
t = 1.0; pent = ['D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'A3', 'C4']
while t < d - 2:
    ph = ['D4', 'F4', 'A4'] if rng.random() < .3 else list(rng.choice(pent, 3))
    for j, p in enumerate(ph): ev.append((t + j * .55, 'harp', p, 2.5, .45 + .1 * rng.random(), .25 - .5 * rng.random()))
    t += 3.2 + rng.random() * 1.6
section('I', ev)
# II: gentler, harp + flute, plus a tension drone under the swallow scenes
a, b = SECT['II']; d = b - a + 3
ev = [(0, 'cellos', 'D2', d, .3, -.2), (0, 'violas', 'A3', d, .16, .2)]
prog = [['D3', 'A3', 'D4', 'F4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['F2', 'C3', 'F3', 'A3'], ['C3', 'G3', 'C4', 'E4']]
q = 60 / 84
for k, t in enumerate(np.arange(0, d, q * 4)):
    ch = prog[k % 4]
    for j, p in enumerate(ch + [ch[2]]): ev.append((t + j * q * .75, 'harp', p, 2.0, .4, -.2 + .1 * j))
    if k % 2 == 1: ev.append((t + q, 'flute', ['A4', 'F4', 'D5', 'C5'][k // 2 % 4], q * 3, .3, .25))
section('II', ev)
# III: war: timpani ostinato, spiccato cellos, brass swells
a, b = SECT['III']; d = b - a + 3; q = 60 / 104
ev = [(0, 'contrabass', 'D2', d, .35, 0)]
for i, t in enumerate(np.arange(1.0, d - 2, q / 2)):
    ev.append((t, 'cellos_spic', ['D3', 'D3', 'F3', 'D3', 'E3', 'D3', 'C3', 'D3'][i % 8], .2, .3 + .25 * min(1, t / d) + .1 * (i % 4 == 0), -.2))
for t in np.arange(0, d - 2, q * 2): ev.append((t, 'timpani', 'D3' if int(t / q) % 4 == 0 else 'A2', 1.2, .5, 0))
for k, t in enumerate(np.arange(4, d - 6, 14)): ev.append((t, 'trombone', ['D3', 'F3', 'A2'][k % 3], 7, .28, 0)); ev.append((t + 1, 'horn', ['A3', 'C4', 'F3'][k % 3], 6, .2, .3))
ev += [(6, 'violins_trem', 'A4', d - 8, .15, .3), (24, 'violins_trem', 'D5', d - 26, .14, -.3)]
section('III', ev)
# IV: monster: low brass, tremolo violins, timpani rolls, then a stinger at the monster entrance
a, b = SECT['IV']; d = b - a + 3
ev = [(0, 'contrabass', 'D2', d, .4, 0), (0, 'tuba', 'D2', d, .3, 0), (4, 'violins_trem', 'Bb4', d - 4, .18, .3), (12, 'violins_trem', 'F#4', d - 12, .16, -.3)]
for t in np.arange(0, d - 2, 0.5): ev.append((t, 'timpani', 'D3', .6, .22 + .18 * (t / d), 0))
for t in (8.0, 22.0, 40.0, 56.0): ev.append((t, 'timpani', 'A2', 2.5, .65, 0))
section('IV', ev)
# V: the jar: nearly silent, bowed vibraphone + glass
a, b = SECT['V']; d = b - a + 3
ev = [(0, 'vibraphone_bowed', 'D4', d, .2, -.2), (3, 'vibraphone_bowed', 'A4', d - 3, .14, .3), (1, 'cellos', 'D2', d, .15, 0)]
for k, t in enumerate(np.arange(2, d - 2, 4.5)): ev.append((t, 'hand_chimes', ['D5', 'F5', 'A5', 'C6'][k % 4], 2.5, .25, .3 - .2 * (k % 3)))
section('V', ev)
# VI: Metis: harp + piano, rising tension to the swallow, then resolution
a, b = SECT['VI']; d = b - a + 3; q = 60 / 76
ev = [(0, 'cellos', 'D2', d, .3, -.2), (0, 'violas', 'A3', d, .14, .2)]
prog = [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4']]
for k, t in enumerate(np.arange(0, d - 4, 4 * q)):
    ch = prog[k % 4]
    for j, p in enumerate(ch + [ch[1]]): ev.append((t + j * q, 'harp', p, 2.0, .38, -.2))
    ev.append((t + .1, 'upright', S.name(S.midi(ch[2]) + 12), 2.4, .3, .25))
tw = T['e9_1']['s'] - a
ev += [(tw - 8, 'violins_trem', 'D5', 9, .2, -.2), (tw - 8, 'violas', 'A3', 9, .2, .2), (tw, 'timpani', 'D3', 3, .7, 0)]
for t in np.arange(tw - 8, tw, 0.75): ev.append((t, 'cellos_spic', 'D3', .2, .25 + .1 * (t - tw + 8) / 8, 0))
ev += [(T['e11_1']['s'] - a, 'cellos', 'D3', 24, .35, 0), (T['e11_1']['s'] - a, 'horn', 'A3', 24, .22, .2)]
section('VI', ev)
# end: resolved, glockenspiel for the question
a, b = SECT['end']; d = b - a + 3
ev = [(0, 'cellos', 'D2', d, .4, -.2), (0, 'violas', 'A3', d, .22, .2), (3, 'violins', 'F#4', d - 3, .2, -.3), (6, 'horn', 'D3', d - 8, .2, 0)]
for k, t in enumerate(np.arange(.6, d - 4, 3.5)):
    for j, p in enumerate(['D4', 'F#4', 'A4'] if k < 2 else ['D4', 'F#4', 'A4', 'D5']): ev.append((t + j * .42, 'upright', p, 2.0, .5, .1))
for j, p in enumerate(['A6', 'E6', 'C#6', 'A5', 'E6']): ev.append((2.0 + j * .32, 'glockenspiel', p, 1.5, .35, .3 - .15 * j))
section('end', ev)

# ---------------------------------------------------------------- ducking: voice sidechain, plus explicit silences
mono = np.abs(voice[:, 0]); sos = butter(2, 8, 'low', fs=SR, output='sos'); env = np.clip(sosfilt(sos, mono) * 8, 0, 1)
def smooth(x, att, rel):
    a1, r1 = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR)); y = np.empty_like(x); c = 0.0
    for i in range(0, len(x), 48):  # coarse (1 ms) steps are enough
        xi = x[i]; c = xi + a1 * (c - xi) if xi > c else xi + r1 * (c - xi); y[i:i + 48] = c
    return y
duck = 1 - 0.62 * smooth(env, 0.08, 0.55)
gain = np.ones(N, np.float32)
for s in C['shots']:
    for (t, n, g) in s['sfx']:
        if n == 'duck':
            i0, i1 = int(s['t0'] * SR), int(s['t1'] * SR); fade = int(0.4 * SR)
            lvl = 0.0 if abs(s['t1'] - s['t0']) < 4 else 0.15
            gain[max(0, i0 - fade):i0] = np.linspace(1, lvl, i0 - max(0, i0 - fade)); gain[i0:i1] = lvl
            j = min(N, i1 + int(1.5 * SR)); gain[i1:j] = np.linspace(lvl, 1, j - i1)
music *= (duck * gain)[:, None] * 0.55

# ---------------------------------------------------------------- sfx
sfxbus = np.zeros((N, 2), np.float32)
def lp(x, f): return X.lp(x, f)
def gulp():
    t = np.arange(int(.32 * SR)) / SR; f = 230 * np.exp(-t * 5) + 70; ph = np.cumsum(2 * np.pi * f / SR); x = np.sin(ph) * np.exp(-t * 7) + 0.4 * lp(X.noise(.32), 400) * np.exp(-t * 9); return X.norm(x, .8)
def moo():
    t = np.arange(int(1.1 * SR)) / SR; f = 110 + 30 * np.sin(t * 5) * np.exp(-t * 1.5) - 20 * t; ph = np.cumsum(2 * np.pi * f / SR); x = (np.sign(np.sin(ph)) * .5 + np.sin(ph)); x = lp(x, 700) * np.minimum(1, t * 12) * np.exp(-t * 2.2); return X.norm(x, .8)
def yip():
    out = np.zeros(int(.9 * SR));
    for k, st in enumerate([0, .22, .45]):
        t = np.arange(int(.12 * SR)) / SR; f = 900 + 500 * t / .12 * (1 + .2 * k); ph = np.cumsum(2 * np.pi * f / SR); y = np.sin(ph) * np.exp(-t * 18); i = int(st * SR); out[i:i + len(y)] += y
    return X.norm(out, .6)
def hiss():
    n = X.noise(1.2); return X.norm(X.bp(n, 3500, 9000) * np.minimum(1, np.arange(len(n)) / (.1 * SR)) * np.exp(-np.arange(len(n)) / SR * 1.5), .5)
def fire():
    n = X.noise(1.6); env = np.abs(X.noise(1.6)) ** 3; env = lp(env, 30); return X.norm(X.hp(n, 800) * env * np.exp(-np.arange(len(n)) / SR * .6), .5)
def windy():
    n = X.noise(2.6); t = np.arange(len(n)) / SR; return X.norm(X.bp(n, 300, 1800) * (0.7 + 0.3 * np.sin(t * 5)) * np.sin(np.pi * t / 2.6) ** 1.5, .45)
def rewind():
    w = X.whoosh(0.9, 1.0)[::-1].copy(); return w
def thunder(): r = X.rumble(2.6, 1.0); c = X.crash(0.7); out = r.copy(); out[:len(c)] += c[:len(out)] * .8; return X.norm(out, .9)
def chime(): return S.note('hand_chimes', 'A5', 1.5, vel=.6)
def sting(): return S.note('timpani', 'D3', 2.0, vel=.8) + .5 * S.note('violins_trem', 'D5', 1.6, vel=.5)[:int(2.0 * SR)].copy().repeat(1)[:int(2.0 * SR)].resize(int(2.0 * SR), refcheck=False) if False else S.note('timpani', 'D3', 2.0, vel=.8)
SFX = {'thud': lambda: X.thump(1.0, 60), 'gulp': gulp, 'thunder': thunder, 'whoosh': lambda: X.whoosh(.45, 1.0), 'pop': lambda: X.pop(1.0), 'ding': lambda: X.ding(1.0), 'chime': chime, 'sting': sting,
       'roar': lambda: X.roar(1.4, 1.0), 'rewind': rewind, 'moo': moo, 'yip': yip, 'hiss': hiss, 'fire': fire, 'wind': windy, 'crash': lambda: X.crash(1.0), 'rumble': lambda: X.rumble(1.6, 1.0)}
GAIN = {'thud': .9, 'gulp': .7, 'thunder': .8, 'whoosh': .35, 'pop': .22, 'ding': .3, 'chime': .35, 'sting': .6, 'roar': .55, 'rewind': .35, 'moo': .45, 'yip': .35, 'hiss': .35, 'fire': .4, 'wind': .35, 'crash': .55, 'rumble': .5}
cache = {}
for s in C['shots']:
    for (t, n, g) in s['sfx']:
        if n == 'duck' or n not in SFX: continue
        if n not in cache: cache[n] = SFX[n]()
        pan = float(rng.uniform(-.15, .15)); add(sfxbus, cache[n], t, GAIN[n] * g, pan)
    for k, tp in enumerate(s['pops'][:3]):
        if 'pop' not in cache: cache['pop'] = SFX['pop']()
        add(sfxbus, cache['pop'], tp, GAIN['pop'] * (0.9 - 0.2 * k), float(rng.uniform(-.2, .2)))
    if s['travel'] and s['t0'] > 1:
        if 'whoosh' not in cache: cache['whoosh'] = SFX['whoosh']()
        add(sfxbus, cache['whoosh'], s['t0'] - .05, .12, 0)
# chapter stingers
for c in C['chapters']:
    if c['label']: add(sfxbus, S.note('hand_chimes', 'D5', 1.4, vel=.5), c['t'], .3, 0)
mix = voice + music + sfxbus * 0.8
pk = np.abs(mix).max(); print('peak', round(float(pk), 3))
if pk > 0.95: mix *= 0.95 / pk
sf.write(os.path.join(HERE, 'audio_mix.wav'), mix, SR, subtype='PCM_16'); print('audio ok', round(len(mix) / SR, 1), 's')
