const catalog = document.getElementById("catalog");
const catalogStatus = document.getElementById("catalog-status");
const resultsCount = document.getElementById("results-count");
const searchInput = document.getElementById("search");
const industryFilter = document.getElementById("industry-filter");
const availabilityFilter = document.getElementById("availability-filter");
const maturityFilter = document.getElementById("maturity-filter");
const sortSelect = document.getElementById("sort");
const clearFiltersButton = document.getElementById("clear-filters");

let assets = [];

const normalize = (value) => String(value ?? "").toLocaleLowerCase();

function appendTextElement(parent, tagName, text, className) {
  const element = document.createElement(tagName);
  element.textContent = text;

  if (className) {
    element.className = className;
  }

  parent.append(element);
  return element;
}

function renderCard(asset) {
  const card = document.createElement("article");
  card.className = "card";

  const cardHeader = document.createElement("div");
  cardHeader.className = "card-header";
  appendTextElement(cardHeader, "span", asset.availability, "availability");
  appendTextElement(cardHeader, "span", asset.askingRange, "price");
  card.append(cardHeader);

  appendTextElement(card, "h2", asset.title);
  appendTextElement(card, "div", `${asset.industry} • ${asset.maturity}`, "meta");
  appendTextElement(card, "p", asset.summary, "summary");

  const deliverables = document.createElement("div");
  deliverables.className = "deliverables";
  deliverables.setAttribute("aria-label", "Included deliverables");
  asset.deliverables.forEach((deliverable) => {
    appendTextElement(deliverables, "span", deliverable, "badge");
  });
  card.append(deliverables);

  const cta = document.createElement("a");
  cta.className = "cta";
  cta.href = asset.cta;
  cta.textContent = "Request Private Review";
  cta.setAttribute("aria-label", `Request private review of ${asset.title}`);
  card.append(cta);

  return card;
}

function filteredAndSortedAssets() {
  const query = normalize(searchInput.value.trim());
  const industry = industryFilter.value;
  const availability = availabilityFilter.value;
  const maturity = maturityFilter.value;

  const filtered = assets.filter((asset) => {
    const searchableFields = [
      asset.title,
      asset.industry,
      asset.maturity,
      asset.availability,
      asset.askingRange,
      asset.summary,
      ...asset.deliverables
    ];

    return (
      (!query || searchableFields.some((field) => normalize(field).includes(query))) &&
      (!industry || asset.industry === industry) &&
      (!availability || asset.availability === availability) &&
      (!maturity || asset.maturity === maturity)
    );
  });

  return filtered.sort((a, b) => {
    if (sortSelect.value === "title-desc") {
      return b.title.localeCompare(a.title);
    }

    if (sortSelect.value === "industry") {
      return a.industry.localeCompare(b.industry) || a.title.localeCompare(b.title);
    }

    return a.title.localeCompare(b.title);
  });
}

function renderCatalog() {
  const visibleAssets = filteredAndSortedAssets();
  catalog.replaceChildren(...visibleAssets.map(renderCard));
  resultsCount.textContent = `${visibleAssets.length} ${visibleAssets.length === 1 ? "asset" : "assets"}`;
  catalogStatus.hidden = visibleAssets.length > 0;
  clearFiltersButton.hidden = visibleAssets.length > 0 || !assets.length;
}

function populateFilter(select, values) {
  [...new Set(values)].sort((a, b) => a.localeCompare(b)).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function validateAssets(data) {
  if (!Array.isArray(data)) {
    throw new Error("Catalog data must be an array.");
  }

  return data.filter((asset) => (
    asset &&
    typeof asset.title === "string" &&
    typeof asset.industry === "string" &&
    typeof asset.maturity === "string" &&
    typeof asset.availability === "string" &&
    typeof asset.askingRange === "string" &&
    typeof asset.summary === "string" &&
    Array.isArray(asset.deliverables) &&
    asset.deliverables.every((deliverable) => typeof deliverable === "string") &&
    typeof asset.cta === "string"
  ));
}

function clearFilters() {
  searchInput.value = "";
  industryFilter.value = "";
  availabilityFilter.value = "";
  maturityFilter.value = "";
  sortSelect.value = "title-asc";
  renderCatalog();
  searchInput.focus();
}

async function loadCatalog() {
  try {
    const response = await fetch("assets.json");

    if (!response.ok) {
      throw new Error(`Catalog request failed with status ${response.status}.`);
    }

    assets = validateAssets(await response.json());
    populateFilter(industryFilter, assets.map((asset) => asset.industry));
    populateFilter(availabilityFilter, assets.map((asset) => asset.availability));
    populateFilter(maturityFilter, assets.map((asset) => asset.maturity));
    renderCatalog();
  } catch (error) {
    console.error("Unable to load the Asset Foundry catalog.", error);
    catalogStatus.textContent = "The catalog is temporarily unavailable. Please try again shortly.";
    catalogStatus.hidden = false;
    resultsCount.textContent = "Catalog unavailable";
  }
}

[searchInput, industryFilter, availabilityFilter, maturityFilter, sortSelect].forEach((control) => {
  control.addEventListener("input", renderCatalog);
});
clearFiltersButton.addEventListener("click", clearFilters);

loadCatalog();
