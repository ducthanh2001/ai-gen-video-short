# Rebuild Ep 01

Python: `~/anime-hair-colors/.venv` (main) and `~/kenh-youtube/tools/kvenv` (Kokoro). Prefix every command with `PYTHONUTF8=1`.

1. **Narration.**
   - Edit `narration.json`, then run `tools/kvenv/Scripts/python.exe ../tools/narrate.py . af_heart .95 [ids…]`.
   - Check it: `python ../tools/asr_lines.py .`
2. **Timeline.** `python tools/plan.py` writes `shots.json`. The shot list lives in `tools/plan.py`, with cues timed to the voice.
3. **Picture.**
   - `python tools/render.py 2` renders only missing or changed-length shots.
   - To force one shot: `python tools/render.py 1 s25`.
4. **Music and foley.** `python tools/score.py` writes `audio/music.wav` and `audio/sfx.wav`.
5. **Assemble.** `python tools/assemble.py` writes the MP4, `audio/mix.wav` and the SRT. `--audio-only` builds only the mix and the subtitles.
6. **Checks.**
   - `python ../tools/asr_mix.py .` runs Whisper on the final mix; the last run matched 99.3%.
7. **Shorts.** `python tools/shorts.py`

Scene code is in `film/<style>/scene.js`: woodcut, engraving, silent, today, house, card. The shared overlay (tags, NOW inset, chapter titles, statements) is `film/common/overlay.js`.
