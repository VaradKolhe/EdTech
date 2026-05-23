import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronDownIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ContentBlockViewer from "../components/student/ContentBlockViewer";

export default function DashboardPage() {
  const { courseId } = useParams();
  const [outline, setOutline] = useState(null);
  const [active, setActive] = useState(null);
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview"); // "preview" or "feedbacks"
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    api
      .get(`/instructor/courses/${courseId}/outline`)
      .then(({ data }) => setOutline(data.course))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    if (activeTab === "feedbacks" && feedbacks.length === 0) {
      setLoadingFeedbacks(true);
      api.get(`/instructor/courses/${courseId}/ratings`)
        .then(({ data }) => setFeedbacks(data.ratings || []))
        .finally(() => setLoadingFeedbacks(false));
    }
  }, [activeTab, courseId]);

  const firstSubmodule = useMemo(() => {
    const module = outline?.modules?.[0];
    const submodule = module?.submodules?.[0];
    return module && submodule ? { module, submodule } : null;
  }, [outline]);

  useEffect(() => {
    if (!active && firstSubmodule) setActive(firstSubmodule);
  }, [active, firstSubmodule]);

  useEffect(() => {
    if (!active || activeTab !== "preview") return;
    const key = `${active.module.moduleId}:${active.submodule.submoduleId}`;
    if (cache[key]) return;
    setContentLoading(true);
    api
      .get(
        `/instructor/courses/${courseId}/modules/${active.module.moduleId}/submodules/${active.submodule.submoduleId}/content`
      )
      .then(({ data }) => setCache((prev) => ({ ...prev, [key]: data })))
      .finally(() => setContentLoading(false));
  }, [active, cache, courseId, activeTab]);

  const activeKey = active ? `${active.module.moduleId}:${active.submodule.submoduleId}` : "";
  const activeContent = cache[activeKey];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[20rem_1fr]">
        <aside className="hidden min-h-0 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b0e14] md:block">
          <div className="border-b border-slate-200 p-6 dark:border-slate-800">
            <Link to="/instructor-dashboard" className="text-xs font-black uppercase tracking-widest text-brand-600 hover:text-brand-700">
              ← Workspace
            </Link>
            <h1 className="mt-4 line-clamp-2 text-xl font-black text-slate-900 dark:text-white">
              {outline?.title?.en || "Course"}
            </h1>
            <div className="mt-6 flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${activeTab === "preview" ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"}`}
              >
                <EyeIcon className="h-4 w-4" />
                Course Preview
              </button>
              <button 
                onClick={() => setActiveTab("feedbacks")}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${activeTab === "feedbacks" ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"}`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                User Feedbacks
              </button>
              <Link 
                to={`/courses/${courseId}/edit`} 
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit Content
              </Link>
            </div>
          </div>
          
          {activeTab === "preview" && (
            loading ? (
              <div className="space-y-3 p-6">
                <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
            ) : (
              <div className="p-3">
                <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Curriculum</p>
                {(outline?.modules || []).map((module) => (
                  <section key={module.moduleId} className="mb-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-tight text-slate-500">
                      <ChevronDownIcon className="h-3 w-3" />
                      {module.moduleTitle?.en || "Module"}
                    </div>
                    <div className="space-y-1">
                      {(module.submodules || []).map((submodule) => {
                        const selected = activeTab === "preview" &&
                          String(active?.submodule.submoduleId) === String(submodule.submoduleId);
                        return (
                          <button
                            key={submodule.submoduleId}
                            onClick={() => { setActiveTab("preview"); setActive({ module, submodule }); }}
                            className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-all ${
                              selected
                                ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                            }`}
                          >
                            {submodule.submoduleTitle?.en || "Lesson"}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )
          )}
        </aside>
        
        <main className="min-h-0 overflow-y-auto">
          {activeTab === "preview" ? (
            <>
              <div className="border-b border-slate-200 bg-white/50 backdrop-blur px-8 py-6 dark:border-slate-800 dark:bg-[#0b0e14]/50 sticky top-0 z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-600">
                  Lesson Preview
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {active?.submodule?.submoduleTitle?.en || "Select a lesson"}
                </h2>
              </div>
              <div className="mx-auto max-w-5xl px-8 py-10">
                {contentLoading ? (
                  <div className="space-y-6">
                    <div className="h-8 w-1/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  </div>
                ) : !activeContent ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 p-20 text-center text-slate-500 dark:border-slate-700">
                    <PlayCircleIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="font-bold">Select a submodule from the curriculum to preview its content.</p>
                  </div>
                ) : activeContent.contentBlocks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 p-20 text-center text-slate-500 dark:border-slate-700">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="font-bold">This submodule has no content blocks yet.</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {activeContent.contentBlocks.map((block) => (
                      <section key={block.blockId} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#161b22] shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-900 text-slate-500">
                              {block.type === "VIDEO" ? <PlayCircleIcon className="h-5 w-5" /> : block.type === "QUIZ" ? <QuestionMarkCircleIcon className="h-5 w-5" /> : <DocumentTextIcon className="h-5 w-5" />}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{block.type}</span>
                          </div>
                        </div>
                        <ContentBlockViewer
                          block={{
                            ...block,
                            title: block.title?.en || block.type,
                            textContent: block.textContent?.en || "",
                          }}
                        />
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-5xl px-8 py-12">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Student Feedback</h2>
                <p className="mt-2 text-slate-500 font-medium italic">Hear what your students have to say and improve your content.</p>
              </div>

              {loadingFeedbacks ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 p-20 text-center text-slate-500 dark:border-slate-700">
                  <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p className="font-bold">No feedback received for this course yet.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {feedbacks.map((f) => (
                    <div key={f._id} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#161b22] shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm">
                            {f.userId?.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{f.userId?.name || "Student"}</p>
                            <p className="text-xs text-slate-400 font-bold">{new Date(f.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 dark:bg-brand-900/20">
                          <StarIcon className="h-4 w-4 text-brand-600" />
                          <span className="text-sm font-black text-brand-700 dark:text-brand-400">{f.rating}</span>
                        </div>
                      </div>
                      <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          "{f.review?.en || f.review || "No detailed comment provided."}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
