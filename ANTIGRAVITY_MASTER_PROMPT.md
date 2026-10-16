# Vridhi AI --- MASTER PROMPT FOR ANTIGRAVITY

You are the frontend implementation agent for **Vridhi AI**, an
explainable credit-risk analytics dashboard for Indian MSMEs,
HackConquest 2026, Problem Statement 12.

The project package already contains the backend, model artifacts,
notebook, API contract, frontend specification, samples, and product
documentation.

Your job is to build the **frontend only**, quickly and reliably,
without breaking the existing backend.

------------------------------------------------------------------------

# 1. SOURCE-OF-TRUTH HIERARCHY --- READ THIS FIRST

Before writing code, read these files in this exact order:

1.  `docs/00_RULES.md`
2.  `docs/03_API_CONTRACT.md`
3.  `docs/04_FRONTEND_SPEC.md`
4.  `backend/app.py`
5.  `backend/forecast_api.py`
6.  `samples/summary.json`
7.  `samples/demo_businesses.json`
8.  all remaining files in `samples/`
9.  `docs/01_PRD.md`
10. `docs/02_TRD.md`
11. `README_FIRST.md`

### Conflict rule

When documents disagree, resolve them in this order:

**`docs/00_RULES.md` → `docs/03_API_CONTRACT.md` → actual existing
backend implementation → `docs/04_FRONTEND_SPEC.md` → samples →
PRD/TRD/System Flow/older documentation.**

Do NOT silently invent a reconciliation.

The older PRD/TRD/System Flow documents are useful for product context,
but they must not override the current API contract or the existing
backend.

If something in the API contract appears inconsistent with the actual
backend implementation: - do NOT modify the backend; - use the API
contract as the frontend contract; - record the discrepancy in
`NOTES_FOR_TEAM.md`; - continue with the frontend.

------------------------------------------------------------------------

# 2. NON-NEGOTIABLE PROJECT RULES

## Frontend only

Create a new:

`frontend/`

Do NOT modify anything inside:

`backend/`

This includes: - `backend/app.py` - `backend/forecast_api.py` - model
artifacts - notebook - model files - backend requirements

If you believe a backend change is necessary, write it only in:

`NOTES_FOR_TEAM.md`

and continue building the frontend.

## Stack

Use:

-   React
-   Vite
-   Tailwind CSS
-   Recharts
-   plain JavaScript is acceptable

Do not introduce unnecessary frameworks or dependencies.

## API URL

Use:

`import.meta.env.VITE_API_URL`

Default:

`http://localhost:8000`

Create:

`frontend/.env.example`

containing the API URL variable.

Never hardcode the backend URL inside components.

All HTTP calls must be centralized in:

`frontend/src/api.js`

Components/pages must call functions from `api.js`, not use scattered
`fetch()` calls.

------------------------------------------------------------------------

# 3. DATA INTEGRITY --- VERY IMPORTANT

Never invent:

-   statistics
-   portfolio numbers
-   model results
-   company names
-   testimonials
-   approval rates
-   AUC values
-   fairness values
-   forecast accuracy
-   risk scores

Every displayed number must come from:

1.  a real API response, or
2.  `samples/summary.json`, copied to: `frontend/src/data/summary.json`,
    or
3.  the provided sample/demo files when they are explicitly used as demo
    inputs.

The Impact page must use `summary.json`.

Do not hardcode old presentation values if `summary.json` contains newer
values.

If `sba_real_data_auc` is `null`, do not display it.

------------------------------------------------------------------------

# 4. IMPORTANT MODEL TRUTHS

The backend model does NOT use gender or region as prediction inputs.

Therefore:

-   never put gender on the Assess form;
-   never put region on the Assess form;
-   never describe gender or region as model factors;
-   use them only on the Fairness screen for outcome auditing.

The Fairness page may show gender and region because the backend uses
them for audit analysis.

Use the backend values:

-   `risk_score`
-   `risk_label`
-   `risk_tier`
-   `default_probability`

