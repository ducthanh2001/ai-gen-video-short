#!/usr/bin/env python3
"""The film's own words, checked before TTS and before the render: narration lines, subtitles, titles, labels, cards.

  python words_check.py <project>                 # lines*.json, vo*.json, cues*.json, captions*.json, content.json,
                                                  # subtitles .srt and index.html string literals, anywhere in the project
  python words_check.py <file> [<file> ...]       # named files only (.json, .srt, .html, .js, .txt, .md)
  python words_check.py <project> --lang vi       # also the Vietnamese patterns (default: en; --lang all for both)
  python words_check.py <project> --line          # one summary line

Hard rule (exit 1): no em dash anywhere in the film's words, and no en dash or double hyphen used as a dash; an en dash
between two numbers (1–3) is a range and stays. Replace a dash with a comma, a full stop, a colon or a line break.

Tells (warnings, exit 0): phrases and shapes that make words read as generated: stock clichés, "not X but Y", staged
run-ups ("imagine", "let's"), sayings that sound deep, inflated words ("tapestry", "vibrant"), sales language,
rhetorical questions, three-word abstract lists, stacked exclamation marks. A tell is a question, not a ban: keep it
with a reason in TREATMENT.md when it is the film's own voice (a quote, a name, a character's line).

.md and .txt files are read line by line, so pass them only when they hold the film's words (a script, not notes).

Adapted from cinecode's words_check.py by Sarp Yildiz (MIT); pattern families after blader/humanizer (MIT) and
Wikipedia's "Signs of AI writing".
"""
import json
import os
import re
import sys
from pathlib import Path

TELLS_EN = [
    (r"\bin a world where\b", "cliché: 'in a world where'"),
    (r"\bjourney\b", "cliché: journey as a metaphor"),
    (r"\blittle did (they|he|she|we|anyone) know\b", "cliché: 'little did they know'"),
    (r"\bwhat if\b", "cliché: 'what if'"),
    (r"\bmore than just an?\b", "cliché: 'more than just a'"),
    (r"\bevery moment counts\b", "cliché: 'every moment counts'"),
    (r"\bagainst all odds\b", "cliché: 'against all odds'"),
    (r"\bnothing (would|will) ever be the same\b", "cliché: 'nothing would be the same'"),
    (r"\bthe rest is history\b", "cliché: 'the rest is history'"),
    (r"\ba story of (hope|love|courage)\b", "cliché: 'a story of hope'"),
    (r"\bwhere \w+ meets \w+\b", "cliché: 'where X meets Y'"),
    (r"\bmagic happens\b", "cliché: 'magic happens'"),
    (r"\bfollow your (dreams|heart)\b", "cliché: 'follow your dreams'"),
    (r"\b(embark|unlock|dive into|delve)", "cliché: 'embark / unlock / dive into'"),
    (r"\b(tapestry|testament)\b", "inflated: 'a tapestry / testament of'"),
    (r"\bone thing is certain\b", "cliché: 'one thing is certain'"),
    (r"\btimeless\b|\bbeyond time\b", "cliché: 'timeless'"),
    (r"\bunforgettable\b", "cliché: 'unforgettable'"),
    (r"\band then everything changed\b|\beverything changed\b", "cliché: 'then everything changed'"),
    (r"\bnot (just|only|merely|simply)\b|\bit'?s not\b.{1,40}\bit'?s\b|\bisn'?t\b.{1,30}\bit'?s\b", "shape: 'not X but Y'"),
    (r"\bimagine\b", "run-up: 'imagine'"),
    (r"\blet'?s\b|\bhere'?s the thing\b|\bbuckle up\b", "run-up: staged opener"),
    (r"\b(the real question|at its core|what really matters|the truth is)\b", "saying: sounds deep, says little"),
    (r"\bhave you ever\b|\bever wondered\b", "run-up: question to the viewer"),
    (r"\b(vibrant|pivotal|crucial|seamless(ly)?|elevate[sd]?|unleash(es|ed)?|realm|beacon|symphony|whisper(s|ed|ing)?"
     r"|dance[sd]?|dancing|breathtaking|stunning|nestled|game[- ]changer|revolutionary|groundbreaking|meticulous(ly)?"
     r"|intricate|bustling|captivating|enigmatic|labyrinth(ine)?)\b", "inflated word"),
    (r"\b(don'?t miss|discover now|act now|level up|next level|like and subscribe)\b", "sales language"),
]

