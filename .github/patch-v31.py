from pathlib import Path

research = Path("research/BPC-157_Compound_Research.md")
text = research.read_text()

common_mistakes = """## Common mistakes

1. Treating the organ-system list (cardiac, stroke, spinal cord, bone, kidney, lungs) as established human outcomes. Almost all of it is rodent/preclinical work, concentrated in one research group.
2. Downplaying the cancer caution as a footnote. It shares the exact angiogenesis mechanism responsible for every benefit above — it gets equal visual weight to Bottom Line for a reason.
3. Assuming oral BPC-157 works the same as injectable. Oral is a gut-local argument (the peptide survives gastric juice); systemic oral absorption has not been characterized.
4. Treating the 4–6 week on/off cycle as biological necessity. No receptor has been identified to desensitize — the shorter community cycle is cost/caution convention, not a required reset.
5. Pushing dose past 1 mg/day expecting proportionally more repair. BPC-157 is a cascade initiator, not a linear agonist — tissue capacity, not peptide amount, becomes the bottleneck.
6. Treating the trial-derived number (~100–110 mcg/day) and the practical range (250 mcg–1 mg/day) as competing claims rather than two different, intentionally-documented things — one scaled from rodent mg/kg math, one from empirical human convention.
7. Expecting BPC-157 to supply the raw materials of repair. It coordinates the rebuild; it is not the collagen, protein, or cofactors that materials come from.
8. Treating BPC-157 and TB-500 as redundant. Non-overlapping mechanisms — local coordination vs. systemic mobilization — not two versions of the same peptide.

"""

if "## Common mistakes" not in text:
    needle = "## What They're Not Telling You"
    if needle not in text:
        raise SystemExit("What They're Not Telling You heading not found")
    text = text.replace(needle, common_mistakes + needle, 1)

old_sources_start = "## Sources (12, verified August 2026)"
new_sources = """## Source synthesis

**PubMed-verification pass: complete (August 2026).**

1. Gwyer D, Wragg NM, Wilson SL. Gastric pentadecapeptide body protection compound BPC 157 and its role in accelerating musculoskeletal soft tissue healing. *Cell Tissue Res.* 2019. doi:10.1007/s00441-019-03016-8 — general mechanism review; source for the pleiotropic-modulator framing and the absence of an identified high-affinity receptor.
2. Józwiak M, et al. *Pharmaceuticals.* 2025;18(2):185. doi:10.3390/ph18020185 — recent synthesis source, general mechanism/safety overview.
3. Chang CH, Tsai WC, Lin MS, Hsu YH, Pang JHS. The promoting effect of pentadecapeptide BPC 157 on tendon healing involves tendon outgrowth, cell survival, and cell migration. *J Appl Physiol.* 2011;110(3):774-780. doi:10.1152/japplphysiol.00945.2010 — primary source for the tendon fibroblast-outgrowth finding, the strongest and most independently replicated organ-system claim.
4. Chang CH, Tsai WC, Hsu YH, Pang JHS. Pentadecapeptide BPC 157 enhances the growth hormone receptor expression in tendon fibroblasts. *Molecules.* 2014. PMC6271067 — corroborating tendon-repair mechanism, independent replication of the Sikiric/Zagreb concentration named in Evidence layers, above.
5. Hsieh MJ, et al. Therapeutic potential of pro-angiogenic BPC 157 is associated with VEGFR2 activation and internalization. *Angiogenesis.* 2017. PMID:27847966 — primary source for the VEGFR2-internalization step of the core cascade.
6. Hsieh MJ, et al. Modulatory effects of BPC 157 on vasomotor tone and the activation of Src-Caveolin-1-eNOS pathway. *Sci Rep.* 2020. doi:10.1038/s41598-020-74022-y — primary source for the Src-Caveolin-1-eNOS step of the core cascade.
7. Perovic D, Kolenc D, Bilic V, et al. Stable gastric pentadecapeptide BPC 157 can improve the healing course of spinal cord injury and lead to functional recovery in rats. *J Orthop Surg Res.* 2019;14:199. doi:10.1186/s13018-019-1242-6 — source for the spinal-cord compression/spasticity-resolution claim. Rodent model.
8. Gjurasin M, et al. Pentadecapeptide BPC 157 enhances sciatic nerve recovery. *Regul Pept.* 2010;160(1-3):33-41 — source for the nerve-cut healing claim. Rodent model, older/smaller study.
9. Sikiric P, et al. Novel cytoprotective mediator, stable gastric pentadecapeptide BPC 157: vascular recruitment and counteraction of cachexia. *Gut Liver.* doi:10.5009/gnl18490 — source for the gut/vascular-recruitment mechanism; representative of the dominant Sikiric/Zagreb research concentration named in Evidence layers, above.
10. World Anti-Doping Agency. Prohibited List. S0 Non-Approved Substances. — regulatory source, WADA prohibition status.
11. U.S. FDA. Bulk drug substances nominated for use in compounding under section 503A — Category 2 (BPC-157). 2023. — regulatory source, 503A category status.
12. U.S. FDA Pharmacy Compounding Advisory Committee. July 23–24, 2026 meeting. BPC-157 recommended 8–6–1 for the 503A Bulks List; recommendation is nonbinding pending FDA acceptance and rulemaking. — regulatory source, most recent status update.

Primary project sources also reviewed: KVA BPC-157 Mechanism Deep Dive (Aug 2026), BPC157_Research_Extraction_OrganSystems.md, Peptide Educational Master Reference v2, and the live Retatrutide card's field/structure template.
"""

if old_sources_start in text:
    start = text.index(old_sources_start)
    text = text[:start] + new_sources
    if not text.endswith("\n"):
        text += "\n"
elif "## Source synthesis" not in text:
    raise SystemExit("neither old Sources heading nor Source synthesis found")

research.write_text(text)

idx = Path("index.html")
html = idx.read_text()
if "?v=30" not in html:
    raise SystemExit("no ?v=30 in index.html")
idx.write_text(html.replace("?v=30", "?v=31"))

sw = Path("service-worker.js")
swt = sw.read_text()
if "peptide-reference-v30" not in swt:
    raise SystemExit("v30 cache name not found")
sw.write_text(swt.replace("peptide-reference-v30", "peptide-reference-v31", 1))

print("patched")
print("common mistakes", "## Common mistakes" in research.read_text())
print("source synthesis", "## Source synthesis" in research.read_text())
