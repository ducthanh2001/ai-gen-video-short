# ELEVATOR v2 (stick-figure action Short)

46.6 s, 9:16 at 1080x1920. Picture and sound are made entirely in code. Version 1 is kept in `v1/`.

**Story.** Every fight happens out on a floor, never inside the car. Between floors we ride inside the car, over his shoulder, looking out at whoever is waiting.

| Floor | Set | Fighters | Set piece |
|---|---|---|---|
| 1 | Lobby | A thug walks out of the lift | Kicked over the reception desk |
| 8 | Office | Knife + brawler | Shoulder throw onto the brawler; desk smashed; hero kicked into the water cooler |
| 17 | Dojo | Staff + two fighters | Hero takes a staff to the back and takes the staff; one fighter goes through the paper screen, one into the weapon rack |
| 26 | Boiler room | The brute | Staff snaps; hero slammed into a pipe; steam valve to the face; flying kick; finisher: a flip in the air and a diving kick that sends the brute through the floor |

Each floor has its own fighting style:
- lobby: boxing (jab, cross, hook, uppercut, a big rear cross to finish)
- office: grappling (wrist grab, shoulder throw, hip throws onto the desk)
- dojo: staff fighting
- boiler room: aerial kicks

**Making hits land.** Every clean hit has a hit-stop: story time nearly freezes for a couple of frames (the `speed()` term built from the impacts; `slowOnly()` is the slow-motion part alone). The camera also punches in on every hit.

**The loop.** He presses 30. The panel glitches to 1. The doors open on the lobby, packed with everyone he beat. They all raise their fists at once, and so does he.

## Shots
- **side**: the floor seen from the side. The lift doors are in the back wall at x −150..150. Fighters walk in and out of the doorway with depth `d`, clipped to the door gap. The doors close once he is out, so fights play against the set.
- **pov**: inside the car, looking out. The hero is a large front-view figure seen from behind, over the shoulder. The people waiting on the floor are also front-view figures, placed in perspective.
- The shot list, slow-motion windows, dings and impacts are in `film/tl.json`. Camera keys per set are in `CAM`. Choreography is in `FIG` (side) and `POVF` / `HF_K` (POV) in `film/index.html`.

## Sound (`tools/build.py`)
- **Muzak:** the elevator bossa plays only inside the car, through a small-speaker filter. It is muffled on the ride to the boiler room.
- **Action score:** one continuous driving track at 140 bpm in D minor, with the bass and strings side-chained to the kick.
  - Intensity follows `LEVELS`: a tense pulse under the rides, then each floor is heavier.
  - office: + staccato strings
  - dojo: + taiko, octave strings, crashes
  - boiler room: + extra kicks, brass stabs, arpeggio
  - `MG` sets the music level (default .85). `STEMS=1` prints music versus effects loudness.
- **Transitions:** a riser and a braam each time the doors open on new fighters. The score is muffled in slow motion.
- **Effects:** a whoosh before every blow, plus set-piece sounds (papers, desk, water, paper screen, rack, staff snap, pipe, steam, floor).
- **Ending:** a braam, a falling three-note sting, and a drum hit when the crowd raises their fists.

## Rebuild
Python is `~/anime-hair-colors/.venv`; prefix commands with `PYTHONUTF8=1`.

1. Run `python tools/tl.py` to get the real duration. Frames = ceil(duration × 30). Regenerate `sub_times.txt` (8k+j, j = 0..3).
2. From `~/lemo-opuscar`, render the subframes:
   `node core/render/still.mjs <project>/film $(cat <project>/sub_times.txt) --q rate=240 --size 1080x1920 --out <project>/sub --prefix s_`
3. Run `python tools/build.py`, which writes `elevator.mp4`.

Keep camera shake under about 8 Hz, or the 4-subframe blur turns into ghost copies.
