"""Short 01: mix (voice, music, foley) + motion-blurred frames -> MP4 and SRT. numpy/scipy/soxr + PyAV, no ffmpeg.
usage: python tools/build.py            (from the project folder; frames in sub/, voice in voice/)
Timeline mirrors film/index.html TL (keep in sync).
"""
import json, math, os, sys
import numpy as np, soundfile as sf, soxr, av
from scipy.signal import lfilter
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS, SR, SUB = 30, 48000, 4
TL = dict(DUR=32.5, STORY_A=5.0, CUT_ENV=9.6, BUILD_A=12.15, LOCK_A=15.15, WHIP=17.3, WHIP_END=17.65, CUT_STUB=20.65,
          BUILD_B=23.35, CROSS=27.1, LOCK_B=27.75, END=29.4, A_N=68, B_N=205, B_HOOK0=150, B_HOOK_DT=.07, A_DT=.038, B_DT=.0195, FALL=.32)
VO = dict(h1=.25, h2=3.55, a1=5.2, a2=9.75, a3=12.35, a4=15.45, b1=17.75, b2=20.75, b3=23.6, b4=27.15, e1=29.6)
CAP = dict(h1='Same rent. Same job. 54 years apart.', h2='Watch the second pile.', a1='April 1970. Median rent: $108.',
           a2='Minimum wage: $1.60 an hour.', a3='Rent cost 67.5 hours of work.', a4='Under half a month on the job.',
           b1='Today, median rent is $1,487.', b2='Minimum wage: still $7.25.', b3='205 hours.', b4='More than a full month of work.',
           e1='Before food. Before anything else.')
L = int(TL['DUR'] * SR)
rng = np.random.default_rng(11)
bus = {k: np.zeros((2, L), np.float32) for k in ('voice', 'music', 'fx')}


def rnd(i):
    s = math.sin(i * 127.1 + 311.7) * 43758.5453
    return s - math.floor(s)


