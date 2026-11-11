# Audit v1 (independent agent, 2026-11-11): 194 shots, mid-frames in audit/, sheets/audit_*.jpg

## Top issues
1. Typhoeus drawn as a human face with snake hair (reads as Medusa). Hesiod: a hundred snake heads, no human face; fire from the snakes' eyes. Labels hidden by snakes, snakes cut at top edge (~12 shots). This also breaks d12_2 "the painter gave him a human face".
2. Identity: Hesiod and Cronos share a grey head (Cronos "the youngest" looks oldest). Metis looks like Hera; Hera wears a crown in all group shots. Titans / Cyclopes / Hundred-Handers share one template. Fix: one colour + one emblem per character.
3. Cyclopes on the wrong side: at Othrys (c1_2), buried/PAID (c8_2, c9_2), behind the gate (d1_1), trembling in Tartarus (d6_3). Replace with Titans.
4. Unsupported claims shown: X eyes = death (Ouranos, Cronos, Titans, Typhoeus); a born baby for "pregnant" / "about to give birth" (h1_2, e6_1, f3_2); quoted invented dialogue "HELP US" (c5_2, c12_4); Zeus not understanding a sound "gods can understand" (d4_2); Gaia "WON THE WAR / MADE ZEUS KING / PROTECTED HIS THRONE" (e11, overclaim); Poseidon among the "people" who wonder (b10_1); stone still swaddled 800 years later (b11–b12); FIRST/LAST labels inverted (b9_2); "A HUMAN FACE" over a wing (d12_2); ΖΕΥΣ card while the jar reads IEYΣ (d11_2).
5. Layout: busts stacked on heads (a2_3, a4_2, e2_2, e12_1); place names hidden (DELPHI, OTHRYS, OLYMPUS, WINGS); titles on hair (10 YEARS, ZEUS, COTTUS, METIS, NEXT TIME, HESIOD); text clipped top (SKY, SON, 100 SNAKE HEADS); scroll text overflow x5; ~15 shots with things in the caption band (y>940); "three" shown as one/two x8 (a3_4, a4_1, c3_2, c8_1 duplicate-bust bug, c11_2, c12_3, b13_1). Global guards: clamp to y 60–930, keep labels off bust boxes, auto-fit scroll text.

## Monotony
59/194 shots (30%) are only busts on a flat background. Worst runs: d2_2–d5_1 (same Typhoeus bust ~10x in 26 s), a6_1–a9_1, a3_2–a5_1, e4_3–e7_1, c2_2–c5_4. Map used in ~14 shots, jar photo ~12.

