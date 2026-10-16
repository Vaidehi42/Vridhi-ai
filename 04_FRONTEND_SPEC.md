# Vridhi AI: Frontend Specification

Stack: React + Vite + Tailwind CSS + Recharts. Plain JavaScript is fine. One `src/api.js` for all calls. Read `docs/00_RULES.md` and `docs/03_API_CONTRACT.md` first.

## Look and feel
Clean fintech dashboard. Light background, deep teal or navy as the brand colour, generous spacing, rounded cards with soft shadows. Display numbers large. Keep copy plain and short.

Risk colours (use everywhere, including charts and badges):
| `risk_tier` | Colour | `risk_label` |
|---|---|---|
| Healthy | green `#16A34A` | LOW |
| Watch | amber `#F59E0B` | MEDIUM |
| Stressed | orange `#EA580C` | HIGH |
| High risk | red `#DC2626` | HIGH |

Always pair colour with text (badge says the tier name), so the UI is readable without colour.

## Navigation (top bar, collapses to a menu on mobile)
1. **Assess** (default) 2. **Portfolio** 3. **Fairness** 4. **Batch** 5. **Impact**
Logo text "Vridhi AI" with the tagline "From credit-invisible to credit-worthy". An "API online / offline" dot driven by `GET /api/health`.

## Screen 1: Assess (most important, build first)
Two-column on desktop (form left, results right), stacked on mobile.

**Demo presets** (chips above the form): load `samples/demo_businesses.json` (copy to `src/data/`). Chips: "Healthy, no bureau history", "Watch, no bureau history", "Stressed", "High risk". Clicking fills the form; the user then presses Assess.

**Form**, grouped in three sections. Labels in plain language; show units; validate before sending.
| Section | Label | API field | Input | Range |
|---|---|---|---|---|
| Business | Sector | `sector` | dropdown (5 values) | |
| Business | Business age (years) | `business_age` | number | 0.5 to 50 |
| Business | Annual turnover (Rs lakh) | `annual_turnover_lakh` | number | above 0 |
| Cash flow | Monthly UPI inflow (Rs lakh) | `upi_inflow_monthly_lakh` | number | above 0 |
| Cash flow | UPI volatility (0 steady, 1 erratic) | `upi_volatility` | slider | 0 to 1 |
| Cash flow | Average collection time (days) | `receivable_days` | number | 0 to 180 |
| Compliance | GST filed on time (%) | `gst_on_time_pct` | slider, send /100 | 0 to 100 |
| Compliance | Utility bill delay (days) | `utility_delay_days` | number | 0 to 60 |
| Compliance | Bounced payments (last year) | `bounced_payments` | integer | 0 to 20 |
| Risk | Share of sales from top customers (%) | `customer_concentration` | slider, send /100 | 0 to 100 |
| Risk | Turnover growth (% per year) | `turnover_growth` | number, send /100 | -60 to 100 |
| Loan | Existing debt (Rs lakh) | `existing_debt_lakh` | number | 0 or more |
| Loan | Loan requested (Rs lakh) | `loan_amount_lakh` | number | above 0 |
| Loan | Interest rate (% per year) | `interest_rate` | number, send /100 | 5 to 30 |
| Bureau | Bureau score (optional) | `bureau_score` | number 300-900 or a "No bureau history" toggle | send `null` when off |

Optional `msme_id` text field ("Business ID / name") is sent through and shown in the result header.

**Results panel** (after `POST /api/predict`):
1. **Score card:** semicircle gauge 0-100 showing `risk_score`, with colour zones at under 80 (red), 80-90 (orange), 90-95 (amber), 95 and above (green) so the zones match the four tiers. Next to it, largest text: **default probability** as a percent (`default_probability` x 100, one decimal), then the tier badge (`risk_tier` and `risk_label`). A "No bureau history" badge when `thin_file` is true, with a one-line tooltip: "Traditional lenders would decline this business by default. Vridhi AI scores it on alternative data."
2. **Why this score:** horizontal bar chart of `reason_codes` by `shap_value` (green right = helps, red left = hurts), each row labelled with `label` and `value`. Below it one sentence per item: "{label} ({value}) {raises | lowers} default risk by {delta_pts} percentage points."
3. **Loan recommendation card:** `eligible` as a coloured pill (Yes green, Conditional amber, No red), suggested amount, rate range, tenure, and the `note` in small text.
4. **What-if simulator** (card below results, appears after a score exists). Sliders: revenue change -50 to +50 %, interest rate change -3 to +5 points, business scale (approximate) -50 to +50 %, and a GST compliance toggle ("Raise on-time filing to 95%"). Debounce 300 ms, call `POST /api/simulate`, show original vs projected score side by side with the change and the `transition` ("MEDIUM to LOW") and the updated loan card. Include a Reset button. Footnote: "Illustrative what-if based on the same model."
5. **Cash-flow forecast** (card below the simulator). Inputs: a small table or paste box for 12-24 monthly UPI inflow values (Rs lakh), and the start month. A "Use sample history" button fills in `samples/forecast_request.json`. Loan amount and interest rate come from the form. On submit call `POST /api/forecast`. Chart: line for `forecast_lakh` with a shaded band between `lower_lakh` and `upper_lakh`, and a second small chart or row of chips for `dscr` per month. Months with `high_risk_month` true are red with the label "May not cover instalment". Show `min_dscr` and `monthly_growth_pct` as two stat tiles.

