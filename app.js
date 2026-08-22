(() => {
  const state={data:null,query:"",category:"all",selected:new Set(),open:new Set(),activeStack:null,view:"home"};
  const els={home:document.getElementById("home-view"),toolbar:document.getElementById("library-toolbar"),filters:document.getElementById("filters"),search:document.getElementById("search"),grid:document.getElementById("card-grid"),empty:document.getElementById("empty-state"),count:document.getElementById("result-count"),library:document.getElementById("library-view"),compare:document.getElementById("compare-view"),compareBoard:document.getElementById("compare-board"),presets:document.getElementById("stack-presets"),stackNote:document.getElementById("stack-note"),dock:document.getElementById("compare-dock"),dockLabel:document.getElementById("dock-label"),dockCompare:document.getElementById("dock-compare"),dockClear:document.getElementById("dock-clear"),clearCompare:document.getElementById("clear-compare"),back:document.getElementById("back-to-library"),compareToggle:document.getElementById("compare-toggle"),offline:document.getElementById("offline-pill")};
  const escapeHtml=v=>String(v).replace(/&/g,["&","amp;"].join("")).replace(/</g,["&","lt;"].join("")).replace(/>/g,["&","gt;"].join("")).replace(/"/g,["&","quot;"].join(""));
  const categoryById=id=>state.data.categories.find(c=>c.id===id); const selectedPeptides=()=>state.data.peptides.filter(p=>state.selected.has(p.id));
  const persist=()=>{try{localStorage.setItem("peptide-ref-selected",JSON.stringify([...state.selected]))}catch{}}; const restore=()=>{try{const r=JSON.parse(localStorage.getItem("peptide-ref-selected")||"[]");if(Array.isArray(r))r.slice(0,5).forEach(id=>state.selected.add(id))}catch{}};
  const doseText = p => typeof p.dose === "string" ? p.dose : [p.dose.summary, p.dose.axisNote, ...(p.dose.rows || []).map(r => `${r.label} ${r.range} ${r.note || ""}`), p.dose.reference, p.dose.divergence, p.dose.routes].filter(Boolean).join(" ");
  const doseDetailHtml = p => { if (typeof p.dose === "string") return `<p>${escapeHtml(p.dose)}</p>`; const d = p.dose; const rows = (d.rows || []).map(r => `<div class="dose-row"><span class="dose-label">${escapeHtml(r.label)}</span><span class="dose-range">${escapeHtml(r.range)}</span>${r.note ? `<span class="dose-note">${escapeHtml(r.note)}</span>` : ""}</div>`).join(""); return `<div class="dose-tiers">${rows}</div>` + (d.axisNote ? `<p class="dose-axis">${escapeHtml(d.axisNote)}</p>` : "") + (d.routes ? `<p class="dose-axis">${escapeHtml(d.routes)}</p>` : "") + (d.reference ? `<p class="dose-ref"><strong>Trial-derived:</strong> ${escapeHtml(d.reference)}${d.divergence ? ` ${escapeHtml(d.divergence)}` : ""}</p>` : ""); };
  const matches=p=>{if(state.category!=="all"&&p.category!==state.category)return false;const q=state.query.trim().toLowerCase();if(!q)return true;return [p.name,...(p.aka||[]),p.analogy,p.tagline,p.cardDescription,p.bottomLine,doseText(p),p.halfLife,p.timing,p.cycling,p.mechanism,...(p.cautions||[]),...(p.supplements||[]),categoryById(p.category)?.label||""].join(" ").toLowerCase().includes(q)};
  const listHtml=items=>`<ul>${items.map(i=>`<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  const factsHtml=p=>`<dl class="facts"><div class="fact"><dt>Dose</dt><dd>${escapeHtml(typeof p.dose === "string" ? p.dose : p.dose.summary)}</dd></div><div class="fact"><dt>Half-life</dt><dd>${escapeHtml(p.halfLife)}</dd></div><div class="fact"><dt>Timing / food</dt><dd>${escapeHtml(p.timing)}</dd></div><div class="fact"><dt>Cycling</dt><dd>${escapeHtml(p.cycling)}</dd></div></dl>`;
  const jumpAttr=(id,section)=>`data-jump="${id}-${section}"`;

  const TECH_DOC_NAMES = {
    "tb-500": "TB-500_Compound_Research.md",
    "bpc-157": "BPC-157_Compound_Research.md",
    "ghk-cu": "GHK-Cu_Compound_Research.md",
    "mots-c": "MOTS-c_Compound_Research.md",
    "retatrutide": "Retatrutide_Compound_Research.md"
  };
  const techCache = new Map();
  const inlineMd = t => { let s = escapeHtml(t); s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); s = s.replace(/\*(.+?)\*/g, "<em>$1</em>"); s = s.replace(/`(.+?)`/g, "<code>$1</code>"); return s };
  const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const parseResearchDoc = md => {
    const lines = md.split("\n"); const sections = []; let current = null, paraBuf = [], listBuf = null; const usedIds = new Set();
    const uniqueId = base => { let id = base, n = 2; while (usedIds.has(id)) id = `${base}-${n++}`; usedIds.add(id); return id };
    const flushPara = () => { if (paraBuf.length && current) { const text = paraBuf.join(" ").trim(); if (text) current.html += `<p>${inlineMd(text)}</p>` } paraBuf = [] };
    const flushList = () => { if (listBuf && listBuf.items.length && current) { const tag = listBuf.type; current.html += `<${tag}>${listBuf.items.map(i => `<li>${inlineMd(i)}</li>`).join("")}</${tag}>` } listBuf = null };
    for (let raw of lines) {
      const line = raw.replace(/\r$/, "");
      const h2 = line.match(/^##\s+(.+)$/), h3 = line.match(/^###\s+(.+)$/), ul = line.match(/^[-*]\s+(.+)$/), ol = line.match(/^\d+\.\s+(.+)$/);
      if (h2) { flushList(); flushPara(); if (current) sections.push(current); const title = h2[1].trim(); current = { id: uniqueId(slugify(title)), title, html: "", subs: [] }; continue }
      if (h3) { flushList(); flushPara(); if (current) { const title = h3[1].trim(); const id = uniqueId(slugify(title)); current.subs.push({ id, title }); current.html += `<h4 id="${id}">${inlineMd(title)}</h4>` } continue }
      if (ul) { flushPara(); if (!listBuf || listBuf.type !== "ul") { flushList(); listBuf = { type: "ul", items: [] } } listBuf.items.push(ul[1].trim()); continue }
      if (ol) { flushPara(); if (!listBuf || listBuf.type !== "ol") { flushList(); listBuf = { type: "ol", items: [] } } listBuf.items.push(ol[1].trim()); continue }
      if (line.trim() === "") { flushList(); flushPara(); continue }
      if (line.trim() === "---") continue;
      paraBuf.push(line.trim());
    }
    flushList(); flushPara(); if (current) sections.push(current);
    return sections;
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
      container.innerHTML = sections.map((s, i) => `<div class="tech-accordion-item"><button type="button" class="tech-accordion-header" data-tech-toggle="${id}|${i}" aria-expanded="false"><span>${escapeHtml(s.title)}</span></button><div class="tech-accordion-body" id="techsec-${id}-${i}" hidden>${s.html}</div></div>`).join("");
    } catch (err) {
      container.innerHTML = `<p class="tech-error">Couldn't load the technical layer${typeof navigator !== "undefined" && !navigator.onLine ? " — you're offline and it hasn't been cached yet" : ""}. It'll work offline once you've opened it while connected at least once.</p>`;
    }
  };
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
      { key: "watch", label: "Watch for", value: "No long-term data", detail: `<p>No long-term human safety studies exist for this yet — worth knowing, not a reason for alarm. It's working with something your body already makes, not introducing something foreign, which is part of why the practical experience with it has been reassuring.</p><p>Still, pay attention to how you're feeling with repeated use, the same way you'd watch for any new pattern.</p>` },
      { key: "support", label: "Take alongside", value: "6 picks", detail: `<p>Vitamin C, collagen peptides, omega-3s, magnesium glycinate, NAC, and zinc — the raw materials your body actually uses to build with once TB-500 gets repair cells where they need to go.</p>` },
      { key: "pairs", label: "Pairs well with", value: "3 compounds", detail: `<p><b>BPC-157</b> — the foreman coordinating the repair job on-site.</p><p><b>GHK-Cu</b> — delivers the materials once cells arrive.</p><p><b>MOTS-c</b> — keeps energy available, since healing costs fuel.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>This isn't really an "injury peptide" — its real job is getting repair cells where they need to go. Injury relief is a downstream result of that, not the mechanism itself.</p><p>Old injuries can actually respond well, because they're often stuck behind poor blood flow and old scar tissue — and this addresses both. And again: you don't need to inject near the injury. It finds its way there on its own.</p>` }
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
      { key: "support", label: "Take alongside", value: "7 picks", detail: `<p>Vitamin C, collagen peptides, zinc carnosine, NAC, glutamine, silica, and lysine/proline — these give your body the raw materials while BPC-157 is coordinating the repair job.</p>` },
      { key: "pairs", label: "Pairs well with", value: "TB-500", detail: `<p>BPC-157 is the foreman running the local job site; TB-500 is the access crew getting repair cells there from anywhere in the body. Different, non-overlapping jobs — complementary on paper, though the actual combination hasn't been tested directly.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>This is the foreman, not the lumber — it coordinates the repair, it isn't the building material itself. The usual 4–6 week cycling advice is convention, not receptor biology; there's no receptor here to reset.</p><p>And taking it orally is really about reaching the gut lining directly, not a sneaky way to get it systemically — that's a different route with different reach.</p>` }
    ]
  ];

  const GHKCU_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "1–2mg SQ", detail: `<p>Most protocols start around 1 milligram a day for the first couple weeks, step up to 2 milligrams, then settle into 1 to 2 milligrams two or three times a week for maintenance. This whole ladder is practitioner convention — there's no controlled human dosing trial behind injectable GHK-Cu at any amount.</p><p>Worth knowing: the researcher most of this convention traces back to actually estimated you'd need something like 100 to 200 milligrams for a real systemic effect — 50 to 100 times what people actually use. That's not a suggestion to go anywhere near that number. It just means the low end isn't validated either — it's a conservative starting point, not a tested minimum.</p>` },
      { key: "timing", label: "Timing", value: "Anytime", detail: `<p>Food doesn't matter for timing. If you're using the topical version instead, twice a day is the common pattern.</p>` },
      { key: "cycling", label: "Cycling", value: "4–12wks on/2–4 off", detail: `<p>If you're injecting it, cycle 4 to 12 weeks on with 2 to 4 off — that's more about managing copper load than any receptor getting worn out, since no receptor's been identified here. Topical use can run continuously for 8 to 12 weeks since barely any of it gets into your bloodstream through skin.</p>` },
      { key: "expect", label: "What to expect", value: "2–6wks", detail: `<p>Early on: mild skin or inflammation changes, maybe better tolerance of training stress. Real, visible skin or connective-tissue improvement usually shows up over 2 to 6 weeks. This is quiet biology, not a stimulant-type effect — don't expect it to do BPC-157 or TB-500's job.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Copper load", detail: `<p>The real open question isn't cancer — if anything, the data leans toward this helping, not hurting, on that front. It's chronic copper buildup from repeated injecting that has zero long-term human safety data. Topical's been safe for decades because almost none of it gets into your system through skin; injecting bypasses that safety margin entirely.</p>` },
      { key: "support", label: "Take alongside", value: "5 picks", detail: `<p>Vitamin C, silica, collagen peptides, zinc, and resveratrol — collagen-building cofactors, plus resveratrol, which appears to amplify GHK-Cu's gene-level effects.</p>` },
      { key: "pairs", label: "Pairs well with", value: "BPC-157 + TB-500", detail: `<p><b>BPC-157</b> — GHK-Cu supplies the copper and remodeling instructions, BPC-157 coordinates the actual repair.</p><p><b>TB-500</b> — TB-500 gets repair cells to the site, GHK-Cu supplies what they need once they're there. Together with BPC-157, these three are sometimes called the "Repair Stack."</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>A lot of consumer GHK-Cu content quietly borrows evidence from topical cosmetic studies to imply support for injecting it systemically — those are genuinely different situations, and the well-controlled human trials all belong to the topical side.</p><p>And nearly every "reprograms thousands of genes" claim traces back to one commercially-invested lab — that doesn't make it false, just not independently stress-tested.</p>` }
    ]
  ];

  const MOTSC_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "5mg SC 2–3x/wk", detail: `<p>5 milligrams under the skin, two to three times a week — that's practitioner convention, not a number that came out of a human dosing trial.</p>` },
      { key: "timing", label: "Timing", value: "Anytime", detail: `<p>Time of day doesn't appear to matter here — that's not something the source material actually addresses either way. What does matter: the downstream mitochondrial work outlasts how long the peptide is actually in your blood, so dosing more often than the working schedule isn't automatically doing more.</p>` },
      { key: "cycling", label: "Cycling", value: "8–12wks on/1–2 off", detail: `<p>Run it 8 to 12 weeks, then take 1 to 2 weeks off — and pair it with SS-31 the whole way through if you can, that combination is doing real work here even though SS-31 isn't its own card yet.</p>` },
      { key: "expect", label: "What to expect", value: "~6.5wks", detail: `<p>Early on you might notice a shift in energy or glucose handling — not a stimulant kick. The real mitochondrial building is slower; one household case saw real improvement show up around 6.5 weeks in. If it fades within a couple weeks after stopping, that's detraining, not the treatment failing.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "No receptor to reset", detail: `<p>There's no receptor here to wear out or need a break from — MOTS-c works enzymatically, not through a receptor. The off-period is really a checkpoint (how are you feeling, any reaction at the injection site) rather than something your biology requires.</p>` },
      { key: "support", label: "Take alongside", value: "5 picks", detail: `<p>Berberine, CoQ10 with MCT, alpha-lipoic acid, magnesium glycinate, and chromium — supporting the same AMPK and mitochondrial pathway MOTS-c is working through.</p>` },
      { key: "pairs", label: "Pairs well with", value: "SS-31 + 2 more", detail: `<p><b>SS-31</b> — MOTS-c builds new mitochondria, SS-31 protects what gets built. Run MOTS-c first, SS-31 alongside through the cycle.</p><p><b>TB-500</b> and <b>GHK-Cu</b> — repair work costs energy either way, so pairing with the power plant makes mechanistic sense, even without a combined trial to point to.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>A lot of MOTS-c cycling advice borrows "receptor reset" language from a completely different kind of peptide — that's not how this one works. Fading after you stop is exactly what you'd expect from something that works like exercise does, not proof it failed.</p><p>And the claim that this helps your liver through something called FGF-21 has it backwards — the data actually shows both rising together with worse liver disease, not one helping the other.</p>` }
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

  const CHIP_REGISTRY = { "tb-500": TB500_CHIPS, "bpc-157": BPC157_CHIPS, "ghk-cu": GHKCU_CHIPS, "mots-c": MOTSC_CHIPS, "retatrutide": RETATRUTIDE_CHIPS };

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
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to synergy"}</button></div>
  </article>`};

  const bpc157Html = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">The Foreman</span></div>
    <h2>BPC-157</h2><p class="tagline">Repair Coordination Signal</p>
    <p class="card-desc">Think of it as the construction foreman for injured tissue — it doesn't build anything itself. It gets your body's repair crews to the site faster and keeps them working in an organized way instead of leaving a mess.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>BPC-157 helps your body heal itself by coordinating repair, not by being the building material. Use the lowest exposure that's actually doing that job.</p></div>
    ${chipGridHtml(p.id, BPC157_CHIPS)}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to synergy"}</button></div>
  </article>`};

  const ghkcuHtml = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">Materials + Blueprints</span></div>
    <h2>GHK-Cu</h2><p class="tagline">Materials & Genomic Remodeling Signal</p>
    <p class="card-desc">Think of it as the materials-delivery and blueprints role on a repair crew — it doesn't coordinate the job (that's BPC-157) or move crews into place (that's TB-500). It delivers copper to the enzymes that need it and resets a slice of gene expression back toward a repair-oriented pattern.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>GHK-Cu supplies copper and gene-level remodeling instructions to a repair job — materials and blueprints, not the foreman or the access crew. Use the lowest exposure doing that job, and don't run it indefinitely without checking copper status.</p></div>
    ${chipGridHtml(p.id, GHKCU_CHIPS)}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to synergy"}</button></div>
  </article>`};

  const motscHtml = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">Power-Plant Upgrade</span></div>
    <h2>MOTS-c</h2><p class="tagline">Mitochondrial & Grid Reprogrammer</p>
    <p class="card-desc">Think of it as the power plant on a repair crew — it doesn't coordinate the job, move crews into place, or deliver materials. It tells the cell to take up glucose without waiting on insulin and to build more mitochondria.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>MOTS-c is the power plant: insulin-independent glucose uptake and new mitochondria. Use the lowest exposure doing that job — and run it with SS-31 throughout, that pairing matters here even though SS-31 isn't its own card yet.</p></div>
    ${chipGridHtml(p.id, MOTSC_CHIPS)}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to synergy"}</button></div>
  </article>`};

  const retatrutideHtml = p => { const cat = categoryById(p.category), selected = state.selected.has(p.id); return `<article class="card ${selected ? "selected" : ""}" data-id="${p.id}" data-category="${p.category}">
    <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short || "")}</span><span class="badge analogy">Appetite & Fuel Traffic Controller</span></div>
    <h2>Retatrutide</h2><p class="tagline">Triple Metabolic Signal</p>
    <p class="card-desc">Think of Retatrutide like a traffic controller working across several metabolic signals at once — helping regulate appetite, food intake, and how the body handles fuel.</p>
    <div class="bottom-line"><strong>Bottom line</strong><p>Combines three metabolic signals (GLP-1, GIP, and glucagon) into one weekly shot. The goal is the lowest exposure that keeps producing the result you want, not the highest dose available.</p></div>
    ${chipGridHtml(p.id, chipsFor(p.id))}
    ${goDeeperTierHtml(p)}
    <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected ? "Selected" : "Add to synergy"}</button></div>
  </article>`};

  const cardHtml=p=>{
    if(p.id==="retatrutide")return retatrutideHtml(p);
    if(p.id==="bpc-157")return bpc157Html(p);
    if(p.id==="tb-500")return tb500Html(p);
    if(p.id==="ghk-cu")return ghkcuHtml(p);
    if(p.id==="mots-c")return motscHtml(p);
    const cat=categoryById(p.category),selected=state.selected.has(p.id);
    return `<article class="card ${selected?"selected":""}" data-id="${p.id}" data-category="${p.category}">
      <div class="badge-row"><span class="badge cat">${escapeHtml(cat?.short||"")}</span>${p.analogy?`<span class="badge analogy">${escapeHtml(p.analogy)}</span>`:""}</div>
      <h2>${escapeHtml(p.name)}</h2>
      ${p.tagline?`<p class="tagline">${escapeHtml(p.tagline)}</p>`:""}
      ${p.cardDescription?`<p class="card-desc">${escapeHtml(p.cardDescription)}</p>`:""}
      ${p.bottomLine?`<div class="bottom-line"><strong>Bottom line</strong><p>${escapeHtml(p.bottomLine)}</p></div>`:""}
      ${chipGridHtml(p.id, genericChips(p))}
      ${goDeeperTierHtml(p)}
      <div class="card-actions"><button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">${selected?"Selected":"Add to synergy"}</button></div>
    </article>`;
  };
  const renderFilters=()=>{const chips=[{id:"all",label:"All"},...state.data.categories.map(c=>({id:c.id,label:c.short}))];els.filters.innerHTML=chips.map(c=>`<button type="button" class="chip" role="tab" data-cat="${c.id}" aria-pressed="${state.category===c.id}">${escapeHtml(c.label)}</button>`).join("")};
  const renderLibrary=()=>{const items=state.data.peptides.filter(matches);els.count.textContent=`${items.length} of ${state.data.peptides.length} entries`;els.grid.innerHTML=items.map(cardHtml).join("");els.empty.hidden=items.length>0};
  const renderPresets=()=>{els.presets.innerHTML=state.data.stacks.map(s=>`<button type="button" class="preset" data-stack="${s.id}" aria-pressed="${state.activeStack===s.id}">${escapeHtml(s.name)}</button>`).join("")};
  const renderCompare=()=>{const items=selectedPeptides();els.compareBoard.innerHTML=items.length===0?`<p class="empty">Select 2–5 peptides, or choose a synergy above.</p>`:items.map(p=>`<div class="compare-col">${cardHtml(p)}</div>`).join("");const s=state.data.stacks.find(x=>x.id===state.activeStack);if(s){els.stackNote.hidden=false;els.stackNote.textContent=`${s.subtitle}. ${s.note}`}else els.stackNote.hidden=true};
  const renderDock=()=>{const n=state.selected.size,show=n>0&&state.view==="library";els.dock.hidden=!show;els.compareToggle.hidden=n<2;els.dockLabel.textContent=n===0?"0 selected":n===1?"1 selected · add 1–4 more":`${n} selected`;els.dockCompare.disabled=n<2||n>5;els.dockCompare.textContent=n<2?"Need 2–5":`Compare ${n}`};
  const markNav=view=>document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",(view==="compare"?"stacks":view)===b.dataset.nav));
  const setView=view=>{state.view=view;els.home.hidden=view!=="home";els.library.hidden=view!=="library";els.compare.hidden=view!=="compare";els.toolbar.dataset.hidden=view!=="library"?"true":"false";if(view==="library")renderLibrary();if(view==="compare"){renderPresets();renderCompare()}renderDock();markNav(view);window.scrollTo({top:0,behavior:"smooth"})};
  const toggleOpen=id=>{state.open.has(id)?state.open.delete(id):state.open.add(id);state.view==="compare"?renderCompare():renderLibrary()};
  const jumpTo=(id,target)=>{state.open.add(id);state.view==="compare"?renderCompare():renderLibrary();requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView({behavior:"smooth",block:"start"}))};
  const toggleSelect=id=>{if(state.selected.has(id))state.selected.delete(id);else{if(state.selected.size>=5){els.dockLabel.textContent="Maximum 5 peptides";els.dock.hidden=false;return}state.selected.add(id)}const s=state.data.stacks.find(x=>x.peptideIds.length===state.selected.size&&x.peptideIds.every(pid=>state.selected.has(pid)));state.activeStack=s?s.id:null;persist();state.view==="compare"?renderCompare():renderLibrary();renderDock()};
  const applyStack=id=>{const s=state.data.stacks.find(x=>x.id===id);if(!s)return;state.selected=new Set(s.peptideIds.slice(0,5));state.activeStack=s.id;persist();setView("compare")};
  const onClick=e=>{const nav=e.target.closest("[data-nav]");if(nav){const v=nav.dataset.nav;if(v==="stacks")setView("compare");else setView(v);return}const jump=e.target.closest("[data-jump]");if(jump){e.stopPropagation();const card=jump.closest(".card");if(card)jumpTo(card.dataset.id,jump.dataset.jump);return}const homeJump=e.target.closest("[data-home-jump]");if(homeJump){document.getElementById(homeJump.dataset.homeJump)?.scrollIntoView({behavior:"smooth"});return}const cat=e.target.closest("[data-cat]");if(cat){state.category=cat.dataset.cat;renderFilters();renderLibrary();return}const select=e.target.closest("[data-select]");if(select){toggleSelect(select.dataset.select);return}const toggle=e.target.closest("[data-toggle]");if(toggle){toggleOpen(toggle.dataset.toggle);return}
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
        requestAnimationFrame(() => techToggle.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
      return;
    }
    const stack=e.target.closest("[data-stack]");if(stack)applyStack(stack.dataset.stack)};
  const setOffline=()=>{els.offline.hidden=navigator.onLine};
  const bind=()=>{document.addEventListener("click",onClick);els.search.addEventListener("input",e=>{state.query=e.target.value;renderLibrary()});els.dockCompare.addEventListener("click",()=>setView("compare"));els.compareToggle.addEventListener("click",()=>setView("compare"));els.back.addEventListener("click",()=>setView("library"));const clear=()=>{state.selected.clear();state.activeStack=null;persist();state.view==="compare"?renderCompare():renderLibrary();renderDock()};els.dockClear.addEventListener("click",clear);els.clearCompare.addEventListener("click",clear);document.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;const t=e.target.closest(".card-summary[data-toggle]");if(!t)return;e.preventDefault();toggleOpen(t.dataset.toggle)});window.addEventListener("online",setOffline);window.addEventListener("offline",setOffline)};
  const registerWorker=()=>{if("serviceWorker" in navigator)navigator.serviceWorker.register("./service-worker.js").catch(()=>{})};
  const init=async()=>{bind();setOffline();restore();const response=await fetch("./data/peptides.json");state.data=await response.json();renderFilters();renderLibrary();renderDock();setView("home");registerWorker()};
  init().catch(error=>{els.grid.innerHTML="";els.empty.hidden=false;els.empty.textContent="Could not load peptide data. "+error.message});
})();
