import { Link } from "react-router-dom";
import { AcademicCapIcon, LanguageIcon } from "@heroicons/react/24/outline";
import ProgressBar from "./ProgressBar";

export default function EnrolledCourseCard({ course }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#161b22]">
      <div className="grid gap-5 p-5 sm:grid-cols-[13rem_1fr]">
        <div className="aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:aspect-[4/3]">
          {course.thumbnailUrl || course.thumbnail ? (
            <img
              src={course.thumbnailUrl || course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <AcademicCapIcon className="h-12 w-12 text-brand-600/30" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <span>{course.displayStatus || (course.enrollmentStatus === "COMPLETED" ? "Completed" : "Enrolled")}</span>
            <span>{course.difficulty}</span>
            <span className="flex items-center gap-1">
              <LanguageIcon className="h-4 w-4" />
              {(course.languageAvailable || []).join(", ").toUpperCase()}
            </span>
          </div>
          <h3 className="mt-2 line-clamp-2 text-xl font-black text-slate-900 dark:text-white">
            {course.title}
          </h3>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            {course.instructor?.name || "Instructor"} · {course.category || "General"}
          </p>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Progress</span>
              <span>{course.progress ?? course.enrollment?.progressPercentage ?? 0}%</span>
            </div>
            <ProgressBar value={course.progress ?? course.enrollment?.progressPercentage ?? 0} />
          </div>
          <Link
            to={`/student-dashboard/courses/${course._id}/player`}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700 sm:w-fit"
          >
            Continue Learning
          </Link>
        </div>
      </div>
    </article>
  );
}
