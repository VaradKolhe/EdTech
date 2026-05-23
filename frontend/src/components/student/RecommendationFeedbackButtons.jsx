import { useState } from "react";
import { HandThumbDownIcon, HandThumbUpIcon } from "@heroicons/react/24/outline";
import { submitRecommendationFeedback } from "../../api/studentApi";

export default function RecommendationFeedbackButtons({ courseId, type = "DASHBOARD" }) {
  const [submitted, setSubmitted] = useState("");

  const send = async (feedback) => {
    const nextFeedback = submitted === feedback ? "" : feedback;
    setSubmitted(nextFeedback);
    
    // Only send to API if we are selecting something, or we'd need a delete API (deferred)
    if (!nextFeedback) return;

    try {
      await submitRecommendationFeedback({
        courseId,
        recommendationType: type,
        feedback: nextFeedback,
      });
    } catch {
      setSubmitted("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => send("RELEVANT")}
        className={`rounded-lg p-2 ${submitted === "RELEVANT" ? "bg-green-100 text-green-700" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        title="Relevant"
      >
        <HandThumbUpIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => send("NOT_RELEVANT")}
        className={`rounded-lg p-2 ${submitted === "NOT_RELEVANT" ? "bg-rose-100 text-rose-700" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        title="Not relevant"
      >
        <HandThumbDownIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
