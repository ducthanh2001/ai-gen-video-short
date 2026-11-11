---
name: youtube-3d-story-shorts-competitors
description: "2026-11-11 analysis of 3 competitor channels doing 3D toy-world round-head-character story Shorts (afterhourtheories, RicksClips3000, ReadWithJessicaa) and the script formulas"
metadata:
  node_type: memory
  type: project
  originSessionId: 81fa7e44-32f2-4d93-9971-51d4ea0f1940
  modified: 2026-11-11T03:10:12.068Z
---

On 2026-11-11 the user looked at entering the "3D toy world + round-head meme-face characters + word-by-word captions" Shorts niche.

- **@afterhourtheories**: second-person "What If [Elon Musk]..." chain ("need X → build Y"). 5.4k subs, one 1.88M-view outlier.
- **@RicksClips3000** ("Ricks Clips", 167k subs): pivoted in Oct 2026 from meme compilations. 60–65 s fictional underdog stories that end on a hidden science or engineering reveal (railroad expansion gaps 28M views, Zhang Heng seismoscope jar 33M). Most videos get 3–33M views.
- **@ReadWithJessicaa** ("Jessica Jokes", 48k subs): famous-person anecdote plus a moral (Einstein 9×10 got 26M, Diogenes/Alexander 2.4M). Many of the anecdotes are apocryphal.
- **Shared formula:** a paradox in line 1, "You see," at about 3 s, a crowd mocking the hero, the hero stays silent, a reversal, quoted dialogue, about 160 words in 60 s. Each story uses only 1–3 locations.
- **My recommendation:** the RicksClips-style engineering story, because it fits the user's cutaway / "how it works" strength and verified facts. Sample script: Elisha Otis cutting the rope in 1854.
- A pilot project was started at `C:/Users/PC/Filmler/nvidia-ai-race` (cinecode Quick mode). It was paused when the user asked for this analysis.

Pitfall: yt-dlp gets HTTP 429 when subtitles are downloaded in parallel, so download one video at a time. Running `init_film.py` from the home folder fails on `Intel\Logs`, so run it from `C:/Users/PC/Filmler`.

Related: [[youtube-channel-price-history]]

**Update 2026-11-11 (later):**
- 7 verified "laughed at, then proven right" scripts written to `C:/Users/PC/kenh-youtube/shorts-tests/kich-ban-underdog/KICH-BAN.md`: Marshall, Goddard/NYT, Thales, Otis, Semmelweis, Jenner, Tharp.
- The user asked whether rea-video (JuneYaooo/rea-video) had been used on the competitors. It had not been run: the auto-mode classifier blocked `pip install` of the cloned repo into a scratch venv. Do not retry or work around; ask the user to allow it or run it themselves. Its installer symlinks into ~/.claude, so never run `install_skill.sh`.
- rea-video has no script-analysis feature. It does shot-origin classification, subtitle/text-style OCR, SFX timing, BPM and voice/music stems.
- Direction proposed: put the underdog formula on the Clay & Myth channel as a Shorts lane, with Greek topics anchored on a real artifact. Shorts views count toward the 10M-in-90-days YPP route.

**rea-video ran 2026-11-11 (user approved the install)** in a venv under the session scratchpad (`pip install <repo>[ocr]`; needs `PYTHONUTF8=1` on Windows; first run downloads a 67 MB stems model; about 4-5 min per 65 s video in tools-only `--no-vlm --lang en`). Without a VLM it labels stylised 3D cartoons "live action", so ignore its shot classes. Its measured numbers are reliable:
- Ricks Clips: 62-66 s, 11-20 cuts/min (33M-view jar Short = 20/min, avg shot 2.9 s; 28M railroad = 11/min), narration 148-162 wpm, loudness RMS -16.8 dBFS / peak -2.5, about 16-19 SFX per minute (ding, whoosh, pop tied to captions), music 139.7 BPM F major in the jar Short.
- Captions: white text, black outline, line height about 5.5% of frame height, centred at about 68% down, 1-2 words per cue, hard cut-out, occasional orange accent word.
- Ricks Clips wins in every topic group (median 5-16M views), so the format matters more than the topic: an unnamed-character parable built around one true mechanism, hidden reveal at the end. Jessica (named-person anecdotes) has median about 240k and one 26M outlier.
- Recommended lane for the user: everyday engineering/object secrets (+ ancient engineering, brain tricks, money) as true-mechanism parables; label descriptions "dramatised story, the engineering is real".

**Direction chosen 2026-11-11: B = ancient engineering parables** (6 scripts + titles in `C:/Users/PC/kenh-youtube/shorts-tests/kich-ban-b-ancient/KICH-BAN-B.md`: Han magic mirror, Roman concrete, Lycurgus Cup, wet-sand sledge, Antikythera, yakhchal). Pilot recommendation: Lycurgus Cup (cheapest 3D, strongest wow). Title formula from 36 Ricks titles: 4-8 words, no emoji/hashtags, never reveals the answer; "The [object] That [verb]" median 15M, "Why [subject] [counterintuitive verb]" median 9M, avoid "How ...". Caveat: Ancient topics have lower stakes than Ricks' jar/railroad, so each script needs an invented deadline/rival/consequence.

