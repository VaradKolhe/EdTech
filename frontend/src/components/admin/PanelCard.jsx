export default function PanelCard({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {title && (
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
