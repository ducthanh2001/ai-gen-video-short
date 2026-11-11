#!/bin/bash
# usage: still.sh outdir t1 t2 ...  (seconds) -> renders frames at 540x960
OUT=$1; shift; F=""; for t in "$@"; do F="$F,$(python -c "print(round($t*30))")"; done; F=${F#,}
node /c/Users/PC/.claude/skills/cinecode/scripts/capture.mjs --url /c/Users/PC/kenh-youtube/shorts/b01-antikythera/film/index.html --out "$OUT" --frames "$F" --format png --params "w=${W:-540}&h=${H:-960}" --fresh 2>&1 | grep -v "^\[capture\] frames"
