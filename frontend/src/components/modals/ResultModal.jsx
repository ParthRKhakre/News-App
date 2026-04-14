import { useEffect } from "react";

import { motion } from "framer-motion";

import Button from "@/components/common/Button";
import PredictionBadge from "@/components/feed/PredictionBadge";
import { useAuth } from "@/hooks/useAuth";

function highlightText(text, importantWords = []) {
  if (!text) {
    return null;
  }

  const words = new Set(importantWords.map((word) => word.toLowerCase()));
  return text.split(/(\s+)/).map((part, index) => {
    const normalized = part.replace(/[^\w]/g, "").toLowerCase();
    const isHighlighted = words.has(normalized);
    return (
      <span
        key={`${part}-${index}`}
        className={isHighlighted ? "rounded bg-orange-100 px-1 text-ember" : ""}
      >
        {part}
      </span>
    );
  });
}

export default function ResultModal({ open, result, onClose }) {
  const { pushToast, toggleBookmark, isBookmarked } = useAuth();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open || !result) {
    return null;
  }

  const summary =
    result.summary ||
    result.ai_analysis?.summary ||
    "A short summary could not be generated for this article.";
  const bookmarked = isBookmarked({
    content: result.text,
    headline: result.headline
  });

  const handleShare = async () => {
    const shareText = [
      `Tez News verification report`,
      result.headline ? `Headline: ${result.headline}` : null,
      `Prediction: ${result.label} (${Math.round((result.confidence || 0) * 100)}%)`,
      summary,
      result.hash ? `Verification ID: ${result.hash}` : null,
      result.txHash ? `Transaction hash: ${result.txHash}` : null
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: result.headline || "Tez News verification report",
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        pushToast("Verification report copied to clipboard.", "success");
      }
    } catch {
      pushToast("Unable to share this verification right now.", "error");
    }
  };

  const handleCopy = async (value, label) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      pushToast(`${label} copied to clipboard.`, "success");
    } catch {
      pushToast(`Unable to copy ${label.toLowerCase()} right now.`, "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] bg-white shadow-card dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-8">
          <div className="pr-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
              Prediction Result
            </p>
            <h3 className="mt-3 font-display text-3xl font-bold text-ink dark:text-white">
              {result.headline || "Verification complete"}
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-white"
        >
          X
        </button>
        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <PredictionBadge label={result.label} confidence={result.confidence} />
            <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              Confidence {Math.round((result.confidence || 0) * 100)}%
            </span>
            <Button
              variant="secondary"
              onClick={() =>
                toggleBookmark(
                  {
                    content: result.text,
                    headline: result.headline,
                    source: "Verification result",
                    category: "Saved"
                  },
                  result
                )
              }
            >
              {bookmarked ? "Saved" : "Save for later"}
            </Button>
            <Button variant="ghost" onClick={handleShare}>
              Share report
            </Button>
            <Button variant="ghost" onClick={onClose} className="ml-auto">
              Close
            </Button>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-6">
              <div className="rounded-3xl bg-blue-50 p-5 dark:bg-slate-800">
                <p className="text-sm font-semibold text-ink dark:text-white">News summary</p>
                <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {summary}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
                <p className="text-sm font-semibold text-ink dark:text-white">
                  Why this is {result.label}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {result.explanation || "No explanation returned."}
                </p>
              </div>

              {result.ai_analysis ? (
                <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:from-slate-800 dark:to-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-ink dark:text-white">
                      Gemini AI analysis
                    </p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ember dark:bg-slate-900">
                      {result.ai_analysis.model}
                    </span>
                    {result.ai_analysis.second_opinion_label ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-200">
                        AI second opinion {result.ai_analysis.second_opinion_label}
                        {typeof result.ai_analysis.second_opinion_confidence === "number"
                          ? ` ${Math.round(result.ai_analysis.second_opinion_confidence * 100)}%`
                          : ""}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {result.ai_analysis.summary}
                  </p>

                  {result.ai_analysis.grounded ? (
                    <div className="mt-4 rounded-2xl bg-white/80 p-4 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                        Web-grounded verification
                      </p>
                      {(result.ai_analysis.search_queries || []).length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {result.ai_analysis.search_queries.map((query) => (
                            <span
                              key={query}
                              className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                            >
                              {query}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {(result.ai_analysis.sources || []).length ? (
                        <div className="mt-4 space-y-3">
                          {result.ai_analysis.sources.map((source) => (
                            <a
                              key={source.url}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              <p className="font-semibold">{source.title}</p>
                              <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                                {source.url}
                              </p>
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white/80 p-4 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                        Suspicious signals
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {(result.ai_analysis.suspicious_signals || []).map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-4 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                        What to verify next
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {(result.ai_analysis.verification_guidance || []).map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-white/80 p-4 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                      Contradiction and risk summary
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {result.ai_analysis.contradiction_risk}
                    </p>
                    {result.ai_analysis.note ? (
                      <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                        {result.ai_analysis.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="rounded-3xl bg-sand p-5 dark:bg-slate-800">
                <p className="text-sm font-semibold text-ink dark:text-white">Highlighted text</p>
                <div className="mt-3 max-h-[48vh] overflow-y-auto rounded-2xl bg-white/70 p-4 text-sm leading-7 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {highlightText(result.text, result.important_words)}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-sand p-5 dark:bg-slate-800">
                <p className="text-sm font-semibold text-ink dark:text-white">Important words</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(result.important_words || []).length ? (
                    result.important_words.map((word) => (
                      <span
                        key={word}
                        className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-ember shadow-sm dark:bg-slate-900"
                      >
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No keyword breakdown returned.</span>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
                <p className="text-sm font-semibold text-ink dark:text-white">Model breakdown</p>
                <div className="mt-4 space-y-3">
                  {Object.entries(result.model_breakdown || {}).map(([model, label]) => (
                    <div
                      key={model}
                      className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 dark:bg-slate-900"
                    >
                      <span className="text-sm font-medium capitalize text-slate-500 dark:text-slate-300">
                        {model.replace("_", " ")}
                      </span>
                      <span
                        className={`text-sm font-bold ${label === "REAL" ? "text-real" : "text-fake"}`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {result.hash || result.txHash ? (
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
                  <p className="text-sm font-semibold text-ink dark:text-white">Stored proof details</p>
                  <div className="mt-4 space-y-4">
                    {result.hash ? (
                      <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                            Verification hash
                          </p>
                          <Button variant="ghost" onClick={() => handleCopy(result.hash, "Verification hash")}>
                            Copy
                          </Button>
                        </div>
                        <p className="mt-2 break-all font-mono text-sm text-slate-600 dark:text-slate-300">
                          {result.hash}
                        </p>
                      </div>
                    ) : null}
                    {result.txHash ? (
                      <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                            Transaction hash
                          </p>
                          <Button variant="ghost" onClick={() => handleCopy(result.txHash, "Transaction hash")}>
                            Copy
                          </Button>
                        </div>
                        <p className="mt-2 break-all font-mono text-sm text-slate-600 dark:text-slate-300">
                          {result.txHash}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
