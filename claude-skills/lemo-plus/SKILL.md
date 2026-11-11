---
name: lemo-plus
description: >-
  Add-on for the Lemo-Opuscar film skill (lemo-opuscar). It adds what Lemo-Opuscar leaves to the agent's habits:
  fresh angles from real things drawn by chance and checked against the user's past films; a writing system for
  scripts and narration (word budget, banned clichés, AI-writing tells, read-aloud and 30% cut, cold-viewer check,
  sourced facts, the long-film promise and curiosity map); a named camera and transition vocabulary with a helper of
  pure functions of time; a look board from real film stills, measured into a palette; and a typography system
  (phone legibility, scale, motion, a curated pairing deal with a taste log). Use it whenever lemo-opuscar is used,
  and when the user asks for angles or ideas for a code film, to polish or check a film script or narration, for
  camera moves or transitions, a look board, or a font pairing for a film ("góc nhìn mới", "kiểm tra kịch bản",
  "chọn font cho phim", "bảng look", "camera").
---

# lemo-plus

An add-on to Lemo-Opuscar. Lemo-Opuscar directs and builds the film; lemo-plus sharpens four things inside its
workflow: **the idea, the words, the camera and the type** (plus a look board). It never replaces a Lemo step and
never touches the library: nothing is written into `$LIB` (the Lemo clone resets itself on every update).

