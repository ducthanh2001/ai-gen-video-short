# Typography

How the film's type is chosen, set, moved and checked so it reads like a designer's work. Lemo's `DIRECTOR.md` §4.8
says "the type is part of the style": so this page splits in two. Adapted from cinecode's `typography.md` (MIT).

| The film's style… | Use |
|---|---|
| **fixes the type** in `STYLE.md` (named faces, sizes, casing) | only §2–§7 and the QC (§10): legibility, scale, motion, layout. Never swap the font. |
| **leaves type open**, or is a house style, a "My style" (`~/lemo-my-styles/`) or a style made from a blank page | everything: references, the deal of 3 pairings, specimen cards, the taste log (§8–§9) |

## 1. Pairing

- **One voice, two families at most, plus a mono** for data, prices, dates, timestamps. A superfamily (IBM Plex serif
  + sans + mono) counts as one voice.
- **Contrast of structure, not of mood**: serif with sans, condensed with normal width, high-contrast display with a
  low-contrast text face. Two grotesques that differ a little look like a mistake.
- **Shared proportions**: similar x-height and width rhythm (library `metrics.x`), cap heights within about 10% when
  they share a line.
- **Roles are fixed for the whole film**: `display` titles and big words; `text` subtitles, labels, lower thirds;
  `mono` numbers and data. A role never changes face mid-film (unless a named signature, §7).

## 2. Scale per format and phone minimums

A modular scale from the deliverable's short side (1080 px for 1080×1920, 1080×1080 and 1920×1080):

| Step | Use | Font size (share of the short side) |
|---|---|---|
| T1 | title card, one-word impact | 0.11–0.16 (9:16, 1:1) · 0.09–0.13 (16:9) |
| T2 | headline, price, big number, CTA | 0.065–0.09 |
| T3 | subtitle, caption, lower-third name | 0.04–0.055 |
| T4 | label, role line, source line | 0.034–0.04 |

Neighbouring steps differ by one ratio of 1.25–1.6 per film. **Phone minimums (hard rule)**, as cap height in
delivered pixels:

| Format | Text cap height | Small static lines (sources, legal) |
|---|---|---|
| 9:16 and 1:1 (1080 wide) | ≥ 28 px (2.6% of the short side) | ≥ 22 px |
| 16:9 (1920×1080) | ≥ 40 px (3.7%), because inline on a phone it is ~0.56× as tall | ≥ 32 px |

Font size = cap height / the font's cap ratio (about 0.65–0.72). Burned-in subtitles in a 16:9 YouTube film are
therefore at least ~56–60 px font size.

## 3. Tracking, leading, line length

- **Tracking by size**: small text opens (+0.015 em under 2.5% of the short side); display tightens (−0.01 to −0.02
  em above 6%); **all caps always open** (+0.08 small, +0.05 mid, +0.03 large).
- **Leading**: text 1.25–1.4; display 0.95–1.05; all-caps display 1.0–1.1 plus diacritic headroom (§6).
- **Line length**: ≤ 32 characters per line in 9:16, ≤ 42 in 16:9; cards ≤ 6 words; balanced lines for titles.

## 4. Variable axes and OpenType features

- Use `opsz` where it exists (Fraunces, Newsreader, Bodoni Moda…): high for titles, low for small lines.
- **Animate axes on the music, not a timer**: a weight breath peaks on the beat; a width change lands on a hit. One
  animated axis at a time; it settles before the line must be read.
- Canvas 2D facts (headless Chrome): the weight axis works through the `font` string (`650`); every other axis and
  every OpenType feature only through `FontFace` descriptors (`variationSettings`, `featureSettings`), so non-weight
  axes animate through stops (one face per stop).
- `tnum` for counters, prices and dates (numbers must not jiggle while they change); `case` with all caps; `ss0x`
  stylistic sets as a named look decision.

## 5. Typographic motion

- **Units**: characters for titles of ≤ 2 words, words for lines; stagger spread 0.35–0.6 of the entrance, in reading
  order unless the idea says otherwise.
- **Masks and baseline shifts**: units rise 0.6–1.0 of the line height inside a mask whose top includes the diacritic
  headroom. Ease out on entrances (`EASE.out`, `EASE.back` for a light overshoot), ease in on exits; nothing linear.
- **Readability first**: a line holds still at least 0.4 s + 0.06 s × words after it lands (and Lemo's §7 reading
  rule); one moving text layer at a time; motion stops before the eye needs to read.
- **Kinetic devices** (one or two per film, each with a job): letters dropping in with one recoloured as the accent;
  a headline ending in a coloured full stop; numbers that roll digit by digit with a tick under the roll; labels that
  wipe in and lay out in a row; corner micro-type framing a shot. One accent colour for the chosen thing.
- **Never invent real content** to fill a screen (fake names, data, documents): draw it as blocks or blurred lines.
- **Layout check on a full-size still**: two stats never share one horizontal band at the same height; keep content
  out of the bottom 12% where subtitles live.

