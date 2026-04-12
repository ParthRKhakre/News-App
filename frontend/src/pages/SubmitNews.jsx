import { startTransition, useState } from "react";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import BlockchainModal from "@/components/modals/BlockchainModal";
import ResultModal from "@/components/modals/ResultModal";
import { useAuth } from "@/hooks/useAuth";

export default function SubmitNews() {
  const { requestPrediction, saveCustomNews, pushToast, canSubmitNews, canStoreOnChain } = useAuth();
  const [form, setForm] = useState({ headline: "", content: "" });
  const [errors, setErrors] = useState({});
  const [loadingMode, setLoadingMode] = useState(null);
  const [result, setResult] = useState(null);
  const [blockchainResult, setBlockchainResult] = useState(null);

  const validate = () => {
    const nextErrors = {};
    if (!form.headline.trim()) {
      nextErrors.headline = "Headline is required.";
    }
    if (form.content.trim().length < 20) {
      nextErrors.content = "Use at least 20 characters of content.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveToFeed = () => {
    saveCustomNews(form);
    pushToast("Story added to your feed.", "success");
  };

  const handlePredict = async (store) => {
    if (!validate()) {
      return;
    }

    setLoadingMode(store ? "store" : "predict");
    try {
      const response = await requestPrediction(form.content, {
        headline: form.headline,
        store
      });
      if (store) {
        startTransition(() => {
          setBlockchainResult({ ...response, headline: form.headline, text: form.content });
        });
      } else {
        startTransition(() => {
          setResult({ ...response, headline: form.headline, text: form.content });
        });
      }
      saveToFeed();
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 pb-32 pt-8 sm:px-6">
      {!canSubmitNews ? (
        <div className="mb-6 rounded-[32px] border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Only reporter and admin accounts can submit custom stories in this version of Tez News.
        </div>
      ) : null}
      <div className="rounded-[32px] bg-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
          Submit News
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold text-ink">
          Check a story before it spreads.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          Paste a headline and supporting content. We will run the full detection
          pipeline and optionally store the verification proof on-chain.
        </p>

        <div className="mt-8 space-y-5">
          <Input
            label="Headline"
            placeholder="Enter the story headline"
            value={form.headline}
            error={errors.headline}
            onChange={(event) =>
              setForm((current) => ({ ...current, headline: event.target.value }))
            }
          />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <span>Content</span>
            <textarea
              rows="9"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Paste the news content or claim here"
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({ ...current, content: event.target.value }))
              }
            />
            {errors.content ? <span className="text-sm text-fake">{errors.content}</span> : null}
          </label>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button
            variant="secondary"
            disabled={!canSubmitNews}
            loading={loadingMode === "predict"}
            onClick={() => handlePredict(false)}
          >
            Check Authenticity
          </Button>
          <Button
            variant="primary"
            disabled={!canStoreOnChain}
            loading={loadingMode === "store"}
            onClick={() => handlePredict(true)}
          >
            {canStoreOnChain ? "Verify & Store" : "Reporter/Admin only"}
          </Button>
        </div>
      </div>

      <ResultModal open={Boolean(result)} result={result} onClose={() => setResult(null)} />
      <BlockchainModal
        open={Boolean(blockchainResult)}
        result={blockchainResult}
        onClose={() => setBlockchainResult(null)}
      />
    </section>
  );
}