`PLUS` below is this skill's base directory. Scripts run with the system Python (`python`, or `py -3` on Windows);
`palette.py` needs Pillow (Lemo's `$LIB/.venv` has it after `setup.sh deps`, or any venv with `pip install pillow`).

## Precedence

1. The style's `STYLE.md` (look, colour, type, motion, camera grammar, sound palette): fixed. lemo-plus never bends it.
2. Lemo's `AGENTS.md` and `DIRECTOR.md`: the workflow, the questions, the delivery.
3. lemo-plus: adds checks and methods inside those steps.

**Lemo asks once.** Lemo's rule is one round of questions, then no stops (except a storyboard the user asked for).
lemo-plus keeps it: what it offers (the angles, a look board, the type pick) goes **into that one round** as extra
questions with a recommended answer, or is decided by you with the reason written in `TREATMENT.md`. Only when the
user asks to review steps ("duyệt từng bước", "show me first", "step by step") do the gates below become stops:
the angle pick, the look board, the type pick, each a question with the recommended option first.

## Where each part plugs in

| Lemo step | lemo-plus adds | Read |
|---|---|---|
| **Brief** (`AGENTS.md` Workflow 1, `DIRECTOR.md` §1) | When the topic is open (a subject, not a story): deal 3 sparks, run the prediction test and the overlap check, offer the 2–3 strongest angles as one question in the brief round. Skip when the user brings a finished script or story. | `references/ideas.md` |
| **Benchmark** (§2) | Optional look board: 2–3 directions of real film stills inside the style, the picked one measured into a palette. | `references/look-board.md` |
| **Story + treatment** (§3–4) | The diverge pass feeds the treatment's three candidate structures. The writing system for logline, turn, ending, beat sheet and every line. Long films: the promise, the curiosity map, the tempo map. Real events: `research/facts.md`, one row per claim with its source. | `references/writing.md` |
| **Shot list** (§4.4) and **camera** (§8) | Every shot's camera as one camera line (name, seconds, speed easing, target), transitions named with their reason, cut seams. Implemented with `assets/cam.js`. | `references/camera.md` |
| **Subtitle and title design** (§4.8) | If `STYLE.md` fixes the type: only the phone-legibility rules and the type QC. If the film uses a house style, a "My style" or a style that leaves type open: deal 3 pairings, specimen cards, the pick logged in the taste log. | `references/typography.md` |
| **Voice** (TECHNIQUE §4) | Before TTS: `words_check.py` on `lines.json`, the read-aloud timing and the 30% cut. | `references/writing.md` §7–9 |
| **Before you deliver** (§11) | `words_check.py` exits 0; facts all `confirmed` or worded as reported; type QC passes; the film is remembered for the next overlap check (`spark.py remember`). | below |

Open a reference only when its step comes, and only the section you need.

## Tools

```text
python PLUS/scripts/spark.py deal --project <folder> [--n 3]       # 3 sparks: seed from outside + place, form, medium, 2 extras
python PLUS/scripts/spark.py redeal --project <folder> --reason "<why none serve>"
python PLUS/scripts/spark.py pick s2 --project <folder> --reason "<the idea crossed with this hand>"
python PLUS/scripts/spark.py looks --project <folder> [--n 6]      # names for the look board (cinematographers, painters, crafts)
python PLUS/scripts/spark.py past --scan <folder>                 # remember films already made under a folder (once)
python PLUS/scripts/spark.py past --out <project>/research/past-films.md   # the memory, for the overlap helper
python PLUS/scripts/spark.py remember <project> --title "<title>" --idea "<logline>" --medium "<style>"
python PLUS/scripts/words_check.py <project>                      # lines.json, TREATMENT.md lines, index.html strings
python PLUS/scripts/words_check.py <file> [<file> …] [--lang en|vi] [--line]
python PLUS/scripts/palette.py measure <img|dir> [...] --out <project>/research/direction.json
python PLUS/scripts/palette.py board --row "A|<label>|<dir>" --row "B|…" --out <project>/review/directions.jpg
python PLUS/scripts/palette.py compare <frame.png> --against <project>/research/direction.json
python PLUS/scripts/type_deal.py deal --project <folder> --purpose cinematic|ad --look <family> --mood "<tone>" --title "<title>"
python PLUS/scripts/type_deal.py pick <pairing id> --project <folder> --reason "<why>"
python PLUS/scripts/type_deal.py taste <pairing|font id> --verdict like|reject --reason "<the user's words>"
node "$LIB/core/render/still.mjs" "<project>/type" 0 --q i=0 --out <project>/review   # a specimen card, Lemo's renderer
```

Memory that carries across films lives in `~/.lemo-plus/` (`films.json`, `sparks-seen.json`, `taste.json`).
Per-film records go into the project folder (`plus-history.json`, `research/`, `type/`).

## Hard rules (all films)

- **No dash in the film's words**: no em dash, no en dash or `--` used as one (a range like 1–3 stays). A comma,
  full stop, colon or line break instead. `words_check.py` exits 1 on one; fix before TTS and before the render.
- **Every claim about a real person, place or event has a source** in `research/facts.md` (claim · source link ·
  confirmed / unconfirmed). Unconfirmed claims are cut or worded as reported ("according to…"). A number is never
  rounded into a stronger one. A source that cannot be reached is written as unreachable, never filled from memory.
- **Phone legibility**: cap height ≥ 28 px on 1080-wide 9:16 and 1:1, ≥ 40 px on 1920×1080; text contrast ≥ 4.5:1
  (3:1 for big display). This holds even when `STYLE.md` fixes the font.
- **Film stills on a look board are copyrighted**: thumbnails for choosing and measuring only, never in a frame,
  never shipped.
- **The style stays the style.** A camera move, a transition, a font or a palette that `STYLE.md` rules out is not
  used, whatever this skill suggests.

## Delivery additions

Next to what `DIRECTOR.md` §11 lists, in the project folder:

- `research/facts.md` (films with real people or events), with every claim confirmed or worded as reported;
- the words report: `python PLUS/scripts/words_check.py <project>` with 0 dashes, every tell fixed or kept with a
  reason in `TREATMENT.md`;
- the film added to the memory: `spark.py remember <project> --title … --idea … --medium …`, so the next film's
  overlap check knows it.

Tell the user in one line what lemo-plus changed in this film (the angle it chose, the words cut, the camera
signature, the type), in their language.

## Credits

The methods, data banks (`data/sparks.json`, `data/seeds.json`, `data/type-library.json`) and the word-check
patterns are adapted from **cinecode** by Sarp Yıldız (github.com/sarpstar/cinecode, MIT, commit 67f9807). See
`LICENSE`.
