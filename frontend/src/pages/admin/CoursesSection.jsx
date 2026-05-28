import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  archiveCourse, 
  getCourses, 
  getPendingCourses, 
  approveCourse, 
  rejectCourse 
} from "../../api/adminApi";
import Button from "../../components/ui/Button";

export default function CoursesSection() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "pending"

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === "pending") {
        res = await getPendingCourses();
      } else {
        res = await getCourses({ search });
      }
      setCourses(res.data.courses || []);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleApprove = async (id) => {
    if (!confirm("Approve this course? It will move to PAYMENT_PENDING status.")) return;
    try {
      await approveCourse(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await rejectCourse(id, reason);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Rejection failed");
    }
  };

  const handleArchive = async (id) => {
    const reason = prompt("Enter reason for archiving (optional):");
    if (reason === null) return;
    try {
      await archiveCourse(id, reason);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Archive failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">
            Course Management
          </h2>
          <p className="text-slate-500 italic">
            Review, approve, and manage course lifecycles.
          </p>
        </div>
        {activeTab === "all" && (
          <input
            type="search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800 outline-none focus:border-brand-500"
          />
        )}
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === "all" ? "border-b-2 border-brand-600 text-brand-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          All Courses
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === "pending" ? "border-b-2 border-brand-600 text-brand-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Pending Review
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-400">Title</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-400">Instructor</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-400 text-center">Price</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center font-bold text-slate-400 italic">Loading content...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center font-bold text-slate-400 italic">No courses found matching criteria.</td></tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id} className="border-b transition-colors hover:bg-slate-50/30 dark:border-slate-700/50 dark:hover:bg-slate-900/30">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white leading-snug">{course.title?.en || "Untitled"}</p>
                    <p className="mt-1 text-xs text-slate-500 italic">{course.categoryId?.name?.en || "General"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700 dark:text-slate-300">{course.instructorId?.name || "-"}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{course.instructorId?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-brand-600">
                    {course.price > 0 ? `₹${course.price}` : "FREE"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                      course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-600" :
                      course.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-600" :
                      course.status === "PAYMENT_PENDING" ? "bg-blue-100 text-blue-600" :
                      course.status === "REJECTED" ? "bg-rose-100 text-rose-600" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {course.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/student-dashboard/courses/${course._id}`}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        title="View Course Details"
                      >
                        Details
                      </Link>
                      <Link 
                        to={`/student-dashboard/courses/${course._id}/player`}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
                        title="Enter Course Player"
                      >
                        Preview
                      </Link>
                      
                      {activeTab === "pending" && (
                        <>
                          <Button size="xs" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleApprove(course._id)}>
                            Approve
                          </Button>
                          <Button size="xs" variant="danger" onClick={() => handleReject(course._id)}>
                            Reject
                          </Button>
                        </>
                      )}

                      {course.status !== "ARCHIVED" && (
                        <Button size="xs" variant="danger" onClick={() => handleArchive(course._id)}>
                          Archive
                        </Button>
                      )}
                    </div>
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
