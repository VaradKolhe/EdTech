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
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function ModuleItem({ mod, courseId }) {
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
    <div className="mb-1">
      <div className="flex items-center gap-1 group px-2 py-2 rounded-lg hover:bg-sidebar-light cursor-pointer">
        <button onClick={() => setOpen((o) => !o)} className="flex-1 flex items-center gap-2 text-left">
          {open ? (
            <ChevronDownIcon className="w-4 h-4 text-primary flex-shrink-0" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold text-primary uppercase tracking-wider mr-1">
            {mod.moduleNumber}.
          </span>
          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleRenameModule}
              onKeyDown={(e) => e.key === "Enter" && handleRenameModule()}
              className="bg-sidebar-light text-white text-sm px-1 rounded w-full outline-none border border-primary"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm text-gray-200 font-medium truncate">{mod.title}</span>
          )}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary text-gray-400 transition-opacity"
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => dispatch(deleteModule(mod._id))}
          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-gray-400 transition-opacity"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="ml-6 mt-0.5 space-y-0.5">
          {mod.submodules?.map((sm) => (
            <div
              key={sm._id}
              className={`flex items-center justify-between group px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeId === sm._id
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-sidebar-light hover:text-gray-200"
              }`}
            >
              <span
                className="text-sm flex-1 truncate"
                onClick={() => handleSubmoduleClick(sm)}
              >
                {sm.title}
              </span>
              <button
                onClick={() => dispatch(deleteSubmodule({ id: sm._id, moduleId: mod._id }))}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          ))}

          {addingSubmodule ? (
            <div className="flex gap-1 px-1 py-1">
              <input
                autoFocus
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubmodule()}
                placeholder="Submodule title..."
                className="flex-1 bg-sidebar-light text-white text-xs px-2 py-1 rounded outline-none border border-primary"
              />
              <button onClick={handleAddSubmodule} className="text-primary text-xs font-bold px-1">✓</button>
              <button onClick={() => setAddingSubmodule(false)} className="text-gray-400 text-xs px-1">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSubmodule(true)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary px-3 py-1 w-full transition-colors"
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addingModule, setAddingModule] = useState(false);
  const [newModTitle, setNewModTitle] = useState("");

  const handleAddModule = () => {
    if (!newModTitle.trim()) return;
    dispatch(addModule({ courseId, title: newModTitle.trim(), moduleNumber: (modules?.length || 0) + 1 }));
    setNewModTitle("");
    setAddingModule(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-white">
      <div className="px-4 py-4 border-b border-gray-700">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Course Modules</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {modules?.map((mod) => (
          <ModuleItem key={mod._id} mod={mod} courseId={courseId} />
        ))}
        {addingModule ? (
          <div className="flex gap-1 px-2 py-2">
            <input
              autoFocus
              value={newModTitle}
              onChange={(e) => setNewModTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
              placeholder="Module title..."
              className="flex-1 bg-sidebar-light text-white text-sm px-2 py-1 rounded outline-none border border-primary"
            />
            <button onClick={handleAddModule} className="text-primary font-bold px-1">✓</button>
            <button onClick={() => setAddingModule(false)} className="text-gray-400 px-1">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setAddingModule(true)}
            className="flex items-center gap-2 w-full px-3 py-2 mt-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <PlusIcon className="w-4 h-4" /> Add Module
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-sidebar p-2 rounded-lg text-white shadow-lg"
        onClick={() => setMobileOpen((o) => !o)}
      >
        {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full w-72 flex-shrink-0 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
