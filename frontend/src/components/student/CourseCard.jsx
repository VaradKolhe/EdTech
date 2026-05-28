import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  CheckBadgeIcon,
  StarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { getLocalizedValue } from "../../utils/localize";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CourseCard({ course }) {
  const { effectiveCourseContentLanguage } = useTheme();
  const { t } = useTranslation();
  
  const getVal = (field, fallback = "") =>
    getLocalizedValue(field, effectiveCourseContentLanguage, fallback);

  const title = getVal(course.title, "Untitled course");
  const description = getVal(course.shortDescription) || getVal(course.description) || "No description available.";
  const categoryDisplay = course.categoryId?.name 
    ? getVal(course.categoryId.name) 
    : (typeof course.category === 'string' ? course.category : getVal(course.category, "General"));

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#161b22]">
      <div className="aspect-video bg-slate-100 dark:bg-slate-800">
        {course.thumbnailUrl || course.thumbnail ? (
          <img
            src={course.thumbnailUrl || course.thumbnail}
            alt={title}
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
          <span>{categoryDisplay}</span>
          <span>{course.difficulty}</span>
        </div>
        <h3 className="line-clamp-2 text-lg font-black text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
          <span>{course.instructor?.name || "Instructor"}</span>
          {course.instructor?.isVerified && (
            <CheckBadgeIcon className="h-4 w-4 text-emerald-500 fill-emerald-500/10" title="Verified Instructor" />
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1 text-amber-500">
              <StarIcon className="h-4 w-4 fill-amber-500" />
              <span className="font-black text-slate-700 dark:text-slate-200">
                {Number(course.averageRating || course.rating || 0).toFixed(1)}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <UserGroupIcon className="h-4 w-4" />
              {course.totalEnrollments || 0}
            </span>
          </div>
          <span className="text-sm font-black text-brand-600 dark:text-brand-400">
            {course.isPaid ? currency.format(course.price || 0) : t("course.free")}
          </span>
        </div>
        <Link
          to={`/student-dashboard/courses/${course._id}`}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:opacity-90 dark:bg-white dark:text-slate-900"
        >
          {t("course.details")}
        </Link>
      </div>
    </article>
  );
}