TELLS_VI = [
    (r"\bhành trình\b", "sáo ngữ: 'hành trình' (ẩn dụ)"),
    (r"trong một thế giới mà", "sáo ngữ: 'trong một thế giới mà'"),
    (r"không chỉ (là )?.{1,40}mà còn", "khuôn: 'không chỉ… mà còn'"),
    (r"không phải .{1,40}mà là", "khuôn: 'không phải X mà là Y'"),
    (r"câu chuyện (về )?(hy vọng|hi vọng|tình yêu|lòng dũng cảm)", "sáo ngữ: 'câu chuyện về hy vọng'"),
    (r"nơi .{1,20} gặp gỡ", "sáo ngữ: 'nơi X gặp gỡ Y'"),
    (r"mọi khoảnh khắc đều", "sáo ngữ: 'mọi khoảnh khắc đều quý giá'"),
    (r"bất chấp mọi (khó khăn|trở ngại)", "sáo ngữ: 'bất chấp mọi khó khăn'"),
    (r"mọi thứ (đã )?thay đổi", "sáo ngữ: 'mọi thứ thay đổi'"),
    (r"phần còn lại là lịch sử", "sáo ngữ: 'phần còn lại là lịch sử'"),
    (r"chạm đến trái tim|đánh thức|vượt thời gian|khó quên", "sáo ngữ"),
    (r"\bhãy (cùng|tưởng tượng)|\bthử tưởng tượng|\bbạn có bao giờ|\bbạn đã bao giờ", "mở màn dàn dựng / hỏi người xem"),
    (r"bí mật đằng sau|sự thật là|điều thực sự quan trọng|cốt lõi", "câu nghe sâu nhưng rỗng"),
    (r"tuyệt vời|ngoạn mục|kỳ diệu|diệu kỳ|choáng ngợp|mê hoặc|thì thầm|nhảy múa|bản giao hưởng|đỉnh cao|có một không hai",
     "từ thổi phồng"),
    (r"đừng bỏ lỡ|khám phá ngay|hãy đăng ký|nhấn like", "ngôn ngữ bán hàng"),
]

DASH = re.compile(r"—|(?<!\d)\s*–\s*(?!\d)|(?<=\d)\s+–|–\s+(?=\d)|\s--\s")
TRIAD = re.compile(r"^\s*(\w+),\s*(\w+),?\s+(and|và)\s+(\w+)[.!]?\s*$", re.I)
JSON_KEYS = {"text", "say", "vo", "line", "lines", "sub", "subtitle", "label", "title", "caption", "cta", "words",
             "w", "card", "headline", "quote"}
AUTO_JSON = re.compile(r"^(lines|vo|cues|captions|subtitles|content|script|cards)[\w-]*\.json$", re.I)
SKIP_DIRS = {"node_modules", ".git", ".venv", "renders", "frames", "review", "research", "logs", "__pycache__",
             ".cache", "refs", "fonts", "assets", "type"}


def js_strings(src):
    """String literals of a JS source, comments skipped (no full parser)."""
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if src.startswith("//", i) and (i == 0 or src[i - 1] != ":"):
            i = src.find("\n", i)
            i = n if i < 0 else i
        elif src.startswith("/*", i):
            i = src.find("*/", i + 2)
            i = n if i < 0 else i + 2
        elif c in "'\"`":
            j, buf = i + 1, []
            while j < n and src[j] != c and not (c != "`" and src[j] == "\n"):
                if src[j] == "\\" and j + 1 < n:
                    buf.append(src[j + 1])
                    j += 2
                    continue
                buf.append(src[j])
                j += 1
            out.append((src.count("\n", 0, i) + 1, "".join(buf)))
            i = j + 1
        else:
            i += 1
    return out


def looks_like_words(s):
    """A string a viewer reads: two or more words with letters, not code, CSS, a path or a colour."""
    s = s.strip()
    if len(s) < 4 or len(s.split()) < 2 or not re.search(r"[^\W\d_]{2}", s):
        return False
    if re.search(r"^(https?:|data:|\.{0,2}/)|\.(wav|mp3|mp4|png|jpe?g|svg|json|woff2?|ttf|otf|js|mjs|css)\b|\d+px|"
                 r"rgba?\(|hsla?\(|#[0-9a-f]{3,8}\b|[{};<>=]|\$\{|=>|\bfunction\b|\bvar\(|\bcalc\(", s, re.I):
        return False
    if re.fullmatch(r"[\w\-]+(\s+[\w\-]+)*", s) and s == s.lower() and "-" in s:   # css-ish keyword lists
        return False
    return True


def html_words(path):
    src = Path(path).read_text(encoding="utf-8", errors="replace")
    words = []
    for line, s in js_strings(src):
        if looks_like_words(s):
            words.append((f"{os.path.basename(path)}:{line}", s))
    for m in re.finditer(r">([^<>{}]{4,})<", src):          # visible text between tags
        s = " ".join(m.group(1).split())
        if looks_like_words(s):
            words.append((f"{os.path.basename(path)}:{src.count(chr(10), 0, m.start()) + 1}", s))
    return words


