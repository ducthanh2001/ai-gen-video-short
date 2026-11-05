"""Render every shot of shots.json to film/out/shots/<id>/fr_<t>.jpg with the library's still renderer (24 fps).
Shots already complete are skipped. usage: python render.py [workers=2] [ids...]"""
import os, sys, json, subprocess, threading, time, shutil
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB, FILM = r'C:/Users/PC/lemo-opuscar', os.path.join(EP, 'film').replace('\\', '/')
plan = json.load(open(os.path.join(EP, 'shots.json')))
NW = int(sys.argv[1]) if len(sys.argv) > 1 else 2
ONLY = set(sys.argv[2:])
todo = []
for s in plan['shots']:
    d = os.path.join(FILM, 'out', 'shots', s['id'])
    have = len([f for f in os.listdir(d) if f.endswith('.jpg')]) if os.path.isdir(d) else 0
    if ONLY and s['id'] not in ONLY: continue
    if have >= s['frames'] - 1 and not ONLY: continue
    if os.path.isdir(d): shutil.rmtree(d)
    todo.append(s)
todo.sort(key=lambda s: -s['frames'])
lock, log = threading.Lock(), open(os.path.join(EP, 'film', 'out', 'render.log'), 'a')
def work(k):
    while True:
        with lock:
            if not todo: return
            s = todo.pop(0)
        t0, n = s['t0'], s['frames']
        rng = f"{t0}:{t0 + (n - 1) / 24 + 1e-6:.6f}:{1 / 24:.8f}"
        a = time.time()
        r = subprocess.run(['node', 'core/render/still.mjs', FILM, '--range', rng, '--q', s['q'], '--out', f"{FILM}/out/shots/{s['id']}", '--prefix', 'fr_'],
                           cwd=LIB, capture_output=True, text=True, encoding='utf-8', errors='replace')
        got = len(os.listdir(os.path.join(FILM, 'out', 'shots', s['id']))) if os.path.isdir(os.path.join(FILM, 'out', 'shots', s['id'])) else 0
        errs = [l for l in (r.stdout + r.stderr).splitlines() if 'rror' in l][:3]
        with lock:
            msg = f"[w{k}] {s['id']} {got}/{n} frames {time.time() - a:.0f}s {'ERR ' + ' | '.join(errs) if errs or r.returncode else ''}"
            print(msg, flush=True); log.write(msg + '\n'); log.flush()
ths = [threading.Thread(target=work, args=(k,)) for k in range(NW)]
for i, th in enumerate(ths): th.start(); time.sleep(4)
for th in ths: th.join()
print('done')
