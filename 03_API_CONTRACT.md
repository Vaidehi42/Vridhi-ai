# Vridhi AI: API Contract

Base URL: `VITE_API_URL` (local: `http://localhost:8000`). All bodies are JSON unless stated. CORS is open. Interactive docs: `/docs`.

> **How real are the examples?** `fairness` and `forecast` examples below are real outputs/inputs from the project data. For `predict`, `simulate` and `batch`, the **shape** is taken straight from `app.py`; the numbers in responses are illustrative because the model file needs `xgboost` to load. The default probability used (0.0884) is the real value for business M03783 from `portfolio_scored.csv`.

## Units (most common source of bugs)
| Field | Unit in API | Show in UI as |
|---|---|---|
| `gst_on_time_pct`, `customer_concentration` | fraction 0-1 | percent (0.69 -> 69%) |
| `interest_rate` | fraction (0.125) | percent (12.5%) |
| `turnover_growth` | fraction (0.07 = +7%) | percent |
| `*_lakh` fields | Rs lakh | "Rs 16.1 lakh"; use "crore" at 100 lakh and above |
| `business_age` | years | years |
| `utility_delay_days`, `receivable_days` | days | days |
| `bureau_score` | 300-900, or `null` / `0` = no history | "No bureau history" |

## Error shapes
| Status | Body |
|---|---|
| 400 | `{"error": "Missing fields", "fields": ["sector"]}` or `{"error": "These fields must be numbers", "fields": [...]}` or `{"error": "Unknown sector", "allowed": [...]}` |
| 400 (batch) | `{"error": "CSV missing required columns", "missing_columns": [...], "expected_columns": [...]}` or `{"error": "Some rows have blank, non-numeric or zero-turnover values", "rows": [2, 5]}` |
| 413 | `{"error": "File too large (max 5 MB)"}` |
| 503 | `{"error": "Portfolio data not available (run the notebook first)"}` |
| 500 | `{"error": "Prediction failed", "detail": "..."}` |

Allowed `sector` values: `Retail`, `Manufacturing`, `Services`, `Agri-processing`, `Logistics`.

---
## GET /api/health
```json
{"status": "ok", "model_features": 23, "portfolio_rows": 1500}
```
Call on app load. If it fails, show the "API offline" banner.

---
## POST /api/predict
Required: `sector` + 13 numbers: `business_age, annual_turnover_lakh, upi_inflow_monthly_lakh, gst_on_time_pct, upi_volatility, utility_delay_days, receivable_days, customer_concentration, bounced_payments, turnover_growth, existing_debt_lakh, loan_amount_lakh, interest_rate`. Optional: `bureau_score`, `msme_id`.

Request (`samples/predict_request.json`):
```json
{
  "msme_id": "M03783",
  "sector": "Retail",
  "business_age": 6.1,
  "annual_turnover_lakh": 47.6,
  "upi_inflow_monthly_lakh": 1.64,
  "gst_on_time_pct": 0.6916,
  "upi_volatility": 0.3945,
  "utility_delay_days": 9.8058,
  "receivable_days": 47.1663,
  "customer_concentration": 0.2443,
  "bounced_payments": 0,
  "turnover_growth": 0.0712,
  "existing_debt_lakh": 28.2,
  "loan_amount_lakh": 16.1,
  "interest_rate": 0.1232,
  "bureau_score": null
}
```
Response (shape exact, values illustrative):
```json
{
  "msme_id": "M03783",
  "risk_score": 91,
  "risk_label": "MEDIUM",
  "risk_tier": "Watch",
  "default_probability": 0.0884,
  "confidence": 0.91,
  "thin_file": true,
  "reason_codes": [
    {"feature": "gst_on_time_pct", "label": "GST on-time filing rate", "value": "69%",
      "delta_pts": 2.1, "direction": "raises_risk", "shap_value": -2.1},
    {"feature": "upi_volatility", "label": "UPI cash-flow volatility", "value": "0.39",
      "delta_pts": 1.4, "direction": "lowers_risk", "shap_value": 1.4}
  ],
  "loan_recommendation": {
    "eligible": "Conditional",
    "suggested_amount": 12.1,
    "interest_rate_range": "12% - 14%",
    "repayment_period": "36 months",
    "note": "Analytical recommendation. The final lending decision remains with the lender."
  }
}
```
Notes:
- `reason_codes` has up to 5 items, sorted by impact. `shap_value` > 0 means the factor **helps** (green); < 0 means it **hurts** (red). `delta_pts` is the size in **percentage points of default probability**, not score points.
- `loan_recommendation.eligible` is a string: `"Yes"`, `"Conditional"` or `"No"` (not a boolean). `suggested_amount` is in Rs lakh; `0` and `"N/A"` strings appear when `"No"`.
- `risk_tier` is one of `Healthy` (<5%), `Watch` (5-10%), `Stressed` (10-20%), `High risk` (>20%). `risk_label` is `LOW` (Healthy), `MEDIUM` (Watch) or `HIGH` (Stressed, High risk).

---
## POST /api/simulate
Request (`samples/simulate_request.json`): `business_data` is the same object as `/api/predict`.
```json
{
  "business_data": { "...same fields as /api/predict..." },
  "delta": {
    "revenue_change_pct": 20,
    "rate_change_pp": 0,
    "gst_filing": true,
    "employee_change_pct": 0
  }
}
```
`revenue_change_pct`: -50 to +50 (percent). `rate_change_pp`: -3 to +5 (percentage points). `gst_filing`: true lifts GST on-time rate to at least 95%. `employee_change_pct`: -50 to +50 (approximate, scales UPI inflow).

