from pathlib import Path

app = Path("app.js")
text = app.read_text()
start = text.find("  const parseResearchDoc = md => {")
end = text.find("  const PROTOCOL_DOC_NAMES = {")
if start < 0 or end < 0 or end <= start:
    raise SystemExit("parseResearchDoc/PROTOCOL_DOC_NAMES bounds not found")
new_block = r'''  const skipMetaH3 = title => /^(TIER\s+[12]\b|[—–-].*Technical Deep Dive divider)/i.test(title.trim());
  const parseResearchPart = (md, tier, usedIds) => {
    const lines = md.split("\n"); const sections = []; let current = null, paraBuf = [], listBuf = null;
    const uniqueId = base => { let id = base, n = 2; while (usedIds.has(id)) id = `${base}-${n++}`; usedIds.add(id); return id };
    const flushPara = () => { if (paraBuf.length && current) { const text = paraBuf.join(" ").trim(); if (text) current.html += `<p>${inlineMd(text)}</p>` } paraBuf = [] };
    const flushList = () => { if (listBuf && listBuf.items.length && current) { const tag = listBuf.type; current.html += `<${tag}>${listBuf.items.map(i => `<li>${inlineMd(i)}</li>`).join("")}</${tag}>` } listBuf = null };
    for (let raw of lines) {
      const line = raw.replace(/\r$/, "");
      if (/^#\s+/.test(line) && !/^#{2,}/.test(line)) continue;
      const h2 = line.match(/^##\s+(.+)$/), h3 = line.match(/^###\s+(.+)$/), ul = line.match(/^[-*]\s+(.+)$/), ol = line.match(/^\d+\.\s+(.+)$/);
      if (h2) { flushList(); flushPara(); if (current) sections.push(current); const title = h2[1].trim(); current = { id: uniqueId(slugify(title)), title, html: "", subs: [], tier }; continue }
      if (h3) {
        const title = h3[1].trim();
        if (skipMetaH3(title)) continue;
        flushList(); flushPara();
        if (current) { const id = uniqueId(slugify(title)); current.subs.push({ id, title }); current.html += `<h4 id="${id}">${inlineMd(title)}</h4>` }
        continue;
      }
      if (ul) { flushPara(); if (!listBuf || listBuf.type !== "ul") { flushList(); listBuf = { type: "ul", items: [] } } listBuf.items.push(ul[1].trim()); continue }
      if (ol) { flushPara(); if (!listBuf || listBuf.type !== "ol") { flushList(); listBuf = { type: "ol", items: [] } } listBuf.items.push(ol[1].trim()); continue }
      if (line.trim() === "") { flushList(); flushPara(); continue }
      if (line.trim() === "---") continue;
      paraBuf.push(line.trim());
    }
    flushList(); flushPara(); if (current) sections.push(current);
    return sections;
  };
  const parseResearchDoc = md => {
    const usedIds = new Set();
    const lines = md.split("\n");
    const divIdx = lines.findIndex(l => /^###\s+[—–-].*Technical Deep Dive divider/i.test(l.trim()) && !/^###\s+TIER\s+/i.test(l.trim()));
    if (divIdx < 0) return parseResearchPart(md, "technical", usedIds);
    const conversation = parseResearchPart(lines.slice(0, divIdx).join("\n"), "conversation", usedIds);
    const technical = parseResearchPart(lines.slice(divIdx + 1).join("\n"), "technical", usedIds);
    return [...conversation, ...technical];
  };
  const renderTechTier = async (id, container) => {
    container.innerHTML = `<p class="tech-loading">Loading…</p>`;
    if (!TECH_DOC_NAMES[id]) { container.innerHTML = `<p class="tech-error">The technical writeup for this one isn't published yet.</p>`; return; }
    try {
      let sections = techCache.get(id);
      if (!sections) {
        const res = await fetch(`./research/${TECH_DOC_NAMES[id]}`);
        if (!res.ok) throw new Error("fetch failed");
        sections = parseResearchDoc(await res.text());
        techCache.set(id, sections);
      }
      container.innerHTML = sections.map((s, i) => {
        const divider = i > 0 && sections[i - 1].tier === "conversation" && s.tier === "technical"
          ? `<div class="tech-deep-dive"><span>Technical Deep Dive</span></div>`
          : "";
        return `${divider}<div class="tech-accordion-item"><button type="button" class="tech-accordion-header" data-tech-toggle="${id}|${i}" aria-expanded="false"><span>${escapeHtml(s.title)}</span></button><div class="tech-accordion-body" id="techsec-${id}-${i}" hidden>${s.html}</div></div>`;
      }).join("");
    } catch (err) {
      container.innerHTML = `<p class="tech-error">Couldn't load the technical layer${typeof navigator !== "undefined" && !navigator.onLine ? " — you're offline and it hasn't been cached yet" : ""}. It'll work offline once you've opened it while connected at least once.</p>`;
    }
  };
'''
app.write_text(text[:start] + new_block + text[end:])