**Google Trends read 2026-11-11 (YouTube search, US, 12 months; done in the user's Chrome, tab closed):** niche keywords have tiny search volume (Antikythera ~14 best of the 6, Lycurgus 0-6, yakhchal no data); generic "pyramids / roman empire / ancient egypt" are decaying; "ancient medicine" +750%; "ancient china inventions" is school-season driven (peaks Feb-May, near 0 in Oct); the Socrates-skeleton meme peaked at 100 in Mar 2026 and was back to baseline by June. Shorts are feed-driven so search volume is only a weak guide. Added script 7 (Inca trepanation) and rewrote Antikythera and Roman concrete bodies in KICH-BAN-B.md; new priority: Antikythera, Roman concrete, trepanation, Han mirror (post Jan-Mar 2027).

**B01 Antikythera Short, half-size draft built 2026-11-11** in `C:/Users/PC/kenh-youtube/shorts/b01-antikythera/` (renders/b01-antikythera-draft.mp4, 540x960, 57.5 s, 17 cuts, -14 LUFS, no music, Kokoro af_heart at 0.95; the user chose to keep the script/title as is, without the word "Antikythera"). Builder notes in NOTES.md (cinecode capture script + local three.js). Known weak spots: shot 3 has no craftsman, shot 1b crops him, limited crowd expressions, synthetic SFX, quiet RMS. Still to do: user review, fixes, full-size render only after OK, verify the Moon-phase claim with a scholarly source and replace press sources before publishing.

**B01 final render done 2026-11-11:** `C:/Users/PC/kenh-youtube/shorts/b01-antikythera/renders/b01-antikythera-final.mp4` (1080x1920, 57.6 s, RMS -16.5 dBFS, -12.8 LUFS, peak -3.5; for exactly -14 LUFS run `film\mix.sh 5.0` then re-mux). Weak-spot fixes done (craftsman in shots 1b/3, 8 distinct courtier faces, richer sea/void/mechanism, softer SFX). Still weak: reused body shapes, synthetic SFX. Before publishing: re-read Freeth et al. 2008 (Nature 454) for the Moon-phase ball, replace press sources in FACTS.md, put "dramatised story" line in the description.

**B01 v2 (in progress 2026-11-11):** user chose narrator voice Kokoro `am_michael` (warm male, speed about 0.92; auditions in `shorts/b01-antikythera/voice-audition/`, others tried: am_onyx, bm_george, bm_fable, am_fenrir). Also asked: stronger 0-5.6 s hook, non-looping shot 3 split in 3a/3b, box prop must be a closed case (face was visible through its open side). Output will be `renders/b01-antikythera-final-v2.mp4`; v1 final kept.

**B01 v2 delivered 2026-11-11:** `shorts/b01-antikythera/renders/b01-antikythera-final-v2.mp4` (1080x1920, 61.0 s, voice am_michael at 0.97 (0.92 made it 64 s), -13.1 LUFS, RMS -16.6, peak -2.0, about 20 cuts/min, hook of 7 shots, shot 3 split 3a/3b, closed box prop, aperiodic motion). TTS reads "1901" as "nineteen oh one" via film/pronounce.json (captions still show 1901). Weak: king's pointing finger in 3a, shared crowd body shapes, synthetic SFX. For exactly -14 LUFS: `film\mix.sh 6.0` + re-mux. Not yet listened to by me (cannot hear audio); user should listen.

**B01 v3 delivered 2026-11-11:** `renders/b01-antikythera-final-v3.mp4` = v2 with captions lowered to centre about 76% of height (measured 0.758; Shorts UI covers bottom ~18-20%). Same audio (-13.1 LUFS). Thumbnails: `renders/thumb/THUMB_A_what-is-this.jpg` (recommended), `THUMB_B_30-gears.jpg`, `THUMB_C_they-laughed.jpg`. Title/description/pinned comment in `b01-antikythera/YOUTUBE.md`. Known flaw: dark brown band at the top of the wide throne-hall shot. Before publishing: Moon-phase claim re-check, academic sources, "dramatised story" line.

**B02 Roman concrete script written 2026-11-11:** `C:/Users/PC/kenh-youtube/shorts/b02-roman-concrete/` (SCRIPT.md 14 beats, 143 words with visual plan; FACTS.md; YOUTUBE.md). Title "Why Roman Walls Heal Their Own Cracks". Key source: Seymour, Masic et al., Science Advances 2023, doi:10.1126/sciadv.add1602 (ancient sample from Privernum, not a harbour; never claim the Pantheon self-heals). Two-week healing figure comes from secondary coverage; the paper (403) and the MIT page (user stopped the fetch) were not opened. Not yet built; waiting for the user's OK on the script.
**B02 v3 script approved and build started 2026-11-11:** user reviewed v2 with their own checklist (`C:/Users/PC/Downloads/SKILL_REVIEW_KICH_BAN.md`, scores A story / B voice / C AI tells / D platform, 0-2 each); fixes in `b02-roman-concrete/REVIEW.md`, v3 in SCRIPT.md (144 words, hook "He ruined the concrete on purpose, and it started to boil."). Same builder agent as B01 (a12e1b0a89c1b3240) builds it: contact sheet first, then straight to 1080 final (no half-size draft video), -14 LUFS, second Kokoro voice for the master's "Sloppy". Run that review checklist on future scripts before showing them.
**B02 delivered 2026-11-11 (~40 min build):** `shorts/b02-roman-concrete/renders/b02-roman-concrete-final.mp4` (1080x1920, 57.87 s, -14.2 LUFS, peak -3.5, 19.7 cuts/min, ASR 1.000, master voice am_onyx). Thumbnails THUMB_A_sloppy.jpg (recommended), THUMB_B_on-purpose.jpg. Weak: sealed-crack shot looks like lightning, laughing workers off frame in 6a, lab cylinders at frame edges, plain ruins, small waves in shot 3, young builder's "Give it time" face neutral, synthetic SFX.
