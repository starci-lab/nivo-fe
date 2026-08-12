(() => {
  "use strict";

  const model = window.STARCI_REVIEW;
  if (!model || !Array.isArray(model.cases) || model.cases.length === 0) {
    document.querySelector("#review-root").textContent = "No review cases were supplied.";
    return;
  }

  const root = document.querySelector("#review-root");
  const tabs = document.querySelector("#case-tabs");
  const title = document.querySelector("#review-title");
  const meta = document.querySelector("#review-meta");
  let caseIndex = 0;
  let stateIndex = 0;

  title.textContent = model.title;
  meta.textContent = `${model.scope} · ${model.mode} · ${model.cases.length} cases`;

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const list = (values, emptyText) => {
    const element = node("ul", "plain-list");
    const items = values && values.length ? values : [emptyText];
    items.forEach((value) => element.append(node("li", "", value)));
    return element;
  };

  const panel = (heading, content) => {
    const section = node("section", "evidence-panel");
    section.append(node("h3", "", heading), content);
    return section;
  };

  const render = () => {
    const design = model.cases[caseIndex];
    const states = design.states && design.states.length ? design.states : [];
    const state = states[stateIndex] || { id: "missing", label: "Missing", html: "" };
    tabs.querySelectorAll("button").forEach((button, index) => {
      button.setAttribute("aria-selected", String(index === caseIndex));
    });
    root.replaceChildren();

    const intro = node("section", "case-intro");
    intro.append(node("p", "eyebrow", design.id), node("h2", "", design.title));
    intro.append(node("p", "thesis", design.thesis), node("p", "distinction", design.distinction));

    const stateBar = node("div", "state-tabs");
    states.forEach((item, index) => {
      const button = node("button", "state-button", item.label);
      button.type = "button";
      button.setAttribute("aria-pressed", String(index === stateIndex));
      button.addEventListener("click", () => {
        stateIndex = index;
        render();
      });
      stateBar.append(button);
    });

    const canvas = node("section", "canvas-panel");
    const style = document.createElement("style");
    style.textContent = design.css || "";
    const viewport = node("div", "case-canvas");
    viewport.innerHTML = state.html;
    canvas.append(style, stateBar, viewport);

    const evidence = node("div", "evidence-grid");
    evidence.append(panel("Block tree", node("pre", "tree", design.blockTree || "Not supplied")));

    const contractList = node("div", "card-list");
    (design.contracts || []).forEach((contract) => {
      const card = node("article", "mini-card");
      card.append(node("strong", "", contract.key), node("p", "", contract.why));
      contractList.append(card);
    });
    evidence.append(panel("Contracts", contractList));

    const proposalList = node("div", "card-list");
    (design.proposals || []).forEach((proposal) => {
      const card = node("article", "proposal-card");
      card.append(node("strong", "", `${proposal.decision || "new"} Â· ${proposal.tier}: ${proposal.name}`));
      if (proposal.target) card.append(node("p", "", `Target: ${proposal.target}${proposal.targetPath ? ` Â· ${proposal.targetPath}` : ""}`));
      card.append(node("p", "", proposal.reasonForDecision || proposal.reason || "No decision reason supplied."));
      card.append(node("pre", "", JSON.stringify({
        publicApi: proposal.publicApi || { props: proposal.props, on: proposal.on },
        apiDelta: proposal.apiDelta || null,
        affectedCallers: proposal.affectedCallers || [],
        compatibility: proposal.compatibility || "Not supplied.",
        tests: proposal.tests || []
      }, null, 2)));
      proposalList.append(card);
    });
    if (!proposalList.childElementCount) proposalList.append(node("p", "quiet", "No vocabulary or public API change proposed."));
    evidence.append(panel("Proposal shelf", proposalList));

    const claims = node("div", "two-column");
    claims.append(panel("Assumptions", list(design.assumptions, "None recorded.")));
    claims.append(panel("Unknowns", list(design.unknowns, "None recorded.")));

    const source = node("section", "source-panel");
    source.append(node("h3", "", `Actual HTML · ${state.label}`));
    source.append(node("pre", "source-code", state.html));
    source.append(node("h3", "", "Case CSS"), node("pre", "source-code", design.css || ""));

    root.append(intro, canvas, evidence, claims, source);
  };

  model.cases.forEach((design, index) => {
    const button = node("button", "case-button", `${design.id} · ${design.title}`);
    button.type = "button";
    button.setAttribute("role", "tab");
    button.addEventListener("click", () => {
      caseIndex = index;
      stateIndex = 0;
      render();
    });
    tabs.append(button);
  });

  render();
})();
