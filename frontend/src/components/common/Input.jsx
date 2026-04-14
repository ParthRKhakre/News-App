export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-orange-100 ${className}`}
        {...props}
      />
      {error ? <span className="text-sm text-fake">{error}</span> : null}
    </label>
  );
}
