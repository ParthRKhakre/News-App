export default function PredictionBadge({ label, confidence }) {
  const isReal = label === "REAL";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold ${
        isReal ? "bg-green-50 text-real" : "bg-red-50 text-fake"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${isReal ? "bg-real" : "bg-fake"}`} />
      {label}
      {typeof confidence === "number" ? (
        <span className="font-medium text-slate-500">{Math.round(confidence * 100)}%</span>
      ) : null}
    </div>
  );
}
