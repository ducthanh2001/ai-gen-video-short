"""Wait for the four frame renders, then mux frames + audio_mix.wav into the final mp4 (H.264 + AAC, -14 LUFS)."""
import os, re, time, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); FR = os.path.join(HERE, 'frames')
FF = r'C:/Users/PC/ffmpeg/bin/ffmpeg.exe'
def collect():
    out = []
    for p in sorted(os.listdir(FR)):
        d = os.path.join(FR, p)
        if os.path.isdir(d):
            for f in os.listdir(d):
                m = re.match(r'f_(.*)\.jpg$', f)
                if m: out.append((float(m.group(1)), os.path.join(d, f)))
    return sorted(out)
last = -1; stable = 0
while True:
    n = len(collect())
    if n >= 13500 and n == last: stable += 1
    else: stable = 0
    last = n
    if stable >= 3: break
    time.sleep(8)
fr = collect(); print('frames', len(fr), 'last t', fr[-1][0], flush=True)
lst = os.path.join(HERE, 'frames.txt')
with open(lst, 'w') as o:
    for t, f in fr: o.write("file '%s'\nduration 0.0416667\n" % f.replace('\\', '/'))
    o.write("file '%s'\n" % fr[-1][1].replace('\\', '/'))
out = os.path.join(HERE, 'ep01-why-zeus-swallowed-his-wife.mp4')
cmd = [FF, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', os.path.join(HERE, 'audio_mix.wav'),
       '-vf', 'fps=24,format=yuv420p', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]
subprocess.run(cmd, check=True)
print('done', out, round(os.path.getsize(out) / 1e6, 1), 'MB', flush=True)
