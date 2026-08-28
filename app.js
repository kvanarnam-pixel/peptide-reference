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
    "nad": "NAD+_Compound_Research.md",
    "5-amino-1mq": "5-Amino-1MQ_Compound_Research.md",
    "cjc-1295-dac": "CJC-1295_DAC_Compound_Research.md",
    "cjc-1295-no-dac": "CJC-1295_no_DAC_Compound_Research.md"
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
    "cognitive-decline": "Cognitive_Decline.md",
    "migraine": "Migraine.md",
    "insomnia": "Insomnia.md",
    "chronic-stress-cortisol": "Chronic_Stress_Cortisol.md",
    "seasonal-allergies": "Seasonal_Allergies.md",
    "hypertension": "Hypertension.md",
    "tesamorelin-recomp": "Tesamorelin_Recomp.md",
    "hypothyroid": "Hypothyroid.md",
    "immunosenescence": "Immunosenescence.md",
    "testosterone-decline": "Testosterone_Decline.md",
    "shingles-vzv": "Shingles_VZV.md",
    "atrial-fibrillation": "Atrial_Fibrillation.md",
    "systemic-multi-organ": "Systemic_Multi_Organ.md",
    "soft-tissue-repair": "Soft_Tissue_Repair.md",
    "post-viral": "Post_Viral.md",
    "anxiety-mood": "Anxiety_Mood.md",
    "pcos": "PCOS.md",
    "sarcopenia": "Sarcopenia.md",
    "small-fiber-neuropathy": "Small_Fiber_Neuropathy.md"
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
      { key: "dose", label: "Dose", value: clip(doseText(p), 18), detail: doseDetailHtml(p) },
      { key: "timing", label: "Timing", value: clip(p.timing, 18), detail: `<p>${escapeHtml(p.timing)}</p>` },
      { key: "cycling", label: "Duration", value: clip(p.cycling, 18), detail: `<p>${escapeHtml(p.cycling)}</p>` },
      { key: "know", label: "How you'll know", value: "Judge the job", detail: `<p>Pick two or three real-life markers before you start. Judge the stretch, not the morning after the first shot.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: `${(p.cautions||[]).length} notes`, detail: listHtml(p.cautions||[]) },
      { key: "support", label: "Take alongside", value: `${(p.supplements||[]).length} picks`, detail: listHtml(p.supplements||[]) },
      { key: "pairs", label: "Pairs with", value: "Different jobs", detail: `<p>Other names on a page are different jobs, not extra of this one. Do not start a second story the same week you are trying to learn whether this one held.</p>` },
      { key: "catch", label: "The catch", value: "", detail: `<p>${escapeHtml(p.bottomLine||p.mechanism||"")}</p>` }
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
      { key: "dose", label: "Dose", value: "5 mg every 4–5 days", detail: `<p>Five milligrams every four or five days is the rhythm people keep landing on. Not a lab-tested number. After a fresh tear, some people run that a little tighter for a week or two, then stretch it back.</p><p>You do not have to put it next to the injury. It travels.</p>` },
      { key: "timing", label: "Timing", value: "Whenever", detail: `<p>Any time. Food does not change it.</p>` },
      { key: "cycling", label: "Duration", value: "While crews still need a road", detail: `<p>No receptor to reset. Use it while there is a job — an injury, a training block that keeps chewing tissue. When that job is done, staying on it is just staying on it.</p><p>Old injuries sometimes move because they were stuck behind bad access and old scar, not because this is an “injury drug.”</p>` },
      { key: "know", label: "How you'll know", value: "Access, then the site", detail: `<p>The site starts getting what it needed. Less stuck. Better tolerance of the work you are actually doing. Same warning as the foreman: feeling better can beat the tissue being ready.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Better before ready", detail: `<p>Long-term human data on this exact fragment are thin. New allergic-type reaction, or the response just vanishing, is worth a pause.</p><p>Feeling better can happen before the tissue is ready for full loading.</p>` },
      { key: "support", label: "Take alongside", value: "Protein and loading", detail: `<p>This gets crews there. It does not pack their lunch. Protein, rehab, sleep. Vitamin C and collagen when the target is connective tissue.</p>` },
      { key: "pairs", label: "Pairs with", value: "Foreman is a different job", detail: `<p>BPC-157 is the local coordinator. GHK-Cu is materials. MOTS-c is the power bill. Healing costs energy.</p><p>A blend vial that forces this onto a daily micro-dose clock is convenience, not a better protocol.</p>` },
      { key: "catch", label: "The catch", value: "A road, not the repair", detail: `<p>This is not really an “injury peptide.” It is a road for repair cells.</p><p>There is a wrinkle in the lab work: the intact molecule may not be the piece that does the healing. A breakdown product might be. That does not make it fake. It makes the simple story incomplete.</p>` }
    ]
  ];

  const BPC157_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "250 mcg–1 mg/day", detail: `<p>Most people live between a quarter milligram and a milligram a day. Fresh, ugly injuries sometimes see a short bump higher. Past about a milligram you are usually paying more for the same job.</p>` },
      { key: "timing", label: "Timing", value: "Once or split", detail: `<p>Once a day works. Split morning and night is the common habit. By mouth is really a gut-lining conversation, not a sneaky full-body route.</p>` },
      { key: "cycling", label: "Duration", value: "While there is a job", detail: `<p>There is no receptor here that needs a vacation. The 4–6 week on-and-off thing is cost and caution, not biology.</p><p>A tendon or a joint does not remodel on a four-week clock. Eight to twelve weeks matches tissue better than a forum calendar.</p><p>Run it while there is a site. Stop when the site is no longer the reason you opened the vial.</p>` },
      { key: "know", label: "How you'll know", value: "The site, not the shot", detail: `<p>The site gets less angry and starts taking load again. That can lag the “I feel better” day. Pain moving first is common. Structure is slower.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Feeling better too early", detail: `<p>The same “new vessels” story that helps a repair site is the reason an active or recent cancer history makes this a conversation with a doctor, not a casual add.</p><p>Feeling better before the tissue is ready is how people re-tear things.</p>` },
      { key: "support", label: "Take alongside", value: "The lumber", detail: `<p>This coordinates. It does not bring protein, vitamin C, sleep, or the rehab that actually loads the tissue.</p>` },
      { key: "pairs", label: "Pairs with", value: "Access is a different job", detail: `<p>TB-500 is access. This is the local foreman. On paper they look perfect together. One rat tendon study did not show extra benefit from combining them. Complementary in theory. Not proven as a pair.</p><p>Blends that glue this to TB-500’s clock force two different jobs onto one schedule.</p>` },
      { key: "catch", label: "The catch", value: "Foreman, not the wood", detail: `<p>Foreman. Not lumber. Not a cycle because a receptor said so.</p><p>Oral is gut-local. That is a different reach than a shot.</p>` }
    ]
  ];

  const GHKCU_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "1–2 mg", detail: `<p>People usually start around a milligram a day, sometimes step toward two, then thin it out to a few times a week. That ladder is practice. Nobody ran a proper human dose study on the injectable.</p><p>The researcher most tied to this one talked about far larger amounts for a full-body effect. That is not a target. It just means the little dose is unproven too.</p>` },
      { key: "timing", label: "Timing", value: "Whenever", detail: `<p>Food does not matter. Clock does not matter. Cream on the skin is a different route with almost no copper getting inside.</p>` },
      { key: "cycling", label: "Duration", value: "Copper and a stale signal", detail: `<p>You cycle this one because copper adds up and the remodeling message can go stale. Not because a receptor wore out. Nobody has even named a receptor here to wear out.</p><p>Four to twelve weeks on, a few weeks off, is housekeeping. Cream can run longer because almost none of it hits the blood.</p><p>After an off stretch, some people feel the signal come back. That is observation, not a trial.</p>` },
      { key: "know", label: "How you'll know", value: "Quiet change over weeks", detail: `<p>This is quiet. Skin feel, less reactive tissue, training that does not trash you as hard. Real remodeling talk is weeks, not the next morning.</p><p>It will not replace the foreman or the access crew. If that is what you wanted, this is the wrong card.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Copper, not a buzz", detail: `<p>Wilson’s disease or known copper overload is a hard no.</p><p>The long question is years of injecting copper with no long study behind it. Cream has a much longer safety story because it stays in the skin.</p><p>Keep it in its own vial. Copper in a fridge blend with other peptides is a sloppy risk.</p>` },
      { key: "support", label: "Take alongside", value: "What collagen actually needs", detail: `<p>Vitamin C, protein, a little zinc. Copper and zinc can crowd each other if you keep repeating cycles.</p>` },
      { key: "pairs", label: "Pairs with", value: "Materials, not the foreman", detail: `<p>BPC-157 runs the local job. TB-500 gets crews there. This one brings materials and a remodeling note. Complementary on paper. Not a tested trio.</p>` },
      { key: "catch", label: "The catch", value: "A courier, not a copper pill", detail: `<p>This is a courier that hands copper to the right enzymes. It is not a copper supplement with a peptide stuck on.</p><p>“Reprograms thousands of genes” is a lab snapshot on cells. It is not proof a one-milligram shot rewrote a person.</p>` }
    ]
  ];

  const MOTSC_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "5 mg, 2–3×/week", detail: `<p>The common amount people use is 5 milligrams under the skin, two or three times a week. That number came from practice, not from a human study that found the perfect dose.</p><p>The shot itself is gone pretty fast. The work it starts is not. So taking it more often because it left the blood is usually missing the point.</p><p>If a smaller rhythm still holds the same stamina and the same afternoon, that tells you something. If those slide, the signal just got too thin.</p>` },
      { key: "timing", label: "Timing", value: "Same days beat the clock", detail: `<p>Pick days you can keep. Morning versus night is not the main event.</p><p>Doing it fasted is not automatically smarter. If someone is already running on fumes, asking the system to adapt on an empty tank can make the week harder.</p>` },
      { key: "cycling", label: "Duration", value: "More like training than a cycle", detail: `<p>This one is closer to a training block than to a hormone you cycle so receptors wake back up. There is no receptor here to wear out.</p><p>What it is doing: asking muscle to take sugar in without waiting on insulin, and nudging the cell toward a better energy program. Not a caffeine kick. A rewrite.</p><p>The shot leaves in hours. The program can hang around days to a couple of weeks. In this house, one look got better around six and a half weeks and faded about two weeks after stopping. That is one house. The shape is what matters — not instant collapse, not permanent.</p><p>So the 8 to 12 weeks, then a week or two off, is not a law. It is a chance to see whether you wrote something or just rented a feeling. Four weeks of better stamina is the program starting. It is not the program finished.</p><p>A thinner schedule later — even something like twice a week at a lower amount — only makes sense after you already know the full look did something. If the job dies when you thin it out, you went under what the program needed. That is not a failed cycle.</p><p>There is no yearly cap because a receptor said so. There is also no long human safety story at these amounts. “Run it forever, nothing to think about” is too tidy.</p>` },
      { key: "know", label: "How you'll know", value: "Same walk, same afternoon", detail: `<p>The useful test is boring. Same walk. Same stairs. Same afternoon crash. Same slump after a meal.</p><p>An early shift, if it shows, is usually quieter fuel handling in a couple of weeks. Not a buzz. Bigger change, when it comes, is slower.</p><p>Feeling nothing dramatic is normal with this one. Feeling nothing forever is not a reason to keep paying for it.</p><p>The off stretch is the real report card. Holds — maybe the program can stand. Slides — either it wanted another block, or this was never the weak spot.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Worse on it, not a dip", detail: `<p>If days on it keep making effort harder, turning the dose up is usually the wrong next move. That tends to mean fuel, sleep, or the machinery itself is the actual limit.</p><p>Sore injection spots happen. Feeling wiped in a way that tracks the shot is information, not a badge.</p><p>People stacking other blood-sugar tools with this should keep an eye on how low they go. That is not “it’s working extra hard.”</p>` },
      { key: "support", label: "Take alongside", value: "Whatever the weak spot is", detail: `<p>This asks the system to adapt. It does not show up with the parts.</p><p>If someone is barely eating, food is the partner. If the wiring looks like the leak, that is a different molecule. If the batteries look low, that is a carrier conversation.</p><p>It is not “take the whole energy aisle.” It is “what is actually stuck.”</p>` },
      { key: "pairs", label: "Pairs with", value: "Wiring is a different job", detail: `<p><b>SS-31</b> is the wiring. This one writes the program. Seeing better stamina on MOTS-c does not mean the wiring is fixed. It also does not mean SS-31 has to start this week. The leftover question is whether the gain dies fast when you stop, or effort costs more the next day.</p><p><b>NAD+</b> is the carrier. It matters when that is the missing piece, not because both words sound mitochondrial.</p><p><b>ARA-290</b> is a switch on a hurt nerve. Different story. A bad week to start both if you need to know which one moved.</p>` },
      { key: "catch", label: "The catch", value: "A program is not a new engine", detail: `<p>It can ask the energy system to change. It cannot fix every part of that system. If the real limit is food, sleep, wiring, or the carrier, more MOTS-c just makes the weak spot louder.</p><p>A lot of “you have to cycle this” talk is borrowed from peptides that actually wear receptors out. That is a different family.</p><p>Early stamina is a good sign. It is not the pause. The pause is how you tell a program from a good week.</p>` }
    ]
  ];

  const RETATRUTIDE_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "Lowest that still works", detail: `<p>Most people live somewhere between half a milligram and six a week. Twelve exists as a ceiling, not a destination.</p><p>The weekly shot stacks on the last one. Climbing fast mostly buys a worse stomach.</p>` },
      { key: "timing", label: "Timing", value: "Same day each week", detail: `<p>Same day each week matters more than the hour. Food does not matter.</p>` },
      { key: "cycling", label: "Duration", value: "Not a cycle", detail: `<p>This is not an on-and-off peptide. The studies ran it every week on purpose.</p><p>Stopping is its own decision. The appetite and fuel pressure it was sitting on can come back. That is not a receptor reset. That is the original problem without the signal.</p>` },
      { key: "know", label: "How you'll know", value: "Food noise, waist, labs", detail: `<p>Food noise. Waist over weeks, not one weigh-in. Glucose if that is part of the story. Whether strength is hanging on while weight moves.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Stomach, pulse, right-side pain", detail: `<p>Nausea tracks the climb. Resting pulse can tick up. New pain under the right ribs is worth attention. Gallbladder trouble has shown up in this family.</p><p>Losing weight fast without protein and training is how muscle leaves with the fat.</p>` },
      { key: "support", label: "Take alongside", value: "Protein if weight is falling", detail: `<p>The supporting list on the live card is insulin-sensitivity and nerve-stress stuff around fast weight change. The one that matters most in real life is still protein and some loading.</p>` },
      { key: "pairs", label: "Pairs with", value: "Around it, not instead of it", detail: `<p>MOTS-c and SS-31 are energy-machinery questions if a stall looks like the engine, not the appetite signal. KPV if inflammatory drag is the stall. None of those are a tested bundle.</p>` },
      { key: "catch", label: "The catch", value: "Stopping lets the pressure back in", detail: `<p>Once the pathways are on, more peptide does not keep multiplying the result. Higher study arms also brought more stomach trouble.</p><p>This is a weekly pressure signal. It is not a cycle you complete.</p>` }
    ]
  ];

  const ARA290_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "4 mg daily", detail: `<p>The human studies used 4 milligrams under the skin once a day. They also tried more. More was not simply better.</p><p>So the number on this card is that study amount. Leftover in the vial is not a reason the number needs to go up.</p>` },
      { key: "timing", label: "Timing", value: "Whenever you'll remember", detail: `<p>This one does not care about breakfast or bedtime. It cares that you can hit it on a normal day.</p><p>Same-ish time just makes the habit easier.</p>` },
      { key: "cycling", label: "Duration", value: "Not a 28-day clock", detail: `<p>Think of this as a switch for a small nerve that is already hurt. Not a vitamin. Not something you take because nerves exist.</p><p>People get stuck on day 28. That is only how long the studies ran. It is not a rule that the body resets on day 29. There is no “cycle off or it stops working” story here the way there is with some other peptides.</p><p>The interesting part is what happens when the shots stop. In the studies, some of the change was still there a month later. So it behaves more like a switch you flipped than a pill that only works while it is in you.</p><p>That is why a pause is useful — not because the calendar demands it. Around four weeks, or whenever the vial actually ends, you can just watch. If the better holds, maybe you did not need to stay on it. If it slides, something is probably still chewing on that nerve.</p><p>Using the rest of a vial is just more days on the switch. It is not extra safety, and it is not extra danger we can point to. We simply do not have that longer look in neuropathy.</p><p>If walking or strength is falling apart, that is a doctor conversation, leftover peptide or not.</p>` },
      { key: "know", label: "How you'll know", value: "Pain, walking, and after you stop", detail: `<p>Pain gets all the attention. Walking, balance, numbness, and sleep lost to nerve pain are the rest of the picture. Quieter pain with worse walking is a mixed report card.</p><p>The first morning after a shot does not tell you much. Neither does the morning after the last one. The whole stretch, and then the weeks after you stop, is where the story shows up.</p><p>Some people in the study were still better a month off it. That after-stretch is doing real work.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "A real slide — not a rough day", detail: `<p>Everybody has a rough day. A real slide looks different — harder to walk, new weakness, life getting smaller even if the pain is quieter, injection spots that keep getting uglier.</p><p>If blood sugar or whatever started this is still running hot, this shot is swimming upstream. That is not a cleanse. That is the original problem still winning.</p><p>Something new and serious is a doctor, not another week to see.</p>` },
      { key: "support", label: "Take alongside", value: "What cut the nerve", detail: `<p>The unglamorous piece is still the most important one: what cut the nerve in the first place.</p><p>Blood sugar, B12, thyroid, the ordinary labs a doctor would already think of. If that question was never asked, talking about week four versus week six is kind of beside the point.</p><p>People add nerve-support orals sometimes. Fine. They are not this peptide.</p>` },
      { key: "pairs", label: "Pairs with", value: "Other jobs, not extras", detail: `<p>The other names on the nerve page are different jobs. Fuel. Local repair. Cell energy. They are not extra ARA-290.</p><p>Nobody has run this exact mix in people as one study. And if you are trying to learn whether this one held, that is a bad week to start a second story.</p>` },
      { key: "catch", label: "The catch", value: "A switch is not a new nerve", detail: `<p>It leaves the blood almost immediately. The effect can hang around a lot longer. That is the switch.</p><p>It will not name what damaged the nerve. It will not rebuild a nerve that has no energy left to do the rebuilding.</p><p>Day 28 is not a wall. Longer is not automatically better either.</p><p>Feeling better and the nerve being finished are two different sentences. If nobody can say what started this, the switch is on and the cause is still in the room.</p>` }
    ]
  ];

  const KPV_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "200–500 mcg", detail: `<p>A couple hundred to five hundred micrograms, once or twice a day, is the common range. Nobody has a clean human curve that says where low, useful, and extra actually start.</p>` },
      { key: "timing", label: "Timing", value: "Same time beats the clock", detail: `<p>The clock is not picky. By mouth, keep it away from a heavy protein meal. A shot does not care about food.</p>` },
      { key: "cycling", label: "Duration", value: "While the site is still angry", detail: `<p>No receptor here that needs a reset. You run it while there is an inflammatory job. An off stretch is a test: did the quiet hold, or did the original trigger come back.</p><p>Eight to twelve weeks is a reasonable look. It is not a law.</p>` },
      { key: "know", label: "How you'll know", value: "Fewer flare-ups", detail: `<p>You usually do not feel a kick-in. The site just gets less angry. Fewer flare-ups. Easier ordinary days. Judge the problem, not the injection.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Quieting the alarm, not the fire", detail: `<p>The mistake is using this to mute symptoms while blood sugar, an infection, an allergen, or whatever started it keeps running. Quieter is not automatically healthier.</p>` },
      { key: "support", label: "Take alongside", value: "Whatever started the fire", detail: `<p>Depends on the fire. Glucose if that is the driver. Gut work if that is the driver. Repair support if tissue still needs building. Not one universal stack.</p>` },
      { key: "pairs", label: "Pairs with", value: "Safety, then repair", detail: `<p>BPC-157 coordinates repair once the site is not in shutdown. TB-500 and GHK-Cu make more sense after the alarm is quieter. MOTS-c and SS-31 only if the inflammation is also choking energy.</p><p>Gluing this into a four-peptide blend locks four jobs to one ratio.</p>` },
      { key: "catch", label: "The catch", value: "It does not rebuild", detail: `<p>It does not rebuild tissue. It does not make energy. It turns down excessive alarm so the other work can happen.</p><p>That narrow job is the feature.</p>` }
    ]
  ];

  const SS31_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "Start low", detail: `<p>The amount with real human studies behind it is 40 milligrams a day. That is a specific disease program. It is not a target to climb toward on your own.</p><p>What people use in the wild is much smaller — often a few milligrams a day. That smaller range has not been mapped in healthy adults. So this card starts low and lets a repeatable change decide whether it is doing anything.</p><p>More is not automatically more. The thing it grabs onto can fill up.</p>` },
      { key: "timing", label: "Timing", value: "Daily is what was studied", detail: `<p>Morning is just habit. Food does not matter.</p><p>Daily is what the human studies used. The peptide does not hang around in the blood long. A single dose in older adults raised muscle energy capacity that same day and it was gone by a week.</p><p>People stretch it to every other day or twice a week because the vial is expensive. That can be a later experiment after you already know daily did something. It is not the same thing as the study schedule.</p>` },
      { key: "cycling", label: "Duration", value: "A clamp — it does not stay", detail: `<p>This one is a clamp on the wiring inside the power plant. It holds a fat in the inner wall so the machinery leaks less. While it is sitting there, the wiring behaves. When it leaves, you have whatever wiring that cell actually owns.</p><p>There is no receptor to wear out. There is also no “do a cycle and you are done.” The job is ongoing protection under stress.</p><p>The good can fade when you stop because the clamp came off — not because the cell quit making its own wiring.</p><p>A few weeks on, then a look, is useful because you need a report card. Not because week six is magic. Long disease programs ran this every day for years at the study dose. Community “take a break at week eight” is habit, not a reset.</p><p>If the gain dies in days after you stop, that is occupancy talking. If the gain holds, maybe the stress on that membrane is lower than you thought.</p>` },
      { key: "know", label: "How you'll know", value: "Same effort, then a pause", detail: `<p>Pick two or three limits before you start. Distance. Effort. What tomorrow costs. Not “more energy.”</p><p>The first week is mostly “can I tolerate this.” Sore spots are common. A washed-out feeling shows up for some people and often settles.</p><p>Weeks two to four: is the same effort repeatable. Weeks four to six: clearly better, a little better, or nothing. Nothing is not a cue to keep climbing. The wiring may not have been the weak spot.</p><p>Then a pause tells you the rest. Holds — maybe you do not need to stay on it. Slides — the clamp was doing work.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Sore spots, and a real slide", detail: `<p>Injection spots taking a beating is the thing that shows up in every study. Rotate where you put it.</p><p>A reproducible slide after shots is a hold. It is not a cleanse.</p><p>Kidneys change how much of this stays around. That matters more than most people think.</p><p>Feeling better is not permission to ignore sleep, food, or the thing that stressed the wiring in the first place.</p>` },
      { key: "support", label: "Take alongside", value: "Parts the chain still needs", detail: `<p>This protects the wall the energy chain runs on. It does not bring the parts the chain burns.</p><p>CoQ10, a carrier like NAD+, magnesium — those are “if that part is actually missing.” Not a starter pack you staple to the vial.</p>` },
      { key: "pairs", label: "Pairs with", value: "Program first, wiring second", detail: `<p><b>MOTS-c</b> writes the program and asks for more capacity. This holds the wiring. Seeing stamina on MOTS-c does not mean the wall is fixed. It also does not mean this has to start the same week.</p><p>This house likes MOTS-c first. That is a call, not a head-to-head study.</p><p><b>NAD+</b> is the carrier running through the same machinery. Three jobs. Not three copies of one booster.</p>` },
      { key: "catch", label: "The catch", value: "A bandage is not a rebuild", detail: `<p>It holds cardiolipin that is already there. It does not replace what is already burned, and it does not fix the enzyme that remakes it.</p><p>The 40 milligram story belongs to a rare disease. The few-milligram story is mostly untested.</p><p>“FDA approved” is real and narrow. “It failed its trials” skips the secondary signals. Neither headline is the whole picture.</p><p>This is support under stress. It is not a one-cycle engine rebuild.</p>` }
    ]
  ];
  const NAD_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "SC 25–100 mg", detail: `<p>Under-the-skin amounts in the 25 to 100 milligram neighborhood are practice, not a studied ladder. IV is a completely different pile of milligrams. Oral NR or NMN is a different idea again. Those numbers do not trade.</p>` },
      { key: "timing", label: "Timing", value: "Whatever you can repeat", detail: `<p>Morning is common. Some people get alert. Some get nothing. Some get sleepy. Use the timing that does not wreck the rest of the day.</p>` },
      { key: "cycling", label: "Duration", value: "A checkpoint, not a cycle", detail: `<p>There is no receptor-reset calendar. Inventing 8 on / 4 off here is borrowing from the wrong family.</p><p>Four to six weeks is a look. Did anything repeatable happen. If a benefit holds after you stop, you may not need to stay on it. If it dies off and comes back on, that is useful. If nothing happened, more weeks is not a personality test.</p>` },
      { key: "know", label: "How you'll know", value: "Same work, next day", detail: `<p>Afternoon stability. Same work at the same effort. What the next day costs. Mental stamina.</p><p>Feeling nothing does not prove it failed. Feeling nothing also does not prove it is working invisibly.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Wiped, nauseous, racing", detail: `<p>Getting really wiped, real nausea, chest pressure, a jump in heart rate, or injection pain that will not quit. None of that is a detox badge. The shot can sting. That part is ordinary.</p>` },
      { key: "support", label: "Take alongside", value: "Only if that part is missing", detail: `<p>CoQ10 sits downstream. Magnesium sits in the salvage path. Neither is required because a list said so.</p>` },
      { key: "pairs", label: "Pairs with", value: "Carrier, not the plant", detail: `<p>MOTS-c is the program. SS-31 is the wiring. This is the carrier running through that machinery. Three jobs.</p>` },
      { key: "catch", label: "The catch", value: "More batteries ≠ more power", detail: `<p>If the bottleneck is not NAD+, or the machinery cannot use what you add, more carrier does not make more energy.</p><p>SC, IV, and oral are not the same medicine with different spoons.</p>` }
    ]
  ];

  const AMINO1MQ_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "50–100 mg oral", detail: `<p>The number on this card is 50 to 100 milligrams by mouth, once a day. That is what people use. A human study did not pick it.</p><p>Mouse math does not turn into this number. Leftover capsules are not a reason to take more. Nothing moving is not a reason either.</p>` },
      { key: "timing", label: "Timing", value: "Same time most days", detail: `<p>Pick a time you can keep. Morning with food is just easier to remember.</p><p>The pill does not care about breakfast.</p>` },
      { key: "cycling", label: "Duration", value: "Pause to read it", detail: `<p>This plugs a leak in the storage rooms. Not a vitamin. Not something you take because energy exists.</p><p>Nothing here wears out if you keep going. The eight-on, four-off story is habit. Useful because you need a clean look at whether stopping changed anything. Not a law that week nine resets you.</p><p>Nobody has watched people stay on this for months and years. That is the real reason to pause.</p>` },
      { key: "know", label: "How you'll know", value: "Waist and clothes, not Tuesday", detail: `<p>Waist over weeks. How clothes fit. Fat versus the scale, if you already measure it that way. Same food. Same training.</p><p>The first mornings tell you nothing. Six to eight weeks is a fair look. A break after that is part of the report card.</p><p>If what you wanted was “the same walk costs less,” you were watching the wrong building.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "A real slide — ask if you’re on a mood pill", detail: `<p>Everybody has a rough day. A real slide keeps showing up — stomach, head, energy, mood — and it tracks the pill.</p><p>There is no human study list. That is not the same as “nothing can go wrong.”</p><p>If you already take something for mood or for focus, ask the person who wrote that prescription before you add this. Not because this is a mood pill. Because mixing is the part we have not watched in people.</p><p>Something new and serious is a doctor, not another week to see.</p>` },
      { key: "support", label: "Take alongside", value: "This plugs. NAD+ fills.", detail: `<p>This stops a skim. It does not fill the tank.</p><p>If the tank looks empty, that is a battery conversation — NAD+ as a different job, not extra of this. Food still has to be honest.</p>` },
      { key: "pairs", label: "Pairs with", value: "Different buildings", detail: `<p><b>NAD+</b> fills the tank. This plugs the hole.</p><p><b>MOTS-c</b> rewrites the furnace in muscle. Not this pill. Bad week to start both if you need to know which one moved.</p><p><b>Tesamorelin</b> is a different fat job — deep belly fat through a growth-hormone-style signal. Same page. Not one study of both.</p><p><b>Retatrutide</b> changes how much comes in and how fuel is routed. If that shot is already live, this is a later question — not a mixer for week one.</p><p><b>SS-31</b> is wiring. Only if tomorrow is wrecked is its own story.</p>` },
      { key: "catch", label: "The catch", value: "A leak plug is not a furnace", detail: `<p>It can plug a leak in fat cells. It cannot rewrite the furnace, fix the wiring, or knock three percent off someone who is already lean just because the label says fat.</p><p>The mouse work is real. It is heavy mice. A lot of that work was a shot, not a breakfast pill. Feeling nothing dramatic is normal. Feeling nothing forever is a reason to stop paying for it.</p>` }
    ]
  ];

  const CJC1295DAC_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "1–2 mg once a week", detail: `<p>One to two milligrams under the skin, once a week. That is the number on this card. Start at the low end.</p><p>More is not automatically better. If nothing changes after a fair stretch, do not just increase the dosage.</p><p>The human papers used different math on healthy adults. Those papers asked whether the messenger moved. They did not pick this weekly milligram for you.</p>` },
      { key: "timing", label: "Timing", value: "Any time of day", detail: `<p>You can take this any time of day.</p><p>People take it at night because that is what they do with the other CJC — the one that is gone in about half an hour. That one needs an empty stomach and bedtime. This one does not. It is still in you days later.</p><p>If you just ate a huge meal, wait a bit if you want. That is polite. It is not the main thing.</p><p>The food that actually matters is the night. Going to bed stuffed makes it harder for the body to send the overnight repair messenger. Finish eating a couple of hours before you sleep. That is just better recovery. This shot does not fix a full stomach at midnight.</p><p>If evening progesterone is already in the house, morning is fine.</p>` },
      { key: "cycling", label: "Duration", value: "Weeks, then a pause", detail: `<p>Give it weeks, not one night. Then stop for a bit and see what held.</p><p>People quote twelve weeks on and four weeks off. That calendar is habit. It is not proof the gland wore out at week twelve.</p><p>The pause is so you can read it. Restart because the job is still there. Not because a date on the fridge said so.</p>` },
      { key: "know", label: "How you'll know", value: "Next day, not a buzz", detail: `<p>This shot does not buzz. A lot of mornings will feel like nothing.</p><p>Watch sleep. Watch how hard the next day feels. Clothes later.</p><p>A blood test only if you already use that number. A higher number means the note landed. It does not mean you got the week back.</p><p>Pick two or three real things before you start. Judge the stretch, not the morning after the first shot.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Swelling, numb hands, blood sugar", detail: `<p>New swelling. Rings getting tight. Hands that go numb at night.</p><p>Headaches that follow the weekly shot. Blood sugar drifting the wrong way. Snoring or apnea getting worse.</p><p>Redness at the shot is common and is not “it’s working.”</p><p>If you already have a cancer conversation with a doctor, this is not a casual add.</p>` },
      { key: "support", label: "Take alongside", value: "No CJC vitamin", detail: `<p>There is no vitamin that makes this note work.</p><p>Sleep that actually happens. Finish eating a couple of hours before bed. Food and training still have to be honest.</p><p>Do not build a pill stack to justify this vial.</p>` },
      { key: "pairs", label: "Pairs with", value: "Other door, not a second CJC", detail: `<p><b>Ipamorelin</b> is a different door on the same gland. That pairing is a coherent idea. A human trial of this exact pair was not found.</p><p>They are not the same clock. This one is weekly. Ipamorelin is short. If you draw both at night, the short one is why you are standing there at bedtime.</p><p><b>The nightly CJC</b> is the same door, different clock. Do not run both.</p><p><b>Tesamorelin</b> is the same door family with a different job — deep belly fat. Not two vitamins.</p><p><b>Growth hormone in a syringe</b> is the finished messenger. That is a different strategy. Do not pour it on top of this one.</p>` },
      { key: "catch", label: "The catch", value: "Not a bigger night", detail: `<p>It does not give you a bigger night. It leaves the repair signal on between nights.</p><p>Once a week is easier. It is also already spoken for days later if you do not like it.</p><p>They sold a pulse story. The night waves did not get bigger. What changed was the quiet between them.</p>` }
    ]
  ];

  const CJC1295NODAC_CHIPS = [
    [
      { key: "dose", label: "Dose", value: "Start low, at night", detail: `<p>Start low, under the skin, at night. Around 100 micrograms is a common starting point, not a target. People also use more. A human study did not pick any of those numbers.</p><p>More is not automatically better. Extra daytime shots are more waves. They are not a better night. If nothing changes after a fair stretch, do not just increase the dosage.</p><p>Do not borrow the weekly milligrams. That is a different bottle.</p>` },
      { key: "timing", label: "Timing", value: "Night. Not stuffed.", detail: `<p>Night. Not on a full stomach.</p><p>Finish eating a couple of hours before you sleep. Going to bed stuffed is worse for recovery.</p><p>If Ipamorelin is in the same syringe, both of those short notes are why you are standing there at bedtime.</p>` },
      { key: "cycling", label: "Duration", value: "Weeks, then a pause", detail: `<p>Give it weeks, not one night. Then stop for a bit and see what held.</p><p>People quote twelve weeks on and four weeks off. That calendar is habit. Nobody proved this gland wore out at week twelve. Nobody proved you can run it every night forever either.</p><p>The pause is so you can read it.</p>` },
      { key: "know", label: "How you'll know", value: "Sleep and tomorrow, not a buzz", detail: `<p>This shot does not buzz. A lot of nights will feel like nothing.</p><p>Watch sleep. Watch how hard the next day feels. Clothes later is something people may watch — not a promised result.</p><p>If Ipamorelin is in the same draw, you are judging the pair, not this bottle alone.</p><p>Pick two or three real things before you start. Judge the stretch, not the morning after the first shot.</p>` }
    ],
    [
      { key: "watch", label: "Watch for", value: "Swelling, numb hands, blood sugar", detail: `<p>New swelling. Rings getting tight. Hands that go numb at night.</p><p>Headaches that follow the shot. Blood sugar drifting the wrong way. Snoring getting worse.</p><p>Redness at the shot is common and is not “it’s working.”</p><p>If you already have a cancer conversation with a doctor, this is not a casual add.</p>` },
      { key: "support", label: "Take alongside", value: "No CJC vitamin", detail: `<p>There is no vitamin that makes this note work.</p><p>Sleep that actually happens. Finish eating a couple of hours before bed. Food and training still have to be honest.</p><p>Do not build a pill stack to justify this vial.</p>` },
      { key: "pairs", label: "Pairs with", value: "Ipamorelin — other door", detail: `<p><b>Ipamorelin</b> is a different door on the same gland. That pairing is a coherent idea. A human trial of this exact pair was not found.</p><p>If you draw both at night, both short notes are why you are standing there at bedtime.</p><p><b>Weekly CJC</b> uses the same door. Not a pair. Do not run both.</p><p><b>Tesamorelin</b> is a related short note with a different job — deep belly fat. Not two vitamins.</p><p><b>Growth hormone in a syringe</b> is the finished messenger. Do not pour it on top.</p>` },
      { key: "catch", label: "The catch", value: "Not a smaller weekly shot", detail: `<p>This is not a smaller weekly shot. It is not Ipamorelin.</p><p>If the night was loud — late food, no real sleep — more of this will not fix the night.</p>` }
    ]
  ];

  const CHIP_REGISTRY = { "tb-500": TB500_CHIPS, "bpc-157": BPC157_CHIPS, "ghk-cu": GHKCU_CHIPS, "mots-c": MOTSC_CHIPS, "retatrutide": RETATRUTIDE_CHIPS, "ara-290": ARA290_CHIPS, "kpv": KPV_CHIPS, "ss-31": SS31_CHIPS, "nad": NAD_CHIPS, "5-amino-1mq": AMINO1MQ_CHIPS, "cjc-1295-dac": CJC1295DAC_CHIPS, "cjc-1295-no-dac": CJC1295NODAC_CHIPS };

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
    <div class="bottom-line"><strong>Bottom line</strong><p>MOTS-c is the power plant: insulin-independent glucose uptake and a better energy program. Use the lowest exposure doing that job. SS-31 is a different job (the wiring). Seeing stamina on MOTS-c does not mean the wiring is fixed, and it does not mean SS-31 has to start the same week.</p></div>
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
