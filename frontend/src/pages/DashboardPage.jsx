import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronDownIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
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

  useEffect(() => {
    api
      .get(`/instructor/courses/${courseId}/outline`)
      .then(({ data }) => setOutline(data.course))
      .finally(() => setLoading(false));
  }, [courseId]);

  const firstSubmodule = useMemo(() => {
    const module = outline?.modules?.[0];
    const submodule = module?.submodules?.[0];
    return module && submodule ? { module, submodule } : null;
  }, [outline]);

  useEffect(() => {
    if (!active && firstSubmodule) setActive(firstSubmodule);
  }, [active, firstSubmodule]);

  useEffect(() => {
    if (!active) return;
    const key = `${active.module.moduleId}:${active.submodule.submoduleId}`;
    if (cache[key]) return;
    setContentLoading(true);
    api
      .get(
        `/instructor/courses/${courseId}/modules/${active.module.moduleId}/submodules/${active.submodule.submoduleId}/content`
      )
      .then(({ data }) => setCache((prev) => ({ ...prev, [key]: data })))
      .finally(() => setContentLoading(false));
  }, [active, cache, courseId]);

  const activeKey = active ? `${active.module.moduleId}:${active.submodule.submoduleId}` : "";
  const activeContent = cache[activeKey];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[20rem_1fr]">
        <aside className="hidden min-h-0 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b0e14] md:block">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <Link to="/instructor-dashboard" className="text-xs font-black uppercase tracking-widest text-brand-600">
              Back
            </Link>
            <h1 className="mt-3 line-clamp-2 text-xl font-black text-slate-900 dark:text-white">
              {outline?.title?.en || "Course"}
            </h1>
          </div>
          {loading ? (
            <div className="space-y-3 p-5">
              <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : (
            <div className="p-3">
              {(outline?.modules || []).map((module) => (
                <section key={module.moduleId} className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-2 text-sm font-black text-slate-900 dark:text-white">
                    <ChevronDownIcon className="h-4 w-4 text-brand-600" />
                    {module.moduleTitle?.en || "Module"}
                  </div>
                  <div className="space-y-1">
                    {(module.submodules || []).map((submodule) => {
                      const selected =
                        String(active?.submodule.submoduleId) === String(submodule.submoduleId);
                      return (
                        <button
                          key={submodule.submoduleId}
                          onClick={() => setActive({ module, submodule })}
                          className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                            selected
                              ? "bg-brand-600 text-white"
                              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
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
          )}
        </aside>
        <main className="min-h-0 overflow-y-auto">
          <div className="border-b border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-[#0b0e14]">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Instructor preview
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {active?.submodule?.submoduleTitle?.en || "Select a lesson"}
            </h2>
          </div>
          <div className="mx-auto max-w-5xl px-5 py-8">
            {contentLoading ? (
              <div className="space-y-4">
                <div className="h-8 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ) : !activeContent ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
                Select a submodule to preview content.
              </div>
            ) : activeContent.contentBlocks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
                This submodule has no content blocks.
              </div>
            ) : (
              <div className="space-y-8">
                {activeContent.contentBlocks.map((block) => (
                  <section key={block.blockId} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#161b22]">
                    <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-500">
                      {block.type === "VIDEO" ? <PlayCircleIcon className="h-5 w-5" /> : block.type === "QUIZ" ? <QuestionMarkCircleIcon className="h-5 w-5" /> : <DocumentTextIcon className="h-5 w-5" />}
                      {block.type}
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
        </main>
      </div>
    </div>
  );
}
