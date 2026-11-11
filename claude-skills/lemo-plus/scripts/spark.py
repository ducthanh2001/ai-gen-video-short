#!/usr/bin/env python3
"""Sparks for a film's idea, look-board names, and the memory of this user's films (Python 3 standard library).

  python spark.py deal --project <folder> [--n 3]          # 3 sparks: a seed from outside + place, form, medium, 2 extras
  python spark.py redeal --project <folder> --reason "<why none of the three serves this topic>"
  python spark.py pick s2 --project <folder> --reason "<the topic crossed with this hand's seed and place>"
  python spark.py pick own --project <folder> --reason "<the user's own angle>"
  python spark.py looks --project <folder> [--n 6]         # names for the look board: cinematographers, painters, crafts
  python spark.py show --project <folder>
  python spark.py past --scan <folder>                     # remember films made before, under a folder (once)
  python spark.py past [--out <project>/research/past-films.md]   # print or write the memory for the overlap helper
  python spark.py remember <project> --title "<title>" --idea "<logline>" --medium "<style>"

A seed is a real thing drawn by chance, so an idea starts where the model's habits would not go: a museum object
(Cleveland Museum of Art open access, CC0), a living species (iNaturalist), something in space (NASA/JPL image
library), an invention (Wikipedia's timeline of historic inventions), a heritage site or a craft or custom (UNESCO
lists, data/seeds.json). Each spark's seed comes from another pool. A pool that does not answer within a few seconds
is replaced from the offline lists: a deal never waits long or fails. LEMO_PLUS_DICE=offline uses the lists only.

The hand's random seed is the date + the project folder name + the number of re-deals, so the same project on the
same day gets the same hand; a new hand needs `redeal` with a written reason. Cards the user's recent films were
dealt are left out (~/.lemo-plus/sparks-seen.json). Picks and re-deals are logged in <project>/plus-history.json.

Adapted from cinecode's deal.py and dice.py by Sarp Yildiz (MIT).
"""
import argparse
import datetime
import hashlib
import html
import json
import os
import random
import re
import sys
import threading
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")
SPARKS = os.path.join(DATA, "sparks.json")
SEEDS = os.path.join(DATA, "seeds.json")
HOME = os.environ.get("LEMO_PLUS_HOME") or os.path.join(os.path.expanduser("~"), ".lemo-plus")
UA = "lemo-plus-spark/1.0 (one request per seed for a film idea; low volume)"
WAIT, DEADLINE = 8, 12
POOLS = {"museum": "a museum object", "nature": "a living species", "sky": "something in space",
         "invention": "an invention", "place": "a heritage site", "custom": "a craft or custom"}
OFFLINE = ("place", "custom")
SPARK_AXES = ("place", "form", "medium")
SPARK_EXTRA = ("engine", "tone", "era", "colour")
FILM_FILES = ("TREATMENT.md", "FACTS.md", "BUILD.md", "STATE.md", "SCRIPT.md", "ROADMAP.md", "README.md")
SKIP_DIRS = {"node_modules", "renders", "frames", "audio", "assets", "review", "research", "logs", "tools", "engine",
             "refs", "notes", "type", "fonts", "__pycache__", ".git", ".venv", "out", "build", "shorts"}


# ---------------------------------------------------------------- small helpers

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


def get(url, wait=WAIT):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=wait) as r:
        return json.load(r)


def clean(text, n=260):
    text = " ".join(re.sub(r"<[^>]+>", " ", html.unescape(str(text or ""))).split())
    if len(text) <= n:
        return text
    cut = text[:n]
    end = cut.rfind(". ")
    return cut[:end + 1] if end > n // 3 else cut.rsplit(" ", 1)[0] + "..."


def summary(title, wait=4):
    """The opening of the English Wikipedia article, or "" (disambiguation page, list, or no answer)."""
    try:
        d = get("https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title.replace(" ", "_"), safe=""),
                wait)
    except Exception:
        return ""
    text = clean(d.get("extract"))
    return "" if d.get("type") == "disambiguation" or re.match(r"This (?:is a|article is a) list", text) else text


