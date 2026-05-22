import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getReports } from "../../api/adminApi";
import StatCard from "../../components/admin/StatCard";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export default function ReportsSection() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    getReports().then(({ data }) => setReports(data));
  }, []);

  const userPie = [
    { name: "Students", value: reports?.userCounts?.student ?? 0 },
    { name: "Teachers", value: reports?.userCounts?.teacher ?? 0 },
    { name: "Admins", value: reports?.userCounts?.admin ?? 0 },
  ].filter((d) => d.value > 0);

  const courseBar =
    reports?.courseStats?.map((c) => ({
      name: c._id,
      count: c.count,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Reports & Analytics
        </h2>
        <p className="text-slate-500">Platform-wide visualization</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Students"
          value={reports?.userCounts?.student ?? 0}
          icon="🎓"
        />
        <StatCard
          label="Teachers"
          value={reports?.userCounts?.teacher ?? 0}
          icon="👨‍🏫"
          accent="indigo"
        />
        <StatCard
          label="Avg Feedback"
          value={reports?.feedback?.averageRating}
          icon="⭐"
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 font-semibold">User Distribution</h3>
          {userPie.length === 0 ? (
            <p className="text-slate-500">No user data</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={userPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {userPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 font-semibold">Courses by Category</h3>
          {courseBar.length === 0 ? (
            <p className="text-slate-500">No course data</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={courseBar}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
