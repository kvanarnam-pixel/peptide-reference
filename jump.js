(() => {
  const clip = (s, n = 36) => {
    const t = String(s || "").replace(/\s+/g, " ").trim();
    if (t.length <= n) return t;
    const cut = t.slice(0, n);
    const sp = cut.lastIndexOf(" ");
    return (sp > 18 ? cut.slice(0, sp) : cut).replace(/[.,;:]+$/, "") + "…";
  };

  const factText = (card, needle) => {
    for (const fact of card.querySelectorAll(".fact")) {
      const dt = (fact.querySelector("dt")?.textContent || "").toLowerCase();
      if (dt.includes(needle)) return fact.querySelector("dd")?.textContent || "";
    }
    return "";
  };

  const enhance = (card) => {
    if (!card || card.dataset.jumpReady) return;
    const id = card.dataset.id;
    if (!id) return;
    card.dataset.jumpReady = "1";

    card.querySelectorAll(".fact").forEach((fact) => {
      if (fact.id) return;
      const dt = (fact.querySelector("dt")?.textContent || "").toLowerCase();
      if (dt.startsWith("dose") || dt.includes("escalation") || dt.includes("practical pattern")) fact.id = `${id}-dose`;
      else if (dt.includes("timing") || dt.includes("food")) fact.id = `${id}-timing`;
      else if (dt.includes("cycling")) fact.id = `${id}-cycling`;
    });
    const mech = card.querySelector(".mechanism");
    if (mech && !mech.id) mech.id = `${id}-biology`;
    const caut = card.querySelector(".cautions");
    if (caut && !caut.id) caut.id = `${id}-watch`;

    card.querySelector(".card-desc")?.setAttribute("data-jump", `${id}-biology`);
    card.querySelector(".tagline")?.setAttribute("data-jump", `${id}-biology`);

    if (card.querySelector(".quick-jump") || card.querySelector(".reta-quick") || card.querySelector(".chip-grid")) return;

    const dose = factText(card, "dose") || (card.querySelector(".dose-line")?.textContent || "").replace(/^\s*dose\s*/i, "");
    const timing = factText(card, "timing") || factText(card, "food");
    const cycling = factText(card, "cycling");
    const tiles = document.createElement("div");
    tiles.className = "quick-jump";
    [["dose", dose], ["timing", timing], ["cycling", cycling]].forEach(([section, value]) => {
      const cell = document.createElement("div");
      cell.setAttribute("data-jump", `${id}-${section}`);
      const label = document.createElement("span");
      label.textContent = section[0].toUpperCase() + section.slice(1);
      const bold = document.createElement("b");
      bold.textContent = clip(value);
      cell.append(label, bold);
      tiles.append(cell);
    });
    const doseLine = card.querySelector(".dose-line");
    if (doseLine) doseLine.replaceWith(tiles);
    else card.querySelector(".card-summary")?.append(tiles);
  };

  const scan = () => document.querySelectorAll(".card").forEach(enhance);

  const jumpTo = (card, target) => {
    const id = card.dataset.id;
    if (!card.classList.contains("is-open")) {
      card.querySelector(".open-btn")?.click();
    }
    const go = () => {
      const fresh = document.querySelector(`.card[data-id="${id}"]`);
      if (fresh) enhance(fresh);
      const el = document.getElementById(target);
      if (!el) return;
      el.classList.add("jump-flash");
      el.scrollIntoView({ behavior: "auto", block: "start" });
      window.setTimeout(() => el.classList.remove("jump-flash"), 1400);
    };
    requestAnimationFrame(() => requestAnimationFrame(go));
    window.setTimeout(go, 120);
  };

  document.addEventListener(
    "click",
    (event) => {
      const jump = event.target.closest("[data-jump]");
      if (!jump) return;
      const card = jump.closest(".card");
      if (!card) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      jumpTo(card, jump.dataset.jump);
    },
    true
  );

  const observe = () => {
    scan();
    const observer = new MutationObserver(scan);
    ["card-grid", "compare-board"].forEach((id) => {
      const root = document.getElementById(id);
      if (root) observer.observe(root, { childList: true, subtree: true });
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", observe);
  else observe();
})();
