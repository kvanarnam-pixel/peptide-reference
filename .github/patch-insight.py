"""Relocate One genuine non-obvious insight into Tier 1. Content-only; no cache bump."""
from pathlib import Path

root = Path("research")

# --- template ---
tpl = root / "_TEMPLATE.md"
tt = tpl.read_text()
old = """**9. What They're Not Telling You**
The differentiator section — outside-the-trial pass, practitioner/community observations that survive the biology check. Contrarian-but-defensible reframes against oversimplified narratives everyone else repeats. Bold framing, never bold fabrication — every line here still has to survive the evidence-boundary rules from section 11.

### — Technical Deep Dive divider —

### TIER 2 — Technical (renders below the divider)

**10. Executive identity**"""
new = """**9. What They're Not Telling You**
The differentiator section — outside-the-trial pass, practitioner/community observations that survive the biology check. Contrarian-but-defensible reframes against oversimplified narratives everyone else repeats. Bold framing, never bold fabrication — every line here still has to survive the evidence-boundary rules from section 11.

**10. One genuine non-obvious insight**
Moved into Tier 1, locked 2026-08-25 — this section renders live, so it follows the same Tier 1 voice rules as every other section above the divider: no PMIDs, no DOIs, no author-name mentions, no trial names, no phase/arm labels, no formal evidence-tier words stated as such. Not a mechanism recap — a capstone that ties the specific findings in \"What They're Not Telling You\" into one bigger reframe. It's the single best editorial idea in the doc, positioned last in Tier 1 so the reader lands on it after the specifics, not before them. Earn this one if the biology supports it; skip it rather than force a weak one.

### — Technical Deep Dive divider —

### TIER 2 — Technical (renders below the divider)

**11. Executive identity**"""
if old not in tt:
    raise SystemExit("template block 1 FIND not found")
tt = tt.replace(old, new, 1)
tt = tt.replace("**11. Identity and evidence boundary**", "**12. Identity and evidence boundary**", 1)
tt = tt.replace("**12. Core biological cascade**", "**13. Core biological cascade**", 1)
old13 = """**13. One genuine non-obvious insight**
Not a mechanism recap — an editorial angle that adds real reasoning value. Earn this one if the biology supports it. Skip it rather than force a weak one.

**14. Source synthesis**"""
new13 = """**14. Source synthesis**"""
if old13 not in tt:
    raise SystemExit("template old insight FIND not found")
tt = tt.replace(old13, new13, 1)
tpl.write_text(tt)

# --- NAD+ ---
nad = root / "NAD+_Compound_Research.md"
nt = nad.read_text()
old = '''**use it where the bottleneck actually is.**
---

*— Everything below this line is the technical deep dive: mechanism, audit trail, and evidence sourcing. Not written to be read aloud. —*'''
new = '''**use it where the bottleneck actually is.**

## One genuine non-obvious insight

NAD availability can be **downstream** of mitochondrial dysfunction as well as upstream of it. If the bottleneck is membrane damage, substrate, anemia, sleep, inflammation, or mitochondrial *quantity*, pouring carrier on the problem can look like "NAD+ didn't work" when the wrong job was hired. That is why this card pairs conceptually with MOTS-c and SS-31 without collapsing the three into "mitochondrial boosters."

---

*— Everything below this line is the technical deep dive: mechanism, audit trail, and evidence sourcing. Not written to be read aloud. —*'''
if old not in nt:
    raise SystemExit("NAD insert FIND not found")
