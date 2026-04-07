export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
    >
      <span>{theme === "dark" ? "Dark" : "Light"}</span>
      <span className="text-base">{theme === "dark" ? "Moon" : "Sun"}</span>
    </button>
  );
}
