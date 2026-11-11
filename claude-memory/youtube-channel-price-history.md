---
name: youtube-channel-price-history
description: "User's YouTube channel project — English videos on the economic history of everyday things, made in code with Lemo-Opuscar; Ep01 done 2026-11-05"
metadata:
  node_type: memory
  type: project
  originSessionId: ba2128f1-9040-4fde-945f-d00eabdaa826
  modified: 2026-11-10T07:07:13.380Z
---

The user (chats in Vietnamese) runs an English-language YouTube channel on the "economic history of everyday things": long-form episodes of 6–8 minutes, plus 3 Shorts cut from each. They want gripping scripts with hooks, open loops and a tease for the next episode, and only verifiable facts.

**Ep01 "The Price of Light"**
- Finished 2026-11-05 in `C:/Users/PC/kenh-youtube/ep01-price-of-light/`. Rebuild steps are in BUILD.md, sources in FACTS.md.
- Narrator: the user chose Kokoro voice `af_heart` at speed .95.
- Styles: woodcut, copperplate engraving and 1920s silent film, plus a house style (cards and 3D stacks).
- The next episode teased is ice (Frederic Tudor's ice trade).

**Shorts series, "rent/price in hours of minimum-wage work" for US viewers** (added 2026-11-09)
- The user aims at US viewers for high RPM. They rejected flat infographic styles and toy-like 3D as too unreal and jerky.
- Chosen look: photoreal macro tabletop in three.js, using Lemo's Poly Haven HDRI, walnut wood and lamp assets. Coins = hours of work. Motion blur from 4 subframes.
- Short 01 "Rent 1970 vs today" was done in `C:/Users/PC/kenh-youtube/shorts/s01-rent-1970/`. Rebuild steps are in BUILD.md, sources in FACTS.md.
- Pitfall: Lemo's `still.mjs` rounds time to 0.01 s. Pass exact frame indices with `?rate=`.
- Pitfall: do not run several `still.mjs` processes in parallel, because page loads time out.

**Cutaway "how it works" niche** (explored 2026-11-09; user leaning toward it over the rent Shorts)
- 8 s demo of a four-stroke cylinder cut in half, slowed 125×: `C:/Users/PC/kenh-youtube/shorts-tests/engine-cutaway/`. It has film/index.html and tools/build.py.
- Technique: castings are section profiles extruded back, with the cap as the cut face. Bore and ports are half tubes. Moving parts are whole. Particles show the gas.
- Competitors: Jared Owen, Lesics, Branch Education, Animagraffs. All are long-form and slow to produce, so the gap is regular, high-quality Shorts.
- The proposed series list was given 2026-11-09. It starts with: lock, toilet, engine, smoke detector, watch, and elevator brake.
- For US viewers, a 20-episode list was then given (gas pump shutoff, garbage disposal, sprinkler, traffic-light sensor...). Shorts run 30–40 s with voiceover and burned-in captions; long-form 8–12 min compilations are for mid-roll RPM.
- The user picked the automatic transmission as Short 02. It is in `C:/Users/PC/kenh-youtube/shorts/s02-automatic-transmission/` (39 s, "Cut in Half" series). It uses Jared-Owen-like colour coding: sun gold, planets blue, carrier green, ring silver. Held parts get an orange band.

**Stick-figure fight test** (2026-11-10): the user asked for a cinematic stick-figure fight in a cloning setting.
- Made "SUBJECT 07" (20.7 s, 2D canvas) in `C:/Users/PC/kenh-youtube/shorts-tests/stick-clone-fight/`. Rebuild steps are in BUILD.md.
- Story-time speed ramps (tl.json) are shared by the page and the audio.
- Pitfall: camera shake must stay under about 8 Hz, or the 4-subframe blur turns into ghost copies.
- Then "ELEVATOR" (34.4 s, 9:16, loops; floors 1→30 then back to 1) in `C:/Users/PC/kenh-youtube/shorts-tests/elevator/`.
  - Shorts with a story: 30–45 s, wordless.
  - The plot is told with a visible counter, a repeated rule (ding = enemy), and a callback twist.
- Earlier the user also looked at the GeoGlobeTales map-story Shorts and an AI fox character sheet. Stylised, code-friendly looks were recommended over Pixar fur.

**Why:** chosen after channel-niche research. Animation earns less, so they chose a documentary niche.
**How to apply:**
- Reuse the Ep01 pipeline: `tools/plan.py`, `render.py`, `score.py`, `assemble.py`, `shorts.py`.
- Never install system software. Running a downloaded ffmpeg was blocked, so encode with PyAV.
- See [[absolute-file-links]].
