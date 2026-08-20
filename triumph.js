(() => {
  const doseLadder =
    "Phase 3 data (TRIUMPH-1, 2026) puts average weight loss around 28% at 80 weeks on the 12 mg dose, extending toward 30% by 104 weeks in higher-BMI participants — but that same top dose also carries the highest GI burden, the highest dysesthesia rate, and the highest treatment-discontinuation rate. A higher available dose does not mean a person benefiting at a lower exposure needs to chase it.";

  const extraWatch = [
    "Dysesthesia — tingling or altered skin sensation — is a distinctive finding: roughly 12–13% at 12 mg in the general-obesity TRIUMPH-1 trial, closer to 21% in the older TRIUMPH-4 knee-osteoarthritis population, versus under 1% on placebo. Usually mild; rarely a reason to stop.",
    "Gallbladder events (cholelithiasis, occasionally cholecystitis) have been reported at low rates — consistent with the GLP-1 class generally, and more likely driven by rapid weight loss and reduced gallbladder motility than by anything specific to the triple-receptor mechanism.",
    "A modest increase in urinary tract infections has also shown up in Phase 3 data."
  ];

  const patchCard = (card) => {
    if (!card || card.dataset.triumphReady) return;
    card.dataset.triumphReady = "1";

    card.querySelectorAll(".mechanism").forEach((el) => {
      const label = el.querySelector(".mechanism-label");
      if (!label || !/dose ladder/i.test(label.textContent || "")) return;
      if (el.textContent.includes("TRIUMPH-1")) return;
      while (el.lastChild && el.lastChild !== label) el.removeChild(el.lastChild);
      el.append(document.createTextNode(doseLadder));
    });

    const watch = card.querySelector("#retatrutide-watch");
    if (!watch || watch.textContent.includes("Dysesthesia")) return;
    const list = watch.querySelector("ul");
    if (!list) return;
    const last = list.lastElementChild;
    extraWatch.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      if (last) list.insertBefore(li, last);
      else list.append(li);
    });
  };

  const scan = () => document.querySelectorAll('.card[data-id="retatrutide"]').forEach(patchCard);

  const start = () => {
    scan();
    const observer = new MutationObserver(scan);
    ["card-grid", "compare-board"].forEach((id) => {
      const root = document.getElementById(id);
      if (root) observer.observe(root, { childList: true, subtree: true });
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