css = Path("styles.css")
cs = css.read_text()
if ".tech-tier.open{max-height:8000px}" not in cs:
    raise SystemExit("tech-tier.open FIND not found")
cs = cs.replace(".tech-tier.open{max-height:8000px}", ".tech-tier.open{max-height:none}", 1)
needle = ".tech-accordion-body ul,.tech-accordion-body ol{margin:0 0 8px;padding-left:20px;font-size:.88rem;line-height:1.55}"
if needle not in cs:
    raise SystemExit("accordion list CSS FIND not found")
if ".tech-deep-dive{" not in cs:
    cs = cs.replace(needle, needle + "\n.tech-deep-dive{margin:10px 0 2px;padding:12px 2px 4px;border-top:1px solid var(--line);font-family:var(--sans);font-size:.7rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--field)}", 1)
css.write_text(cs)

idx = Path("index.html")
html = idx.read_text()
if "?v=62" not in html:
    raise SystemExit("no ?v=62 in index.html")
idx.write_text(html.replace("?v=62", "?v=63"))

sw = Path("service-worker.js")
swt = sw.read_text()
if "peptide-reference-v62" not in swt:
    raise SystemExit("v62 cache name not found")
sw.write_text(swt.replace("peptide-reference-v62", "peptide-reference-v63", 1))

tpl = Path("research/_TEMPLATE.md")
tt = tpl.read_text()
old_roster = "Current roster: BPC-157 = foreman · TB-500 = scaffolding/access crew · GHK-Cu = materials/blueprints · MOTS-c = power plant · Retatrutide = logistics manager."
new_roster = "Current roster: BPC-157 = foreman · TB-500 = scaffolding/access crew · GHK-Cu = materials/blueprints · MOTS-c = power plant · Retatrutide = logistics manager · SS-31 = wiring & grid-stabilization crew · ARA-290 = Data Signal Repair · KPV = Site Safety Coordinator."
if old_roster not in tt:
    raise SystemExit("template roster FIND not found")
tpl.write_text(tt.replace(old_roster, new_roster, 1))

house = Path("research/HOUSE_STANDARDS.md")
ht = house.read_text()
old_house = "BPC-157 / TB-500 / GHK-Cu / MOTS-c / Retatrutide form a construction-site family — not just the repair trade, but the whole operation: foreman, access crew, materials, power plant, and now logistics."
new_house = "BPC-157 / TB-500 / GHK-Cu / MOTS-c / Retatrutide / KPV form a construction-site family — not just the repair trade, but the whole operation: foreman, access crew, materials, power plant, logistics, and site safety (KPV). SS-31 is wiring & grid-stabilization; ARA-290 is Data Signal Repair."
if old_house not in ht:
    raise SystemExit("HOUSE_STANDARDS FIND not found")
house.write_text(ht.replace(old_house, new_house, 1))

src = Path(".github/KPV_Compound_Research.md")
kpv = Path("research/KPV_Compound_Research.md")
if src.exists():
    kpv.write_text(src.read_text())
body = kpv.read_text()
if "### — Technical Deep Dive divider —" not in body:
    raise SystemExit("KPV md missing Technical Deep Dive divider")
if "What Happens After You Take It" not in body:
    raise SystemExit("KPV md missing Tier 1 What Happens section")
print("patched")
