import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import Loader from "@/components/common/Loader";
import SkeletonCard from "@/components/common/SkeletonCard";
import { useAuth } from "@/hooks/useAuth";

const PIE_COLORS = ["#EF4444", "#22C55E"];

export default function Dashboard() {
  const { fetchAnalytics } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAnalytics()
      .then((data) => {
        if (active) {
          setAnalytics(data);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    );
  }

  if (!analytics) {
    return <Loader label="Loading analytics" />;
  }

  const pieData = [
    { name: "Fake", value: analytics.fake_count },
    { name: "Real", value: analytics.real_count },
  ];
  const keywordData = analytics.top_keywords.map((keyword, index) => ({
    keyword,
    score: analytics.top_keywords.length - index,
  }));
  const hasPredictionData = analytics.total_checked > 0;
  const hasKeywordData = keywordData.length > 0;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">Analytics</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink dark:text-white">
          Platform intelligence dashboard
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[32px] bg-white p-6 shadow-card dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">Total checked</p>
          <p className="mt-3 font-display text-4xl font-bold text-ink dark:text-white">
            {analytics.total_checked}
          </p>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-card dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">Fake ratio</p>
          <p className="mt-3 font-display text-4xl font-bold text-fake">
            {analytics.fake_percentage}%
          </p>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-card dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">Real ratio</p>
          <p className="mt-3 font-display text-4xl font-bold text-real">
            {100 - analytics.fake_percentage}%
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-6 shadow-card dark:bg-slate-900">
          <h2 className="font-display text-2xl font-bold text-ink dark:text-white">Fake vs Real</h2>
          <div className="mt-6 h-72">
            {hasPredictionData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={110}>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="font-display text-2xl font-bold text-ink dark:text-white">No checks yet</p>
                <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-300">
                  Verify a few stories from the feed or submit your own article to generate the first analytics snapshot.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-card dark:bg-slate-900">
          <h2 className="font-display text-2xl font-bold text-ink dark:text-white">Top keywords</h2>
          <div className="mt-6 h-72">
            {hasKeywordData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={keywordData}>
                  <XAxis dataKey="keyword" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#F97316" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="font-display text-2xl font-bold text-ink dark:text-white">No keyword trends yet</p>
                <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-300">
                  Once predictions run, important words from the explainability layer will appear here as a live trend signal.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
