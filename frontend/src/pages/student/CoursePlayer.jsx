import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import CourseSidebar from "../../components/student/CourseSidebar";
import ContentBlockViewer from "../../components/student/ContentBlockViewer";
import ProgressBar from "../../components/student/ProgressBar";
import CourseContentLanguageSwitcher from "../../components/ui/CourseContentLanguageSwitcher";
import { completeContentBlock, getCoursePlayer, updateLastAccessed } from "../../api/studentApi";
import { useTheme } from "../../context/ThemeContext";
import { getLocalizedValue } from "../../utils/localize";

const getId = (item, primaryKey) => String(item?.[primaryKey] || item?._id || "");

const findBlockSelection = (modules = [], ids = {}) => {
  for (const module of modules) {
    if (ids.moduleId && getId(module, "moduleId") !== ids.moduleId) continue;

    for (const submodule of module.submodules || []) {
      if (ids.submoduleId && getId(submodule, "submoduleId") !== ids.submoduleId) continue;

      for (const block of submodule.contentBlocks || []) {
        if (ids.blockId && getId(block, "blockId") !== ids.blockId) continue;
        return { module, submodule, block };
      }
    }
  }

  return null;
};

const firstBlockSelection = (modules = []) => {
  const firstModule = modules?.[0];
  const firstSubmodule = firstModule?.submodules?.[0];
  const firstBlock = firstSubmodule?.contentBlocks?.[0];
  return firstBlock ? { module: firstModule, submodule: firstSubmodule, block: firstBlock } : null;
};

export default function CoursePlayer() {
  const { courseId } = useParams();
  const { t } = useTranslation();
  const { effectiveCourseContentLanguage } = useTheme();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const activeIdsRef = useRef(null);

  useEffect(() => {
    getCoursePlayer(courseId, { language: effectiveCourseContentLanguage })
      .then(({ data }) => {
        setCourse({ ...data.course, access: data.access });
        setEnrollment(data.enrollment);
        setIsPreview(data.access?.canAccessContent && !data.access?.isEnrolled);
        const selected =
          findBlockSelection(data.course.modules, activeIdsRef.current) ||
          firstBlockSelection(data.course.modules);
        if (selected) {
          activeIdsRef.current = {
            moduleId: getId(selected.module, "moduleId"),
            submoduleId: getId(selected.submodule, "submoduleId"),
            blockId: getId(selected.block, "blockId"),
          };
          setActive(selected);
        }
      })
      .finally(() => setLoading(false));
  }, [courseId, effectiveCourseContentLanguage]);

  const completedIds = useMemo(
    () => new Set((enrollment?.completedBlocks || []).map((item) => String(item.blockId))),
    [enrollment]
  );

  const selectBlock = (module, submodule, block) => {
    activeIdsRef.current = {
      moduleId: getId(module, "moduleId"),
      submoduleId: getId(submodule, "submoduleId"),
      blockId: getId(block, "blockId"),
    };
    setActive({ module, submodule, block });
    if (isPreview) return; // Skip progress updates in preview mode

    updateLastAccessed(courseId, {
      moduleId: module.moduleId || module._id,
      submoduleId: submodule.submoduleId || submodule._id,
      blockId: block.blockId || block._id,
      blockType: block.type,
    }).then(({ data }) => {
      setEnrollment(data.enrollment);
    }).catch(() => null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="py-24 text-center text-slate-500">{t("common.loading")}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="py-24 text-center text-slate-500">Course unavailable.</div>
      </div>
    );
  }

  const activeBlockId = active?.block?.blockId || active?.block?._id;
  const isComplete = completedIds.has(String(activeBlockId));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[20rem_1fr]">
        <div className="hidden min-h-0 md:block">
          <CourseSidebar
            course={course}
            language={effectiveCourseContentLanguage}
            activeBlockId={activeBlockId}
            completedIds={completedIds}
            onSelect={selectBlock}
          />
        </div>
        <main className="min-h-0 overflow-y-auto custom-scrollbar flex flex-col">
          {isPreview && (
            <div className="bg-brand-600 px-5 py-2 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg sticky top-0 z-20">
              Read-Only Preview Mode
            </div>
          )}

          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 py-6 dark:border-slate-800 dark:bg-[#0b0e14]/80">
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link to={`/student-dashboard/courses/${course._id}`} className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 transition-colors">
                      {t("course.details")}
                    </Link>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
                      {getLocalizedValue(active?.module?.moduleTitle || active?.module?.title, effectiveCourseContentLanguage)}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight truncate sm:text-3xl">
                    {getLocalizedValue(
                      active?.block?.title || active?.submodule?.submoduleTitle || active?.submodule?.title,
                      effectiveCourseContentLanguage,
                      "Lesson"
                    )}
                  </h1>
                </div>

                <div className="flex items-center gap-6">
                  <CourseContentLanguageSwitcher />
                  {!isPreview && (
                    <div className="hidden sm:block w-48 lg:w-64">
                      <div className="mb-1.5 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>{t("dashboard.overallProgress")}</span>
                        <span className="text-brand-600">{enrollment?.progressPercentage || 0}%</span>
                      </div>
                      <ProgressBar value={enrollment?.progressPercentage || 0} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-12">
            <div className="mx-auto max-w-5xl px-8">
              <ContentBlockViewer 
                block={active?.block} 
                language={effectiveCourseContentLanguage}
                isPreview={isPreview}
                onComplete={async () => {
                  if (isPreview) return;
                  const { data } = await getCoursePlayer(courseId, { language: effectiveCourseContentLanguage });
                  setEnrollment(data.enrollment);
                }} 
              />

              {!isPreview && active?.block && active.block.type !== "QUIZ" && !isComplete && (
                <div className="mt-12 flex justify-end">
                  <button
                    onClick={async () => {
                      try {
                        await completeContentBlock(courseId, { blockId: activeBlockId });
                        const { data } = await getCoursePlayer(courseId, { language: effectiveCourseContentLanguage });
                        setEnrollment(data.enrollment);
                      } catch (err) {
                        console.error("Failed to mark complete", err);
                      }
                    }}
                    className="flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-brand-600/30 transition-all hover:bg-brand-700 hover:scale-[1.02] active:scale-95"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    {t("learning.markComplete")}
                  </button>
                </div>
              )}
              
              {isComplete && active?.block?.type !== "QUIZ" && (
                <div className="mt-12 flex justify-end">
                   <div className="flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                      <CheckCircleIcon className="h-5 w-5" />
                      {t("dashboard.completed")}
                   </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
