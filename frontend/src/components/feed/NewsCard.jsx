import { memo } from "react";

import { motion, useReducedMotion } from "framer-motion";

import Button from "@/components/common/Button";
import PredictionBadge from "@/components/feed/PredictionBadge";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    </svg>
  );
}

function BookmarkIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NewsCard({
  article,
  cachedResult,
  loadingAction,
  isBookmarked,
  canStoreOnChain,
  onToggleBookmark,
  onOpen,
  onVerify,
  onVerifyAndStore
}) {
  const reduceMotion = useReducedMotion();
  const confidence = typeof cachedResult?.confidence === "number"
    ? Math.round(cachedResult.confidence * 100)
    : null;
  const confidenceTone = cachedResult?.label === "REAL" ? "bg-green-500" : "bg-red-500";

  const handleCopy = async (event, value) => {
    event.stopPropagation();
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Compact feed buttons fail silently if clipboard access is unavailable.
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(article);
    }
  };

  return (
    <article className="feed-card flex min-h-[calc(100vh-92px)] items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.985 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.36, ease: "easeOut" }}
        className="card-surface group w-full max-w-4xl cursor-pointer overflow-hidden rounded-[36px] p-6 sm:p-8"
        role="button"
        tabIndex={0}
        onClick={() => onOpen(article)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-sky-300 dark:ring-blue-900">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <ClockIcon />
              {article.source}
            </span>
          </div>

          {cachedResult?.label ? (
            <div className="flex items-center gap-2">
              <PredictionBadge label={cachedResult.label} confidence={cachedResult.confidence} />
              <button
                type="button"
                aria-label={isBookmarked ? "Remove bookmark" : "Save for later"}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleBookmark(article, cachedResult);
                }}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                  isBookmarked
                    ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <BookmarkIcon filled={isBookmarked} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                <ShieldIcon />
                Awaiting verification
              </span>
              <button
                type="button"
                aria-label={isBookmarked ? "Remove bookmark" : "Save for later"}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleBookmark(article, cachedResult || null);
                }}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                  isBookmarked
                    ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <BookmarkIcon filled={isBookmarked} />
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-[2.8rem]">
              {article.headline}
            </h2>
            <p className="mt-5 line-clamp-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              {article.content}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-800">
                Tap anywhere on the card to inspect the latest analysis
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-800">
                Verify before sharing
              </span>
            </div>
          </div>

          <div className="rounded-[28px] bg-slate-50/90 p-5 ring-1 ring-slate-200/80 dark:bg-slate-900/70 dark:ring-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Verification panel
            </p>

            <div className="mt-5 rounded-3xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Confidence
                </span>
                <span className="text-lg font-bold text-slate-950 dark:text-white">
                  {confidence !== null ? `${confidence}%` : "--"}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={`h-2 rounded-full transition-all ${confidenceTone}`}
                  style={{ width: `${confidence ?? 12}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {cachedResult?.label
                  ? "Stored analysis is ready. Open the card for model reasoning and AI guidance."
                  : "Run a verification to view prediction confidence, explanation, and AI summary."}
              </p>
            </div>

            {cachedResult?.hash || cachedResult?.txHash ? (
              <div className="mt-5 space-y-3 rounded-3xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                {cachedResult?.hash ? (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Verification hash
                      </span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-blue-600 dark:text-sky-300"
                        onClick={(event) => handleCopy(event, cachedResult.hash)}
                      >
                        Copy
                      </button>
                    </div>
                    <p className="mt-2 line-clamp-2 break-all font-mono text-xs text-slate-600 dark:text-slate-300">
                      {cachedResult.hash}
                    </p>
                  </div>
                ) : null}
                {cachedResult?.txHash ? (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Transaction hash
                      </span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-blue-600 dark:text-sky-300"
                        onClick={(event) => handleCopy(event, cachedResult.txHash)}
                      >
                        Copy
                      </button>
                    </div>
                    <p className="mt-2 line-clamp-2 break-all font-mono text-xs text-slate-600 dark:text-slate-300">
                      {cachedResult.txHash}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 grid gap-3">
              <Button
                variant="primary"
                loading={loadingAction === "verify"}
                onClick={(event) => {
                  event.stopPropagation();
                  onVerify(article);
                }}
              >
                Verify now
              </Button>
              <Button
                variant="secondary"
                disabled={!canStoreOnChain}
                loading={loadingAction === "store"}
                onClick={(event) => {
                  event.stopPropagation();
                  onVerifyAndStore(article);
                }}
              >
                {canStoreOnChain ? "Verify & Store on-chain" : "Reporter/Admin only"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </article>
  );
}

export default memo(NewsCard);
