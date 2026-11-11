#!/usr/bin/env python3
"""Deal 3 font pairings for a film from the curated library, weighted by the user's taste log (Python 3 stdlib).

  python type_deal.py deal --project <folder> --purpose cinematic|ad --look <lemo style slug or family> \
         --mood "<the film's tone>" --title "<the title as it stands on screen>" [--sub "<a subtitle line>"] \
         [--cta "<call to action>"] [--lang en|vi] [--mixed] [--allow-local]
  python type_deal.py pick <pairing id|own> --project <folder> --reason "<why this pairing fits this film>" [--families "..."]
  python type_deal.py redeal --project <folder> --reason "<the user's reason>"
  python type_deal.py taste <pairing or font id> --verdict like|reject --reason "<the user's words>" [--project <folder>]
  python type_deal.py show --project <folder>
  python type_deal.py list [--look <slug|family>]

`deal` writes <project>/type/specimens.json and <project>/type/index.html (specimen cards Lemo's renderer can shoot:
node "$LIB/core/render/still.mjs" "<project>/type" 0 --q i=0 --out <project>/review; i=1 and i=2 for the others).

Filters: purpose, the look families of the style (data/type-library.json look_map; the Lemo-only styles mapped below),
fonts loadable from the pinned Fontsource CDN (local-file faces only with --allow-local), mixed pairings only with
--mixed. --mood words score against the pairings' tags. Weights from the taste log (newest first, decay 0.85 per
event): liked pairing x(1+0.5d), shared family x(1+0.25d), shared tag x(1+0.12d); rejected pairing x(1-0.6d), family
x(1-0.35d), tag x(1-0.15d); passed tag x(1-0.03d); clamped 0.05..4, so nothing becomes impossible.
Taste log: ~/.lemo-plus/taste.json (shared by every film) + <project>/plus-history.json.

The library was verified for Latin, Latin Extended and Turkish. Vietnamese (--lang vi) is NOT verified: the specimen
card prints a Vietnamese test line; check every role draws it before choosing.

Adapted from cinecode's type_deal.py and type-library.json by Sarp Yildiz (MIT).
"""
import argparse
import datetime
import hashlib
import json
import os
import random
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PLUS = os.path.dirname(HERE)
LIBRARY = os.path.join(PLUS, "data", "type-library.json")
SPECIMEN = os.path.join(PLUS, "assets", "specimen.html")
HOME = os.environ.get("LEMO_PLUS_HOME") or os.path.join(os.path.expanduser("~"), ".lemo-plus")
TASTE = os.path.join(HOME, "taste.json")

# Lemo-Opuscar styles the cinecode library does not map (its look_map covers the other 51)
EXTRA_LOOKS = {
    "newsreel": ["period-classic"], "kino-montage": ["period-classic", "kinetic-bold"],
    "printed-long-take": ["period-classic", "storybook-handmade"], "city-symphony": ["realist-cinematic", "period-classic"],
    "caption-news": ["editorial-minimal", "kinetic-bold"], "news-package": ["editorial-minimal", "tech-ui"],
    "visual-investigation": ["tech-ui", "realist-cinematic"], "countdown": ["kinetic-bold", "tech-ui"],
    "telestrator": ["kinetic-bold"], "chalkboard": ["storybook-handmade"], "circuit-board": ["tech-ui"],
    "transit-map": ["editorial-minimal"], "isometric-picture-book": ["storybook-handmade", "editorial-minimal"],
    "memphis-diorama": ["kinetic-bold", "storybook-handmade"], "desktop-flythrough": ["tech-ui", "editorial-minimal"],
}
VI_TEST = "Giá của ánh sáng: Đèn dầu, nến và điện. Ửng hồng, lặng lẽ, đường phố."
EN_TEST = "The Price of Light: 1,000 hours for £0.06"


def read_json(path, default):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return default


def write_json(path, data):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)


def families_for(look, lib):
    if not look:
        return []
    if look in lib["look_families"]:
        return [look]
    return lib["look_map"].get(look) or EXTRA_LOOKS.get(look) or []


def history_path(project):
    return os.path.join(project, "plus-history.json")


