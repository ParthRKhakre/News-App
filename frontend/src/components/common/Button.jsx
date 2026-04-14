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
      "bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)] hover:bg-blue-700 focus-visible:ring-blue-300",
    secondary:
      "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 focus-visible:ring-slate-300 dark:bg-slate-900 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-800",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300 dark:text-slate-200 dark:hover:bg-slate-800",
    fake:
      "bg-fake text-white hover:bg-red-600 focus-visible:ring-red-300",
    real:
      "bg-real text-white hover:bg-green-600 focus-visible:ring-green-300"
  };

  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Working...
        </>
      ) : (
        children
      )}
    </button>
  );
}
