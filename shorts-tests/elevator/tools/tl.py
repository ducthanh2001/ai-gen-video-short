"""Story time (tau) <-> real time, mirroring film/index.html (speed ramps from film/tl.json)."""
import json, os
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'film', 'tl.json'), encoding='utf-8'))
DT = 1 / 2000


def smooth(k):
    k = np.clip(k, 0, 1); return k * k * (3 - 2 * k)


def slow_only(tau):
    tau = np.asarray(tau, float); s = np.ones_like(tau)
    for a, b, m in TL['slow']:
        r = TL['ramp']; w = smooth((tau - (a - r)) / r) * (1 - smooth((tau - b) / r)); s = np.minimum(s, 1 - (1 - m) * w)
    return s


def speed(tau):
    tau = np.asarray(tau, float); s = np.ones_like(tau)
    for m in TL['impacts']:
        if m.get('nospark'): continue
        hs = .006 + .004 * m['size']; s = np.where((tau >= m['tau']) & (tau < m['tau'] + hs), .15, s)
    for a, b, m in TL['slow']:
        r = TL['ramp']; w = smooth((tau - (a - r)) / r) * (1 - smooth((tau - b) / r)); s = np.minimum(s, 1 - (1 - m) * w)
    return s


n = int(np.ceil((TL['dur'] + 2) / DT))
_mid = (np.arange(n + 1) + .5) * DT
TAB = np.concatenate([[0], np.cumsum(DT / speed(_mid))])[:n + 1]
TAUS = np.arange(n + 1) * DT
real_of = lambda tau: float(np.interp(tau, TAUS, TAB))
tau_of = lambda t: np.interp(t, TAB, TAUS)
DUR_REAL = real_of(TL['dur'])
if __name__ == '__main__':
    print(f"real duration {DUR_REAL:.3f} s")
    for m in TL['impacts']: print(m['tau'], '->', round(real_of(m['tau']), 3))
