import { useEffect, useMemo, useState } from "react";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PredictionBadge from "@/components/feed/PredictionBadge";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/utils/time";

function useDebouncedValue(value, delay = 450) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);

  return debouncedValue;
}

export default function Verify() {
  const { verifyHash, pushToast } = useAuth();
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const debouncedHash = useDebouncedValue(hash);

  const explorerUrl = useMemo(() => {
    return record?.txHash ? `https://sepolia.etherscan.io/tx/${record.txHash}` : null;
  }, [record?.txHash]);

  const handleVerify = async (nextHash = hash) => {
    const trimmed = nextHash.trim();
    if (!trimmed) {
      setError("Hash is required.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await verifyHash(trimmed);
      setRecord(result);
    } catch (err) {
      setRecord(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedHash.trim().length >= 8) {
      handleVerify(debouncedHash);
    }
  }, [debouncedHash]);

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

  const handleShare = async () => {
    if (!record) {
      return;
    }

    const shareText = [
      "Tez News verification certificate",
      `Result: ${record.result}`,
      `Confidence: ${(record.confidence / 100).toFixed(2)}%`,
      `Verification hash: ${record.contentHash}`,
      record.txHash ? `Transaction hash: ${record.txHash}` : null,
      `Timestamp: ${new Date(record.timestamp * 1000).toLocaleString()}`
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Tez News verification certificate",
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        pushToast("Verification certificate copied to clipboard.", "success");
      }
    } catch {
      pushToast("Unable to share this certificate right now.", "error");
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 pb-32 pt-8 sm:px-6">
      <div className="card-surface rounded-[32px] p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
          Public verification
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold text-ink dark:text-white">
          Verify a blockchain record
        </h1>
        <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-300">
          Paste a verification hash to open a clean certificate view for the stored authenticity record.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Input
            label="Verification hash"
            placeholder="Enter the stored content hash"
            value={hash}
            error={error}
            className="sm:flex-1"
            onChange={(event) => setHash(event.target.value)}
          />
          <div className="sm:pt-8">
            <Button loading={loading} onClick={() => handleVerify()}>
              Verify
            </Button>
          </div>
        </div>

        {record ? (
          <div className="mt-10 space-y-6">
            <div className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-card ring-1 ring-white/10 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
                    Verification certificate
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
                    On-chain authenticity proof
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                    This certificate confirms that a verification record exists on Ethereum Sepolia for the supplied content hash.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PredictionBadge
                    label={record.result}
                    confidence={record.confidence / 10000}
                  />
                  <span className="rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-blue-100 ring-1 ring-white/15">
                    Sepolia stored record
                  </span>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Confidence
                  </p>
                  <p className="mt-3 text-3xl font-bold">
                    {(record.confidence / 100).toFixed(2)}%
                  </p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Timestamp
                  </p>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-200">
                    {formatRelativeTime(record.timestamp * 1000)} | {new Date(record.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Network
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">Ethereum Sepolia</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                      Verification hash
                    </p>
                    <Button variant="ghost" onClick={() => handleCopy(record.contentHash, "Verification hash")}>
                      Copy
                    </Button>
                  </div>
                  <p className="mt-2 break-all font-mono text-sm text-ink dark:text-white">
                    {record.contentHash}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                      Transaction hash
                    </p>
                    <Button variant="ghost" onClick={() => handleCopy(record.txHash, "Transaction hash")}>
                      Copy
                    </Button>
                  </div>
                  <p className="mt-2 break-all font-mono text-sm text-ink dark:text-white">
                    {record.txHash || "Not available"}
                  </p>
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
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                  Certificate actions
                </p>
                <div className="mt-4 grid gap-3">
                  <Button onClick={handleShare}>Share certificate</Button>
                  <Button variant="secondary" onClick={() => handleCopy(record.contentHash, "Verification hash")}>
                    Copy verification hash
                  </Button>
                  <Button variant="secondary" onClick={() => handleCopy(record.txHash, "Transaction hash")}>
                    Copy transaction hash
                  </Button>
                </div>

                <div className="mt-6 rounded-2xl bg-white px-4 py-4 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    What this means
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    This certificate proves that a verification entry for the given content hash was recorded on-chain. It does not store the full article text on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
