import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  CheckBadgeIcon,
  LanguageIcon,
  StarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CourseCard({ course }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#161b22]">
      <div className="aspect-video bg-slate-100 dark:bg-slate-800">
        {course.thumbnailUrl || course.thumbnail ? (
          <img
            src={course.thumbnailUrl || course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <AcademicCapIcon className="h-14 w-14 text-brand-600/30" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
          <span>{course.category || "General"}</span>
          <span>{course.difficulty}</span>
        </div>
        <h3 className="line-clamp-2 text-lg font-black text-slate-900 dark:text-white">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {course.shortDescription || course.description || "No description available."}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <span>{course.instructor?.name || "Instructor"}</span>
          {course.instructor?.isVerified && (
            <CheckBadgeIcon className="h-4 w-4 text-brand-600" title="Verified Instructor" />
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-amber-500" />
            {Number(course.averageRating || course.rating || 0).toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4" />
            {course.totalEnrollments || 0}
          </span>
          <span className="flex items-center gap-1">
            <LanguageIcon className="h-4 w-4" />
            {(course.languageAvailable || []).join(", ").toUpperCase()}
          </span>
          <span className="font-black text-brand-600 dark:text-brand-400">
            {course.isPaid ? currency.format(course.price || 0) : "FREE"}
          </span>
        </div>
        <Link
          to={`/student-dashboard/courses/${course._id}`}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:opacity-90 dark:bg-white dark:text-slate-900"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
