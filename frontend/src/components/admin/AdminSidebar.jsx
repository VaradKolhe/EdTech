import { NavLink } from "react-router-dom";
import { ADMIN_NAV_ITEMS } from "../../config/adminNav";

export default function AdminSidebar({ onNavigate }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-6 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          EdTech Admin
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
          Control Panel
        </h2>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path === "" ? "." : item.path}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
