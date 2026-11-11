# Writing: clever, few words, every line on target

A film has room for one idea and very few words. Follow this every time a story, a treatment, narration
(`lines.json`) or on-screen text is written or revised. The angles that start it come from `ideas.md`.

Adapted from cinecode's `writing.md` (MIT).

## 0. The writer pass, in order

```text
1. Diverge (private): 10 angles for the user's topic, one line each, from the 3 sparks (ideas.md);
   vary point of view, scale, time, genre, voice.
2. Drop the first 3: they are the obvious ones. Drop any angle the prediction test predicted or the
   overlap check marked (ideas.md).
3. Keep the 3 most surprising-yet-true. They become TREATMENT.md's three candidate structures.
4. Pick 1, with a one-line reason the user can read. Run the specificity test (§12).
5. Story films: five lines (situation, desire, conflict, change, result); then a skeleton for the length
   (§14), bent to the idea. Long films: plant the promise in the first 30–60 s (§13).
6. The turn, as "Before: … / After: …" (§2). A mood piece names what the viewer is left with instead.
7. Ending first (§3).
8. Show, don't tell (§4).
9. Word budget and lines (§5); banned list and tells (§6).
10. Read aloud, time it, cut 30% (§7).
11. Cold first-time-viewer check (§8).
12. Deliver into TREATMENT.md: logline · turn · beat sheet with times · lines with word count vs budget ·
    on-screen text · scripted silences · key moments · one line on why this angle.
```

The 10 angles stay private (they cost the user attention). The user sees the 2–3 strongest as options in the
brief round, or only your pick and its reason.

## 1. Surprising-yet-true

- *Surprising*: a first-time viewer would not predict it from the topic; the prediction test did not predict it;
  the overlap check found it in none of this user's films.
- *True*: it follows from the topic and its world; nothing is bent to make it work; the viewer says "of course"
  afterwards.

## 2. One turn

When the story turns, it turns on **one clear change**. Write it before anything else:

> Before: <…> / After: <…>

| Turn | Movement |
|---|---|
| **Reversal** | the roles swap: protector and protected, hunter and hunted, big and small |
| **Reveal** | a detail grows until the whole is understood, and the whole means something else |
| **Transformation** | one place or thing across time; the last state answers the first |
| **Threshold** | the moment before an event, then the event, then what it changed |
| **Mirror** | the last image repeats the first, changed in meaning |
| **Contrast** | the words say one thing, the picture another; the gap is the meaning |

A mood piece or a portrait may have no turn; it names what the viewer is left with, and keeps something new arriving.

## 3. Ending first

Write the last image or line first: where the film lands decides what it must set up. Everything the ending needs
(an object, a rule, a referent, a count) is set up in the first third. The ending keeps its own seconds (§15).

## 4. Show, don't tell

- **Narration never describes what is on screen.** It adds what the picture cannot: subtext, contrast, the past,
  the inner voice, a count, a rule.
- **The caption test**: if a line could caption its shot, cut it or flip it into something the picture does not say.
- **Never explain the moral.** If the ending needs a sentence to be understood, fix the image.
- **Wordless is valid.** Sound and the cut tell the rest, and it travels across languages.

## 5. Words: budget and lines

| Runtime | Narration budget |
|---|---|
| 15 s | ≤ 20 words |
| 30 s | ≤ 40 words |
| 60 s | ≤ 80 words |
| 90 s | ≤ 120 words |
| up to 3 min | ≈ runtime in seconds × 4/3 |
| **over 3 min, narrator-led** (documentary, explainer, essay) | **110–140 words a minute**, holds and silences counted inside; a reference video in the niche gives its own measured pace and wins |

