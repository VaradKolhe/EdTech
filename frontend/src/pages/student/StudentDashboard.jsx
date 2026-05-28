import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpenIcon,
  SparklesIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import CourseCard from "../../components/student/CourseCard";
import EnrolledCourseCard from "../../components/student/EnrolledCourseCard";
import ProgressBar from "../../components/student/ProgressBar";
import RecommendationFeedbackButtons from "../../components/student/RecommendationFeedbackButtons";
import { getStudentDashboard } from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState({
    enrolledCourses: [],
    continueLearning: [],
    recommendations: [],
    recentActivity: [],
    stats: { enrolledCount: 0, completedCount: 0, overallProgress: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDashboard()
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="py-24 text-center text-slate-500">{t("dashboard.preparingDashboard")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              {t("dashboard.studentDashboard")}
            </p>
            <h1 className="mt-2 text-4xl font-black text-slate-900 dark:text-white">
              {t("dashboard.welcome", { name: (user?.name || "Learner").split(" ")[0] })}
            </h1>
            <p className="mt-2 text-slate-500">{t("dashboard.heroSubtitle") || "Continue learning and discover courses matched to your profile."}</p>
          </div>
          <Link to="/student-dashboard/browse" className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white">
            {t("dashboard.browseCourses")}
          </Link>
        </header>

        <div className="mb-10 grid gap-5 sm:grid-cols-3">
          <Stat icon={BookOpenIcon} label={t("dashboard.enrolled")} value={data.stats.enrolledCount} />
          <Stat icon={TrophyIcon} label={t("dashboard.completed")} value={data.stats.completedCount} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#161b22]">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{t("dashboard.overallProgress")}</p>
            <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{data.stats.overallProgress}%</p>
            <ProgressBar value={data.stats.overallProgress} className="mt-4" />
          </div>
        </div>

        <section className="mb-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t("dashboard.continueLearning")}</h2>
            <Link to="/student-dashboard/my-courses" className="text-sm font-bold text-brand-600">{t("common.viewAll")}</Link>
          </div>
          {data.continueLearning.length ? (
            <div className="grid gap-5">
              {data.continueLearning.slice(0, 3).map((course) => (
                <EnrolledCourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
              {t("dashboard.noActiveCourses")}
            </div>
          )}
        </section>

        <section className="mb-12">
          <div className="mb-5 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-brand-600" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t("dashboard.recommendedCourses")}</h2>
          </div>
          {data.recommendations.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {data.recommendations.slice(0, 6).map((course) => (
                <div key={course._id} className="relative">
                  <CourseCard course={course} />
                  <div className="absolute right-3 top-3 rounded-xl bg-white/90 p-1 shadow-sm dark:bg-slate-900/90">
                    <RecommendationFeedbackButtons courseId={course._id} type="DASHBOARD" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
              {t("dashboard.noRecommendations") || "Recommendations will appear after more courses are published."}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-5 text-2xl font-black text-slate-900 dark:text-white">{t("dashboard.recentActivity") || "Recent activity"}</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#161b22]">
            {data.recentActivity?.length ? (
              <div className="space-y-3">
                {data.recentActivity.map((activity) => (
                  <div key={activity._id} className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{activity.activityType}</span>
                    <span className="text-slate-500">{new Date(activity.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">{t("dashboard.noActivity") || "No activity recorded yet."}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#161b22]">
      <Icon className="h-7 w-7 text-brand-600" />
      <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}
