import { useEffect, useState } from "react";
import { deleteInstructor, getInstructors } from "../../api/adminApi";
import Button from "../../components/ui/Button";

export default function InstructorsSection() {
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  const remove = async (id) => {
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
          <p className="text-slate-500">View and remove instructors</p>
        </div>
        <input
          type="search"
          placeholder="Search instructors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
        />
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
                <tr key={instructor._id} className="border-b dark:border-slate-700">
                  <td className="px-4 py-3 font-medium">{instructor.name}</td>
                  <td className="px-4 py-3">{instructor.email}</td>
                  <td className="px-4 py-3">{instructor.instructorProfile?.expertise?.join(", ") || "-"}</td>
                  <td className="px-4 py-3">{instructor.instructorProfile?.verification?.status || "NOT_APPLIED"}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="danger" onClick={() => remove(instructor._id)}>
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
