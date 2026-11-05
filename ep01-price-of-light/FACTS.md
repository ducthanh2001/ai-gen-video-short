# FACTS — Ep 01 "The Price of Light"

Every number in the script must appear here with its source. Researched 05/11/2026.
Status: **OK** = read in the primary source · **OK-2** = reliable secondary source · **CALC** = our own calculation (method shown) · **HEDGED** = the script states the uncertainty.

## A. Primary source

**Nordhaus, William D. (1996).** "Do Real-Output and Real-Wage Measures Capture Reality? The History of Lighting Suggests Not." In Bresnahan & Gordon (eds.), *The Economics of New Goods*, NBER / University of Chicago Press, pp. 27–70. Text read from the PDF at https://defmacro.org/papers/nordhaus96.pdf (also https://www.nber.org/chapters/c6064.pdf).

### A1. Labor price of light: hours of work per 1,000 lumen-hours (Table 1.4, col. 4) — OK

| Date | Hours of work | In the script |
|---|---|---|
| ca. 500,000 B.C. (open fire) | 58 | "about 58 hours" |
| 38,000–9000 B.C. (stone fat lamp) | 50 | "about 50 hours" |
| 1750 B.C. (Babylonian sesame-oil lamp) | 41.5 | "41 and a half hours — more than a modern working week" |
| 1800 (tallow candle) | 5.387 | "about five and a half hours" |
| 1860 | 1.152 | — |
| 1870 (kerosene era) | 0.330 | "about 20 minutes" |
| 1900 | 0.2204 | "about 13 minutes" |
| 1910 | 0.0921 | — |
| 1920 | 0.0135 | "under a minute (about 49 seconds)" |
| 1950 | 0.00188 | "about 7 seconds" |
| 1992 (compact fluorescent) | 0.00012 | "less than half a second" |

Note (not used in the script): the series is not smooth; e.g. 1835 = 7.569 h, higher than 1800. We do not explain these bumps.

### A2. Other statements from the paper — OK
- "A wax candle emits about 13 lumens, a one-hundred-watt filament bulb about 1200 lumens" (§1.2.1).
- Table 1.1 milestones: 1292 "Paris tax rolls list 72 chandlers (candle makers)"; 1820 "Gas street lighting installed in Pall Mall, London"; 1855 "Benjamin Silliman, Jr., experiments with 'rock oil'"; 1879 "Swan and Edison invent carbon-filament incandescent lamp".
- Quote of Louis Stotz (1938, p. 6) in the paper: "the discovery of petroleum in Pennsylvania gave kerosene to the world, and life to the few remaining whales."
- Footnote 7 (citing Lebergott 1993): "One-third of New York tenement fires in 1900 were due to lamps or candles."
- §1.2: "The Welsbach gas mantle improved the efficiency of gas lamps by a factor of seven" → script "about seven times more efficient". Gas street lighting in Pall Mall, 1820 (Table 1.1).
- Efficiency: "an increase by a factor of nine hundred … between 1800 and 1992"; from the Babylonian lamp to the compact fluorescent bulb "a factor of about twelve hundred".
- §1.2.5: "Tallow gradually replaced wax as the former was much less costly, and in the eighteenth and nineteenth centuries whale-oil candles became the illuminant of choice."
- §1.2.6: "There were virtually no new devices and scant improvements from the Babylonian age until the development of town gas" → script: "for thousands of years… almost nothing changed".
- §1.3: "Edison priced his first electric light at an equivalent price to gaslight, so the prices per unit of light output for gas and electricity were equal in 1883."
- Babylon line in the script is phrased per the unit: "for the light of one modern bulb, burning for about an hour" (1,000 lumen-hours ≈ an 800-lm bulb for 1 h 15 min).
- Main finding: "the traditional price has risen by a factor of between nine hundred and sixteen hundred relative to the true price."
- Real wages: "the conventional growth in real wages has been by a factor of 13 over the 1800–1992 period. For the low-bias case, real wages have grown by a factor of 40, while in the high-bias case real wages have grown by a factor of 190." → the script says "13 times … maybe 40 times, maybe more"; HEDGED as Nordhaus's estimate, not fact.

## B. Today (our calculation) — CALC

