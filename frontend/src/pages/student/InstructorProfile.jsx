import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { updateProfile as updateBaseProfile, changePassword } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { PencilSquareIcon, BookOpenIcon, UserGroupIcon, StarIcon } from "@heroicons/react/24/outline";

export default function InstructorProfile() {
  const { user, persistAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ courses: 0, enrollments: 0, averageRating: "0.0" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Base info editing
  const [baseForm, setBaseBaseForm] = useState({ name: "" });
  const [isEditingBase, setIsEditingBase] = useState(false);
  
  // Password change
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes] = await Promise.all([
        api.get("/instructor/stats")
      ]);
      setProfile(user);
      setStats(statsRes.data);
      setBaseBaseForm({ name: user.name });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleBaseUpdate = async () => {
    setSaving(true);
    try {
      const { data } = await updateBaseProfile(baseForm);
      persistAuth(data.user);
      setIsEditingBase(false);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwError("Passwords do not match");
    }
    setChangingPw(true);
    setPwError("");
    setPwSuccess("");
    try {
      await changePassword({ 
        currentPassword: pwForm.currentPassword, 
        newPassword: pwForm.newPassword 
      });
      setPwSuccess("Password updated successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="p-20 text-center text-slate-500 font-bold animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Instructor Profile</h1>
            <p className="mt-2 text-slate-500 font-medium">Manage your professional account and credentials.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
          {/* Sidebar Stats & Basic Info */}
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#161b22] shadow-sm">
              <div className="flex flex-col items-center p-8 text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-[#161b22]">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-brand-600 text-3xl font-black text-white shadow-xl shadow-brand-600/20">
                  {(profile.name || "I").charAt(0).toUpperCase()}
                </div>
                {isEditingBase ? (
                  <div className="mt-4 w-full space-y-3">
                    <input 
                      value={baseForm.name}
                      onChange={(e) => setBaseBaseForm({ name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-bold outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={handleBaseUpdate} disabled={saving}>Save</Button>
                      <Button size="sm" variant="secondary" className="flex-1" onClick={() => setIsEditingBase(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {profile.name}
                      <button onClick={() => setIsEditingBase(true)} className="text-slate-400 hover:text-brand-600 transition-colors">
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                    </h2>
                    <p className="text-sm font-medium text-slate-500">{profile.email}</p>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      Verified Instructor
                    </span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-800">
                <Stat label="Courses" value={stats.courses} />
                <Stat label="Students" value={stats.enrollments} border />
                <Stat label="Rating" value={stats.averageRating} border />
              </div>
            </div>

            {/* Security Section in Sidebar */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#161b22] shadow-sm">
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400">Security</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input 
                  type="password"
                  placeholder="Current password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="!py-2 !text-xs"
                />
                <Input 
                  type="password"
                  placeholder="New password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="!py-2 !text-xs"
                />
                <Input 
                  type="password"
                  placeholder="Confirm new password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className="!py-2 !text-xs"
                />
                {pwError && <p className="text-[10px] font-bold text-rose-600">{pwError}</p>}
                {pwSuccess && <p className="text-[10px] font-bold text-emerald-600">{pwSuccess}</p>}
                <Button type="submit" size="sm" className="w-full" disabled={changingPw}>
                  {changingPw ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          </aside>

          {/* Details Section */}
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-[#161b22] shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Expertise & Bio</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Expertise</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.instructorProfile?.expertise?.map((exp) => (
                      <span key={exp} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 dark:bg-brand-900/20 dark:text-brand-400">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Biography</label>
                  <div className="mt-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                      "{profile.instructorProfile?.bio?.en || "No biography provided yet."}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-[#161b22] shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 text-center">Platform Impact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="rounded-2xl border border-slate-100 p-6 dark:border-slate-800 text-center">
                    <UserGroupIcon className="h-8 w-8 mx-auto text-brand-600 mb-2" />
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.enrollments}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Learners Impacted</p>
                 </div>
                 <div className="rounded-2xl border border-slate-100 p-6 dark:border-slate-800 text-center">
                    <StarIcon className="h-8 w-8 mx-auto text-brand-600 mb-2" />
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.averageRating}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average Satisfaction</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, border }) {
  return (
    <div className={`p-4 text-center ${border ? "border-l border-slate-100 dark:border-slate-800" : ""}`}>
      <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{value}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}
