---
name: lemo-plus-skill
description: "User's add-on skill lemo-plus (ideas, writing, camera, look board, type) layered on lemo-opuscar; built 2026-11-09 from cinecode (MIT)"
metadata:
  node_type: memory
  type: project
  originSessionId: 133fae60-e36f-4991-b6ad-ace4c5db8cc6
  modified: 2026-11-09T03:43:24.996Z
---

On 2026-11-09 the user had a skill called lemo-plus built and installed at `C:/Users/PC/.claude/skills/lemo-plus/`. The source copy is at `C:/Users/PC/lemo-plus/`.

It adds parts of cinecode (MIT) on top of lemo-opuscar:
- spark.py: dealing ideas, plus an overlap check against past films
- the writing system and words_check.py
- cam.js: camera moves
- palette.py: look board (needs Pillow)
- type_deal.py: font pairings, with specimen cards rendered by Lemo's still.mjs

Memory that carries across films lives in `~/.lemo-plus/`. Ep01 was seeded into `films.json`.

**Why:** The Lemo clone at `~/lemo-opuscar` is managed, with `lemo.managed=true`. `setup.sh` runs `git reset --hard` on every run, so anything edited inside it is lost. That is why the add-on lives outside the clone.

**How to apply:**
- Never edit `~/lemo-opuscar`.
- After delivering each film, run `spark.py remember`.
- Edit the skill in one place, then sync it to the other copy.
- Related: [[youtube-channel-price-history]]
