import { useState } from "react";
import axios from "../../api/axios";
import { 
  SparklesIcon, 
  ArrowPathIcon, 
  DocumentTextIcon, 
  LightBulbIcon 
} from "@heroicons/react/24/outline";

export default function AIAssistPanel({ moduleText, moduleTitle, language = "en" }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [activeOp, setActiveOp] = useState(null);

  const handleAssist = async (operation) => {
    setLoading(true);
    setError("");
    setResult("");
    setActiveOp(operation);
    
    try {
      const { data } = await axios.post("/ai/module-assist", {
        operation,
        moduleText,
        moduleTitle,
        language
      });
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get AI assistance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 rounded-3xl border border-brand-100 bg-brand-50/30 p-6 dark:border-brand-900/20 dark:bg-brand-900/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
          <SparklesIcon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Module Assistant</h3>
          <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => handleAssist("summarize")}
          disabled={loading || !moduleText}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-widest transition-all ${
            activeOp === "summarize" && !result
              ? "bg-brand-600 text-white"
              : "bg-white text-slate-700 hover:bg-brand-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          } border border-slate-200 shadow-sm disabled:opacity-50 dark:border-slate-700`}
        >
          <DocumentTextIcon className="h-4 w-4" />
          Summarize
        </button>
        <button
          onClick={() => handleAssist("elaborate")}
          disabled={loading || !moduleText}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-widest transition-all ${
            activeOp === "elaborate" && !result
              ? "bg-brand-600 text-white"
              : "bg-white text-slate-700 hover:bg-brand-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          } border border-slate-200 shadow-sm disabled:opacity-50 dark:border-slate-700`}
        >
          <LightBulbIcon className="h-4 w-4" />
          Elaborate
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-brand-600 mb-3" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            {activeOp === "summarize" ? "Generating Summary..." : "Elaborating Content..."}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
          <button 
            onClick={() => handleAssist(activeOp)}
            className="mt-2 text-xs font-black uppercase tracking-widest text-brand-600 hover:underline"
          >
            Retry Action
          </button>
        </div>
      )}

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="prose prose-slate dark:prose-invert max-w-none rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <div className="mb-4 flex items-center justify-between border-b border-slate-50 pb-3 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {activeOp === "summarize" ? "Summary Output" : "Detailed Elaboration"}
              </span>
              <button 
                onClick={() => setResult("")}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            </div>
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-center">
        Note: This assistant only works on the current module text content.
      </p>
    </div>
  );
}
