const styles = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
};

export default function StatusBadge({ status }) {
  const key = status?.toLowerCase();
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[key] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
    >
      {status || "—"}
    </span>
  );
}
