"""MODE=gen (kvenv) writes tts_test/*.wav with the channel voice; MODE=asr (whisper venv) prints what Whisper hears."""
import os, numpy as np, soundfile as sf
MODE = os.environ.get('MODE', 'gen'); os.makedirs('tts_test', exist_ok=True)
CANDS = {
  'heph': ['Hephaestus, the smith.', 'Hephestus, the smith.', 'Heffestus, the smith.', 'Hih-fess-tus, the smith.', 'Hefaistos, the smith.'],
  'hera': ["There, Hera's quarrel and Hephaestus come first.", "There, Hayra's quarrel and Hephaestus come first.", "There, Heera's quarrel and Hephaestus come first.", "There, the quarrel with Hera and Hephaestus come first."],
  'awe': ['Awe takes hold of every god watching.', 'A sense of awe takes hold of every god watching.', 'Every god watching is struck with awe.'],
  'hurt': ["He doesn't say it hurt.", "He doesn't say that it hurt.", "He doesn't say if it hurt."],
  'hesiod': ['Not from Hesiod.', 'Not from Heesiod.', 'Not from Hesiod, anyway.'],
}
if MODE == 'gen':
    from kokoro_onnx import Kokoro
    k = Kokoro(r'C:/Users/PC/lemo-opuscar/core/tts/kokoro-v1.0.onnx', r'C:/Users/PC/lemo-opuscar/core/tts/voices-v1.0.bin')
    v = 0.6 * k.get_voice_style('am_onyx') + 0.4 * k.get_voice_style('am_michael')
else:
    import soxr
    from faster_whisper import WhisperModel
    m = WhisperModel('small.en', device='cpu', compute_type='int8')
n = 0
for key, cands in CANDS.items():
    for c in cands:
        f = f'tts_test/{n:02d}.wav'; n += 1
        if MODE == 'gen':
            a, sr = k.create(c, voice=v, speed=0.88, lang='en-us'); sf.write(f, a, sr); continue
        a, sr = sf.read(f); a16 = soxr.resample(a.astype(np.float32), sr, 16000)
        print(f'{key:7s}| {c:55s} -> {" ".join(s.text.strip() for s in m.transcribe(a16, language="en", beam_size=5)[0])}', flush=True)
