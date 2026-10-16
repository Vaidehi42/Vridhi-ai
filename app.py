"""
Vridhi AI: MSME Credit Risk Analytics Platform
FastAPI backend, app.py (fixed version)

Reads the artifacts exported by the notebook (Section 9):
  artifacts/creditlens_model.joblib   -> model, feature list, reference medians
  artifacts/portfolio_scored.csv      -> pre-scored portfolio (segmentation, fairness)
  artifacts/msme_synthetic.csv        -> full synthetic dataset

Run:
  python -m pip install fastapi uvicorn python-multipart pandas numpy scikit-learn xgboost joblib
  python app.py
Then open http://localhost:8000/docs to test every endpoint in the browser.

Endpoints:
  POST /api/predict        single business: score, tier, reason codes, loan suggestion
  POST /api/predict/batch  CSV upload scoring
  GET  /api/segmentation   scored portfolio (scatter plot data)
  GET  /api/fairness       approval rates by gender / region / size / sector
                           (add ?mitigated=true for region-specific cutoffs)
  POST /api/simulate       re-score one business after a what-if change
  POST /api/forecast       6-month cash-flow forecast + DSCR (forecast_api.py)
  GET  /api/health         quick check that the model loaded
"""

import io
import os
import logging
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title="Vridhi AI: MSME Credit Risk Analytics Platform")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # "*" origins cannot be combined with credentials
    allow_methods=["*"],
    allow_headers=["*"],
)

from forecast_api import router as forecast_router   # added: POST /api/forecast
app.include_router(forecast_router)

# ---------------------------------------------------------------------------
# Load notebook artifacts
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent


def configured_path(name: str, default: str) -> str:
    value = Path(os.environ.get(name, default))
    return str(value if value.is_absolute() else BASE_DIR / value)


ARTIFACT_PATH = configured_path("MODEL_PATH", "artifacts/creditlens_model.joblib")
PORTFOLIO_PATH = configured_path("PORTFOLIO_PATH", "artifacts/portfolio_scored.csv")

try:
    artifact = joblib.load(ARTIFACT_PATH)
    model = artifact["model"]
    FEATURES = artifact["features"]        # exact column order the model was trained on
    REF_MEDIAN = artifact["ref_median"]    # reference medians for the "what if typical" reason codes
    print(f"[OK] Model loaded | {len(FEATURES)} features")
except Exception as e:
    raise RuntimeError(
        f"Could not load model from '{ARTIFACT_PATH}'. "
        "Run the notebook first (Section 9 exports artifacts/). Error: " + str(e)
    )

try:
    portfolio_df = pd.read_csv(PORTFOLIO_PATH)
    print(f"[OK] Portfolio loaded | {len(portfolio_df)} rows")
except Exception as e:
    portfolio_df = pd.DataFrame()
    print(f"[WARN] Portfolio CSV not found ({e}). /api/segmentation and /api/fairness will be unavailable.")

# ---------------------------------------------------------------------------
# Constants (must match the notebook)
# ---------------------------------------------------------------------------
SECTORS = ["Retail", "Manufacturing", "Services", "Agri-processing", "Logistics"]

ALT_FEATURES = [
    "gst_on_time_pct", "upi_inflow_monthly_lakh", "upi_volatility",
    "utility_delay_days", "receivable_days", "customer_concentration",
    "bounced_payments", "turnover_growth",
]
NUM_FEATURES = [
    "business_age", "annual_turnover_lakh", "dti", "loan_to_turnover", "interest_rate"
] + ALT_FEATURES

# Fields the caller must send (the two ratios are computed here)
REQUIRED_NUMERIC = [
    "business_age", "annual_turnover_lakh",
    "upi_inflow_monthly_lakh", "gst_on_time_pct", "upi_volatility",
    "utility_delay_days", "receivable_days", "customer_concentration",
    "bounced_payments", "turnover_growth",
    "existing_debt_lakh", "loan_amount_lakh", "interest_rate",
]
REQUIRED_FIELDS = ["sector"] + REQUIRED_NUMERIC

