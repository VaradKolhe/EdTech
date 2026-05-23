import Button from "../ui/Button";

export default function UserDetailModal({ user, courses, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#161b22]">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Full Profile: {user.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <Section label="Basic Info">
                <Info label="Email" value={user.email} />
                <Info label="Role" value={user.role} />
                <Info label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
                <Info label="Status" value={user.isActive ? "Active" : "Inactive"} />
              </Section>

              {user.role === "student" && (
                <Section label="Learning Stats">
                  <Info label="Enrolled" value={user.stats?.totalCoursesEnrolled} />
                  <Info label="Completed" value={user.stats?.totalCoursesCompleted} />
                  <Info label="Minutes spent" value={user.stats?.totalTimeSpentMinutes} />
                </Section>
              )}
            </div>

            <div className="space-y-4">
              <Section label="Preferences">
                <Info label="Language" value={user.profile?.preferredLanguage} />
                <Info label="Skill Level" value={user.profile?.skillLevel} />
                <Info label="Difficulty" value={user.profile?.preferredDifficulty} />
                <Info label="Budget" value={user.profile?.budgetPreference} />
              </Section>

              {user.role === "instructor" && (
                <Section label="Verification">
                  <Info label="Status" value={user.instructorProfile?.verification?.status} />
                  <Info label="Expertise" value={user.instructorProfile?.expertise?.join(", ")} />
                </Section>
              )}
            </div>
          </div>

          {user.role === "instructor" && courses && courses.length > 0 && (
            <div className="mt-8">
              <h4 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-400">Associated Courses</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {courses.map(c => (
                  <div key={c._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{c.title?.en}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-slate-500">
                      <span>{c.status}</span>
                      <span>{c.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</h4>
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}:</span>
      <span className="font-bold text-slate-900 dark:text-white">{value || "N/A"}</span>
    </div>
  );
}
