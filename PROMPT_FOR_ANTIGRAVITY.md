# First prompt for Antigravity (paste this as-is)

You are building the frontend for **Vridhi AI**, an explainable credit-risk dashboard for Indian MSMEs (HackConquest 2026, PS 12).

The project folder already contains a working backend and all the specs. Before writing any code, read these files in order:
1. `docs/00_RULES.md`
2. `docs/03_API_CONTRACT.md`
3. `docs/04_FRONTEND_SPEC.md`
4. `docs/01_PRD.md` and `docs/02_TRD.md` for context
5. The files in `samples/`

Non-negotiable:
- Create a new `frontend/` folder (React + Vite + Tailwind + Recharts). **Do not edit anything in `backend/`.**
- The API address comes from `VITE_API_URL` (default `http://localhost:8000`). Create `frontend/.env.example`.
- Use only numbers from the API or `samples/summary.json`. No invented data.
- Follow the field names, units and response shapes in the API contract exactly.

Build order, and stop to tell me what works after each step:
1. Scaffold, Navbar, API status check, `src/api.js`.
2. **Assess screen end to end**: form, presets, score gauge, default probability, tier badge, reason-code chart, loan card.
3. What-if simulator and cash-flow forecast panels on the Assess screen.
4. Fairness screen.
5. Portfolio screen (scatter plot and filters).
6. Batch screen.
7. Impact screen.
8. Polish: mobile layout, loading / empty / error states, and a short `frontend/README.md` with run commands.

To run the backend for testing: `cd backend`, install `requirements.txt`, then `python app.py` (serves on port 8000). If the backend cannot start, build against the example responses in `docs/03_API_CONTRACT.md` and the files in `samples/`, and tell me.

Put any backend change you think is needed in `NOTES_FOR_TEAM.md` instead of making it. Finish each step completely before starting the next.
