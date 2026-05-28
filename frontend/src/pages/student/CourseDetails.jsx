import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import PaymentButton from "../../components/student/PaymentButton";
import RatingModal from "../../components/student/RatingModal";
import RecommendationFeedbackButtons from "../../components/student/RecommendationFeedbackButtons";
import CourseCard from "../../components/student/CourseCard";
import CourseContentLanguageSwitcher from "../../components/ui/CourseContentLanguageSwitcher";
import {
  getCourseRatings,
  getStudentCourse,
  getSimilarCourses,
} from "../../api/studentApi";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { AcademicCapIcon, CheckBadgeIcon, LanguageIcon, StarIcon } from "@heroicons/react/24/outline";
import { getLocalizedValue } from "../../utils/localize";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CourseDetails() {
  const { effectiveCourseContentLanguage } = useTheme();
  const { t } = useTranslation();
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [similarCourses, setSimilarCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getStudentCourse(courseId, { language: effectiveCourseContentLanguage }),
      getCourseRatings(courseId),
      getSimilarCourses(courseId, { language: effectiveCourseContentLanguage }),
    ])
      .then(([courseRes, ratingsRes, similarRes]) => {
        setCourse({ ...courseRes.data.course, access: courseRes.data.access });
        setRatings(ratingsRes.data.ratings || []);
        setSimilarCourses(similarRes.data.recommendations || []);
      })
      .finally(() => setLoading(false));
  }, [courseId, effectiveCourseContentLanguage]);

  useEffect(load, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="py-24 text-center text-slate-500">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="py-24 text-center text-slate-500">
          Course not found.
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const isInstructor = String(course.instructor?._id) === String(user?._id);

  const canPreview = course.access?.canAccessContent || isAdmin || isInstructor;
  const canRate = Boolean(course.enrollment);

  // Dynamic content helpers (Backend should ideally return strings, but we handle objects for robustness)
  const getVal = (field, fallback = "") =>
    getLocalizedValue(field, effectiveCourseContentLanguage, fallback);

  const title = getVal(course.title, "Untitled course");
  const description =
    getVal(course.description) || getVal(course.shortDescription);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {canPreview && (
          <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-600 dark:text-amber-400">
            <p className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <CheckBadgeIcon className="h-5 w-5" />
              {course.access?.isAdminPreview
                ? "Admin Preview Mode"
                : "Instructor Preview Mode"}
            </p>
            <p className="text-xs mt-1 opacity-80">
              You have full access to this course content for review purposes.
            </p>
          </div>
        )}
        <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
          <section>
            <div className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={title}
                  className="max-h-[28rem] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center">
                  <AcademicCapIcon className="h-20 w-20 text-brand-600/30" />
                </div>
              )}
            </div>
            <div className="mt-8">
              <div className="mb-5 flex justify-end">
                <CourseContentLanguageSwitcher />
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                <span>{course.category}</span>
                <span>{course.difficulty}</span>
                <span className="flex items-center gap-1">
                  <LanguageIcon className="h-4 w-4" />
                  {(course.languageAvailable || []).join(", ").toUpperCase()}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">
                {title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                {description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span>By {course.instructor?.name || "Instructor"}</span>
                  {course.instructor?.isVerified && (
                    <CheckBadgeIcon
                      className="h-4 w-4 text-emerald-500 fill-emerald-500/10"
                      title="Verified Instructor"
                    />
                  )}
                </div>
                <span className="flex items-center gap-1">
                  <StarIcon className="h-5 w-5 text-amber-500" />
                  {Number(course.averageRating || 0).toFixed(1)} (
                  {course.totalRatings || 0})
                </span>
              </div>
            </div>

            <section className="mt-12">
              <h2 className="mb-6 text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {t("course.curriculum")}
              </h2>
              <div className="space-y-4">
                {(course.modules || []).map((module, idx) => (
                  <div
                    key={module.moduleId || idx}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#161b22] shadow-sm"
                  >
                    <div className="bg-slate-50/50 px-6 py-4 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-600 text-[10px] font-black text-white">
                          {idx + 1}
                        </span>
                        <h3 className="font-black text-slate-900 dark:text-white">
                          {getVal(module.moduleTitle || module.title)}
                        </h3>
                      </div>
                      {getVal(module.moduleDescription || module.description) && (
                        <p className="mt-1 ml-9 text-xs text-slate-500 font-medium">
                          {getVal(module.moduleDescription || module.description)}
                        </p>
                      )}
                    </div>
                    <div className="px-6 py-3">
                      {(module.submodules || []).map((sub, sIdx) => (
                        <div key={sub.submoduleId || sIdx} className="flex items-center gap-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 border-b last:border-0 border-slate-50 dark:border-slate-800/50">
                          <CheckBadgeIcon className="h-4 w-4 text-slate-300" />
                          <span className="font-bold flex-1">{getVal(sub.submoduleTitle || sub.title)}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {sub.contentBlocks?.length || 0} Blocks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {similarCourses.length > 0 && (
              <section className="mt-16">
                <h2 className="mb-6 text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {t("course.similarCourses")}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {similarCourses.map((rec) => (
                    <CourseCard key={rec.courseId || rec._id} course={rec} />
                  ))}
                </div>
              </section>
            )}

            <section className="mt-16">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Ratings & reviews
                </h2>
                {canRate && (
                  <button
                    onClick={() => setRatingOpen(true)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-900"
                  >
                    Rate course
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {ratings.length ? (
                  ratings.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#161b22]"
                    >
                      <p className="font-bold text-slate-900 dark:text-white">
                        {item.userId?.name || "Student"}
                      </p>
                      <p className="text-sm text-amber-500">
                        {item.rating} / 5
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {getVal(item.review)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No ratings yet.</p>
                )}
              </div>
            </section>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#161b22] lg:sticky lg:top-24">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {course.isPaid
                ? currency.format(course.price || 0)
                : t("course.free")}
            </p>
            <div className="mt-5">
              <PaymentButton course={course} onEnrolled={load} />
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                Recommendation feedback
              </p>
              <RecommendationFeedbackButtons
                courseId={course._id}
                type="SEARCH"
              />
            </div>
          </aside>
        </div>
      </main>
      <RatingModal
        courseId={course._id}
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
