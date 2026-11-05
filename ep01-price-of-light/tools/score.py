"""Original score + foley for Ep 01, timed to shots.json → audio/music.wav, audio/sfx.wav (48 kHz stereo).
One three-note motif (D–F–A, rising) is the "price of light"; each era gets its own instrument family:
hook: low strings + upright piano · unit: pizzicato · ch1: drone + harp · ch2: harpsichord + violas · ch3: silent-film upright piano
twist: spiccato ostinato + tremolo · myth: vibraphone nocturne · end: the motif in D major, full strings, glockenspiel for the ice.
All samples CC0 (VSCO 2 CE, VCSL)."""
import os, sys, json, numpy as np, soundfile as sf
sys.path.insert(0, r'C:/Users/PC/lemo-opuscar')
from core.audio import sampler as S, sfx as X
from core.audio.sfx import SR, add
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = json.load(open(os.path.join(EP, 'shots.json')))
TOT = P['total'] + 1.0; N = int(TOT * SR)
SEC = P['sections']; S.seed(7)
os.makedirs(os.path.join(EP, 'audio'), exist_ok=True)

def section(name, events, pad=2.5):
    """render events (local times) for a section, with fades at both ends → placed into the music bus"""
    a, b = SEC[name]; d = b - a + pad
    x = S.render([e for e in events if e[0] < d - .2], dur=d, master=False)
    x = S.room(x, size=.5, mix=.22)
    n = len(x); f_in, f_out = int(.6 * SR), int(pad * SR)
    x[:f_in] *= np.linspace(0, 1, f_in)[:, None]; x[-f_out:] *= np.linspace(1, 0, f_out)[:, None] ** 1.5
    return a, x

def bars(bpm, beats=4): return 60 / bpm * beats
def chordseq(t0, dur, chords, inst, vel, bar, pan=0, oct_shift=0, art=1.0):
    ev, t, i = [], t0, 0
    while t < dur:
        for p in chords[i % len(chords)]: ev.append((t, inst, p, bar * art, vel, pan))
        t += bar; i += 1
    return ev

music = np.zeros((N, 2), np.float32)
def place(a, x):
    i = int(a * SR); j = min(N, i + len(x)); music[i:j] += x[:j - i]

# —— hook: low strings + the motif on the upright piano, one cell per cut ——
a, b = SEC['hook']; d = b - a
ev = [(0, 'cellos', 'D2', d, .42, -.2), (0, 'contrabass', 'D2', d, .35, .1), (6, 'violas', 'A3', d - 6, .25, .3), (14, 'violins', 'F4', d - 14, .18, -.3)]
for k, t in enumerate(np.arange(1.0, d - 2, 4.8)):
    for j, p in enumerate(['D4', 'F4', 'A4'] if k % 2 == 0 else ['D4', 'F4', 'C5']): ev.append((t + j * .42, 'upright', p, 1.6, .5, .1))