def load_events(project):
    events = [e for e in read_json(TASTE, []) if isinstance(e, dict)]
    if project:
        events += [e for e in read_json(history_path(project), {"log": []}).get("log", []) if e.get("bank") == "type"]
    return sorted(events, key=lambda e: e.get("at", ""), reverse=True)


def log_event(project, event):
    event["bank"] = "type"
    event["at"] = datetime.datetime.now().isoformat(timespec="seconds")
    taste = read_json(TASTE, [])
    taste.append(event)
    write_json(TASTE, taste[-500:])
    if project:
        h = read_json(history_path(project), {"open": {}, "log": []})
        h.setdefault("log", []).append(event)
        if event.get("event") in ("pick", "redeal"):
            h.setdefault("open", {}).pop("type", None)
        write_json(history_path(project), h)


def pairing_families(p, fonts):
    return {fonts[p[r]]["family"] for r in ("display", "text", "mono", "accent") if p.get(r) in fonts}


def weight(p, events, fonts):
    w = 1.0
    fam, tags = pairing_families(p, fonts), set(p.get("tags", []))
    for n, e in enumerate(events):
        d = 0.85 ** n
        ids = set(e.get("ids") or [e.get("id")])
        efam = set(e.get("families") or [])
        etags = set(e.get("tags") or [])
        verdict = e.get("verdict") or {"pick": "like", "redeal": "reject", "pass": "pass"}.get(e.get("event"))
        if verdict == "like":
            w *= (1 + 0.5 * d) if p["id"] in ids else 1
            w *= (1 + 0.25 * d) if fam & efam else 1
            w *= (1 + 0.12 * d) if tags & etags else 1
        elif verdict == "reject":
            w *= (1 - 0.6 * d) if p["id"] in ids else 1
            w *= (1 - 0.35 * d) if fam & efam else 1
            w *= (1 - 0.15 * d) if tags & etags else 1
        elif verdict == "pass":
            w *= (1 - 0.03 * d) if tags & etags else 1
    return max(0.05, min(4.0, w))


def font_url(lib, f, weight_=400, style="normal", subset="latin"):
    load = f["load"]
    if load.get("method") != "fontsource":
        return None
    var = load.get("variable")
    if var:
        pkg = var["pkg"].split("/")[-1]
        return lib["cdn"]["variable"].format(pkg=pkg, version=var["version"], subset=subset, file=var["file"], style=style)
    w = min(load.get("weights") or [400], key=lambda x: abs(x - weight_))
    return lib["cdn"]["static"].format(pkg=load["pkg"], version=load["version"], subset=subset, weight=w, style=style)


def role_spec(lib, fonts, p, role):
    fid = p.get(role)
    if not fid or fid not in fonts:
        return None
    f = fonts[fid]
    setup = (p.get("setup") or {}).get(role, {})
    wght = setup.get("wght", 400)
    subsets = ["latin", "latin-ext"]
    return {"id": fid, "family": f["family"], "category": f.get("category"), "wght": wght,
            "axes": setup.get("axes") or {}, "metrics": f.get("metrics") or {},
            "urls": [u for u in (font_url(lib, f, wght, "normal", s) for s in subsets) if u],
            "licence": (f.get("licence") or {}).get("id"), "licence_url": (f.get("licence") or {}).get("url"),
            "source": f.get("source"), "note": f.get("note", "")}