nt = nt.replace(old, new, 1)
old = '''Injected NAD+ meets ectoenzymes before it is "inside" in the way people imagine. Mitochondrial NAD+ import in mammalian cells depends on the inner-membrane carrier SLC25A51 ([PMID 32906142](https://pubmed.ncbi.nlm.nih.gov/32906142/), Luongo et al., *Nature* 2020). Direct injection is not immediate intact mitochondrial delivery. This is STRONG cell biology applied to a use-case with LIMITED human SC data.

## One genuine non-obvious insight

NAD availability can be **downstream** of mitochondrial dysfunction as well as upstream of it. If the bottleneck is membrane damage, substrate, anemia, sleep, inflammation, or mitochondrial *quantity*, pouring carrier on the problem can look like "NAD+ didn't work" when the wrong job was hired. That is why this card pairs conceptually with MOTS-c and SS-31 without collapsing the three into "mitochondrial boosters."

## Source synthesis'''
new = '''Injected NAD+ meets ectoenzymes before it is "inside" in the way people imagine. Mitochondrial NAD+ import in mammalian cells depends on the inner-membrane carrier SLC25A51 ([PMID 32906142](https://pubmed.ncbi.nlm.nih.gov/32906142/), Luongo et al., *Nature* 2020). Direct injection is not immediate intact mitochondrial delivery. This is STRONG cell biology applied to a use-case with LIMITED human SC data.

## Source synthesis'''
if old not in nt:
    raise SystemExit("NAD delete FIND not found")
nt = nt.replace(old, new, 1)
nad.write_text(nt)

# --- BPC-157 ---
bpc = root / "BPC-157_Compound_Research.md"
bt = bpc.read_text()
old = '''**Most of the extraordinary claims about this compound — heart, brain, spinal cord, kidney — are still animal claims.** They're not fabricated or dismissible, but they're not demonstrated human benefits either. Animal research tells us where to look. It doesn't automatically tell us what happens in a person.

---

*Everything below this line is the technical deep dive: mechanism, audit trail, and evidence sourcing. Not written to be read aloud.*'''
new = '''**Most of the extraordinary claims about this compound — heart, brain, spinal cord, kidney — are still animal claims.** They're not fabricated or dismissible, but they're not demonstrated human benefits either. Animal research tells us where to look. It doesn't automatically tell us what happens in a person.

## One genuine non-obvious insight

The most careful head-to-head comparison run so far isn't the headline everyone quotes — "no added benefit from combining them." The more interesting detail buried in that same comparison: TB-500 alone hit a real, measurable strength improvement that BPC-157 alone didn't, even though BPC-157 has the older and more repeated healing literature behind it. This is one comparison, not yet repeated elsewhere — worth knowing before treating it as settled.

That's not evidence BPC-157 doesn't work — the older studies used different doses, timelines, and injury setups. But it's a useful check on assuming "the foreman coordinates the job, so the foreman must be doing the most work." The compound that gets the crew moving and the compound that determines how much tissue actually rebuilds may not carry equal weight — and this is the first careful side-by-side test of that assumption, not proof it was always true.

---

*Everything below this line is the technical deep dive: mechanism, audit trail, and evidence sourcing. Not written to be read aloud.*'''
if old not in bt:
    raise SystemExit("BPC insert FIND not found")
bt = bt.replace(old, new, 1)
old = '''BPC-157 behaves as a pleiotropic modulator rather than a classic receptor agonist. This is precisely why cycling arguments built on receptor desensitization don't have a target to point to — there's no receptor on record to desensitize.

## One genuine non-obvious insight

The most rigorous head-to-head test run so far (the 2026 BPC-157/TB-500 Achilles combination study — one study, not yet replicated) is quietly the most important data point in this file, and not for the reason it gets cited — the "no additive benefit from combining them" headline. The more interesting detail is that in that same study, TB-500 alone reached statistical significance on biomechanical strength while BPC-157 alone did not, despite BPC-157 having the older and more repeated tendon-repair literature behind it.

That's not evidence BPC-157 doesn't work — the older Achilles studies used different doses, timelines, and injury models. But it's a useful check on treating "foreman coordinates, therefore foreman is the intervention with the biggest effect" as automatically true. In a repair job, the compound that gets the crew moving and the compound that determines how much tissue rebuilds may not carry equal weight, and the newest, best-controlled study is a reminder that assumption hasn't actually been tested until now.

## Source synthesis'''
new = '''BPC-157 behaves as a pleiotropic modulator rather than a classic receptor agonist. This is precisely why cycling arguments built on receptor desensitization don't have a target to point to — there's no receptor on record to desensitize.

## Source synthesis'''
if old not in bt:
    raise SystemExit("BPC delete FIND not found")
