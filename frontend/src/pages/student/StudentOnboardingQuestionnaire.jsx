import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { updateStudentProfile } from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";

export default function StudentOnboardingQuestionnaire() {
  const navigate = useNavigate();
  const { user, persistAuth } = useAuth();
  const [options, setOptions] = useState(null);
  const [form, setForm] = useState({
    ageGroup: "",
    educationLevel: "",
    preferredStreams: [],
    skillLevel: "",
    careerGoal: "",
    budgetPreference: "",
    preferredDifficulty: "",
    preferredLanguage: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/metadata/onboarding-options").then(({ data }) => setOptions(data));
  }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const toggleStream = (stream) =>
    setForm((prev) => ({
      ...prev,
      preferredStreams: prev.preferredStreams.includes(stream)
        ? prev.preferredStreams.filter((item) => item !== stream)
        : [...prev.preferredStreams, stream],
    }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await updateStudentProfile(form);
      persistAuth({ ...user, profile: data.profile });
      navigate("/student-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save onboarding profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!options) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Personalize your learning
          </h1>
          <p className="mt-2 text-slate-500">
            Select the options that best match your goals.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-8">
          <ChoiceGroup label="Age group" values={options.ageGroup} value={form.ageGroup} onChange={(v) => setField("ageGroup", v)} />
          <ChoiceGroup label="Education level" values={options.educationLevel} value={form.educationLevel} onChange={(v) => setField("educationLevel", v)} />
          <MultiChoice label="Preferred streams" values={options.preferredStreams} selected={form.preferredStreams} onToggle={toggleStream} />
          <ChoiceGroup label="Current skill level" values={options.skillLevel} value={form.skillLevel} onChange={(v) => setField("skillLevel", v)} />
          <ChoiceGroup label="Career goal" values={options.careerGoal} value={form.careerGoal} onChange={(v) => setField("careerGoal", v)} />
          <ChoiceGroup label="Budget preference" values={options.budgetPreference} value={form.budgetPreference} onChange={(v) => setField("budgetPreference", v)} />
          <ChoiceGroup label="Preferred difficulty" values={options.preferredDifficulty} value={form.preferredDifficulty} onChange={(v) => setField("preferredDifficulty", v)} />
          <ChoiceGroup label="Preferred language" values={options.preferredLanguage} value={form.preferredLanguage} onChange={(v) => setField("preferredLanguage", v)} />

          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save and continue"}
          </button>
        </form>
      </main>
    </div>
  );
}

function ChoiceGroup({ label, values, value, onChange }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">{label}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${
              value === item
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-[#161b22] dark:text-slate-200"
            }`}
          >
            {item.toUpperCase ? item.toUpperCase() : item}
          </button>
        ))}
      </div>
    </section>
  );
}

function MultiChoice({ label, values, selected, onToggle }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">{label}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${
              selected.includes(item)
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-[#161b22] dark:text-slate-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
