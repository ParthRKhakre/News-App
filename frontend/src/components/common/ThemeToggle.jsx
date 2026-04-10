export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-2 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-600"
    >
      <span className="px-2">{isDark ? "Dark" : "Light"}</span>
      <span
        className={`relative flex h-8 w-14 items-center rounded-full transition ${
          isDark ? "bg-slate-800" : "bg-blue-50"
        }`}
      >
        <span
          className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs shadow-sm transition ${
            isDark
              ? "left-7 bg-slate-950 text-sky-300"
              : "left-1 bg-white text-amber-500"
          }`}
        >
          {isDark ? "☾" : "☀"}
        </span>
      </span>
    </button>
  );
}