bt = bt.replace(old, new, 1)
bpc.write_text(bt)

# --- ARA-290 ---
ara = root / "ARA-290_Compound_Research.md"
at = ara.read_text()
old = '''It is also why "it didn't finish by day 28" is a weak reason to call the course a failure.

---

*— Everything below this line is the technical deep dive: mechanism, audit trail, and evidence sourcing. Not written to be read aloud. —*'''
new = '''It is also why "it didn't finish by day 28" is a weak reason to call the course a failure.

## One genuine non-obvious insight

The useful model is not "ARA-290 heals nerves" or "ARA-290 is just an analgesic."
It is **repair rate versus damage rate.**
The molecule can turn on a local protective/recovery program. Human 28-day trials show that program can move both symptoms and small-fiber surrogates in selected populations. They do not measure what happens when the original injury (hyperglycemia, ongoing inflammation, compression) keeps arriving every day after the protocol ends. If damage rate stays higher than repair rate, a real signal can still look like "it didn't work." That is a systems question those studies were not built to answer — and it is the question that changes how someone should use the 28-day result in real life.

---

*— Everything below this line is the technical deep dive: mechanism, audit trail, and evidence sourcing. Not written to be read aloud. —*'''
if old not in at:
    raise SystemExit("ARA insert FIND not found")
at = at.replace(old, new, 1)
old = '''- Automatic conversion of corneal CNFA into "this regrows every peripheral nerve."

## One genuine non-obvious insight

The useful model is not "ARA-290 heals nerves" or "ARA-290 is just an analgesic."
It is **repair rate versus damage rate.**
The molecule can turn on a local protective/recovery program. Human 28-day trials show that program can move both symptoms and small-fiber surrogates in selected populations. They do not measure what happens when the original injury (hyperglycemia, ongoing inflammation, compression) keeps arriving every day after the protocol ends. If damage rate stays higher than repair rate, a real signal can still look like "it didn't work." That is a systems question the RCTs were not built to answer — and it is the question that changes how someone should use the 28-day result in real life.

## Source synthesis'''
new = '''- Automatic conversion of corneal CNFA into "this regrows every peripheral nerve."

## Source synthesis'''
if old not in at:
    raise SystemExit("ARA delete FIND not found")
at = at.replace(old, new, 1)
ara.write_text(at)

# --- MOTS-c ---
mots = root / "MOTS-c_Compound_Research.md"
mt = mots.read_text()
old = '''**Fading after stopping isn't automatically failure.** If MOTS-c behaves like a training signal, some fade when the signal disappears isn't surprising. The useful question isn't "how long do I have to stay off" — it's how much of the adaptation your body actually kept after the signal stopped.

---

*Everything below this line is the technical deep dive: mechanism, audit trail, and evidence sourcing. Not written to be read aloud.*'''
new = '''**Fading after stopping isn't automatically failure.** If MOTS-c behaves like a training signal, some fade when the signal disappears isn't surprising. The useful question isn't "how long do I have to stay off" — it's how much of the adaptation your body actually kept after the signal stopped.

## One genuine non-obvious insight

MOTS-c may expose mitochondrial capacity as much as it improves it. AMPK is an energy-stress response system — if MOTS-c increases adaptive demand in a system with adequate reserve, function may improve. If downstream machinery, fuel, redox handling, or recovery can't keep up, that increased demand may expose the limiting step as fatigue or reduced function instead. This is an interpretive response framework, not a diagnostic test for mitochondrial dysfunction — it should never be presented as one.

---

*Everything below this line is the technical deep dive: mechanism, audit trail, and evidence sourcing. Not written to be read aloud.*'''
if old not in mt:
    raise SystemExit("MOTS insert FIND not found")
