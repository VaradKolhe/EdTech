import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setActiveSubmodule,
  addModule,
  deleteModule,
  addSubmodule,
  deleteSubmodule,
  fetchSubmoduleContent,
  updateModule,
} from "../store/courseSlice";
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  Bars3Icon, 
  XMarkIcon,
  ArrowLeftIcon 
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

function ModuleItem({ mod, isStudent }) {
  const dispatch = useDispatch();
  const activeId = useSelector((s) => s.course.activeSubmoduleId);
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(mod.title);
  const [newSub, setNewSub] = useState("");
  const [addingSubmodule, setAddingSubmodule] = useState(false);

  const handleSubmoduleClick = (sm) => {
    dispatch(setActiveSubmodule(sm._id));
    dispatch(fetchSubmoduleContent(sm._id));
  };

  const handleAddSubmodule = () => {
    if (!newSub.trim()) return;
    dispatch(addSubmodule({ moduleId: mod._id, title: newSub.trim() }));
    setNewSub("");
    setAddingSubmodule(false);
  };

  const handleRenameModule = () => {
    if (title.trim() && title !== mod.title)
      dispatch(updateModule({ id: mod._id, title: title.trim() }));
    setEditing(false);
  };

  return (
    <div className="mb-0.5">
      {/* Module header */}
      <div
        className="group flex cursor-pointer items-center gap-2 px-5 py-3 transition-colors hover:bg-slate-200/50 dark:hover:bg-white/5"
        onClick={() => setOpen((o) => !o)}
      >
        {open
          ? <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-brand-600 dark:text-brand-400" />
          : <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-slate-400" />
        }
        <span className="mr-1 text-sm font-bold text-brand-600 dark:text-brand-400">{mod.moduleNumber}.</span>
        {editing && !isStudent ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRenameModule}
            onKeyDown={(e) => e.key === "Enter" && handleRenameModule()}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-brand-500 bg-white dark:bg-slate-800 px-2 py-1 text-sm outline-none"
          />
        ) : (
          <span className="flex-1 truncate text-base font-semibold text-slate-700 dark:text-slate-200">{mod.title}</span>
        )}
        
        {!isStudent && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditing(true)} className="p-1 hover:text-brand-600 dark:hover:text-brand-400 text-slate-400">
              <PencilIcon className="w-3 h-3" />
            </button>
            <button onClick={() => dispatch(deleteModule(mod._id))} className="p-1 hover:text-red-500 text-slate-400">
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Submodules */}
      {open && (
        <div className="pb-1">
          {mod.submodules?.map((sm) => (
            <div
              key={sm._id}
              onClick={() => handleSubmoduleClick(sm)}
              className={`group flex cursor-pointer items-center justify-between py-2.5 pl-11 pr-4 transition-colors ${
                activeId === sm._id
                  ? "bg-brand-600/10 border-l-2 border-brand-600 text-brand-700 dark:text-white"
                  : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 border-l-2 border-transparent"
              }`}
            >
              <span className="flex-1 truncate text-base">{sm.title}</span>
              {!isStudent && (
                <button
                  onClick={(e) => { e.stopPropagation(); dispatch(deleteSubmodule({ id: sm._id, moduleId: mod._id })); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-slate-400"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {!isStudent && (
            addingSubmodule ? (
              <div className="flex gap-1 py-2 pl-11 pr-4">
                <input
                  autoFocus
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddSubmodule(); if (e.key === "Escape") setAddingSubmodule(false); }}
                  placeholder="Submodule title..."
                  className="flex-1 rounded border border-brand-400 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm outline-none placeholder-slate-500"
                />
                <button onClick={handleAddSubmodule} className="text-brand-600 font-bold px-1.5 hover:text-brand-700">✓</button>
                <button onClick={() => setAddingSubmodule(false)} className="text-slate-400 px-1 hover:text-slate-600">✕</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSubmodule(true)}
                className="flex w-full items-center gap-1.5 py-2 pl-11 pr-4 text-sm text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
              >
                <PlusIcon className="w-3 h-3" /> Add Submodule
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ courseId, modules }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const course = useSelector((s) => s.course.course);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addingModule, setAddingModule] = useState(false);
  const [newModTitle, setNewModTitle] = useState("");

  const isStudent = user?.role === "student";

  const handleAddModule = () => {
    if (!newModTitle.trim()) return;
    dispatch(addModule({ courseId, title: newModTitle.trim(), moduleNumber: (modules?.length || 0) + 1 }));
    setNewModTitle("");
    setAddingModule(false);
  };

  const handleGoBack = () => {
    if (isStudent) navigate("/student-dashboard");
    else navigate("/instructor-dashboard");
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-[#0b0e14] border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Back button */}
      <div className="px-5 py-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Course title */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-5 pb-6 pt-2">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Course</p>
        <p className="truncate text-lg font-black text-slate-900 dark:text-white leading-tight">{course?.title}</p>
      </div>

      {/* Modules label */}
      <div className="px-5 pb-2 pt-6 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Learning Modules</p>
        {isStudent && (
          <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-[10px] font-bold text-brand-600 dark:text-brand-400">
            {modules?.length || 0} Modules
          </span>
        )}
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto pt-2 pb-10">
        {modules?.map((mod) => (
          <ModuleItem key={mod._id} mod={mod} courseId={courseId} isStudent={isStudent} />
        ))}

        {/* Add module */}
        {!isStudent && (
          <div className="px-5 py-6 mt-4 border-t border-slate-200 dark:border-slate-800">
            {addingModule ? (
              <div className="flex gap-1">
                <input
                  autoFocus
                  value={newModTitle}
                  onChange={(e) => setNewModTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddModule(); if (e.key === "Escape") setAddingModule(false); }}
                  placeholder="Module title..."
                  className="flex-1 rounded-xl border border-brand-500 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none"
                />
                <button onClick={handleAddModule} className="text-brand-600 font-bold px-2">✓</button>
                <button onClick={() => setAddingModule(false)} className="text-slate-400 px-1">✕</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingModule(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 px-3 py-3 text-sm font-bold text-slate-500 transition-all hover:border-brand-500 hover:text-brand-600"
              >
                <PlusIcon className="w-4 h-4" /> New Module
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-3 top-3 z-50 rounded-xl bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white shadow-xl border border-slate-200 dark:border-slate-800 md:hidden transition-all active:scale-95"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? "Close course navigation" : "Open course navigation"}
      >
        {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed bottom-0 top-0 z-40 w-[min(86vw,20rem)] flex-shrink-0
        transition-transform duration-500 ease-in-out md:relative md:h-full md:w-72 xl:w-80
        ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
      `}>
        {sidebar}
      </aside>
    </>
  );
}
