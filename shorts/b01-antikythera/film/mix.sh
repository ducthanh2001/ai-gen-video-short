#!/bin/bash
# usage: mix.sh [voice_makeup_db] ; builds audio_mix.wav (voice + sfx + room tone), measures it
cd /c/Users/PC/kenh-youtube/shorts/b01-antikythera
PYTHONUTF8=1 /c/Users/PC/anime-hair-colors/.venv/Scripts/python.exe film/build_audio.py 2>&1 | tail -2
FF=/c/Users/PC/ffmpeg/bin/ffmpeg
GAIN=${1:-0}
$FF -y -loglevel error -i film/voice_raw.wav -i film/sfx_raw.wav -i film/room_raw.wav -filter_complex "[0]highpass=f=80,acompressor=threshold=0.035:ratio=6:attack=3:release=70:makeup=5,equalizer=f=280:t=q:w=1:g=-2.5,equalizer=f=3000:t=q:w=1:g=2,alimiter=limit=0.9:attack=2:release=30[v];[1]volume=1.0[s];[2]volume=0.05[r];[v][s][r]amix=inputs=3:normalize=0:duration=longest,volume=${GAIN}dB,alimiter=limit=0.84:attack=2:release=40:level=disabled,atrim=0:60.995[o]" -map "[o]" -ar 44100 -ac 2 audio_mix.wav
$FF -hide_banner -nostats -i audio_mix.wav -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E " I:|Peak:|LRA:"
$FF -hide_banner -nostats -i audio_mix.wav -af astats -f null - 2>&1 | grep -E "RMS level dB" | head -1
