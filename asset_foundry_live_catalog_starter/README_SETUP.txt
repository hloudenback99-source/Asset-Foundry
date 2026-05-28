HAYDENWORKS ASSET FOUNDRY LIVE CATALOG STARTER
================================================

What this is:
A branded public Asset Foundry catalog that can pull approved public fields from your Notion asset database through a secure Vercel API function.

You do NOT need to build the HTML or API from scratch. The files are already included.

IMPORTANT SECURITY RULE
-----------------------
Never paste your real Notion secret/API token into ChatGPT, Messenger, email, or public files. Your token belongs only in Vercel Environment Variables.

FOLDER STRUCTURE
----------------
public/index.html          Branded public catalog UI
public/assets.sample.json  Demo data fallback if the API is not connected yet
api/assets.js              Secure Notion API bridge for Vercel
.env.example               Environment variable names to copy into Vercel
vercel.json                Simple routing config
package.json               Project metadata

FASTEST MVP PATH
----------------
1. Upload this folder to a GitHub repository.
2. Connect the repository to Vercel.
3. Deploy it first without Notion connected. It will show sample assets.
4. Once the design is approved, connect Notion using the API steps below.

NOTION API SETUP
----------------
1. Go to Notion's developer portal and create a new internal integration/connection.
2. Copy the Notion secret token, but do not share it publicly.
3. In your Notion Asset Foundry database, click the three-dot menu and choose Add Connections.
4. Add your new integration/connection to the database/page.
5. Find your data source ID.
6. In Vercel, open your project settings > Environment Variables.
7. Add:

   NOTION_SECRET = your Notion secret
   NOTION_DATA_SOURCE_ID = your Asset Foundry data source ID
   NOTION_VERSION = 2025-09-03

8. Redeploy the Vercel project.

LEGACY FALLBACK
---------------
If you cannot find the data source ID, you may test the older database query route by setting:

   NOTION_MODE = database_legacy
   NOTION_DATABASE_ID = your Notion database ID
   NOTION_VERSION = 2022-06-28

The current Notion API prefers data sources, so this should only be a fallback.

RECOMMENDED NOTION FIELDS
-------------------------
The API bridge looks for these fields. You do not need every field, but these names will work best:

Asset Name                 title
Industry                   multi-select
Maturity Status            multi-select or select
Availability               multi-select or select
Acquisition Type           multi-select
Asking Range or Ask         select or text
Buyer Type / Ideal Buyer    multi-select
Included                   multi-select
Established Data           multi-select
NDA Required?              checkbox or select
Public Summary             text
Preview Image              file or URL
CTA Link                   URL
Public                     checkbox, optional

PUBLIC / PRIVATE LOGIC
----------------------
If you add a checkbox property called Public and check it, only checked assets will show publicly.
If no Public field exists, all records visible to the Notion integration will show.

Keep these private and do not expose them publicly:
- Build cost
- Profit margin
- Minimum acceptable offer
- Exact borrower records
- Partner names/terms
- Login details
- Internal notes
- Private diligence folder
- Negotiation notes

TROUBLESHOOTING
---------------
If your live site shows sample assets instead of Notion data:
- Check the Vercel function logs.
- Confirm NOTION_SECRET is set.
- Confirm NOTION_DATA_SOURCE_ID is set.
- Confirm the Notion database/page is shared with your integration.
- Confirm the integration has read content permission.

If the Notion API says 404:
- The database/data source is usually not shared with the integration.
- Or the ID is wrong.

If the Notion API says 403:
- The integration probably lacks read content capability.

NEXT STEP
---------
Once this is deployed, point a subdomain like assets.haydenworks.us or foundry.haydenworks.us to Vercel.