Do NOT recompute risk labels or tiers in the frontend.

The score is a display score derived by the backend. The backend's
returned label/tier is authoritative.

Loan recommendations are analytical recommendations only.

Always display the backend's:

`loan_recommendation.note`

The UI must clearly communicate that the final lending decision remains
with the lender.

------------------------------------------------------------------------

# 5. BRANDING

All visible UI text must say:

**Vridhi AI**

Do not display "CreditLens" anywhere in the user interface.

Internal filenames/model artifact names containing `creditlens` may
remain unchanged.

Tagline:

**From credit-invisible to credit-worthy**

------------------------------------------------------------------------

# 6. UNITS

Respect the API units exactly.

Important conversions:

-   `gst_on_time_pct`: API fraction 0--1 → display percentage
-   `customer_concentration`: API fraction 0--1 → display percentage
-   `interest_rate`: API fraction → display percentage
-   `turnover_growth`: API fraction → display percentage
-   `*_lakh`: Indian rupees in lakh
-   `business_age`: years
-   `utility_delay_days`: days
-   `receivable_days`: days
-   `bureau_score`: 300--900, or null/0 for no bureau history

When sending percentage inputs back to the API, convert them to the
required fraction.

Never change units merely for visual convenience.

------------------------------------------------------------------------

# 7. VISUAL DESIGN

Build a polished fintech dashboard.

Style:

-   light background
-   deep teal/navy brand colour
-   generous spacing
-   rounded cards
-   subtle shadows
-   clear hierarchy
-   large key numbers
-   concise copy
-   responsive layout

Risk colours must be consistent:

  Tier        Colour      Label
  ----------- ----------- --------
  Healthy     `#16A34A`   LOW
  Watch       `#F59E0B`   MEDIUM
  Stressed    `#EA580C`   HIGH
  High risk   `#DC2626`   HIGH

Never rely on colour alone. Always display the tier/label as text.

Target: - desktop - mobile width 360px - Chrome - Edge - Firefox

------------------------------------------------------------------------

# 8. NAVIGATION

Top navigation:

1.  Assess
2.  Portfolio
3.  Fairness
4.  Batch
5.  Impact

Assess is the default page.

On mobile, collapse navigation into a menu.

Navbar includes:

**Vridhi AI**

and:

**From credit-invisible to credit-worthy**

Also show API status from:

`GET /api/health`

Status should clearly show online/offline.

------------------------------------------------------------------------

# 9. BUILD ORDER

Build in this order and finish each stage before moving to the next:

### STEP 1 --- Foundation

-   Vite app
-   Tailwind
-   Recharts
-   Navbar
-   routing/page switching
-   `src/api.js`
-   API health check
-   `.env.example`
-   global layout
-   loading/error/empty primitives

### STEP 2 --- ASSESS END TO END

This is the highest priority vertical slice.

Implement: - demo presets - complete input form - validation -
`/api/predict` - score gauge - default probability - risk label/tier -
thin-file badge - reason-code chart - loan recommendation

Do not continue until this works end to end.

### STEP 3 --- WHAT-IF + FORECAST

Add: - scenario simulator - cash-flow forecast - DSCR - high-risk months

### STEP 4 --- FAIRNESS

Add: - standard/mitigated toggle - approval rates - disparate impact -
gender/region/size/sector audit - bias alert

### STEP 5 --- PORTFOLIO

Add: - segmentation filters - risk scatter plot - KPI cards -
highest-risk table

### STEP 6 --- BATCH

Add: - CSV drag/drop - validation - upload - summary - results table -
search/sort - CSV download

### STEP 7 --- IMPACT

Add the Impact dashboard from `summary.json`.

### STEP 8 --- POLISH

-   mobile responsiveness
-   loading states
-   empty states
-   error states
-   API offline state
-   accessibility
-   visual consistency
-   `frontend/README.md`

------------------------------------------------------------------------

