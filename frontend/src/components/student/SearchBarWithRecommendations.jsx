import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { searchRecommendations } from "../../api/studentApi";
import useDebouncedValue from "../../hooks/useDebouncedValue";

export default function SearchBarWithRecommendations({ value, onChange, onSelect }) {
  const [results, setResults] = useState([]);
  const debounced = useDebouncedValue(value, 350);

  useEffect(() => {
    let active = true;
    if (!debounced?.trim()) {
      setResults([]);
      return undefined;
    }
    searchRecommendations({ query: debounced, limit: 5 })
      .then(({ data }) => {
        if (active) setResults(data.courses || data.recommendations || []);
      })
      .catch(() => active && setResults([]));
    return () => {
      active = false;
    };
  }, [debounced]);

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search courses, skills, or goals"
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-[#161b22] dark:text-white"
      />
      {results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#161b22]">
          {results.map((course) => (
            <button
              key={course._id}
              type="button"
              onClick={() => onSelect?.(course)}
              className="block w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="font-bold text-slate-900 dark:text-white">{course.title}</span>
              <span className="ml-2 text-xs text-slate-500">{course.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
