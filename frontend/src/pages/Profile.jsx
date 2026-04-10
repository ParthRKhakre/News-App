import { useEffect, useMemo, useState } from "react";

import Loader from "@/components/common/Loader";
import PredictionBadge from "@/components/feed/PredictionBadge";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/utils/time";

function withinRange(dateString, range) {
  if (range === "all") {
    return true;
  }

  const created = new Date(dateString).getTime();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  if (range === "24h") {
    return now - created <= day;
  }
  if (range === "7d") {
    return now - created <= 7 * day;
  }
  if (range === "30d") {
    return now - created <= 30 * day;
  }
  return true;
}

export default function Profile() {
  const { user, history, bookmarks, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [labelFilter, setLabelFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

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
  }, [refreshProfile]);

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const haystack = `${entry.headline} ${entry.text || ""} ${entry.summary || ""}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      const matchesLabel = labelFilter === "all" || entry.label === labelFilter;
      const matchesDate = withinRange(entry.createdAt, dateFilter);
      return matchesQuery && matchesLabel && matchesDate;
    });
  }, [dateFilter, history, labelFilter, query]);

  if (loading) {
    return <Loader label="Loading profile" />;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6">
      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-6">
          <div className="card-surface rounded-[32px] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
              Profile
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold text-ink dark:text-white">
              @{user?.username}
            </h1>
            <p className="mt-3 text-slate-500 dark:text-slate-300">
              Role: <span className="font-semibold capitalize text-ink dark:text-white">{user?.role}</span>
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                  Verification activity
                </p>
                <p className="mt-2 text-3xl font-bold text-ink dark:text-white">{history.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                  Saved for later
                </p>
                <p className="mt-2 text-3xl font-bold text-ink dark:text-white">{bookmarks.length}</p>
              </div>
            </div>
          </div>

          <div className="card-surface rounded-[32px] p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
                Saved
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink dark:text-white">
                Save for later
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {bookmarks.length ? (
                bookmarks.map((item) => (
                  <div key={item.key} className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                          {item.category} · {item.source}
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-ink dark:text-white">
                          {item.headline}
                        </h3>
                      </div>
                      {item.label ? (
                        <PredictionBadge label={item.label} confidence={item.confidence} />
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {item.summary}
                    </p>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Saved {formatRelativeTime(item.savedAt)} · {new Date(item.savedAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
                  You have not saved any stories yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[32px] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">
                History
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink dark:text-white">
                Recent verification trail
              </h2>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search headline or summary"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <select
                value={labelFilter}
                onChange={(event) => setLabelFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="all">All results</option>
                <option value="REAL">Real only</option>
                <option value="FAKE">Fake only</option>
              </select>
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="all">All time</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {filteredHistory.length ? (
              filteredHistory.map((entry) => (
                <div key={entry.id} className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-ink dark:text-white">{entry.headline}</h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {formatRelativeTime(entry.createdAt)} · {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <PredictionBadge
                      label={entry.label}
                      confidence={entry.confidence}
                    />
                  </div>

                  {entry.summary ? (
                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {entry.summary}
                    </p>
                  ) : null}

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        Confidence
                      </p>
                      <p className="mt-2 font-semibold text-ink dark:text-white">
                        {Math.round((entry.confidence || 0) * 100)}%
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        Blockchain status
                      </p>
                      <p className="mt-2 font-semibold text-ink dark:text-white">
                        {entry.blockchainStatus === "confirmed"
                          ? "Confirmed"
                          : entry.blockchainStatus === "pending"
                            ? "Pending"
                            : "Prediction only"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        Transaction
                      </p>
                      <p className="mt-2 truncate font-mono text-sm text-slate-600 dark:text-slate-300">
                        {entry.txHash || "Prediction only"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
                No matching verifications found. Try changing the search or filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
