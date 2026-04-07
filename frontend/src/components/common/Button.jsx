export default function Button({
  children,
  className = "",
  variant = "primary",
  loading = false,
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      "bg-ink text-white hover:bg-slate-800 focus-visible:ring-slate-500",
    secondary:
      "bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-slate-300",
    ghost:
      "bg-transparent text-ink hover:bg-slate-100 focus-visible:ring-slate-300",
    fake:
      "bg-fake text-white hover:bg-red-600 focus-visible:ring-red-300",
    real:
      "bg-real text-white hover:bg-green-600 focus-visible:ring-green-300"
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Working..." : children}
    </button>
  );
}
