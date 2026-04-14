export default function BrandMark({ className = "", compact = false }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[20px] bg-slate-950 text-white shadow-[0_16px_34px_rgba(15,23,42,0.24)] ring-1 ring-white/10 dark:bg-white dark:text-slate-950 dark:ring-slate-700">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(56,189,248,0.34),transparent_34%),radial-gradient(circle_at_78%_78%,rgba(249,115,22,0.24),transparent_30%)]" />
        <svg
          viewBox="0 0 64 64"
          className="relative z-10 h-8 w-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M32 8L49 15V29C49 39.5 42.167 47.333 32 52C21.833 47.333 15 39.5 15 29V15L32 8Z"
            className="fill-white/95 dark:fill-slate-950"
          />
          <path
            d="M22 22C22 19.791 23.791 18 26 18H38C40.209 18 42 19.791 42 22V31C42 33.209 40.209 35 38 35H26C23.791 35 22 33.209 22 31V22Z"
            className="fill-sky-500 dark:fill-blue-600"
          />
          <path
            d="M26 23H38"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M26 27H35"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.88"
          />
          <path
            d="M25 40.5L30 45L39.5 34.5"
            stroke="#F59E0B"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