## 6. Grid, widows, diacritics

- **Grid**: one margin (≥ 7% of the short side), one alignment per card (left or centred, never both). Left for
  information, centred for ceremony (title cards, end cards).
- **Widows**: no one-word last line, no line ending on a one-letter word, a number and its unit kept together with a
  no-break space (`1,000 hours`, `£0.06`).
- **Diacritic headroom**: boxes, masks and line spacing allow for marks above the cap height and below the baseline.
  Test every text box with the film's own language: English `ÉÀÇ éàç`; Vietnamese `Ửng Ẫ Ỡ Ợ Ặ ỹ ự ậ` (stacked marks
  need more room than Latin Extended).
- **Coverage**: the bundled library is verified for Latin, Latin Extended and Turkish, **not Vietnamese**. For a
  Vietnamese film, check every role draws the test line on the specimen card before choosing (Be Vietnam Pro,
  Inter, Roboto, Noto and many Google Fonts have a `vietnamese` subset on Fontsource).

## 7. Rule tiers

**Hard rules (never broken)**: legibility (phone minimums, contrast ≥ 4.5:1 for text, 3:1 for large display, hold
time); no clipped diacritics or missing glyphs; licences (one credits row per family; brand and Fontshare files never
shared or committed).

**Breakable style rules** (defaults a film may break on purpose): two families at most; script faces for ≤ 3 words;
effects (outline, shadow, texture) on one layer only; one alignment per card; tracking by size; one animated axis at
a time. A break is allowed only when it is **named in `TREATMENT.md`** ("rule break: <rule>: <how>, because <a reason
from this story>"), **applied consistently** as the film's signature, and **checked** at review. An unnamed break is
a mistake.

**Mixed cards** (one dominant voice + one accent, `--mixed`): the accent is 1–3 words that carry feeling, never
information; the dominant about 2–3× the accent's x-height; tuck a script 15–30% into the bold's baseline; rotate only
the accent, at most 6°; effects on one layer; the dominant lands first, the accent 150–300 ms later on the music; 2–4
mixed cards per film at most (title, chapter, end card), never subtitles, data or quotes.

**Text colour by role**: a long film does not set every word in one white. Three or four roles in the style's palette
(body ink, an accent for the key figure, a quieter tone for dates and sources, the chapter card's colour), each kept
consistent.

## 8. References and the taste log (open-type films)

1. **References** (mood only: a link and a small thumbnail, never shipped): Fonts In Use (real uses by format and
   topic), Art of the Title (title sequences), Typewolf (a family's page, suggested pairings), the user's own
   screenshots in `<project>/refs/type/` (they outrank everything). 3–8 is enough; look at them as one contact sheet.
2. **Read them**: case, weight contrast, layout, colour, motion; what to take and what to avoid. One paragraph of
   type direction in `TREATMENT.md`.
3. **Taste log**: every pick, pass, re-deal and reaction is logged with the user's reason (`type_deal.py pick`,
   `redeal`, `taste`), in `~/.lemo-plus/taste.json`, shared by every film. The next deal leans toward what was liked
   and away from what was rejected, never making anything impossible. Quote what the log leans to when you present
   a hand.

## 9. The type step (open-type films, after the look)

```text
python PLUS/scripts/type_deal.py deal --project <folder> --purpose cinematic --look <lemo style slug> \
  --mood "<the film's tone in a few words>" --title "<the title as on screen>" --sub "<a real subtitle line>" [--lang vi]
cd "$LIB" && node core/render/still.mjs "<project>/type" 0 --q "i=0&bg=%23...&ink=%23...&accent=%23..." \
  --size 1920x1080 --out "<project>/review" --prefix type0_          # then i=1, i=2
```

Show the three cards side by side; ask one question (the three pairings + "my own"), or pick yourself in Lemo's
no-stop mode and write the reason. Log it: `type_deal.py pick <id> --project <folder> --reason "…"` (a "none of
them" is `redeal --reason`). Copy the picked roles (families, weights, axes, CDN URLs) from `type/specimens.json` into
the film's page; add one credits row per family (licence and URL are in the JSON).

## 10. Type QC (every film, fixed or open type)

On contact sheets and full-size stills of every text moment:

1. **Phone legibility**: cap heights at or above §2; every line readable within its hold time at phone size.
2. **Contrast** on the busiest frame behind each text moment, not just the palette (≥ 4.5:1 text, 3:1 big display).
3. **Line length and widows**: ≤ 32 / 42 characters, no one-word last lines, units kept with numbers.
4. **Diacritics**: marks intact in masks, boxes and line spacing (check strips of frames, not one still).
5. **Consistent roles**: no face changes across the film except a named signature; mixed cards within §7.
6. **Motion**: entrances ease out, one moving text layer at a time, lines hold still to be read.
7. **Words**: `words_check.py` clean (no dashes; tells fixed or kept with a reason).
8. **Licences**: one credits row per family.