# 10. ASSESS SCREEN

Desktop:

Two columns: - left = input - right = result

Mobile: - stacked

## Demo presets

Load:

`samples/demo_businesses.json`

Copy it into:

`frontend/src/data/demo_businesses.json`

Presets:

-   Healthy, no bureau history
-   Watch, no bureau history
-   Stressed
-   High risk

Clicking a preset fills the form. User still presses Assess.

## Form

Use the API contract exactly.

Fields:

### Business

-   Sector
-   Business age
-   Annual turnover

### Cash flow

-   Monthly UPI inflow
-   UPI volatility
-   Average collection time

### Compliance

-   GST filed on time
-   Utility bill delay
-   Bounced payments

### Risk

-   Share of sales from top customers
-   Turnover growth

### Loan

-   Existing debt
-   Loan requested
-   Interest rate

### Bureau

-   Bureau score OR No bureau history

Optional: - Business ID / name (`msme_id`)

Never add gender or region to this form.

Validate before sending.

Show clear units beside fields.

------------------------------------------------------------------------

# 11. SCORE RESULT

After `/api/predict`:

## Score card

Show:

-   risk score gauge
-   default probability prominently
-   `risk_tier`
-   `risk_label`
-   thin-file badge when `thin_file === true`

Do not derive tier/label yourself.

For thin-file:

Show:

**No bureau history**

with concise explanatory text:

"Vridhi AI scores this business using alternative data."

Do not make unsupported claims beyond the supplied product
documentation.

------------------------------------------------------------------------

# 12. REASON CODES

Use:

`reason_codes`

Display up to five items.

Use `shap_value` direction:

-   positive = helps / green
-   negative = hurts / red

Display:

-   feature label
-   value
-   impact
-   delta points

Important:

`delta_pts` means percentage points of default probability, NOT score
points.

Do not mislabel it.

Use Recharts for the horizontal bar visualization.

------------------------------------------------------------------------

# 13. LOAN RECOMMENDATION

Display:

-   eligibility
-   suggested amount
-   interest rate range
-   repayment period
-   backend `note`

Eligibility values are strings:

-   Yes
-   Conditional
-   No

Do not treat them as booleans.

For No: - suggested amount may be `0` or `"N/A"`.

------------------------------------------------------------------------

# 14. WHAT-IF SIMULATOR

Only show after an assessment result exists.

Inputs:

-   revenue change: -50% to +50%
-   interest rate change: -3 to +5 percentage points
-   business scale approximate: -50% to +50%
-   GST compliance toggle

Important:

The backend does not have a headcount feature.

Therefore label this:

**Business scale (approximate)**

Debounce calls by approximately 300 ms.

Call:

`POST /api/simulate`

Show:

-   original score
-   projected score
-   score change
-   original/projected labels
-   transition
-   updated loan recommendation

Show:

**Illustrative what-if based on the same model.**

Never claim this is a causal prediction.

------------------------------------------------------------------------

# 15. CASH-FLOW FORECAST

Use:

`POST /api/forecast`

Inputs:

-   12--24 monthly UPI inflow values
-   start month
-   loan amount from form
-   interest rate from form

Optional: - op_margin - upi_share

Provide:

**Use sample history**

using:

`samples/forecast_request.json`

Display:

-   forecast line
-   lower/upper band
-   DSCR
-   min DSCR
-   monthly growth
-   high-risk months

When:

`high_risk_month === true`

display:

**May not cover instalment**

and make the month visually prominent.

DSCR below 1.0 means forecast operating cash does not cover the
instalment that month.

Do not invent forecast values.

------------------------------------------------------------------------

# 16. PORTFOLIO SCREEN

Call:

`GET /api/segmentation`

Optional filters:

-   sector
-   region type
-   size band

Display:

-   businesses shown
-   risk-tier shares
-   average default probability

Scatter plot:

-   X = annual turnover, logarithmic
-   Y = default probability, logarithmic
-   colour = risk tier

