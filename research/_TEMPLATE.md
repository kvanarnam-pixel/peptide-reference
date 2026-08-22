# Compound Research — Structural Template & Rules
*Reference implementation: TB-500_Compound_Research.md. Every new compound doc follows this section order. Section names can adapt to the compound (e.g. "Cancer-mechanism nuance" only if cancer is the actual highest-stakes open question) — the ROLE each section plays is what's fixed.*

---

## Required section order

**1. Title** — `# [Compound] Compound Research`

**2. Executive identity**
One bolded sentence stating what the compound fundamentally IS/does, in the construction-crew metaphor. Followed by the **Construction model** list — a living registry, not a one-off: every compound already built keeps its role tag here, and the new compound's role gets added. Update this list in every doc whenever a new compound joins the roster, so the cast always reads consistently across files.
Current roster: BPC-157 = foreman · TB-500 = scaffolding/access crew · GHK-Cu = materials/blueprints · MOTS-c = power plant · Retatrutide = logistics manager.

**3. Identity and evidence boundary**
Name this compound's specific evidence complication up front — whatever it actually is (fragment vs. parent molecule for TB-500; trial-scaled vs. practical dose and single-lab-dominance for BPC-157; something else for the next one). Lay out the evidence layers that matter for *this* compound — don't force TB-500's exact 4 layers if they don't fit. Close with a governing maxim, e.g. "Mechanism earns inclusion; evidence type determines wording."

**4. Core biological cascade**
One bolded arrow-chain: molecule → target → cellular change → tissue effect → systemic consequence. Then `###` subsections per major pathway, written in real, confident prose — willing to correct overreach *inline* ("The Akt finding should remain context-specific...") rather than saving all the hedging for a caveats section at the end.

**5. One genuine non-obvious insight**
Not a mechanism recap — an editorial angle that adds real reasoning value (TB-500's was "why old injuries may be especially interesting"). Earn this one if the biology supports it. Skip it rather than force a weak one.

**6. Practical dosing/cycling logic**
State the popular/practical claim → note plainly if it lacks a real source (most will) → give "the more defensible statement" as the fallback → list practical patterns as patterns, explicitly labeled convention, not validated protocol.

**7. What to expect and monitor** — Early / Building / Longer term subsections.

**8. Common mistakes** — numbered list of real practical errors. Not a restatement of the cautions section.

**9. Synergy**
One `###` subsection per compound it actually pairs with in the app's roster, each tagged "[Role A] + [Role B]." State plainly whether a pairing is mechanistic complementarity or something with actual combined-use evidence — don't blur the two.

**10. [Highest-stakes open question] nuance**
Honest, mechanism-based, doesn't overclaim in either direction. Explicitly separates contexts that get conflated (fragment vs. whole molecule, existing disease vs. healthy tissue, intracellular vs. exogenous exposure — whatever applies).

**11. What They're Not Telling You**
The differentiator section. Contrarian-but-defensible reframes against oversimplified narratives everyone else repeats. Bold framing, never bold fabrication — every line here still has to survive the evidence-boundary rules from section 3.

**12. Source synthesis**
Documents which internal sources/conversations shaped the doc, and how claims were retained, narrowed, or relabeled by evidence tier. This is the audit trail.
**New requirement, added after the BPC-157 citation audit:** this section must state plainly whether a PubMed-verification pass has been completed on the doc's mechanism claims, and if not, say so explicitly rather than silently omitting it. "PubMed-verification pass: complete" or "PubMed-verification pass: not yet done."

**13. Regulatory note** — one line, bottom of the document, never the frame.

---

## Retrofit queue

**BPC-157_Compound_Research.md** (predates this template):
- Add Executive identity + construction-model cross-reference (role = foreman, already established from TB-500's side — just needs the reciprocal entry)
- Add Common mistakes
- Add What They're Not Telling You
- Convert the References list into a Source synthesis section — keep the PMIDs, but frame it as the audit trail and mark "PubMed-verification pass: complete"

**TB-500 / GHK-Cu / MOTS-c** (have the full structure, no verification pass yet):
- Add "PubMed-verification pass: not yet done" to each Source synthesis section until each gets the same citation audit BPC-157 went through — same treatment, not urgent, just marked honestly until it happens
