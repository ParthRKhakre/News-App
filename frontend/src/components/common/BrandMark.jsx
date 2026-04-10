export default function BrandMark({ className = "", compact = false }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.22)] ring-1 ring-white/15 dark:bg-white dark:text-slate-950 dark:ring-slate-700">
        <span className="absolute inset-x-2 top-2 h-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 opacity-95" />
        <span className="absolute inset-x-2 bottom-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 opacity-90" />
        <span className="relative z-10 font-display text-sm font-black tracking-[0.18em]">
          TN
        </span>
      </div>
      {!compact ? (
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-slate-950 dark:text-white">
            Tez News
          </p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
            AI-powered credibility checks
          </p>
        </div>
      ) : null}
    </div>
  );
}
