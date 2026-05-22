import { useCallback, useEffect, useState } from "react";
import {
  getTeachers,
  updateTeacherVerification,
  deleteTeacher,
} from "../../api/adminApi";
import Button from "../../components/ui/Button";

const STATUS_BADGE = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function VerificationSection() {
  const [teachers, setTeachers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getTeachers({ status: statusFilter });
      setTeachers(data.teachers);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (id, status) => {
    await updateTeacherVerification(id, status);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this teacher?")) return;
    await deleteTeacher(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Teacher Verification
          </h2>
          <p className="text-slate-500">Approve, reject, or remove instructors</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Qualification</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No teachers found
                </td>
              </tr>
            ) : (
              teachers.map((t) => (
                <tr
                  key={t._id}
                  className="border-b border-slate-100 dark:border-slate-700"
                >
                  <td className="px-4 py-3 font-medium">{t.fullName}</td>
                  <td className="px-4 py-3">{t.email}</td>
                  <td className="px-4 py-3">{t.qualification || "—"}</td>
                  <td className="px-4 py-3">{t.yearsOfExperience ?? "—"} yrs</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[t.verificationStatus]}`}
                    >
                      {t.verificationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatus(t._id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatus(t._id, "rejected")}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(t._id)}
                      >
                        Delete
                      </Button>
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
