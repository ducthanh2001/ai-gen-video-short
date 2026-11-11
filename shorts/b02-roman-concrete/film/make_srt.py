"""caption groups -> renders/b02-roman-concrete.srt"""
import json, os
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(EP, 'film', 'timeline.json')))
def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}'
out = []
for i, c in enumerate(TL['caps'], 1):
    txt = ' '.join(w['t'] for w in c['w'])
    assert '-' not in txt and '–' not in txt and '—' not in txt, txt
    out.append(f"{i}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{txt}\n")
open(os.path.join(EP, 'renders', 'b02-roman-concrete.srt'), 'w', encoding='utf-8').write('\n'.join(out)); print(len(out), 'captions, no dashes')
