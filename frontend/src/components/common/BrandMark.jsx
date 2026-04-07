export default function BrandMark({ className = "", compact = false }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-ink text-white shadow-sm">
        <span className="absolute inset-x-2 bottom-1.5 h-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 opacity-95" />
        <span className="relative z-10 font-display text-sm font-black tracking-[0.18em]">
          T
        </span>
      </div>
      {!compact ? (
        <div>
          <p className="font-display text-lg font-bold text-ink dark:text-white">Tez News</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">Detect fast. Verify deeper.</p>
        </div>
      ) : null}
    </div>
  );
}