## Screen 2: Portfolio (segmentation)
`GET /api/segmentation` with optional filters (dropdowns for sector, region type, size band; re-fetch on change). Top row of KPI tiles computed from the response: businesses shown, share per `risk_tier`, average default probability. Scatter plot: x = `annual_turnover_lakh` (log), y = `pd` (log, label "Default probability"), dot colour by `risk_tier`, tooltip with id, sector, region, size, score, tier. Legend with tier colours. Below, a short sortable table of the 20 highest-risk businesses.

## Screen 3: Fairness
Toggle "Standard cutoff" / "Region-adjusted cutoff" (calls `GET /api/fairness?mitigated=true` when on). Show: portfolio approval rate, a disparate-impact tile per dimension (green when 0.80 or above, red below), a grouped bar chart of `approval_rate` for gender, region, size and sector (four small charts in a grid), and a table with `n`, `approval_rate`, `good_borrower_approval`, `default_rate_approved`. If `bias_detected` is true show a red banner listing `bias_alerts`; otherwise a green "No group deviates more than 15 points from the average" banner. A fixed note: "The model never uses gender or region as inputs. They are used only here, to audit outcomes." Also "Synthetic demo data".

## Screen 4: Batch
Drag-and-drop zone for a CSV (reject above 5 MB before upload), a "Download sample CSV" link (`samples/batch_sample.csv`), and a list of required columns. After `POST /api/predict/batch` show: summary tiles (total, LOW, MEDIUM, HIGH, average score), a donut chart of the label split, and a results table (id, sector, score, default probability, tier badge, thin-file badge, loan eligibility, suggested amount) with search and sort. "Download results (CSV)" builds a CSV from the response in the browser. Show backend errors verbatim, including the list of missing columns or bad row numbers.

## Screen 5: Impact
Reads `src/data/summary.json` (copy of `samples/summary.json`), no API call. Show, with the note "Results on a synthetic portfolio of 5,000 MSMEs":
- Headline: bureau-only lending approves `trad_approval_rate`% of applicants; Vridhi AI approves `creditlens_approval_rate`% with `bad_rate_among_approved_pct`% bad loans among approved.
- Thin-file proof: good thin-file businesses approved, `good_thin_file_approved_trad_pct`% vs `good_thin_file_approved_creditlens_pct`%. Share of portfolio with no bureau history: `thin_file_share_pct`%.
- AUC comparison bars: overall and thin-file, traditional vs Vridhi AI.
- Forecast error: `forecast_MAPE_pct`% vs seasonal-naive baseline `seasonal_naive_MAPE_pct`%.
- Fairness: disparate impact `disparate_impact_before` to `disparate_impact_after`.
- Stress test: default rate under severe stress `severe_stress_default_rate_pct`% (base `default_rate_pct`%).
Ignore `sba_real_data_auc` when it is `null` (do not render a tile for it).
In the UI call the model "Vridhi AI" (the JSON keys say `creditlens`).

## Component structure
```
src/
  api.js                 all fetch calls, reads VITE_API_URL
  data/summary.json  data/demo_businesses.json
  components/  Navbar  ApiStatus  ScoreGauge  TierBadge  ReasonChart  LoanCard
               SimulatorPanel  ForecastPanel  FairnessCharts  RiskScatter  BatchDropzone  ResultsTable
  pages/  Assess  Portfolio  Fairness  Batch  Impact
```

## Acceptance checks
1. Load the "Watch, no bureau history" preset, press Assess: a score of about 91 and default probability of about 8.8% appear (value depends on the model).
2. Moving the revenue slider updates the projected score within about half a second and shows the label transition when it changes.
3. Fairness page renders with `bias_alerts: []` and the green banner; toggling the adjusted cutoff changes the region disparate impact from 0.93 to 1.0.
4. Uploading `batch_sample.csv` shows 12 rows and the summary tiles.
5. Stopping the backend shows the offline banner, not a blank page.
6. No visible text says "CreditLens", and no input or factor is named gender or region on the Assess screen.
