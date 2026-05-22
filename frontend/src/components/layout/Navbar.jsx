import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-brand-500/30">
            E
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Edu<span className="text-brand-600 dark:text-brand-400">Learn</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="hidden text-sm font-medium text-slate-600 hover:text-brand-600 sm:block dark:text-slate-300"
              >
                Sign in
              </Link>
              <Button size="sm" onClick={() => navigate("/register/student")}>
                Register
              </Button>
            </>
          ) : (
            <>
              <span className="hidden text-sm text-slate-500 sm:block">
                {user?.fullName} ({user?.role})
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
