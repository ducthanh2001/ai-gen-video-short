#!/bin/bash
# usage: thumb.sh a|b|c|d [WxH]   -> renders/thumb_work/<x>/000000.png (no captions, no labels)
cd /c/Users/PC/kenh-youtube/shorts/b02-roman-concrete
W=${2:-1080}; H=${3:-1920}
node /c/Users/PC/.claude/skills/cinecode/scripts/capture.mjs --url film/index.html --out renders/thumb_work/$1 --frames 0 --format png --params "w=$W&h=$H&nocap=1&nolabel=1&thumb=$1" --fresh 2>&1 | tail -1
