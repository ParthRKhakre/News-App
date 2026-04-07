import { useEffect, useState } from "react";

import Loader from "@/components/common/Loader";
import PredictionBadge from "@/components/feed/PredictionBadge";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/utils/time";

export default function Profile() {
  const { user, history, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    refreshProfile().finally(() => {
      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <Loader label="Loading profile" />;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
            Profile
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold text-ink">
            @{user?.username}
          </h1>
          <p className="mt-3 text-slate-500">
            Role: <span className="font-semibold capitalize text-ink">{user?.role}</span>
          </p>
          <div className="mt-8 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Verification activity</p>
            <p className="mt-2 text-3xl font-bold text-ink">{history.length}</p>
            <p className="mt-2 text-sm text-slate-500">
              Completed checks stored in your local session history.
            </p>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-card">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
              History
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink">
              Recent verification trail
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            {history.length ? (
              history.map((entry) => (
                <div key={entry.id} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-ink">{entry.headline}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {formatRelativeTime(entry.createdAt)} · {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <PredictionBadge
                      label={entry.label}
                      confidence={entry.confidence}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Confidence
                      </p>
                      <p className="mt-2 font-semibold text-ink">
                        {Math.round((entry.confidence || 0) * 100)}%
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Transaction
                      </p>
                      <p className="mt-2 truncate font-mono text-sm text-slate-600">
                        {entry.txHash || "Prediction only"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                No verifications yet. Start from the feed or submit a story manually.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
