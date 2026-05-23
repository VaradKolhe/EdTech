import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BookOpenIcon,
  PlusIcon,
  StarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import api from "../services/api";
import Navbar from "../components/Navbar";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ courses: 0, enrollments: 0, averageRating: "0.0" });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    shortDescription: "",
    difficulty: "Beginner",
    price: 0,
    languageAvailable: ["en"],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/instructor/courses"), api.get("/instructor/stats")])
      .then(([coursesRes, statsRes]) => {
        setCourses(coursesRes.data);
        setStats(statsRes.data);
      })
      .catch(() => setError("Could not load instructor workspace."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/instructor/courses", {
        title: { en: form.title },
        description: { en: form.description },
        shortDescription: { en: form.shortDescription || form.description },
        difficulty: form.difficulty,
        price: Number(form.price || 0),
        languageAvailable: form.languageAvailable,
        status: "DRAFT",
        modules: [],
      });
      setShowForm(false);
      navigate(`/instructor-dashboard/courses/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">
              Instructor Workspace
            </h1>
            <p className="mt-2 text-slate-500">Manage courses, content, and learner outcomes.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white"
          >
            <PlusIcon className="h-5 w-5" />
            New course
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat icon={BookOpenIcon} label="Courses" value={stats.courses} />
          <Stat icon={UserGroupIcon} label="Enrollments" value={stats.enrollments} />
          <Stat icon={StarIcon} label="Average rating" value={stats.averageRating} />
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#161b22]"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Course title"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                required
              />
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Course description"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white md:col-span-2"
                rows={3}
              />
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <select
                value={form.languageAvailable[0]}
                onChange={(e) => setForm({ ...form, languageAvailable: [e.target.value] })}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </select>
            </div>
            {error && <p className="mt-4 text-sm font-bold text-rose-600">{error}</p>}
            <div className="mt-5 flex gap-3">
              <button disabled={saving} className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
                {saving ? "Creating..." : "Create"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 dark:bg-slate-800">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
            No instructor courses yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article key={course._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#161b22]">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title?.en} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <AcademicCapIcon className="h-14 w-14 text-brand-600/30" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>{course.status}</span>
                    <span>{course.price > 0 ? currency.format(course.price) : "FREE"}</span>
                  </div>
                  <h2 className="line-clamp-2 text-lg font-black text-slate-900 dark:text-white">
                    {course.title?.en || "Untitled course"}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {course.shortDescription?.en || course.description?.en || "No description yet."}
                  </p>
                  <button
                    onClick={() => navigate(`/instructor-dashboard/courses/${course._id}`)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-900"
                  >
                    Open course
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
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
