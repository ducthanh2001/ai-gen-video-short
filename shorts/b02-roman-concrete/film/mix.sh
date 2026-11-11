#!/bin/bash
# B02 mix: voice + sfx + room tone -> audio_mix.wav mastered to -14 LUFS integrated, true peak <= -1 dBFS (two passes).
cd /c/Users/PC/kenh-youtube/shorts/b02-roman-concrete
PYTHONUTF8=1 /c/Users/PC/anime-hair-colors/.venv/Scripts/python.exe film/build_audio.py 2>&1 | tail -1
FF=/c/Users/PC/ffmpeg/bin/ffmpeg
TOTAL=$(python -c "import json;print(json.load(open('film/timeline.json'))['total'])")
pass() {  # $1 = gain dB
$FF -y -loglevel error -i film/voice_raw.wav -i film/sfx_raw.wav -i film/room_raw.wav -filter_complex "[0]highpass=f=80,acompressor=threshold=0.035:ratio=6:attack=3:release=70:makeup=5,equalizer=f=280:t=q:w=1:g=-2.5,equalizer=f=3000:t=q:w=1:g=2,alimiter=limit=0.9:attack=2:release=30[v];[1]volume=1.0[s];[2]volume=0.05[r];[v][s][r]amix=inputs=3:normalize=0:duration=longest,volume=$1dB,alimiter=limit=0.82:attack=1:release=40:level=disabled,atrim=0:$TOTAL[o]" -map "[o]" -ar 44100 -ac 2 audio_mix.wav
}
measure() { $FF -hide_banner -nostats -i audio_mix.wav -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E " I:" | awk '{print $2}'; }
G=0; pass $G; I=$(measure)
G=$(python -c "print(round(-14 - ($I), 2))"); pass $G; I=$(measure)
G2=$(python -c "print(round($G + (-13.8 - ($I)), 2))"); pass $G2
$FF -hide_banner -nostats -i audio_mix.wav -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E " I:|Peak:|LRA:"
$FF -hide_banner -nostats -i audio_mix.wav -af astats -f null - 2>&1 | grep -E "RMS level dB|Peak level dB" | head -2
echo "gain $G2"
