# Camera moves and transitions: the named vocabulary

Lemo's `DIRECTOR.md` §8 asks for at least four camera moves, one signature shot and transitions designed inside the
medium. This page gives those moves names, durations, speeds and reasons, so every shot in `TREATMENT.md`'s shot list
is written the same way, and `assets/cam.js` implements them as pure functions of time for `window.render(t)`.
**The style's `STYLE.md` camera grammar wins**: a move it rules out is not used. Adapted from cinecode (MIT).

## The camera line

Every shot's camera is one line: **name, seconds, speed easing, target**.

```text
dolly in, 3 s, slow ease-in-out, toward the ledger
whip pan, 0.3 s, ease-in-out, from the ice house to the ship
pull-back reveal, 5 s, slow ease-in, from one ice block to the harbour
```

It goes in the shot list (Lemo §4.4, the "camera move" column) and as the first comment of the shot's code. Add the
**why** in Lemo's column: follow, reveal, tense (push), release (pull).

## Speed and easing words

| Word | Moves that change size (dolly, zoom, push) | Moves that sweep (pan, truck, orbit) |
|---|---|---|
| slow | subject size changes ≤ 10% per second | an object takes ≥ 6 s to cross the frame |
| medium | 10–25% per second | 3–6 s to cross |
| fast | > 25% per second | 1.5–3 s to cross (faster = whip pan) |

Easing (`EASE.*` in cam.js): **linear** (machines, tracking at walking pace) · **in** (gathering force; endings) ·
**out** (fastest on frame 0: hook shots) · **inOut** (deliberate, self-contained) · **inertia** (35% linear + 65%
smoothstep: moving at frame 0 and still moving at the cut; the default inside a sequence). **The first shot never
starts with ease-in** (it would be still on frame 1).

One primary move per shot, plus at most one secondary (handheld, a small tilt).

## Camera moves

| Name | What it does | What the viewer feels | Default | cam.js (2D · three.js) |
|---|---|---|---|---|
| **pan** | turns left/right on the spot, no parallax | scanning, following, linking two things | 3–6 s, slow–medium, inertia | `CAM.pan(c,e,0,0.4)` · `CAM.three.pan` |
| **tilt** | turns up/down on the spot | up: awe, scale; down: discovery, weight | 2–4 s, slow, inOut | `CAM.tilt` |
| **dolly in** | travels toward the subject, parallax | intimacy, tension, "this matters" | 3–6 s, slow, inertia (out at the hook) | `CAM.dolly(c,e,1,1.3)` + `CAM.plane` · `CAM.three.dolly` |
| **dolly out** | travels away | isolation, release, context | 3–6 s, slow, inOut | `CAM.dolly(c,e,1.3,1)` |
| **zoom in / out** | focal length changes, no parallax | observation, surveillance, 70s documentary | 1–3 s, medium, linear or in | `CAM.zoom` (planes flat) · `CAM.three.zoom` |
| **truck / tracking** | moves sideways, often with a subject | travel, companionship, depth from parallax | 3–8 s, walking pace, linear | `CAM.truck` + planes · `CAM.three.truck` |
| **orbit / arc** | circles a target facing it | importance, scrutiny; fast = heroic | 4–8 s, 5–30°, inertia | `CAM.orbit` (2.5D) · `CAM.three.orbit` |
| **crane up / down** | rises or descends keeping the subject | up: hope, scale, a reveal; down: arrival, gravity | 3–6 s, slow, inOut / out | `CAM.crane` · `CAM.three.crane` |
| **dolly zoom** | subject keeps its size, background warps | realisation, dread, unreality | 2–4 s, slow, inOut; **once per film** | `CAM.dollyZoom` · `CAM.three.dollyZoom` |
| **push-in on detail** | dolly to an off-centre detail, ending on it | "look here": a clue, an emotion | 2–4 s, slow, inOut | `CAM.pushTo(c,e,x,y,1,2)` |
| **pull-back reveal** | from a detail out to the context | surprise, irony, scale | 3–6 s, slow → medium, in | `CAM.pullBack` |
| **fly-through** | fast forward flight through planes | speed, immersion | 2–6 s, fast, linear | `CAM.path` through planes |
| **handheld** | seeded low-frequency drift, never per-frame jitter | presence, urgency, documentary truth | whole shot; 0.5–1 subtle, 3+ impact | `CAM.handheld(c,t,1)` · `CAM.three.handheld` |
| **slow motion / speed ramp** | time slows; a ramp changes speed inside the shot | weight, a moment stretched | 0.25–0.5×; ramp 0.3–0.6 s | `retime(t,[[1,1],[1.4,0.25]],0.4)` |
| **time-lapse** | time runs much faster | time passing, change, scale | 2–6 s at 8–100× | `retime(t,[[0,24]])` |
| **freeze frame** | time stops (the camera may keep moving) | punctuation, "remember this", a comic beat | 0.5–2 s | `retime(t,[[2,1],[2,0]])` |
| **rack focus** | focus jumps between planes | attention moves; two things connect | 0.5–1.5 s, medium, inOut | `CAM.rackFocus` + `CAM.blurFor(c,depth)` |

