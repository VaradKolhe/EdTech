import { Link } from "react-router-dom";
import Navbar from "./Navbar";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-12 lg:flex-row lg:gap-16 lg:px-8">
        <div className="mb-10 hidden max-w-md lg:block">
          <div className="gradient-hero rounded-3xl p-10 text-white shadow-2xl">
            <h2 className="text-3xl font-bold leading-tight">
              Secure access for every role
            </h2>
            <p className="mt-4 text-indigo-200">
              Register as a student or teacher, or sign in with your admin
              credentials. Role-based authentication keeps your account safe.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-indigo-100">
              <li className="flex items-center gap-2">✓ Student registration</li>
              <li className="flex items-center gap-2">✓ Teacher registration</li>
              <li className="flex items-center gap-2">✓ JWT-protected sessions</li>
            </ul>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
            <div className="mt-8">{children}</div>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link
              to="/"
              className="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
