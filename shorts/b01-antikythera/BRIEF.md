# BUILD BRIEF: B01 Antikythera Short (give this whole file to the builder)

## Goal
Make a 9:16 YouTube Short (1080x1920, 30 fps, 55-62 s) from SCRIPT.md, entirely in code (three.js 3D, offline frame render, ffmpeg mux). It must look and feel like the top "3D toy world" story Shorts (Ricks Clips style) but be an original film. Deliver a HALF-SIZE DRAFT (540x960) first and wait for the user's feedback before any full-size final.

## What the competitors do (measured with rea-video; copy the FORM, never their scenes, characters or logos)
- Hook: line 1 is a person doing an odd thing. Picture moves from frame 1, no title card, no fade from black.
- 11-20 cuts per minute (aim about 15 shots for this film, 2-4 s each), camera ALWAYS moving (push-in, orbit, whip pan), only 2-4 locations.
- Characters: round white head with thick dark outline, meme-style flat face (expressions: smug, angry, laughing with tears, shocked, calm), small capsule body in one colour, thin stick limbs, simple costume props. Soft toy-like 3D, pastel-to-warm lighting, soft shadows, slight vignette, depth blur on far objects.
- Captions: burned in, 1-2 words at a time, word-timed to the voice, white text with black outline (stroke about 5% of letter height), letter height about 5.5% of frame height, centred, baseline at about 68% of the frame height (the middle of the frame, never the bottom 15%), hard cut in and out, key words may flash orange (#ff9f1c).
- Sound: voice loud and close, about 150 wpm. Short SFX tied to caption words and cuts (about 16-19 per minute: soft "ding", "whoosh", "pop"). Music optional: the 28M-view competitor has none, so use NO music, only a very quiet room tone per location. Overall level about -16 dBFS RMS, peak below -1.5 dBFS (target -14 LUFS integrated).

## Visual plan (13 narration lines; time shots to the actual voice)
1. Line 1: ECU on a small bronze box, gears turning, fast push-in; cut to the craftsman presenting it to a king on a throne; the whole court (6-8 round heads) laughing with tears, bodies shaking.
2. Line 2: wide of the throne hall, camera drifts up; painted gods on the wall; a window with the Sun.
3. Line 3: low-angle on the king pointing down; small craftsman; an executioner's axe silhouette in the background.
4. Line 4: workshop close-up: a file cutting a bronze gear, sparks, the craftsman calm and focused.
5. Line 5: hand turning a crank; ECU on a dial whose needle lands on "40".
6. Line 6: the court laughs harder, one courtier points at the sky.
7. Line 7: exterior, noon: the Sun disc, the Moon slides over it, light drops, colour shifts cold, birds scatter.
8. Line 8: the court frozen with open mouths, the king shocked.
9. Line 9: black-blue void, the craftsman as a dim silhouette that dissolves.
10. Line 10: UNDERWATER: divers in round helmets, a Roman wreck (amphorae, planks), a hand lifts a green-brown bronze lump; cut to a museum shelf, an archaeologist (round head, glasses) spots a tiny gear sticking out (macro push-in).
11. Line 11: X-RAY LOOK: the lump goes translucent blue, 30 gears appear inside, counter "30" ticks up, two dials highlight with labels "19 YEARS" and "223 MONTHS".
12. Line 12: reconstructed mechanism, gears spinning, orbit camera, brass and warm light.
13. Line 13: the lump lying on the seabed, slow pull-out, fading to dark. End on the last word, no end card.
Reuse locations (throne hall x2, workshop x2, sea x2). Faces are drawn on a canvas texture on the head sphere (swap expressions per shot).

## Pipeline hints (the user's existing setup; look before you build)
- Folder for everything: C:\Users\PC\kenh-youtube\shorts\b01-antikythera\ (build files in film\, renders in renders\, voice in voice\).
- Voice: Kokoro (kokoro-onnx), voice af_heart, speed about 1.05, venv C:\Users\PC\kenh-youtube\tools\kvenv, see C:\Users\PC\kenh-youtube\tools\narrate.py and shorts\s01-rent-1970\BUILD.md for the exact commands. Prefix commands with PYTHONUTF8=1. Check the voice with ASR (faster-whisper in C:\Users\PC\anime-hair-colors\.venv, see tools\asr_lines.py): every line must transcribe as written. Word timings for captions can come from the same ASR.
- Rendering: pick ONE deterministic frame-render route and read its docs first: (a) the cinecode kit at C:\Users\PC\.claude\skills\cinecode (templates\quick\film.html, scripts\capture.mjs, scripts\make.py; run its --probe for GPU), or (b) Lemo (core\render\still.mjs; known pitfalls: it rounds time to 0.01 s so pass exact frame indices with ?rate=, do not run several still.mjs at once). Frames must be pure functions of time (seeded randomness, no wall clock).
- Mux with ffmpeg (C:\Users\PC\ffmpeg\bin). Measure loudness with ffmpeg ebur128.
- Do not edit ~/lemo-opuscar (it resets itself). Never install system software. No paid services, API keys or large downloads; any extra model or asset needs the user's OK first. Do not use AI-generated images.
- Reference looks only (study, never reuse): contact sheets in C:\Users\PC\AppData\Local\Temp\claude\5d6096a35e425d74\81fa7e44-32f2-4d93-9971-51d4ea0f1940\scratchpad\comp\ (sheet_VS1Z_Q-Klt8.png, sheet_7xS87iActkU.png, sheet_ZBEQ71CIeQo.png) and ...\scratchpad\aht\f\sheet1.png. rea-video measurements in ...\scratchpad\rea-out\ricks_jar\.

## Process and QA (stills before video)
1. Write the voice, check it with ASR, then lay out the timeline (shot start/end from the voice).
2. Build characters + the throne hall + one X-ray frame first; render 4 stills (shots 1, 3, 10, 11) at 540x960, LOOK at them yourself (Read the png) and fix before going on: could any frame belong to another film? Are faces readable at phone size? Is nothing a bare primitive?
3. Build all scenes, render a contact sheet (1 frame per shot), check captions sit at about 68% height and never cover a face.
4. Render the half-size draft, mux voice + SFX, check: duration 55-62 s, no black frames, cuts per minute 12-20, loudness, captions match the words (ASR on the final mix), no dashes in any on-screen text.
5. Deliver: renders\b01-antikythera-draft.mp4, a contact sheet, the .srt, and a short note listing every choice you made (look, voice, SFX) so the user can change any.

## Reporting format (reply to the requester in 10 lines or fewer)
Paths of the draft, contact sheet and srt; duration and measured loudness; cuts per minute; what is weakest and what you would fix next; anything that needs the user's OK. Do NOT render a full-size final.
