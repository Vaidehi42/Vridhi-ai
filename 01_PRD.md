# Vridhi AI: Product Requirements (corrected)

**Tagline:** From credit-invisible to credit-worthy, one prediction at a time.
**Event:** HackConquest 2026 (TCET Mumbai), PS 12: Predictive Credit Risk Analytics for MSMEs.

## Problem
Lenders rely on bureau scores. Many small businesses have no bureau history ("thin-file") and are declined even when they are healthy. Vridhi AI scores them with alternative data: GST filing behaviour, UPI cash flow, utility payments, invoice collection and customer concentration. Every score comes with plain-language reasons, a fairness audit and a what-if simulator.

> Market statistics (for example the share of MSMEs denied formal credit) must be verified and sourced by the team before they go on a slide. The app does not show any market statistic.

## Users
| User | Need |
|---|---|
| Bank officer | Quick, explainable score for one applicant |
| NBFC analyst | Batch scoring and portfolio view |
| MSME owner | Understand the decision and what would improve it |
| Regulator / judge | Fairness and bias evidence |

## Features (what the app does, tied to real endpoints)
| ID | Feature | Endpoint |
|---|---|---|
| F1 | Business input form (single entry) with demo presets | `POST /api/predict` |
| F2 | Risk score: 0-100 score, default probability, 3-level label, 4-level tier, thin-file badge | `POST /api/predict` |
| F3 | Explainability: top 5 reason codes, green = helps, red = hurts | `POST /api/predict` |
| F4 | Cash-flow forecast: next 6 months, forecast DSCR, months below 1.0 flagged | `POST /api/forecast` |
| F5 | Portfolio segmentation scatter, filter by sector, region type, size band | `GET /api/segmentation` |
| F6 | Fairness audit by gender, region, size, sector; before / after mitigation toggle | `GET /api/fairness` |
| F7 | Scenario simulator: revenue change, interest-rate change, GST compliance, business scale | `POST /api/simulate` |
| F8 | Loan recommendation card: eligibility, amount, rate range, tenure | in `/api/predict` and `/api/simulate` |
| F9 | Batch CSV upload, summary counts, results table, CSV download | `POST /api/predict/batch` |
| F10 | "Impact" page: Vridhi AI vs traditional bureau-only lending, from `summary.json` | static file |

## Risk language
- **Score** = 100 x (1 - default probability). It is a display number. Because the portfolio default rate is about 10%, most scores sit between 80 and 100. The **default probability** is the primary number; show it next to the score.
- **Tiers (from default probability):** Healthy under 5%, Watch 5-10%, Stressed 10-20%, High risk over 20%.
- **Labels for badges:** LOW (Healthy), MEDIUM (Watch), HIGH (Stressed and High risk).

## Non-functional targets
Score in under 1 second, batch of 100 rows under 10 seconds, responsive layout, Chrome / Firefox / Edge.

## Out of scope
Real bank or GST / UPI API integration, login, multi-language, PDF export (CSV download only).
