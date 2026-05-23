import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AcademicCapIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  LanguageIcon,
  StarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import PaymentButton from "../../components/student/PaymentButton";
import RatingModal from "../../components/student/RatingModal";
import RecommendationFeedbackButtons from "../../components/student/RecommendationFeedbackButtons";
import { getCourseRatings, getStudentCourse } from "../../api/studentApi";
import { useTheme } from "../../context/ThemeContext";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CourseDetails() {
  const { language } = useTheme();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getStudentCourse(courseId), getCourseRatings(courseId)])
      .then(([courseRes, ratingsRes]) => {
        setCourse(courseRes.data.course);
        setRatings(ratingsRes.data.ratings || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="py-24 text-center text-slate-500">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="py-24 text-center text-slate-500">Course not found.</div>
      </div>
    );
  }

  const canRate = Boolean(course.enrollment);
  const title = course.title?.[language] || course.title?.en || course.title;
  const description = course.description?.[language] || 
                      course.description?.en || 
                      course.shortDescription?.[language] || 
                      course.shortDescription?.en;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
          <section>
            <div className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={title} className="max-h-[28rem] w-full object-cover" />
              ) : (
                <div className="flex aspect-video items-center justify-center">
                  <AcademicCapIcon className="h-20 w-20 text-brand-600/30" />
                </div>
              )}
            </div>
            <div className="mt-8">
              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                <span>{course.category}</span>
                <span>{course.difficulty}</span>
                <span className="flex items-center gap-1">
                  <LanguageIcon className="h-4 w-4" />
                  {(course.languageAvailable || []).join(", ").toUpperCase()}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">{title}</h1>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                {description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span>By {course.instructor?.name || "Instructor"}</span>
                  {course.instructor?.isVerified && (
                    <CheckBadgeIcon className="h-4 w-4 text-brand-600" title="Verified Instructor" />
                  )}
                </div>
                <span className="flex items-center gap-1">
                  <StarIcon className="h-5 w-5 text-amber-500" />
                  {Number(course.averageRating || 0).toFixed(1)} ({course.totalRatings || 0})
                </span>
              </div>
              {(course.tags?.[language] || course.tags?.en || []).length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {(course.tags[language] || course.tags.en).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <TagIcon className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-black text-slate-900 dark:text-white">Course content</h2>
              <div className="space-y-4">
                {(course.modules || []).map((module) => (
                  <div key={module.moduleId} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#161b22]">
                    <h3 className="font-black text-slate-900 dark:text-white">
                      {module.moduleTitle?.[language] || module.moduleTitle?.en || module.moduleTitle || module.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {module.moduleDescription?.[language] || module.moduleDescription?.en || module.moduleDescription || module.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ratings & reviews</h2>
                {canRate && (
                  <button onClick={() => setRatingOpen(true)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-900">
                    Rate course
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {ratings.length ? ratings.map((item) => (
                  <div key={item._id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#161b22]">
                    <p className="font-bold text-slate-900 dark:text-white">{item.userId?.name || "Student"}</p>
                    <p className="text-sm text-amber-500">{item.rating} / 5</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {item.review?.[language] || item.review?.en || item.review?.hi || item.review?.mr}
                    </p>
                  </div>
                )) : <p className="text-slate-500">No ratings yet.</p>}
              </div>
            </section>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#161b22] lg:sticky lg:top-24">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {course.isPaid ? currency.format(course.price || 0) : "Free"}
            </p>
            <div className="mt-5">
              <PaymentButton course={course} onEnrolled={load} />
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-500">
              <p className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                Lifetime access
              </p>
              <p className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                Multilingual course content
              </p>
            </div>
            {course.enrollment && (
              <Link to={`/student-dashboard/courses/${course._id}/player`} className="mt-5 block text-center text-sm font-bold text-brand-600">
                Open course player
              </Link>
            )}
            <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Recommendation feedback</p>
              <RecommendationFeedbackButtons courseId={course._id} type="SEARCH" />
            </div>
          </aside>
        </div>
      </main>
      <RatingModal courseId={course._id} open={ratingOpen} onClose={() => setRatingOpen(false)} onSaved={load} />
    </div>
  );
}
