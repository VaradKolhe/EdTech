import { useTheme } from "../context/ThemeContext";
import { MoonIcon, SunIcon, AcademicCapIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const course = useSelector((s) => s.course.course);
  const navigate = useNavigate();

  return (
    <header className="h-12 bg-[#1a1f2e] border-b border-white/10 flex items-center px-4 gap-3 z-20 flex-shrink-0">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-primary font-bold text-base mr-2">
        <AcademicCapIcon className="w-5 h-5" />
        <span className="hidden sm:inline text-white">EduForge</span>
      </Link>

      {/* Breadcrumb */}
      {course && (
        <>
          <span className="text-gray-600 text-sm">/</span>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            All Courses
          </button>
          <span className="text-gray-600 text-sm">/</span>
          <span className="text-sm text-gray-300 truncate max-w-xs">{course.title}</span>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          title="Toggle dark mode"
        >
          {dark
            ? <SunIcon className="w-4 h-4 text-yellow-400" />
            : <MoonIcon className="w-4 h-4 text-gray-400" />
          }
        </button>
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
          T
        </div>
      </div>
    </header>
  );
}
