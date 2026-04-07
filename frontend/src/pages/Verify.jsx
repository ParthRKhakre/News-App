import { useEffect, useState } from "react";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
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
  const { verifyHash } = useAuth();
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const debouncedHash = useDebouncedValue(hash);

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

  return (
    <section className="mx-auto max-w-4xl px-4 pb-32 pt-8 sm:px-6">
      <div className="rounded-[32px] bg-white p-6 shadow-card dark:bg-slate-900 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">Public verification</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-ink dark:text-white">
          Verify a blockchain record
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-300">
          Paste the verification hash to inspect the stored authenticity result.
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
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-500">Result</p>
              <p className={`mt-2 text-2xl font-bold ${record.result === "REAL" ? "text-real" : "text-fake"}`}>
                {record.result}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-500">Confidence</p>
              <p className="mt-2 text-2xl font-bold text-ink dark:text-white">
                {(record.confidence / 100).toFixed(2)}%
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-500">Timestamp</p>
              <p className="mt-2 text-sm font-medium text-ink dark:text-white">
                {formatRelativeTime(record.timestamp * 1000)} · {new Date(record.timestamp * 1000).toLocaleString()}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-500">Transaction hash</p>
              <p className="mt-2 break-all font-mono text-sm text-ink dark:text-white">
                {record.txHash || "Not available"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