Response:
```json
{
  "original_score": 91, "original_label": "MEDIUM", "original_tier": "Watch",
  "projected_score": 95, "projected_label": "LOW", "projected_tier": "Healthy",
  "score_change": 4, "pd_change": -0.0215,
  "transition": "MEDIUM -> LOW",
  "loan_recommendation": { "eligible": "Yes", "suggested_amount": 16.1, "interest_rate_range": "10% - 12%", "repayment_period": "48 months", "note": "..." }
}
```
`transition` equals the plain label (for example `"MEDIUM"`) when the label did not change. Projected default probability = `default_probability` from predict + `pd_change`.

---
## POST /api/forecast (new)
Request (`samples/forecast_request.json`; history is monthly UPI inflow in Rs lakh, oldest first, 12-24 values):
```json
{
  "monthly_upi_inflow_lakh": [2.1, 2.17, 2.37, 1.99, "... 18 values ..."],
  "start_month": "2024-01",
  "loan_amount_lakh": 15,
  "interest_rate": 0.12
}
```
Optional: `op_margin` (default 0.14), `upi_share` (default 0.65).
Response (real output for that request):
```json
{
  "months": ["Jul 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025"],
  "forecast_lakh": [2.41, 2.54, 2.77, 3.13, 2.99, 2.86],
  "lower_lakh": [2.25, 2.36, 2.58, 2.92, 2.79, 2.66],
  "upper_lakh": [2.59, 2.72, 2.97, 3.36, 3.21, 3.07],
  "monthly_instalment_lakh": 0.4,
  "dscr": [1.3, 1.37, 1.49, 1.69, 1.61, 1.54],
  "high_risk_month": [false, false, false, false, false, false],
  "min_dscr": 1.3,
  "monthly_growth_pct": 0.75,
  "method": "seasonal profile + linear trend (notebook Section 3)"
}
```
DSCR below 1.0 means forecast operating cash does not cover the instalment that month: highlight those months red.

---
## POST /api/predict/batch
`multipart/form-data`, field name `file`, CSV, max 5 MB. Required columns: `sector` + the 13 numbers above. Optional: `msme_id`, `bureau_score`. Sample: `samples/batch_sample.csv`.
```json
{
  "summary": {"total": 12, "low_risk": 7, "medium_risk": 2, "high_risk": 3, "avg_score": 93.4},
  "results": [
    {"row": 1, "msme_id": "M01023", "sector": "Manufacturing", "risk_score": 97, "risk_label": "LOW",
      "risk_tier": "Healthy", "default_probability": 0.0301, "thin_file": true,
      "loan_recommendation": {"eligible": "Yes", "suggested_amount": 9.8, "interest_rate_range": "10% - 12%", "repayment_period": "48 months", "note": "..."}}
  ]
}
```
(The numbers above are illustrative; the field names are exact.)

---
## GET /api/segmentation
Optional query params: `sector`, `region_type` (`Metro` | `Tier-2` | `Rural`), `size_band` (`Micro` | `Small` | `Medium`). Returns 1,500 records:
```json
[{"msme_id": "M00845", "sector": "Agri-processing", "region_type": "Rural", "size_band": "Medium",
  "owner_gender": "Male", "annual_turnover_lakh": 63.3, "loan_amount_lakh": 14.3, "business_age": 7.0,
  "gst_on_time_pct": 0.566, "upi_volatility": 0.334, "bureau_score": null,
  "pd": 0.0429, "risk_score": 96, "risk_label": "LOW", "risk_tier": "Healthy", "tier": "Tier 3 - Stressed"}]
```
**Colour by `risk_tier`, never by `tier`** (see the row above: they disagree). Suggested axes: x = `annual_turnover_lakh` (log scale), y = `pd` (default probability, log scale).

---
## GET /api/fairness and GET /api/fairness?mitigated=true
The model never uses gender or region. The audit approves the safest 75% by predicted risk and compares approval rates per group. `mitigated=true` uses a separate cutoff per region. Bias alert threshold: a group more than 15 points from the portfolio average. Disparate impact = lowest group rate / highest group rate; 0.80 or above passes.

Real output, `mitigated=false` (full file: `samples/fairness_response_before.json`):
```json
{
  "mitigated": false,
  "portfolio_approval_rate": 0.75,
  "bias_detected": false,
  "bias_alerts": [],
  "disparate_impact": {
    "owner_gender": 1.0,
    "region_type": 0.93,
    "size_band": 0.91,
    "sector": 0.84
  },
  "disparate_impact_ok": true,
  "by_region": [
    {
      "region_type": "Metro",
      "n": 452,
      "approval_rate": 0.772,
      "good_borrower_approval": 0.801,
      "default_rate_approved": 0.066
    },
    {
      "region_type": "Rural",
      "n": 462,
      "approval_rate": 0.716,
      "good_borrower_approval": 0.767,
      "default_rate_approved": 0.036
    },
    {
      "region_type": "Tier-2",
      "n": 586,
      "approval_rate": 0.759,
      "good_borrower_approval": 0.808,
      "default_rate_approved": 0.047
    }
  ],
  "by_gender": "[ ...same shape as by_region, key is owner_gender... ]",
  "by_size": "[ ... key size_band ... ]",
  "by_sector": "[ ... key sector ... ]"
}
```
Real output, `mitigated=true` (full file: `samples/fairness_response_mitigated.json`): `portfolio_approval_rate 0.749`, `disparate_impact` {"owner_gender": 1.0, "region_type": 1.0, "size_band": 0.9, "sector": 0.82}, `bias_detected` false.

Each group row also has `good_borrower_approval` and `default_rate_approved`. `bias_alerts` is an array of `{dimension, group, approval_rate, portfolio_avg, deviation}`; it is empty on this data, so the UI needs a "No bias alert" state and should still render the alert banner correctly if the array is not empty.
