---
name: youtube-greek-myth-channel-direction
description: "2026-11-10 niche decision: new English channel, Greek mythology told from real artifacts, long-form (~12 min), black-figure vase style in code; plans written"
metadata:
  node_type: memory
  type: project
  originSessionId: ec1a0e76-4565-41ba-bf4e-33fa83be4d7f
  modified: 2026-11-11T10:51:19.680Z
---

On 2026-11-10 the user chose **Greek mythology (stories/explained), long-form** as the main niche, after a research round (YouTube search scans + Google Trends with the YouTube filter, US).

**Concept:** "Greek myths told from real artifacts" — each episode anchored on one real object (vase, relief), narrated from primary texts (Hesiod, Homer, Apollodorus, Ovid), flagging where sources disagree. Visual style: black-figure vase painting built in code (canvas 2D). English channel for US viewers; user chats in Vietnamese and cannot self-check English prose, so needs ASR round-trip, fresh-agent cold read and ideally a native speaker for the first 3 episodes.

**Evidence found:**
- Small channels (<50K subs) get big views in mythology: 9 of 26 recent small-channel videos had 100K+ views. Title formulas that work: "Every God in X Explained", "The Entire Story of X in 15 Minutes".
- Trends (US, YouTube search, 5y): greek mythology is about 25x Japanese; Slavic and Mesopotamian are near zero, so drop them. Aztec and Japanese are small but rising. "history for sleep" is exploding (possible side experiment). Avoid "for kids" (RPM).
- The earlier price-history niche has weak search demand (median top-result views about 41K; "minimum wage hours of work" almost none).

**Files written 2026-11-10 in `C:/Users/PC/kenh-youtube/`:** `KE-HOACH-XAY-KENH-GREEK.md` (plan to YPP) and `HUONG-DAN-VIET-KICH-BAN.md` (scriptwriting process, banned tells, pronunciation, checklists). Next: ep-greek-01 folder, script + FACTS.md, 45 s style test with 3 voice samples.

**Channel name decided: "Clay & Myth" (@ClayAndMyth, created).** Banner built 2026-11-10 in `C:/Users/PC/kenh-youtube/brand/clay-and-myth/` (make_banner.py; 2560x1440, safe area 1546x423). Avatar still to do.

**Ep01 script done 2026-11-10: `C:/Users/PC/kenh-youtube/ep-greek-01/`** "Why Zeus Swallowed His Wife" (Theogony; narration.json 1,576 words, about 12 min). Files: SCRIPT.md (VN translation + per-line source), FACTS.md, TREATMENT.md, YOUTUBE.md, CREDITS.md; source texts in research/. Artifact: Chalcidian hydria Munich 596 (Zeus vs Typhon, c.540 BCE; Commons photos by Bibi Saint-Pol marked public domain, still verify licence). It passed an independent fact-check (found 1 real error: Gaia not Rhea gives Cronos the stone) and a cold-read. Not yet done: voice samples, vase-style character library, render, classicist read-through. Pitfall: use Gaia/Ouranos, not Earth/Heaven (lay listeners confuse them); do not say "throne" or "destroyed" as if Hesiod did.

**Visual decision (2026-11-10): user wants everything made by Claude, no Gemini/AI images.** Flat polygon puppets in PIL (`ep-greek-01/film-test/`) looked crude, rejected. Better: 3D black-figure amphora in three.js (`ep-greek-01/film-3d/index.html`, lathe body, painted canvas texture, Lemo HDRI; render with `node core/render/still.mjs <dir> <t..> --out`). Figures drawn as bezier silhouettes in the texture painter (drawZeus, drawTyphoeus). Still to tune: key light overexposes clay, glaze looks bronze, figures a bit thin, Typhoeus wraps off the visible edge. Plan: scenes painted onto vase friezes plus real museum photos for the artifact beat.