# ---------------------------------------------------------------- seed pools

def museum(rng, avoid):
    d = get("https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&cc0=1&limit=1&skip=%d&fields=title,type,"
            "creation_date,culture,technique,did_you_know,wall_description,url" % rng.randrange(40000))
    a = d["data"][0]
    what = ", ".join(x for x in (a.get("type"), "; ".join(a.get("culture") or []), a.get("creation_date"),
                                 a.get("technique")) if x)
    more = a.get("did_you_know") or a.get("wall_description") or ""
    return {"name": clean(a["title"], 120), "fact": clean(what + (". " + more if more else "")), "link": a.get("url", "")}


def nature(rng, avoid):
    t = get("https://api.inaturalist.org/v1/taxa?rank=species&is_active=true&order_by=observations_count&per_page=1"
            "&page=%d" % rng.randint(1, 10000))["results"][0]
    common, latin = t.get("preferred_common_name") or "", t["name"]
    wiki = (t.get("wikipedia_url") or "").rsplit("/wiki/", 1)
    fact = summary(urllib.parse.unquote(wiki[1])) if len(wiki) == 2 else ""
    return {"name": f"{common} ({latin})" if common else latin,
            "fact": fact or f"a species of {t.get('iconic_taxon_name') or 'living thing'}",
            "link": t.get("wikipedia_url") or f"https://www.inaturalist.org/taxa/{t['id']}"}


def sky(rng, avoid):
    year = rng.randint(1996, datetime.date.today().year - 1)
    url = f"https://images-api.nasa.gov/search?media_type=image&center=JPL&year_start={year}&year_end={year}"
    c = get(url)["collection"]
    pages = min(100, -(-int((c.get("metadata") or {}).get("total_hits") or 0) // 100))
    if pages > 1:
        c = get(url + f"&page={rng.randint(1, pages)}")["collection"]
    items = [i["data"][0] for i in c.get("items") or [] if i.get("data")]
    i = rng.choice([i for i in items if len(clean(i.get("description"))) >= 60 and i.get("title") not in avoid] or items)
    return {"name": clean(i["title"], 120), "fact": clean(i.get("description")),
            "link": "https://images.nasa.gov/details/" + urllib.parse.quote(i["nasa_id"])}


def invention(rng, avoid):
    req = urllib.request.Request("https://en.wikipedia.org/w/index.php?title=Timeline_of_historic_inventions&action=raw",
                                 headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=WAIT) as r:
        wiki = re.split(r"\n==\s*(?:See also|References|Notes|Further reading|External links)\s*==",
                        r.read().decode("utf-8", "replace"))[0]
    rows = []
    for line in wiki.splitlines():
        links = re.findall(r"\[\[([^\]|#]+)", line) if line.startswith("*") else []
        links = [x for x in links if not re.match(r"(?:Lists? of|Timeline of|Outline of|Category:|File:|Image:|"
                                                   r"\d+(?: BC)?(?: in [\w ]+)?$)", x, re.I)]
        head = line.lstrip("* ").split(":", 1)[0] if ":" in line else ""
        if links and len(head) < 60 and re.search(r"\d|century|millennium", head, re.I):
            text = re.sub(r"<ref[^>]*/>|<ref[^>]*>.*?</ref>|\{\{[^{}]*\}\}|'''?", "", line.lstrip("* "))
            rows.append((clean(re.sub(r"\[\[(?:[^\]|]*\|)?([^\]]*)\]\]", r"\1", text), 170), links[0]))
    name, title = rng.choice([r for r in rows if r[0] not in avoid] or rows)
    return {"name": name, "fact": summary(title),
            "link": "https://en.wikipedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_"))}


def listed(kind, network=True):
    def draw(rng, avoid):
        rows = read_json(SEEDS, {})[kind]
        name, desc, where, title = rng.choice([r for r in rows if r[0] not in avoid] or rows)
        fact = (summary(title) if network else "") or ", ".join(x for x in (desc, where) if x)
        return {"name": name, "fact": fact, "link": "https://en.wikipedia.org/wiki/" + urllib.parse.quote(title)}
    return draw


