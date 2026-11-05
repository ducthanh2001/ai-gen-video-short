"""Edit plan for Ep 01: shot list → timeline (shots.json) driven by the narration durations.
Cue syntax inside a query: {L:id+s} start of line id (+s), {E:id} end of line, {W:id:phrase} when the phrase is spoken (char ratio).
Shot fields: id, lines, q, pre, post, t0 (scene time at the first frame), kb [cx,cy,zoom]→[cx,cy,zoom], xf (crossfade in, s), sec (music section), sfx [(name, cue)]
usage: python plan.py   (from the episode folder or anywhere)"""
import os, re, json
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NARR = dict(json.load(open(os.path.join(EP, 'narration.json'), encoding='utf-8')))
DUR = json.load(open(os.path.join(EP, 'voice', 'durations.json')))
FPS, GAP = 24, .45
E = lambda s: s.replace(' ', '%20').replace('&', '%26').replace(',', '%2C').replace('#', '%23').replace('’', '%E2%80%99')

TAGT = 'tagpos=110,96,1'
SHOTS = [
  # —— HOOK ——
  dict(id='s01', sec='hook', lines=['h1'], pre=1.0, q='style=today&on=.55&tags=today@{W:h1:two-tenths}&tagpos=96,760,1&now=0', sfx=[('click', .55)]),
  dict(id='s02', sec='hook', lines=['h2'], pre=.15, t0=10, q='style=engraving&tags=1800@{W:h2:five and}&tagpos=1290,390,1&now=0', kb=[[900, 540, 1.0], [900, 540, 1.05]], sfx=[('hit', 0)]),
  dict(id='s03', sec='hook', lines=['h3'], pre=.15, post=.3, q=f'style=woodcut&plate=babylon&tags=babylon@{{W:h3:more than}}&{TAGT}&now=0', kb=[[1000, 600, 1.0], [1000, 600, 1.05]], sfx=[('hit', 0)]),
  dict(id='s04', sec='hook', lines=['h4'], pre=.3, post=.4, q='style=house&grow=1&g0=.3&g1=2.6&g2=3.9&g3=5.2', sfx=[('hit', 0)]),
  dict(id='s05', sec='hook', lines=['h5'], pre=.2, post=1.4, xf=.5, q='style=woodcut&plate=sleep&stamp=999', kb=[[960, 540, 1.0], [960, 560, 1.36]]),
  # —— THE UNIT ——
  dict(id='s06', sec='unit', lines=['u1'], pre=.5, xf=.4, q='style=card&kind=hours&k1={W:u1:So on this}'),
  dict(id='s07', sec='unit', lines=['u2', 'u3'], pre=.3, post=1.4, q='style=card&kind=unit&k1={L:u3}'),
  # —— CHAPTER I · FIRE AND OIL (woodcut) ——
  dict(id='s08', sec='ch1', lines=['a1', 'a2', 'a3'], pre=2.6, xf=.5, q=f'style=woodcut&plate=fire&carve=2.4&chap={E("I|Fire and oil")}&cin=.5&tags=fire@{{W:a2:cost around}},stone@{{W:a3:brought it}}&{TAGT}', kb=[[960, 600, 1.0], [960, 620, 1.07]], sfx=[('carve', 0), ('fire', 2.0)]),
  dict(id='s09', sec='ch1', lines=['a4', 'a5'], pre=.6, xf=.5, q=f'style=woodcut&plate=babylon&carve=1.6&tags=babylon@{{W:a4:still about}}&{TAGT}', kb=[[1000, 600, 1.0], [980, 640, 1.08]], sfx=[('carve', 0)]),
  dict(id='s10', sec='ch1', lines=['a6'], pre=.3, post=.4, xf=.5, q='style=woodcut&plate=sleep&stamp=999&hl=1@0', kb=[[520, 560, 1.25], [520, 580, 1.32]]),
  dict(id='s11', sec='ch1', lines=['a7'], pre=.3, post=1.8, xf=.5, q='style=card&kind=years'),
  # —— CHAPTER II · CANDLES, WHALES & ROCK OIL (engraving) ——
  dict(id='s12', sec='ch2', lines=['b1', 'b2'], pre=2.2, xf=.6, q=f'style=engraving&chap={E("II|Candles, whales & rock oil")}&cin=.3&cf={E("Bodoni Moda")}', kb=[[900, 540, 1.0], [400, 580, 1.45]], sfx=[('engrave', 0)]),
  dict(id='s13', sec='ch2', lines=['b3', 'b4'], pre=.3, xf=.5, t0=10, q='style=engraving&tags=1800@{W:b3:cost about}&tagpos=1440,520,.68&nowpos=1450,120,380', kb=[[960, 540, 1.0], [960, 540, 1.03]]),
  dict(id='s14', sec='ch2', lines=['b5'], pre=.3, xf=.5, t0=10, q='style=engraving', kb=[[740, 560, 1.5], [740, 540, 1.62]]),
  dict(id='s15', sec='ch2', lines=['b6', 'b7'], pre=.4, xf=.5, q='style=engraving&plate=silliman&es=1.3&k1={W:b7:rock oil}', sfx=[('engrave', 0)]),
  dict(id='s16', sec='ch2', lines=['b8'], pre=.3, xf=.5, t0=10, q='style=engraving&tags=1870@{W:b8:fallen to}&tagpos=1290,600,.85&now=0', kb=[[1150, 560, 1.4], [1180, 560, 1.45]]),
  dict(id='s17', sec='ch2', lines=['b9'], pre=.4, post=2.0, xf=.5, q='style=engraving&plate=quote', sfx=[('engrave', 0)]),
  # —— CHAPTER III · THE ELECTRIC AGE (1920s silent film) ——
  dict(id='s18', sec='ch3', lines=[], pre=2.6, xf=.6, q=f'style=silent&card=1&bar=1879&l1={E("Chapter III")}&l2={E("The electric age.")}', sfx=[('projector', 0)]),
  dict(id='s19', sec='ch3', lines=['e1'], pre=.2, q=f'style=silent&card=1&bar=1879&l1={E("Swan and Edison, 1879")}&l2={E("A working carbon-filament bulb, at first priced to match gaslight.")}'),
  dict(id='s20', sec='ch3', lines=['e2'], pre=.3, q='style=silent&bar=1820&walk=0'),
  dict(id='s21', sec='ch3', lines=['e3'], pre=.3, q=f'style=silent&card=1&bar=1890s&l1={E("Gas fights back")}&l2={E("The Welsbach mantle made gas lamps about seven times more efficient.")}'),
  dict(id='s22', sec='ch3', lines=['e4', 'e5'], pre=.3, q='style=silent&bar=1900&tags=1900@{W:e4:still cost},1920@{W:e5:By nineteen twenty},1950@{W:e5:By nineteen fifty}&tagpos=270,800,.8&nowpos=1270,50,380'),
  dict(id='s23', sec='ch3', lines=['e6'], pre=.3, q=f'style=silent&card=1&bar=1900&l1={E("New York, 1900")}&l2={E("About one in three tenement fires was caused by lamps or candles.")}'),
  dict(id='s24', sec='ch3', lines=['e7'], pre=.4, post=2.0, xf=.8, q='style=today&on=.6', sfx=[('click', .6)]),
  # —— CHAPTER IV · THE ECONOMISTS' MISTAKE (house charts) ——
  dict(id='s25', sec='twist', lines=['t1', 't2'], pre=.8, post=1.8, xf=.4, q=f'style=card&kind=things&k1={{L:t2}}&k2={{W:t2:Candles}}&k3={{E:t2}}', sfx=[('hit', .8)]),
  dict(id='s26', sec='twist', lines=['t3'], pre=.3, q='style=card&kind=fuel&k1={W:t3:The price of the fuel}'),
  dict(id='s27', sec='twist', lines=['t4'], pre=.3, post=.6, q='style=card&kind=gap&k1={W:t4:nine hundred}', sfx=[('hit', '{W:t4:nine hundred}')]),
  dict(id='s28', sec='twist', lines=['t5'], pre=.3, q='style=card&kind=wages&k1={W:t5:Official numbers}&k2={W:t5:Nordhaus estimated}&k3={W:t5:Maybe far}'),
  dict(id='s29', sec='twist', lines=['t6'], pre=.3, post=2.2, xf=.6, q=f'style=today&say={E("We may be much richer than the statistics say.|The things that got cheapest are the things we no longer think about.")}&sin={{L:t6+.2}}&sin2={{W:t6:because}}'),
  # —— MYTH CHECK (woodcut) ——
  dict(id='s30', sec='myth', lines=['m1'], pre=2.4, xf=.5, q='style=woodcut&plate=sleep&carve=2.2&stamp=999', sfx=[('carve', 0), ('hit', 2.4)]),
  dict(id='s31', sec='myth', lines=['m2'], pre=.3, xf=.4, q='style=card&kind=ekirch&k1={W:m2:in English}'),
  dict(id='s32', sec='myth', lines=['m3'], pre=.3, xf=.4, q='style=woodcut&plate=sleep&stamp=999&hl=1@0,2@{W:m3:woke},3@{W:m3:then slept}'),
  dict(id='s33', sec='myth', lines=['m4'], pre=.3, xf=.5, t0=10, q='style=engraving', kb=[[960, 540, 1.0], [960, 560, 1.07]]),
  dict(id='s34', sec='myth', lines=['m5'], pre=.3, xf=.4, q='style=card&kind=caveat&k1={W:m5:One sleep}&k2={W:m5:And the evidence}'),
  dict(id='s35', sec='myth', lines=['m6'], pre=.3, post=2.0, xf=.4, q='style=woodcut&plate=sleep&stamp={W:m6:partly true}', sfx=[('stamp', '{W:m6:partly true}')]),
  # —— BACK TO TODAY + NEXT ——
  dict(id='s36', sec='end', lines=['z1'], pre=.4, xf=.8, q='style=today&on={W:z1:switch}&tags=today@{W:z1:two-tenths}&tagpos=96,760,1&now=0', sfx=[('click', '{W:z1:switch}')]),
  dict(id='s37', sec='end', lines=['z2'], pre=.3, xf=.5, q=f'style=house&grow=1&g0=.1&g1=.9&g2=1.4&g3=1.8&say={E("≈ 100,000× cheaper than in 1800|≈ 700,000× cheaper than in Babylon")}&sin={{W:z2:roughly}}&sin2={{W:z2:and more than}}'),
  dict(id='s38', sec='end', lines=['z3'], pre=.4, post=4.0, xf=.6, q='style=engraving&plate=next', sfx=[('engrave', 0)]),
]