**Visual decision FINAL (2026-11-11): GeoGlobeTales look = antique/satellite map background + small half-body chibi SELF-STICKERS (head and shoulders) that pop/slide/bounce as one piece, dotted path lines, hatched highlight on regions, small white 2-4 word captions, a new image every 2-4 s, voice-over tells the story, NO walking rigs, NO speech bubbles (user agreed; Hesiod has no dialogue).** Dropped: 3D vase, 3D clay (`film-3d`, `film-clay`), full-body 2D (`film-2d`). Current: `ep-greek-01/film-sticker/` (index.html canvas 2D; mapdata.js from Natural Earth 50m land, public domain, downloaded 2026-11-11 to `research/natural-earth/`; timing.js from Kokoro sentence wavs in `narr/`; render with lemo `still.mjs --range`, ffmpeg mux -> `test-sticker-map.mp4`, 15.7 s, covers b5-b6). Analysis in `research/PHAN-TICH-GEOGLOBETALES.md`; rea-video repo cloned in `research/rea-video-src` (never ran its installer). Next: sticker library (Ouranos, Zeus, Hestia...), more map scenes, full episode timing from voice, real Munich vase photo beat, 9:16 Shorts crops.

**Ep01 BUILT 2026-11-11:** `ep-greek-01/film-final/ep01-why-zeus-swallowed-his-wife.mp4` (9:27, 1080p24, -14.4 LUFS, 275 MB). Pipeline in that folder: narr/ (Kokoro af_heart per sentence) -> build_timing.py -> timing.js/narration.wav; chars.js (17 sticker busts + props), engine.js (map/stage bgs, camera, captions, chapter chips, progress bar), shots.js (194 shots by sentence id, avg 2.9 s), cues.mjs -> score.py (lemo sampler music + synth sfx) -> render with lemo still.mjs in 4 parallel ranges -> assemble.py (ffmpeg). Extras: thumb/ (T1 "HE SWALLOWED HER", T2 "3 KINGS. 2 FELL."), ep01-captions.srt, YOUTUBE.md chapters updated. Not yet done: human listen to voice/music, pronunciation check, Beazley/CARC manual check, Commons licence check for the 2 vase photos, classicist read, publish. Lesson: bash heredoc with python containing quotes can fail, write .py with Write tool; Chrome-free engine renders ~100 fps per process.

**Ep01 v2 (2026-11-11), after user said "only characters, still many errors":** independent agent audits (AUDIT-v1.md + second pass) drove a rewrite: distinct character identities (colour + badge each; Hesiod's Typhoeus = snake-head mound, no face), new backgrounds (olympus, cave, sky/earth/Tartarus section, battle, nighthills), more map shots with army arrows, family tree, real PD art in gilt frames (Moreau, Vasari crop, Rhea relief drawing, Louvre F32). Dropped Goya/Rubens/Cornelis (gore/nudity, ad-suitability). No red X on pregnant/unborn, no invented quotes, no X-eye "deaths". Lesson: always run an independent visual audit of mid-frames before final render.

**Ep01 v3 (2026-11-11):** Whisper round-trip found voice too fast (194 wpm) and misreads (Hera, Hestia, Rhea, "boils"). Fixes: speed 0.85 (178 wpm, video 10:08), TTS-only respellings in `film-final/narrate2.py` (Hestya, Hayra, Ria), shorter hook sentences, a1 lecture line merged. Voice auditions in `film-final/auditions/` (af_heart, am_michael, bm_george, am_onyx, bf_emma); Owner first picked bm_george (Ep01 final 12:09 uses it), then on 2026-11-11 said it wasn't good and chose **channel voice = Kokoro mix 0.6 am_onyx + 0.4 am_michael, en-us, speed 0.88** (`kenh-youtube/tools/narrate_mix.py`). Ep01 not yet re-voiced with it. Ep02 (Birth of Athena, "Who Split Zeus's Head Open?") script in `ep-greek-02/` was reviewed with the owner's skill file `C:/Users/PC/Downloads/SKILL_REVIEW_KICH_BAN.md` (score A–D, top 10 fixes, verdict) — run that review on every new script. Note: kvenv has kokoro only; anime-hair-colors venv has faster-whisper/soxr.

**Why:** the user wants a niche with demand but few good competitors, and to differentiate from AI-slop channels.
**How to apply:**
- YPP full tier per YouTube's own help page: 1,000 subs plus 4,000 public watch hours in 12 months, or 1,000 subs plus 10M Shorts views in 90 days. Shorts feed hours do not count. Terms update Feb 1, 2027. Never promise a date.
- Scripts: use lemo-plus writing system, no dashes in narration, `words_check.py` must exit 0, every claim in FACTS.md.
- Never quote modern translations at length. Check each museum image's licence.
- Related: [[youtube-channel-price-history]], [[lemo-plus-skill]], [[absolute-file-links]].