| Input | Value | Source |
|---|---|---|
| US average hourly earnings, total private | $37.32 (Feb 2026) | BLS CES0500000003 via FRED, https://fred.stlouisfed.org/data/CES0500000003 |
| US residential electricity price | 18.2 ¢/kWh (2026 average, forecast) | EIA Short-Term Energy Outlook, https://www.eia.gov/outlooks/steo/report/elec_coal_renew.php |
| LED efficacy | ~90 lm/W (a 60 W-equivalent A19: 800 lm at 9 W ≈ 89 lm/W) | product spec example (RAB A-line spec sheet); DOE 2024 rule targets ~120 lm/W by 2028 (Federal Register 2024-07831) |

Calculation: 1,000 lumen-hours ÷ 90 lm/W = 11.1 Wh = 0.0111 kWh × $0.182 = **$0.0020** → ÷ $37.32/h = 0.0000542 h = **≈ 0.2 seconds of work** (electricity only; bulb purchase not included — stated in the script as "for the electricity").
Ratios: 1800 → today ≈ 5.387 / 0.0000542 ≈ **99,000× ("about a hundred thousand times")**; Babylon → today ≈ 41.5 / 0.0000542 ≈ **766,000× ("more than seven hundred thousand times")**.
Equivalences: 1,000 lumen-hours ≈ one 800-lumen bulb for 1 h 15 min. One 800-lumen bulb ≈ 800 / 13 ≈ **60 candles**.

## C. Long-run UK series (supporting) — OK-2
- Our World in Data, "Light at night" (Roser, Ritchie, Arriagada, Rohenkohl, 2023), from Fouquet & Pearson (2006), *The Energy Journal* 27(1): one million lumen-hours cost about £34,000 (2000 prices) in the 1300s vs £2.15 in 2023, "about 16,000-fold". https://ourworldindata.org/light
- Used only as a visual cross-check, not as a separate claim.

## D. Myth box: segmented sleep — HEDGED
- Historian A. Roger Ekirch found references to a "first sleep" and "second sleep" in early-modern records in several languages (English, Italian *primo sonno*, French *premier sommeil*, Latin *primo somno*), with an hour or so of wakefulness between. Sources: HNN / The Atlantic essay https://historynewsnetwork.org/article/182295 ; Ekirch, *At Day's Close* (2005).
- Counts differ by publication (a 2007 review notes 83 references in 72 sources, 1300–1800; later reports say hundreds to 2,000+). The script therefore gives **no number**: it says "in court records, medical books and letters, in several languages".
- Ekirch attributes the decline to artificial illumination and changing attitudes during the Industrial Revolution (Ekirch 2016 letter, https://pmc.ncbi.nlm.nih.gov/articles/PMC4763365 ; Past & Present blog https://pastandpresent.org.uk/connecting-the-segments-of-sleep/).
- Caveats: a 2007 review calls the evidence "suggestive, but not truly definitive"; sleep researcher Brigitte Steger found no such references in Japan; neuroscientist Russell Foster doubts it was universal. Ekirch himself warns against claiming one pattern is "right".
- **Verdict in the script: "Partly true — common in many records, but how universal it was is still debated."**

## E. Next-episode tease — VERIFIED (2026-11-05)
- Narration: "Next time: frozen water, and the strange business of shipping ice across oceans." On screen (engraved card): "In 1833, a ship carried New England ice some 16,000 miles, to Calcutta."
- Frederic Tudor's first ice cargo left Boston for Martinique on the brig *Favorite* in February 1806. In May 1833 the *Tuscany* left Boston with ice for Calcutta and arrived about four months and ~16,000 miles later; sources differ on the tonnage (≈180 t loaded, ≈100 t arrived), so the film gives no tonnage.
- Sources: HistoryNet, "How pioneering entrepreneurs helped 19th-century America keep cool" https://www.historynet.com/how-pioneering-entrepreneurs-helped-19th-century-america-keep-cool/ ; American Heritage, "Cold Mine" https://www.americanheritage.com/cold-mine ; Gizmodo, "The far-sighted entrepreneur who brought ice to India" https://gizmodo.com/the-far-sighted-entrepreneur-who-brought-ice-to-india-i-5988981 ; book: Gavin Weightman, *The Frozen Water Trade* (2003).
- Script wording change at recording: "candles made from whale oil" → "lamps burning whale oil, and candles made from whales" (spermaceti candles are made from the whale's head wax, not its oil; Nordhaus §1.2.5 says "whale-oil candles").
