import { useCallback, useEffect, useState } from "react";
import { getStudents, deleteStudent, getUserProfile } from "../../api/adminApi";
import Button from "../../components/ui/Button";
import UserDetailModal from "../../components/admin/UserDetailModal";

export default function StudentsSection() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getStudents({ search });
      setStudents(data.students);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleRowClick = async (id) => {
    setLoadingProfile(true);
    try {
      const { data } = await getUserProfile(id);
      setSelectedUser(data);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Remove this student?")) return;
    await deleteStudent(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Student Management
          </h2>
          <p className="text-slate-500">Search, view, and remove students</p>
        </div>
        <div className="flex items-center gap-3">
          {loadingProfile && <span className="text-xs font-bold text-brand-600 animate-pulse uppercase tracking-widest">Fetching profile...</span>}
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Enrolled Courses</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  Loading...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr 
                  key={s._id} 
                  className="group border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(s._id)}
                >
                  <td className="px-4 py-3 font-medium group-hover:text-brand-600">{s.name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.enrolledCourseCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => handleDelete(e, s._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserDetailModal 
          user={selectedUser.user} 
          courses={selectedUser.courses} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
}