FETCH = {"museum": museum, "nature": nature, "sky": sky, "invention": invention,
         "place": listed("place"), "custom": listed("custom")}


def draw_seeds(seed, n=3, avoid=()):
    """n seeds, each from another pool while pools are left; pools are asked together, a slow one gives way to a list."""
    rng = random.Random(int(hashlib.sha256(f"{seed}|dice".encode()).hexdigest(), 16))
    order = []
    while len(order) < n:
        order += rng.sample(list(POOLS), len(POOLS))
    order, avoid = order[:n], set(avoid)
    rngs = [random.Random(rng.random()) for _ in order]
    found = {}

    def one(i):
        try:
            s = FETCH[order[i]](rngs[i], avoid)
            if s.get("name"):
                found[i] = dict(s, pool=order[i])
        except Exception:
            pass
    if os.environ.get("LEMO_PLUS_DICE") != "offline":
        workers = [threading.Thread(target=one, args=(i,), daemon=True) for i in range(n)]
        for w in workers:
            w.start()
        end = time.monotonic() + DEADLINE
        for w in workers:
            w.join(max(0.0, end - time.monotonic()))
    got = [found.get(i) for i in range(n)]
    for i, s in enumerate(got):
        if s is None:
            used = {g["pool"] for g in got if g}
            kind = next((k for k in OFFLINE if k not in used), OFFLINE[i % 2])
            got[i] = dict(listed(kind, network=False)(rngs[i], avoid | {g["name"] for g in got if g}), pool=kind)
    return got


# ---------------------------------------------------------------- seen cards and project history

def seen_path():
    return os.path.join(HOME, "sparks-seen.json")


def load_seen():
    return set(read_json(seen_path(), []))


def save_seen(seen, cards):
    try:
        write_json(seen_path(), (list(seen - set(cards)) + list(cards))[-300:])
    except OSError:
        pass


def history_path(project):
    return os.path.join(project, "plus-history.json")


def load_history(project):
    return read_json(history_path(project), {"open": {}, "log": []})


def hand_seed(project, bank, h):
    redeals = sum(1 for e in h["log"] if e.get("bank") == bank and e.get("event") == "redeal")
    name = os.path.basename(os.path.abspath(project))
    return f"{datetime.date.today().isoformat()}|{name}|{bank}|{redeals}"


def spark_hand(seed, n):
    data = read_json(SPARKS, {})
    seen = load_seen()
    rng = random.Random(int(hashlib.sha256(f"{seed}|spark".encode()).hexdigest(), 16))
    used, hands = set(seen), {}
    seeds = draw_seeds(seed, n, avoid=used)
    for i in range(1, n + 1):
        s = seeds[i - 1]
        cards = {"seed": s["name"]}
        for axis in SPARK_AXES + tuple(rng.sample(SPARK_EXTRA, 2)):
            pool = [x for x in data[axis] if x not in used] or data[axis]
            card = rng.choice(pool)
            used.add(card)
            cards[axis] = card
        hands[f"s{i}"] = {"cards": cards, "seed": s}
    save_seen(seen, [c for h in hands.values() for c in h["cards"].values()])
    return hands


def look_hand(seed, n):
    looks = read_json(SPARKS, {})["look"]
    seen = load_seen()
    rng = random.Random(int(hashlib.sha256(f"{seed}|look".encode()).hexdigest(), 16))
    pool = [x for x in looks if x not in seen]
    pool = pool if len(pool) >= n else looks
    hand = {f"l{i}": x for i, x in enumerate(rng.sample(pool, min(n, len(pool))), 1)}
    save_seen(seen, list(hand.values()))
    return hand


