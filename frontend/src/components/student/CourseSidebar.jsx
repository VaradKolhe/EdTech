import { CheckCircleIcon, PlayCircleIcon } from "@heroicons/react/24/outline";

export default function CourseSidebar({ course, activeBlockId, completedIds, onSelect }) {
  return (
    <aside className="h-full overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b0e14]">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Course</p>
        <h2 className="mt-1 line-clamp-2 text-lg font-black text-slate-900 dark:text-white">
          {course.title}
        </h2>
      </div>
      <div className="p-3">
        {(course.modules || []).map((module) => (
          <div key={module.moduleId || module._id} className="mb-4">
            <p className="px-2 py-2 text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {module.title || module.moduleTitle}
            </p>
            {(module.submodules || []).map((submodule) => (
              <div key={submodule.submoduleId || submodule._id} className="mb-2">
                <p className="px-2 py-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                  {submodule.title || submodule.submoduleTitle}
                </p>
                {(submodule.contentBlocks || []).map((block) => {
                  const complete = completedIds.has(String(block.blockId || block._id));
                  const active = String(activeBlockId) === String(block.blockId || block._id);
                  return (
                    <button
                      key={block.blockId || block._id}
                      type="button"
                      onClick={() => onSelect(module, submodule, block)}
                      className={`mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${
                        active
                          ? "bg-brand-600 text-white"
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {complete ? <CheckCircleIcon className="h-4 w-4" /> : <PlayCircleIcon className="h-4 w-4" />}
                      <span className="line-clamp-1">{block.title || block.type}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
