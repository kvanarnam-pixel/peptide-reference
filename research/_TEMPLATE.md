# Compound Research — Structural Template & Rules
*Reference implementation: TB-500_Compound_Research.md. Every new compound doc follows this section order. Section names can adapt to the compound (e.g. "Cancer-mechanism nuance" only if cancer is the actual highest-stakes open question) — the ROLE each section plays is what's fixed.*

---

## Required section order

**Architecture, locked 2026-08-25:** Go Deeper is a three-level information hierarchy, not a flat accordion. Front card = quick answer. Top of Go Deeper (Tier 1, below) = conversation-ready explanation — what you'd actually say out loud mid-conversation, in plain language. Bottom of Go Deeper (Tier 2, below the "Technical Deep Dive" divider) = mechanism and audit trail — nobody reads this live. Rule: every front-card chip must have a corresponding Tier 1 section. The chip is the short answer; the Tier 1 section is the usable explanation; Tier 2 is the proof.

**Tier 1 voice rules, locked 2026-08-25:** Tier 1 is the script, not a summary of the research — Tracie needs to know what to say, not why it's true. Zero research apparatus belongs anywhere in Tier 1, top or bottom of a section: no PMIDs, no DOIs, no author-name mentions (even bare ones like "Smith et al." with no number attached), no trial names, no phase/arm labels ("Phase 2," "the 12 mg arm"), and no formal evidence-tier words (STRONG / MODERATE / LIMITED / VERY LIMITED-UNESTABLISHED / PRACTITIONER-COMMUNITY CONVENTION / INTERPRETIVE) stated as such. If a section genuinely needs to flag that something is convention rather than proven, or interpretation rather than established fact, say so in plain English as a short note trailing the *bottom* of that section — never woven into the conversational opening, and never in taxonomy vocabulary even when set apart from the rest. A Tier 1 section pointing toward "more in the technical section below" is expected, not a violation — that's the intended pattern: lead with the plain answer, and if someone pushes back and wants receipts, know exactly where on the page to go get them. Section headers should be customized to the compound rather than forced into the literal generic wording shown below (e.g. "Lean mass under a triple agonist — highest-stakes open question nuance" beats the generic "Highest-stakes open question nuance") — specificity beats template-literalism. Everything stripped from Tier 1 under this rule — citations, formal tiers, trial names, arm-level data — belongs in Tier 2 without restriction; that's what makes Tier 2 the audit trail.

**1. Title** — `# [Compound] Compound Research`

### TIER 1 — Conversation-ready (renders above the Technical Deep Dive divider)

**2. What Happens After You Take It**
Starts / one dose / builds / notice / judge it. The most natural face-to-face question there is — lead with it.

**3. [Highest-stakes open question] nuance**
Moved up from the technical tier deliberately — this is the dinner-table pushback question ("isn't this the one that causes X"), and it needs to be answerable in plain language before someone gets asked it, not buried under mechanism. Honest, mechanism-based, doesn't overclaim in either direction. Explicitly separates contexts that get conflated (fragment vs. whole molecule, existing disease vs. healthy tissue, intracellular vs. exogenous exposure — whatever applies). Keep the plain-language version here; if it needs deeper mechanistic backing, that goes in Core biological cascade (Tier 2), cross-referenced.

**4. Dose / Route / Timing / Duration**
Expands the front-card dose/timing/cycling chips into full answers to the follow-up questions someone would actually ask. This is the plainspoken half of what used to be "Practical dosing/cycling logic" — state the practical pattern in usable language. The evidence-tiering caveat (trial-derived vs. practitioner-sourced vs. convention, "lacks a real source" framing) belongs in Identity and evidence boundary (Tier 2), not here — don't let the hedging leak into the conversational answer.

**5. What to Expect + Watch For**
Early / Building / Longer term subsections (absorbed from the old "What to expect and monitor"), plus what it feels like, common practical quirks, and what means "reassess." **Also absorbs Common mistakes** — fold real practical errors in here as part of the same plainspoken section rather than a separate numbered list.