def deal(a):
    lib = read_json(LIBRARY, None)
    if not lib:
        sys.exit(f"cannot read {LIBRARY}")
    fonts = {f["id"]: f for f in lib["fonts"]}
    project = os.path.abspath(a.project)
    fams = families_for(a.look, lib)
    if a.look and not fams:
        print(f"! unknown look '{a.look}': dealing across all looks. Families: {', '.join(lib['look_families'])}")
    pool = []
    for p in lib["pairings"]:
        if a.purpose and a.purpose not in p.get("purposes", []):
            continue
        if bool(a.mixed) != (p.get("card") == "mixed" or bool(p.get("accent"))):
            continue
        if p.get("local_files") and not a.allow_local:
            continue
        if fams and not (set(p.get("looks", [])) & set(fams)):
            continue
        pool.append(p)
    if len(pool) < 3 and fams:
        print("! fewer than 3 pairings for this look: widening to every look for this purpose")
        pool = [p for p in lib["pairings"] if (not a.purpose or a.purpose in p.get("purposes", []))
                and bool(a.mixed) == (p.get("card") == "mixed" or bool(p.get("accent")))
                and (a.allow_local or not p.get("local_files"))]
    events = load_events(project)
    h = read_json(history_path(project), {"open": {}, "log": []})
    redeals = sum(1 for e in h.get("log", []) if e.get("bank") == "type" and e.get("event") == "redeal")
    seen = {i for e in h.get("log", []) if e.get("bank") == "type" and e.get("event") == "redeal" for i in e.get("ids", [])}
    mood = {w.strip(" ,.").lower() for w in (a.mood or "").split() if len(w) > 2}
    seed = f"{datetime.date.today().isoformat()}|{os.path.basename(project)}|type|{redeals}"
    rng = random.Random(int(hashlib.sha256(seed.encode()).hexdigest(), 16))
    scored = []
    for p in pool:
        w = weight(p, events, fonts) * (0.3 if p["id"] in seen else 1)
        w *= 1 + 0.6 * len(mood & set(p.get("tags", [])))
        scored.append([p, w])
    hand = []
    while scored and len(hand) < 3:
        tot = sum(w for _, w in scored)
        r, acc = rng.random() * tot, 0
        for i, (p, w) in enumerate(scored):
            acc += w
            if acc >= r:
                hand.append(p)
                scored.pop(i)
                break
    specs = []
    for p in hand:
        specs.append({"id": p["id"], "why": p.get("why", ""), "tags": p.get("tags", []),
                      "roles": {r: role_spec(lib, fonts, p, r) for r in ("display", "text", "mono", "accent")
                                if p.get(r)}})
    out = {"title": a.title or "Title", "sub": a.sub or "", "cta": a.cta or "", "purpose": a.purpose or "cinematic",
           "lang": a.lang, "test": VI_TEST if a.lang == "vi" else EN_TEST, "look": a.look or "", "families": fams,
           "pairings": specs}
    tdir = os.path.join(project, "type")
    write_json(os.path.join(tdir, "specimens.json"), out)
    shutil.copyfile(SPECIMEN, os.path.join(tdir, "index.html"))
    h.setdefault("open", {})["type"] = {"ids": [p["id"] for p in hand], "at": datetime.datetime.now().isoformat(timespec="seconds")}
    write_json(history_path(project), h)
    for i, s in enumerate(specs):
        names = " + ".join(f"{r}: {v['family']}" for r, v in s["roles"].items() if v)
        print(f"{i}  {s['id']}  ({names})\n   {s['why']}")
    lean = summarize_taste(events, fonts)
    if lean:
        print("\ntaste log leans " + lean)
    print(f"\nwrote {tdir}/specimens.json and index.html. Cards (in Lemo's renderer, from $LIB):\n"
          f'  node core/render/still.mjs "{tdir}" 0 --q i=0 --size 1920x1080 --out "{os.path.join(project, "review")}" --prefix type0_\n'
          "  (i=1, i=2 for the others; add &bg=%23f1e9d8&ink=%23181410&accent=%23b0412e to use the style's colours)")
    if a.lang == "vi":
        print("! Vietnamese is not verified in this library: check the test line on every card before choosing.")
    return 0


