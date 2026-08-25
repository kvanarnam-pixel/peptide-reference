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
        const res = await fetch("./research/" + encodeURIComponent(TECH_DOC_NAMES[id]));
        if (!res.ok) throw new Error("fetch failed");
        sections = parseResearchDoc(await res.text());
        techCache.set(id, sections);
      }
      container.innerHTML = sections.map((s, i) => `<div class="tech-accordion-item"><button type="button" class="tech-accordion-header" data-tech-toggle="${id}|${i}" aria-expanded="false"><span>${escapeHtml(s.title)}</span></button><div class="tech-accordion-body" id="techsec-${id}-${i}" hidden>${s.html}</div></div>`).join("");
    } catch (err) {
      container.innerHTML = `<p class="tech-error">Couldn't load the technical layer${typeof navigator !== "undefined" && !navigator.onLine ? " — you're offline and it hasn't been cached yet" : ""}. It'll work offline once you've opened it while connected at least once.</p>`;
    }
  };
  const PROTOCOL_DOC_NAMES = {
    "systemic-inflammation": "Systemic_Inflammation.md",
    "diabetic-neuropathy": "Diabetic_Neuropathy.md"
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
      { key: "support", label: "Take alongside", value: "The basics", detail: `<p>BPC-157 is the foreman — it doesn't bring the lumber. Enough protein, adequate vitamin C, progressive loading, and enough recovery are what the body actually rebuilds with. Collagen or gelatin is a convenient way to supply those amino acids, not a BPC-specific requirement.</p>` },
      { key: "pairs", label: "Pairs well with", value: "TB-500", detail: `<p>BPC-157 is the foreman running the local job site; TB-500 is the access crew getting repair cells there from anywhere in the body. Different jobs — but a direct rat tendon study testing both together found no added benefit from combining them over either one alone. Complementary on paper; not proven as a combo in practice.</p>` },
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

  const ARA290_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "4mg SQ daily", detail: `<p>4 milligrams under the skin, once a day — this is one of the few compounds here where the practical dose and the trial dose are the same number. The sarcoidosis trial actually tested a range (1, 4, and 8 mg), and 4 mg came out clearest. 8 mg wasn't simply stronger, so more isn't automatically better here.</p>` },
      { key: "timing", label: "Timing", value: "Daily, any time", detail: `<p>No trial has flagged time-of-day as mattering, and food doesn't affect it. Both completed trials just dosed once daily for the full course.</p>` },
      { key: "cycling", label: "Cycling", value: "28 days — not a ceiling", detail: `<p>28 days is how long the trials happened to run, not a biological limit. Nobody's tested it longer, nobody's tested it shorter — that's an absence of data, not evidence that day 29 is a problem. There's no receptor here that wears out with repeated use, the receptor it works through barely exists on healthy tissue to begin with, and the EPO-side-effect risk (blood thickening) was specifically engineered out of this molecule. The "28 on, 56 off" number that circulates online doesn't trace back to any trial or source we could verify — treat it as unconfirmed, not as a rule.</p>` },
      { key: "expect", label: "What to expect", value: "Builds for months", detail: `<p>In the sarcoidosis trial, nerve fiber density kept increasing for 16 weeks after a single 28-day course ended — the repair process runs well past the last injection. If a course doesn't look "finished" right when the shots stop, that's expected, not a sign it didn't work.</p>` }
    ],
    [
      { key: "watch", label: "Watch for at home", value: "4 signs to track", detail: `<p>The trials measured recovery with equipment nobody has at home — here's what the same biology looks like from outside. Nerve regrowth moves from the body outward, so improvement plausibly shows up first closer to the wrist or ankle before it reaches fingers or toes — track where the symptomatic edge sits, not just "better or worse."</p><p>A shift from constant burning to intermittent tingling or odd "static" sensations can mean fibers are reconnecting and firing sporadically — that's a possible sign of repair, not failure. A simple temperature check (warm vs. cool touch, affected side vs. unaffected) tests the same small-fiber population the trials measured. And judge on a longer clock than the dosing window — resolution can lag the last dose by months.</p>` },
      { key: "support", label: "Take alongside", value: "6 picks", detail: `<p>ALA, benfotiamine, omega-3 DHA, methylated B12, magnesium glycinate, and liposomal glutathione — supporting nerve conduction and myelin while ARA-290 handles the injury-site signaling. Not sourced to trial data for this specific compound yet — flagged for a future pass.</p>` },
      { key: "cautions", label: "Cautions", value: "4 to know", detail: `<p>Two Phase 2 trials is genuinely strong evidence for this reference, but it's still Phase 2, still 28 days, still from one concentrated research group — not an approved therapy. It's engineered specifically to avoid EPO's blood-thickening receptor, so don't treat it as "a form of EPO."</p><p>If any new or unexpected symptom shows up — especially a new malignancy diagnosis — stop and see a physician. Not because any trial showed it causes cancer, but because its core mechanism tells stressed cells to survive rather than die, which is exactly what helps a damaged nerve and exactly what deserves scrutiny elsewhere. And there's no safety data past about two months of total observation — anything beyond that is genuinely unstudied territory.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>The receptor this compound depends on barely exists without injury or inflammation to switch it on — it's not a general tonic, it's damage-triggered. And a full course "not working" by day 28, or even by the end of a shorter off-period, doesn't mean it failed. The repair process it kicks off keeps running for months — you may just be checking before the biology finished.</p>` }
    ]
  ];

  const KPV_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "400 mcg–1 mg/day SC", detail: `<p>200 to 500 micrograms per dose, under the skin, once or twice a day — a twice-daily protocol at that range totals roughly 400 mcg to 1 mg a day, not a flat per-day ceiling. That's community convention, not a validated dose-response curve; there's no tested minimum or saturation point in the literature. Stay at the lowest exposure that's actually moving the inflammatory job you brought it in for; results earn a step up, not the calendar.</p>` },
      { key: "timing", label: "Timing", value: "Anytime, food-independent", detail: `<p>Time of day and food don't matter for an injected dose. Once a day is the simplest rhythm; twice-daily is the more common pattern in practice, though it isn't justified by a measured KPV half-life, because that dataset doesn't exist.</p>` },
      { key: "cycling", label: "Cycling", value: "No reset required", detail: `<p>No biological cycling requirement has been shown. Preclinical work kept activity with continuous exposure, so this isn't a receptor-reset peptide. Run it while a defined inflammatory job is present. An off-period is a response test — if the target stays quiet off it, you may not need to keep going.</p>` },
      { key: "expect", label: "What to expect", value: "Target, not a feeling", detail: `<p>Don't judge this by whether you "feel" a dose. Pick the inflammatory problem first (gut flare pattern, tissue-specific symptoms, a marker if you have one). Signaling can start quickly; visible movement in models was usually days to a few weeks. hs-CRP is a blunt systemic marker, not a KPV-specific scorecard — it not falling doesn't prove nothing happened.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "No long-term human data", detail: `<p>No adequate long-term human safety dataset exists. Watch the actual inflammatory target, not an after-dose sensation. Don't treat K(D)PT trial results as if they were free-base KPV — related molecule, different evidence.</p>` },
      { key: "support", label: "Take alongside", value: "7 picks", detail: `<p>Curcumin, glutamine, zinc carnosine, omega-3 EPA/DHA, quercetin, liposomal glutathione, and boswellia — supporting overlapping inflammatory and barrier pathways. Mechanistic companions, not a combined-use trial stack.</p>` },
      { key: "pairs", label: "Pairs well with", value: "Foreman first after", detail: `<p><b>BPC-157</b> — site safety first, then the foreman coordinates repair in a quieter environment.</p><p><b>TB-500</b> and <b>GHK-Cu</b> — access crew and materials once the site isn't in a shutdown. That's sequence logic, not a combined trial.</p><p><b>MOTS-c / SS-31</b> — KPV is not a mitochondrial peptide; pairing is about less inflammatory interference with energy systems.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>This is not "shutting inflammation off" and it is not a repair peptide. It limits excessive escalation so other crews can keep working. Sequence from α-MSH is not pharmacology from α-MSH. Community microgram ranges are convention, not validated human pharmacology.</p>` }
    ]
  ];

  const SS31_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "Start low, let response decide", detail: `<p>The only human dose with real trial support is 40 mg SC daily — the FDA-approved FORZINITY dose, studied specifically in Barth syndrome. Community protocols commonly run 1–5 mg SC daily (some go to 10 mg), but that number traces back to mouse allometric scaling, not a human dose-finding study. This reference's own starting point is more conservative still — low-single-digit milligram or even sub-milligram daily — because there's no human data showing any low dose does anything on its own, so there's no reason to start higher than necessary. Daily dosing fits the pharmacology better than an every-other-day schedule. Morning is the common practical convention; no trial shows timing matters, and food doesn't either. See "How you'll know" for what to actually do with that starting dose.</p>` },
      { key: "know", label: "How you'll know", value: "Baseline it, then check", detail: `<p>This is this reference's own framework, not a cited protocol — built from SS-31's pharmacology, not a dose-finding trial. Pick 2–3 specific, repeatable things that are currently limited before you start — not "more energy," but something like "I can walk the block but my legs are cooked after" or "I complete three sets but collapse on four and five." Quantify each simply: distance/time, effort, recovery time, next-day cost.</p><p><b>Week 1</b> — tolerance only (injection reactions, dizziness, unusual fatigue). Don't chase dose yet.<br><b>Weeks 2–4</b> — look for reproducibility against your baseline.<br><b>Weeks 4–6</b> — decide: clearly improving → don't increase, it's already working. Some improvement → cautious escalation is reasonable. No improvement → don't keep raising the dose; reconsider whether membrane efficiency is really the bottleneck (substrate, anemia, glucose, inflammation, sleep, deconditioning, or mitochondrial quantity are all real alternatives this compound doesn't touch). Worse → hold and reassess. A reproducible decline is not "mitochondrial detox" — that explanation has no mechanistic basis here.</p>` },
      { key: "cycling", label: "Cycling", value: "Evaluate, don't reset", detail: `<p>No mandatory on/off cycle — there's no receptor to desensitize, and the longest trial (TAZPOWER's open-label extension) ran continuous daily dosing for 168 weeks with most labs and vitals staying stable (one exception: eosinophil counts tend to rise with 30+ days of exposure, typically peaking around 90 days, per the FDA label). Instead of a calendar-driven break, use a defined 4–6 week evaluation window and let the result decide — keep going if it's working, stop if it isn't. Once you've clearly improved, deliberately stopping and re-measuring is itself informative: if function holds, you may not need to stay on it; if it drifts back toward baseline, that's real evidence a low maintenance dose is doing something, not just a guess. SS-31's short half-life and lack of accumulation are consistent with an ongoing-protection mechanism rather than a one-time fix, so maintenance dosing is mechanistically reasonable once a clear result is reached — but resuming at a lower dose than what worked isn't supported by any data; that's inference, not a finding.</p>` },
      { key: "expect", label: "What to expect", value: "Works fast, feels slow", detail: `<p>The molecular effect can start within hours — a trial in older adults with impaired mitochondrial function found a single infusion measurably raised ATP-production capacity the same day, though the effect was gone a week later and didn't translate into less fatigue. Don't expect to feel that. Injection-site reactions are the most likely thing you'll actually notice in the first days to weeks, alongside a transient tired/drained feeling on ramp-up that usually resolves in 1–3 weeks (community-reported pattern, not trial data). In the trial population with the clearest signal (Barth syndrome), meaningful improvement was still building at 168 weeks. This is a slow, cumulative-repair compound for how you'll feel — even though the underlying biology can move within a day.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Injection site reactions", detail: `<p>Injection-site reactions (itching, pain, redness, bruising) are the single most common adverse event across every trial — rotate sites. It missed its primary endpoint in three separate trials (heart failure, macular degeneration, general mitochondrial myopathy), though each showed a secondary signal worth taking seriously, not dismissing. Kidney function matters here too: exposure rises meaningfully with reduced renal function, and the FDA-approved dose drops from 40 mg to 20 mg daily below an eGFR of 30.</p>` },
      { key: "support", label: "Take alongside", value: "4 picks", detail: `<p>CoQ10 200 mg with MCT, NAD+ (a direct electron-transport-chain substrate), magnesium glycinate 400 mg/day, and ALA 600 mg/day — mechanistic companions supporting the electron transport chain SS-31 protects, not a combined-use trial stack.</p>` },
      { key: "pairs", label: "Pairs well with", value: "MOTS-c first, then SS-31", detail: `<p><b>MOTS-c</b> — run MOTS-c first, SS-31 second. That's not just this reference's inference — it's a specifically sourced Trevor Bachmeyer sequencing call, treated as this project's highest tier for dosing/sequencing decisions. His reasoning: MOTS-c resets the cell's fuel-handling environment first; repairing the wiring before there's anything running through it doesn't accomplish much yet. The reverse order has real support too (control the damage before increasing demand) — named here, not hidden, but the sourced practitioner statement carries more weight in this doc. No controlled human trial has tested either sequence against the other, so treat this as a practitioner call, not a settled finding.</p><p><b>GHK-Cu</b> — mechanistic complementarity only: GHK-Cu drives tissue remodeling, SS-31 supports the energy supply that remodeling runs on. No combined-use trial data.</p><p><b>NAD+</b> — a direct electron-transport-chain substrate paired with the membrane that chain runs on. Intuitive, but no human combined-use data.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>SS-31's strongest human evidence comes from Barth syndrome — a genetic disease where cardiolipin damage <i>is</i> the problem, not a downstream bystander of something else. The mechanism plausibly generalizes to general age-related mitochondrial wear; the clinical proof doesn't, yet. Treat that trial data as evidence for that specific population, not as a stand-in for general mitochondrial support.</p>` }
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
