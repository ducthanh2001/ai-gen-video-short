# Pip Short 01: The Great Emu War (1932)

30.2 s, 9:16, 1080x1920 at 30 fps. Picture and sound are made entirely in code. The main character is Pip, from the character bible (https://claude.ai/artifact/6No3pNP883RZe9mrMNMqtp).

## Facts (Wikipedia "Emu War")
- 2 Nov – 10 Dec 1932, Campion district, Western Australia.
- Major G.P.W. Meredith, two Lewis guns, 10,000 rounds.
- Official tally: 986 kills for 9,860 rounds, exactly 10 rounds per kill.
- The emus split into small, mobile groups.
- About 20,000 emus.

## Files
- `narration.json`: [id, caption, text sent to the TTS]. The captions keep digits; the voice reads them as words.
- `tools/narrate.py`: Kokoro `af_heart` at speed 1.0, writes `voice/*.wav`. Run it with `C:/Users/PC/kenh-youtube/tools/kvenv/Scripts/python.exe`.
- `tools/tl.py`: places the voice lines (gaps in `GAP_BEFORE`) and splits the captions into chunks, writing `film/tl.json`.
- `film/index.html` (v2): `window.render(t)` draws 17 shots, about 1.8 s each, listed in `buildShots()`:
  - est (wide shot of the farm in perspective)
  - salute (low angle)
  - emuECU (crash zoom on the emu's face)
  - horde (high wide shot)
  - peck (insert, with depth of field)
  - march (low-angle tracking shot)
  - gun (insert of the Lewis gun)
  - smug (close-up)
  - ots (over the shoulder)
  - fire (dutch angle)
  - scatter (whip pan)
  - rain (insert of falling casings)
  - heap
  - board (chalkboard)
  - cry (close-up with the stamp)
  - away (army truck)
  - win (emu in the helmet)

  The shared tools are `farm()` (a perspective set with blur for depth), `lewis()`, `truck()`, `pile()` and `personBack()`. Every frame also gets a vignette and film grain.
  v1 (7 flat scenes) is kept in `v1/`.
- Captions use `|` in `narration.json` to set chunk breaks by hand.
- `tools/audio.py`:
  - Score: marimba and pizzicato at 112 bpm. It stops at L09.
  - Sound effects: gunshots, ticks, dings, stamp, sad trombone, ending sting.
  - Music ducks under the voice. The mix is normalised to about −14 LUFS and written to `audio_mix.wav`.

## Rebuild
```
PY=~/anime-hair-colors/.venv/Scripts/python.exe
C:/Users/PC/kenh-youtube/tools/kvenv/Scripts/python.exe tools/narrate.py af_heart 1.0
$PY tools/tl.py && $PY tools/audio.py
cd ~/lemo-opuscar && node core/render/video.mjs <project>/film --fps 30 --workers 4 --size 1080x1920 --out <project>/out/video.mp4
ffmpeg -y -i out/video.mp4 -i audio_mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest pip-emu-war.mp4
```
The page must set `window.DUR` (video.mjs needs it) and `window.READY`.
