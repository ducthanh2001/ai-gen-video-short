#!/bin/bash
# usage: sheet.sh out.png in1 in2 ...   (hstack)
OUT=$1; shift; N=$#; ARGS=""; for f in "$@"; do ARGS="$ARGS -i $f"; done
/c/Users/PC/ffmpeg/bin/ffmpeg -y -loglevel error $ARGS -filter_complex "hstack=inputs=$N" "$OUT"
