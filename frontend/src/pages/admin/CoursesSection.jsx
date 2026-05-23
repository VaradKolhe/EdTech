import { useCallback, useEffect, useState } from "react";
import { deleteCourse, getCourses } from "../../api/adminApi";
import Button from "../../components/ui/Button";

export default function CoursesSection() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getCourses({ search });
      setCourses(data.courses || []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("Archive this course?")) return;
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
            Final-schema course list with instructor and category references
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
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Languages</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center">Loading...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center">No courses available.</td></tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id} className="border-b dark:border-slate-700">
                  <td className="px-4 py-3 font-medium">{course.title?.en || "Untitled"}</td>
                  <td className="px-4 py-3">
                    {course.instructorId?.name || "-"}
                    <br />
                    <span className="text-xs text-slate-500">{course.instructorId?.email}</span>
                  </td>
                  <td className="px-4 py-3">{course.categoryId?.name?.en || "-"}</td>
                  <td className="px-4 py-3">{(course.languageAvailable || []).join(", ").toUpperCase()}</td>
                  <td className="px-4 py-3">₹{course.price}</td>
                  <td className="px-4 py-3">{course.status}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(course._id)}>
                      Archive
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