place(*section('hook', ev))
# —— unit: curious pizzicato, Dm – Bb – F – C ——
a, b = SEC['unit']; d = b - a; bpm = 100; q = 60 / bpm
ev = []
prog = [['D3', 'A3', 'D4', 'F4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['F2', 'C3', 'F3', 'A3'], ['C3', 'G3', 'C4', 'E4']]
for i, t in enumerate(np.arange(0, d, q)):
    ch = prog[int(t / (4 * q)) % 4]
    ev.append((t, 'violins_pizz', ch[2 + i % 2], .3, .42 + .1 * (i % 4 == 0), .3))
    if i % 2 == 0: ev.append((t, 'cellos_pizz', ch[0], .4, .5, -.25))
ev += [(0, 'violas', 'D3', d, .16, 0)]
place(*section('unit', ev))
# —— ch1: ancient drone + harp in D minor pentatonic ——
a, b = SEC['ch1']; d = b - a
ev = [(0, 'cellos', 'D2', d, .4, -.2), (0, 'cellos', 'A2', d, .3, .2), (20, 'contrabass', 'D2', d - 20, .3, 0)]
pent = ['D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'A3', 'C4']
rng = np.random.default_rng(11)
t = 1.0
while t < d - 2:
    phrase = ['D4', 'F4', 'A4'] if rng.random() < .3 else list(rng.choice(pent, 3))
    for j, p in enumerate(phrase): ev.append((t + j * .55, 'harp', p, 2.5, .45 + .1 * rng.random(), .25 - .5 * rng.random()))
    t += 3.2 + rng.random() * 1.6
place(*section('ch1', ev))
# —— ch2: harpsichord arpeggios (baroque cast) over a viola/cello pad ——
a, b = SEC['ch2']; d = b - a; bpm = 84; q = 60 / bpm
prog = [['D3', 'F3', 'A3', 'D4'], ['G2', 'Bb3', 'D4', 'G4'], ['C3', 'E3', 'G3', 'C4'], ['F3', 'A3', 'C4', 'F4'], ['Bb2', 'D3', 'F3', 'Bb3'], ['G2', 'Bb3', 'D4', 'G4'], ['A2', 'C#4', 'E4', 'A4'], ['D3', 'F3', 'A3', 'D4']]
ev = []
for i, t in enumerate(np.arange(0, d, q / 2)):
    ch = prog[int(t / (4 * q)) % len(prog)]
    ev.append((t, 'harpsichord', [ch[0], ch[1], ch[2], ch[3], ch[2], ch[1], ch[3], ch[2]][i % 8], .35, .4 + .12 * (i % 8 == 0), .2))
for k, t in enumerate(np.arange(0, d, 4 * q)):
    ch = prog[k % len(prog)]; ev += [(t, 'cellos', ch[0], 4 * q, .26, -.3), (t, 'violas', ch[2], 4 * q, .14, .3)]
place(*section('ch2', ev))
# —— ch3: the silent-film pianist (stride left hand, simple tune), F major ——
a, b = SEC['ch3']; d = b - a; bpm = 112; q = 60 / bpm
prog = [('F2', ['A3', 'C4', 'F4']), ('D2', ['F#3', 'C4', 'D4']), ('G2', ['B3', 'D4', 'F4']), ('C2', ['Bb3', 'E4', 'G4'])]
tune = ['A4', 'C5', 'F5', 'E5', 'D5', 'C5', 'A4', 'C5', 'D5', 'F5', 'A5', 'G5', 'F5', 'D5', 'B4', 'D5', 'E5', 'G5', 'Bb5', 'A5', 'G5', 'E5', 'C5', 'Bb4']
ev = []
for i, t in enumerate(np.arange(0, d, q)):
    bass, ch = prog[int(t / (4 * q)) % 4]
    if i % 2 == 0: ev.append((t, 'upright', bass if i % 4 == 0 else S.name(S.midi(bass) + 7), .45, .5, -.2))
    else:
        for p in ch: ev.append((t, 'upright', p, .3, .36, -.05))
    if i % 2 == 0 and (i // 2) % 16 < 12: ev.append((t, 'upright', tune[(i // 2) % len(tune)], .6, .44, .2))
place(*section('ch3', ev))
# —— twist: spiccato ostinato, tremolo violins building, timpani on the reveal ——
a, b = SEC['twist']; d = b - a; bpm = 96; q = 60 / bpm
ev = []
for i, t in enumerate(np.arange(1.0, d, q / 2)):
    ev.append((t, 'cellos_spic', ['D3', 'D3', 'F3', 'D3', 'E3', 'D3', 'C3', 'D3'][i % 8], .2, .3 + .25 * min(1, t / d) + .1 * (i % 4 == 0), -.2))
ev += [(8, 'violins_trem', 'A4', d - 10, .16, .3), (20, 'violins_trem', 'D5', d - 22, .14, -.3), (0, 'contrabass', 'D2', d, .3, 0)]
for t in (1.0, 13.0, 27.0, 40.0): ev.append((t, 'timpani', 'D3', 2.5, .45, 0))
place(*section('twist', ev))
# —— myth: a night piece, vibraphone + harp, Am – F – C – G ——
a, b = SEC['myth']; d = b - a; bpm = 70; q = 60 / bpm
prog = [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4']]
ev = []
for k, t in enumerate(np.arange(0, d, 4 * q)):
    ch = prog[k % 4]
    for j, p in enumerate(ch + [ch[1]]): ev.append((t + j * q, 'harp', p, 2.0, .38, -.2))
    ev.append((t + .1, 'vibraphone', S.name(S.midi(ch[2]) + 12), 2.4, .3, .25))
    ev.append((t, 'violas', ch[0], 4 * q, .1, 0))
place(*section('myth', ev))
# —— end: the motif resolved in D major, strings, glockenspiel for the ice ——
a, b = SEC['end']; d = b - a
ev = [(0, 'cellos', 'D2', d, .4, -.2), (0, 'violas', 'A3', d, .22, .2), (4, 'violins', 'F#4', d - 4, .2, -.3), (9, 'horn', 'D3', d - 12, .2, 0)]
for k, t in enumerate(np.arange(.6, d - 6, 4.0)):
    for j, p in enumerate(['D4', 'F#4', 'A4'] if k < 3 else ['D4', 'F#4', 'A4', 'D5']): ev.append((t + j * .42, 'upright', p, 2.0, .5, .1))
z3 = [v for v in P['voice'] if v[0] == 'z3'][0][1] - a
for j, p in enumerate(['A6', 'E6', 'C#6', 'A5', 'E6']): ev.append((z3 + 2.6 + j * .32, 'glockenspiel', p, 1.5, .35, .3 - .15 * j))
place(*section('end', ev, pad=3.5))
sf.write(os.path.join(EP, 'audio', 'music.wav'), music, SR)
print('music', round(len(music) / SR, 1), 's')

# —— foley ——
fx = np.zeros((N, 2), np.float32)
def put(x, at, g=1.0, pan=0.0):
    x = np.asarray(x, np.float32)
    if x.ndim == 1: x = np.stack([x * (1 - max(0, pan)), x * (1 + min(0, pan))], 1)
    i = int(at * SR); j = min(N, i + len(x)); fx[i:j] += x[:j - i] * g
rng = np.random.default_rng(5)
def scratch(d, lo, hi, n, v):   # knife / burin strokes: short band-passed noise gestures
    out = np.zeros(int(d * SR))
    for _ in range(n):
        L = int((.08 + rng.random() * .25) * SR); i = rng.integers(0, max(1, len(out) - L))
        e = np.sin(np.linspace(0, np.pi, L)) ** 2
        out[i:i + L] += X.bp(rng.standard_normal(L), lo, hi) * e * (.4 + .6 * rng.random())
    return X.norm(out, v)
def crackle(d):
    n = int(d * SR); out = X.lp(X.brown(d)[:n], 300) * .5
    for _ in range(int(d * 9)):
        i = rng.integers(0, n - 2000); L = rng.integers(80, 1200); out[i:i + L] += X.hp(rng.standard_normal(L), 1500) * np.exp(-np.arange(L) / (L / 4)) * (.3 + rng.random())
    f = int(.8 * SR); out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
    return X.norm(out, .5)
def projector(d):
    n = int(d * SR); t = np.arange(n) / SR
    bed = X.lp(rng.standard_normal(n), 900) * .25
    tick = np.zeros(n)
    for k in range(int(d * 24)):
        i = int(k / 24 * SR); L = min(500, n - i); tick[i:i + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / 80) * .5
    out = (bed + X.hp(tick, 800)) * (.9 + .1 * np.sin(2 * np.pi * .5 * t))
    f = int(1.0 * SR); out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
    return X.norm(out, .3)
shot_end = {s['id']: s['start'] + s['dur'] for s in P['shots']}
for name, at in P['sfx']:
    if name == 'click': put(X.click(1.2, .9), at, .55)
    elif name == 'hit': put(S.note('timpani', 'D3', 2.0, vel=.55), at, .5); put(X.lp(X.whoosh(.5, .6), 2000), max(0, at - .35), .25)
    elif name == 'stamp': put(X.thump(1.0, 60) * .9, at, .8); put(X.clack(.7, .8), at + .01, .5)
    elif name == 'carve': put(scratch(2.4, 1800, 6000, 26, .5), at, .35, -.1)
    elif name == 'engrave': put(scratch(3.6, 3500, 9000, 40, .4), at, .22, .1)
    elif name == 'fire': put(crackle(shot_end['s08'] - at + .5), at, .35)
    elif name == 'projector': put(projector(SEC['ch3'][1] - at - 2.0), at, .28)
sf.write(os.path.join(EP, 'audio', 'sfx.wav'), fx, SR)
print('sfx ok', len(P['sfx']), 'cues')
