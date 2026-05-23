const difficulties = ["", "Beginner", "Intermediate", "Advanced"];
const languages = ["", "en", "hi", "mr"];
const pricing = ["", "free", "paid"];

export default function CourseFilters({ filters, onChange, enrolled = false }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#161b22] sm:grid-cols-2 lg:grid-cols-4">
      <input
        value={filters.category || ""}
        onChange={(e) => set("category", e.target.value)}
        placeholder="Category"
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <select
        value={filters.difficulty || ""}
        onChange={(e) => set("difficulty", e.target.value)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        {difficulties.map((value) => (
          <option key={value} value={value}>
            {value || "Any difficulty"}
          </option>
        ))}
      </select>
      <select
        value={filters.language || ""}
        onChange={(e) => set("language", e.target.value)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        {languages.map((value) => (
          <option key={value} value={value}>
            {value ? value.toUpperCase() : "Any language"}
          </option>
        ))}
      </select>
      <select
        value={filters.pricing || ""}
        onChange={(e) => set("pricing", e.target.value)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        {pricing.map((value) => (
          <option key={value} value={value}>
            {value ? value.toUpperCase() : "Free or paid"}
          </option>
        ))}
      </select>
      {enrolled ? (
        <>
          <select
            value={filters.status || ""}
            onChange={(e) => set("status", e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Any status</option>
            <option value="enrolled">Enrolled</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.minProgress || ""}
            onChange={(e) => set("minProgress", e.target.value)}
            placeholder="Min progress %"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </>
      ) : (
        <>
          <input
            type="number"
            min="0"
            value={filters.maxPrice || ""}
            onChange={(e) => set("maxPrice", e.target.value)}
            placeholder="Max price"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            value={filters.rating || ""}
            onChange={(e) => set("rating", e.target.value)}
            placeholder="Min rating"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </>
      )}
    </div>
  );
}