def print_sparks(hands):
    for k, h in hands.items():
        c = h["cards"]
        print(f"{k}  " + " · ".join(f"{a}: {v}" for a, v in c.items()))
        s = h["seed"]
        print(f"    seed ({POOLS.get(s.get('pool'), s.get('pool'))}): {s.get('fact') or '-'}")
        if s.get("link"):
            print(f"    {s['link']}")
    print("\nCross each hand with the topic (the seed is the strongest card; the medium card is a texture or device "
          "inside the Lemo style, never a new style). Then: pick sN|own --reason, or redeal --reason.")


# ---------------------------------------------------------------- film memory

def films_path():
    return os.path.join(HOME, "films.json")


def first(pattern, text, flags=re.M):
    m = re.search(pattern, text, flags)
    return clean(m.group(1), 200) if m else ""


def narration_opening(folder, n=2):
    """The first narration lines (lines.json, narration.json, vo*.json): the hook says what a film is about."""
    for name in ("lines.json", "narration.json", "vo-lines.json", os.path.join("audio", "lines.json"),
                 os.path.join("voice", "lines.json")):
        data = read_json(os.path.join(folder, name), None)
        if isinstance(data, list):
            out = []
            for row in data:
                text = row[1] if isinstance(row, list) and len(row) > 1 else row.get("text") if isinstance(row, dict) else ""
                if isinstance(text, str) and text.strip():
                    out.append(text.strip())
                if len(out) >= n:
                    break
            if out:
                return clean(" ".join(out), 220)
    return ""


def film_entry(folder):
    texts = {}
    for name in ("TREATMENT.md", "SCRIPT.md", "YOUTUBE.md", "README.md", "STATE.md", "ROADMAP.md", "BUILD.md", "FACTS.md"):
        p = os.path.join(folder, name)
        if os.path.isfile(p):
            try:
                with open(p, encoding="utf-8", errors="replace") as fh:
                    texts[name] = fh.read(20000)
            except OSError:
                pass
    if not texts:
        return None
    blob = "\n".join(texts.values())
    heads = [first(r"^#\s+(.+)$", t) for t in texts.values()]
    quoted = next((m.group(1) for h in heads if h for m in [re.search(r"[\"“]([^\"”]{3,80})[\"”]", h)] if m), "")
    title = quoted or next((h for h in heads if h), "") or os.path.basename(folder)
    idea = (first(r"(?i)^\**log\s*line\**\s*[:\-]?\s*\**\s*(.+)$", blob)
            or first(r"(?i)^\**(?:idea|premise|concept)\**\s*[:\-]\s*(.+)$", blob)
            or narration_opening(folder)
            or first(r"^(?!#|\||-|\*|>|`)(\w.{40,})$", texts.get("TREATMENT.md", "") + texts.get("README.md", "")))
    medium = first(r"(?i)^\**(?:style|styles|look|medium)\**\s*[:\-]\s*(.+)$", blob)
    return {"title": title, "idea": idea, "medium": medium, "folder": os.path.abspath(folder).replace("\\", "/"),
            "date": datetime.date.fromtimestamp(os.path.getmtime(folder)).isoformat()}


def scan(root):
    found = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        if any(f in filenames for f in FILM_FILES[:5]) or ("README.md" in filenames and "index.html" in filenames):
            e = film_entry(dirpath)
            if e:
                found.append(e)
            dirnames[:] = []
    return found


def remember(entries):
    films = read_json(films_path(), [])
    by = {f["folder"]: f for f in films}
    for e in entries:
        by[e["folder"]] = {**by.get(e["folder"], {}), **{k: v for k, v in e.items() if v}}
    write_json(films_path(), sorted(by.values(), key=lambda f: f.get("date", "")))
    return len(entries)


def past_text():
    films = read_json(films_path(), [])
    if not films:
        return "# This user's past films\n\n(none remembered yet: run spark.py past --scan <folder>)\n"
    rows = ["# This user's past films", "", "| # | Title | Idea | Medium | Date |", "|---|---|---|---|---|"]
    for i, f in enumerate(reversed(films), 1):
        rows.append(f"| {i} | {f.get('title', '')} | {f.get('idea', '')} | {f.get('medium', '')} | {f.get('date', '')} |")
    return "\n".join(rows) + "\n"


