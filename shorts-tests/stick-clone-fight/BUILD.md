# SUBJECT 07: stick-figure clone fight (test)

About 20.7 s, 16:9 at 1920x1080, letterboxed to 2.39:1. Picture and sound are made entirely in code.

**Story.** A white stick figure wakes in a cloning bay. An alarm sounds and three red-rimmed clones burst out of their tanks.

The fight, in order:
1. A matrix-style dodge, then a turning side kick that sends the first clone into a tank.
2. A spinning back kick on the second clone.
3. A mid-air kick that slams the third clone into the floor.
4. A fist-to-fist clash with a shockwave.
5. A dash and an uppercut that launch the second clone out of frame.

When the alarm stops, every tank in the hall lights up red: an army of clones wakes. The film cuts to black on the title "CLONE".

## Files
- `film/index.html`: the whole film on a 2D canvas.
  - Poses, choreography keys, camera shots, tanks, particles, impact frames, bloom, grain and letterbox.
- `film/tl.json`: story time (tau), slow-motion windows and impacts. The page and the audio both read it.
- `tools/tl.py`: maps tau to real time (the same speed ramps as the page).
- `tools/build.py`: sound design, the −14 LUFS master, the 4-subframe motion-blur average, and the H.264/AAC encode.
- `tools/sheet.py`: contact sheets for review.

## Rebuild
Python is `~/anime-hair-colors/.venv`; prefix commands with `PYTHONUTF8=1`.

1. Run `python tools/tl.py` to print the real duration and impact times. Frames = ceil(duration × 30).
2. From `~/lemo-opuscar`, render the subframes. `sub_times.txt` lists 8k+j for j = 0..3.
   `node core/render/still.mjs <project>/film $(cat <project>/sub_times.txt) --q rate=240 --size 1920x1080 --out <project>/sub --prefix s_`
3. Run `python tools/build.py`, which writes `subject07-clone-fight.mp4`. With `AUDIO_ONLY=1` it writes only `audio_mix.wav`.

## Editing the choreography
- Each fighter's keys are `[tau, pose, {x, air, sx, spin, eye, hide, e, ex, ea}]`:
  - Fields carry forward from the previous key.
  - `sx` is facing direction; passing it through 0 reads as a turn.
  - `spin` rotates the whole body about the hip.
  - The body is always set down on the floor, then lifted by `air`.
- Poses are absolute limb angles: 0 = straight down, + = forward. See the `P` table in `film/index.html`.
- If the slow-motion windows change, rerun `tools/tl.py` and recount the frames.