## Per-shot list (shot# sentence: problem -> fix)
- h1_2: floating born baby for "pregnant" -> glow/belly on Metis.
- h2_1: Zeus head cut by zoom -> cam2 [960,560,1.12].
- h2_2, a1_3: THEOGONY wider than scroll -> auto-fit.
- h3_1: "10 YEARS" on laurel -> y170; Typhoeus Medusa; Hera crown; Demeter/Hades hidden -> spread 160/1760.
- h4_1, h5_1: Cronos = Hesiod lookalike.
- a1_2: HESIOD label on laurel -> y170. a1_3: gods in caption band, late pops -> y780, s150, at .3–.9.
- a2_3: Ouranos on Gaia's head; label over hair -> Ouranos y230 s200, label y90 or side.
- a3_1: 3 babies for 18 children -> 6–8 small, early. a3_2: Titans pop too slow (0.06*i), clones. a3_3: bolt on hair -> y180; cyclops: big eye, apron, hammer.
- a3_4: one Hundred-Hander for "three ... fifty heads" -> 3 busts + extra heads/×50.
- a4_1: two for "three" -> add third. a4_2: Ouranos on Gaia; nothing shows hiding inside Gaia -> earth mound with silhouettes going in.
- a5_1: show mound bulging with faces. a6_2: Cronos slides over Cyclops -> until 0.3. a6_3: Cronos looks oldest; caption covers robe.
- a7_1: Cronos on top of rock, not hidden -> rock in front, eyes peeking. a7_3: Ouranos X eyes (he speaks next) -> hurt.
- a8_3: TO STRAIN as chained -> rope tug-of-war below faces.
- b1_2: small Cronos in caption; prophecy as scroll (was spoken) -> speech bubble with cracking crown.
- b2_1: THE RULE spills; invented written rule -> pictogram. b4_2: baby on Rhea's robe; three busts overlap; ? on veil.
- b5_1: Crete at bottom under caption -> cam lat ~36. b5_2: rock makes a mushroom on cave; baby ends beside Gaia -> baby into cave mouth.
- b7_1: "That baby is Zeus" shows adult Zeus; label on laurel -> baby Zeus. b7_2: late pops. b8_2: first Zeus stage bearded. b8_3: flash too strong; Cronos X eyes; Gaia tiny.
- b9_1: siblings pop from forehead -> from mouth. b9_2: FIRST/LAST inverted -> "SWALLOWED LAST → OUT FIRST".
- b10_1: DELPHI label hidden by stone; Parnassus label floating; no land visible -> zoom 1.6, label on a mountain; Poseidon as "people" -> two mortals.
- b11_2–b12_3: stone still swaddled, too big -> bare stone s180–200. b12_1: scroll on hat; jug not tipped. b12_2: wool/cloud lobes render as rings (also clouds c6_3, d6_2).
- b13_1: two Cyclopes -> three; chains leave frame. b13_3: bolt over Gaia.
- c1_2: OTHRYS label hidden; Cyclops among Titans. c1_3: Olympus pin on Zeus's head.
- c3_2: one Hundred-Hander -> three. c4_1: no gods bringing them up. c4_3: ambrosia drawn as the oil jar -> bowl/honeycomb.
- c5_2, c12_4: quoted "HELP US" invented -> no quotes / icon. c5_3: COTTUS label on hair; three identical.
- c6_1: ships + ♪ RING ♪ cheerful -> waves + shock rings. c6_3/d6_2: cloud glitch; OLYMPUS label in caption.
- c6_3, c10_3, d7_3: SKY clipped, TARTARUS in caption -> ruler y170–840.
- c7_2: flash whites out; no Olympus. c7_3: flames but no trees.
- c8_1: BUG two Cottus at same spot; few rocks for 300 -> 3 busts, 15+ rocks. c8_2, c9_2: X eyes; Cyclops among prisoners; chain over faces.
- c10_2: label touches robe. c11_1: trident floating; gate in caption. c11_2: two guards for three. c12_3: one for "these three".
- d1_1: prisoners outside the gate, a Cyclops among them -> Titans behind bars.
- d2_1: Gaia cries; baby Typhoeus = Zeus baby. d2_2–d3_1: labels covered by snakes, clipped. d3_1: fire on cheeks, not snake eyes.
- d4_2: Zeus scared/confused for "sound gods understand" -> remove. d4_3: sound words over snakes; same bust 4x -> add animal icons, words at side.
- d5_1: Typhoeus cut at eyes; Hesiod in caption. d5_2: crown on snakes; throne in caption. d6_4: flames on face; snakes cut.
- d7_1, d7_3, e1_1: Typhoeus X eyes. d7_2: rock colour override not rendering; Hesiod as witness. d8_1: ghost Typhoeus cut.
- d10_1: HYDRIA card too small. d10_2: Munich on empty field -> show Greece + Munich with trail. d11_2: card ΖΕΥΣ vs jar IEYΣ.
- d12_1: frame shows handle not monster. d12_2: "A HUMAN FACE" over wing; pixelated at 3.2x -> aim at face ≤2.2x.
- d13_1: labels hidden; painter's Typhon drawn female with bat wings, no snake body -> bearded profile, feathered wings, coils.
- e2_2: Gaia on Zeus's head. e3_2: crown over URGED. e4_1: stars launch from Zeus's face. e4_3: Metis looks like Hera -> own palette.
- e5_1: METIS label on band. e6_1: born baby labelled ATHENA -> unborn glow in Metis. e7_2: throne/card in caption.
- e8_1: tiny Metis on caption. e8_2: WISE in caption. e8_3: SON clipped. e9_1: two babies + Zeus clone confusing.
- e10_2: chain under Ouranos makes him look chained. e11: overclaiming labels -> "TOLD HOW TO WIN", "PROMPTED THE GODS", "ADVISED THE SWALLOWING"; Cronos X.
- e12_1: Gaia covers Cronos. f1_1: thrones in caption. f1_2: Ouranos X. f1_3: throne in front of Cronos; X eyes.
- f2_2, f3_3: scroll text overflow. f2_3: bride silhouette reads as Hades. f3_2: born baby "BEFORE" reads wrong -> dashed unborn. f4_1: NEXT TIME on laurel.
