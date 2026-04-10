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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-3xl rounded-[32px] bg-white p-6 shadow-card dark:bg-slate-900 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
              Blockchain Verification
            </p>
            <h3 className="mt-3 font-display text-3xl font-bold text-ink dark:text-white">
              Proof generated successfully
            </h3>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-white"
        >
          X
        </button>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <PredictionBadge label={result.label} confidence={result.confidence} />
          <span className={`rounded-full px-3 py-2 text-sm font-medium ${
            pending
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
          }`}>
            {pending ? "Transaction pending" : "Verification stored"}
          </span>
          <Button
            variant="secondary"
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
          <Button variant="ghost" onClick={handleShare}>
            Share report
          </Button>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-3xl bg-blue-50 p-5 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-500">News summary</p>
            <p className="mt-2 text-sm leading-7 text-ink dark:text-white">{summary}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-500">Transaction hash</p>
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
            <p className="text-sm font-semibold text-slate-500">Verification ID</p>
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
      </motion.div>
    </div>
  );
}
