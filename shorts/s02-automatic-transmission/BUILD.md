# Rebuild Short 02

Python: `~/anime-hair-colors/.venv` (PyAV, scipy, soxr) and `~/kenh-youtube/tools/kvenv` (Kokoro). Prefix commands with `PYTHONUTF8=1`.

1. **Narration.** Edit `narration.json`, then from `~/kenh-youtube/tools` run `kvenv/Scripts/python.exe narrate.py ../shorts/s02-automatic-transmission af_heart .95`. Check the words with `python ~/.claude/skills/lemo-plus/scripts/words_check.py narration.json`.
2. **Timeline.** Keep these in sync with `voice/durations.json`:
   - `film/index.html`: TL.VO and DURS
   - `tools/build.py`: VO and the event times
3. **Picture.** From `~/lemo-opuscar`, render the 4,680 subframes in one process. Do not split them into parallel runs.
   `node core/render/still.mjs <project>/film $(cat sub/times.txt) --q rate=240 --size 1080x1920 --out <project>/sub --prefix s_`
   This renders frame indices 8k+j, j = 0..3, at rate 240: 4 subframes per frame for motion blur.
   For a quick check, render stills at times in seconds, without `--q rate`.
4. **Mix and encode.** Run `python tools/build.py`. It writes `audio_mix.wav`, the SRT and the MP4. `AUDIO_ONLY=1` stops after the audio and SRT.

Model notes:
- Units are mm, scaled by .001. The axis is vertical, and the cut plane is z = 0.
- Static castings are `halfLathe(profile)`.
- Each planetary set is posed from its sun and carrier angles by `poseSet`; the planets and ring follow from the tooth mesh.
