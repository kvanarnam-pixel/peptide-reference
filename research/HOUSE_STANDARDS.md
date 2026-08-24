# House Standards — Voice & Dosing Philosophy

Companion to PROJECT_RULES.md. That doc governs how cards behave (structure, verification, change-reporting). This doc governs what doesn't change compound to compound: voice and dosing philosophy. Read by any model working on this repo — Grok, Claude Code, claude.ai.

## Voice

- Analogy-first, always. Every card opens with a functional job title + one-line "Think of it like..." explanation before any mechanism detail. BPC-157 / TB-500 / GHK-Cu / MOTS-c / Retatrutide form a construction-site family — not just the repair trade, but the whole operation: foreman, access crew, materials, power plant, and now logistics. New cards should check whether they fit somewhere on the site (a repair trade, power/fuel, logistics, signaling/dispatch, site safety) before inventing a new metaphor family.
- Evidence-tiered, not clinical-toned. Distinguish fragment/analog-specific evidence, full-molecule evidence, mechanistic inference, and practical/anecdotal experience — the TB-500 research doc's four-tier structure is the template. Say which tier a claim sits in. Don't dress mechanistic inference up as trial data, and don't dress trial data up as clinical-guideline language.
- No trial-report register in card copy. Specific trial names, phases, dates, and arm-by-arm percentages read like a drug label, not like us. If a specific finding is genuinely worth keeping (a real, non-obvious risk), translate it into plain outcome language and drop the citation packaging. Regulatory/approval status, when relevant, is a one-line footnote at the bottom — never the frame.
- "What They're Not Telling You" — standard section wherever there's a real corrective to make to the mainstream framing of a compound.
- Practical over institutional. "Common mistakes" beats "adverse events." "Watch for" beats "warnings." Function and felt experience over lab-value chasing, without pretending labs don't matter.

## Dosing philosophy

- Root cause and minimum effective dose over maximum tolerated. Results earn the next step up — not the calendar.
- Trial-arm doses are a data point, not the recommendation. Trials optimize for a measurable population-level endpoint on a fixed protocol, not for one person finding their own minimum effective response.
- Where the practical/Kevin-Trevor-calibrated number diverges from the trial-derived number, both stay visible in the compound's research doc, with one sentence on why they diverge. This preserves the reasoning trail so a future editing pass doesn't quietly "correct" the number back toward the trial figure.

### Handling Bachmeyer-sourced protocol documents

Some Trevor Bachmeyer-sourced material (e.g., "exact specified dosages" write-ups framed as completed animal studies) wraps real mechanistic and protocol-combination reasoning in fabricated quantitative packaging — invented p-values, animal-study formatting, IACUC-style protocol numbers, and embedded sales links. This is decided policy, not a per-instance judgment call, and should not be re-litigated or re-flagged as a fresh discovery in future sessions:

- Evaluate the biological/mechanistic logic and protocol-combination reasoning on its own merits, same as any interpretive/practitioner-tier source. Pull it forward if the mechanism holds up; drop it if it doesn't.
- Never cite specific numbers, percentages, survival rates, or claimed study results from these documents as evidence — they are not real, regardless of how the mechanism underneath them checks out.
- A genuine Bachmeyer statement with a real, checkable source (a specific video, transcript, or direct quote) is a different and legitimate category — cite those normally, as this doc's existing highest tier for dosing/cycling/sequencing decisions.

### Worked example — Retatrutide

Trial-derived: Phase 2/3 titrated across 1/4/8/12 mg weekly dose arms; larger average effect and more GI/dysesthesia burden toward the top of that range.

Practical calibration (what's on the card): maintenance around 0.5–2 mg; active dosing 2–6 mg; 12 mg stated as a ceiling to escalate toward only when results call for it, not as a target tier. Tolerance axis — the top of the range is a limit, and the card's wording carries that.

Why they diverge: Trial arms are built to find the population's average ceiling, not an individual's minimum effective dose. Meaningful appetite/food-noise change shows up well under the trial's headline range in practice, so exposure and side-effect burden scale with what's actually needed rather than with a protocol designed to test the top end.

(This specific rationale is a working draft pending confirmation — the authoritative Retatrutide research doc, once written, is the source of truth for this compound; this entry exists here only to illustrate the pattern.)

## Choosing dose-tier labels

Don't inherit a label because it's "the convention" — choose it because it's true for this specific compound.

Where this gets decided: in the compound's research doc, not at card-writing time. Each tier gets its range plus a one-sentence reason for its label — same pattern as trial-derived-vs-practical-calibrated dosing above. If you can't write that sentence, the label hasn't actually been chosen. It's been copied.

Labels currently in use — a starting menu, not a required list: Maintenance, Active, Loading, Therapeutic (legitimate when a tier genuinely crosses into disease-treatment-level dosing, not just "the highest number"), Not established. Avoid bare "High" as a top-row label: it names an amount rather than a situation, and on a tolerance-limited compound it reads as a destination when it should read as a stopping line. Some compounds need a different structure entirely — TB-500 uses Common rhythm / Acute demand / Maintenance because its dosing story is about frequency, not an escalating amount. Don't force a compound into a shape it doesn't have.

Verification, at commit time: this is mechanical, not a fresh judgment call — the judgment already happened when the research doc was written. Just check: does each tile label agree with what the mechanism/dose-rule prose next to it actually says? If a label and its own card's prose contradict each other, that's the drift that let "Therapeutic" survive as long as it did on Retatrutide.

Name the axis. Tiers don't all vary along the same dimension, and the label only works if it matches the one actually in play:

- Burden — more tissue needs the work done. Maintenance / Active / Heavy repair.
- Tolerance — the top of the range is a limit, not a target. The top row is written so it reads as a stopping line, and the dose-limiting signal is named. Retatrutide sits here.
- Target shift — the dose changes what the compound does, not how much. Rows named by effect, not amount. GHK-Cu sits here.
- Rhythm — the story is frequency, not escalating amount. TB-500 sits here.
- Time-phase — front-loaded then sustained. This is what "Loading" means.
- Compartment — route determines the number. A different route for a different target is not a weaker version of the same thing.

Same vocabulary as the eight-reason administration rule used in the synergy protocols, applied one layer down — deliberately.

Three rows are a ceiling, not a quota. Where a compound's usable range is genuinely narrow, two rows is the honest answer and the card says so. Inventing a third tier to fill a table is false precision.

Cards do not indicate which row any individual is currently running. Cards are reference, not state.

## Where compound-specific research lives

research/<Compound>_Compound_Research.md — one file per compound, TB-500's file is the template. Card copy is a distillation of that file, not a replacement for it.
---

## Dose Placement — Which Layer Owns a Number

Synergy protocols carry no doses. A protocol states the mechanism
thesis, why each compound is in the combination, and why it is given
the way it is given. Every number lives on the compound card.

This is structural, not stylistic. It gives one source of truth per
compound, so a correction lands once instead of in every protocol
that mentions the compound. It also means running two protocols at
the same time cannot silently double a shared ingredient — the stack
resolves at the compound layer, where the total is visible.

A protocol may state route, timing, or frequency when those carry
mechanism (a peptide timed to a meal, a compound given fasted, a
bedtime dose aligned to a repair window). Those are rationale, not
dosing.
