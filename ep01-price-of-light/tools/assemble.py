"""Assemble Ep 01: rendered shots (film/out/shots/<id>) + voice + music + foley → <name>.mp4 (1920×1080, 24 fps, H.264 + AAC)
Picture: Ken Burns moves (kb), crossfades (xf), fade in/out. Sound: voice lines at their cue times, music ducked under the voice,
master at -14 LUFS (BS.1770, gated), -1.5 dBFS ceiling. Also writes <name>.srt. No ffmpeg executable needed (PyAV).
usage: python assemble.py [name=the-price-of-light] [--audio-only] [--from s] [--to s]"""
import os, sys, json, glob, re, numpy as np, soundfile as sf, soxr, av
from PIL import Image
from scipy.signal import lfilter
from scipy.ndimage import maximum_filter1d, uniform_filter1d
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
def opt(k, d):
    if k in args: i = args.index(k); v = args[i + 1]; del args[i:i + 2]; return v
    return d
T_FROM, T_TO = float(opt('--from', 0)), opt('--to', None)
AUDIO_ONLY = '--audio-only' in args; args = [a for a in args if a != '--audio-only']
NAME = args[0] if args else 'the-price-of-light'
P = json.load(open(os.path.join(EP, 'shots.json'))); FPS, SR = P['fps'], 48000
TOT = P['total']; N = int(round(TOT * SR))

# ——— sound ———
def lufs(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)
    blk, hop = int(.4 * SR), int(.1 * SR)
    ms = np.array([(y[i:i + blk] ** 2).mean(0).sum() for i in range(0, len(y) - blk, hop)])
    l = -0.691 + 10 * np.log10(np.maximum(ms, 1e-12)); g = ms[l > -70]; rel = -0.691 + 10 * np.log10(g.mean()) - 10
    return -0.691 + 10 * np.log10(ms[(l > -70) & (l > rel)].mean())
def limit(x, ceil):
    n = int(.005 * SR); pk = np.abs(x).max(1); m = maximum_filter1d(pk, size=2 * n + 1)
    g = uniform_filter1d(np.minimum(1, ceil / np.maximum(m, 1e-9)), size=n); return x * g[:, None]
def fit(x):
    x = x[:N]; return np.vstack([x, np.zeros((N - len(x), 2))]) if len(x) < N else x

voice = np.zeros(N)
for lid, at in P['voice']:
    a, sr = sf.read(os.path.join(EP, 'voice', lid + '.wav'), dtype='float64')
    a = soxr.resample(a, sr, SR); i = int(at * SR); j = min(N, i + len(a)); voice[i:j] += a[:j - i]
