# B02 Why Roman Walls Heal Their Own Cracks: build notes

Outputs (renders\): b02-roman-concrete-final.mp4 (1080x1920, 30 fps, 57.87 s), b02-roman-concrete-contact-sheet.png (one frame per shot), b02-roman-concrete.srt (88 captions, no dashes), b02-roman-concrete-sfx-log.json, thumb\ (thumb_a_seam, thumb_b_master, thumb_c_boiling_mix, thumb_d_lab_cylinders; 1080x1920 PNG, no captions).

## What was built (film\)
- Same pipeline as B01 v3: three.js toy world (engine.js, chars.js from B01 with body shapes, a 'shout' face and a wrinkle flag), cinecode capture.mjs, ffmpeg mux. Captions identical to B01 v3 (white, black outline, 1-2 words, block centre measured at 0.758 of the height, orange on the words listed in SCRIPT.md).
- world.js: the Roman harbour site (sea wall with finished, unfinished and the young builder's lumpy section, formwork, scaffolding, A-frame crane, mixing trough with bubbling mix, powder stream and steam, lime troughs, quay props, harbour town, lighthouse, moored boats, animated sea and wave spray); the storm version (dark sky, rain, rising wave, crack drawn progressively on the wall face; later the same crack as a white seam); the concrete cutaway (slab split by a jagged crack, aggregate, white lime lumps, water thread, dissolving lump with fizz and milky stream, crystals that zip the crack shut, glowing seam); the modern lab (two cylinders, with and without lumps, water bottles and tubes, drip, 14 day calendar, flow screen, scientist); the harbour ruins today (eroded piers and an arch, a modern motorboat with a wake, a close-up slab with one white lump).
- Cast: young builder (blue tunic, red headband), master builder (older: wrinkles, white beard, grey side tufts, wider body), 5 workers with different body shapes and hats, scientist (lab coat, glasses).
- shots.js: 20 shots on the word timings (TL.cuts from film/build_timeline.py). Moves alternate so neighbours never repeat a move or size: push in, overhead rotate, pull back, low tilt, crane, lateral truck, close push, vertical slide, orbit, slow close push, handheld storm, forward dive, arc, pull out with a flash cut, lateral slide, orbit, push and tilt, truck, crane drift, final push. All small motion uses aperiodic noise (nzf, lsh), no sine loops on characters. Ends on a hard cut after "years".
- Nothing shows steel bars, a modern mixer or the Pantheon; the reveal never says the harbour wall healed by this mechanism.

## Voice
- Narration: Kokoro am_michael at 0.97. "Sloppy," in am_onyx at 0.88 (auditioned against bm_george: am_onyx is lower, median pitch about 86 Hz vs 150 Hz, so it reads older and gruffer; both takes are in voice-audition\master_*.wav). "Give it time" (lines 6 and 15) in am_michael at 0.84, softened in the mix (low pass 6.5 kHz, about -3 dB).
- film/pronounce.json: MIT -> "M I T", 2023 -> "twenty twenty-three". "builder's" is phonemised exactly like "builders" (same sound), so no change was needed.
- ASR round trip: every segment 1.000 (after normalising "harbour/harbor" and "2,000"); final mix 1.000; caption start vs spoken start median 0.00 s (p5 -0.10, p95 +0.04).

## Sound
18 SFX (18.7 per minute, list in the log): bubbling and steam hiss in the hook, whooshes on 3 cuts, pour, powder shake, ding on "lumps", pop on the jab, thunder plus wave slam, wall crack, drip on "hit", fizz, crystal tinkle on "sealed", soft ding on "made up", lab crack snap, slowing drips, pouring water. Room tone per set. Master: -14.2 LUFS integrated, true peak -3.5 dBFS (two-pass gain in film/mix.sh, limiter at -1.7 dBTP).

## Rebuild
1. `kvenv python film/narrate_b02.py am_michael 0.97` (voices in narration.json; master voice from film/voices.json, made by film/audition.py).
2. `anime venv python film/asr_all.py` (check + word timings), then `python film/build_timeline.py`.
3. Key stills: `python film/keys.py` (one frame per shot at half size, renders/keys.png).
4. Final frames: `node ~/.claude/skills/cinecode/scripts/capture.mjs --url film/index.html --out renders/frames_final --format jpeg --quality 0.95 --params "w=1080&h=1920" --workers 3 --status renders/status.json` (about 2.5 min; status.json has done, total, eta_s).
5. `film/mix.sh` (SFX, room tone, voice chain, mastering), mux with ffmpeg (libx264 crf 17, AAC 192k), `python film/make_srt.py`, `python film/keys.py renders/b02-roman-concrete-contact-sheet.png 1080 1920 0.55 --from renders/frames_final`.
6. Thumbnails: `thumb.sh a|b|c|d` (film/thumbs.js, captions off).

## Known weak spots
- In 6a the laughing workers stay out of frame; the master's jab reads, the laughter is only in the voice-free beat.
- Shot 3 wide: the scaffolding reads as a simple frame and the waves are small at that distance.
- The storm wave is a simple rising slab with spray dots; the crack itself reads well.
- Shot 12 (6 s) is the longest shot: one orbit, the crack appears only at its end.
- The two lab cylinders sit far apart, so the thumbnail and shot 14 show them at the frame edges.
- Ruins today: eroded blocks plus one arch; no seaweed detail; the motorboat is simple.
- SFX are synthesised.

## Revision 2 (final-v2): picture fixes only (same voice files, timeline, captions)
Files: renders\b02-roman-concrete-final-v2.mp4, -final-v2-contact-sheet.png, -final-v2.srt (identical text and timing to v1); thumbs in renders\thumb\ remade. v1 kept.
- Sealed crack: no glow. The seam is a wide matte cream band of new stone with a crystalline speckle (seamMat in world.js), flush with the wall and lit like it; it grows along the crack over the dark crack after the pull-out in shot 10. Inside the cutaway the crystals are matte cream and the crack fills with a matte stone band that grows out from the lump. Same seam in the lab cylinder.
- 6a: three workers stand behind and beside the master, laughing with tears, bodies shaking, one pointing, while he jabs a lump.
- 6b: wider framing; a single shrug (shoulders and hands up, hold, down) on "shrugged", new half-smile face ('half' in chars.js).
- Lab: cylinders moved together (x = -0.55 and +0.55) and framed centrally; crack in shot 12 appears half-way through the orbit and runs full height on "cracked it"; shot 14 shows both side by side, left sealed and dry, right with a water stream running down the crack into a growing puddle.
- Shot 3: workers on the scaffold, braces, a second ladder, ropes, a hoist with a bucket, stone blocks on the wall; bigger sea and spray against the base.
- Storm: the wave is a curling breaker (extruded curl profile, foam lip, foam balls, spray burst on impact); camera starts side-on to see the curl, then swings to face the wall for the crack.
- Ruins: three arcade piers with arched openings and jagged broken tops, green algae line and a dark wet band at the waterline, rubble, small waves, the motorboat.
- Mastering: mix.sh targets -13.8 LUFS on the WAV so the AAC in the mp4 measures -14.0 LUFS.
Measured on final-v2: 57.87 s, -14.0 LUFS integrated, true peak -3.5 dBFS, 19 cuts (19.7 per minute), caption centre 0.758, no black frames.
Still weak: the wave is stylised (flat-shaded slab with a curl and foam, readable but not rich); the lab water in shot 13 is a falling stream in front of the cylinder; the master thumbnail shows only the master (workers out of frame); the ruins have no seaweed detail and the boat is simple.

## Revision 3 (final-v3): two timing/picture fixes, everything else as v2
Files: renders\b02-roman-concrete-final-v3.mp4, -final-v3-contact-sheet.png, -final-v3.srt (same as v2). v2 kept.
- Shot 10 ("The crack sealed itself") is now the storm wall only, with a gentle push-in on the crack: the cream seam starts on "THE CRACK" (33.95 s), covers the whole crack by 34.7 s ("SEALED") and stays sealed to the cut. The seam is wider (72 px band) and brighter (lighter cream plus a small matte lift so it reads in the dark storm light; no bloom, no glow). The cutaway interior now ends at the cut into shot 10.
- Shots 13 and 14: lab water now follows each cylinder's own crack path: it enters from the feed tube at the top of the crack, runs down inside the crack and drips out at the bottom into the tray (the puddle in 14). Feed tubes end at the crack top.
Measured: 57.87 s, -14.0 LUFS, true peak -3.5 dBFS, 19 cuts (19.7 per minute), no black frames, captions unchanged (centre 0.758).
