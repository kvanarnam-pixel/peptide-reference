# House Standards — Voice & Dosing Philosophy

Companion to PROJECT_RULES.md. That doc governs how cards behave (structure, verification, change-reporting). This doc governs what doesn't change compound to compound: voice and dosing philosophy. Read by any model working on this repo — Grok, Claude Code, claude.ai.

## Voice

- Analogy-first, always. Every card opens with a functional job title + one-line "Think of it like..." explanation before any mechanism detail. BPC-157 / TB-500 / GHK-Cu / MOTS-c / Retatrutide / KPV form a construction-site family — not just the repair trade, but the whole operation: foreman, access crew, materials, power plant, logistics, and site safety (KPV). SS-31 is wiring & grid-stabilization; ARA-290 is Data Signal Repair. New cards should check whether they fit somewhere on the site (a repair trade, power/fuel, logistics, signaling/dispatch, site safety) before inventing a new metaphor family.
- Evidence-tiered, not clinical-toned. Use the six-tier evidence taxonomy for new and retrofitted work — STRONG / MODERATE / LIMITED / VERY LIMITED-UNESTABLISHED / PRACTITIONER-COMMUNITY CONVENTION / INTERPRETIVE (see _TEMPLATE.md's Tier 1 voice rules for the full definitions). Say which tier a claim sits in. Don't dress mechanistic inference up as trial data, and don't dress trial data up as clinical-guideline language. TB-500's original four-tier structure predates this system and is retained as a structural reference for section order, not the evidence-tier standard.
- No trial-report register in card copy. Specific trial names, phases, dates, and arm-by-arm percentages read like a drug label, not like us. If a specific finding is genuinely worth keeping (a real, non-obvious risk), translate it into plain outcome language and drop the citation packaging. Regulatory/approval status, when relevant, is a one-line footnote at the bottom — never the frame.
- "What They're Not Telling You" — standard section wherever there's a real corrective to make to the mainstream framing of a compound.
- Practical over institutional. "Common mistakes" beats "adverse events." "Watch for" beats "warnings." Function and felt experience over lab-value chasing, without pretending labs don't matter.

## What They're Not Telling You

Published trials answer the questions they were designed to ask. An unanswered question is not the same thing as a disproven idea.

After the conventional evidence audit, every compound gets a deliberate second-pass search for practitioner observations, recurring community patterns, unconventional uses, timing/frequency strategies, sequencing, combinations, unusual responses, and other questions formal trials may not have examined.

The process is:

**Find the observation first → identify the claim → take it back to the biology → keep, qualify, or reject it.**

Do not accept a claim because practitioners or communities repeat it.

Do not reject a claim merely because no trial exists.

**A second, equally valid entry point: reasoning forward from established mechanism, with no prior observation or community claim required.** Not every genuine insight in this section starts as something practitioners are already saying. Some of the most valuable content here comes from taking a mechanism already established elsewhere in the same doc seriously enough to follow it somewhere nobody's stated plainly — even without a test or a repeated community claim to anchor it. A test only ever answers the specific question it was designed to ask; the absence of a test on a specific question is not evidence against a mechanistically sound inference, and is not a reason to omit it. The same discipline applies regardless of entry point: the mechanism has to actually support the claim, and the claim has to be labeled honestly as interpretive reasoning rather than dressed up as more settled than it is.

Each candidate should land as:

- **HOLDS UP** — observation has credible biological support and does not conflict with stronger evidence.
- **PLAUSIBLE BUT OPEN** — biologically possible/useful but important assumptions remain.
- **DOESN'T HOLD UP** — biology contradicts it, the premise fails, or it is unsupported lore.

Keep practitioner/community observations distinct from INTERPRETIVE biological reasoning. The verdict label (HOLDS UP / PLAUSIBLE BUT OPEN / DOESN'T HOLD UP) is applied on top of the existing evidence-tier label, never in place of it.

Governing line:

> **Trials answer the questions they were designed to ask. Our job is to investigate the useful questions they did not ask.**

## Dosing philosophy

- Root cause and minimum effective dose over maximum tolerated. Results earn the next step up — not the calendar.
- Trial-arm doses are a data point, not the recommendation. Trials optimize for a measurable population-level endpoint on a fixed protocol, not for one person finding their own minimum effective response.
- Where the practical/Kevin-Trevor-calibrated number diverges from the trial-derived number, both stay visible in the compound's research doc, with one sentence on why they diverge. This preserves the reasoning trail so a future editing pass doesn't quietly "correct" the number back toward the trial figure.

### How Do I Know It's Working?

Every compound doc's Tier 1 includes a "How Do I Know It's Working?" section — see `_TEMPLATE.md` for the required shape, `KPV_Compound_Research.md` for a reference implementation of the full Tier 1/Tier 2 split. It answers three questions the card alone can't: how someone knows it's working, when raising the dose makes sense, and when to stop. Depth scales to what's actually known — a compound with real human dose-ranging data needs much less of the "start conservative" scaffolding than one with no established human dose-response curve. The evidence-sourcing detail behind that plainspoken answer (trial-derived vs. practitioner-sourced vs. this reference's own inference) lives in Tier 2's Identity and evidence boundary section, not inline in Tier 1 — this replaces the older flat response-guided dosing section, which predated the Tier 1/Tier 2 split.

Two things this is not:
- **Not a license for false precision.** If the framework can't be stated more confidently than the underlying pharmacology supports, say so — same rule as everywhere else in this doc.
- **Not an automatic front-card chip.** The research-doc section is mandatory; a corresponding chip is a per-compound decision, made with the same discipline as choosing a dose-tier label — earned, not inherited because another compound has one.

One recurring pattern worth naming explicitly wherever it applies: a reproducible decline in function after starting or increasing a dose is a hold-and-reassess signal, not evidence the compound is "working hard," "detoxing," or otherwise doing something good that just feels bad. That explanation shows up often in peptide-community discussion and rarely has a mechanistic basis.

### Handling Bachmeyer-sourced protocol documents

Some Trevor Bachmeyer-sourced material (e.g., "exact specified dosages" write-ups framed as completed animal studies) wraps real mechanistic and protocol-combination reasoning in fabricated quantitative packaging — invented p-values, animal-study formatting, IACUC-style protocol numbers, and embedded sales links. This is decided policy, not a per-instance judgment call, and should not be re-litigated or re-flagged as a fresh discovery in future sessions:

- Evaluate the biological/mechanistic logic and protocol-combination reasoning on its own merits, same as any interpretive/practitioner-tier source. Pull it forward if the mechanism holds up; drop it if it doesn't.
- Never cite specific numbers, percentages, survival rates, or claimed study results from these documents as evidence — they are not real, regardless of how the mechanism underneath them checks out.
- A genuine Bachmeyer statement with a real, checkable source (a specific video, transcript, or direct quote) is a different and legitimate category — cite those normally, as this doc's existing highest tier for dosing/cycling/sequencing decisions.
- For "What They're Not Telling You" specifically — the mechanism-first entry point described above — Bachmeyer material is the first place to look for candidates. He goes deepest on mechanism, pharmacology, and endocrinology (often via animal studies) of anything in this project's source material, which is exactly the kind of biologically-plausible-but-untested reasoning that section exists to surface. The rules above still apply in full here: pull the mechanistic logic forward, never cite the fabricated numbers, percentages, or study results from his write-ups as if they were real data.

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

## Blending & handling

Blending: Default is no stored multi-peptide blends. GHK-Cu is a hard no for co-storage with other peptides. Wolverine / GLOW / KLOW are convenience products (schedule mismatch, dose-unit mismatch, loss of independent titration); not best practice. Pharmacy multi-peptide vials follow the same rule. Same-syringe is allowed only when compounds are due the same day, vials are not cross-contaminated (new needle per vial or separate shots), and injection is immediate. Do not co-draw GLP-1/GIP agonists with research peptides. GH-axis duals (CJC no-DAC + Ipamorelin) are the least incoherent pre-mix; separate vials still preferred for independent control. Full reasoning lives in research/HANDLING_Blending.md.

## Model Roles — Default Lean, Not a Wall

Claude and Grok have different natural strengths, and content quality is best
when each is allowed to lead where it's strong, without being locked into a
rigid division that has to be fought against session to session.

Default leaning:
- Grok leads on Tier 1 voice — conversational tone, matching how Kevin
  actually talks, and is more willing to mine mechanism-first, non-obvious
  territory for WTNTY candidates even without a PubMed paper sitting in
  front of it.
- Claude leads on Tier 2 rigor, citation verification, and card-facing copy —
  holding the line on claim-to-source accuracy and evidence-tier discipline.

This is a default, not a boundary. Kevin routinely has to push any model past
its default instincts in a given session — reminding it of project context,
or explicitly directing it to dig past where it would normally stop. That
correction is expected working behavior, not an exception to these roles.
No model should treat its "lean" as a limit on what it can be asked to do.