**6. How Do I Know It's Working?**
The plainspoken half of what used to be "Response-guided dosing framework": what to track, what a meaningful response looks like, what "not working" means (a hold-and-reassess signal, never reflexively reframed as the compound "doing its job"). The evidence-sourcing statement (trial-derived / practitioner-sourced / this reference's own inference) belongs in Identity and evidence boundary (Tier 2), not here.

**7. What to Take Alongside**
New section. Substrate/cofactor support and any important companion logic — this is where the front-card "Take Alongside" chip gets its full, sourced explanation. This section resolves the previously-flagged debt item (unsourced supplement-stack chips on TB-500/GHK-Cu/MOTS-c): when built or retrofitted, it must carry the same evidence-tier sourcing as every other claim in the doc, not ship as an unsourced holdover.

**8. Pairs Well With / Synergy**
One `###` subsection per compound it actually pairs with in the app's roster, each tagged "[Role A] + [Role B]." State plainly whether a pairing is mechanistic complementarity or something with actual combined-use evidence — don't blur the two.

**9. What They're Not Telling You**
The differentiator section — outside-the-trial pass, practitioner/community observations that survive the biology check. Contrarian-but-defensible reframes against oversimplified narratives everyone else repeats. Bold framing, never bold fabrication — every line here still has to survive the evidence-boundary rules from section 11.

**10. One genuine non-obvious insight**
Moved into Tier 1, locked 2026-08-25 — this section renders live, so it follows the same Tier 1 voice rules as every other section above the divider: no PMIDs, no DOIs, no author-name mentions, no trial names, no phase/arm labels, no formal evidence-tier words stated as such. Not a mechanism recap — a capstone that ties the specific findings in "What They're Not Telling You" into one bigger reframe. It's the single best editorial idea in the doc, positioned last in Tier 1 so the reader lands on it after the specifics, not before them. Earn this one if the biology supports it; skip it rather than force a weak one.

### — Technical Deep Dive divider —

### TIER 2 — Technical (renders below the divider)

**11. Executive identity**
Kept as a brief orientation opener, not cut — even though it's largely a recap of the front card. One bolded sentence stating what the compound fundamentally IS/does, in the construction-crew metaphor. Followed by the **Construction model** list — a living registry, not a one-off: every compound already built keeps its role tag here, and the new compound's role gets added. Update this list in every doc whenever a new compound joins the roster.
Current roster: BPC-157 = foreman · TB-500 = scaffolding/access crew · GHK-Cu = materials/blueprints · MOTS-c = power plant · Retatrutide = logistics manager · SS-31 = wiring & grid-stabilization crew · ARA-290 = Data Signal Repair · KPV = Site Safety Coordinator · NAD+ = rechargeable power carrier.

**12. Identity and evidence boundary**
Name this compound's specific evidence complication up front — whatever it actually is (fragment vs. parent molecule for TB-500; trial-scaled vs. practical dose and single-lab-dominance for BPC-157; something else for the next one). Lay out the evidence layers that matter for *this* compound. Close with a governing maxim, e.g. "Mechanism earns inclusion; evidence type determines wording." **This is also where the dose-evidence and response-framework evidence-sourcing detail lands** — the "trial-derived vs. practitioner-sourced vs. convention" caveat language that used to live inline in sections 6/7 of the old flat order now lives here as subsections, keeping Tier 1's Dose/Route/Timing/Duration and How Do I Know It's Working? sections clean of hedging language. (Documented default — revisit if a compound's evidence picture doesn't fit cleanly as a subsection here.)

**13. Core biological cascade**
One bolded arrow-chain: molecule → target → cellular change → tissue effect → systemic consequence. Then `###` subsections per major pathway — receptor/transporter/enzyme detail, mechanistic nuance — written in real, confident prose, willing to correct overreach *inline* rather than saving all the hedging for a caveats section at the end.

**14. Source synthesis**
Documents which internal sources/conversations shaped the doc, and how claims were retained, narrowed, or relabeled by evidence tier. This is the audit trail, including PubMed/DOI references. Must state plainly whether a PubMed-verification pass has been completed on the doc's mechanism claims: "PubMed-verification pass: complete" or "PubMed-verification pass: not yet done."

**15. Regulatory note** — one line, bottom of the document, never the frame.

---

## Retrofit queue

**TB-500** (structurally retrofitted, verification pass partial):
- Its own Source synthesis already documents this precisely: several mechanism claims (satellite-cell/NMJ, nerve-repair/Schwann-cell, broader angiogenesis/VEGF) remain unverified against PubMed. GHK-Cu and MOTS-c's citation-verification passes are already complete per their own Source synthesis sections — no longer queue items.

**GHK-Cu and SS-31** (predate the tier-architecture lock, added 2026-08-25 — the only two docs still pending):
- Seven docs — NAD+, BPC-157, ARA-290, MOTS-c, KPV, Retatrutide, and TB-500 — have been reordered into Tier 1 (conversational) / Tier 2 (technical), including the literal "### — Technical Deep Dive divider —" line the renderer requires. GHK-Cu and SS-31 are the two still using the old flat section order and still need the real content-splitting work — not a pure reorder, since the old "Practical dosing/cycling logic" and "Response-guided dosing framework" sections each contain both a plainspoken answer and evidence-tiering caveat language that need to separate into a Tier 1 section and a Tier 2 subsection. "What to Take Alongside" is new content for both, not a move — it doesn't exist in either doc yet, and directly absorbs the unsourced-supplement-chip debt already logged for both compounds. Build the divider line into the file from the start rather than adding it after, since six other docs needed a follow-up patch specifically because it was skipped the first time. Do one doc at a time, with a full independent verification before moving to the next.


