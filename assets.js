const assets = [
  {
    title: "Private Money For Investors",
    industry: "Private Money / Funding",
    maturity: "Operationalized / Pre-Seasoning",
    availability: "Under Review",
    askingRange: "$25K–$30K",
    summary: "A private money and funding asset with brand, website, intake, tracking, HPMOS backend, proof stack, and managed launch support.",
    deliverables: ["Brand", "Website", "Intake", "HPMOS", "Analytics", "Sales Room"],
    cta: "#"
  }
];

const catalog = document.getElementById("catalog");

catalog.innerHTML = assets.map(asset => `
  <article class="card">
    <h2>${asset.title}</h2>
    <div class="meta">${asset.industry} • ${asset.maturity}</div>
    <p>${asset.summary}</p>
    <div>
      ${asset.deliverables.map(d => `<span class="badge">${d}</span>`).join("")}
    </div>
    <p><strong>Availability:</strong> ${asset.availability}</p>
    <p><strong>Asking Range:</strong> ${asset.askingRange}</p>
    <a class="cta" href="${asset.cta}">Request Private Review →</a>
  </article>
`).join("");
