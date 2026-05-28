/*
  HaydenWorks Asset Foundry - Notion API bridge
  ------------------------------------------------
  Purpose: Securely fetch public-safe asset records from Notion without exposing
  your Notion secret to the browser.

  Required Vercel environment variables:
  - NOTION_SECRET
  - NOTION_DATA_SOURCE_ID  (preferred current Notion API route)
  - NOTION_VERSION=2025-09-03

  Optional legacy fallback:
  - NOTION_MODE=database_legacy
  - NOTION_DATABASE_ID
  - NOTION_VERSION=2022-06-28
*/

const DEFAULT_VERSION = process.env.NOTION_VERSION || '2025-09-03';
const CACHE_SECONDS = Number(process.env.CACHE_SECONDS || 300);

let memoryCache = {
  expiresAt: 0,
  payload: null,
};

function plainText(richText = []) {
  if (!Array.isArray(richText)) return '';
  return richText.map((t) => t?.plain_text || '').join('').trim();
}

function getProp(props, names) {
  for (const name of names) {
    if (props && Object.prototype.hasOwnProperty.call(props, name)) return props[name];
  }
  return null;
}

function propToString(prop) {
  if (!prop) return '';
  switch (prop.type) {
    case 'title': return plainText(prop.title);
    case 'rich_text': return plainText(prop.rich_text);
    case 'select': return prop.select?.name || '';
    case 'status': return prop.status?.name || '';
    case 'number': return prop.number === null || prop.number === undefined ? '' : String(prop.number);
    case 'url': return prop.url || '';
    case 'email': return prop.email || '';
    case 'phone_number': return prop.phone_number || '';
    case 'checkbox': return prop.checkbox ? 'Yes' : 'No';
    case 'date': return prop.date?.start || '';
    case 'formula': return formulaToString(prop.formula);
    case 'rollup': return rollupToString(prop.rollup);
    case 'multi_select': return (prop.multi_select || []).map((x) => x.name).join(', ');
    case 'files': return firstFileUrl(prop.files || '');
    default: return '';
  }
}

function formulaToString(formula) {
  if (!formula) return '';
  if (formula.type === 'string') return formula.string || '';
  if (formula.type === 'number') return formula.number === null ? '' : String(formula.number);
  if (formula.type === 'boolean') return formula.boolean ? 'Yes' : 'No';
  if (formula.type === 'date') return formula.date?.start || '';
  return '';
}

function rollupToString(rollup) {
  if (!rollup) return '';
  if (rollup.type === 'number') return rollup.number === null ? '' : String(rollup.number);
  if (rollup.type === 'array') return rollup.array.map(propToString).filter(Boolean).join(', ');
  if (rollup.type === 'date') return rollup.date?.start || '';
  return '';
}

function propToArray(prop) {
  if (!prop) return [];
  if (prop.type === 'multi_select') return (prop.multi_select || []).map((x) => x.name).filter(Boolean);
  const str = propToString(prop);
  return str ? str.split(',').map((x) => x.trim()).filter(Boolean) : [];
}

function firstFileUrl(files = []) {
  if (!Array.isArray(files) || files.length === 0) return '';
  const first = files[0];
  if (first.type === 'external') return first.external?.url || '';
  if (first.type === 'file') return first.file?.url || '';
  return '';
}

function isPublicRecord(props) {
  const publicProp = getProp(props, ['Public', 'Public?', 'Show Publicly', 'Published', 'Published?']);
  if (!publicProp) return true; // if no Public property exists, include by default
  if (publicProp.type === 'checkbox') return Boolean(publicProp.checkbox);
  const value = propToString(publicProp).toLowerCase();
  return ['yes', 'true', 'public', 'published', 'live'].includes(value);
}

function pageToAsset(page) {
  const props = page.properties || {};

  const titleProp = getProp(props, ['Asset Name', 'Name', 'Title']);
  const previewProp = getProp(props, ['Preview Image', 'Cover Image', 'Image', 'Hero Image', 'Thumbnail']);
  const summaryProp = getProp(props, ['Public Summary', 'Asset Summary', 'Summary', 'Overview', 'Description']);
  const askProp = getProp(props, ['Asking Range', 'Ask', 'Price Range', 'Acquisition Range']);
  const ctaProp = getProp(props, ['CTA Link', 'Apply Link', 'Review Link', 'Form Link']);

  const title = propToString(titleProp) || 'Untitled Asset';
  const cover = page.cover?.type === 'external'
    ? page.cover.external.url
    : page.cover?.type === 'file'
      ? page.cover.file.url
      : '';

  return {
    id: page.id,
    notionUrl: page.url,
    title,
    assetName: title,
    industry: propToArray(getProp(props, ['Industry', 'Industries'])),
    maturityStatus: propToArray(getProp(props, ['Maturity Status', 'Maturity', 'Status'])),
    availability: propToArray(getProp(props, ['Availability', 'Availability Status'])),
    acquisitionType: propToArray(getProp(props, ['Acquisition Type', 'Acquisition Path', 'Offer Type'])),
    askingRange: propToString(askProp) || 'Request Details',
    buyerType: propToArray(getProp(props, ['Buyer Type', 'Ideal Buyer', 'Buyer Avatar'])),
    included: propToArray(getProp(props, ['Included', 'Included Systems', 'Includes'])),
    establishedData: propToArray(getProp(props, ['Established Data', 'Seasoning Data', 'Data Available'])),
    ndaRequired: propToString(getProp(props, ['NDA Required?', 'NDA Required', 'NDA'])) || 'Yes',
    publicSummary: propToString(summaryProp) || 'Full asset overview available after buyer qualification and NDA.',
    previewImage: propToString(previewProp) || cover || '',
    ctaLink: propToString(ctaProp) || '',
    updatedAt: page.last_edited_time,
  };
}

async function queryNotion() {
  const secret = process.env.NOTION_SECRET;
  if (!secret) throw new Error('Missing NOTION_SECRET environment variable.');

  const mode = process.env.NOTION_MODE || 'data_source';
  let endpoint;
  let body = {
    page_size: 50,
    sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
  };

  if (mode === 'database_legacy') {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) throw new Error('Missing NOTION_DATABASE_ID environment variable.');
    endpoint = `https://api.notion.com/v1/databases/${databaseId}/query`;
  } else {
    const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
    if (!dataSourceId) throw new Error('Missing NOTION_DATA_SOURCE_ID environment variable.');
    endpoint = `https://api.notion.com/v1/data_sources/${dataSourceId}/query`;
  }

  const allResults = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json',
        'Notion-Version': DEFAULT_VERSION,
      },
      body: JSON.stringify(startCursor ? { ...body, start_cursor: startCursor } : body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Notion API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    allResults.push(...(data.results || []));
    hasMore = Boolean(data.has_more);
    startCursor = data.next_cursor;
  }

  return allResults
    .filter((page) => page.object === 'page' && isPublicRecord(page.properties || {}))
    .map(pageToAsset);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const now = Date.now();
    if (memoryCache.payload && memoryCache.expiresAt > now) {
      res.setHeader('Cache-Control', `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`);
      return res.status(200).json(memoryCache.payload);
    }

    const assets = await queryNotion();
    const payload = { assets, generatedAt: new Date().toISOString() };
    memoryCache = { payload, expiresAt: now + CACHE_SECONDS * 1000 };

    res.setHeader('Cache-Control', `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`);
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
}
