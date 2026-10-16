# Vridhi AI: package for Antigravity

## Folder
```
vridhi-package/
  PROMPT_FOR_ANTIGRAVITY.md    <- paste this into Antigravity
  README_FIRST.md              <- this file (for you, not for the AI)
  backend/   app.py, forecast_api.py, requirements.txt, artifacts/, notebook
  docs/      00_RULES, 01_PRD, 02_TRD, 03_API_CONTRACT, 04_FRONTEND_SPEC
  samples/   predict / simulate / forecast requests, batch CSV, demo businesses,
             real fairness outputs, summary.json
```
Upload the whole folder as one project, then paste the prompt. (I can't check how Antigravity takes files, so if it only accepts a workspace, open the folder as the workspace.)

## Do these 3 things first
1. **Pin xgboost.** In your Kaggle notebook run `import xgboost; print(xgboost.__version__)`, then replace `REPLACE_WITH_YOUR_KAGGLE_VERSION` in `backend/requirements.txt`. The model file will not load on a different major version.
2. **Test the backend once on your laptop** (`pip install -r requirements.txt`, `python app.py`, open `localhost:8000/docs`). I could not run it here because `xgboost` isn't installed in my sandbox, so the `predict`, `simulate` and `batch` response examples show the exact shape but illustrative numbers. If any response differs from `docs/03_API_CONTRACT.md`, fix the contract before the frontend gets built.
3. **Decide the final numbers.** `samples/summary.json` (from your last notebook run) is what the Impact page shows. Update your slide to match it (slide values in brackets): AUC 0.798 (slide said 0.799), thin-file AUC 0.824 (0.827), approval 76.8% (76.4%), good thin-file approved 82.0% (80.6%), disparate impact before 0.93 (slide said 0.94). `sba_real_data_auc` is null because that cell was not run; do not claim 0.96 unless you run it.

## What I changed in your backend (only this)
- Added `backend/forecast_api.py`: `POST /api/forecast`, using the same method as your notebook's Section 3 (seasonal profile + trend, DSCR per month). I tested its logic on simulated history (median error about 4% on a clean series).
- Added two lines in `app.py` to include it. Nothing else in `app.py` changed.
- Left out `helpers.py` (unused).

## Things to know before judges see it
- **Score vs label:** score = 100 x (1 - default probability), so most businesses score 80-100. The UI therefore leads with default probability and colours the gauge by the four tiers. A score of 92 is "Watch", not a bug.
- **Two tier fields in segmentation:** `tier` (KMeans cluster) can contradict `risk_tier` for the same business (M00845: 4.3% default probability, cluster "Stressed"). The spec tells the AI to use `risk_tier`. If a judge asks, the cluster is a behavioural grouping, not a risk label.
- **Fairness result is clean on your data:** no group is more than 15 points from average, region disparate impact 0.93 to 1.0 with region-specific cutoffs. The UI handles both alert and no-alert cases.
- **Employee slider is approximate:** the model has no headcount feature; the UI labels it "Business scale (approximate)".
- **Synthetic data:** every headline number is on synthetic data. The UI says so. Say so in your pitch too.
- **Verify the market statistic** ("80% of 63 million MSMEs rejected") and cite a source before it goes on a slide. The app does not show it.
- Naming: the model file and notebook still say `creditlens`. That is fine; the UI says Vridhi AI.
