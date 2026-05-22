export default function StatCard({
  label,
  value,
  subtext,
  icon,
  accent = "brand",
}) {
  const accents = {
    brand: "from-brand-500/20 to-indigo-500/10 border-brand-200/60 dark:border-brand-800/40",
    indigo: "from-indigo-500/20 to-violet-500/10 border-indigo-200/60 dark:border-indigo-800/40",
    emerald:
      "from-emerald-500/20 to-teal-500/10 border-emerald-200/60 dark:border-emerald-800/40",
    amber:
      "from-amber-500/20 to-orange-500/10 border-amber-200/60 dark:border-amber-800/40",
    rose: "from-rose-500/20 to-pink-500/10 border-rose-200/60 dark:border-rose-800/40",
  };

  const displayValue = value ?? "—";

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${accents[accent] || accents.brand}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {icon && <span className="text-xl" aria-hidden>{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {displayValue}
      </p>
      {subtext && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtext}</p>
      )}
    </div>
  );
}