FEATURE_LABELS = {
    "business_age":              "Business age",
    "annual_turnover_lakh":      "Annual turnover",
    "dti":                       "Existing debt vs turnover",
    "loan_to_turnover":          "Loan size vs turnover",
    "interest_rate":             "Interest rate",
    "gst_on_time_pct":           "GST on-time filing rate",
    "upi_inflow_monthly_lakh":   "Monthly UPI inflow",
    "upi_volatility":            "UPI cash-flow volatility",
    "utility_delay_days":        "Utility bill payment delay",
    "receivable_days":           "Customer payment collection time",
    "customer_concentration":    "Dependence on top customers",
    "bounced_payments":          "Bounced payments",
    "turnover_growth":           "Turnover growth",
    "bureau_score":              "Bureau score",
    "bureau_missing":            "No bureau history",
}

FEATURE_FMT = {
    "gst_on_time_pct":         lambda v: f"{v:.0%}",
    "upi_volatility":          lambda v: f"{v:.2f}",
    "utility_delay_days":      lambda v: f"{v:.0f} days",
    "receivable_days":         lambda v: f"{v:.0f} days",
    "customer_concentration":  lambda v: f"{v:.0%}",
    "bounced_payments":        lambda v: f"{v:.0f}",
    "turnover_growth":         lambda v: f"{v:+.0%}",
    "dti":                     lambda v: f"{v:.2f}x",
    "business_age":            lambda v: f"{v:.1f} yrs",
    "loan_to_turnover":        lambda v: f"{v:.2f}x",
    "interest_rate":           lambda v: f"{v:.1%}",
    "annual_turnover_lakh":    lambda v: f"₹{v:.0f} lakh",
    "upi_inflow_monthly_lakh": lambda v: f"₹{v:.1f} lakh",
    "bureau_score":            lambda v: "none" if (isinstance(v, float) and np.isnan(v)) else f"{v:.0f}",
    "bureau_missing":          lambda v: "yes" if v else "no",
}

APPROVE_RATE = 0.75      # fairness audit: safest 75% by predicted risk are approved
BIAS_THRESHOLD = 0.15    # alert if a group's approval rate is >15 points from the average
DI_MIN = 0.80            # "four-fifths" rule for the disparate impact ratio

# ---------------------------------------------------------------------------
# Risk tiers: same four bands as the notebook (Section 7)
#   <5% Healthy | 5-10% Watch | 10-20% Stressed | >20% High risk
# ---------------------------------------------------------------------------


def pd_to_tier(p: float) -> str:
    if p < 0.05:
        return "Healthy"
    if p < 0.10:
        return "Watch"
    if p < 0.20:
        return "Stressed"
    return "High risk"


def pd_to_label(p: float) -> str:
    """Three-level label for the UI, consistent with the four tiers above."""
    tier = pd_to_tier(p)
    return {"Healthy": "LOW", "Watch": "MEDIUM"}.get(tier, "HIGH")


def pd_to_score(p: float) -> int:
    """0-100 display score (higher = safer). It is 100 x (1 - default probability)."""
    return int(round((1.0 - p) * 100))


# ---------------------------------------------------------------------------
# Feature helpers (mirror the notebook)
# ---------------------------------------------------------------------------


def add_derived(d: pd.DataFrame) -> pd.DataFrame:
    """Add dti and loan_to_turnover. Call before build_X."""
    d = d.copy()
    d["dti"] = d["existing_debt_lakh"] / d["annual_turnover_lakh"]
    d["loan_to_turnover"] = d["loan_amount_lakh"] / d["annual_turnover_lakh"]
    return d


