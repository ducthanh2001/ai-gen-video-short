# Look board: directions from real cinema, measured

Lemo's `DIRECTOR.md` §2 asks for a benchmark before writing; §5 asks for style frames checked against `STYLE.md`.
The look board sits between them: **2–3 directions inside the chosen style**, each shown as stills from real films
or works whose light and colour could carry it, the picked one measured into numbers the style frames are checked
against. Adapted from cinecode's direction board (MIT).

**What it decides and what it never touches.** The style's `STYLE.md` fixes the medium, the palette rules, the line,
the texture. The board decides what is left open: the key (low / mid / high), the contrast, warmth, how saturated,
where the light comes from, the vignette, and which of the style's allowed colours lead. If `STYLE.md` fixes the
palette exactly, the board only sets light and key.

**When.** Optional. Offer it in Lemo's one round of questions ("A look board first? recommended for films over 2
minutes"), or build it when the user asked to review steps. Otherwise pick a direction yourself from the benchmark and
write the reason in `TREATMENT.md`.

## 1. Find the directions

1. Names to start from, dealt so they differ from film to film:
   `python PLUS/scripts/spark.py looks --project <folder> --n 6` (cinematographers, directors, photographers,
   painters, studios, movements, crafts). Springboards, not orders.
2. For each of 2–3 directions, find 3–4 stills that carry it: film stills (FilmGrab, shot decks), paintings in open
   museum collections, period photographs. Search the web; download **small thumbnails only** (≤ 640 px wide) into
   `<project>/research/dir-a/`, `dir-b/`, `dir-c/`, and write each source link into `research/look-sources.md`.
3. Directions must differ in at least two of: key, warmth, saturation, light direction. Three versions of the same
   look are one direction.

## 2. Build the board

```text
python PLUS/scripts/palette.py board \
  --row "A|<label, e.g. 'candlelit ledger'>|<project>/research/dir-a" \
  --row "B|<label>|<project>/research/dir-b" \
  --row "C|<label>|<project>/research/dir-c" \
  --out <project>/review/directions.jpg
```

One row per direction: up to four stills, its measured palette, a one-line read (key, contrast, colour, warmth). Show
the image to the user big (in Claude Code send the file; otherwise give its path), and ask one question: A / B / C
(the recommended first, with a reason from this film's story) or their own.

## 3. Measure the pick

```text
python PLUS/scripts/palette.py measure <project>/research/dir-b --out <project>/research/direction.json
```

Write into `TREATMENT.md` (look notes): the read, the palette hex values mapped onto the style's colour roles
(background, ink, accent), the key light side and height, and what you take / do not take from the stills (as in
Lemo's benchmark: composition, light logic, colour logic; never a shot, a character or a design).

## 4. Check the style frames against it

After rendering Lemo's style frames (§5):

```text
python PLUS/scripts/palette.py compare <project>/review/style-1.png --against <project>/research/direction.json
```

It prints what is off (brighter, softer, warmer...) with the direction to move. The eye decides; the numbers say where
to look. Re-run until it is within tolerance or you have a reason to differ (write it down).

## Rules

- Stills are copyrighted: thumbnails for choosing and measuring, never fetched in full, never in a frame, never
  shipped, never committed. Delete `research/dir-*` after the film is delivered if the user wants the folder clean.
- The board is mood. A frame never copies a still's composition shot for shot.
