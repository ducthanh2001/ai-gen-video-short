# Rebuild Short 01

Python: `~/anime-hair-colors/.venv` (PyAV, faster-whisper) and `~/kenh-youtube/tools/kvenv` (Kokoro). Prefix commands with `PYTHONUTF8=1`.

1. **Narration.** Edit `narration.json`, then from `~/kenh-youtube/tools`: `kvenv/Scripts/python.exe narrate.py ../shorts/s01-rent-1970 af_heart .95`. Check with `asr_lines.py` (anime venv). Words: `python ~/.claude/skills/lemo-plus/scripts/words_check.py narration.json`.
2. **Timeline.** `film/index.html` (TL, VO, CAP) and `tools/build.py` (same constants). VO start times follow `voice/durations.json`.
3. **Picture.** From `~/lemo-opuscar`: render subframes at exact times (rate 240, 4 per frame, 180-degree shutter):
   `node core/render/still.mjs <project>/film $(cat sub/times0.txt) --q rate=240 --size 1080x1920 --out <project>/sub --prefix s_` (then times1, times2; run them one after another, not in parallel).
4. **Mix and encode.** `python tools/build.py` writes `audio_mix.wav`, `rent-1970-vs-today.srt` and `rent-1970-vs-today.mp4` (-14 LUFS).