Tooltip: - ID - sector - region - size - score - tier

Also show a sortable table of the 20 highest-risk businesses.

Use `risk_tier` as the risk classification.

If the backend also contains a clustering/tier field that differs from
`risk_tier`, do not substitute it for the risk tier.

------------------------------------------------------------------------

# 17. FAIRNESS SCREEN

Call:

`GET /api/fairness`

Mitigated mode:

`GET /api/fairness?mitigated=true`

Show:

-   portfolio approval rate
-   disparate impact per dimension
-   approval-rate charts
-   detailed table
-   bias alerts

Dimensions:

-   gender
-   region
-   size
-   sector

This screen is specifically an audit screen.

Fixed note:

**The model never uses gender or region as inputs. They are used only
here, to audit outcomes.**

Also show:

**Synthetic demo data**

If `bias_detected` is true: - show red alert - list `bias_alerts`

Otherwise: - show green no-alert state

------------------------------------------------------------------------

# 18. BATCH SCREEN

Accept CSV by drag and drop.

Maximum:

5 MB

Reject before upload when possible.

Use:

`POST /api/predict/batch`

Field name:

`file`

Provide:

**Download sample CSV**

using:

`samples/batch_sample.csv`

Show required columns.

After response:

-   total
-   LOW
-   MEDIUM
-   HIGH
-   average score
-   donut chart
-   results table

Table fields: - ID - sector - score - default probability - tier -
thin-file - eligibility - suggested amount

Add search and sorting.

Generate CSV download entirely in browser from the response.

Backend errors must be shown accurately, including missing columns and
bad row numbers.

------------------------------------------------------------------------

# 19. IMPACT SCREEN

Read:

`frontend/src/data/summary.json`

Do not call the API.

Show:

**Results on a synthetic portfolio of 5,000 MSMEs**

Use only the values in `summary.json`.

Display:

### Approval

-   traditional/bureau-only approval rate
-   Vridhi AI approval rate
-   bad rate among approved

### Thin-file

-   thin-file share
-   good thin-file approval comparison

### AUC

-   overall traditional vs Vridhi AI
-   thin-file traditional vs Vridhi AI

### Forecast

-   Vridhi AI forecast MAPE
-   seasonal-naive MAPE

### Fairness

-   disparate impact before
-   disparate impact after

### Stress

-   baseline default rate
-   severe-stress default rate

If:

`sba_real_data_auc === null`

do not display it.

Use "Vridhi AI" in visible UI even though JSON keys contain
`creditlens`.

------------------------------------------------------------------------

# 20. ERROR HANDLING

Every screen needs:

-   loading state
-   empty state
-   error state

When backend returns an error:

show the backend's `error` message.

For structured errors, also show relevant fields such as:

-   missing fields
-   missing columns
-   bad row numbers
-   allowed sectors

If API is unreachable:

show:

**API offline**

and show the URL that was attempted.

Never leave a blank page.

------------------------------------------------------------------------

# 21. FILE STRUCTURE

Create:

``` text
frontend/
  package.json
  vite.config.js
  index.html
  .env.example
  README.md
  src/
    main.jsx
    App.jsx
    api.js
    data/
      summary.json
      demo_businesses.json
    components/
      Navbar.jsx
      ApiStatus.jsx
      ScoreGauge.jsx
      TierBadge.jsx
      ReasonChart.jsx
      LoanCard.jsx
      SimulatorPanel.jsx
      ForecastPanel.jsx
      FairnessCharts.jsx
      RiskScatter.jsx
      BatchDropzone.jsx
      ResultsTable.jsx
    pages/
      Assess.jsx
      Portfolio.jsx
      Fairness.jsx
      Batch.jsx
      Impact.jsx
```

You may add small helper components if they improve maintainability, but
avoid unnecessary complexity.

------------------------------------------------------------------------

# 22. API FUNCTIONS

`frontend/src/api.js` should centralize calls for:

-   `getHealth()`
-   `predictBusiness()`
-   `simulateBusiness()`
-   `getForecast()`
-   `getSegmentation()`
-   `getFairness()`
-   `predictBatch()`

Handle: - base URL - JSON parsing - HTTP errors - error response
extraction

Do not duplicate API URL construction throughout the app.

------------------------------------------------------------------------

# 23. PERFORMANCE

Keep the application fast.

Requirements:

-   avoid unnecessary re-renders
-   debounce simulator requests
-   don't refetch unchanged data
-   don't load giant datasets repeatedly
-   use memoization only where useful
-   keep charts responsive
-   don't add large unnecessary dependencies

The Assess screen is the most important demo path.

------------------------------------------------------------------------

# 24. ACCEPTANCE TESTS

Before declaring the frontend complete, verify:

1.  App starts successfully with Vite.
2.  API health indicator works.
3.  Watch/no-bureau demo preset can be assessed.
4.  Result shows score, default probability, tier and label from API.
5.  Reason-code chart renders correctly.
6.  Loan recommendation renders correctly.
7.  Simulator updates after changing a slider.
8.  Forecast panel accepts sample history and renders.
9.  Fairness screen works in both standard and mitigated modes.
10. Portfolio filters work.
11. Batch sample CSV uploads and renders results.
12. Impact page uses `summary.json`.
13. Stopping the backend produces an API-offline state.
14. Mobile layout works at approximately 360px.
15. No visible UI text says "CreditLens".
16. Gender and region do not appear on the Assess input form.
17. No invented numbers are visible anywhere.
18. No backend files were modified.

------------------------------------------------------------------------

# 25. DOCUMENTATION / NOTES

Create:

`frontend/README.md`

Include:

-   install command
-   development command
-   build command
-   environment variable
-   backend dependency
-   expected local backend URL

If you discover any backend/documentation discrepancy, create/update:

`NOTES_FOR_TEAM.md`

Do not "fix" the backend yourself.

------------------------------------------------------------------------

# 26. IMPORTANT CURRENT-DATA WARNING

The project README states that some older presentation numbers differ
from the latest `samples/summary.json`.

Therefore:

**The frontend must use `samples/summary.json` as the current source for
Impact metrics.**

Do not copy numbers from an older PPT or old documentation into the app.

Also:

`sba_real_data_auc` is currently null.

Do not claim an SBA AUC value unless the supplied data actually contains
one.

------------------------------------------------------------------------

# 27. DO NOT OVERBUILD

This is a hackathon frontend.

Prioritize:

1.  correctness
2.  working API integration
3.  Assess demo
4.  clear explainability
5.  visual polish
6.  responsive design

Do not add: - authentication - real bank integrations - real GST APIs -
real UPI APIs - unnecessary admin panels - unnecessary database -
unnecessary state-management frameworks

Stay within the existing project scope.

------------------------------------------------------------------------

# 28. EXECUTION BEHAVIOUR

Before coding: - inspect the repository; - read the required files; -
inspect the actual backend and samples; - identify any contract/document
discrepancies.

Then implement the build order above.

After each major step: - run/build the frontend; - test the relevant
screen; - fix errors before proceeding.

Do not stop merely because one optional dependency is unavailable if the
frontend can still be implemented against the documented contract and
sample responses.

If the backend cannot run locally: - continue using the API contract and
samples; - clearly report that backend execution could not be
verified; - do not fabricate successful API results.

At the end, report: - files created - files changed - backend files
untouched - commands to run - what was actually tested - any unresolved
discrepancies

------------------------------------------------------------------------

# FINAL PRIORITY

Build a **fast, polished, trustworthy Vridhi AI frontend** around the
existing backend.

Do not rewrite the backend.

Do not invent data.

Do not contradict the API contract.

Do not expose internal implementation confusion to the user.

When an older document conflicts with the current contract, follow the
source-of-truth hierarchy above and record the discrepancy rather than
guessing.