def build_X(d: pd.DataFrame) -> pd.DataFrame:
    """Feature matrix in the exact order the model was trained on."""
    X = d[NUM_FEATURES].copy()
    X["bureau_score"] = d["bureau_score"]
    X["bureau_missing"] = d["bureau_score"].isna().astype(int)
    for s in SECTORS:
        X[f"sector_{s}"] = (d["sector"] == s).astype(int)
    return X.astype(float)[FEATURES]


def predict_pd(X_row: pd.DataFrame) -> float:
    return float(model.predict_proba(X_row)[0, 1])


def clean_bureau(value):
    """None, blank or 0 means no bureau history (thin-file)."""
    try:
        v = float(value)
    except (TypeError, ValueError):
        return np.nan
    return np.nan if (np.isnan(v) or v == 0) else v


def validate_business(data: dict):
    """Return an error message, or None if the business record is usable."""
    missing = [f for f in REQUIRED_FIELDS if f not in data]
    if missing:
        return {"error": "Missing fields", "fields": missing}
    bad = []
    for f in REQUIRED_NUMERIC:
        try:
            v = float(data[f])
            if not np.isfinite(v):
                bad.append(f)
        except (TypeError, ValueError):
            bad.append(f)
    if bad:
        return {"error": "These fields must be numbers", "fields": bad}
    if float(data["annual_turnover_lakh"]) <= 0:
        return {"error": "annual_turnover_lakh must be greater than 0"}
    if data["sector"] not in SECTORS:
        return {"error": "Unknown sector", "allowed": SECTORS}
    return None


def row_to_features(data: dict) -> pd.Series:
    """One request body -> one feature row for the model."""
    d = pd.DataFrame([data])
    for f in REQUIRED_NUMERIC:
        d[f] = pd.to_numeric(d[f])
    d = add_derived(d)
    d["bureau_score"] = clean_bureau(data.get("bureau_score"))
    return build_X(d).iloc[0]


def reason_codes(x: pd.Series, top: int = 5) -> list:
    """
    Per-borrower reasons: replace one feature at a time with its reference median
    and see how much the predicted default risk changes (same idea as the notebook).
    """
    x = x.astype(float)
    base_pd = model.predict_proba(x.to_frame().T)[0, 1]

    occ = pd.DataFrame(np.tile(x.values, (len(x), 1)), columns=x.index)
    for i, f in enumerate(x.index):
        if f in REF_MEDIAN.index:
            occ.iloc[i, occ.columns.get_loc(f)] = REF_MEDIAN[f]

    delta = base_pd - model.predict_proba(occ)[:, 1]   # > 0 means this feature raises risk

    codes = []
    for f, dlt in sorted(zip(x.index, delta), key=lambda z: -abs(z[1])):
        if f.startswith("sector_") or f not in FEATURE_LABELS or f == "bureau_missing":
            continue
        if f == "bureau_score" and np.isnan(x[f]):
            continue
        fmt = FEATURE_FMT.get(f, lambda v: str(round(float(v), 2)))
        dlt_val = float(dlt)
        codes.append({
            "feature":   str(f),
            "label":     str(FEATURE_LABELS[f]),
            "value":     str(fmt(float(x[f])) if pd.notna(x[f]) else "none"),
            "delta_pts": float(round(abs(dlt_val) * 100, 1)),
            "direction": "raises_risk" if dlt_val > 0 else "lowers_risk",
            # positive = helps (lowers risk), negative = hurts (raises risk)
            "shap_value": float(round(-dlt_val * 100, 1)),
        })
        if len(codes) == top:
            break
    return codes


