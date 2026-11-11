"""Try respellings for TTS and check them with Whisper. usage: python say_test.py <voice> <speed>"""
import sys, os, json, numpy as np, soundfile as sf
MODE = os.environ.get('MODE', 'gen')
V = sys.argv[1] if len(sys.argv) > 1 else 'af_heart'; SP = float(sys.argv[2]) if len(sys.argv) > 2 else 0.85
os.makedirs('tts_test', exist_ok=True)
if MODE == 'gen':
    from kokoro_onnx import Kokoro
    k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
else:
    import soxr
    from faster_whisper import WhisperModel
    m = WhisperModel('small.en', device='cpu', compute_type='int8')
CANDS = {
  'hestia': ['Hestia.', 'Hestya.', 'Hestiah.', 'Hessteea.'],
  'typhoeus': ['Typhoeus.', 'Tyfeeus.', 'Tie-fee-us.', 'Typhoeus!', 'His name is Typhoeus.'],
  'gaia': ['Then Gaia speaks again.', 'Then Gaya speaks again.', 'Then Guya speaks again.', 'Then, Gaia speaks again.'],
  'their': ['Their spirit comes back.', 'Their spirit, comes back.', 'And their spirit comes back.'],
  'earth': ['Then Gaia, the Earth.', 'Then, Gaia. The Earth.'],
  'one': ['All but one.', 'All, but one.'],
}
n = 0
for key, cands in CANDS.items():
    for c in cands:
        f = f'tts_test/{n:02d}.wav'; n += 1
        if MODE == 'gen':
            a, sr = k.create(c, voice=V, speed=SP, lang='en-gb' if V[0] == 'b' else 'en-us'); sf.write(f, a, sr); continue
        a, sr = sf.read(f); a16 = soxr.resample(a.astype(np.float32), sr, 16000)
        segs, _ = m.transcribe(a16, language='en', beam_size=5)
        heard = ' '.join(s.text.strip() for s in segs)
        print(f'{key:16s} | {c:70s} -> {heard}', flush=True)
