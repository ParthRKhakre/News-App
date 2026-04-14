export default function ToastStack({ toast }) {
  if (!toast) {
    return null;
  }

  const tone =
    toast.type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : toast.type === "success"
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-slate-200 bg-white text-slate-700";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div className={`pointer-events-auto rounded-full border px-4 py-3 text-sm font-medium shadow-lg ${tone}`}>
        {toast.message}
      </div>
    </div>
  );
}