voice = np.stack([voice, voice], 1)
voice *= 10 ** ((-17 - lufs(voice)) / 20)                              # speech at about -17 LUFS before the master
music = fit(sf.read(os.path.join(EP, 'audio', 'music.wav'), dtype='float64')[0])
fx = fit(sf.read(os.path.join(EP, 'audio', 'sfx.wav'), dtype='float64')[0])
# duck the music under the voice: envelope with fast attack, slow release, -7 dB at full speech
env = np.abs(voice[:, 0]); env = maximum_filter1d(env, int(.12 * SR)); env = uniform_filter1d(env, int(.35 * SR))
env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - (1 - 10 ** (-7 / 20)) * env
mix = voice + music * 10 ** (-2 / 20) * duck[:, None] * 1.9 + fx * .9
L0 = lufs(mix); mix *= 10 ** ((-14 - L0) / 20); ceil = 10 ** (-1.5 / 20)
for _ in range(3): mix = limit(mix, ceil)
mix = np.clip(mix, -ceil, ceil)
fo = int(2.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
print(f'loudness {L0:.1f} → {lufs(mix):.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS', flush=True)
sf.write(os.path.join(EP, 'audio', 'mix.wav'), mix.astype(np.float32), SR)

# ——— subtitles (English, digits for years and numbers as the script writes them) ———
NARR = dict(json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8')))
DUR = json.load(open(os.path.join(EP, 'voice', 'durations.json')))
SUBS = [('eighteen hundreds', '1800s'), ('seventeen hundreds', '1700s'), ('eighteen hundred', '1800'), ('seventeen fifty B.C.', '1750 BC'),
        ('twelve ninety-two', '1292'), ('eighteen fifty-five', '1855'), ('eighteen seventy-nine', '1879'), ('eighteen seventy', '1870'), ('eighteen twenty', '1820'),
        ('nineteen thirty-eight', '1938'), ('nineteen hundred', '1900'), ('nineteen twenty', '1920'), ('nineteen fifty', '1950'), ('nineteen ninety-two', '1992'),
        ('fifty-eight', '58'), ('forty-one and a half', '41½'), ('seventy-two', '72'), ('Silliman Junior', 'Silliman Jr.'), ('nine hundred to sixteen hundred', '900 to 1,600'),
        ('a hundred thousand', '100,000'), ('seven hundred thousand', '700,000'), ('about fifty', 'about 50'), ('about sixty', 'about 60'), ('two hundred years', '200 years'),
        ('thirteen minutes', '13 minutes'), ('about thirteen times', 'about 13 times'), ('forty times', '40 times'), ('twenty minutes', '20 minutes'), ('seven seconds', '7 seconds')]
def stamp(s): h, s = divmod(s, 3600); m, s = divmod(s, 60); return f'{int(h):02d}:{int(m):02d}:{s:06.3f}'.replace('.', ',')
srt, k = [], 1
for lid, at in P['voice']:
    txt = NARR[lid]
    for a, b in SUBS: txt = txt.replace(a, b)
    parts = re.split(r'(?<=[.?!])\s+', txt); tot = sum(len(p) for p in parts); t = at
    for p in parts:
        d = DUR[lid] * len(p) / tot
        srt.append(f'{k}\n{stamp(t)} --> {stamp(t + d)}\n{p}\n'); k += 1; t += d
open(os.path.join(EP, NAME + '.srt'), 'w', encoding='utf-8').write('\n'.join(srt))
if AUDIO_ONLY: sys.exit()

# ——— picture ———
frames = {}
for s in P['shots']:
    fs = glob.glob(os.path.join(EP, 'film', 'out', 'shots', s['id'], 'fr_*.jpg'))
    frames[s['id']] = sorted(fs, key=lambda f: float(os.path.basename(f)[3:-4]))
    assert len(frames[s['id']]) >= s['frames'] - 1, (s['id'], len(frames[s['id']]), s['frames'])
ease = lambda u: (u := min(1, max(0, u))) * u * (3 - 2 * u)
def shot_img(s, t):
    fl = frames[s['id']]; i = min(len(fl) - 1, max(0, int(round((t - s['start']) * FPS))))
    im = Image.open(fl[i]).convert('RGB')
    if s['kb']:
        (x0, y0, z0), (x1, y1, z1) = s['kb']; u = ease((t - s['start']) / s['dur'])
        z = z0 + (z1 - z0) * u; cx = x0 + (x1 - x0) * u; cy = y0 + (y1 - y0) * u
        w, h = 1920 / z, 1080 / z; l = min(max(0, cx - w / 2), 1920 - w); tp = min(max(0, cy - h / 2), 1080 - h)
        im = im.resize((1920, 1080), Image.LANCZOS, box=(l, tp, l + w, tp + h))
    return im
out = os.path.join(EP, NAME + '.mp4')
c = av.open(out, 'w', options={'movflags': '+faststart'})
vs = c.add_stream('libx264', rate=FPS); vs.width, vs.height, vs.pix_fmt = 1920, 1080, 'yuv420p'
vs.options = {'crf': '18', 'preset': 'medium', 'profile': 'high', 'colorprim': 'bt709', 'transfer': 'bt709', 'colormatrix': 'bt709'}
au = c.add_stream('aac', rate=SR); au.layout = 'stereo'; au.bit_rate = 192000
f0, f1 = int(T_FROM * FPS), int((float(T_TO) if T_TO else TOT) * FPS)
shots = P['shots']
for fi in range(f0, f1):
    t = fi / FPS
    act = [s for s in shots if s['start'] <= t < s['start'] + s['dur']]
    if not act: act = [shots[-1]]
    im = shot_img(act[0], t)
    if len(act) > 1:   # crossfade into the later shot
        b = act[-1]; k = ease((t - b['start']) / max(.04, b['xf']))
        im = Image.blend(im, shot_img(b, t), k)
    fade = min(1, t / .4, (TOT - t) / 1.8)
    if fade < 1: im = Image.blend(Image.new('RGB', im.size), im, max(0, fade))
    fr = av.VideoFrame.from_image(im); fr.pts = fi - f0
    for pk in vs.encode(fr): c.mux(pk)
    if fi % 480 == 0: print(f'  {t:6.1f}s', flush=True)
for pk in vs.encode(): c.mux(pk)
pcm = mix[int(T_FROM * SR):int(f1 / FPS * SR)].T.astype(np.float32).copy()
for i in range(0, pcm.shape[1], 1024):
    af = av.AudioFrame.from_ndarray(np.ascontiguousarray(pcm[:, i:i + 1024]), format='fltp', layout='stereo'); af.sample_rate = SR; af.pts = i
    for pk in au.encode(af): c.mux(pk)
for pk in au.encode(): c.mux(pk)
c.close()
print(out, f'{(f1 - f0) / FPS:.1f} s, {os.path.getsize(out) / 1e6:.0f} MB')
