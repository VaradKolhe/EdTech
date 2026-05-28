import { useState, useEffect } from "react";
import { CheckCircleIcon, PlayCircleIcon, ChevronDownIcon, ChevronRightIcon, BookOpenIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { getLocalizedValue } from "../../utils/localize";

export default function CourseSidebar({ course, activeBlockId, completedIds, onSelect, language = "en" }) {
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedSubmodules, setExpandedSubmodules] = useState(new Set());

  const getVal = (field, fallback = "") => getLocalizedValue(field, language, fallback);

  // Auto-expand hierarchy containing the active block
  useEffect(() => {
    if (activeBlockId && course?.modules) {
      const newModules = new Set(expandedModules);
      const newSubmodules = new Set(expandedSubmodules);
      
      course.modules.forEach(module => {
        module.submodules?.forEach(sub => {
          const hasActive = sub.contentBlocks?.some(block => String(block.blockId || block._id) === String(activeBlockId));
          if (hasActive) {
            newModules.add(String(module.moduleId || module._id));
            newSubmodules.add(String(sub.submoduleId || sub._id));
          }
        });
      });

      setExpandedModules(newModules);
      setExpandedSubmodules(newSubmodules);
    }
  }, [activeBlockId, course?.modules]);

  const toggleModule = (id) => {
    const next = new Set(expandedModules);
    if (next.has(String(id))) next.delete(String(id));
    else next.add(String(id));
    setExpandedModules(next);
  };

  const toggleSubmodule = (id) => {
    const next = new Set(expandedSubmodules);
    if (next.has(String(id))) next.delete(String(id));
    else next.add(String(id));
    setExpandedSubmodules(next);
  };

  return (
    <aside className="h-full flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b0e14] select-none">
      <div className="border-b border-slate-200 p-6 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <BookOpenIcon className="h-4 w-4 text-brand-600" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Curriculum</p>
        </div>
        <h2 className="line-clamp-2 text-lg font-black text-slate-900 dark:text-white leading-tight">
          {getVal(course.title, "Course")}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {(course.modules || []).map((module, mIdx) => {
          const mId = String(module.moduleId || module._id);
          const isMExpanded = expandedModules.has(mId);
          
          return (
            <div key={mId} className="mb-2">
              <button
                onClick={() => toggleModule(mId)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-900 group"
              >
                {isMExpanded ? (
                  <ChevronDownIcon className="h-3.5 w-3.5 text-brand-600" />
                ) : (
                  <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-600/60 mb-0.5">
                    Module {mIdx + 1}
                  </p>
                  <p className="truncate text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                    {getVal(module.moduleTitle || module.title, "Module")}
                  </p>
                </div>
              </button>

              {isMExpanded && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                  {(module.submodules || []).map((submodule) => {
                    const smId = String(submodule.submoduleId || submodule._id);
                    const isSMExpanded = expandedSubmodules.has(smId);

                    return (
                      <div key={smId}>
                        <button
                          onClick={() => toggleSubmodule(smId)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group"
                        >
                          {isSMExpanded ? (
                            <ChevronDownIcon className="h-3 w-3 text-slate-400 group-hover:text-brand-600" />
                          ) : (
                            <ChevronRightIcon className="h-3 w-3 text-slate-400 group-hover:text-brand-600" />
                          )}
                          <span className="truncate text-xs font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-300">
                            {getVal(submodule.submoduleTitle || submodule.title, "Lesson")}
                          </span>
                        </button>

                        {isSMExpanded && (
                          <div className="ml-5 mt-1 space-y-1 pb-2">
                            {(submodule.contentBlocks || []).map((block) => {
                              const bId = String(block.blockId || block._id);
                              const complete = completedIds.has(bId);
                              const active = String(activeBlockId) === bId;
                              
                              return (
                                <button
                                  key={bId}
                                  type="button"
                                  onClick={() => onSelect(module, submodule, block)}
                                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-bold transition-all ${
                                    active
                                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  <div className="flex-shrink-0">
                                    {complete ? (
                                      <CheckCircleIcon className={`h-4 w-4 ${active ? "text-white" : "text-emerald-500"}`} />
                                    ) : (
                                      <PlayCircleIcon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} />
                                    )}
                                  </div>
                                  <span className="line-clamp-1">{getVal(block.title || block.type)}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
