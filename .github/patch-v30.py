from pathlib import Path

app = Path("app.js")
text = app.read_text()
old = '    if (p.dose && typeof p.dose !== "string") {'
new = '    if (p.dose && typeof p.dose !== "string" && !CHIP_REGISTRY[id]) {'
if old not in text:
    raise SystemExit("app.js overlay line not found")
app.write_text(text.replace(old, new, 1))

idx = Path("index.html")
html = idx.read_text()
if "?v=29" not in html:
    raise SystemExit("no ?v=29 in index.html")
idx.write_text(html.replace("?v=29", "?v=30"))

sw = Path("service-worker.js")
swt = sw.read_text()
if "peptide-reference-v29" not in swt:
    raise SystemExit("v29 cache name not found")
sw.write_text(swt.replace("peptide-reference-v29", "peptide-reference-v30", 1))
print("patched")
