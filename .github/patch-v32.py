from pathlib import Path

app = Path("app.js")
text = app.read_text()

edits = [
    (
        '{ key: "dose", label: "Dose", value: "1–2mg SQ", detail: `<p>Most protocols start around 1 milligram a day for the first couple weeks, step up to 2 milligrams, then settle into 1 to 2 milligrams two or three times a week for maintenance. This whole ladder is practitioner convention — there\'s no controlled human dosing trial behind injectable GHK-Cu at any amount.</p>` },',
        '{ key: "dose", label: "Dose", value: "1–2mg SQ", detail: `<p>Most protocols start around 1 milligram a day for the first couple weeks, step up to 2 milligrams, then settle into 1 to 2 milligrams two or three times a week for maintenance. This whole ladder is practitioner convention — there\'s no controlled human dosing trial behind injectable GHK-Cu at any amount.</p><p>Worth knowing: the researcher most of this convention traces back to actually estimated you\'d need something like 100 to 200 milligrams for a real systemic effect — 50 to 100 times what people actually use. That\'s not a suggestion to go anywhere near that number. It just means the low end isn\'t validated either — it\'s a conservative starting point, not a tested minimum.</p>` },',
    ),
    (
        '{ key: "cycling", label: "Cycling", value: "4–8wks on/2–4 off", detail: `<p>If you\'re injecting it, cycle 4 to 8 weeks on with 2 to 4 off — that\'s more about managing copper load than any receptor getting worn out, since no receptor\'s been identified here. Topical use can run continuously for 8 to 12 weeks since barely any of it gets into your bloodstream through skin.</p>` },',
        '{ key: "cycling", label: "Cycling", value: "4–12wks on/2–4 off", detail: `<p>If you\'re injecting it, cycle 4 to 12 weeks on with 2 to 4 off — that\'s more about managing copper load than any receptor getting worn out, since no receptor\'s been identified here. Topical use can run continuously for 8 to 12 weeks since barely any of it gets into your bloodstream through skin.</p>` },',
    ),
    (
        '{ key: "timing", label: "Timing", value: "Fasted", detail: `<p>Take it fasted. And since the downstream mitochondrial work outlasts how long the peptide is actually in your blood, dosing more often than this isn\'t automatically doing more.</p>` },',
        '{ key: "timing", label: "Timing", value: "Anytime", detail: `<p>Time of day doesn\'t appear to matter here — that\'s not something the source material actually addresses either way. What does matter: the downstream mitochondrial work outlasts how long the peptide is actually in your blood, so dosing more often than the working schedule isn\'t automatically doing more.</p>` },',
    ),
]
for i, (old, new) in enumerate(edits, 1):
    if old not in text:
        raise SystemExit(f"app.js edit {i} FIND not found")
    text = text.replace(old, new, 1)
app.write_text(text)

md_path = Path("research/GHK-Cu_Compound_Research.md")
md = md_path.read_text()
old_md = 'Injectable use bypasses that safety margin, and nobody has run the multi-year copper/ceruloplasmin monitoring study needed to know how "on 8–12 weeks / off 2–4 weeks, repeated for years" actually behaves in a human liver and kidney.'
new_md = 'Injectable use bypasses that safety margin, and nobody has run the multi-year copper/ceruloplasmin monitoring study needed to know how "on 4–12 weeks / off 2–4 weeks, repeated for years" actually behaves in a human liver and kidney.'
if old_md not in md:
    raise SystemExit("GHK-Cu research FIND not found")
md_path.write_text(md.replace(old_md, new_md, 1))

idx = Path("index.html")
html = idx.read_text()
if "?v=31" not in html:
    raise SystemExit("no ?v=31 in index.html")
idx.write_text(html.replace("?v=31", "?v=32"))

sw = Path("service-worker.js")
swt = sw.read_text()
if "peptide-reference-v31" not in swt:
    raise SystemExit("v31 cache name not found")
sw.write_text(swt.replace("peptide-reference-v31", "peptide-reference-v32", 1))
print("patched")
