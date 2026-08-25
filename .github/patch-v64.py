from pathlib import Path

app = Path("app.js")
text = app.read_text()
start = text.find("const KPV_CHIPS = [")
if start < 0:
    start = text.find("  const KPV_CHIPS = [")
end = text.find("  const SS31_CHIPS = [")
if start < 0 or end < 0 or end <= start:
    raise SystemExit("KPV_CHIPS block not found")
if start > 0 and text[start - 1] == "\n":
    start -= 1
    if start > 0 and text[start - 1] == "\n":
        start -= 1

new_block = r'''
  const KPV_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "200–500mcg, 1–2x/day", detail: `<p>A common practical range is 200 to 500 micrograms per dose, once or twice a day. There's no validated human dose-response curve telling us where "low," "therapeutic," and "high" actually begin — these are practical-convention numbers, not clinical precision.</p>` },
      { key: "timing", label: "Timing", value: "Anytime, stay consistent", detail: `<p>No good evidence KPV needs a particular time of day. Consistency matters more than chasing a special clock.</p>` },
      { key: "cycling", label: "Cycling", value: "Job-driven, not calendar", detail: `<p>A practical 8–12 week evaluation window is reasonable, but there's no convincing reason to say KPV's receptors need an arbitrary reset — it doesn't work through a receptor that gets worn out. A break is more useful as a checkpoint: did the improvement hold, did the problem come back, is the original trigger still there, does KPV still have a job to do?</p>` },
      { key: "expect", label: "What to expect", value: "Calmer, not felt", detail: `<p>This usually isn't something you feel kick in. The first useful clue is the problem gradually getting less angry and reactive — fewer flare-ups, less irritation, easier normal function. Don't judge it by the injection; judge it by whether the problem is actually calming down.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Quiet the alarm, not the fire", detail: `<p>The biggest mistake isn't some exotic side effect — it's using KPV to quiet symptoms while whatever's actually driving the inflammation (blood sugar, infection, ongoing irritation, an allergen) keeps running. Quieter isn't automatically healthier. Function still matters.</p>` },
      { key: "support", label: "Take alongside", value: "Depends on the trigger", detail: `<p>No universal KPV supplement stack — it depends on what's causing the inflammation. Glucose control if that's the driver, gut-irritation fixes if that's it, rebuilding support if tissue needs repair. Don't keep giving the Site Safety Coordinator more equipment while ignoring what's causing the accidents.</p>` },
      { key: "pairs", label: "Pairs well with", value: "Site Safety, most jobs", detail: `<p><b>BPC-157</b> — KPV calms the site, BPC-157 coordinates the repair on it.</p><p><b>TB-500</b> and <b>GHK-Cu</b> — access and materials work better once the site isn't in a shutdown.</p><p><b>MOTS-c</b> and <b>SS-31</b> — makes the most sense when chronic inflammation is interfering with the metabolic or mitochondrial side of recovery, not just because both compounds exist.</p><p><b>ARA-290</b> — interesting overlap when inflammation and nerve/tissue injury are both in play. None of these are proven as combined human protocols.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>KPV doesn't rebuild tissue, doesn't supply energy, and doesn't have a receptor to reset — its job is narrowly to stop excessive inflammatory signaling from jamming whatever else is trying to work. That's a feature, not a limitation. But tested directly in joint tissue, it protected cells without matching everything a receptor-binding melanocortin relative did on the same panel — it doesn't cover every angle of an inflammatory response.</p>` }
    ]
  ];

'''
app.write_text(text[:start] + new_block + text[end:])
if "200–500mcg, 1–2x/day" not in app.read_text():
    raise SystemExit("new KPV dose chip missing after patch")
if "400 mcg–1 mg/day SC" in app.read_text():
    raise SystemExit("old KPV dose chip still present")

idx = Path("index.html")
html = idx.read_text()
if "?v=63" not in html:
    raise SystemExit("no ?v=63 in index.html")
idx.write_text(html.replace("?v=63", "?v=64"))

sw = Path("service-worker.js")
swt = sw.read_text()
if "peptide-reference-v63" not in swt:
    raise SystemExit("v63 cache name not found")
sw.write_text(swt.replace("peptide-reference-v63", "peptide-reference-v64", 1))
print("patched")
