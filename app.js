(() => {
  const state={data:null,query:"",category:"all",selected:new Set(),open:new Set(),activeStack:null,view:"home"};
  const els={home:document.getElementById("home-view"),toolbar:document.getElementById("library-toolbar"),filters:document.getElementById("filters"),search:document.getElementById("search"),grid:document.getElementById("card-grid"),empty:document.getElementById("empty-state"),count:document.getElementById("result-count"),library:document.getElementById("library-view"),compare:document.getElementById("compare-view"),compareBoard:document.getElementById("compare-board"),presets:document.getElementById("stack-presets"),stackNote:document.getElementById("stack-note"),dock:document.getElementById("compare-dock"),dockLabel:document.getElementById("dock-label"),dockCompare:document.getElementById("dock-compare"),dockClear:document.getElementById("dock-clear"),clearCompare:document.getElementById("clear-compare"),back:document.getElementById("back-to-library"),compareToggle:document.getElementById("compare-toggle"),offline:document.getElementById("offline-pill"),synergy:document.getElementById("synergy-view"),synergyGrid:document.getElementById("synergy-grid")};
  const escapeHtml=v=>String(v).replace(/&/g,["&","amp;"].join("")).replace(/</g,["&","lt;"].join("")).replace(/>/g,["&","gt;"].join("")).replace(/"/g,["&","quot;"].join(""));
  const categoryById=id=>state.data.categories.find(c=>c.id===id); const selectedPeptides=()=>state.data.peptides.filter(p=>state.selected.has(p.id));
  const persist=()=>{try{localStorage.setItem("peptide-ref-selected",JSON.stringify([...state.selected]))}catch{}}; const restore=()=>{try{const r=JSON.parse(localStorage.getItem("peptide-ref-selected")||"[]");if(Array.isArray(r))r.slice(0,5).forEach(id=>state.selected.add(id))}catch{}};
  const doseText = p => typeof p.dose === "string" ? p.dose : [p.dose.summary, p.dose.axisNote, ...(p.dose.rows || []).map(r => `${r.label} ${r.range} ${r.note || ""}`), p.dose.reference, p.dose.divergence, p.dose.routes].filter(Boolean).join(" ");
  const doseDetailHtml = p => { if (typeof p.dose === "string") return `<p>${escapeHtml(p.dose)}</p>`; const d = p.dose; const rows = (d.rows || []).map(r => `<div class="dose-row"><span class="dose-label">${escapeHtml(r.label)}</span><span class="dose-range">${escapeHtml(r.range)}</span>${r.note ? `<span class="dose-note">${escapeHtml(r.note)}</span>` : ""}</div>`).join(""); return `<div class="dose-tiers">${rows}</div>` + (d.axisNote ? `<p class="dose-axis">${escapeHtml(d.axisNote)}</p>` : "") + (d.routes ? `<p class="dose-axis">${escapeHtml(d.routes)}</p>` : "") + (d.reference ? `<p class="dose-ref"><strong>Trial-derived:</strong> ${escapeHtml(d.reference)}${d.divergence ? ` ${escapeHtml(d.divergence)}` : ""}</p>` : ""); };
  const matches=p=>{if(state.category!=="all"&&p.category!==state.category)return false;const q=state.query.trim().toLowerCase();if(!q)return true;return [p.name,...(p.aka||[]),p.analogy,p.tagline,p.cardDescription,p.bottomLine,doseText(p),p.halfLife,p.timing,p.cycling,p.mechanism,...(p.cautions||[]),...(p.supplements||[]),categoryById(p.category)?.label||""].join(" ").toLowerCase().includes(q)};
  const listHtml=items=>`<ul>${items.map(i=>`<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  const factsHtml=p=>`<dl class="facts"><div class="fact"><dt>Dose</dt><dd>${escapeHtml(typeof p.dose === "string" ? p.dose : p.dose.summary)}</dd></div><div class="fact"><dt>Half-life</dt><dd>${escapeHtml(p.halfLife)}</dd></div><div class="fact"><dt>Timing / food</dt><dd>${escapeHtml(p.timing)}</dd></div><div class="fact"><dt>Cycling</dt><dd>${escapeHtml(p.cycling)}</dd></div></dl>`;
  const jumpAttr=(id,section)=>`data-jump="${id}-${section}"`;
  const scrollWithOffset=el=>{if(!el)return;const bar=document.querySelector(".topbar");const offset=(bar?bar.getBoundingClientRect().height:0)+12;window.scrollTo({top:window.scrollY+el.getBoundingClientRect().top-offset,behavior:"smooth"})};

  const TECH_DOC_NAMES = {
    "tb-500": "TB-500_Compound_Research.md",
    "bpc-157": "BPC-157_Compound_Research.md",
    "ghk-cu": "GHK-Cu_Compound_Research.md",
    "mots-c": "MOTS-c_Compound_Research.md",
    "retatrutide": "Retatrutide_Compound_Research.md",
    "ss-31": "SS-31_Compound_Research.md",
    "ara-290": "ARA-290_Compound_Research.md",
    "kpv": "KPV_Compound_Research.md",
    "nad": "NAD+_Compound_Research.md"
  };
  const techCache = new Map();
  const inlineMd = t => { let s = escapeHtml(t); s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); s = s.replace(/\*(.+?)\*/g, "<em>$1</em>"); s = s.replace(/`(.+?)`/g, "<code>$1</code>"); return s };
  const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const skipMetaH3 = title => /^(TIER\s+[12]\b|[—–-].*Technical Deep Dive divider)/i.test(title.trim());
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
  const PROTOCOL_DOC_NAMES = {
    "systemic-inflammation": "Systemic_Inflammation.md",
    "diabetic-neuropathy": "Diabetic_Neuropathy.md",
    "insulin-resistance": "Insulin_Resistance.md",
    "menopause": "Menopause.md",
    "ibs-gut-repair": "IBS_Gut.md",
    "retatrutide-plateau": "Retatrutide_Plateau.md",
    "hepatic-inflammation": "Hepatic_Inflammation.md",
    "cognitive-decline": "Cognitive_Decline.md"
  };
  const protocolCache = new Map();
  const renderProtocolDoc = async (id, container) => {
    container.innerHTML = `<p class="tech-loading">Loading…</p>`;
    if (!PROTOCOL_DOC_NAMES[id]) { container.innerHTML = `<p class="tech-error">This one hasn't been rewritten in the new format yet — it's queued.</p>`; return; }
    try {
      let sections = protocolCache.get(id);
      if (!sections) {
        const res = await fetch(`./protocols/${PROTOCOL_DOC_NAMES[id]}`);
        if (!res.ok) throw new Error("fetch failed");
        sections = parseResearchDoc(await res.text());
        protocolCache.set(id, sections);
      }
      const tid = `p-${id}`;
      container.innerHTML = sections.map((s, i) => `<div class="tech-accordion-item"><button type="button" class="tech-accordion-header" data-tech-toggle="${tid}|${i}" aria-expanded="false"><span>${escapeHtml(s.title)}</span></button><div class="tech-accordion-body" id="techsec-${tid}-${i}" hidden>${s.html}</div></div>`).join("");
    } catch (err) {
      container.innerHTML = `<p class="tech-error">Couldn't load this${typeof navigator !== "undefined" && !navigator.onLine ? " — you're offline and it hasn't been cached yet" : ""}.</p>`;
    }
  };
  const protocolTileHtml = p => `<article class="card" data-protocol-id="${p.id}">
      <h2>${escapeHtml(p.name)}</h2>
      <p class="card-desc">${escapeHtml(p.oneLiner || "")}</p>
      <button type="button" class="go-deeper-btn" data-protocol-deeper="${p.id}" aria-expanded="false"><span>See the full reasoning</span></button>
      <div class="tech-tier" id="ptier-${p.id}"><div class="tech-inner" id="pinner-${p.id}"></div></div>
    </article>`;
  const renderSynergyList = () => { els.synergyGrid.innerHTML = (state.data.protocols || []).map(protocolTileHtml).join("") || `<p class="empty">No protocols published yet.</p>`; };
  const clip=(s,n=18)=>{const t=String(s||"").replace(/\s+/g," ").trim();if(t.length<=n)return t;const cut=t.slice(0,n);const sp=cut.lastIndexOf(" ");return (sp>8?cut.slice(0,sp):cut).replace(/[.,;:]+$/,"")+"…"};
  const chipGridHtml = (id, chipRows) => chipRows.map((row, ri) => `<div class="chip-grid">${row.map(c => `<button type="button" class="chip-tile" data-chip="${id}|${ri}|${c.key}" aria-expanded="false"><span>${escapeHtml(c.label)}</span>${c.value ? `<b>${escapeHtml(c.value)}</b>` : ""}</button>`).join("")}</div><div class="chip-detail" id="chipdetail-${id}-${ri}" hidden></div>`).join("");
  const genericChips = p => [
    [
      { key: "dose", label: "Dose", value: clip(doseText(p), 16), detail: doseDetailHtml(p) },
      { key: "timing", label: "Timing", value: clip(p.timing, 16), detail: `<p>${escapeHtml(p.timing)}</p>` },
      { key: "cycling", label: "Cycling", value: clip(p.cycling, 16), detail: `<p>${escapeHtml(p.cycling)}</p>` },
      { key: "half", label: "Half-life", value: clip(p.halfLife, 16), detail: `<p>${escapeHtml(p.halfLife)}</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: `${(p.cautions||[]).length} notes`, detail: listHtml(p.cautions||[]) },
      { key: "support", label: "Take alongside", value: `${(p.supplements||[]).length} picks`, detail: listHtml(p.supplements||[]) },
      { key: "biology", label: "Biology", value: "", detail: `<p>${escapeHtml(p.mechanism)}</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>${escapeHtml(p.bottomLine||p.mechanism)}</p>` }
    ]
  ];
  const chipsFor = id => {
    const p = state.data.peptides.find(x=>x.id===id)||{};
    const rows = CHIP_REGISTRY[id] || genericChips(p);
    if (p.dose && typeof p.dose !== "string" && !CHIP_REGISTRY[id]) {
      return rows.map(row => row.map(c => c.key === "dose" ? { key: "dose", label: c.label || "Dose", value: clip(p.dose.summary, 16), detail: doseDetailHtml(p) } : c));
    }
    return rows;
  };

  const TB500_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "5mg / 4–5d", detail: `<p>5 mg under the skin, every 4 to 5 days. That's the rhythm that keeps showing up in the practical experience we trust most for this one — not a lab-tested number, just what actually works when people use it.</p>` },
      { key: "timing", label: "Timing", value: "Anytime", detail: `<p>Doesn't matter what time of day, and food doesn't change how it works. Morning's common mostly because it's easy to load all your shots for the day at once.</p>` },
      { key: "cycling", label: "Cycling", value: "As needed", detail: `<p>Use it while you're actually working on something — an injury, a hard training block, whatever the goal is. Once you've gotten the results you were after, there's no reason to keep going just to keep going.</p><p>It's not something your body gets used to or stops responding to, so there's no hard rule about taking breaks. Run it as long as it's doing a job. Stop when it isn't.</p>` },
      { key: "acute", label: "Acute injury", value: "Run tighter", detail: `<p>Just tore something? You can run it a bit tighter than the usual schedule for the first week or two while the injury is doing its heaviest repair work, then ease back to normal once things settle down.</p><p>You don't need to inject anywhere near the injury itself — this one works through the bloodstream, not by being placed at the site.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "No long-term data", detail: `<p>Long-term human safety data for TB-500 specifically are genuinely thin — worth knowing, not a reason for alarm on its own. Watch for any new allergic-type reaction, unusual systemic symptoms, or a real change in how you respond with repeated use.</p><p>And remember: feeling better can happen before the tissue is actually ready for full loading.</p>` },
      { key: "support", label: "Take alongside", value: "Repair basics", detail: `<p>TB-500 gets repair cells where they need to go — it doesn't supply what they build with. The foundation is enough protein, appropriate rehab and progressive loading, and adequate recovery. Vitamin C and collagen-rich protein matter specifically when connective tissue is the target. Access crew, not building materials.</p>` },
      { key: "pairs", label: "Pairs well with", value: "3 compounds", detail: `<p><b>BPC-157</b> — the foreman coordinating the repair job on-site. Different jobs on paper — but a direct rat tendon study testing both together found no added benefit over either alone, and TB-500 by itself was actually the one that showed a real effect in that test.</p><p><b>GHK-Cu</b> — delivers the materials once cells arrive.</p><p><b>MOTS-c</b> — keeps energy available, since healing costs fuel.</p><p><b>Blends (Wolverine / GLOW / KLOW):</b> force daily TB-500 or starve BPC's schedule. Run TB-500 on its own rhythm from its own vial — a 5/5 Wolverine vial is not a protocol.</p>` },
      { key: "catch", label: "The catch", value: "Vial ≠ the final worker", detail: `<p>This isn't really an "injury peptide" — its real job is getting repair cells where they need to go. Injury relief is a downstream result of that, not the mechanism itself.</p><p>There's also a real wrinkle worth knowing: lab work tracking how TB-500 breaks down in the body found the intact molecule showed little wound-healing activity on its own — one of its breakdown products carried the actual effect. Doesn't make it fake, just means the "this exact peptide does the healing" story may be incomplete.</p><p>Old injuries can actually respond well, because they're often stuck behind poor blood flow and old scar tissue. And you don't need to inject near the injury — it finds its way there on its own.</p>` }
    ]
  ];

  const BPC157_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "250mcg–1mg/day", detail: `<p>Most people run somewhere between a quarter and a full milligram a day, usually split into a morning and evening shot about 12 hours apart. For a fresh, serious injury some people go up to 2 milligrams for a short stretch, but more isn't automatically better past about a milligram — you're past the point of extra benefit.</p>` },
      { key: "timing", label: "Timing", value: "1–2x daily", detail: `<p>Once a day works, but splitting it morning and evening about 12 hours apart is the more common pattern. If you're using it for gut issues specifically, some people take it by mouth instead of injecting.</p>` },
      { key: "cycling", label: "Cycling", value: "No hard rule", detail: `<p>There's no receptor here that gets worn out or needs a break, so there's no biological reason you have to cycle it. The common 4–6 week on/off pattern is more about cost and caution than any known biology. If you're working on something structural — a tendon, a joint — 8 to 12 weeks tracks better with how long real tissue repair actually takes.</p>` },
      { key: "acute", label: "Acute injury", value: "Up to 2mg short-term", detail: `<p>For something fresh and serious, going up to 2 milligrams a day for a short stretch is a reasonable practical move — just don't stay there. Drop back down once the acute phase has passed.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Angiogenesis + cancer hx", detail: `<p>The same "grow new blood vessels" trick that makes this good at healing is exactly the kind of thing doctors worry about with an existing tumor — nobody's actually tested it either way in someone with cancer, so it's not a casual reach if that's part of your history.</p><p>Feeling better also isn't proof the tissue's actually strong again — pain relief can show up before real structural healing catches up.</p>` },
      { key: "support", label: "Take alongside", value: "The basics", detail: `<p>BPC-157 is the foreman — it doesn't bring the lumber. Enough protein, adequate vitamin C, progressive loading, and enough recovery are what the body actually rebuilds with. Collagen or gelatin is a convenient way to supply those amino acids, not a BPC-specific requirement.</p>` },
      { key: "pairs", label: "Pairs well with", value: "TB-500", detail: `<p>BPC-157 is the foreman running the local job site; TB-500 is the access crew getting repair cells there from anywhere in the body. Different jobs — but a direct rat tendon study testing both together found no added benefit from combining them over either one alone. Complementary on paper; not proven as a combo in practice.</p><p><b>Blends (Wolverine / GLOW / KLOW):</b> lock BPC (usually daily mcg) to TB-500's different clock and milligram dosing. Keep BPC in its own vial; stack on its schedule.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>This is the foreman, not the lumber — it coordinates the repair, it isn't the building material itself. The usual 4–6 week cycling advice is convention, not receptor biology; there's no receptor here to reset.</p><p>And taking it orally is really about reaching the gut lining directly, not a sneaky way to get it systemically — that's a different route with different reach.</p>` }
    ]
  ];

  const GHKCU_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "1–2mg SQ", detail: `<p>Most protocols start around 1 milligram a day for the first couple weeks, step up to 2 milligrams, then settle into 1 to 2 milligrams two or three times a week for maintenance. This whole ladder is practitioner convention — there's no controlled human dosing trial behind injectable GHK-Cu at any amount.</p><p>Worth knowing: the researcher most associated with this compound estimated a real systemic effect might need something like 100 to 200 milligrams — 50 to 100 times what people actually use. That's not a suggestion to go near that number. It means the low end isn't validated either — a conservative starting point, not a tested minimum.</p>` },
      { key: "timing", label: "Timing", value: "Anytime", detail: `<p>Food doesn't matter. Time of day doesn't matter. If you're using the topical version instead, twice a day is the common pattern — that's a different route with its own safety record.</p>` },
      { key: "cycling", label: "Cycling", value: "4–12wks on/2–4 off", detail: `<p>If you're injecting it, cycle 4 to 12 weeks on with 2 to 4 off. That's copper-load management and avoiding a stale signal — not because a receptor wears out. No receptor has been identified here. Topical can run 8 to 12 weeks with periodic breaks because almost none of it gets into the bloodstream through skin.</p>` },
      { key: "expect", label: "What to expect", value: "2–6wks", detail: `<p>Early on: milder skin feel or less reactive inflammation, maybe better tolerance of training stress. Real skin or connective-tissue change usually shows over 2 to 6 weeks. Quiet biology — not a stimulant, and not a replacement for BPC-157 or TB-500.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Copper load", detail: `<p>The sharper long-term question is chronic copper load from repeated injecting — there is no multi-year human safety study on that. Topical has decades of safety history because systemic absorption through skin is minimal; injecting bypasses that margin. Wilson's disease or known copper overload is a hard stop. Feeling better is not the same as tissue fully remodeled and ready for full load.</p><p><b>Don't co-store GHK-Cu.</b> Keep it in its own vial — copper in a shared fridge blend is an avoidable risk, and GLOW/KLOW are convenience SKUs, not better dosing. Never mix with glutathione/NAC in one vial.</p>` },
      { key: "support", label: "Take alongside", value: "5 picks", detail: `<p>Vitamin C, silica, collagen peptides or enough protein, zinc, and resveratrol — the building blocks and cofactors for collagen work, plus resveratrol which appears to amplify some of the gene-level effects. Match them to the job; don't stack everything just because it's on a list. Copper and zinc can compete if cycles are repeated.</p>` },
      { key: "pairs", label: "Pairs well with", value: "BPC-157 + TB-500", detail: `<p><b>BPC-157</b> — GHK-Cu supplies copper and remodeling instructions; BPC-157 coordinates the repair. Complementary on paper, not a combined trial.</p><p><b>TB-500</b> — TB-500 gets repair cells to the site; GHK-Cu supplies what they need once they're there. With BPC-157 these three are sometimes called the Repair Stack.</p><p><b>MOTS-c</b> — power plant + materials; parallel support, not a required pair.</p>` },
      { key: "catch", label: "The catch", value: "Courier, not a copper dump", detail: `<p>This is not a copper supplement with a peptide attached — GHK's job is to pick copper up and hand it off, with a grip almost like albumin's. The usual toxicity warning is aimed at the wrong object; the long-term load question is still real.</p><p>It was not discovered as a skin peptide — young plasma making old liver tissue work like young tissue came first; skin marketing came later.</p><p>The “reprograms thousands of genes” line is a lab snapshot on cells, not proof a 1–2 mg shot rewrites a whole person.</p><p>Cycling is copper housekeeping and a stale-signal check — not a proven receptor reset.</p>` }
    ]
  ];

  const MOTSC_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "5mg SC 2–3x/wk", detail: `<p>5 milligrams under the skin, two to three times a week — that's practitioner convention, not a number that came out of a human dosing trial.</p>` },
      { key: "timing", label: "Timing", value: "Anytime", detail: `<p>Time of day probably matters less than consistency. And fasted isn't automatically better — if you're already running low on fuel, piling more stress on top while asking the system to adapt can make things harder, not easier.</p><p>Dosing more often than the schedule calls for isn't automatically doing more either — the downstream mitochondrial work outlasts how long the peptide's actually in your blood.</p>` },
      { key: "cycling", label: "Cycling", value: "8–12wks on/1–2 off", detail: `<p>Run it 8 to 12 weeks, then take 1 to 2 weeks off. That break isn't a receptor reset — MOTS-c doesn't work through a receptor — it's a checkpoint: did the improvement hold, did energy fall back, is the signal still earning its place.</p><p>Pairing with SS-31 can make sense, but the right sequence depends on what's actually the bottleneck, not a fixed rule.</p>` },
      { key: "expect", label: "What to expect", value: "Builds over weeks", detail: `<p>Early on you might notice a shift in energy or glucose handling — not a stimulant kick. The real adaptation is slower; one household case saw real improvement show up around 6.5 weeks in, but that's one example, not a universal clock. If it fades within a couple weeks after stopping, that's detraining, not the treatment failing.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Fatigue that gets worse", detail: `<p>If MOTS-c repeatedly makes your daily function or exercise tolerance worse, don't automatically push through or push the dose higher. That's a signal to reassess what's actually the bottleneck — fuel, recovery, or the mitochondrial machinery itself.</p>` },
      { key: "support", label: "Take alongside", value: "Depends on bottleneck", detail: `<p>MOTS-c asks the energy system to adapt — it doesn't supply the raw materials. What actually helps depends on where the bottleneck is: enough fuel if you're running low, magnesium for general energy-system support, CoQ10 if downstream electron handling looks limiting, NAD+ support if redox turnover is the issue. Not a fixed stack — match it to what's actually limiting you.</p>` },
      { key: "pairs", label: "Pairs well with", value: "SS-31 + NAD+", detail: `<p><b>SS-31</b> — machinery support. MOTS-c asks the system to adapt; SS-31 protects the mitochondrial machinery itself. Which one leads depends on how compromised that machinery already looks, not a fixed order.</p><p><b>NAD+</b> — carrier support. MOTS-c can increase demand on redox/carrier turnover; NAD+ matters most when that's actually the limiting piece.</p><p><b>TB-500</b> and <b>GHK-Cu</b> — repair work costs energy either way, so pairing with the power plant makes mechanistic sense, even without a combined trial to point to.</p>` },
      { key: "catch", label: "The catch", value: "More signal can't fix every bottleneck", detail: `<p>MOTS-c can ask the energy system to adapt, but it can't automatically repair every part of that system. If fuel, mitochondrial machinery, recovery, or redox handling is the real limitation, pushing MOTS-c harder just makes the weak spot more obvious instead of fixing it.</p><p>A lot of MOTS-c cycling advice also borrows "receptor reset" language from a completely different kind of peptide — that's not how this one works. And the claim that this helps your liver through something called FGF-21 has it backwards — the data actually shows both rising together with worse liver disease, not one helping the other.</p>` }
    ]
  ];

  const RETATRUTIDE_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "0.5–12mg/wk", detail: `<p>Most people land somewhere between half a milligram and six milligrams a week — the ladder goes up to twelve, but higher isn't the goal, just there if you actually need it. Stay at the lowest amount that's doing the job.</p>` },
      { key: "timing", label: "Timing", value: "Once weekly", detail: `<p>Once a week, food doesn't matter. Keeping it on the same day each week matters more than what time of day you take it.</p>` },
      { key: "cycling", label: "Cycling", value: "Continuous", detail: `<p>This one isn't really an on/off thing — it's built to run every week, ongoing. Stopping is a separate decision from cycling, and whatever it was controlling can come back once you stop.</p>` },
      { key: "escalate", label: "Going up a dose", value: "Only if needed", detail: `<p>Go up a step only when your current dose stops doing the job or you genuinely need a stronger effect — not because the calendar says so, and not because someone else's dose is higher. Same logic in reverse: if it's working, there's no reason to climb.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "GI + heart rate", detail: `<p>Nausea and other GI stuff is dose-related — pushing up faster gets you more of that without necessarily a better result. Heart rate can tick up a little, more at higher doses. New or worsening pain in the upper right belly is worth paying attention to, and there's a small uptick in urinary tract infections reported too.</p>` },
      { key: "support", label: "Take alongside", value: "7 picks", detail: `<p>Berberine, alpha-lipoic acid, benfotiamine, magnesium glycinate, chromium, vitamin D3/K2, and cinnamon — supporting insulin sensitivity and guarding against the nerve and metabolic stress that comes with fast weight loss.</p>` },
      { key: "track", label: "What to track", value: "5 things", detail: `<p>Appetite and food noise, your weight and waist trend over time (not one weigh-in), glucose or A1C if that's relevant to you, GI tolerance and resting heart rate, and — if weight's falling fast — your strength, protein intake, and body composition.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>Once the metabolic pathways are actually engaged, more peptide doesn't keep amplifying the result. Higher doses in trials show bigger average effects, but also more GI side effects — a stronger available dose doesn't mean someone doing well at a lower one needs to chase it.</p><p>And losing weight fast without enough protein or training is how you lose muscle instead of fat.</p>` }
    ]
  ];

  const ARA290_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "4mg daily", detail: `<p>4 milligrams under the skin, once a day — that is the dose actually tested in people, not a community guess. A higher amount was tried and was not simply better. Start here. Do not climb because more sounds stronger.</p>` },
      { key: "timing", label: "Timing", value: "Daily, any time", detail: `<p>No study has shown that morning, fasting, or meal timing is required. Pick a time you can repeat every day for the whole check.</p>` },
      { key: "cycling", label: "Cycling", value: "Tested 28 days", detail: `<p>Human studies used daily shots for 28 days. That tells us 28 days was studied. It does not prove day 28 is a biological stopping point, and there is no established receptor-reset reason for a long washout. The common 28-on / 56-off rule has not been traced to convincing human pharmacology here. Longer continuous use remains unanswered — not proven safe, not proven forbidden.</p>` },
      { key: "expect", label: "What to expect", value: "Quiet change over weeks", detail: `<p>Pain, burning, or sleep lost to neuropathy can move during a 28-day course. You may not feel a structural nerve change even if small-fiber health is moving. Some improvement has been seen still present a month after the last shot — that fits a switch, not a drug that only works while it is in the blood. Do not judge the whole course the morning after the last injection.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Worse function, ongoing damage", detail: `<p>Reassess if symptoms are clearly worse (not just fluctuating), if new weakness or loss of function shows up, if daily function declines even while pain is quieter, if injection reactions are getting significant, or if the thing injuring the nerve — blood sugar, for example — is still uncontrolled. Do not call that detox. Feeling better is not permission to overload a nerve that is still mid-repair. Stop and see a physician for any new cancer diagnosis during use too — not because a trial showed ARA-290 causes cancer (none has), but because the same pro-survival signaling that helps a dying nerve is worth extra scrutiny if an abnormal cell shows up.</p>` },
      { key: "know", label: "How do I know?", value: "Nerve repair", detail: `<p>Do not use a pain score alone. Compare burning, tingling, numbness, touch or temperature, walking, balance, sleep lost to nerve pain, and whether any improvement holds after the shots stop. Pain easing without function changing can mean different clocks, not failure. A clinic can measure small-fiber health; that is extra information, not the only report card.</p>` },
      { key: "pairs", label: "Pairs well with", value: "Retatrutide + BPC-157", detail: `<p><b>Retatrutide</b> — different job: an upstream metabolic driver when insulin resistance or diabetes is still feeding the nerve injury. Not a tested combination.</p><p><b>BPC-157</b> — local repair-environment coordination. Complementary on paper, not a combined trial.</p><p>Mitochondrial support only if energy machinery is actually the bottleneck — not because more repair compounds sounds better.</p>` },
      { key: "catch", label: "The catch", value: "Repair can't outrun ongoing damage", detail: `<p>ARA-290 can send a protective / recovery signal. If the nerve is still being injured, the useful question is whether repair is happening faster than new damage. A 28-day study cannot answer that for someone whose blood sugar, compression, or inflammation is still active. Feeling better is not the same as the nerve being rebuilt — and day 28 is a study calendar, not a biological wall.</p>` }
    ]
  ];

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
      { key: "pairs", label: "Pairs well with", value: "Site Safety, most jobs", detail: `<p><b>BPC-157</b> — KPV calms the site, BPC-157 coordinates the repair on it.</p><p><b>TB-500</b> and <b>GHK-Cu</b> — access and materials work better once the site isn't in a shutdown.</p><p><b>MOTS-c</b> and <b>SS-31</b> — makes the most sense when chronic inflammation is interfering with the metabolic or mitochondrial side of recovery, not just because both compounds exist.</p><p><b>ARA-290</b> — interesting overlap when inflammation and nerve/tissue injury are both in play. None of these are proven as combined human protocols.</p><p><b>Blends (KLOW):</b> glue KPV to GHK-Cu, BPC, and TB-500 at a fixed ratio and mixed schedules. Own vial if you use it.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>KPV doesn't rebuild tissue, doesn't supply energy, and doesn't have a receptor to reset — its job is narrowly to stop excessive inflammatory signaling from jamming whatever else is trying to work. That's a feature, not a limitation. But tested directly in joint tissue, it protected cells without matching everything a receptor-binding melanocortin relative did on the same panel — it doesn't cover every angle of an inflammatory response.</p>` }
    ]
  ];

  const SS31_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "Start low, let response decide", detail: `<p>The only human dose with real trial support is about 40 mg under the skin daily — the FORZINITY / major-program dose, studied in Barth syndrome and related programs. Community protocols commonly run 1–5 mg daily (some higher), from mouse scaling and convention, not a healthy-adult dose-finding study. There is no validated wellness dose.</p><p>Binding to cardiolipin can saturate, so more is not automatically more. This reference starts conservative — low single-digit milligrams or lower — and lets response decide. Daily fits continuous membrane protection better than every-other-day. Morning is habit; food and clock time are not required by trial data. Kidney function changes exposure; label dosing drops when eGFR is very low.</p>` },
      { key: "know", label: "How you'll know", value: "Baseline it, then check", detail: `<p>This is this reference's own framework, not a trial protocol. Pick 2–3 specific limits before you start — not “more energy.” Quantify distance, effort, recovery, next-day cost.</p><p><b>Week 1</b> — tolerance only (sites, dizziness, unusual fatigue). Don't chase dose.<br><b>Weeks 2–4</b> — reproducibility against baseline.<br><b>Weeks 4–6</b> — clearly improving → don't increase. Some improvement → cautious step up can be reasonable. No change → don't keep climbing; membrane quality may not be the bottleneck (substrate, anemia, glucose, inflammation, sleep, deconditioning, or mitochondrial quantity). Worse → hold and reassess — not “mitochondrial detox.”</p><p>After a clear gain, stopping and re-measuring is information: holds → you may not need to stay on; drifts back → maintenance may be earning its place.</p>` },
      { key: "cycling", label: "Cycling", value: "Evaluate, don't reset", detail: `<p>No mandatory on/off cycle — no receptor to desensitize. The job is ongoing protection of cardiolipin under stress, not a permanent one-time fix. Use a defined 4–6 week evaluation window and let the result decide. Long continuous disease-program data exist at trial doses; that is not proof community doses deliver cumulative benefit outside that context. Eosinophil counts can rise with weeks-to-months of exposure in labeled programs.</p>` },
      { key: "expect", label: "What to expect", value: "Works fast, feels slow", detail: `<p>Molecular effect can start within hours — a single infusion in older adults raised muscle ATP-production capacity the same day, gone by a week, without less fatigue. Don't expect to feel that. Injection-site reactions are the most likely early notice. A transient drained feeling on ramp-up is a common community pattern (often 1–3 weeks). Run alone, subjective change is often subtle; some only notice a difference with MOTS-c. In Barth syndrome, meaningful function still built over years. Quiet, cumulative — easy to misjudge early.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Injection site reactions", detail: `<p>Injection-site reactions (itch, pain, redness, bruising) are the most common adverse finding across trials — rotate sites. Major programs missed primary endpoints in heart failure, macular degeneration, and mitochondrial myopathy while showing secondary signals; safety/tolerability has been comparatively clean long-term in those programs. Kidney function matters: exposure rises when renal function is poor. Reproducible worsening after dosing is a hold signal, not detox. Feeling better is not permission to ignore sleep, fuel, inflammation, or deconditioning.</p>` },
      { key: "support", label: "Take alongside", value: "4 picks", detail: `<p>CoQ10, NAD+ support, magnesium, and alpha-lipoic acid — mechanistic companions for the electron-transport chain SS-31 protects, not a combined-use trial stack. Match them to an actual limit; don't stack the whole mito list by default.</p>` },
      { key: "pairs", label: "Pairs well with", value: "MOTS-c first, then SS-31", detail: `<p><b>MOTS-c</b> — power plant + wiring crew. Project sequencing preference: MOTS-c first, SS-31 second (sourced practitioner call). Reverse order is also argued online. No head-to-head human trial either way — practitioner call, not a law.</p><p><b>GHK-Cu</b> — remodeling costs energy; SS-31 supports membrane efficiency. Mechanistic only.</p><p><b>NAD+</b> — carrier + wiring. Intuitive; no combined outcome trial.</p>` },
      { key: "catch", label: "The catch", value: "Bandage, not a rebuild", detail: `<p>SS-31 stabilizes cardiolipin that is already there — it does not replace oxidized cardiolipin or fix the remodeling pathway. Support under ongoing stress, not a one-cycle mitochondria fix.</p><p>About 40 mg daily is the trial/label dose in disease programs; 1–5 mg community use is unvalidated for wellness. No healthy-adult dose ladder.</p><p>“FDA approved” is real but narrow (Barth syndrome, accelerated path). “It failed its trials” skips secondary signals and long tolerability. Neither headline is the full picture.</p><p>Clearest clinical signal is where cardiolipin dysfunction is the disease — not a general energy drug for healthy engines.</p>` }
    ]
  ];
  const NAD_CHIPS = [
    [
      { key: "dose", label: "Route / dose", value: "SC: 25–100 mg", detail: `<p>Subcutaneous NAD+ in the 25–100 mg range is practitioner/community convention, not a validated human dose-response curve. The pattern people actually titrate — roughly 25 mg at the low end, 50 mg commonly, 75–100 mg at the higher common end, often 2–3× a week — is a response/tolerability ladder, not Maintenance / Therapeutic / High.</p><p>IV uses a completely different milligram scale (hundreds of milligrams in documented exposures). Oral NR/NMN are a different pharmacological approach again. Do not treat those numbers as interchangeable with an SC shot.</p>` },
      { key: "timing", label: "Timing", value: "Response-driven", detail: `<p>Morning is common, not mandatory. Some people notice alertness, some notice little timing effect, some get fatigue or sleepiness. Use the timing that gives the most useful repeatable response without wrecking sleep or the rest of the day. No established rule for fasting, meal separation, or a pre-workout window.</p>` },
      { key: "cycling", label: "Duration", value: "Reassess — don't auto-cycle", detail: `<p>NAD+ has no established peptide-style receptor-reset cycle — don't invent 8-on/4-off. Hold a defined evaluation window, about 4–6 weeks as a practical checkpoint (not a validated NAD+ cycle), and ask whether continued exposure is still earning its place. No reproducible functional benefit → reassess. Benefit that holds after stopping → you may not need to stay on it. Benefit that disappears off and returns on → useful practical information.</p>` },
      { key: "expect", label: "What to expect", value: "Can sting. Response varies.", detail: `<p>SC NAD+ can sting or burn noticeably. Some people report cleaner energy, alertness, stamina, or recovery. Some notice little. Some get paradoxical fatigue, sleepiness, or brain fog. Unpleasant effects are not "detox" and are not proof that NAD+ is working.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Fatigue, nausea, heart rate", detail: `<p>Stop and reassess for pronounced or worsening fatigue, significant nausea, abdominal discomfort, chest pressure, palpitations or a jump in heart rate, or severe/persistent injection-site pain. None of those is a detox badge.</p>` },
      { key: "know", label: "How do I know?", value: "Repeatable function", detail: `<p>Judge it on functional markers you can repeat: afternoon energy stability, work or exercise capacity at the same effort, recovery after equivalent work, post-exertion fatigue, mental stamina. A useful response should be repeatable, functionally meaningful, and larger than ordinary day-to-day variation.</p><p>Feeling nothing does not automatically mean no biology. Feeling nothing also does not justify dosing forever. "Maybe it's working invisibly" is not an answer.</p>` },
      { key: "pairs", label: "Pairs well with", value: "MOTS-c + SS-31", detail: `<p><b>MOTS-c</b> — power-plant upgrade: metabolic programming and insulin-independent glucose uptake.</p><p><b>SS-31</b> — wiring crew: membrane/machinery the electron-transport chain runs on.</p><p><b>NAD+/NADH</b> — the rechargeable carrier running through that machinery. Three distinct jobs, not three mitochondrial boosters. Mechanistic/interpretive synergy — no combined-use human outcome trial.</p>` },
      { key: "catch", label: "The catch", value: "More isn't automatically more energy", detail: `<p>If NAD+ isn't the bottleneck — or the mitochondrial system isn't efficiently using and recycling it — adding more carrier may not solve the problem. The longer version is in Go Deeper.</p>` }
    ]
  ];

  const CHIP_REGISTRY = { "tb-500": TB500_CHIPS, "bpc-157": BPC157_CHIPS, "ghk-cu": GHKCU_CHIPS, "mots-c": MOTSC_CHIPS, "retatrutide": RETATRUTIDE_CHIPS, "ara-290": ARA290_CHIPS, "kpv": KPV_CHIPS, "ss-31": SS31_CHIPS, "nad": NAD_CHIPS };

  const goDeeperTierHtml = p => TECH_DOC_NAMES[p.id]
    ? `<button type="button" class="go-deeper-btn" data-go-deeper="${p.id}" aria-expanded="${state.open.has(p.id)}"><span>${state.open.has(p.id) ? "Close technical layer" : "Go deeper — the technical layer"}</span></button><div class="tech-tier ${state.open.has(p.id) ? "open" : ""}" id="techtier-${p.id}"><div class="tech-inner" id="techinner-${p.id}"></div></div>`
    : `<p class="tech-pending">Technical writeup in progress — check back soon.</p>`;

  const tb500Html = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">Scaffolding + Access Crew</span></div>
    <h2>TB-500</h2><p class="tagline">Systemic Repair Mobilization</p>
    <p class="card-desc">Think of damaged tissue as a job site repair crews can't easily reach. TB-500 doesn't build anything itself — it reorganizes the cellular scaffolding that lets repair cells move, opens vascular access, and helps the whole crew get where it's needed, anywhere in the body.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>Mobilizes repair activity across the body — muscle, vessels, and scar tissue alike.</p></div>
    ${chipGridHtml(p.id, TB500_CHIPS)}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to compare"}</button></div>
  </article>`};

  const bpc157Html = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">The Foreman</span></div>
    <h2>BPC-157</h2><p class="tagline">Repair Coordination Signal</p>
    <p class="card-desc">Think of it as the construction foreman for injured tissue — it doesn't build anything itself. It gets your body's repair crews to the site faster and keeps them working in an organized way instead of leaving a mess.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>BPC-157 helps your body heal itself by coordinating repair, not by being the building material. Use the lowest exposure that's actually doing that job.</p></div>
    ${chipGridHtml(p.id, BPC157_CHIPS)}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to compare"}</button></div>
  </article>`};

  const ghkcuHtml = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">Materials + Blueprints</span></div>
    <h2>GHK-Cu</h2><p class="tagline">Materials & Genomic Remodeling Signal</p>
    <p class="card-desc">Think of it as the materials-delivery and blueprints role on a repair crew — it doesn't coordinate the job (that's BPC-157) or move crews into place (that's TB-500). It delivers copper to the enzymes that need it and resets a slice of gene expression back toward a repair-oriented pattern.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>GHK-Cu supplies copper and gene-level remodeling instructions to a repair job — materials and blueprints, not the foreman or the access crew. Use the lowest exposure doing that job, and don't run it indefinitely without checking copper status.</p></div>
    ${chipGridHtml(p.id, GHKCU_CHIPS)}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to compare"}</button></div>
  </article>`};

  const motscHtml = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">Power-Plant Upgrade</span></div>
    <h2>MOTS-c</h2><p class="tagline">Mitochondrial & Grid Reprogrammer</p>
    <p class="card-desc">Think of it as the power plant on a repair crew — it doesn't coordinate the job, move crews into place, or deliver materials. It tells the cell to take up glucose without waiting on insulin and to build more mitochondria.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>MOTS-c is the power plant: insulin-independent glucose uptake and new mitochondria. Use the lowest exposure doing that job — and run it with SS-31 throughout, that pairing matters here even though SS-31 isn't its own card yet.</p></div>
    ${chipGridHtml(p.id, MOTSC_CHIPS)}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to compare"}</button></div>
  </article>`};

  const retatrutideHtml = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">Appetite & Fuel Traffic Controller</span></div>
    <h2>Retatrutide</h2><p class="tagline">Triple Metabolic Signal</p>
    <p class="card-desc">Think of Retatrutide like a traffic controller working across several metabolic signals at once — helping regulate appetite, food intake, and how the body handles fuel.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>Combines three metabolic signals (GLP-1, GIP, and glucagon) into one weekly shot. The goal is the lowest exposure that keeps producing the result you want, not the highest dose available.</p></div>
    ${chipGridHtml(p.id, chipsFor(p.id))}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to compare"}</button></div>
  </article>`};

  const kpvHtml = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">Site Safety Coordinator</span></div>
    <h2>KPV</h2><p class="tagline">Inflammatory Escalation Control</p>
    <p class="card-desc">Think of it as the site safety coordinator on a construction job — it doesn't build anything or move the crews. It turns down runaway inflammatory signaling so the repair crews can keep working without the whole site getting consumed by the response.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>Limits excessive inflammatory signaling so other repair processes aren't fighting a site-wide shutdown.</p></div>
    ${chipGridHtml(p.id, KPV_CHIPS)}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to compare"}</button></div>
  </article>`};

  const nadHtml = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">Rechargeable Power Carrier</span></div>
    <h2>NAD+</h2><p class="tagline">Energy Carrier & Repair Support</p>
    <p class="card-desc">Think of NAD+ like the rechargeable batteries used all over a construction site. Your body uses food to charge them, the batteries help carry that energy to the equipment that turns it into usable power, and then they have to be recharged and used again. Your repair crews use NAD+ too, so it helps with both making energy and maintaining the site.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>NAD+ helps carry energy through the system and supports cellular repair, but it only helps if the machinery using it can do its job.</p></div>
    ${chipGridHtml(p.id, NAD_CHIPS)}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to compare"}</button></div>
  </article>`};

  const cardHtml=p=>{
    if(p.id==="retatrutide")return retatrutideHtml(p);
    if(p.id==="bpc-157")return bpc157Html(p);
    if(p.id==="tb-500")return tb500Html(p);
    if(p.id==="ghk-cu")return ghkcuHtml(p);
    if(p.id==="mots-c")return motscHtml(p);
    if(p.id==="kpv")return kpvHtml(p);
    if(p.id==="nad")return nadHtml(p);
    const cat=categoryById(p.category),selected=state.selected.has(p.id);
    return `<article class="card ${selected?"selected":""}" data-id="${p.id}" data-category="${p.category}">
      <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short||"")}</span>${p.analogy?`<span class="badge analogy">${escapeHtml(p.analogy)}</span>`:""}</div>
      <h2>${escapeHtml(p.name)}</h2>
      ${p.tagline?`<p class="tagline">${escapeHtml(p.tagline)}</p>`:""}
      ${p.cardDescription?`<p class="card-desc">${escapeHtml(p.cardDescription)}</p>`:""}
      ${p.bottomLine?`<div class="bottom-line"><strong>Bottom line</strong><p>${escapeHtml(p.bottomLine)}</p></div>`:""}
      ${chipGridHtml(p.id, chipsFor(p.id))}
      ${goDeeperTierHtml(p)}
      <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected?"Selected":"Add to compare"}</button></div>
    </article>`;
  };
  const renderFilters=()=>{const chips=[{id:"all",label:"All"},...state.data.categories.map(c=>({id:c.id,label:c.short}))];els.filters.innerHTML=chips.map(c=>`<button type="button" class="chip" role="tab" data-cat="${c.id}" aria-pressed="${state.category===c.id}">${escapeHtml(c.label)}</button>`).join("")};
  const renderLibrary=()=>{const items=state.data.peptides.filter(matches);els.count.textContent=`${items.length} of ${state.data.peptides.length} entries`;els.grid.innerHTML=items.map(cardHtml).join("");els.empty.hidden=items.length>0};
  const renderPresets=()=>{els.presets.innerHTML=state.data.stacks.map(s=>`<button type="button" class="preset" data-stack="${s.id}" aria-pressed="${state.activeStack===s.id}">${escapeHtml(s.name)}</button>`).join("")};
  const renderCompare=()=>{const items=selectedPeptides();els.compareBoard.innerHTML=items.length===0?`<p class="empty">Select 2–5 peptides, or choose a preset above.</p>`:items.map(p=>`<div class="compare-col">${cardHtml(p)}</div>`).join("");const s=state.data.stacks.find(x=>x.id===state.activeStack);if(s){els.stackNote.hidden=false;els.stackNote.textContent=`${s.subtitle}. ${s.note}`}else els.stackNote.hidden=true};
  const renderDock=()=>{const n=state.selected.size,show=n>0&&state.view==="library";els.dock.hidden=!show;els.compareToggle.hidden=n<2;els.dockLabel.textContent=n===0?"0 selected":n===1?"1 selected · add 1–4 more":`${n} selected`;els.dockCompare.disabled=n<2||n>5;els.dockCompare.textContent=n<2?"Need 2–5":`Compare ${n}`};
  const markNav=view=>document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",(view==="compare"?"stacks":view)===b.dataset.nav));
  const setView=view=>{state.view=view;els.home.hidden=view!=="home";els.library.hidden=view!=="library";els.compare.hidden=view!=="compare";els.synergy.hidden=view!=="synergy";els.toolbar.dataset.hidden=view!=="library"?"true":"false";if(view==="library")renderLibrary();if(view==="compare"){renderPresets();renderCompare()}if(view==="synergy")renderSynergyList();renderDock();markNav(view);window.scrollTo({top:0,behavior:"smooth"})};
  const toggleOpen=id=>{state.open.has(id)?state.open.delete(id):state.open.add(id);state.view==="compare"?renderCompare():renderLibrary()};
  const jumpTo=(id,target)=>{state.open.add(id);state.view==="compare"?renderCompare():renderLibrary();requestAnimationFrame(()=>scrollWithOffset(document.getElementById(target)))};
  const toggleSelect=id=>{if(state.selected.has(id))state.selected.delete(id);else{if(state.selected.size>=5){els.dockLabel.textContent="Maximum 5 peptides";els.dock.hidden=false;return}state.selected.add(id)}const s=state.data.stacks.find(x=>x.peptideIds.length===state.selected.size&&x.peptideIds.every(pid=>state.selected.has(pid)));state.activeStack=s?s.id:null;persist();state.view==="compare"?renderCompare():renderLibrary();renderDock()};
  const applyStack=id=>{const s=state.data.stacks.find(x=>x.id===id);if(!s)return;state.selected=new Set(s.peptideIds.slice(0,5));state.activeStack=s.id;persist();setView("compare")};
  const onClick=e=>{const nav=e.target.closest("[data-nav]");if(nav){const v=nav.dataset.nav;if(v==="stacks")setView("compare");else setView(v);return}const jump=e.target.closest("[data-jump]");if(jump){e.stopPropagation();const card=jump.closest(".card");if(card)jumpTo(card.dataset.id,jump.dataset.jump);return}const homeJump=e.target.closest("[data-home-jump]");if(homeJump){scrollWithOffset(document.getElementById(homeJump.dataset.homeJump));return}const cat=e.target.closest("[data-cat]");if(cat){state.category=cat.dataset.cat;renderFilters();renderLibrary();return}const select=e.target.closest("[data-select]");if(select){toggleSelect(select.dataset.select);return}const toggle=e.target.closest("[data-toggle]");if(toggle){toggleOpen(toggle.dataset.toggle);return}
    const chip = e.target.closest("[data-chip]");
    if (chip) {
      const [cid, ri, key] = chip.dataset.chip.split("|");
      const slot = document.getElementById(`chipdetail-${cid}-${ri}`);
      const row = chip.closest(".chip-grid");
      const wasThisOpen = chip.getAttribute("aria-expanded") === "true";
      row.querySelectorAll(".chip-tile").forEach(t => t.setAttribute("aria-expanded", "false"));
      if (wasThisOpen) { slot.hidden = true; slot.innerHTML = ""; }
      else {
        const rows = chipsFor(cid) || [];
        const chipData = rows[Number(ri)]?.find(c => c.key === key);
        slot.innerHTML = chipData ? `<div class="chip-detail-inner">${chipData.detail}</div>` : "";
        slot.hidden = false;
        chip.setAttribute("aria-expanded", "true");
      }
      return;
    }
    const protocolDeeper = e.target.closest("[data-protocol-deeper]");
    if (protocolDeeper) {
      const id = protocolDeeper.dataset.protocolDeeper;
      const tier = document.getElementById(`ptier-${id}`);
      const nowOpen = !tier.classList.contains("open");
      tier.classList.toggle("open", nowOpen);
      protocolDeeper.setAttribute("aria-expanded", nowOpen ? "true" : "false");
      protocolDeeper.querySelector("span").textContent = nowOpen ? "Close" : "See the full reasoning";
      if (nowOpen) renderProtocolDoc(id, document.getElementById(`pinner-${id}`));
      return;
    }
        const goDeeper = e.target.closest("[data-go-deeper]");
    if (goDeeper) {
      const id = goDeeper.dataset.goDeeper;
      const tier = document.getElementById(`techtier-${id}`);
      const nowOpen = !tier.classList.contains("open");
      tier.classList.toggle("open", nowOpen);
      goDeeper.setAttribute("aria-expanded", nowOpen ? "true" : "false");
      goDeeper.querySelector("span").textContent = nowOpen ? "Close technical layer" : "Go deeper — the technical layer";
      if (nowOpen) renderTechTier(id, document.getElementById(`techinner-${id}`));
      return;
    }
    const techToggle = e.target.closest("[data-tech-toggle]");
    if (techToggle) {
      const [tid, idx] = techToggle.dataset.techToggle.split("|");
      const container = techToggle.closest(".tech-inner");
      const body = document.getElementById(`techsec-${tid}-${idx}`);
      const wasOpen = techToggle.getAttribute("aria-expanded") === "true";
      container.querySelectorAll(".tech-accordion-header").forEach(h => h.setAttribute("aria-expanded", "false"));
      container.querySelectorAll(".tech-accordion-body").forEach(b => b.hidden = true);
      if (!wasOpen) {
        body.hidden = false;
        techToggle.setAttribute("aria-expanded", "true");
        requestAnimationFrame(() => scrollWithOffset(techToggle));
      }
      return;
    }
    const stack=e.target.closest("[data-stack]");if(stack)applyStack(stack.dataset.stack)};
  const setOffline=()=>{els.offline.hidden=navigator.onLine};
  const bind=()=>{document.addEventListener("click",onClick);els.search.addEventListener("input",e=>{state.query=e.target.value;renderLibrary()});els.dockCompare.addEventListener("click",()=>setView("compare"));els.compareToggle.addEventListener("click",()=>setView("compare"));els.back.addEventListener("click",()=>setView("library"));const clear=()=>{state.selected.clear();state.activeStack=null;persist();state.view==="compare"?renderCompare():renderLibrary();renderDock()};els.dockClear.addEventListener("click",clear);els.clearCompare.addEventListener("click",clear);document.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;const t=e.target.closest(".card-summary[data-toggle]");if(!t)return;e.preventDefault();toggleOpen(t.dataset.toggle)});window.addEventListener("online",setOffline);window.addEventListener("offline",setOffline)};
  const registerWorker=()=>{if("serviceWorker" in navigator)navigator.serviceWorker.register("./service-worker.js").catch(()=>{})};
  const init=async()=>{bind();setOffline();restore();const response=await fetch("./data/peptides.json");state.data=await response.json();try{const protoRes=await fetch("./data/protocols.json");state.data.protocols=protoRes.ok?(await protoRes.json()).protocols||[]:[]}catch{state.data.protocols=[]}renderFilters();renderLibrary();renderDock();setView("home");registerWorker()};
  init().catch(error=>{els.grid.innerHTML="";els.empty.hidden=false;els.empty.textContent="Could not load peptide data. "+error.message});
})();
