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
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const [rejectionReason, setRejectionReason] = useState("");

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
    if (status === "REJECTED" && !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    await updateInstructorVerification(id, status, { rejectionReason });
    setSelectedInstructor(null);
    setRejectionReason("");
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
          <p className="text-slate-500">Review proofs and manage instructor access</p>
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
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3">Expertise</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : instructors.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No instructors found</td></tr>
            ) : (
              instructors.map((instructor) => {
                const status = instructor.instructorProfile?.verification?.status || "NOT_APPLIED";
                return (
                  <tr 
                    key={instructor._id} 
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 dark:text-white">{instructor.name}</p>
                      <p className="text-xs text-slate-500">{instructor.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(instructor.instructorProfile?.expertise || []).slice(0, 2).map(exp => (
                          <span key={exp} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold dark:bg-slate-800 uppercase">{exp}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedInstructor(instructor)}
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
                        >
                          Review proofs
                        </button>
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

      {/* Verification Modal */}
      {selectedInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl dark:bg-[#161b22] border border-slate-200 dark:border-slate-800">
            <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6 dark:border-slate-800">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Review Instructor</h3>
                <p className="text-sm text-slate-500">{selectedInstructor.name} ({selectedInstructor.email})</p>
              </div>
              <button onClick={() => setSelectedInstructor(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Work Email</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedInstructor.instructorProfile?.verification?.workEmail || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Submitted On</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedInstructor.instructorProfile?.verification?.submittedAt ? new Date(selectedInstructor.instructorProfile.verification.submittedAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Professional Links</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(selectedInstructor.instructorProfile?.verification?.links || []).length > 0 ? (
                    selectedInstructor.instructorProfile.verification.links.map((link, i) => (
                      <a 
                        key={i} 
                        href={link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="truncate rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-bold text-brand-600 hover:bg-brand-50 dark:border-slate-800 dark:bg-slate-900 dark:text-brand-400 dark:hover:bg-brand-950/20"
                      >
                        {link}
                      </a>
                    ))
                  ) : <p className="text-sm text-slate-500 italic">No links provided</p>}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Verification Documents</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(selectedInstructor.instructorProfile?.verification?.documents || []).length > 0 ? (
                    selectedInstructor.instructorProfile.verification.documents.map((doc, i) => (
                      <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{doc.name}</p>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-black text-brand-600 hover:underline dark:text-brand-400"
                        >
                          View Document
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    ))
                  ) : <p className="text-sm text-slate-500 italic text-center col-span-2">No documents provided</p>}
                </div>
              </div>

              {selectedInstructor.instructorProfile?.verification?.status !== "APPROVED" && (
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Decision Note / Rejection Reason</label>
                    <textarea 
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain your decision (required for rejection)"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleStatus(selectedInstructor._id, "APPROVED")}
                      className="flex-1 rounded-2xl bg-emerald-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                    >
                      Approve Instructor
                    </button>
                    <button 
                      onClick={() => handleStatus(selectedInstructor._id, "REJECTED")}
                      className="flex-1 rounded-2xl bg-rose-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all"
                    >
                      Reject Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
