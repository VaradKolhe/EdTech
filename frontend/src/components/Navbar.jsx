import { useTheme } from "../context/ThemeContext";
import { MoonIcon, SunIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const course = useSelector((s) => s.course.course);

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 md:px-6 gap-4 shadow-sm z-20 relative">
      <Link to="/" className="flex items-center gap-2 text-primary font-bold text-lg">
        <AcademicCapIcon className="w-6 h-6" />
        <span className="hidden sm:inline">EduForge</span>
      </Link>
      {course && (
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
          / {course.title}
        </span>
      )}
      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Toggle dark mode"
        >
          {dark ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-500" />}
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
          T
        </div>
      </div>
    </header>
  );
}