# ---------------------------------------------------------------- commands

def main(argv):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["deal", "redeal", "pick", "looks", "show", "past", "remember"])
    ap.add_argument("arg", nargs="?")
    ap.add_argument("--project", default=".")
    ap.add_argument("--n", type=int, default=3)
    ap.add_argument("--reason", default="")
    ap.add_argument("--scan")
    ap.add_argument("--out")
    ap.add_argument("--title", default="")
    ap.add_argument("--idea", default="")
    ap.add_argument("--medium", default="")
    a = ap.parse_args(argv)
    project = os.path.abspath(a.project)
    now = datetime.datetime.now().isoformat(timespec="seconds")

    if a.cmd == "past":
        if a.scan:
            n = remember(scan(a.scan))
            print(f"remembered {n} film(s) under {a.scan} -> {films_path()}")
        text = past_text()
        if a.out:
            os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
            with open(a.out, "w", encoding="utf-8") as fh:
                fh.write(text)
            print(f"wrote {a.out}")
        elif not a.scan:
            print(text)
        return 0

    if a.cmd == "remember":
        folder = os.path.abspath(a.arg or project)
        e = film_entry(folder) or {"title": os.path.basename(folder), "idea": "", "medium": "",
                                   "folder": folder.replace("\\", "/"), "date": datetime.date.today().isoformat()}
        e.update({k: v for k, v in (("title", a.title), ("idea", a.idea), ("medium", a.medium)) if v})
        e["date"] = datetime.date.today().isoformat()
        remember([e])
        print(f"remembered: {e['title']} ({e['folder']})")
        return 0

    h = load_history(project)

    if a.cmd == "show":
        print(json.dumps(h, ensure_ascii=False, indent=1))
        return 0

    if a.cmd in ("deal", "redeal"):
        if a.cmd == "redeal":
            if not a.reason:
                print("redeal needs --reason: why none of the three serves this topic", file=sys.stderr)
                return 2
            h["log"].append({"event": "redeal", "bank": "spark", "reason": a.reason, "at": now})
            h["open"].pop("spark", None)
        if "spark" in h["open"]:
            print("(the open hand; a new one needs: redeal --reason)\n")
            print_sparks(h["open"]["spark"]["hands"])
            return 0
        hands = spark_hand(hand_seed(project, "spark", h), max(1, a.n))
        h["open"]["spark"] = {"hands": hands, "at": now}
        write_json(history_path(project), h)
        print_sparks(hands)
        return 0

    if a.cmd == "pick":
        if not a.arg or not a.reason:
            print("pick needs a hand id (s1, s2, s3 or own) and --reason built on this film's facts", file=sys.stderr)
            return 2
        hand = h["open"].get("spark", {}).get("hands", {}).get(a.arg) if a.arg != "own" else None
        if a.arg != "own" and hand is None:
            print(f"no open hand {a.arg}; deal first", file=sys.stderr)
            return 2
        h["log"].append({"event": "pick", "bank": "spark", "id": a.arg, "hand": hand, "reason": a.reason, "at": now})
        h["open"].pop("spark", None)
        write_json(history_path(project), h)
        print(f"picked {a.arg}: {a.reason}")
        return 0

    if a.cmd == "looks":
        hand = look_hand(hand_seed(project, "look", h), max(1, a.n if a.n != 3 else 6))
        h["log"].append({"event": "deal", "bank": "look", "hand": hand, "at": now})
        write_json(history_path(project), h)
        for k, v in hand.items():
            print(f"{k}  {v}")
        print("\nSpringboards for the look board: find films or works whose look carries each, inside the style.")
        return 0
    return 1


if __name__ == "__main__":
    for _s in (sys.stdout, sys.stderr):
        getattr(_s, "reconfigure", lambda **k: None)(encoding="utf-8", errors="replace")
    sys.exit(main(sys.argv[1:]))
