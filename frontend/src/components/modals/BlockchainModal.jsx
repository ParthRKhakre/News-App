import { useEffect } from "react";

import { motion } from "framer-motion";

import Button from "@/components/common/Button";
import PredictionBadge from "@/components/feed/PredictionBadge";
import { useAuth } from "@/hooks/useAuth";

export default function BlockchainModal({ open, result, onClose }) {
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

  const pending = result.blockNumber == null;
  const explorerUrl = result.txHash
    ? `https://sepolia.etherscan.io/tx/${result.txHash}`
    : null;
  const summary =
    result.summary ||
    result.ai_analysis?.summary ||
    "Verification completed, but a short summary is not available yet.";
  const bookmarked = isBookmarked({
    content: result.text,
    headline: result.headline
  });

  const handleShare = async () => {
    const shareText = [
      "Tez News blockchain verification",
      result.headline ? `Headline: ${result.headline}` : null,
      `Prediction: ${result.label} (${Math.round((result.confidence || 0) * 100)}%)`,
      `Verification status: ${pending ? "Transaction pending" : "Stored on-chain"}`,
      result.hash ? `Verification ID: ${result.hash}` : null,
      result.txHash ? `Transaction hash: ${result.txHash}` : null
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: result.headline || "Tez News blockchain verification",
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        pushToast("Blockchain report copied to clipboard.", "success");
      }
    } catch {
      pushToast("Unable to share this blockchain report right now.", "error");
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-3 py-4 sm:px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] bg-white p-5 shadow-card dark:bg-slate-900 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5 pr-14 dark:border-slate-800">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
              Blockchain Verification
            </p>
            <h3 className="mt-3 font-display text-2xl font-bold text-ink dark:text-white sm:text-3xl">
              Proof generated successfully
            </h3>
          </div>
          <Button variant="ghost" onClick={onClose} className="hidden sm:inline-flex">
            Close
          </Button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-white"
        >
          X
        </button>

        <div className="mt-6 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-wrap items-stretch gap-3">
            <PredictionBadge label={result.label} confidence={result.confidence} />
            <span className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-medium ${
              pending
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
            }`}>
              {pending ? "Transaction pending" : "Verification stored"}
            </span>
            <div className="grid w-full gap-3 sm:ml-auto sm:w-auto sm:grid-cols-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() =>
                  toggleBookmark(
                    {
                      content: result.text,
                      headline: result.headline,
                      source: "Blockchain verification",
                      category: "Saved"
                    },
                    result
                  )
                }
              >
                {bookmarked ? "Saved" : "Save for later"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleShare}>
                Share report
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
          <div className="rounded-3xl bg-blue-50 p-5 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-500">News summary</p>
            <p className="mt-2 text-sm leading-7 text-ink dark:text-white">{summary}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-500">Transaction hash</p>
              <Button variant="ghost" onClick={() => handleCopy(result.txHash, "Transaction hash")}>
                Copy
              </Button>
            </div>
            <p className="mt-2 break-all font-mono text-sm text-ink dark:text-white">{result.txHash || "Not available"}</p>
            {explorerUrl ? (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-sky-300"
              >
                Open in Sepolia explorer
              </a>
            ) : null}
          </div>
          <div className="rounded-3xl bg-sand p-5 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-500">Verification ID</p>
              <Button variant="ghost" onClick={() => handleCopy(result.hash, "Verification hash")}>
                Copy
              </Button>
            </div>
            <p className="mt-2 break-all font-mono text-sm text-ink dark:text-white">{result.hash || "Not available"}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-500">Block number</p>
            <p className="mt-2 break-all font-mono text-sm text-ink dark:text-white">{result.blockNumber ?? "Pending"}</p>
            {pending ? (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                The transaction has been submitted to Sepolia and is waiting for confirmation.
              </p>
            ) : (
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                The transaction is confirmed on-chain.
              </p>
            )}
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
