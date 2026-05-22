import { useEffect, useState } from "react";
import { getPlatformStats } from "../../api/adminApi";
import StatCard from "../../components/admin/StatCard";

export default function OverviewSection() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlatformStats()
      .then(({ data }) => setStats(data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load stats")
      );
  }, []);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-red-600">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Platform Monitoring
        </h2>
        <p className="text-slate-500">Real-time platform health overview</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={stats?.totalStudents} icon="🎓" />
        <StatCard
          label="Total Teachers"
          value={stats?.totalTeachers}
          icon="👨‍🏫"
          accent="indigo"
        />
        <StatCard
          label="Total Courses"
          value={stats?.totalCourses}
          icon="📚"
          accent="emerald"
        />
        <StatCard
          label="Pending Verifications"
          value={stats?.pendingVerifications}
          icon="⏳"
          accent="amber"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Feedback"
          value={stats?.totalFeedback}
          icon="💬"
        />
        <StatCard
          label="Average Rating"
          value={stats?.averageRating}
          icon="⭐"
          accent="amber"
        />
      </div>
    </div>
  );
}