- **One idea per line.** Two ideas become two lines with a pause.
- **≤ 9 words per line** in short films; long narration may run longer sentences but never two ideas in one.
- **Concrete nouns and verbs.** The things and actions of this story beat the abstract words for them.
- **At most one adjective per noun**, and only one the picture does not already show.
- **On-screen text**: ≤ 6 words per card; on screen ≥ 0.6 s + 0.25 s per word (and Lemo's `readcheck.mjs` rule).
- **Pauses are part of the script**, written as numbers: 0.6 s between lines, 1.5 s after a key line, 1–3 s of
  scripted silence before the biggest moment. Put them in `TREATMENT.md`'s beat sheet and in the cue map.
- **Placement**: the first 2 seconds belong to picture and sound in short films; a line starts 0.3–0.6 s after a cut;
  the key word lands within 0.5 s of the image that answers it. **With a narrator, any film over a minute starts its
  first line within 2 s.**
- **TTS text**: spell numbers out in `text` (Lemo TECHNIQUE §4), digits in the subtitles.

## 6. Banned list and tells

Never use these or close variants. When one appears, the line is usually saying nothing: replace it with a
concrete image. `scripts/words_check.py` finds them.

**Clichés (English)**: in a world where · journey (as a metaphor) · little did they know · what if…? · more than
just a… · every moment counts · against all odds · it's not about X, it's about Y · nothing would ever be the same ·
the rest is history · a story of hope / love / courage · where X meets Y · magic happens · follow your dreams ·
embark on / unlock / dive into / delve · a testament to / a tapestry of · one thing is certain · timeless / beyond
time · unforgettable · and then everything changed.

**Sáo ngữ (Tiếng Việt)**, for Vietnamese films: hành trình (ẩn dụ) · trong một thế giới mà · không chỉ là… mà còn ·
câu chuyện về hy vọng / tình yêu · nơi … gặp gỡ … · mọi khoảnh khắc đều quý giá · bất chấp mọi khó khăn · và rồi mọi
thứ thay đổi · phần còn lại là lịch sử · đánh thức · chạm đến trái tim · vượt thời gian · khó quên · tuyệt vời ·
ngoạn mục · bí mật đằng sau · hãy cùng … khám phá.

**Tells that read as generated** (checked before every TTS run and render):

- **Never a dash** in the film's words (hard rule; `words_check.py` exits 1).
- **"Not X but Y"**: the first half denies something nobody claimed. Say the second half alone.
- **Sayings that sound deep**: "at its core", "what really matters", "the real question". Say the concrete thing.
- **Staged run-ups**: "imagine…", "let's…", "here's the thing", "have you ever…".
- **Inflated words**: vibrant, pivotal, crucial, seamless, elevate, unleash, realm, beacon, symphony, whispers,
  dances, breathtaking, stunning, nestled, game-changer, revolutionary, groundbreaking, meticulous.
- **Sales lines**: "don't miss", "discover now", "next level". A call to action names the thing, the place, the time.
- **Rhythm by rule**: three-word abstract lists ("Hope, courage and love."), more than two exclamation marks in a film.
- **Rhetorical questions to the viewer**, "imagine" openings, ending on a slogan.

A tell is a question, not a ban: a quote, a name or a character's own line keeps it, with the reason in `TREATMENT.md`.

## 7. Two passes before the user sees it

1. **Read aloud and time it** at the voice's pace (calm 2.0–2.5 words/s, energetic 2.6–3.2, storyteller 1.5–2.0;
   Kokoro at speed 0.92–0.95 is about 2.3). Lines that trip the tongue are rewritten.
2. **Cut 30%.** Remove three words in ten. Keep the cut unless meaning breaks. Write "words before → after" in
   `TREATMENT.md`.

## 8. Cold first-time-viewer check

Read the treatment and lines as someone who knows nothing about the topic, the references or your intentions. For a
real independent read, give it to a fresh helper agent with only `TREATMENT.md` and `lines.json`, and ask for the
answers below in a numbered list.

- **Referents**: who is "I", "you", "we", "they"; what is "it" and "this" each time? One answer each.
- **Causality**: every effect has a cause the viewer saw or heard. Which line relies on a reason never given?
- **Ending premise**: is everything the last line or image needs already in the film? Where?
- **Muted test**: with sound off, can the viewer say what happened in one sentence?
- **No line left hanging**: every line completes its meaning on its own.

Fix the smallest thing where a break starts: reorder or retime first, then one short new line, only then a rewrite.

## 9. Voice

Voice is a choice per film, not a house style: none · warm documentary · playful · deadpan (calm voice, absurd
picture) · intimate first person · storyteller · synthetic · chorus. Decide who speaks, from when, to whom; keep
one register. With Lemo's Kokoro, cast the narrator for this film (an unknown voice name makes `tts.py` list them);
the user's chosen voice always wins.

## 10. Beat sheet shapes (fill from the film's own story)

**Wordless, 30 s**

| # | Time | Beat | What changes |
|---|---|---|---|
| 1 | 0:00–0:03 | Hook: <what moves on frame 1> | <the question it opens> |
| 2 | 0:03–0:08 | <beat> | <what changes> |
| 3 | 0:08–0:14 | <beat> | <what changes> |
| 4 | 0:14–0:22 | <beat> | <what changes> |
| 5 | 0:22–0:30 | <the ending, held for its seconds> | <what stays> |

**Narrated, 30 s, four lines**

| # | Over | Line | Words | What it adds (never what we see) |
|---|---|---|---|---|
| VO1 | <picture> | <line> | ≤ 9 | <what the picture cannot say> |
| VO2 | … | … | ≤ 9 | … |
| VO3 | … | … | ≤ 9 | … |
| VO4 | … | … | ≤ 9 | … |
| – | <the ending, held> | – | – | the ending |

## 11. Tempo map