def loan_recommendation(p: float, loan_amount_lakh: float) -> dict:
    """
    Illustrative rule based on the risk tier (not a model output).
    Rates and tenures are placeholders for the demo.
    """
    note = "Analytical recommendation. The final lending decision remains with the lender."
    tier = pd_to_tier(p)
    if tier == "Healthy":
        return {"eligible": "Yes", "suggested_amount": round(float(loan_amount_lakh), 1),
                "interest_rate_range": "10% - 12%", "repayment_period": "48 months", "note": note}
    if tier == "Watch":
        return {"eligible": "Conditional", "suggested_amount": round(float(loan_amount_lakh) * 0.75, 1),
                "interest_rate_range": "12% - 14%", "repayment_period": "36 months", "note": note}
    if tier == "Stressed":
        return {"eligible": "Conditional", "suggested_amount": round(float(loan_amount_lakh) * 0.50, 1),
                "interest_rate_range": "14% - 16%", "repayment_period": "24 months", "note": note}
    return {"eligible": "No", "suggested_amount": 0, "interest_rate_range": "N/A",
            "repayment_period": "N/A",
            "note": "High risk profile. Manual review recommended."}


def apply_scenario(d: pd.DataFrame, rate_pp: float = 0.0, demand_pct: float = 0.0,
                   sector: str = None, sector_pct: float = 0.0) -> pd.DataFrame:
    """Macro stress scenario. Exact copy of the notebook's apply_scenario()."""
    d = d.copy()
    s = np.full(len(d), demand_pct / 100.0)
    if sector:
        s = s + np.where(d["sector"] == sector, sector_pct / 100.0, 0.0)
    neg = -np.minimum(s, 0.0)

    d["interest_rate"] = d["interest_rate"] + rate_pp / 100.0
    d["annual_turnover_lakh"] = d["annual_turnover_lakh"] * (1 + s)
    d["upi_inflow_monthly_lakh"] = d["upi_inflow_monthly_lakh"] * (1 + s)
    d["turnover_growth"] = d["turnover_growth"] + s
    d["receivable_days"] = d["receivable_days"] * (1 + 0.8 * neg)
    d["gst_on_time_pct"] = np.clip(d["gst_on_time_pct"] - 0.3 * neg, 0.2, 1.0)
    d["utility_delay_days"] = d["utility_delay_days"] * (1 + 1.5 * neg)
    d["upi_volatility"] = d["upi_volatility"] * (1 + np.abs(s))
    return add_derived(d)


def apply_what_if(d: pd.DataFrame, rate_pp: float, revenue_pct: float) -> pd.DataFrame:
    """
    Single-business what-if.
    A revenue DROP uses the notebook's stress logic.
    A revenue RISE only scales turnover, UPI inflow and growth. The stress function
    would also raise UPI volatility, which would wrongly worsen the score.
    """
    if revenue_pct < 0:
        return apply_scenario(d, rate_pp=rate_pp, demand_pct=revenue_pct)
    d = d.copy()
    s = revenue_pct / 100.0
    d["interest_rate"] = d["interest_rate"] + rate_pp / 100.0
    d["annual_turnover_lakh"] = d["annual_turnover_lakh"] * (1 + s)
    d["upi_inflow_monthly_lakh"] = d["upi_inflow_monthly_lakh"] * (1 + s)
    d["turnover_growth"] = d["turnover_growth"] + s
    return add_derived(d)


