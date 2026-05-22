import { useCallback, useEffect, useState } from "react";
import { getCourses, deleteCourse } from "../../api/adminApi";
import Button from "../../components/ui/Button";

export default function CoursesSection() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getCourses({ search });
      setCourses(data.courses);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("Remove this course?")) return;
    await deleteCourse(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Course Management
          </h2>
          <p className="text-slate-500">
            Modular course list — integrates with Teacher-Dashboard branch later
          </p>
        </div>
        <input
          type="search"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Teacher</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  No courses. Run <code className="text-xs">npm run seed:demo</code>{" "}
                  in backend for sample data.
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c._id} className="border-b dark:border-slate-700">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3">
                    {c.teacher?.fullName || "—"}
                    <br />
                    <span className="text-xs text-slate-500">
                      {c.teacher?.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3">{c.language}</td>
                  <td className="px-4 py-3">${c.price}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(c._id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
