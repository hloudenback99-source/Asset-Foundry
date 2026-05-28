const DEFAULT_REVIEW_URL = 'https://calendly.com/haydenloudenback/30min';
const DEFAULT_CUSTOM_BUILD_URL = 'https://www.haydenworks.us/gbrands';

let allAssets = [];
let activeFilter = 'all';

const grid = document.getElementById('assetGrid');
const searchInput = document.getElementById('searchInput');
const featuredLimit = Number(document.body.dataset.featuredLimit || 0);

function arr(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function safe(value, fallback = '') {
  return value || fallback;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));
}

function prettyName(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.includes(' ') || raw.includes('.') || raw.length < 10) return raw;
  return raw.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
}

function displayTitle(asset) {
  return prettyName(asset.assetName || asset.title || 'Untitled Asset');
}

function allTokens(asset) {
  return [
    asset.title, asset.assetName, asset.askingRange, asset.ndaRequired, asset.publicSummary,
    ...arr(asset.industry), ...arr(asset.maturityStatus), ...arr(asset.availability),
    ...arr(asset.acquisitionType), ...arr(asset.buyerType), ...arr(asset.included),
    ...arr(asset.establishedData)
  ].join(' ').toLowerCase();
}

async function fetchAssets() {
  try {
    const res = await fetch('/api/assets', { cache: 'no-store' });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    return data.assets || [];
  } catch (err) {
    const fallback = await fetch('/assets.sample.json', { cache: 'no-store' });
    const data = await fallback.json();
    return data.assets || [];
  }
}

function badgeClass(label) {
  const x = String(label).toLowerCase();
  if (x.includes('season') || x.includes('support')) return 'green';
  if (x.includes('review') || x.includes('private') || x.includes('nda') || x.includes('first')) return 'gold';
  if (x.includes('real estate') || x.includes('funding')) return 'blue';
  if (x.includes('limited') || x.includes('reserved') || x.includes('sold')) return 'red';
  return '';
}

function card(asset) {
  const availability = arr(asset.availability)[0] || 'Private Review';
  const industry = arr(asset.industry)[0] || 'Digital Asset';
  const maturity = arr(asset.maturityStatus)[0] || 'Seasoning';
  const title = displayTitle(asset);
  const img = asset.previewImage
    ? `<img src="${esc(asset.previewImage)}" alt="${esc(title)} preview" />`
    : `<div class="preview-fallback"><div><div class="fallback-mark"></div><strong>${esc(industry)}</strong><br/><span style="color:var(--muted)">Private Asset Preview</span></div></div>`;
  const tags = [...arr(asset.industry).slice(0,2), ...arr(asset.maturityStatus).slice(0,1), ...arr(asset.availability).slice(0,1)]
    .map(t => `<span class="tag ${badgeClass(t)}">${esc(t)}</span>`).join('');
  const summary = safe(asset.publicSummary, 'Public overview available now. Full performance data, backend screenshots, partner structure, database details, and transfer terms are shared after buyer qualification and NDA.');
  const clipped = summary.length > 170 ? `${summary.slice(0, 170)}…` : summary;

  return `
    <article class="card">
      <div class="preview">${img}<div class="ribbon">${esc(availability)}</div></div>
      <div class="content">
        <h3>${esc(title)}</h3>
        <div class="tags">${tags}</div>
        <p class="summary">${esc(clipped)}</p>
        <div class="meta">
          <div><small>Ask</small><strong>${esc(safe(asset.askingRange, 'Request Details'))}</strong></div>
          <div><small>NDA Required</small><strong>${esc(safe(asset.ndaRequired, 'Yes'))}</strong></div>
        </div>
      </div>
      <div class="card-actions"><button class="btn secondary" onclick="openAsset('${esc(asset.id)}')">View Asset</button></div>
    </article>
  `;
}

function render() {
  if (!grid) return;
  const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
  let filtered = allAssets.filter(asset => {
    const tokens = allTokens(asset);
    const matchesSearch = !q || tokens.includes(q);
    const matchesFilter = activeFilter === 'all' || (activeFilter === 'NDA'
      ? String(asset.ndaRequired).toLowerCase().includes('yes')
      : tokens.includes(activeFilter.toLowerCase()));
    return matchesSearch && matchesFilter;
  });

  if (featuredLimit > 0) filtered = filtered.slice(0, featuredLimit);

  grid.innerHTML = filtered.length ? filtered.map(card).join('') : '<div class="empty">No assets match this filter yet.</div>';
}

window.openAsset = function(id) {
  const asset = allAssets.find(a => String(a.id) === String(id));
  if (!asset) return;
  const modal = document.getElementById('modalBackdrop');
  if (!modal) return;
  const hero = document.getElementById('modalHero');
  const title = displayTitle(asset);
  const heroImg = asset.previewImage
    ? `<img src="${esc(asset.previewImage)}" alt="${esc(title)} preview" />`
    : `<div class="preview-fallback"><div><div class="fallback-mark"></div><strong>Private Asset Preview</strong><br/><span style="color:var(--muted)">Full details after NDA</span></div></div>`;

  hero.innerHTML = heroImg;
  document.getElementById('modalEyebrow').textContent = arr(asset.availability)[0] || 'Private Review';
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalSummary').textContent = asset.publicSummary || 'Public overview available now. Full performance data, backend screenshots, partner structure, database details, and transfer terms are shared after buyer qualification and NDA.';
  document.getElementById('modalTags').innerHTML = [...arr(asset.industry), ...arr(asset.maturityStatus), ...arr(asset.acquisitionType), safe(asset.askingRange)]
    .filter(Boolean).map(t => `<span class="tag ${badgeClass(t)}">${esc(t)}</span>`).join('');
  document.getElementById('modalOptions').innerHTML = arr(asset.acquisitionType).length
    ? arr(asset.acquisitionType).map(x => `<span>${esc(x)}</span>`).join('')
    : '<span>Request Private Review</span><span>Reserve First Look</span><span>Build Similar Asset</span>';
  document.getElementById('modalIncluded').innerHTML = arr(asset.included).length
    ? arr(asset.included).map(x => `<span>${esc(x)}</span>`).join('')
    : '<span>Domain / brand / website / CRM / automation / handoff materials</span>';

  const cta = document.getElementById('modalCta');
  const reserveCta = document.getElementById('modalReserveCta');
  const buildCta = document.getElementById('modalBuildCta');
  cta.href = asset.ctaLink || DEFAULT_REVIEW_URL;
  if (reserveCta) reserveCta.href = asset.ctaLink || DEFAULT_REVIEW_URL;
  if (buildCta) buildCta.href = DEFAULT_CUSTOM_BUILD_URL;
  modal.classList.add('open');
};

function setupModal() {
  const close = document.getElementById('closeModal');
  const backdrop = document.getElementById('modalBackdrop');
  if (close && backdrop) close.addEventListener('click', () => backdrop.classList.remove('open'));
  if (backdrop) backdrop.addEventListener('click', (e) => { if (e.target.id === 'modalBackdrop') e.currentTarget.classList.remove('open'); });
}

function setupFilters() {
  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });
  if (searchInput) searchInput.addEventListener('input', render);
}

function setupActiveNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.navlinks a[data-path]').forEach(a => {
    if (a.dataset.path === path) a.classList.add('active');
  });
}

setupModal();
setupFilters();
setupActiveNav();
fetchAssets().then(assets => {
  allAssets = assets;
  render();
});
