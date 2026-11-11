"""Audition the master's "Sloppy," in two gruff/older Kokoro voices and pick the lower, rougher one (median pitch + jitter).
Writes voice-audition/master_<voice>.wav and film/voices.json."""
import os, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
os.makedirs(os.path.join(EP, 'voice-audition'), exist_ok=True)
def f0(a, sr):
    fr = int(sr * .04); hop = fr // 2; out = []
    for i in range(0, len(a) - fr, hop):
        x = a[i:i + fr]; x = x - x.mean()
        if np.sqrt((x ** 2).mean()) < .02: continue
        c = np.correlate(x, x, 'full')[fr - 1:]; lo, hi = int(sr / 300), int(sr / 60)
        j = lo + np.argmax(c[lo:hi]); out.append(sr / j)
    return np.array(out)
res = {}
for v in ['bm_george', 'am_onyx']:
    a, sr = k.create('Sloppy, said the master.', voice=v, speed=0.88, lang='en-us')
    sf.write(os.path.join(EP, 'voice-audition', f'master_{v}.wav'), a, sr)
    p = f0(a, sr); res[v] = (float(np.median(p)), float(np.std(np.diff(p)) / np.median(p)))
    print(v, 'median F0 %.0f Hz, jitter %.3f' % res[v])
pick = min(res, key=lambda v: res[v][0])
json.dump({'master': pick, 'audition': res}, open(os.path.join(EP, 'film', 'voices.json'), 'w'), indent=1); print('pick', pick)
