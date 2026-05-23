import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { updateProfile as updateBaseProfile, changePassword } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { PencilSquareIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function AdminProfile() {
  const { user, persistAuth } = useAuth();
  const [profile, setProfile] = useState(null);
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

  useEffect(() => {
    if (user) {
      setProfile(user);
      setBaseBaseForm({ name: user.name });
      setLoading(false);
    }
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

  if (loading || !profile) {
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
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Admin Profile</h1>
            <p className="mt-2 text-slate-500 font-medium">Platform control and security management.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#161b22] shadow-sm">
              <div className="flex flex-col items-center p-8 text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-[#161b22]">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-3xl font-black text-white shadow-xl">
                  {(profile.name || "A").charAt(0).toUpperCase()}
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
                    <div className="mt-4 flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                      <ShieldCheckIcon className="h-3 w-3" />
                      System Admin
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Security Section */}
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
            <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-[#161b22] shadow-sm text-center py-20">
               <ShieldCheckIcon className="h-16 w-16 mx-auto text-slate-300 mb-4" />
               <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Administration</h3>
               <p className="mt-2 text-slate-500 max-w-md mx-auto">
                 You have full access to manage students, instructors, and content translations. Use the Admin Dashboard for operational tasks.
               </p>
               <Button className="mt-8 px-10" onClick={() => window.location.href = "/admin-dashboard"}>
                 Go to Admin Panel
               </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
