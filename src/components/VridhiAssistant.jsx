import React, { useMemo, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { FALLBACK_ANSWER, SUGGESTED_QUESTIONS, findFaqAnswer } from '../data/faq';

function formatAssessment(assessment) {
  if (!assessment) return null;
  const probability = Number(assessment.default_probability);
  const defaultProbability = Number.isFinite(probability) && probability >= 0 && probability <= 1
    ? `${(probability * 100).toFixed(1)}%`
    : assessment.default_probability;
  return {
    score: assessment.risk_score,
    defaultProbability,
    tier: assessment.risk_tier || 'Unknown',
    label: assessment.risk_label || 'Unknown',
    topReason: assessment.reason_codes?.[0]?.label || assessment.reason_codes?.[0]?.feature || assessment.reason_codes?.[0]?.reason || assessment.reason_codes?.[0]?.name || null,
  };
}

export default function VridhiAssistant({ assessment }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi, I’m Vridhi Assistant. Ask me about the scores, explanations, or pages in this demo.',
    },
  ]);
  const inputRef = useRef(null);
  const assessmentContext = useMemo(() => formatAssessment(assessment), [assessment]);

  const ask = (text) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    const answer = findFaqAnswer(cleanText, { assessment: assessmentContext }) || FALLBACK_ANSWER;
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-question`, role: 'user', text: cleanText },
      { id: `${Date.now()}-answer`, role: 'assistant', text: answer },
    ]);
    setQuestion('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submit = (event) => {
    event.preventDefault();
    ask(question);
  };

  return (
    <>
      {open && (
        <section
          className="vridhi-assistant-panel fixed bottom-24 right-4 sm:right-6 z-[60] w-[min(calc(100vw-2rem),25rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          aria-label="Vridhi Assistant chat"
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-teal-700 to-teal-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold">Vridhi Assistant</h2>
                <p className="text-[11px] text-teal-100">Help for this demo workspace</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-teal-100 transition hover:bg-white/15 hover:text-white"
              aria-label="Close Vridhi Assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="max-h-[min(28rem,55vh)] space-y-3 overflow-y-auto bg-slate-50 p-3 dark:bg-slate-950" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-5 ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-teal-700 text-white'
                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" /> Suggested questions
            </div>
            <div className="mb-3 grid grid-cols-1 gap-1.5">
              {SUGGESTED_QUESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="rounded-lg border border-teal-100 bg-teal-50 px-2.5 py-1.5 text-left text-[11px] font-semibold text-teal-800 transition hover:border-teal-300 hover:bg-teal-100 dark:border-teal-900/70 dark:bg-teal-950/50 dark:text-teal-200 dark:hover:bg-teal-900/60"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="flex items-center gap-2">
              <label className="sr-only" htmlFor="vridhi-assistant-question">Ask Vridhi Assistant</label>
              <input
                ref={inputRef}
                id="vridhi-assistant-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about this app..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!question.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send question"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">Help assistant for demo data. Not financial advice.</p>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-5 right-4 sm:right-6 z-[60] flex items-center gap-2 rounded-full bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/25 transition hover:-translate-y-0.5 hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-500/30"
        aria-label={open ? 'Close Vridhi Assistant' : 'Open Vridhi Assistant'}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden sm:inline">Vridhi Assistant</span>
      </button>
    </>
  );
}
