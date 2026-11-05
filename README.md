# Ink & Ages: production repo

Source for the YouTube channel **Ink & Ages** ("History, told in ink"), which publishes English-language explainers on the economic history of everyday things. Every frame, the score and the narration are made in code.

| Folder | What's in it |
|---|---|
| `ep01-price-of-light/` | Ep 01 "The Price of Light": script, verified facts, scene code, edit plan, score, assembly, Shorts, thumbnails. See its `BUILD.md`. |
| `brand/` | Channel banner (`make_banner.py` builds `banner.png` from the AI-generated objects in `banner-ai.png`) |
| `tools/` | Shared tools: Kokoro narration (`narrate.py`), Whisper checks (`asr_lines.py`, `asr_mix.py`), encoder (`encode_h.py`), voice audition |
| `*.md` | Channel research and script format notes (Vietnamese) |

Not in git: rendered frames, MP4s, WAVs and the Python venv. They are rebuilt from this source; the finished videos live on YouTube and in cloud storage.

Credits and licences: `ep01-price-of-light/CREDITS.md`. The scene engines in `ep01-price-of-light/film/engines/` come from Lemo-Opuscar (MIT, see the LICENSE there). Fonts are under the SIL OFL, with licence files in `film/fonts/`.
