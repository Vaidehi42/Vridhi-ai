# Vridhi AI: Technical Requirements (corrected to match the real code)

## Stack
| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + Recharts (to be built) |
| Backend | Python, **FastAPI**, uvicorn (already built: `backend/app.py`) |
| Model | **XGBoost** classifier, loaded from `backend/artifacts/creditlens_model.joblib` |
| Explainability | Occlusion-based reason codes (replace one feature with the reference median, measure change in default risk) |
| Forecast | Seasonal profile + linear trend in log space (`backend/forecast_api.py`, numpy only) |
| Data | Synthetic portfolio, 5,000 businesses (`artifacts/msme_synthetic.csv`), 1,500 scored hold-out rows (`portfolio_scored.csv`) |
| Deploy | Frontend on Vercel, backend on Render |

## Model facts
- 23 model inputs: 13 numeric business features, bureau score, a "no bureau history" flag, and 5 sector flags (Retail, Manufacturing, Services, Agri-processing, Logistics).
- The caller sends 13 raw numbers plus `sector`; the backend computes `dti` and `loan_to_turnover` itself.
- **Gender and region are not model inputs.** They are used only in the fairness audit.
- Headline metrics live in `artifacts/summary.json` (AUC overall 0.798, thin-file 0.824, and so on). Use that file, not any slide.

## Endpoints
See `docs/03_API_CONTRACT.md`. Summary:
`POST /api/predict`, `POST /api/predict/batch`, `GET /api/segmentation`, `GET /api/fairness[?mitigated=true]`, `POST /api/simulate`, `POST /api/forecast`, `GET /api/health`.

## Run the backend
```
cd backend
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                                        # http://localhost:8000/docs
```
Render start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

## Known design notes
- `/api/segmentation` returns two tier fields. `risk_tier` comes from default probability (use this). `tier` is a KMeans cluster name from the notebook and can disagree with `risk_tier` for the same business. Do not colour by `tier`.
- `confidence` is how decisive the probability is, `max(p, 1-p)`. It is not a calibrated confidence; label it "Model decisiveness" or hide it.
- The employee-count slider in the simulator scales UPI inflow. The model has no headcount feature, so present it as "Business scale (approximate)".
