import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getStudentProfile, updateStudentProfile } from "../../api/studentApi";
import { updateProfile as updateBaseProfile, changePassword } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export default function StudentProfile() {
  const { user, persistAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [options, setOptions] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
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
    const [pRes, oRes] = await Promise.all([
      getStudentProfile(),
      axios.get("/metadata/onboarding-options")
    ]);
    const userData = pRes.data.user;
    setProfile(userData);
    setOptions(oRes.data);
    setForm(userData.profile || {});
    setBaseBaseForm({ name: userData.name });
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const { data } = await updateStudentProfile(form);
      persistAuth({ ...user, profile: data.profile });
      setProfile((prev) => ({ ...prev, profile: data.profile }));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleBaseUpdate = async () => {
    setSaving(true);
    try {
      const { data } = await updateBaseProfile(baseForm);
      persistAuth(data.user);
      setProfile(data.user);
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

  if (!profile || !options) {
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
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Student Profile</h1>
            <p className="mt-2 text-slate-500 font-medium">Manage your account and learning preferences.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
          {/* Sidebar Stats & Basic Info */}
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#161b22] shadow-sm">
              <div className="flex flex-col items-center p-8 text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-[#161b22]">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 text-3xl font-black text-white shadow-xl shadow-brand-600/20">
                  {(profile.name || "S").charAt(0).toUpperCase()}
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
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800">
                <Stat label="Enrolled" value={profile.stats?.totalCoursesEnrolled || 0} />
                <Stat label="Completed" value={profile.stats?.totalCoursesCompleted || 0} border />
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Learning Time</p>
                  <p className="text-xl font-black text-brand-600 uppercase tracking-tighter">{profile.stats?.totalTimeSpentMinutes || 0}m</p>
                </div>
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

          {/* Preferences Section */}
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-[#161b22] shadow-sm">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Learning Preferences</h3>
                  <p className="mt-1 text-slate-500 font-medium italic text-sm">
                    "Improve your personalised course suggestions by keeping these updated."
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (editing) handleUpdate();
                    else setEditing(true);
                  }}
                  disabled={saving}
                  className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    editing
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/20 hover:bg-green-700"
                      : "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700"
                  }`}
                >
                  {saving ? "Saving..." : editing ? "Save Changes" : "Edit Preferences"}
                </button>
              </div>

              <div className="grid gap-8">
                <PreferenceGrid 
                  editing={editing}
                  options={options}
                  form={form}
                  setForm={setForm}
                />
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
      <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}

function PreferenceGrid({ editing, options, form, setForm }) {
  const fields = [
    { key: "ageGroup", label: "Age Group", list: options.ageGroup },
    { key: "educationLevel", label: "Education", list: options.educationLevel },
    { key: "skillLevel", label: "Skill Level", list: options.skillLevel },
    { key: "careerGoal", label: "Career Goal", list: options.careerGoal },
    { key: "budgetPreference", label: "Budget", list: options.budgetPreference },
    { key: "preferredDifficulty", label: "Difficulty", list: options.preferredDifficulty },
    { key: "preferredLanguage", label: "Language", list: options.preferredLanguage },
  ];

  return (
    <div className="grid gap-y-10 gap-x-6 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} className="space-y-4 sm:col-span-2 lg:col-span-1">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">{field.label}</label>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {field.list.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm({ ...form, [field.key]: opt })}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
                    form[field.key] === opt
                      ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="inline-flex rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
              {form[field.key] || "Not set"}
            </div>
          )}
        </div>
      ))}
      
      <div className="sm:col-span-2 space-y-4">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Interested Streams</label>
        <div className="flex flex-wrap gap-2">
          {options.preferredStreams.map((stream) => {
            const isSelected = (form.preferredStreams || []).includes(stream);
            return editing ? (
              <button
                key={stream}
                type="button"
                onClick={() => {
                  const current = form.preferredStreams || [];
                  const next = isSelected 
                    ? current.filter(s => s !== stream)
                    : [...current, stream];
                  setForm({ ...form, preferredStreams: next });
                }}
                className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                }`}
              >
                {stream}
              </button>
            ) : isSelected && (
              <span key={stream} className="rounded-xl bg-brand-50 px-4 py-2.5 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-100 dark:border-brand-900/50">
                {stream}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
