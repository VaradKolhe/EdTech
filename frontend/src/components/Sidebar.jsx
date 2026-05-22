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
        className="flex items-center gap-2 px-4 py-2.5 cursor-pointer group hover:bg-white/5 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        {open
          ? <ChevronDownIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          : <ChevronRightIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        }
        <span className="text-xs font-bold text-primary mr-1">{mod.moduleNumber}.</span>
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRenameModule}
            onKeyDown={(e) => e.key === "Enter" && handleRenameModule()}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-white/10 text-white text-xs px-2 py-0.5 rounded outline-none border border-primary"
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-gray-200 truncate">{mod.title}</span>
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
              className={`flex items-center justify-between group pl-9 pr-3 py-2 cursor-pointer transition-colors ${
                activeId === sm._id
                  ? "bg-primary/20 border-l-2 border-primary text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent"
              }`}
            >
              <span className="text-sm truncate flex-1">{sm.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); dispatch(deleteSubmodule({ id: sm._id, moduleId: mod._id })); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-gray-500 transition-all"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          ))}

          {addingSubmodule ? (
            <div className="flex gap-1 pl-9 pr-3 py-1.5">
              <input
                autoFocus
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddSubmodule(); if (e.key === "Escape") setAddingSubmodule(false); }}
                placeholder="Submodule title..."
                className="flex-1 bg-white/10 text-white text-xs px-2 py-1 rounded outline-none border border-primary/60 placeholder-gray-500"
              />
              <button onClick={handleAddSubmodule} className="text-primary text-xs font-bold px-1.5 hover:text-primary-dark">✓</button>
              <button onClick={() => setAddingSubmodule(false)} className="text-gray-500 text-xs px-1 hover:text-gray-300">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSubmodule(true)}
              className="flex items-center gap-1.5 pl-9 pr-3 py-1.5 w-full text-xs text-gray-500 hover:text-primary transition-colors"
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
    <div className="flex flex-col h-full bg-[#1a1f2e] select-none">
      {/* Course title */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Course</p>
        <p className="text-sm font-semibold text-white truncate">{course?.title}</p>
      </div>

      {/* Modules label */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Modules</p>
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto">
        {modules?.map((mod) => (
          <ModuleItem key={mod._id} mod={mod} courseId={courseId} />
        ))}

        {/* Add module */}
        <div className="px-4 py-3">
          {addingModule ? (
            <div className="flex gap-1">
              <input
                autoFocus
                value={newModTitle}
                onChange={(e) => setNewModTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddModule(); if (e.key === "Escape") setAddingModule(false); }}
                placeholder="Module title..."
                className="flex-1 bg-white/10 text-white text-sm px-2 py-1.5 rounded outline-none border border-primary/60 placeholder-gray-500"
              />
              <button onClick={handleAddModule} className="text-primary font-bold px-2 hover:text-primary-dark">✓</button>
              <button onClick={() => setAddingModule(false)} className="text-gray-500 px-1 hover:text-gray-300">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingModule(true)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
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
        className="md:hidden fixed top-3 left-3 z-50 bg-[#1a1f2e] p-2 rounded-lg text-white shadow-lg"
        onClick={() => setMobileOpen((o) => !o)}
      >
        {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed md:relative z-40 h-full flex-shrink-0
        w-64 transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {sidebar}
      </aside>
    </>
  );
}
