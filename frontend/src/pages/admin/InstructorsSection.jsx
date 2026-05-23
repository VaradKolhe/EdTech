import { useEffect, useState } from "react";
import { deleteInstructor, getInstructors, getUserProfile } from "../../api/adminApi";
import Button from "../../components/ui/Button";
import UserDetailModal from "../../components/admin/UserDetailModal";

export default function InstructorsSection() {
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getInstructors({ search });
      setInstructors(data.instructors || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRowClick = async (id) => {
    setLoadingProfile(true);
    try {
      const { data } = await getUserProfile(id);
      setSelectedUser(data);
    } finally {
      setLoadingProfile(false);
    }
  };

  const remove = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Remove this instructor?")) return;
    await deleteInstructor(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Instructor Management
          </h2>
          <p className="text-slate-500">View and manage platform instructors</p>
        </div>
        <div className="flex items-center gap-3">
          {loadingProfile && <span className="text-xs font-bold text-brand-600 animate-pulse uppercase tracking-widest">Fetching profile...</span>}
          <input
            type="search"
            placeholder="Search instructors..."
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
              <th className="px-4 py-3">Expertise</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center">Loading...</td></tr>
            ) : instructors.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center">No instructors found</td></tr>
            ) : (
              instructors.map((instructor) => (
                <tr 
                  key={instructor._id} 
                  className="group border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(instructor._id)}
                >
                  <td className="px-4 py-3 font-medium group-hover:text-brand-600">{instructor.name}</td>
                  <td className="px-4 py-3">{instructor.email}</td>
                  <td className="px-4 py-3">
                    {instructor.instructorProfile?.expertise?.slice(0, 2).join(", ") || "-"}
                    {(instructor.instructorProfile?.expertise?.length || 0) > 2 && "..."}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                        instructor.instructorProfile?.verification?.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {instructor.instructorProfile?.verification?.status || "NOT_APPLIED"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="danger" onClick={(e) => remove(e, instructor._id)}>
                      Remove
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