def json_words(path):
    found = []

    def walk(v, where, key=None):
        if isinstance(v, dict):
            for k, x in v.items():
                walk(x, f"{where}.{k}" if where else k, k)
        elif isinstance(v, list):
            if len(v) == 2 and all(isinstance(x, str) for x in v) and len(v[0].split()) == 1 and len(v[1].split()) > 1:
                found.append((f"{os.path.basename(path)}:{v[0]}", v[1]))      # [id, text] rows
                return
            for i, x in enumerate(v):
                walk(x, f"{where}[{i}]", key)
        elif isinstance(v, str) and key in JSON_KEYS:
            found.append((f"{os.path.basename(path)}:{where}", v))
    try:
        walk(json.loads(Path(path).read_text(encoding="utf-8")), "")
    except (OSError, ValueError) as e:
        print(f"! could not read {path}: {e}", file=sys.stderr)
    return found


def srt_words(path):
    out = []
    for i, block in enumerate(re.split(r"\n\s*\n", Path(path).read_text(encoding="utf-8", errors="replace"))):
        lines = [l for l in block.strip().splitlines() if l and not re.match(r"^\d+$|^\d\d:\d\d", l)]
        if lines:
            out.append((f"{os.path.basename(path)}#{i + 1}", " ".join(lines)))
    return out


def text_words(path):
    out = []
    for n, line in enumerate(Path(path).read_text(encoding="utf-8", errors="replace").splitlines(), 1):
        s = line.strip().strip("|").strip()
        if s and not s.startswith(("#", "```", "<!--")) and re.search(r"[^\W\d_]", s):
            out.append((f"{os.path.basename(path)}:{n}", s))
    return out


def gather(files):
    items = []
    for f in files:
        ext = os.path.splitext(f)[1].lower()
        if ext in (".html", ".htm", ".js", ".mjs"):
            items += html_words(f)
        elif ext == ".json":
            items += json_words(f)
        elif ext == ".srt":
            items += srt_words(f)
        else:
            items += text_words(f)
    return items


def project_files(root):
    found = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for f in filenames:
            if AUTO_JSON.match(f) or f.lower().endswith(".srt") or f.lower() == "index.html":
                found.append(os.path.join(dirpath, f))
    return sorted(found)


def check(items, tells):
    dashes, found = [], []
    exclaims = sum(s.count("!") for _, s in items)
    for where, s in items:
        if DASH.search(s):
            dashes.append((where, s))
        low = s.lower()
        for pat, label in tells:
            if re.search(pat, low):
                found.append((where, s, label))
        if s.strip().endswith("?") and len(s.split()) > 1:
            found.append((where, s, "rhetorical question? (fine if a character asks it)"))
        if TRIAD.match(s):
            found.append((where, s, "three-word list"))
        if "!!" in s:
            found.append((where, s, "stacked exclamation marks"))
    if exclaims > 2:
        found.append(("all words", f"{exclaims} exclamation marks", "too many exclamation marks (at most 2 in a film)"))
    return dashes, found


def main(argv):
    if "-h" in argv or "--help" in argv:
        print(__doc__)
        return 0
    lang = "en"
    if "--lang" in argv:
        i = argv.index("--lang")
        lang = argv[i + 1] if i + 1 < len(argv) else "en"
        del argv[i:i + 2]
    line_only = "--line" in argv
    args = [a for a in argv if not a.startswith("--")] or ["."]
    files = []
    for a in args:
        files += project_files(a) if os.path.isdir(a) else [a]
    tells = (TELLS_EN if lang in ("en", "all") else []) + (TELLS_VI if lang in ("vi", "all") else [])
    items = gather(files)
    dashes, found = check(items, tells)
    short = lambda s: (s[:48] + "...") if len(s) > 50 else s
    if line_only:
        parts = []
        if dashes:
            parts.append(f"DASH in {len(dashes)} line(s): " + ", ".join(f"'{short(s)}'" for _, s in dashes[:3]))
        if found:
            parts.append(f"{len(found)} tell(s): " + ", ".join(f"'{short(s)}' ({l.split(':')[0]})" for _, s, l in found[:3]))
        print(("words: " + "; ".join(parts)) if parts else "words: clean")
        return 1 if dashes else 0
    rel = [os.path.relpath(f) if not os.path.isabs(args[0]) else f for f in files]
    print(f"{len(items)} strings in {len(files)} file(s): {', '.join(os.path.basename(f) for f in rel) or 'none'}")
    for where, s in dashes:
        print(f"DASH  {where}  '{s}'  -> a comma, a full stop, a colon or a line break")
    for where, s, label in found:
        print(f"TELL  {where}  '{short(s)}'  ({label})")
    print(f"{len(dashes)} dash(es), {len(found)} tell(s)" + ("" if dashes or found else ": the words read as written"))
    return 1 if dashes else 0


if __name__ == "__main__":
    for _s in (sys.stdout, sys.stderr):
        getattr(_s, "reconfigure", lambda **k: None)(encoding="utf-8", errors="replace")
    sys.exit(main(sys.argv[1:]))