def plan():
    t, out, voice, sfx = 0.0, [], [], []
    for s in SHOTS:
        xf = s.get('xf', 0) if out else 0
        start = t - xf
        loc, starts = s.get('pre', .3), {}
        for i, lid in enumerate(s['lines']):
            if i: loc += GAP
            starts[lid] = loc; voice.append((lid, round(start + loc, 3))); loc += DUR[lid]
        dur = loc + s.get('post', .35)
        t0 = s.get('t0', 0)
        def cue(m):
            k, rest = m.group(1), m.group(2)
            if k == 'L':
                lid, _, off = rest.partition('+'); v = starts[lid] + float(off or 0)
            elif k == 'E': v = starts[rest] + DUR[rest]
            else:
                lid, ph = rest.split(':', 1); txt = NARR[lid]; i = txt.lower().find(ph.lower()); assert i >= 0, (lid, ph)
                v = starts[lid] + DUR[lid] * i / len(txt)
            return f'{v + t0:.2f}'
        q = re.sub(r'\{([LEW]):([^}]+)\}', cue, s['q']) + f'&T={dur:.2f}'
        for name, at in s.get('sfx', []):
            at = float(re.sub(r'\{([LEW]):([^}]+)\}', cue, at)) - t0 if isinstance(at, str) else at
            sfx.append((name, round(start + at, 3)))
        out.append(dict(id=s['id'], sec=s['sec'], q=q, start=round(start, 3), dur=round(dur, 3), t0=t0, kb=s.get('kb'), xf=xf, frames=int(round(dur * FPS))))
        t = start + dur
    secs = {}
    for o in out: a = secs.setdefault(o['sec'], [o['start'], o['start'] + o['dur']]); a[1] = o['start'] + o['dur']
    json.dump(dict(fps=FPS, total=round(t, 3), shots=out, voice=voice, sfx=sfx, sections=secs), open(os.path.join(EP, 'shots.json'), 'w'), indent=1)
    print(f'{len(out)} shots, {t:.1f} s ({t / 60:.2f} min), {sum(o["frames"] for o in out)} frames')
    for k, (a, b) in secs.items(): print(f'  {k:6s} {a:6.1f} → {b:6.1f}')
plan()