def summarize_taste(events, fonts):
    likes, rejects = {}, {}
    for n, e in enumerate(events[:30]):
        d = 0.85 ** n
        verdict = e.get("verdict") or {"pick": "like", "redeal": "reject"}.get(e.get("event"))
        for fam in e.get("families") or []:
            if verdict == "like":
                likes[fam] = likes.get(fam, 0) + d
            elif verdict == "reject":
                rejects[fam] = rejects.get(fam, 0) + d
    top = lambda m: ", ".join(k for k, _ in sorted(m.items(), key=lambda x: -x[1])[:3])
    parts = []
    if likes:
        parts.append("toward " + top(likes))
    if rejects:
        parts.append("away from " + top(rejects))
    return "; ".join(parts)


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["deal", "pick", "redeal", "taste", "show", "list"])
    ap.add_argument("arg", nargs="?")
    ap.add_argument("--project", default=".")
    ap.add_argument("--purpose", choices=["cinematic", "ad"])
    ap.add_argument("--look")
    ap.add_argument("--mood", default="")
    ap.add_argument("--title", default="")
    ap.add_argument("--sub", default="")
    ap.add_argument("--cta", default="")
    ap.add_argument("--lang", default="en", choices=["en", "vi"])
    ap.add_argument("--mixed", action="store_true")
    ap.add_argument("--allow-local", action="store_true")
    ap.add_argument("--reason", default="")
    ap.add_argument("--verdict", choices=["like", "reject"])
    ap.add_argument("--families", default="")
    a = ap.parse_args(argv)
    lib = read_json(LIBRARY, {"fonts": [], "pairings": []})
    fonts = {f["id"]: f for f in lib["fonts"]}
    pairings = {p["id"]: p for p in lib["pairings"]}
    project = os.path.abspath(a.project)

    if a.cmd == "deal":
        return deal(a)
    if a.cmd == "list":
        fams = families_for(a.look, lib)
        for p in lib["pairings"]:
            if not fams or set(p.get("looks", [])) & set(fams):
                print(f"{p['id']:32} {' + '.join(fonts[p[r]]['family'] for r in ('display', 'text', 'mono') if p.get(r) in fonts)}")
        return 0
    if a.cmd == "show":
        print(json.dumps(read_json(history_path(project), {}).get("log", []), ensure_ascii=False, indent=1))
        return 0
    if not a.reason:
        print(f"{a.cmd} needs --reason (the user's words, or a reason built on this film)", file=sys.stderr)
        return 2
    open_ids = read_json(history_path(project), {}).get("open", {}).get("type", {}).get("ids", [])
    if a.cmd == "pick":
        if not a.arg:
            print("pick needs a pairing id or 'own'", file=sys.stderr)
            return 2
        if a.arg == "own":
            fams = [x.strip() for x in a.families.split(",") if x.strip()]
            log_event(project, {"event": "pick", "id": "own", "families": fams, "reason": a.reason})
        else:
            p = pairings.get(a.arg)
            if not p:
                print(f"unknown pairing {a.arg}", file=sys.stderr)
                return 2
            log_event(project, {"event": "pick", "id": p["id"], "families": sorted(pairing_families(p, fonts)),
                                "tags": p.get("tags", []), "reason": a.reason})
            for other in open_ids:
                if other != p["id"] and other in pairings:
                    log_event(project, {"event": "pass", "id": other, "tags": pairings[other].get("tags", []),
                                        "reason": "dealt with " + p["id"]})
        print(f"picked {a.arg}. Copy its roles from type/specimens.json into the film's type setup, and add one "
              "licence row per family to the credits.")
        return 0
    if a.cmd == "redeal":
        evs = [pairings[i] for i in open_ids if i in pairings]
        log_event(project, {"event": "redeal", "ids": open_ids,
                            "families": sorted({f for p in evs for f in pairing_families(p, fonts)}),
                            "tags": sorted({t for p in evs for t in p.get("tags", [])}), "reason": a.reason})
        print("logged; run deal again for a new hand")
        return 0
    if a.cmd == "taste":
        if not a.arg or not a.verdict:
            print("taste needs an id and --verdict like|reject", file=sys.stderr)
            return 2
        if a.arg in pairings:
            p = pairings[a.arg]
            ev = {"event": "taste", "verdict": a.verdict, "id": p["id"], "families": sorted(pairing_families(p, fonts)),
                  "tags": p.get("tags", []), "reason": a.reason}
        elif a.arg in fonts:
            f = fonts[a.arg]
            ev = {"event": "taste", "verdict": a.verdict, "id": f["id"], "families": [f["family"]],
                  "tags": f.get("tags", []), "reason": a.reason}
        else:
            print(f"unknown pairing or font {a.arg}", file=sys.stderr)
            return 2
        log_event(project if a.project != "." or os.path.exists(history_path(project)) else None, ev)
        print(f"taste logged: {a.verdict} {a.arg}")
        return 0
    return 1


if __name__ == "__main__":
    for _s in (sys.stdout, sys.stderr):
        getattr(_s, "reconfigure", lambda **k: None)(encoding="utf-8", errors="replace")
    sys.exit(main(sys.argv[1:]))
