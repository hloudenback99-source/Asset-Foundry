const assets = [
  {
    title: "Private Money For Investors",
    subtitle: "Investor funding infrastructure",
    assetType: "Full Asset Stack",
    category: "Funding Infrastructure",
    maturityStage: "Operationalized / Pre-Seasoning",
    availability: "Under Review",
    askingRange: "$25K–$30K",
    commercializationPath: "Acquisition",
    badges: ["Featured", "Acquisition Available", "HPMOS Powered"],
    summary: "A deployable private-money platform combining a market-ready brand, lead intake, operational workflows, tracking, and managed launch infrastructure.",
    featured: true,
    ndaRequired: true,
    privateReviewUrl: "mailto:review@haydenworks.com?subject=Private%20Review%3A%20Private%20Money%20For%20Investors",
    status: "Buyer review active",
    sortWeight: 100
  },
  {
    title: "HPMOS",
    subtitle: "HaydenWorks Private Money Operating System",
    assetType: "Operating System",
    category: "Private Money Operations",
    maturityStage: "Build / Internal Infrastructure",
    availability: "Custom Build Available",
    askingRange: "Custom Quote",
    commercializationPath: "Licensing / Custom Build",
    badges: ["Operating System", "Custom Build Available", "Licensable"],
    summary: "A private-money operating system designed to structure intake, qualification, deal tracking, communications, and repeatable execution.",
    featured: false,
    ndaRequired: true,
    privateReviewUrl: "mailto:review@haydenworks.com?subject=Private%20Review%3A%20HPMOS",
    status: "Qualified inquiries open",
    sortWeight: 90
  },
  {
    title: "HADOS",
    subtitle: "HaydenWorks Automated Deal Operating System",
    assetType: "Operating System",
    category: "Deal Automation",
    maturityStage: "Build / Internal Infrastructure",
    availability: "Future Licensing",
    askingRange: "TBD",
    commercializationPath: "Future Licensing",
    badges: ["Operating System", "Automation Infrastructure", "Coming Soon"],
    summary: "A planned automation layer for orchestrating deal intake, pipeline movement, follow-up logic, and operator visibility across complex transactions.",
    featured: false,
    ndaRequired: false,
    privateReviewUrl: "mailto:review@haydenworks.com?subject=Private%20Review%3A%20HADOS",
    status: "Roadmap preview",
    sortWeight: 80
  },
  {
    title: "HHROS",
    subtitle: "HaydenWorks Hospitality & Housing Revenue Operating System",
    assetType: "Operating System",
    category: "Hospitality & Housing Revenue",
    maturityStage: "Concept / Planned",
    availability: "Future Build",
    askingRange: "TBD",
    commercializationPath: "Future Build",
    badges: ["Operating System", "Hospitality Infrastructure", "Coming Soon"],
    summary: "A planned revenue operating system for hospitality and housing operators, built to connect demand generation with repeatable commercial workflows.",
    featured: false,
    ndaRequired: false,
    privateReviewUrl: "mailto:review@haydenworks.com?subject=Private%20Review%3A%20HHROS",
    status: "Concept preview",
    sortWeight: 70
  },
  {
    title: "HBFOS",
    subtitle: "HaydenWorks Business Funding Operating System",
    assetType: "Operating System",
    category: "Business Funding",
    maturityStage: "Concept / Planned",
    availability: "Future Build",
    askingRange: "TBD",
    commercializationPath: "Future Build",
    badges: ["Operating System", "Business Funding", "Coming Soon"],
    summary: "A planned operating system for business-funding workflows, designed around structured qualification, opportunity routing, and revenue operations.",
    featured: false,
    ndaRequired: false,
    privateReviewUrl: "mailto:review@haydenworks.com?subject=Private%20Review%3A%20HBFOS",
    status: "Concept preview",
    sortWeight: 60
  }
];

const catalog = document.getElementById("catalog");
const emptyState = document.getElementById("empty-state");
const controls = document.getElementById("catalog-controls");
const searchInput = document.getElementById("search");
const assetTypeSelect = document.getElementById("asset-type");
const maturitySelect = document.getElementById("maturity-stage");
const availabilitySelect = document.getElementById("availability");
const commercializationSelect = document.getElementById("commercialization-path");
const sortSelect = document.getElementById("sort-by");
const resetButton = document.getElementById("reset-filters");
const emptyResetButton = document.getElementById("empty-reset");
const resultCount = document.getElementById("result-count");
const resultLabel = document.getElementById("result-label");
const heroAssetCount = document.getElementById("hero-asset-count");

