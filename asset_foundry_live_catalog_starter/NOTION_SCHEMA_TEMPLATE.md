# Notion Asset Foundry Database Schema

Use these fields to make the live catalog work smoothly.

| Field Name | Type | Public? | Notes |
|---|---|---:|---|
| Asset Name | Title | Yes | Main card/title display. |
| Industry | Multi-select | Yes | Private Money, Business Funding, Real Estate Investor, Hospitality, Local Service. |
| Maturity Status | Multi-select | Yes | Fresh Build, Live, Seasoning, Seasoned, Premium Seasoned. |
| Availability | Multi-select | Yes | First-Look Review Open, Currently Seasoning, Accepting Soft Offers, Under Private Review, Reserved, Sold. |
| Acquisition Type | Multi-select | Yes | Acquire Only, Acquire + Support, Reserve First Look, Custom Build Available. |
| Asking Range | Select/Text | Yes | Request Details, $15K-$35K, $25K-$50K, $50K+. |
| Buyer Type | Multi-select | Yes | Gator Lender, Funding Broker, Private Money Operator, Local Business Owner, Investor. |
| Included | Multi-select | Yes | Domain, Brand, Website, CRM, Automation, Email Suite, SEO, Social, SOP, Lead Intake. |
| Established Data | Multi-select | Yes | Domain Age, Search Impressions, CRM Testing, Traffic, Lead Data Available After NDA. |
| NDA Required? | Checkbox/Select | Yes | Usually Yes. |
| Public Summary | Text | Yes | Safe buyer-facing summary. |
| Preview Image | File/URL | Yes | Card image. |
| CTA Link | URL | Yes | Google Form, Calendly, or HaydenWorks CTA. |
| Public | Checkbox | Internal control | Only checked assets appear publicly if this field exists. |
| Minimum Acceptable Offer | Number | No | Internal only. |
| Build Cost | Number | No | Internal only. |
| Profit Margin | Formula | No | Internal only. |
| Partner Details | Text | No | Do not expose publicly. |
| Login / Transfer Notes | Text | No | Do not expose publicly. |
| Private Diligence Folder | URL | No | Share only after NDA. |
