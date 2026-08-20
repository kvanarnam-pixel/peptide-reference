# Peptide Reference App — Locked Execution Rules

These rules govern implementation work in this repository. Read them before changing app code, card content structure, visuals, or interaction behavior. Voice and dosing-philosophy standards live in research/HOUSE_STANDARDS.md; visual/palette standards live in research/VISUAL_STANDARDS.md — read both alongside this file.

## 1. Inspect before editing
- Read the current relevant files before proposing or making a change.
- Do not assume the live app matches memory or prior discussion.
- When a visual issue is reported, inspect the actual CSS/component selectors that control it.

## 2. Retatrutide is the visual reference card
- The Retatrutide premium card is the canonical visual/component reference.
- New premium cards must inherit the same visual system rather than recreating a similar one.
- Content may differ by compound; the product design should not drift.
- Before saying a new card matches RETA, compare structure, color treatment, spacing, typography, buttons, quick-reference panels, and Go Deeper hierarchy.

## 3. Research and UI are separate layers
- Research determines what a compound says.
- The shared component standard determines how it looks and behaves.
- Do not invent new card layouts because a compound has different biology.
- If a field does not biologically apply, adapt the content inside the existing structure instead of redesigning the card.
- Compound research docs follow the structure and section rules defined in research/_TEMPLATE.md. See that file's Retrofit queue for docs not yet brought up to standard.

## 4. Smallest-change rule
- Identify the minimum code/content change needed to satisfy the request.
- Avoid unrelated cleanup or redesign during a targeted fix.
- Reuse shared classes/components instead of one-off selectors whenever possible.

## 5. Verify after editing
After every implementation change:
1. Re-read the modified code.
2. Confirm the requested behavior is actually represented in the code.
3. Check for unintended conflicts with the locked premium card standard.
4. Check that existing Retatrutide behavior remains intact.
5. Only then report the work as complete.

## 6. Do not make Kevin the first QA pass
- Do not claim a visual or functional match based only on similar markup or class names.
- Verify the selector scope and actual implementation logic first.
- If something cannot be verified from the repository, say that rather than claiming it is correct.

## 7. Locked premium-card fundamentals
- Quick reference first; deeper biology underneath.
- Analogy = memorable functional job title + short `Think of it like...` biological explanation.
- Dose tier labels are chosen per compound and justified in that compound's research doc — see research/HOUSE_STANDARDS.md § Choosing dose-tier labels. Not a fixed word list.
- Do not manufacture unsupported dose tiers merely to fill boxes.
- `Minimum effective dose beats maximum tolerated dose.`
- `Results earn the next step up — not the calendar.`
- Cycling answers whether biology requires an off-period.
- Dose pattern answers whether exposure changes with the objective. These are separate questions.
- Front-card quick-reference panels act as navigation into the matching Go Deeper section when practical.
- User-facing combination language is `Synergy`, not merely `Stack`.

## 8. Change-reporting standard
When reporting a completed app edit, state:
- what changed,
- what was verified,
- the commit SHA,
- and any remaining uncertainty.

Do not say `done`, `fixed`, or `matches` until the verification pass is complete.
