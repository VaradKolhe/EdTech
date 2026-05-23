import { useCallback, useEffect, useState } from "react";
import {
  deleteInstructor,
  getInstructors,
  updateInstructorVerification,
} from "../../api/adminApi";
import Button from "../../components/ui/Button";

const STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  NOT_APPLIED: "bg-slate-100 text-slate-800",
};

export default function VerificationSection() {
  const [instructors, setInstructors] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getInstructors({ status: statusFilter });
      setInstructors(data.instructors || []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (id, status) => {
    await updateInstructorVerification(id, status);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this instructor?")) return;
    await deleteInstructor(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Instructor Verification
          </h2>
          <p className="text-slate-500">Approve, reject, or remove instructors</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
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
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : instructors.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No instructors found</td></tr>
            ) : (
              instructors.map((instructor) => {
                const status = instructor.instructorProfile?.verification?.status || "NOT_APPLIED";
                return (
                  <tr key={instructor._id} className="border-b border-slate-100 dark:border-slate-700">
                    <td className="px-4 py-3 font-medium">{instructor.name}</td>
                    <td className="px-4 py-3">{instructor.email}</td>
                    <td className="px-4 py-3">{instructor.instructorProfile?.expertise?.join(", ") || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => handleStatus(instructor._id, "APPROVED")}>Approve</Button>
                        <Button size="sm" variant="secondary" onClick={() => handleStatus(instructor._id, "REJECTED")}>Reject</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(instructor._id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
