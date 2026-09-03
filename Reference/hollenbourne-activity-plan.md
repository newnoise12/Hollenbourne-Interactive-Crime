# Hollenbourne Activity Plan

Extracted from `Hollenbourne Activity Plan.docx` (found in the parent
`Becoming a Criminologist` folder, not previously part of this repo). This is
the module's planning document — case narrative, suspect/victim details, and
the week-by-week activity spec for the 12-week module. Treat the week-by-week
table below as the spec for what future weeks' trust activities should be.

Typos and inconsistent capitalisation are preserved as in the original
(e.g. "Londons", "Critchely"/"Critchley", "Gass").

---

## Case narrative

Hollenbourne, on the border between London and Kent, is an area of
contrasts. From its industrial past serving London's now disused dockyards
until the early 20th century, it is now an emerging area of the commuter
belt, with several new estates emerging and talks of a connection to the
Elizabeth line in the next decade. Despite the investment in the area, it
remains one of the most unequal parts of the country with areas of profound
deprivation and persistently high-crime rates. Hollenbourne became notorious
in 2025 as the 'murder-capital' of the UK. Strictly within the jurisdiction
of Kent Police, analysis suggested the reason for this was growing tensions
between county lines gangs, leading to increased violence in fights over
territory.

However, while Hollenbourne has its fair share of issues characteristic of
its proximity to London and deindustrialised past, the rapid increase in
violent offences in 2025 cannot be simply explained by county lines.

The long shadow of the chimneys at the disused Critchley steel plant fall
over the terraced houses at the nearby Boresfield Estate. This diverse area
is one of the most deprived in the country and in recent years, residents
have constituted half of the deaths occurring in violent or suspicious
circumstances in Hollenbourne. While unemployment, drug use, and robbery are
common in this area, three deaths serve as examples of a more sinister and
difficult to explain phenomenon affecting the residents of Hollenbourne.

*(The source document says "three deaths" here but lists four victims below,
including Sara Butt — likely added later without updating this line.
Reproduced as written.)*

Hollenbourne, as we've said, is a place of two halves and the local council
have worked hard in recent years to see investment. The high rates of
criminality in the area is a constant concern and many feel as if it drives
away would-be residents to places such as the Featherton estate. This area
of new-build residential properties is situated just behind Hollenbourne
high street, near to the supermarket and railway station. The council hopes
that professionals and young families will be drawn to the area, allowing
more income to flow into the local economy. At present there are around
85,000 residents in Hollenbourne and its surrounding area, and new housing
projects aim to replace existing housing around the Critchley plant and
provide space for 20,000 new residents by 2032. The tenement buildings
around the Critchley plant are post-war tower blocks in need of much repair.
Some buildings have been emptied out but others are still inhabited by
low-income families and retired people. It is a poor area and, like the
Boresfield estate, it is associated with the county lines drug trade.

## Victims

| Victim | Age | Occupation | Found | Details |
|---|---|---|---|---|
| Geoff Mason | 88 | — | 8 October 2019 | Bludgeoned to death in the woods. Body likely moved there — CCTV identified a dark 4x4 in the car park of the woods around the time of death. |
| Susan Wooley | 57 | Secondary school teaching assistant | 6 January 2022 | Bludgeoned at home — no signs of break-in. A heavy-set man in work boots, jeans, and a dark puffer jacket with hood seen walking to and from the house on local authority cameras and a ring cam. |
| Carl Porterhouse | 44 | Unemployed | 29 May 2023 | Known drug addict, run-ins with police. Found beaten to death at home; signs of blunt instruments used on body, head, and legs. No signs of break-in. |
| Sara Butt | 24 | Student and retail assistant | 22 May 2025 | Bludgeoned in woods — body likely moved there on foot after she was abducted nearby. |

**Note:** the app currently only models Mason, Wooley, and Porterhouse in
the action economy (`lib/actions-catalog.ts`) — Sara Butt's case isn't
represented yet.

## People interviewed

1. **Nigel Wooley** — 52, Surveyor, Featherton, ex-husband of Susan Wooley. Questioned after her death. History of domestic violence; has a restraining order preventing him from being in the Boresfield estate and surrounding areas. Evasive about his location around the time of the murder. Phone data suggests he was at home but he's later identified entering a car park around Hollen Marsh with his dog. Forensic tests indicate his DNA is present at the scene but nothing from the recent days. He and Wooley had co-habited until 2021.
2. **Martin Burgess** — 38, Gas and boiler technician, Dartford. Questioned after Susan Wooley's death. Present in the area at the time of her death — undertook a boiler service at a neighbour of Wooley's near the time of the murder. Serviced Mason's boiler earlier the same day.
3. **Khalid Haddad** — 26, Delivery driver, Ilford. Interviewed following Porterhouse's death as police begin to identify a pattern. His bike and phone are present in the area on the nights of several of the deaths. No previous offences, but police identify a pattern of suspicious movement around the time of Mason, Porterhouse, and Butt's deaths.
4. **Colin Swayne** — 43, Unemployed, Boresfield Estate. Interviewed after Porterhouse's death. Friend and neighbour of Porterhouse. Admitted substance misuse issues and previous convictions for violent offences. In the area at the time of Porterhouse, Wooley, and Mason's deaths. Forensic data found at the scene of Porterhouse's murder; phone data places him in the area for each offence.

