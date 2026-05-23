import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitVerification } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Navbar from "../../components/Navbar";

export default function InstructorOnboarding() {
  const { user, persistAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    workEmail: "",
    links: [""],
    files: [],
  });

  const addLink = () => setForm({ ...form, links: [...form.links, ""] });
  const removeLink = (index) => {
    const newLinks = form.links.filter((_, i) => i !== index);
    setForm({ ...form, links: newLinks.length ? newLinks : [""] });
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...form.links];
    newLinks[index] = value;
    setForm({ ...form, links: newLinks });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, files: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("workEmail", form.workEmail);
      form.links.filter(Boolean).forEach((link) => formData.append("links", link));
      form.files.forEach((file) => formData.append("files", file));

      const { data } = await submitVerification(formData);
      persistAuth(data.user);
      navigate("/instructor-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-[#161b22] border border-slate-200 dark:border-slate-800">
          <div className="mb-8 flex items-start justify-between border-b border-slate-100 pb-6 dark:border-slate-800">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Instructor Verification</h1>
              <p className="mt-2 text-slate-500">Submit your credentials and work experience for admin review.</p>
            </div>
            <button 
              onClick={() => navigate("/instructor-dashboard")}
              className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors"
            >
              Skip for now
            </button>
          </div>

          {user.instructorProfile?.verification?.status === "REJECTED" && (
            <div className="mb-8 rounded-2xl bg-rose-50 p-4 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50">
              <p className="text-xs font-black uppercase tracking-widest text-rose-600 mb-1">Rejection Reason</p>
              <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                {user.instructorProfile?.verification?.rejectionReason || "Your application was rejected. Please review your proofs and submit again."}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
            )}

            <section>
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-brand-600">Work Contact</h2>
              <Input
                label="Work Email ID (Optional)"
                placeholder="e.g. name@university.edu"
                value={form.workEmail}
                onChange={(e) => setForm({ ...form, workEmail: e.target.value })}
              />
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-brand-600">Professional Links</h2>
                <button type="button" onClick={addLink} className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:underline">+ Add link</button>
              </div>
              <div className="space-y-4">
                {form.links.map((link, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="https://linkedin.com/in/username"
                        value={link}
                        onChange={(e) => handleLinkChange(idx, e.target.value)}
                      />
                    </div>
                    {form.links.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeLink(idx)}
                        className="mt-7 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:bg-slate-900"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-brand-600">Certification Documents</h2>
              <p className="mb-4 text-xs text-slate-400">Upload certificates, degrees, or experience letters (PDF/JPG/PNG).</p>
              <div className="space-y-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full rounded-2xl border border-dashed border-slate-300 p-8 text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-xs file:font-black file:text-brand-700 hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/50"
                />
                {form.files.length > 0 && (
                  <ul className="space-y-2">
                    {form.files.map((file, i) => (
                      <li key={i} className="text-xs font-bold text-slate-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <div className="pt-6">
              <Button type="submit" className="w-full py-4 text-base font-black uppercase tracking-widest shadow-xl shadow-brand-600/20" disabled={loading}>
                {loading ? "Submitting..." : "Submit for Verification"}
              </Button>
              <p className="mt-4 text-center text-xs text-slate-500">
                You can also skip this and complete it later from your dashboard settings.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
