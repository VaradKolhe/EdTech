import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveSubmodule,
  addModule,
  deleteModule,
  addSubmodule,
  deleteSubmodule,
  fetchSubmoduleContent,
  updateModule,
} from "../store/courseSlice";
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, TrashIcon, PencilIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

function ModuleItem({ mod }) {
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
        className="group flex cursor-pointer items-center gap-2 px-5 py-3 transition-colors hover:bg-white/5"
        onClick={() => setOpen((o) => !o)}
      >
        {open
          ? <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-primary" />
          : <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-500" />
        }
        <span className="mr-1 text-sm font-bold text-primary">{mod.moduleNumber}.</span>
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRenameModule}
            onKeyDown={(e) => e.key === "Enter" && handleRenameModule()}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-primary bg-white/10 px-2 py-1 text-sm text-white outline-none"
          />
        ) : (
          <span className="flex-1 truncate text-base font-semibold text-gray-200">{mod.title}</span>
        )}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setEditing(true)} className="p-1 hover:text-primary text-gray-500 transition-colors">
            <PencilIcon className="w-3 h-3" />
          </button>
          <button onClick={() => dispatch(deleteModule(mod._id))} className="p-1 hover:text-red-400 text-gray-500 transition-colors">
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
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
                  ? "bg-primary/20 border-l-2 border-primary text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent"
              }`}
            >
              <span className="flex-1 truncate text-base">{sm.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); dispatch(deleteSubmodule({ id: sm._id, moduleId: mod._id })); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-gray-500 transition-all"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          ))}

          {addingSubmodule ? (
            <div className="flex gap-1 py-2 pl-11 pr-4">
              <input
                autoFocus
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddSubmodule(); if (e.key === "Escape") setAddingSubmodule(false); }}
                placeholder="Submodule title..."
                className="flex-1 rounded border border-primary/60 bg-white/10 px-2 py-1.5 text-sm text-white outline-none placeholder-gray-500"
              />
              <button onClick={handleAddSubmodule} className="text-primary text-xs font-bold px-1.5 hover:text-primary-dark">✓</button>
              <button onClick={() => setAddingSubmodule(false)} className="text-gray-500 text-xs px-1 hover:text-gray-300">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSubmodule(true)}
              className="flex w-full items-center gap-1.5 py-2 pl-11 pr-4 text-sm text-gray-500 transition-colors hover:text-primary"
            >
              <PlusIcon className="w-3 h-3" /> Add Submodule
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ courseId, modules }) {
  const dispatch = useDispatch();
  const course = useSelector((s) => s.course.course);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addingModule, setAddingModule] = useState(false);
  const [newModTitle, setNewModTitle] = useState("");

  const handleAddModule = () => {
    if (!newModTitle.trim()) return;
    dispatch(addModule({ courseId, title: newModTitle.trim(), moduleNumber: (modules?.length || 0) + 1 }));
    setNewModTitle("");
    setAddingModule(false);
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-100 dark:bg-[#1a1f2e] select-none">
      {/* Course title */}
      <div className="border-b border-slate-200 dark:border-white/10 px-5 py-4">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500">Course</p>
        <p className="truncate text-base font-semibold text-slate-800 dark:text-white">{course?.title}</p>
      </div>

      {/* Modules label */}
      <div className="px-5 pb-2 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500">Modules</p>
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto">
        {modules?.map((mod) => (
          <ModuleItem key={mod._id} mod={mod} courseId={courseId} />
        ))}

        {/* Add module */}
        <div className="px-5 py-4">
          {addingModule ? (
            <div className="flex gap-1">
              <input
                autoFocus
                value={newModTitle}
                onChange={(e) => setNewModTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddModule(); if (e.key === "Escape") setAddingModule(false); }}
                placeholder="Module title..."
                className="flex-1 rounded border border-primary/60 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder-gray-500"
              />
              <button onClick={handleAddModule} className="text-primary font-bold px-2 hover:text-primary-dark">✓</button>
              <button onClick={() => setAddingModule(false)} className="text-gray-500 px-1 hover:text-gray-300">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingModule(true)}
              className="flex w-full items-center gap-2 rounded-lg border border-primary/30 px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <PlusIcon className="w-4 h-4" /> Add Module
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-3 top-3 z-50 rounded-lg bg-slate-100 dark:bg-[#1a1f2e] p-2.5 text-slate-800 dark:text-white shadow-lg md:hidden"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? "Close course navigation" : "Open course navigation"}
      >
        {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed bottom-0 top-14 z-40 w-[min(86vw,20rem)] flex-shrink-0
        transition-transform duration-300 md:relative md:top-0 md:h-full md:w-72 xl:w-80
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {sidebar}
      </aside>
    </>
  );
}
