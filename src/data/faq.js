export const FALLBACK_ANSWER = "I can help with questions about this app's scores and pages. Try one of the suggested questions.";

export const SUGGESTED_QUESTIONS = [
  'What does my score mean?',
  'What are reason codes?',
  'What is a thin-file business?',
  'How does the simulator work?',
];

export const FAQ_ENTRIES = [
  {
    id: 'risk-score',
    keywords: ['score', 'risk score', 'credit score', 'rating', 'number'],
    answer: ({ assessment }) => {
      if (assessment) {
        return `Your latest assessment shows a risk score of ${assessment.score}, a default probability of ${assessment.defaultProbability}, and a ${assessment.tier} (${assessment.label}) risk tier. This is an explainable demo assessment, not a lending decision.`;
      }
      return 'The risk score is the app\'s model summary of the business profile. A higher score indicates a stronger profile in this app, while a lower score indicates higher modeled risk. Always read it together with the default probability, risk tier, and reason codes.';
    },
  },
  {
    id: 'default-probability',
    keywords: ['default probability', 'probability', 'default chance', 'chance of default'],
    answer: ({ assessment }) => {
      if (assessment) {
        return `Your latest assessment shows a default probability of ${assessment.defaultProbability}, alongside a risk score of ${assessment.score} and a ${assessment.tier} (${assessment.label}) tier. It is a model estimate for this demo, not a lending decision.`;
      }
      return 'Default probability is the model\'s estimated likelihood of default for the entered business profile. It is a risk estimate, not a guarantee or a lending decision.';
    },
  },
  {
    id: 'risk-tier-label',
    keywords: ['risk tier', 'tier', 'label', 'healthy', 'watch', 'stressed', 'high risk'],
    answer: ({ assessment }) => {
      if (assessment) {
        return `The latest result is classified as ${assessment.tier} (${assessment.label}). The tier and label summarize the model output for the current inputs; review the reason codes to understand what influenced it.`;
      }
      return 'The risk tier and label group the model output into an easy-to-read category such as Healthy, Watch, Stressed, or High risk. The category is a summary of the model output, not an automatic lending decision.';
    },
  },
  {
    id: 'reason-codes',
    keywords: ['reason code', 'reason codes', 'reasons', 'factor', 'shap', 'explain'],
    answer: ({ assessment }) => {
      const topReason = assessment?.topReason;
      if (topReason) {
        return `Reason codes explain which business signals influenced the latest result. The top reason shown on screen is ${topReason}. Use the chart and explanations to see whether each factor helps or raises modeled risk.`;
      }
      return 'Reason codes are the model explanations shown beside a result. They identify business signals that help or raise modeled risk, so a lender or business owner can inspect the score rather than treat it as a black box.';
    },
  },
  {
    id: 'thin-file',
    keywords: ['thin file', 'thin-file', 'no bureau', 'bureau history', 'credit invisible', 'credit-invisible'],
    answer: () => 'A thin-file business has limited or no traditional bureau history. Vridhi AI uses alternative business signals such as GST behaviour, UPI cash flow, utility payments, and invoice collection to provide an explainable demo assessment.' ,
  },
  {
    id: 'forecast-dscr',
    keywords: ['forecast', 'cash flow', 'cashflow', 'dscr', 'debt service', 'six month', 'six-month'],
    answer: () => 'The cash-flow forecast uses the entered monthly UPI inflow history to project six months and show debt-service coverage. DSCR means debt-service coverage ratio: it compares expected cash flow with scheduled debt service. The forecast is illustrative demo analysis, not a promise of future performance.' ,
  },
  {
    id: 'fairness-audit',
    keywords: ['fairness', 'fairness audit', 'demographic parity', 'disparate impact', 'bias', 'gender', 'region'],
    answer: () => 'The Fairness Audit reviews approval outcomes across groups such as gender, region, business size, and sector. These attributes are used for auditing in the demo, not as model inputs. The page includes standard and adjusted views to help inspect parity.' ,
  },
  {
    id: 'simulator',
    keywords: ['simulator', 'what-if', 'what if', 'scenario', 'projected', 'simulate'],
    answer: () => 'The What-If Simulator lets you adjust selected business parameters and compare the original assessment with a projected result. It is an illustrative scenario based on the app model, not a causal prediction or lending decision.' ,
  },
  {
    id: 'batch-upload',
    keywords: ['batch', 'upload', 'csv', 'bulk', 'many businesses', 'applications'],
    answer: () => 'Batch Score accepts a CSV containing the required MSME fields, then scores multiple applications together and provides results for review or export. Use the required-schema list on the Batch page and the provided sample CSV for the demo.' ,
  },
];

export function findFaqAnswer(question, context = {}) {
  const normalized = question.trim().toLowerCase();
  if (!normalized) return null;

  const ranked = FAQ_ENTRIES
    .map((entry) => ({
      entry,
      matches: entry.keywords.filter((keyword) => normalized.includes(keyword)).length,
    }))
    .filter(({ matches }) => matches > 0)
    .sort((a, b) => b.matches - a.matches);

  return ranked[0]?.entry.answer(context) || null;
}
