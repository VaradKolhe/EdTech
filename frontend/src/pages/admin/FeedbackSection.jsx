import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getFeedbackAnalytics } from "../../api/adminApi";
import StatCard from "../../components/admin/StatCard";

export default function FeedbackSection() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getFeedbackAnalytics().then(({ data: d }) => setData(d));
  }, []);

  const chartData =
    data?.courseWiseRatings?.map((c) => ({
      name: c.courseTitle?.slice(0, 18) || "Course",
      rating: c.averageRating,
      count: c.count,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Feedback Analytics
        </h2>
        <p className="text-slate-500">Course ratings and feedback overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Average Course Rating"
          value={data?.averageRating}
          icon="⭐"
        />
        <StatCard
          label="Total Feedback"
          value={data?.totalFeedback}
          icon="💬"
          accent="indigo"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
          Course-wise Ratings
        </h3>
        {chartData.length === 0 ? (
          <p className="text-slate-500">No feedback data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="rating" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Avg Rating</th>
              <th className="px-4 py-3">Count</th>
            </tr>
          </thead>
          <tbody>
            {(data?.courseWiseRatings ?? []).map((row) => (
              <tr key={row.courseId} className="border-b dark:border-slate-700">
                <td className="px-4 py-3">{row.courseTitle}</td>
                <td className="px-4 py-3">{row.averageRating}</td>
                <td className="px-4 py-3">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
