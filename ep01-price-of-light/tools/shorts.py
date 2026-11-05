"""Cut the three Shorts (1080×1920) out of the finished episode: title on top, the 16:9 picture in the middle, burned-in captions below.
Picture is decoded from <name>.mp4, sound sliced from audio/mix.wav (short fades at every join), captions from <name>.srt.
usage: python shorts.py [name=the-price-of-light]"""
import os, sys, json, re, numpy as np, soundfile as sf, av
from PIL import Image, ImageDraw, ImageFont
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAME = sys.argv[1] if len(sys.argv) > 1 else 'the-price-of-light'
P = json.load(open(os.path.join(EP, 'shots.json'))); FPS, SR = 24, 48000
SH = {s['id']: s for s in P['shots']}
FONT = os.path.join(EP, 'film', 'fonts')
def font(sz, w=700):
    f = ImageFont.truetype(os.path.join(FONT, [x for x in os.listdir(FONT) if x.lower().startswith('inter') and x.endswith('.ttf')][0]), sz)
    try: f.set_variation_by_axes([w if 'eight' in str(ax.get('name', b'')) or ax.get('name') == b'Weight' else ax['default'] for ax in f.get_variation_axes()])
    except Exception as e: print('font axes:', e)
    return f
SHORTS = [
  ('short1-light-cost-a-week', 'Light used to cost a WEEK of work', [('s01', 's04'), ('s36', 's37')]),
  ('short2-rock-oil', 'The chemist who tested “rock oil”', [('s15', 's17')]),
  ('short3-sleep-twice', 'Did people sleep TWICE a night?', [('s30', 's35')]),
]
def srt():
    out = []
    for blk in open(os.path.join(EP, NAME + '.srt'), encoding='utf-8').read().strip().split('\n\n'):
        L = blk.split('\n'); a, b = [sum(float(x) * k for x, k in zip(s.replace(',', '.').split(':'), (3600, 60, 1))) for s in L[1].split(' --> ')]
        out.append((a, b, ' '.join(L[2:])))
    return out
SUB = srt()
mix, _ = sf.read(os.path.join(EP, 'audio', 'mix.wav'), dtype='float32')
def wrap(d, s, f, maxw):
    words, lines, cur = s.split(), [], ''
    for w in words:
        n = (cur + ' ' + w).strip()
        if d.textlength(n, font=f) > maxw and cur: lines.append(cur); cur = w
        else: cur = n
    return lines + [cur] if cur else lines
def decode(a, b):
    c = av.open(os.path.join(EP, NAME + '.mp4')); st = c.streams.video[0]
    c.seek(int(max(0, a - 1) / st.time_base), stream=st)
    for fr in c.decode(st):
        t = float(fr.pts * st.time_base)
        if t < a - 1e-3: continue
        if t >= b: break
        yield t, fr.to_image()
    c.close()
TF, CF, SF = font(76, 800), font(56, 700), font(30, 400)
for fname, title, groups in SHORTS:
    segs = [(SH[a]['start'] + (SH[a]['xf'] or 0), SH[b]['start'] + SH[b]['dur'] - (.3 if b != 's37' else 0)) for a, b in groups]
    out = os.path.join(EP, 'shorts', fname + '.mp4'); os.makedirs(os.path.dirname(out), exist_ok=True)
    c = av.open(out, 'w', options={'movflags': '+faststart'})
    vs = c.add_stream('libx264', rate=FPS); vs.width, vs.height, vs.pix_fmt = 1080, 1920, 'yuv420p'; vs.options = {'crf': '19', 'preset': 'medium'}
    au = c.add_stream('aac', rate=SR); au.layout = 'stereo'; au.bit_rate = 192000
    base = Image.new('RGB', (1080, 1920), '#121115'); d = ImageDraw.Draw(base)
    y = 330
    for l in wrap(d, title, TF, 960): d.text((540, y), l, font=TF, fill='#f4efe6', anchor='mm'); y += 92
    d.text((540, y + 20), 'THE PRICE OF LIGHT · EP 01', font=SF, fill='#e9a27f', anchor='mm')
    d.text((540, 1800), 'Full episode on the channel', font=SF, fill='#9a968f', anchor='mm')
    n, audio = 0, []
    for a, b in segs:
        for t, im in decode(a, b):
            fr = base.copy(); fr.paste(im.resize((1080, 608), Image.LANCZOS), (0, 640)); dd = ImageDraw.Draw(fr)
            cap = next((s for s in SUB if s[0] <= t < s[1]), None)
            if cap:
                yy = 1390
                for l in wrap(dd, cap[2], CF, 940): dd.text((540, yy), l, font=CF, fill='#ffffff', anchor='mm', stroke_width=5, stroke_fill='#000'); yy += 70
            f = min(1, (t - a) / .25, (b - t) / .25)
            if f < 1: fr = Image.blend(Image.new('RGB', fr.size, '#000'), fr, max(0, f))
            vf = av.VideoFrame.from_image(fr); vf.pts = n; n += 1
            for pk in vs.encode(vf): c.mux(pk)
        x = mix[int(a * SR):int(b * SR)].copy(); k = int(.25 * SR); x[:k] *= np.linspace(0, 1, k)[:, None]; x[-k:] *= np.linspace(1, 0, k)[:, None]; audio.append(x)
    for pk in vs.encode(): c.mux(pk)
    pcm = np.concatenate(audio).T.astype(np.float32).copy()[:, :int(n / FPS * SR)]
    for i in range(0, pcm.shape[1], 1024):
        af = av.AudioFrame.from_ndarray(np.ascontiguousarray(pcm[:, i:i + 1024]), format='fltp', layout='stereo'); af.sample_rate = SR; af.pts = i
        for pk in au.encode(af): c.mux(pk)
    for pk in au.encode(): c.mux(pk)
    c.close(); print(out, f'{n / FPS:.1f} s')
