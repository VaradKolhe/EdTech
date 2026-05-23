import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getStudentProfile } from "../../api/studentApi";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getStudentProfile().then(({ data }) => setProfile(data.user));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Profile</h1>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#161b22]">
          {!profile ? (
            <p className="text-slate-500">Loading profile...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-[10rem_1fr]">
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-brand-600 text-4xl font-black text-white">
                {(profile.name || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{profile.name}</h2>
                <p className="mt-1 text-slate-500">{profile.email}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <Stat label="Enrolled" value={profile.stats?.totalCoursesEnrolled || 0} />
                  <Stat label="Completed" value={profile.stats?.totalCoursesCompleted || 0} />
                  <Stat label="Minutes" value={profile.stats?.totalTimeSpentMinutes || 0} />
                </div>
                <div className="mt-6 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                  <p>Preferred language: {profile.profile?.preferredLanguage || "en"}</p>
                  <p>Skill level: {profile.profile?.skillLevel || "Not set"}</p>
                  <p>Budget: {profile.profile?.budgetPreference || "Both"}</p>
                  <p>Career goal: {profile.profile?.careerGoal || "Not set"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
      <p className="text-2xl font-black text-brand-600 dark:text-brand-400">{value}</p>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}