const premiumBadges = new Set(["Featured", "Acquisition Available"]);
const maturityOrder = ["Operationalized / Pre-Seasoning", "Build / Internal Infrastructure", "Concept / Planned"];
const availabilityOrder = ["Under Review", "Custom Build Available", "Future Licensing", "Future Build"];

function populateSelect(select, values) {
  [...new Set(values)].forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

populateSelect(assetTypeSelect, assets.map(asset => asset.assetType));
populateSelect(maturitySelect, assets.map(asset => asset.maturityStage));
populateSelect(availabilitySelect, assets.map(asset => asset.availability));
populateSelect(commercializationSelect, assets.map(asset => asset.commercializationPath));
heroAssetCount.textContent = String(assets.length).padStart(2, "0");

function askingRangeValue(range) {
  const match = range.match(/\$(\d+)K/);
  return match ? Number(match[1]) : -1;
}

function cardTemplate(asset, index) {
  const badges = asset.badges.map(badge => `<span class="badge${premiumBadges.has(badge) ? " premium" : ""}">${badge}</span>`).join("");
  return `
    <article class="asset-card${asset.featured ? " featured" : ""}">
      <div class="card-topline">
        <span class="card-index">Asset ${String(index + 1).padStart(2, "0")}</span>
        <span>${asset.featured ? '<span class="card-featured">Featured opportunity</span>' : asset.status}</span>
      </div>
      <h3 class="card-title">${asset.title}</h3>
      <p class="card-subtitle">${asset.subtitle}</p>
      <p class="card-summary">${asset.summary}</p>
      <div class="badges">${badges}</div>
      <dl class="asset-details">
        <div><dt>Asset type</dt><dd>${asset.assetType}</dd></div>
        <div><dt>Category</dt><dd>${asset.category}</dd></div>
        <div><dt>Maturity</dt><dd>${asset.maturityStage}</dd></div>
        <div><dt>Availability</dt><dd>${asset.availability}</dd></div>
        <div><dt>Asking range</dt><dd>${asset.askingRange}</dd></div>
        <div><dt>Commercialization</dt><dd>${asset.commercializationPath}</dd></div>
      </dl>
      <div class="card-footer">
        <a class="card-cta" href="${asset.privateReviewUrl}">Request private review <span aria-hidden="true">↗</span></a>
        <span class="nda">${asset.ndaRequired ? "NDA may be required" : "Buyer-safe overview"}</span>
      </div>
    </article>`;
}

function renderCatalog() {
  const query = searchInput.value.trim().toLowerCase();
  const filters = {
    assetType: assetTypeSelect.value,
    maturityStage: maturitySelect.value,
    availability: availabilitySelect.value,
    commercializationPath: commercializationSelect.value
  };

  const filteredAssets = assets.filter(asset => {
    const searchable = [asset.title, asset.subtitle, asset.assetType, asset.category, asset.maturityStage, asset.availability, asset.commercializationPath, asset.summary, ...asset.badges].join(" ").toLowerCase();
    return (!query || searchable.includes(query)) && Object.entries(filters).every(([key, value]) => value === "all" || asset[key] === value);
  });

  filteredAssets.sort((a, b) => {
    if (sortSelect.value === "askingRange") return askingRangeValue(b.askingRange) - askingRangeValue(a.askingRange) || b.sortWeight - a.sortWeight;
    if (sortSelect.value === "maturity") return maturityOrder.indexOf(a.maturityStage) - maturityOrder.indexOf(b.maturityStage) || b.sortWeight - a.sortWeight;
    if (sortSelect.value === "availability") return availabilityOrder.indexOf(a.availability) - availabilityOrder.indexOf(b.availability) || b.sortWeight - a.sortWeight;
    return Number(b.featured) - Number(a.featured) || b.sortWeight - a.sortWeight;
  });

  catalog.innerHTML = filteredAssets.map(cardTemplate).join("");
  catalog.hidden = filteredAssets.length === 0;
  emptyState.hidden = filteredAssets.length !== 0;
  resultCount.textContent = filteredAssets.length;
  resultLabel.textContent = filteredAssets.length === 1 ? "asset available" : "assets available";
  const hasActiveFilters = query || Object.values(filters).some(value => value !== "all") || sortSelect.value !== "featured";
  resetButton.classList.toggle("visible", Boolean(hasActiveFilters));
}

controls.addEventListener("input", renderCatalog);
controls.addEventListener("change", renderCatalog);
controls.addEventListener("reset", () => window.setTimeout(renderCatalog, 0));
emptyResetButton.addEventListener("click", () => {
  controls.reset();
  renderCatalog();
});

renderCatalog();