## Week-by-week activity spec

| Week | Topic | Reading | Activity | Skills |
|---|---|---|---|---|
| 1 | Introduction: Becoming a Criminologist | Podcast | Familiarise yourself with game site and take a book out of the library | Accessing Information |
| 2 | Becoming a Criminologist pt.2 | TBC | Ranking Trustworthiness of sources | Source Evaluation |
| 3 | The Criminal Justice System | TBC | Cite Them Right Tutorial — Accessing Evidence through Referencing | Source Evaluation and Referencing |
| 4 | The Dark Figure of Crime | TBC | Crime Data from Hollenbourne — identifying and describing trends. Crime data quiz | Data Description and Analysis |
| 5 | The Police Force | TBC | Evaluating use of police discretion. PACE Quiz | Moral and Abstract Reasoning |
| 6 | Policing and Ethics | TBC | Death Penalty Debate. Argument formation quiz | Moral Reasoning and Argumentation |
| 7 | Police Investigation and the CPS | TBC | Evaluating evidence and public interest. Forensic Interviewing | Moral and Abstract Reasoning; Data Gathering |
| 8 | Prisons | TBC | Students look over interview transcripts — Hollenbourne interview transcript analysis | Analysing Textual Data |
| 9 | Probation and Surveillance | TBC | — | Visual Analysis and Policy Context |
| 10 | Crime in the Media | TBC | — | Visual and Textual Analysis |
| 11 | Crime Trends: Data Analysis Workshop | — | — | Visual, Textual, and Statistical Analysis |
| 12 | Assessment Support | Not in person | — | — |

### Notes on Week 2 (context for the trustworthiness quiz already built)

The plan describes Week 3's activity — "Cite Them Right Tutorial", Accessing
Evidence through Referencing — as the actual home of the citation/referencing
skill, distinct from Week 2's ranking-trustworthiness activity. The
evidence board (`app/dashboard/case-log`) currently isn't tied to a specific
week; it may be more accurately a Week 3 activity per this spec.

The plan originally describes Week 2's bundle as **Hollenbourne-specific**:
an academic article about county lines, a podcast, a police report, a news
article, and MOJ statistics, all about the real Hollenbourne case. The
podcast script is transcribed below. The quiz actually built
(`Reference/week2-trustworthiness-quiz (1).md`) instead uses a **separate,
non-Hollenbourne** county-lines scenario — deliberately, per that file's own
notes, so the ranking exercise doesn't bias how students read the actual
case evidence. That's a later, deliberate divergence from this plan, not an
inconsistency to fix — flagging it here so the reasoning isn't lost.

### Week 3 note

"Continues from previous week — dark figure of crime. Police Recorded vs
Crime Survey. Could be interesting to manufacture some crime surveys etc.
for the Hollenbourne area. Quiz suggested as activity. Perhaps a good idea.
Looking at the police recorded crime and crime survey for Hollenbourne they
can answer some questions that correlate to the other data points and help
to point them in the right direction. The main aim here is ensuring that
they can read and interpret statistical data."

(This note is filed under "Week 3" in the source doc but the topic —
police recorded crime vs. crime survey, the "dark figure of crime" — matches
the Week 4 table row above. Reproduced as written; the numbering discrepancy
is in the original.)

## Week 2 podcast script ("Raw Crime Podcast")

> This is the Raw Crime Podcast where current, past, and future cases
> collide. My name is Chris Waller and this week we're looking at a brutal
> series of killings in Essex in the town of Hollenbourne, recently dubbed
> the murder capital of the UK. We're going to take a deep dive into the
> dark recent history of this town and ask ourselves the question which the
> police are currently asking themselves: are the deaths of Geoff Mason,
> Susan Wooley, Carl Porterhouse, and Sara Butt, connected? Join us for
> another Raw Crime Deep-Dive.
>
> Hollenbourne in Essex has been the site of 25 murders since 2018 with an
> average rate of 3 murders a year. In 2022, 5 murders were recorded
> including the death of Susan Wooley.
>
> A former industrial town near the Thames which serviced London's
> docklands up until the 1980s, Hollenbourne was best known for the
> Critchley cement works which employed 3,000 workers in the surrounding
> area. As older residents recalled, the looming towers of the Critchley
> plant and the thick grey dust which used to cover the houses and shops in
> the town served as a source of local pride. As Hollenbourne expanded,
> nearby quarries serving the works with chalk started to become
> encroached upon, leading to a shortage of easily accessible materials to
> make the cement. After the economic crises of the 1970s and an
> increasingly globalised market for building materials, in 1982 the
> Critchley plant blew its last puffs of dust onto the town whose growth
> and success had strangled to death the very industry which gave it life.
>
> Looking at Hollenbourne today, it is easy to imagine this puff of dust as
> the parting shot in a duel between the industrial past and a prosperous
> future, a shot which did not kill the town off but left it maimed. Today
> unemployment, [the source document ends here]

**Note:** this is Chris Waller's own podcast script — presumably the
module author. The transcript is cut off mid-sentence in the source
document at "Today unemployment,".
