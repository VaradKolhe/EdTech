import { Link } from "react-router-dom";
import Navbar from "./Navbar";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
            
            <div>{children}</div>
          </div>
          
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
