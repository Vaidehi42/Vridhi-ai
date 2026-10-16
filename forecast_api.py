"""
Vridhi AI: cash-flow forecast endpoint (additive module, does not touch the model).

POST /api/forecast
Mirrors the notebook's Section 3 method: log-revenue = linear trend + festive-season profile,
then a forecast debt-service coverage ratio (DSCR) per month.
Needs only numpy, so it runs without the model.
"""
import numpy as np
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()

# Same seasonal profile as the notebook (Jan..Dec, Oct-Nov festive peak)
SEASON = np.array([0.92, 0.90, 1.02, 1.00, 0.98, 0.95, 0.93, 0.97, 1.05, 1.18, 1.12, 1.06])
HORIZON = 6
MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def compute_forecast(history, start_month, loan_amount_lakh, interest_rate,
                     op_margin=0.14, upi_share=0.65):
    y = np.asarray(history, dtype=float)
    n = len(y)
    year, month = (int(p) for p in start_month.split("-"))
    m0 = month - 1                                   # 0-based calendar month of history[0]
    mo_hist = (m0 + np.arange(n)) % 12
    mo_fc = (m0 + n + np.arange(HORIZON)) % 12

    # de-seasonalise, fit a straight line in log space
    logy = np.log(y) - np.log(SEASON[mo_hist])
    t = np.arange(n, dtype=float)
    b, a = np.polyfit(t, logy, 1)
    resid_sd = float(np.std(logy - (a + b * t)))

    tf = np.arange(n, n + HORIZON, dtype=float)
    base = a + b * tf + np.log(SEASON[mo_fc])
    fc = np.exp(base)
    lo = np.exp(base - 1.28 * resid_sd)              # ~80% band
    hi = np.exp(base + 1.28 * resid_sd)

    emi = loan_amount_lakh * (1 + interest_rate * 5) / 60          # notebook: 60-month loan
    dscr = (fc / upi_share) * op_margin / emi

    labels = []
    for i in range(HORIZON):
        idx = m0 + n + i
        labels.append(f"{MONTH_NAMES[idx % 12]} {year + idx // 12}")

    return {
        "months": labels,
        "forecast_lakh": [round(float(v), 2) for v in fc],
        "lower_lakh": [round(float(v), 2) for v in lo],
        "upper_lakh": [round(float(v), 2) for v in hi],
        "monthly_instalment_lakh": round(float(emi), 2),
        "dscr": [round(float(v), 2) for v in dscr],
        "high_risk_month": [bool(v < 1.0) for v in dscr],
        "min_dscr": round(float(dscr.min()), 2),
        "monthly_growth_pct": round((float(np.exp(b)) - 1) * 100, 2),
        "method": "seasonal profile + linear trend (notebook Section 3)",
    }


@router.post("/api/forecast")
async def forecast(request: Request):
    """
    Body: { "monthly_upi_inflow_lakh": [12-24 numbers, oldest first],
            "start_month": "2024-01",          // month of the first number, YYYY-MM
            "loan_amount_lakh": 15, "interest_rate": 0.12,
            "op_margin": 0.14 (optional), "upi_share": 0.65 (optional) }
    """
    try:
        d = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Body must be valid JSON"})
    try:
        hist = [float(v) for v in d["monthly_upi_inflow_lakh"]]
        start = str(d["start_month"])
        loan = float(d["loan_amount_lakh"])
        rate = float(d["interest_rate"])
        op_margin = float(d.get("op_margin", 0.14))
        upi_share = float(d.get("upi_share", 0.65))
        year, month = (int(p) for p in start.split("-"))
        assert 1 <= month <= 12
    except Exception:
        return JSONResponse(status_code=400, content={
            "error": "Need monthly_upi_inflow_lakh (list), start_month (YYYY-MM), loan_amount_lakh, interest_rate"})
    if not (12 <= len(hist) <= 24) or min(hist) <= 0:
        return JSONResponse(status_code=400, content={
            "error": "monthly_upi_inflow_lakh needs 12 to 24 positive numbers"})
    if loan <= 0 or upi_share <= 0 or op_margin <= 0:
        return JSONResponse(status_code=400, content={"error": "loan, op_margin and upi_share must be > 0"})
    return compute_forecast(hist, start, loan, rate, op_margin, upi_share)