mt = mt.replace(old, new, 1)
old = '''Yin et al. 2024 is ovarian-cancer-specific. General AMPK/mTOR tumor-suppression biology is a separate, broader frame. Do not cite "Oncogene 2020" — it does not exist. Do not convert one ovarian-cancer paper into a MOTS-c oncology claim.

## One genuine non-obvious insight

MOTS-c may expose mitochondrial capacity as much as it improves it. AMPK is an energy-stress response system — if MOTS-c increases adaptive demand in a system with adequate reserve, function may improve. If downstream machinery, fuel, redox handling, or recovery can't keep up, that increased demand may expose the limiting step as fatigue or reduced function instead. This is an interpretive response framework, not a diagnostic test for mitochondrial dysfunction — it should never be presented as one.

## Source synthesis'''
new = '''Yin et al. 2024 is ovarian-cancer-specific. General AMPK/mTOR tumor-suppression biology is a separate, broader frame. Do not cite "Oncogene 2020" — it does not exist. Do not convert one ovarian-cancer paper into a MOTS-c oncology claim.

## Source synthesis'''
if old not in mt:
    raise SystemExit("MOTS delete FIND not found")
mt = mt.replace(old, new, 1)
mots.write_text(mt)

# --- KPV ---
kpv = root / "KPV_Compound_Research.md"
kt = kpv.read_text()
old = '''Worth knowing before assuming KPV is a complete stand-in for anything α-MSH-related, in every tissue.

### — Technical Deep Dive divider —'''
new = '''Worth knowing before assuming KPV is a complete stand-in for anything α-MSH-related, in every tissue.

## One genuine non-obvious insight

KPV's most useful role may not be "anti-inflammatory compound" so much as **interference removal for whatever else is trying to work**. It doesn't rebuild tissue, doesn't supply energy, and doesn't have a receptor to reset — its job is narrowly to stop excessive inflammatory signaling from jamming the systems that do those other jobs. That reframes the MOTS-c/SS-31 pairing logic: it isn't "more support compounds stacked together," it's one compound clearing interference out of the inflammation↔mitochondrial-dysfunction feedback loop so the other two can do what they're actually built for. Judged as a standalone healing agent, KPV is easy to underrate. Judged as environmental cleanup for everything else on the site, its narrow mechanism is the point, not a limitation.

### — Technical Deep Dive divider —'''
if old not in kt:
    raise SystemExit("KPV insert FIND not found")
kt = kt.replace(old, new, 1)
old = '''This supplies a mechanistic basis for complementarity with MOTS-c and/or SS-31. It remains mechanistic complementarity unless direct combined-use evidence appears.

## One genuine non-obvious insight

KPV's most useful role may not be "anti-inflammatory compound" so much as **interference removal for whatever else is trying to work**. It doesn't rebuild tissue, doesn't supply energy, and doesn't have a receptor to reset — its job is narrowly to stop excessive inflammatory signaling from jamming the systems that do those other jobs. That reframes the MOTS-c/SS-31 pairing logic: it isn't "more support compounds stacked together," it's one compound clearing interference out of the inflammation↔mitochondrial-dysfunction feedback loop so the other two can do what they're actually built for. Judged as a standalone healing agent, KPV is easy to underrate. Judged as environmental cleanup for everything else on the site, its narrow mechanism is the point, not a limitation.

## Source synthesis'''
new = '''This supplies a mechanistic basis for complementarity with MOTS-c and/or SS-31. It remains mechanistic complementarity unless direct combined-use evidence appears.

## Source synthesis'''
if old not in kt:
    raise SystemExit("KPV delete FIND not found")
kt = kt.replace(old, new, 1)
kpv.write_text(kt)

print("patched")