2D has a camera too (Lemo §8): draw each layer of a flat style on a depth plane (`CAM.plane(ctx, c, depth, W, H)`:
1 = focus plane, 2–6 far, 0.5–0.8 near foreground) and the same dolly gives real parallax.

## Transitions

| Name | What it does | What the viewer feels | Default | cam.js |
|---|---|---|---|---|
| **hard cut** | instant change | clarity, momentum | 0 frames | `TR.cut` |
| **match cut** | a shape, motion or colour carries across the cut | connection, poetry, a time jump | 0 frames, 0.3–0.6 s settle | `TR.match(k,dx,dy)` |
| **whip pan** | a very fast pan with streaks hides the change | energy, a jump in place or time | 0.2–0.35 s, inOut | `TR.whip(k,W,dir)` |
| **cross dissolve** | A fades into B | time passing, memory | 0.4–1.5 s | `TR.dissolve` |
| **iris** | B opens in a growing circle | into the subject; storybook, silent film | 0.4–0.7 s | `TR.iris` |
| **wipe** | an edge sweeps B over A | a page turning; graphic (only when the style owns it) | 0.3–0.8 s | `TR.wipe` |
| **smash cut** | a hard cut between contrasting energy | shock, comedy | 0 frames, sound changes on the same frame | cut + cue map |
| **J-cut** | B's sound starts before B's picture | anticipation | sound leads 0.3–1.5 s | the mix (Lemo §6) |
| **L-cut** | A's sound runs over B's picture | continuity, reflection | tail 0.5–2 s | the mix |

**Inside the medium first** (Lemo §8): a page turn, a carved line growing, ink spreading, a woodblock print pulled.
The generic transitions above are the fallback and the vocabulary for naming what the medium does (an ink bloom is a
dissolve with a shape; a print pull is a wipe).

**Vary them.** Never the same designed transition twice in a row (plain cuts may follow each other). Zoom **through**
an element the eye is already on (a window, a label, a coin) into the next shot; let the next shot **grow out of**
something that just lit up; **push** sideways for a change of topic at the same level. Name how each shot leaves.

**Cut seams.** A cut inside motion is invisible when the motion carries across it: cut at the move's fastest moment,
not as it settles; keep direction and speed the same on both sides; a zoom keeps its sign across the cut; the
subject's position and the eye's resting point line up within a tenth of the frame.

## One continuous shot (a signature oner)

Choose it when the film is one place and one subject and its drama is a change of scale, a pursuit or a reveal.
Build the world once and move one camera through it: `CAM.path(keys, t)` with 3–4 beats as keys (establish wide ·
follow · close pass or push to the detail · pull away or reveal); the camera flows through the keys and never stops
on one. What sells it: a real change of scale, parallax (near planes sweep fast, far ones barely move), a foreground
object wiping across the lens at the closest moment, a speed ramp into the pass, a rack focus as the subject crosses
the focus plane. Longer than about a minute, hide the joins inside it (the camera passing behind a foreground object
or into black).

## Choosing

- **Reasons first**: push = tension or importance, pull = release or reveal, track = travel, crane = scale, orbit =
  scrutiny, handheld = presence, locked off = let the subject or light move.
- **Spend the big ones once**: dolly zoom, freeze frame, smash cut and speed ramps land because they are rare.
- **Consecutive shots differ** in move, size or direction while the film keeps one visual language.
- **The signature shot** (Lemo §8) is planned in the treatment, at the emotional peak, with its camera line.
