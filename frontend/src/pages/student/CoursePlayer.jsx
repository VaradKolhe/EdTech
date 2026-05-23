import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import CourseSidebar from "../../components/student/CourseSidebar";
import ContentBlockViewer from "../../components/student/ContentBlockViewer";
import ProgressBar from "../../components/student/ProgressBar";
import { completeContentBlock, getCoursePlayer, updateLastAccessed } from "../../api/studentApi";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCoursePlayer(courseId)
      .then(({ data }) => {
        setCourse(data.course);
        setEnrollment(data.enrollment);
        const firstModule = data.course.modules?.[0];
        const firstSubmodule = firstModule?.submodules?.[0];
        const firstBlock = firstSubmodule?.contentBlocks?.[0];
        if (firstBlock) setActive({ module: firstModule, submodule: firstSubmodule, block: firstBlock });
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const completedIds = useMemo(
    () => new Set((enrollment?.completedBlocks || []).map((item) => String(item.blockId))),
    [enrollment]
  );

  const selectBlock = (module, submodule, block) => {
    setActive({ module, submodule, block });
    updateLastAccessed(courseId, {
      moduleId: module.moduleId || module._id,
      submoduleId: submodule.submoduleId || submodule._id,
      blockId: block.blockId || block._id,
    }).catch(() => null);
  };

  const markComplete = async () => {
    if (!active) return;
    setSaving(true);
    try {
      const { data } = await completeContentBlock(courseId, {
        moduleId: active.module.moduleId || active.module._id,
        submoduleId: active.submodule.submoduleId || active.submodule._id,
        blockId: active.block.blockId || active.block._id,
        blockType: active.block.type,
        timeSpentSeconds: 60,
      });
      setEnrollment(data.enrollment);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="py-24 text-center text-slate-500">Loading player...</div>
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
            activeBlockId={activeBlockId}
            completedIds={completedIds}
            onSelect={selectBlock}
          />
        </div>
        <main className="min-h-0 overflow-y-auto">
          <div className="border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-[#0b0e14]">
            <div className="mx-auto max-w-5xl">
              <Link to={`/student-dashboard/courses/${course._id}`} className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Back to details
              </Link>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    {active?.block?.title || active?.submodule?.title || "Lesson"}
                  </h1>
                  <p className="text-sm text-slate-500">{active?.module?.title}</p>
                </div>
                <div className="w-full sm:w-56">
                  <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                    <span>Progress</span>
                    <span>{enrollment?.progressPercentage || 0}%</span>
                  </div>
                  <ProgressBar value={enrollment?.progressPercentage || 0} />
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-5xl px-5 py-8">
            <ContentBlockViewer block={active?.block} />
            <div className="mt-8 flex justify-end">
              <button
                onClick={markComplete}
                disabled={saving || isComplete || !active}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                <CheckCircleIcon className="h-5 w-5" />
                {isComplete ? "Completed" : saving ? "Saving..." : "Mark complete"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
