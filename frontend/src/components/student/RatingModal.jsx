import { useState } from "react";
import { StarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { rateCourse } from "../../api/studentApi";

export default function RatingModal({ courseId, open, onClose, onSaved }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await rateCourse(courseId, { rating, review, language: "en" });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#161b22]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Rate this course</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-5 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={value <= rating ? "text-amber-500" : "text-slate-300"}
              title={`${value} star`}
            >
              <StarIcon className="h-8 w-8 fill-current" />
            </button>
          ))}
        </div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          placeholder="Write a short review"
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={saving}
          className="mt-5 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Submit rating"}
        </button>
      </form>
    </div>
  );
}