# ---------------------------------------------------------------------------
# POST /api/predict
# ---------------------------------------------------------------------------
@app.post("/api/predict")
async def predict(request: Request):
    """
    Single-business risk assessment.

    Body (JSON): sector, business_age, annual_turnover_lakh, upi_inflow_monthly_lakh,
    gst_on_time_pct (0-1), upi_volatility, utility_delay_days, receivable_days,
    customer_concentration (0-1), bounced_payments, turnover_growth,
    existing_debt_lakh, loan_amount_lakh, interest_rate (e.g. 0.125),
    bureau_score (optional; null or 0 = no bureau history), msme_id (optional).
    """
    try:
        data = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Body must be valid JSON"})
    if not data:
        return JSONResponse(status_code=400, content={"error": "Empty request body"})

    problem = validate_business(data)
    if problem:
        return JSONResponse(status_code=400, content=problem)

    try:
        x = row_to_features(data)
        p = float(predict_pd(x.to_frame().T))
        return JSONResponse(content={
            "msme_id":             str(data.get("msme_id", "")),
            "risk_score":          int(pd_to_score(p)),
            "risk_label":          str(pd_to_label(p)),
            "risk_tier":           str(pd_to_tier(p)),
            "default_probability": float(round(p, 4)),
            # How decisive the predicted probability is. Not a calibrated model confidence.
            "confidence":          float(round(max(p, 1.0 - p), 2)),
            "thin_file":           bool(np.isnan(x["bureau_score"])),
            "reason_codes":        reason_codes(x),
            "loan_recommendation": loan_recommendation(p, float(data["loan_amount_lakh"])),
        })
    except Exception as e:
        logging.exception("Prediction error")
        return JSONResponse(status_code=500, content={"error": "Prediction failed", "detail": str(e)})


# ---------------------------------------------------------------------------
# POST /api/predict/batch
# ---------------------------------------------------------------------------
@app.post("/api/predict/batch")
async def predict_batch(file: UploadFile = File(...)):
    """CSV batch scoring (multipart/form-data, field name 'file', max 5 MB)."""
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        return JSONResponse(status_code=413, content={"error": "File too large (max 5 MB)"})

    try:
        raw = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "Could not parse CSV", "detail": str(e)})

    missing_cols = [c for c in REQUIRED_FIELDS if c not in raw.columns]
    if missing_cols:
        return JSONResponse(status_code=400, content={
            "error": "CSV missing required columns",
            "missing_columns": missing_cols,
            "expected_columns": REQUIRED_FIELDS,
        })

    try:
        for c in REQUIRED_NUMERIC:
            raw[c] = pd.to_numeric(raw[c], errors="coerce")
        bad_rows = raw[REQUIRED_NUMERIC].isna().any(axis=1) | (raw["annual_turnover_lakh"] <= 0)
        if bad_rows.any():
            return JSONResponse(status_code=400, content={
                "error": "Some rows have blank, non-numeric or zero-turnover values",
                "rows": [int(i) + 2 for i in raw.index[bad_rows][:20]],   # +2 = spreadsheet row number
            })

        raw = add_derived(raw)
        if "bureau_score" not in raw.columns:
            raw["bureau_score"] = np.nan
        else:
            raw["bureau_score"] = pd.to_numeric(raw["bureau_score"], errors="coerce")
            raw.loc[raw["bureau_score"] == 0, "bureau_score"] = np.nan

        pds = model.predict_proba(build_X(raw))[:, 1]

        results = []
        for i, (rec_in, p) in enumerate(zip(raw.to_dict("records"), pds)):
            p = float(p)
            results.append({
                "row":                 i + 1,
                "msme_id":             str(rec_in.get("msme_id", f"ROW_{i + 1}")),
                "sector":              str(rec_in.get("sector", "")),
                "risk_score":          pd_to_score(p),
                "risk_label":          pd_to_label(p),
                "risk_tier":           pd_to_tier(p),
                "default_probability": round(p, 4),
                "thin_file":           bool(pd.isna(rec_in.get("bureau_score"))),
                "loan_recommendation": loan_recommendation(p, float(rec_in["loan_amount_lakh"])),
            })

        labels = pd.Series([r["risk_label"] for r in results])
        counts = labels.value_counts().to_dict()
        summary = {
            "total":       len(results),
            "low_risk":    int(counts.get("LOW", 0)),
            "medium_risk": int(counts.get("MEDIUM", 0)),
            "high_risk":   int(counts.get("HIGH", 0)),
            "avg_score":   round(float(np.mean([r["risk_score"] for r in results])), 1),
        }
        return JSONResponse(content={"summary": summary, "results": results})

    except Exception as e:
        logging.exception("Batch prediction error")
        return JSONResponse(status_code=500, content={"error": "Batch prediction failed", "detail": str(e)})


