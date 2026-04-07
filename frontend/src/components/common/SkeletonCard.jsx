export default function SkeletonCard() {
  return (
    <div className="rounded-[32px] bg-white p-6 shadow-card dark:bg-slate-900">
      <div className="skeleton h-6 w-24 rounded-full" />
      <div className="mt-8 space-y-4">
        <div className="skeleton h-10 w-5/6 rounded-2xl" />
        <div className="skeleton h-6 w-full rounded-2xl" />
        <div className="skeleton h-6 w-4/5 rounded-2xl" />
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <div className="skeleton h-12 rounded-2xl" />
        <div className="skeleton h-12 rounded-2xl" />
      </div>
    </div>
  );
}
