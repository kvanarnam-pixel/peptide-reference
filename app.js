(() => {
  const state = {
    data: null,
    query: "",
    category: "all",
    selected: new Set(),
    open: new Set(),
    activeStack: null,
    view: "library"
  };

  const els = {
    filters: document.getElementById("filters"),
    search: document.getElementById("search"),
    grid: document.getElementById("card-grid"),
    empty: document.getElementById("empty-state"),
    count: document.getElementById("result-count"),
    library: document.getElementById("library-view"),
    compare: document.getElementById("compare-view"),
    compareBoard: document.getElementById("compare-board"),
    presets: document.getElementById("stack-presets"),
    stackNote: document.getElementById("stack-note"),
    dock: document.getElementById("compare-dock"),
    dockLabel: document.getElementById("dock-label"),
    dockCompare: document.getElementById("dock-compare"),
    dockClear: document.getElementById("dock-clear"),
    clearCompare: document.getElementById("clear-compare"),
    back: document.getElementById("back-to-library"),
    compareToggle: document.getElementById("compare-toggle"),
    offline: document.getElementById("offline-pill")
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, ["&", "amp;"].join(""))
      .replace(/</g, ["&", "lt;"].join(""))
      .replace(/>/g, ["&", "gt;"].join(""))
      .replace(/"/g, ["&", "quot;"].join(""));

  const categoryById = (id) => state.data.categories.find((cat) => cat.id === id);

  const selectedPeptides = () =>
    state.data.peptides.filter((p) => state.selected.has(p.id));

  const persist = () => {
    try {
      localStorage.setItem("peptide-ref-selected", JSON.stringify([...state.selected]));
    } catch {
      /* ignore quota / private mode */
    }
  };

  const restore = () => {
    try {
      const raw = JSON.parse(localStorage.getItem("peptide-ref-selected") || "[]");
      if (Array.isArray(raw)) raw.slice(0, 5).forEach((id) => state.selected.add(id));
    } catch {
      /* ignore */
    }
  };

  const matches = (peptide) => {
    if (state.category !== "all" && peptide.category !== state.category) return false;
    const q = state.query.trim().toLowerCase();
    if (!q) return true;
    const hay = [
      peptide.name,
      ...(peptide.aka || []),
      peptide.analogy,
      peptide.tagline,
      peptide.cardDescription,
      peptide.bottomLine,
      peptide.dose,
      peptide.halfLife,
      peptide.timing,
      peptide.cycling,
      peptide.mechanism,
      ...(peptide.cautions || []),
      ...(peptide.supplements || []),
      categoryById(peptide.category)?.label || ""
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  };

  const listHtml = (items) =>
    `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

  const factsHtml = (p) => `
    <dl class="facts">
      <div class="fact"><dt>Dose</dt><dd>${escapeHtml(p.dose)}</dd></div>
      <div class="fact"><dt>Half-life</dt><dd>${escapeHtml(p.halfLife)}</dd></div>
      <div class="fact"><dt>Timing / food</dt><dd>${escapeHtml(p.timing)}</dd></div>
      <div class="fact"><dt>Cycling</dt><dd>${escapeHtml(p.cycling)}</dd></div>
    </dl>
  `;

  const cardHtml = (p) => {
    const cat = categoryById(p.category);
    const selected = state.selected.has(p.id);
    const open = state.open.has(p.id);
    return `
      <article class="card ${selected ? "selected" : ""} ${open ? "is-open" : ""}" data-id="${p.id}" data-category="${p.category}">
        <div class="card-summary" data-toggle="${p.id}" role="button" tabindex="0" aria-expanded="${open}">
          <div class="badge-row">
            <span class="badge cat">${escapeHtml(cat?.short || "")}</span>
          </div>
          <h2>${escapeHtml(p.name)}</h2>
          ${p.tagline ? `<p class="tagline">${escapeHtml(p.tagline)}</p>` : ""}
          ${p.aka?.length ? `<p class="aka">${escapeHtml(p.aka.join(" · "))}</p>` : ""}
          ${p.cardDescription ? `<p class="card-desc">${escapeHtml(p.cardDescription)}</p>` : ""}
          <p class="dose-line"><span>Dose</span> ${escapeHtml(p.dose)}</p>
        </div>
        <div class="card-details" ${open ? "" : "hidden"}>
          ${
            p.bottomLine
              ? `<aside class="bottom-line"><strong>Bottom line</strong><p>${escapeHtml(p.bottomLine)}</p></aside>`
              : ""
          }
          <div class="badge-row detail-badges">
            <span class="badge analogy">${escapeHtml(p.analogy)}</span>
          </div>
          ${factsHtml(p)}
          <p class="mechanism"><span class="mechanism-label">Key mechanism</span>${escapeHtml(p.mechanism)}</p>
          <div class="cautions">
            <strong>Key cautions</strong>
            ${listHtml(p.cautions)}
          </div>
          <div class="supplements">
            <strong>Supportive supplements</strong>
            ${listHtml(p.supplements)}
          </div>
        </div>
        <div class="card-actions">
          <button type="button" class="select-btn" data-select="${p.id}" aria-pressed="${selected}">
            ${selected ? "Selected" : "Add to stack"}
          </button>
          <button type="button" class="primary-btn open-btn" data-toggle="${p.id}" aria-expanded="${open}">
            ${open ? "Close" : "Open"}
          </button>
        </div>
      </article>
    `;
  };

  const renderFilters = () => {
    const chips = [
      { id: "all", label: "All" },
      ...state.data.categories.map((cat) => ({ id: cat.id, label: cat.short }))
    ];
    els.filters.innerHTML = chips
      .map(
        (chip) => `
        <button
          type="button"
          class="chip"
          role="tab"
          data-cat="${chip.id}"
          aria-pressed="${state.category === chip.id}"
        >${escapeHtml(chip.label)}</button>`
      )
      .join("");
  };

  const renderLibrary = () => {
    const items = state.data.peptides.filter(matches);
    els.count.textContent = `${items.length} of ${state.data.peptides.length} entries`;
    els.grid.innerHTML = items.map((p) => cardHtml(p)).join("");
    els.empty.hidden = items.length > 0;
  };

  const renderPresets = () => {
    els.presets.innerHTML = state.data.stacks
      .map(
        (stack) => `
        <button
          type="button"
          class="preset"
          data-stack="${stack.id}"
          aria-pressed="${state.activeStack === stack.id}"
        >${escapeHtml(stack.name)}</button>`
      )
      .join("");
  };

  const renderCompare = () => {
    const items = selectedPeptides();
    els.compareBoard.innerHTML =
      items.length === 0
        ? `<p class="empty">Select 2–5 peptides, or tap a proven stack above.</p>`
        : items.map((p) => `<div class="compare-col">${cardHtml(p)}</div>`).join("");

    const stack = state.data.stacks.find((s) => s.id === state.activeStack);
    if (stack) {
      els.stackNote.hidden = false;
      els.stackNote.textContent = `${stack.subtitle}. ${stack.note}`;
    } else {
      els.stackNote.hidden = true;
    }
  };

  const renderDock = () => {
    const n = state.selected.size;
    const show = n > 0 && state.view === "library";
    els.dock.hidden = !show;
    els.compareToggle.hidden = n < 2;
    els.dockLabel.textContent =
      n === 0 ? "0 selected" : n === 1 ? "1 selected \u00b7 add 1–4 more" : `${n} selected`;
    els.dockCompare.disabled = n < 2 || n > 5;
    els.dockCompare.textContent = n < 2 ? "Need 2–5" : `Compare ${n}`;
  };

  const renderCurrent = () => {
    if (state.view === "compare") {
      renderPresets();
      renderCompare();
    } else {
      renderLibrary();
    }
    renderDock();
  };

  const setView = (view) => {
    state.view = view;
    els.library.hidden = view !== "library";
    els.compare.hidden = view !== "compare";
    renderCurrent();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleOpen = (id) => {
    if (state.open.has(id)) state.open.delete(id);
    else state.open.add(id);
    renderCurrent();
  };

  const toggleSelect = (id) => {
    if (state.selected.has(id)) {
      state.selected.delete(id);
    } else {
      if (state.selected.size >= 5) {
        els.dockLabel.textContent = "Maximum 5 peptides";
        els.dock.hidden = false;
        return;
      }
      state.selected.add(id);
    }
    const stack = state.data.stacks.find(
      (s) =>
        s.peptideIds.length === state.selected.size &&
        s.peptideIds.every((pid) => state.selected.has(pid))
    );
    state.activeStack = stack ? stack.id : null;
    persist();
    renderCurrent();
  };

  const applyStack = (stackId) => {
    const stack = state.data.stacks.find((s) => s.id === stackId);
    if (!stack) return;
    state.selected = new Set(stack.peptideIds.slice(0, 5));
    state.activeStack = stack.id;
    persist();
    setView("compare");
  };

  const onClick = (event) => {
    const cat = event.target.closest("[data-cat]");
    if (cat) {
      state.category = cat.dataset.cat;
      renderFilters();
      renderLibrary();
      return;
    }
    const select = event.target.closest("[data-select]");
    if (select) {
      toggleSelect(select.dataset.select);
      return;
    }
    const toggle = event.target.closest("[data-toggle]");
    if (toggle) {
      toggleOpen(toggle.dataset.toggle);
      return;
    }
    const stack = event.target.closest("[data-stack]");
    if (stack) {
      applyStack(stack.dataset.stack);
    }
  };

  const setOffline = () => {
    els.offline.hidden = navigator.onLine;
  };

  const bind = () => {
    document.addEventListener("click", onClick);
    els.search.addEventListener("input", (event) => {
      state.query = event.target.value;
      renderLibrary();
    });
    els.dockCompare.addEventListener("click", () => setView("compare"));
    els.compareToggle.addEventListener("click", () => setView("compare"));
    els.back.addEventListener("click", () => setView("library"));
    const clear = () => {
      state.selected.clear();
      state.activeStack = null;
      persist();
      renderCurrent();
    };
    els.dockClear.addEventListener("click", clear);
    els.clearCompare.addEventListener("click", clear);
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const toggle = event.target.closest(".card-summary[data-toggle]");
      if (!toggle) return;
      event.preventDefault();
      toggleOpen(toggle.dataset.toggle);
    });
    window.addEventListener("online", setOffline);
    window.addEventListener("offline", setOffline);
  };

  const registerWorker = () => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      /* file:// or unsupported - app still works online */
    });
  };

  const init = async () => {
    bind();
    setOffline();
    restore();
    const params = new URLSearchParams(location.search);
    params
      .get("open")
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .forEach((id) => state.open.add(id));
    const response = await fetch("./data/peptides.json");
    state.data = await response.json();
    renderFilters();
    renderLibrary();
    renderDock();
    registerWorker();
  };

  init().catch((error) => {
    els.grid.innerHTML = "";
    els.empty.hidden = false;
    els.empty.textContent = "Could not load peptide data. " + error.message;
  });
})();