# ---------------------------------------------------------------------------
# GET /api/segmentation
# ---------------------------------------------------------------------------
@app.get("/api/segmentation")
async def segmentation(request: Request):
    """Scored businesses for the scatter plot. Optional filters: sector, region_type, size_band."""
    if portfolio_df.empty or "pd" not in portfolio_df.columns:
        return JSONResponse(status_code=503, content={"error": "Portfolio data not available (run the notebook first)"})

    df = portfolio_df.copy()
    for param in ["sector", "region_type", "size_band"]:
        val = request.query_params.get(param)
        if val and param in df.columns:
            df = df[df[param] == val]

    df["risk_score"] = ((1 - df["pd"]) * 100).round(0).astype(int)
    df["risk_label"] = df["pd"].apply(pd_to_label)
    df["risk_tier"] = df["pd"].apply(pd_to_tier)

    keep_cols = [
        "msme_id", "sector", "region_type", "size_band", "owner_gender",
        "annual_turnover_lakh", "loan_amount_lakh", "business_age",
        "gst_on_time_pct", "upi_volatility", "bureau_score",
        "pd", "risk_score", "risk_label", "risk_tier", "tier",
    ]
    keep_cols = [c for c in keep_cols if c in df.columns]
    out = df[keep_cols].astype(object).where(df[keep_cols].notna(), None)
    return JSONResponse(content=out.to_dict(orient="records"))


# ---------------------------------------------------------------------------
# GET /api/fairness
# ---------------------------------------------------------------------------
def group_stats(df: pd.DataFrame, col: str) -> list:
    if col not in df.columns:
        return []
    rows = []
    for name, g in df.groupby(col):
        row = {col: name, "n": int(len(g)), "approval_rate": round(float(g["approved"].mean()), 3)}
        if "default" in g.columns:
            good = g.loc[g["default"] == 0, "approved"]
            appr = g.loc[g["approved"] == 1, "default"]
            row["good_borrower_approval"] = round(float(good.mean()), 3) if len(good) else None
            row["default_rate_approved"] = round(float(appr.mean()), 3) if len(appr) else None
        rows.append(row)
    return rows


@app.get("/api/fairness")
async def fairness(request: Request):
    """
    Approval rates by gender, region, business size and sector.
    Uses one common cutoff (safest 75% approved). With ?mitigated=true the cutoff is
    set separately in each region, which is the notebook's fix for the region gap.
    The model itself never uses gender or region.
    """
    if portfolio_df.empty or "pd" not in portfolio_df.columns:
        return JSONResponse(status_code=503, content={"error": "Portfolio data not available (run the notebook first)"})

    df = portfolio_df.copy()
    mitigated = request.query_params.get("mitigated", "false").lower() == "true"

    if mitigated and "region_type" in df.columns:
        cutoff = df.groupby("region_type")["pd"].transform(lambda s: s.quantile(APPROVE_RATE))
    else:
        cutoff = df["pd"].quantile(APPROVE_RATE)
    df["approved"] = (df["pd"] <= cutoff).astype(int)

    dims = {
        "owner_gender": group_stats(df, "owner_gender"),
        "region_type":  group_stats(df, "region_type"),
        "size_band":    group_stats(df, "size_band"),
        "sector":       group_stats(df, "sector"),
    }
    avg_approval = float(df["approved"].mean())

    bias_alerts, disparate_impact = [], {}
    for col, stats in dims.items():
        rates = [r["approval_rate"] for r in stats]
        if rates and max(rates) > 0:
            disparate_impact[col] = round(min(rates) / max(rates), 2)
        for row in stats:
            dev = abs(row["approval_rate"] - avg_approval)
            if dev > BIAS_THRESHOLD:
                bias_alerts.append({
                    "dimension": col, "group": row[col],
                    "approval_rate": row["approval_rate"],
                    "portfolio_avg": round(avg_approval, 3),
                    "deviation": round(dev, 3),
                })

    return JSONResponse(content={
        "mitigated":               mitigated,
        "portfolio_approval_rate": round(avg_approval, 3),
        "bias_detected":           len(bias_alerts) > 0,
        "bias_alerts":             bias_alerts,
        "disparate_impact":        disparate_impact,          # min group rate / max group rate
        "disparate_impact_ok":     all(v >= DI_MIN for v in disparate_impact.values()),
        "by_gender":               dims["owner_gender"],
        "by_region":               dims["region_type"],
        "by_size":                 dims["size_band"],
        "by_sector":               dims["sector"],
    })


