export default function Loader({ fullScreen = false, label = "Loading" }) {
  return (
    <div
      className={`${fullScreen ? "min-h-screen" : "py-8"} flex items-center justify-center`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-ember" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
}
