import { useEffect } from "react";

import { motion } from "framer-motion";

import Button from "@/components/common/Button";
import PredictionBadge from "@/components/feed/PredictionBadge";

export default function BlockchainModal({ open, result, onClose }) {
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
          <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            Verification stored
          </span>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-500">Transaction hash</p>
            <p className="mt-2 break-all font-mono text-sm text-ink dark:text-white">{result.txHash || "Not available"}</p>
          </div>
          <div className="rounded-3xl bg-sand p-5 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-500">Verification ID</p>
            <p className="mt-2 break-all font-mono text-sm text-ink dark:text-white">{result.hash || "Not available"}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-500">Block number</p>
            <p className="mt-2 break-all font-mono text-sm text-ink dark:text-white">{result.blockNumber ?? "Pending"}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