# ---------------------------------------------------------------------------
# POST /api/simulate
# ---------------------------------------------------------------------------
@app.post("/api/simulate")
async def simulate(request: Request):
    """
    What-if for one business.

    Body: { "business_data": { ...same fields as /api/predict... },
            "delta": { "revenue_change_pct": 20,   // turnover and UPI inflow change
                       "rate_change_pp": 0,        // interest rate change in points
                       "gst_filing": true,         // raise GST on-time rate to at least 95%
                       "employee_change_pct": 0 }} // extra scaling of UPI inflow (approximation)
    """
    try:
        data = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Body must be valid JSON"})
    if not data or "business_data" not in data:
        return JSONResponse(status_code=400, content={"error": "Request must include 'business_data' and 'delta'"})

    bd = data["business_data"]
    delta = data.get("delta", {}) or {}

    problem = validate_business(bd)
    if problem:
        return JSONResponse(status_code=400, content=problem)

    try:
        p_orig = predict_pd(row_to_features(bd).to_frame().T)

        d = pd.DataFrame([bd])
        for f in REQUIRED_NUMERIC:
            d[f] = pd.to_numeric(d[f])
        d["bureau_score"] = clean_bureau(bd.get("bureau_score"))

        revenue_pct = float(delta.get("revenue_change_pct", 0))
        rate_pp = float(delta.get("rate_change_pp", 0))
        emp_pct = float(delta.get("employee_change_pct", 0))

        d_new = apply_what_if(d, rate_pp=rate_pp, revenue_pct=revenue_pct)

        if delta.get("gst_filing") is True:
            d_new["gst_on_time_pct"] = np.maximum(d_new["gst_on_time_pct"], 0.95)
        if emp_pct != 0:
            d_new["upi_inflow_monthly_lakh"] = d_new["upi_inflow_monthly_lakh"] * (1 + emp_pct / 100)

        p_new = float(model.predict_proba(build_X(d_new))[0, 1])
        label_orig, label_new = pd_to_label(p_orig), pd_to_label(p_new)

        return JSONResponse(content={
            "original_score":      pd_to_score(p_orig),
            "original_label":      label_orig,
            "original_tier":       pd_to_tier(p_orig),
            "projected_score":     pd_to_score(p_new),
            "projected_label":     label_new,
            "projected_tier":      pd_to_tier(p_new),
            "score_change":        pd_to_score(p_new) - pd_to_score(p_orig),
            "pd_change":           round(p_new - p_orig, 4),
            "transition":          f"{label_orig} -> {label_new}" if label_orig != label_new else label_orig,
            "loan_recommendation": loan_recommendation(p_new, float(bd["loan_amount_lakh"])),
        })

    except Exception as e:
        logging.exception("Simulate error")
        return JSONResponse(status_code=500, content={"error": "Simulation failed", "detail": str(e)})


# ---------------------------------------------------------------------------
# GET /api/health
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health():
    return JSONResponse(content={
        "status":         "ok",
        "model_features": len(FEATURES),
        "portfolio_rows": len(portfolio_df),
    })


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"\nVridhi AI backend running on http://localhost:{port}  (docs at /docs)\n")
    uvicorn.run(app, host="0.0.0.0", port=port)