def add(name, buf, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= L: return
    seg = buf[:max(0, L - i)]
    lg, rg = math.cos((pan + 1) * math.pi / 4) * 1.414, math.sin((pan + 1) * math.pi / 4) * 1.414
    bus[name][0, i:i + len(seg)] += seg * gain * lg
    bus[name][1, i:i + len(seg)] += seg * gain * rg


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def lp(x, fc):                      # one-pole low pass
    a = 1 - math.exp(-2 * math.pi * fc / SR)
    return lfilter([a], [1, a - 1], x).astype(np.float32)


# ------------------------------------------------------------------ voice: Kokoro lines, compressed, on their times
for lid, t0 in VO.items():
    a, sr = sf.read(os.path.join(HERE, 'voice', lid + '.wav'), dtype='float32')
    a = soxr.resample(a, sr, SR).astype(np.float32)
    a = a / (np.sqrt(np.mean(a ** 2)) + 1e-9) * 10 ** (-20 / 20)                 # every line at the same level
    a = np.sign(a) * (1 - np.exp(-np.abs(a) * 3.2)) / (1 - math.exp(-3.2))       # gentle compression
    add('voice', a * .55, t0)

# ------------------------------------------------------------------ foley
def clink(seed):
    r = np.random.default_rng(seed); f0 = r.uniform(2100, 2900); n = int(.4 * SR); t = np.arange(n) / SR
    o = sum(a * np.sin(2 * np.pi * f0 * m * t + r.uniform(0, 6.28)) * np.exp(-t / d) for m, a, d in ((1, 1, .14), (2.76, .5, .08), (5.4, .28, .045), (8.93, .15, .025)))
    return ((o + r.normal(0, 1, n) * np.exp(-t / .0018) * .5) * np.minimum(1, t / .0008) * .22).astype(np.float32)


def paper_rustle():
    n = int(.45 * SR); t = np.arange(n) / SR
    x = rng.normal(0, 1, n).astype(np.float32); x = x - lp(x, 1500)
    return x * (np.exp(-((t - .12) / .09) ** 2) + .5 * np.exp(-((t - .28) / .06) ** 2)) * .35


def whoosh(d=.45):
    n = int(d * SR); t = np.arange(n) / SR
    x = rng.normal(0, 1, n).astype(np.float32); x = lp(x, 2600) - lp(x, 300)
    return x * np.sin(np.pi * t / d) ** 2 * .9


def thunk(big=False):
    n = int((1.6 if big else .7) * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * ((70 if big else 95) * np.exp(-t * 5) + (38 if big else 48)) * t) * np.exp(-t / (.55 if big else .17))
    return ((body + rng.normal(0, 1, n) * np.exp(-t / .012) * .45) * (1.0 if big else .8)).astype(np.float32)


def coins(dropfn, n, zone_x, seed, gain=1.0):
    for i in range(n):
        ti = dropfn(i)
        if ti is None: continue
        pan = max(-1, min(1, zone_x * 9))
        for dt_, g in ((0, 1), (.143, .25), (.286, .08)):
            add('fx', clink(seed + i * 3 + int(dt_ * 100)), ti + TL['FALL'] + dt_, g * gain, pan)


# hook: the TODAY pile rains; story: A then B build up
coins(lambda i: (i - TL['B_HOOK0']) * TL['B_HOOK_DT'] if TL['B_HOOK0'] <= i and (i - TL['B_HOOK0']) * TL['B_HOOK_DT'] + TL['FALL'] < TL['STORY_A'] else None, TL['B_N'], .07, 100, .8)
coins(lambda i: TL['BUILD_A'] + .05 + i * TL['A_DT'], TL['A_N'], -.07, 3000)
coins(lambda i: TL['BUILD_B'] + .05 + i * TL['B_DT'], TL['B_N'], .07, 6000, .7)
for t0 in (TL['STORY_A'], TL['CUT_ENV'], TL['WHIP_END'], TL['CUT_STUB']):
    add('fx', paper_rustle(), t0 + .02, .7)
add('fx', whoosh(), TL['WHIP'] - .05, .8)
add('fx', thunk(), TL['LOCK_A'] - .01, .9)
add('fx', thunk(big=True), TL['LOCK_B'] - .01, 1.1)
add('fx', whoosh(.9) * .5, TL['END'] - .1, .5)

# ------------------------------------------------------------------ music: soft felt-piano chords + a pulse, ducked under voice
def tone(f, d, dec=1.2, bright=.25):
    n = int(d * SR); t = np.arange(n) / SR
    return ((np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / .3) + .1 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / .15))
            * env(n, .006, dec)).astype(np.float32)

BPM = 96; beat = 60 / BPM
prog = [(220.0, [220.0, 261.63, 329.63]), (174.61, [174.61, 220.0, 261.63]), (130.81, [196.0, 261.63, 329.63]), (196.0, [196.0, 246.94, 293.66])]
t = 0.0; bar = 0
while t < TL['CROSS']:
    root, chord = prog[bar % 4]
    add('music', tone(root / 2, 4 * beat, 1.6, .1) * .5, t, .9)
    for j, f in enumerate(chord):
        add('music', tone(f, 4 * beat, 1.4) * .22, t + j * .012, .9, (-.3, 0, .3)[j])
    for k in range(8):                                                        # an eighth-note pulse, quiet
        add('music', tone(chord[(k * 2) % 3] * 2, beat, .18, .4) * .07, t + k * beat / 2, .9, .25 if k % 2 else -.25)
    t += 4 * beat; bar += 1
# music stops on the crossing (key moment); one low held note under the ending
fade = np.ones(L, np.float32); i0 = int(TL['CROSS'] * SR); fade[i0:i0 + int(.25 * SR)] = np.linspace(1, 0, int(.25 * SR)); fade[i0 + int(.25 * SR):] = 0
bus['music'] *= fade
add('music', tone(55.0, 5.0, 2.5, .05) * .45, TL['LOCK_B'], 1.0)
for j, f in enumerate([220.0, 261.63, 329.63]):
    add('music', tone(f, 3.2, 1.6) * .16, TL['END'] + .3 + j * .02, 1.0, (-.3, 0, .3)[j])

# duck: music -9 dB under the voice, smooth
venv = np.abs(bus['voice']).max(0)
venv = lfilter([1 - math.exp(-1 / (.03 * SR))], [1, -math.exp(-1 / (.03 * SR))], (venv > .01).astype(np.float32))
duck = 1 - (1 - 10 ** (-9 / 20)) * np.clip(lp(venv, 4), 0, 1)
bus['music'] *= duck