Each section of the beat sheet gets a tag: **fast** (2–4 s cuts), **breath** (room for a line to land), **hold**
(a long, still look). Never three of one tag in a row; the contrast is the rhythm (this feeds Lemo's §7 "vary the
pace"). Voice and picture take turns: when the voice rests the picture carries (an event, a reveal); when the
picture holds a line or a sound carries it. Both resting at once is a dead stretch unless it is a marked hold.
Without a narrator, what a narrator would say moves on screen: text, numbers, maps, labels, diagrams.

## 12. Specificity test

**Product, brand, ad or sponsor film (mandatory, before the treatment is final)**
1. List 8–12 things that belong only to this subject: the name and what it means, the place, numbers (founding
   year, size, a count), one real constraint, materials, rituals, printed objects (labels, tickets, packaging),
   sounds.
2. Write the concept in one sentence: "[a subject-only thing] becomes [a visual device]".
3. **Swap test**: put the closest competitor's name in. If the sentence still works, the idea belongs to the genre:
   build it on a thing the competitor does not have.
4. Write the list, the sentence and the swap result into `TREATMENT.md`. Name on screen what the viewer must be able
   to name (labels or lower thirds in the style's type).

**Story or documentary: world test.** The imagery and sound come from this story's own world: its materials,
objects, tools and sounds. Check every look and sound choice against that world.

## 13. Long films: the promise and the open question

From about 5 minutes, a viewer stays for an answer they want.

- **Within the first 30–60 s**, plant the question the ending answers: a striking moment from later shown first
  (a cold open), an expectation set up and promised to break, or a contradiction the film will resolve. Name what
  is at stake and for whom, in a number and an image the viewer can hold (a price as a number and a stack, a
  distance as a number and a map), early.
- **The curiosity map** (a table in `TREATMENT.md`): every question with the second it opens and the second it is
  paid. At most two big questions open at once; a reveal or reversal every 60–90 s; nothing paid before it was
  wanted.
- **Plant, do not tell.** What the viewer needs later goes in as a question or one image, not an information block.
- **Length follows the material.** A longer cut adds events, never spreads the same ones thinner. If the material
  runs out at 7 minutes, the film is 7 minutes.
- **The opening of a long film in two layers**: 0–5 s a pattern break (a striking image or line, a contradiction,
  a moment from later), 5–30 s why it matters and one hard fact, the story moving before 30 s; something new every
  10–15 s.
- **A tease for the next episode** (series) is a question, never a summary: one image and one unanswered fact.

## 14. Structure by length (a compass, not a mould)

Five lines show whether a story is there: **situation** · **desire** · **conflict** · **change** · **result**.

| Length | Skeleton | Curiosity |
|---|---|---|
| 15–60 s | one turn; for poetic or loop films *kishōtenketsu* (introduce · develop · unexpected turn · reconcile) | one question, opened in the first seconds, closed at the end |
| 30–60 s that inform (explainer, Short) | one turn at the end, reached through a **chain of questions**: each answer opens the next, a link every 15–20 s | the chain |
| 1–5 min | the story circle: comfort 0–10% · want 10–20% · unfamiliar 20–30% · trial 30–50% · finds it 50–60% · pays its price 60–75% · returns 75–90% · changed 90–100% | one big question from the first 15 s, answered in the last 20% |
| 5 min and up | two-layer opening (§13), then stretches that each answer part of the question and open a smaller one | the promise answered near the end |

**The chain of questions**: what can be lost, in a picture, in the first 3 s; the question is never asked, something
is held back (the frame cuts it off, a drawing stops half way, a number freezes); small turns on the way to the big
one; the hand-off made with the picture, the cut and the sound as much as with words.

Cinematic films end on their image, never on a call to action. YouTube pieces end at full energy, never on
"that's all".

## 15. Key moments, the thesis line, the ending

- **The hook is a question, not information.** Moving from frame 1 is the floor; a question the film owes the
  viewer is what holds them. Ingredients: a contradiction, the question itself, 2–4 flashes from later, an image
  left unanswered, the thesis, the title.
- **Key moments, 2–4 per film**: the thesis line, the hardest fact or quote, the turn, the last line or image. Mark
  them in the beat sheet. Each gets: time on screen = reading time + 1.5 s; its own sound moment (the bed drops away,
  one low hit or one held note); everything around it steps back (no new motion, no competing text).
- **The thesis line** gets 2–3 wordings that differ in the verb or stance ("this film follows…" / "defends…" /
  "doubts…"); in step-by-step mode ask it as its own question, otherwise pick and give the reason.
- **The ending ties back to the opening question**: answers it, turns it, or leaves it open on purpose. Sources and
  credits go in the description, never as a scroll over the ending. **The ending keeps its time** after the last
  line: ≥ 2 s up to a minute, 4 s up to three minutes, 6–10 s beyond. Earlier lines give way before the ending is
  squeezed.

## 16. Real people and events: every claim has its source

`research/facts.md`, one row per claim the film makes (a date, a number, a quote, what someone did):

```text
| # | Claim (as the film says it) | Source (link) | Status | Line id |
| 1 | <claim> | <url> | confirmed / unconfirmed / unreachable | VO7 |
```

A claim no source confirms is cut, or said as what it is ("according to…", "it was said that…"). A number is never
rounded into a stronger one. Interpretation and fact stay apart: the narration may interpret, never in the words of
a fact. Prefer primary or scholarly sources; one encyclopedia line is a lead, not a confirmation, for a surprising
number.
