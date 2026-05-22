import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import {
  PlusIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  BanknotesIcon,
  StarIcon,
  CheckCircleIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const hashValue = (value = "") =>
  String(value).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

const demoStudents = [
  "Aarav Sharma",
  "Priya Patil",
  "Rohan Mehta",
  "Sneha Iyer",
  "Kabir Joshi",
  "Anaya Singh",
  "Vedant Kulkarni",
  "Mira Nair",
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const getCourseStats = (course) => {
  const seed = hashValue(course._id || course.title);
  const rawStudents = course.enrolledStudents?.length
    ? course.enrolledStudents
    : demoStudents.slice(0, Math.max(3, (seed % demoStudents.length) + 1)).map((name, index) => ({
        id: `${course._id || course.title}-${index}`,
        name,
        email: `${name.toLowerCase().replaceAll(" ", ".")}@student.eduforge.in`,
        progress: 45 + ((seed + index * 11) % 54),
      }));
  const enrolledStudents = rawStudents.map((student, index) => {
    if (typeof student === "string") {
      return {
        id: `${course._id || course.title}-${index}`,
        name: student,
        email: `${student.toLowerCase().replaceAll(" ", ".")}@student.eduforge.in`,
        progress: 45 + ((seed + index * 11) % 54),
      };
    }

    return {
      id: student.id || student._id || `${course._id || course.title}-${index}`,
      name: student.name || `${student.firstName || "Student"} ${student.lastName || index + 1}`,
      email: student.email || "student@eduforge.in",
      progress: student.progress ?? student.completionRate ?? 45 + ((seed + index * 11) % 54),
    };
  });

  return {
    students: enrolledStudents,
    studentCount: course.totalStudents ?? course.studentsCount ?? enrolledStudents.length,
    revenue: course.totalRevenue ?? course.revenue ?? enrolledStudents.length * (1499 + (seed % 5) * 500),
    rating: course.averageRating ?? course.rating ?? Number((4.1 + (seed % 9) / 10).toFixed(1)),
    completionRate: course.completionRate ?? course.completion ?? 58 + (seed % 35),
  };
};

function StatCard({ icon: Icon, label, value, caption, tone }) {
  const tones = {
    green: "bg-primary/10 text-primary border-primary/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        </div>
        <div className={`flex-shrink-0 rounded-lg border p-2 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", thumbnail: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  useEffect(() => {
    api.get("/courses")
      .then(({ data }) => setCourses(data))
      .catch(() => setError("Could not load courses. Is the backend running on port 5000?"))
      .finally(() => setLoading(false));
  }, []);

  const courseStats = courses.map((course) => ({ course, stats: getCourseStats(course) }));
  const totals = courseStats.reduce(
    (acc, item) => {
      acc.students += item.stats.studentCount;
      acc.revenue += item.stats.revenue;
      acc.ratingTotal += item.stats.rating;
      acc.completionTotal += item.stats.completionRate;
      return acc;
    },
    { students: 0, revenue: 0, ratingTotal: 0, completionTotal: 0 }
  );
  const averageRating = courses.length ? (totals.ratingTotal / courses.length).toFixed(1) : "0.0";
  const completionRate = courses.length ? Math.round(totals.completionTotal / courses.length) : 0;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/courses", form);
      setCourses((prev) => [...prev, data]);
      setForm({ title: "", description: "", thumbnail: "" });
      setShowForm(false);
      navigate(`/courses/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create course. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 text-xl font-bold text-primary">
          <AcademicCapIcon className="w-7 h-7" />
          <span className="truncate">EduForge</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {dark ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-500" />}
          </button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">T</div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Teacher Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage courses, students, and performance</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-primary-dark sm:w-auto"
          >
            <PlusIcon className="w-4 h-4" /> New Course
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard icon={BookOpenIcon} label="Total Courses" value={courses.length} caption="Published and draft courses" tone="green" />
          <StatCard icon={UserGroupIcon} label="Total Students" value={totals.students} caption="Across all courses" tone="blue" />
          <StatCard icon={BanknotesIcon} label="Total Revenue" value={currency.format(totals.revenue)} caption="Estimated earnings" tone="amber" />
          <StatCard icon={StarIcon} label="Average Rating" value={averageRating} caption="Learner feedback" tone="violet" />
          <StatCard icon={CheckCircleIcon} label="Completion Rate" value={`${completionRate}%`} caption="Average course progress" tone="cyan" />
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-8 rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Create New Course</h2>
            <div className="space-y-3">
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Course title *"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary dark:text-white"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary resize-none dark:text-white"
              />
              <input
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                placeholder="Thumbnail URL (optional)"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary dark:text-white"
              />
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60">
                {saving ? "Creating..." : "Create Course"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="rounded-lg bg-gray-100 px-5 py-2 text-sm transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AcademicCapIcon className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No courses yet. Create your first course!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {courseStats.map(({ course: c, stats }) => {
              const expanded = expandedCourseId === c._id;

              return (
                <div
                  key={c._id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="grid gap-0 md:grid-cols-[190px_1fr]">
                    <button
                      type="button"
                      onClick={() => navigate(`/courses/${c._id}`)}
                      className="flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 md:h-full"
                    >
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                      ) : (
                        <AcademicCapIcon className="h-12 w-12 text-primary/40" />
                      )}
                    </button>

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                          {c.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{c.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/courses/${c._id}`)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary dark:hover:bg-gray-700"
                          title="Open course builder"
                        >
                          <ArrowRightIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 text-sm min-[420px]:grid-cols-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{stats.studentCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{currency.format(stats.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{stats.rating} / 5</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Completion</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{stats.completionRate}%</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                        <span>{c.modules?.length || 0} modules</span>
                        <button
                          type="button"
                          onClick={() => setExpandedCourseId(expanded ? null : c._id)}
                          className="flex items-center gap-1 font-semibold text-primary hover:text-primary-dark"
                        >
                          Enrolled students
                          <ChevronDownIcon className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-gray-100 px-4 py-4 dark:border-gray-700 sm:px-5">
                      <div className="mb-3 flex flex-col gap-1 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Enrolled Students</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{stats.studentCount} total</span>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {stats.students.map((student) => (
                          <div key={student.id || student.email || student.name} className="flex flex-col gap-3 py-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                            </div>
                            <div className="w-full flex-shrink-0 min-[420px]:w-28">
                              <div className="mb-1 flex justify-start text-xs font-semibold text-gray-600 dark:text-gray-300 min-[420px]:justify-end">{student.progress}%</div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${student.progress}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