# ------------------------------------------------------------------ master: BS.1770 integrated loudness to -14 LUFS, peak limit
mix = bus['voice'] * 1.0 + bus['music'] * .55 + bus['fx'] * .6

def lufs(x):
    k = [lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, .73248077421585], ch) for ch in x]
    k = [lfilter([1., -2., 1.], [1, -1.99004745483398, .99007225036621], ch) for ch in k]
    blk, hop = int(.4 * SR), int(.1 * SR)
    z = np.array([sum(np.mean(ch[i:i + blk] ** 2) for ch in k) for i in range(0, len(k[0]) - blk, hop)])
    lk = -.691 + 10 * np.log10(z + 1e-12)
    z1 = z[lk > -70]; rel = -.691 + 10 * np.log10(z1.mean()) - 10
    return -.691 + 10 * np.log10(z[lk > rel].mean())

for _ in range(2):
    mix *= 10 ** ((-14 - lufs(mix)) / 20)
    mix = np.tanh(mix / .89) * .89                                            # soft limit near -1 dBFS
tail = np.ones(L, np.float32); tail[-int(.12 * SR):] = np.linspace(1, 0, int(.12 * SR)); mix *= tail
print(f"master: {lufs(mix):.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS")
sf.write(os.path.join(HERE, 'audio_mix.wav'), mix.T, SR)

# ------------------------------------------------------------------ subtitles
DUR = {k: v for k, v in json.load(open(os.path.join(HERE, 'voice', 'durations.json'))).items()}
ts = lambda s: f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(round(s % 1 * 1000)):03d}"
with open(os.path.join(HERE, 'rent-1970-vs-today.srt'), 'w', encoding='utf-8') as fh:
    for n, (lid, t0) in enumerate(VO.items(), 1):
        fh.write(f"{n}\n{ts(t0)} --> {ts(t0 + DUR[lid] + .2)}\n{CAP[lid]}\n\n")

# ------------------------------------------------------------------ picture: 180-degree shutter from 4 subframes (rate 240)
nfr = int(round(TL['DUR'] * FPS))
OUT = os.path.join(HERE, 'rent-1970-vs-today.mp4')
c = av.open(OUT, 'w', options={'movflags': '+faststart'})
vs = c.add_stream('libx264', rate=FPS); vs.width, vs.height, vs.pix_fmt = 1080, 1920, 'yuv420p'
vs.options = {'crf': '17', 'preset': 'medium', 'profile': 'high', 'colorprim': 'bt709', 'transfer': 'bt709', 'colormatrix': 'bt709'}
au = c.add_stream('aac', rate=SR); au.layout = 'stereo'; au.bit_rate = 192000
missing = [8 * k + j for k in range(nfr) for j in range(SUB) if not os.path.exists(os.path.join(HERE, 'sub', f's_{8 * k + j}.jpg'))]
if missing: sys.exit(f"missing {len(missing)} subframes, e.g. {missing[:5]}")
for k in range(nfr):
    acc = None
    for j in range(SUB):
        a = np.asarray(Image.open(os.path.join(HERE, 'sub', f's_{8 * k + j}.jpg')).convert('RGB'), np.float32)
        acc = a if acc is None else acc + a
    fr = av.VideoFrame.from_image(Image.fromarray(np.clip(acc / SUB + .5, 0, 255).astype(np.uint8))); fr.pts = k
    for pk in vs.encode(fr): c.mux(pk)
for pk in vs.encode(): c.mux(pk)
pcm = mix[:, :int(nfr / FPS * SR)].astype(np.float32).copy()
for i in range(0, pcm.shape[1], 1024):
    af = av.AudioFrame.from_ndarray(np.ascontiguousarray(pcm[:, i:i + 1024]), format='fltp', layout='stereo'); af.sample_rate = SR; af.pts = i
    for pk in au.encode(af): c.mux(pk)
for pk in au.encode(): c.mux(pk)
c.close()
print(f"{OUT}: {nfr} frames, {nfr / FPS:.1f} s, {os.path.getsize(OUT) / 1e6:.1f} MB")
