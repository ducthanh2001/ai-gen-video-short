# Ideas: sparks, the prediction test, the overlap check

The first ideas for a topic are the ones everyone has. This step pushes past them on purpose, then checks the result
against what anyone would expect and against the user's own films. It runs in Lemo's **Brief** step, before the
treatment. Adapted from cinecode (`deal.py`, `dice.py`, `writing.md` §1; MIT).

**When**: the topic is open (a subject, a feeling, "a video about X"). **Skip** when the user brings a finished
story, a script or a beat list, or says "just make it like this". Then go straight to `writing.md` §0 step 5.

## 1. Deal three sparks

```text
python PLUS/scripts/spark.py deal --project <project folder>
```

Each spark is a hand: **a seed from outside** (a real thing drawn by chance: a museum object from the Cleveland
Museum of Art's open access, a species among iNaturalist's most observed, a JPL image from NASA, an invention from
Wikipedia's timeline, a UNESCO heritage site or a living craft or custom), **a place, a form and a medium**, plus two
of: engine, tone, era, colour. Every seed comes from a different pool. A pool that does not answer within a few
seconds is replaced from `data/seeds.json` (offline), so a deal never fails.

- The same project on the same day gets the same hand. A new hand needs `redeal --reason "<why none serves>"`.
- Cards the user's last films were dealt are left out (`~/.lemo-plus/sparks-seen.json`).
- **A spark is a springboard, never an order.** The medium card is vocabulary only: the Lemo style the user picked
  is the medium. Read the medium card as a texture or a device inside that style.

**Cross each spark with the topic.** The seed is the strongest card: what does the topic look like through that
object, species, site or invention? "The price of ice" × "a Japanese tea bowl" × "a ferry's car deck" × "a
countdown" gives a different film from the one anyone would make first.

## 2. Diverge

Write 10 angles (one line each) for the topic, starting from the three sparks, varying point of view (whose story?),
scale (tiny / vast), time (one second / a hundred years), genre (comedy, fable, documentary, thriller) and voice
(none, an unexpected narrator). Angle vocabulary, as springboards:

- through the eyes of the smallest thing in the scene · an object tells it · told from the ending back
- one moment stretched across the whole film · a whole lifetime in seconds · a scale flip
- the same events in another genre · the obstacle or rival narrates · the place remembers what happened here
- a misreading the ending corrects · an everyday ritual told as an epic · the opposite of what the topic suggests
- only the moment just before the event · only the aftermath · a message the picture contradicts
- a rule of this world that breaks exactly once

Drop the first 3 angles you wrote: they are the obvious ones.

## 3. The prediction test (a fresh helper)

You cannot judge your own surprise. At the very start, spawn a fresh helper agent (Claude Code: the Agent tool;
a light model is enough) with **only the user's first message, quoted**, and this brief:

```text
Read only the request below. Write the five films anyone would expect from it, one line each:
subject, key images, form. Save them to <project>/research/predict.md. Nothing else.
REQUEST: "<the user's first message, verbatim>"
```

Write your 10 angles while it runs. A kept angle that shares its subject, key image or form with a predicted line is
replaced by the next one on your list.

## 4. The overlap check (a fresh helper)

You cannot judge your own repeats either. Write the best five angles into `<project>/research/candidates.md`
(numbered; each with logline, key images, worlds or places, form, and the seed it grew from), then:

```text
python PLUS/scripts/spark.py past --out <project>/research/past-films.md
```

Spawn a fresh helper with this brief:

```text
Read <project>/research/candidates.md, <project>/research/predict.md and <project>/research/past-films.md.
For each candidate write one line into <project>/research/overlap.md:
CLEAR; or SHARES <element> WITH <prediction number or film title> when one element repeats (an ending, a form,
a key image or a world) while the idea is new; or OVERLAP WITH <…> when the idea itself repeats (premise and key
images, whatever the details). What the request itself names (a brand, a product, a person, a place) is the user's
and never an overlap on its own.
```

The three strongest that are not OVERLAP survive; a SHARES one has its shared element changed; an OVERLAP is dropped
and never argued with, unless the user asked for that film again (a sequel, a part 2, the same subject on purpose).
With fewer than three left, write new candidates and check once more.

**The first time** on this machine, teach the memory the films already made, once:

```text
python PLUS/scripts/spark.py past --scan "C:/Users/PC/kenh-youtube"
```

(any folder that holds film projects; it reads each subfolder's `TREATMENT.md`, `FACTS.md`, `BUILD.md`, `STATE.md`,
`SCRIPT.md` or `README.md` for a title and a logline).

## 5. Offer and record

In Lemo's one round of questions, the 2–3 surviving angles are **one question** (the recommended one first, with a
one-line reason: what it does that the predictions did not). The user may type their own. Record the pick:

```text
python PLUS/scripts/spark.py pick s2 --project <folder> --reason "<the topic crossed with this hand's seed and place>"
```

Then the treatment: the three kept angles are `TREATMENT.md`'s three candidate structures (Lemo §4.1), the picked one
is "the one you chose and why".

## 6. After delivery

```text
python PLUS/scripts/spark.py remember <project> --title "<title>" --idea "<logline>" --medium "<style slug>"
```

So the next film's overlap check knows this one.
