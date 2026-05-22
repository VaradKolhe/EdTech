import { useTheme } from "../context/ThemeContext";
import { MoonIcon, SunIcon, AcademicCapIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const course = useSelector((s) => s.course.course);
  const navigate = useNavigate();

  return (
    <header className="z-20 flex h-14 flex-shrink-0 items-center gap-3 border-b border-white/10 bg-[#1a1f2e] px-14 sm:px-5">
      {/* Logo */}
      <Link to="/" className="mr-1 flex min-w-0 items-center gap-2 text-lg font-bold text-primary sm:mr-3">
        <AcademicCapIcon className="h-6 w-6" />
        <span className="hidden text-white sm:inline">EduForge</span>
      </Link>

      {/* Breadcrumb */}
      {course && (
        <>
          <span className="hidden text-base text-gray-600 sm:inline">/</span>
          <button
            onClick={() => navigate("/")}
            className="hidden items-center gap-1.5 text-base text-gray-400 transition-colors hover:text-white sm:flex"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            All Courses
          </button>
          <span className="hidden text-base text-gray-600 sm:inline">/</span>
          <span className="min-w-0 max-w-[42vw] truncate text-base font-medium text-gray-300 sm:max-w-md">{course.title}</span>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggle}
          className="rounded-lg p-2 transition-colors hover:bg-white/10"
          title="Toggle dark mode"
        >
          {dark
            ? <SunIcon className="h-5 w-5 text-yellow-400" />
            : <MoonIcon className="h-5 w-5 text-gray-400" />
          }
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          T
        </div>
      </div>
    </header>
  );
}
