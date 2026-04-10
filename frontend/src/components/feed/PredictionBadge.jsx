export default function PredictionBadge({ label, confidence }) {
  const isReal = label === "REAL";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold ring-1 ${
        isReal
          ? "bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-900"
          : "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${isReal ? "bg-real" : "bg-fake"}`} />
      {isReal ? "Likely Real" : "Likely Fake"}
      {typeof confidence === "number" ? (
        <span className="font-medium text-slate-500 dark:text-slate-300">
          {Math.round(confidence * 100)}%
        </span>
      ) : null}
    </div>
  );
}
