HAYDENWORKS ASSET FOUNDRY LIVE CATALOG - UPDATED MAINSTAGE BUILD
=================================================================

What changed in this version:
- Navigation now points to real clean URL pages instead of dead anchors.
- Added real content pages for:
  /gallery
  /industries
  /how-it-works
  /for-sellers
  /private-review
  /build-custom
- Shared styling was moved into public/styles.css.
- Asset gallery and modal logic was moved into public/catalog.js.
- The home and gallery pages still pull live assets from /api/assets.
- If the Notion API fails, the site still falls back to public/assets.sample.json.

FOLDER STRUCTURE
----------------
public/index.html              Home / MainStage page
public/gallery.html            Full live asset gallery
public/industries.html         Industry funnel overview
public/how-it-works.html       Buyer process and model explanation
public/for-sellers.html        Seller/partner packaging page
public/private-review.html     Private review / NDA step explanation
public/build-custom.html       Custom build path explanation
public/styles.css              Shared brand styling
public/catalog.js              Live asset gallery + modal logic
public/assets.sample.json      Fallback sample data
api/assets.js                  Secure Notion API bridge
vercel.json                    Clean URL routing
package.json                   Project metadata

DEPLOYMENT
----------
1. Replace your existing GitHub repo files with the files in this package.
2. Keep your existing Vercel Environment Variables:
   NOTION_SECRET
   NOTION_MODE=database_legacy
   NOTION_DATABASE_ID
   NOTION_VERSION=2022-06-28
3. Redeploy in Vercel.
4. Test these URLs:
   /
   /gallery
   /industries
   /how-it-works
   /for-sellers
   /private-review
   /build-custom
   /api/assets

IMPORTANT
---------
Do not paste your Notion API secret into any public file. Keep it only in Vercel Environment Variables.

CTA LINKS TO UPDATE LATER
-------------------------
In public/catalog.js:
DEFAULT_REVIEW_URL currently points to Calendly.
DEFAULT_CUSTOM_BUILD_URL currently points to https://www.haydenworks.us/gbrands

In public/private-review.html:
The Schedule Asset Review button points to Calendly.

When your Google Form is ready, replace the Calendly link with the Google Form link or use Calendly as the call step after qualification.
