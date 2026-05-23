import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AcademicCapIcon,
  MoonIcon,
  SunIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role;
  const isStudent = role === "STUDENT";
  const isInstructor = role === "INSTRUCTOR";

  const navLinks = isStudent ? [
    { name: "Dashboard", path: "/student-dashboard" },
    { name: "My Courses", path: "/student-dashboard/my-courses" },
    { name: "Browse", path: "/student-dashboard/browse" },
    { name: "Profile", path: "/student-dashboard/profile" },
  ] : [];

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-[#0b0e14]/80 sm:px-10">
      <div className="flex items-center gap-8">
        <Link
          to={role === "ADMIN" ? "/admin-dashboard" : isStudent ? "/student-dashboard" : "/instructor-dashboard"}
          className="flex items-center gap-2 text-xl font-black tracking-tighter text-slate-900 dark:text-white"
        >
          <div className="rounded-lg bg-brand-600 p-1 text-white shadow-lg shadow-brand-600/20">
            <AcademicCapIcon className="h-6 w-6" />
          </div>
          <span>EduLearn</span>
        </Link>

        {(isStudent || isInstructor) && (
          <nav className="hidden md:flex items-center gap-6">
            {(isStudent ? navLinks : [{ name: "Workspace", path: "/instructor-dashboard" }]).map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-bold transition-colors ${
                  location.pathname === link.path 
                    ? "text-brand-600 dark:text-brand-400" 
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isStudent && (
          <div className="relative hidden lg:block">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ask AI to find courses..." 
              className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        )}

        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Toggle dark mode"
        >
          {dark ? (
            <SunIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => { logout(); navigate("/login"); }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-brand-600/20 hover:scale-105 transition-transform"
            title={user?.name || "User"}
          >
            {(user?.name || "U").charAt(0).toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
}
