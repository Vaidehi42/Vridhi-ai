# Rules for the AI agent (read before doing anything)

Project: **Vridhi AI** (earlier name: CreditLens), MSME credit risk platform for HackConquest 2026, Problem Statement 12.

## Scope
1. Build the **frontend only**, in a new folder `frontend/`. React + Vite + Tailwind CSS + Recharts.
2. **Do not modify** anything in `backend/`: `app.py`, `forecast_api.py`, `artifacts/`, the notebook. If you think the backend needs a change, write the suggestion in `NOTES_FOR_TEAM.md` and carry on.
3. The backend is FastAPI on port 8000. Read its address from `import.meta.env.VITE_API_URL` (default `http://localhost:8000`). Never hardcode a URL in components. Put all API calls in one file: `frontend/src/api.js`.
4. `docs/03_API_CONTRACT.md` is the source of truth for request and response shapes. If it conflicts with any older document, the contract wins.

## No invented data
5. Every number on screen comes from an API response or from `samples/summary.json` (copy it to `frontend/src/data/summary.json`). Do not invent statistics, testimonials, company names or mock results.
6. Label the data honestly: the portfolio, fairness and headline metrics come from a **synthetic** portfolio of 5,000 MSMEs. Show a small "Synthetic demo data" note on those screens.
7. Keep every unit as the backend uses it (see the field table in `docs/04_FRONTEND_SPEC.md`). Fractions in the API (0.72) are shown as percent (72%) in the UI, and converted back before sending.

## Product truths you must not contradict
8. The model **does not use gender or region**. They appear only in the fairness audit. Never show them as input fields or as scoring factors.
9. Use the backend's `risk_label`, `risk_tier` and `default_probability`. Never recompute labels from the score on the frontend.
10. Loan output is an **analytical recommendation**; always show its `note` text. The lender makes the final decision.
11. Write "Vridhi AI" in all visible text. Do not use "CreditLens" in the UI. Keep the file names `creditlens_model.joblib` unchanged.

## Quality bar
12. Must work on mobile width (360px) and desktop. Chrome, Edge, Firefox.
13. Every screen needs a loading state, an empty state and an error state that shows the backend's `error` message.
14. If the backend is unreachable, show an "API offline" banner with the URL it tried.
15. Finish a working vertical slice first (Assess screen end to end), then add screens in the order given in the prompt.
