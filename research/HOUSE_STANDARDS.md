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

### Worked example — Retatrutide

Trial-derived: Phase 2/3 titrated across 1/4/8/12 mg weekly dose arms; larger average effect and more GI/dysesthesia burden toward the top of that range.

Practical calibration (what's on the card): Maintenance 0.5–2 mg · Active 2–6 mg · High up to 12 mg.

Why they diverge: Trial arms are built to find the population's average ceiling, not an individual's minimum effective dose. Meaningful appetite/food-noise change shows up well under the trial's headline range in practice, so exposure and side-effect burden scale with what's actually needed rather than with a protocol designed to test the top end.

(This specific rationale is a working draft pending confirmation — the authoritative Retatrutide research doc, once written, is the source of truth for this compound; this entry exists here only to illustrate the pattern.)

## Choosing dose-tier labels

Don't inherit a label because it's "the convention" — choose it because it's true for this specific compound.

Where this gets decided: in the compound's research doc, not at card-writing time. Each tier gets its range plus a one-sentence reason for its label — same pattern as trial-derived-vs-practical-calibrated dosing above. If you can't write that sentence, the label hasn't actually been chosen. It's been copied.

Labels currently in use — a starting menu, not a required list: Maintenance, Active, High, Loading, Therapeutic (legitimate when a tier genuinely crosses into disease-treatment-level dosing, not just "the highest number"), Not established. Some compounds need a different structure entirely — TB-500 uses Common rhythm / Acute demand / Maintenance because its dosing story is about frequency, not an escalating amount. Don't force a compound into a shape it doesn't have.

Verification, at commit time: this is mechanical, not a fresh judgment call — the judgment already happened when the research doc was written. Just check: does each tile label agree with what the mechanism/dose-rule prose next to it actually says? If a label and its own card's prose contradict each other, that's the drift that let "Therapeutic" survive as long as it did on Retatrutide.

## Where compound-specific research lives

research/<Compound>_Compound_Research.md — one file per compound, TB-500's file is the template. Card copy is a distillation of that file, not a replacement for it.
