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
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const getVal = (field, language, fallback = "") => {
  if (!field) return fallback;
  if (typeof field === "string") return field;
  const val = field[language] || field.en || field.hi || field.mr || fallback;
  return typeof val === "string" ? val : String(val || fallback);
};

function ModuleItem({ mod, courseId, isStudent }) {
  const { language } = useTheme();
  const dispatch = useDispatch();
  const activeId = useSelector((s) => s.course.activeSubmoduleId);
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const displayTitle = getVal(mod.moduleTitle || mod.title, language);
  const [title, setTitle] = useState(displayTitle);

  const [newSub, setNewSub] = useState("");
  const [addingSubmodule, setAddingSubmodule] = useState(false);
  const [submoduleSaving, setSubmoduleSaving] = useState(false);
  const [submoduleError, setSubmoduleError] = useState("");

  const handleSubmoduleClick = (sm) => {
    const id = sm._id || sm.submoduleId;
    dispatch(setActiveSubmodule(id));
    dispatch(fetchSubmoduleContent(id));
  };

  const handleAddSubmodule = async () => {
    if (!newSub.trim() || submoduleSaving) return;
    setSubmoduleSaving(true);
    setSubmoduleError("");

    try {
      await dispatch(addSubmodule({
        courseId,
        moduleId: mod._id || mod.moduleId,
        title: { en: newSub.trim(), hi: "", mr: "" },
      })).unwrap();
      setNewSub("");
      setAddingSubmodule(false);
    } catch (err) {
      setSubmoduleError(typeof err === "string" ? err : err?.message || "Failed to add submodule");
    } finally {
      setSubmoduleSaving(false);
    }
  };

  const handleRenameModule = () => {
    const id = mod._id || mod.moduleId;
    if (title.trim() && title !== mod.title)
      dispatch(updateModule({ id, title: title.trim() }));
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
          <span className="flex-1 truncate text-base font-semibold text-slate-700 dark:text-slate-200">{displayTitle}</span>
        )}
        
        {!isStudent && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditing(true)} className="p-1 hover:text-brand-600 dark:hover:text-brand-400 text-slate-400">
              <PencilIcon className="w-3 h-3" />
            </button>
            <button onClick={() => dispatch(deleteModule(mod._id || mod.moduleId))} className="p-1 hover:text-red-500 text-slate-400">
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Submodules */}
      {open && (
        <div className="pb-1">
          {mod.submodules?.map((sm) => {
            const smTitle = getVal(sm.submoduleTitle || sm.title, language);
            const smId = sm._id || sm.submoduleId;
            return (
              <div
                key={smId}
                onClick={() => handleSubmoduleClick(sm)}
                className={`group flex cursor-pointer items-center justify-between py-2.5 pl-11 pr-4 transition-colors ${
                  activeId === smId
                    ? "bg-brand-600/10 border-l-2 border-brand-600 text-brand-700 dark:text-white"
                    : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 border-l-2 border-transparent"
                }`}
              >
                <span className="flex-1 truncate text-base">{smTitle}</span>
                {!isStudent && (
                  <button
                    onClick={(e) => { e.stopPropagation(); dispatch(deleteSubmodule({ id: smId, moduleId: mod._id || mod.moduleId })); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-slate-400"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {!isStudent && (
            addingSubmodule ? (
              <div className="flex flex-wrap gap-1 py-2 pl-11 pr-4">
                <input
                  autoFocus
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddSubmodule(); if (e.key === "Escape") setAddingSubmodule(false); }}
                  disabled={submoduleSaving}
                  placeholder="Submodule title..."
                  className="flex-1 rounded border border-brand-400 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm outline-none placeholder-slate-500"
                />
                {submoduleError && <p className="basis-full text-xs font-bold text-red-500">{submoduleError}</p>}
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
  const { language } = useTheme();
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

  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowError, setWorkflowError] = useState("");

  const handleSubmitForReview = async () => {
    setWorkflowLoading(true);
    setWorkflowError("");
    try {
      await api.patch(`/courses/${courseId}/submit-review`);
      window.location.reload();
    } catch (err) {
      setWorkflowError(err.response?.data?.message || "Submission failed");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handlePayPlatformFee = async () => {
    setWorkflowLoading(true);
    setWorkflowError("");
    try {
      const { data } = await api.post(`/courses/${courseId}/platform-fee/order`);
      
      if (data.order?.devMode) {
        await api.post(`/courses/${courseId}/platform-fee/verify`, {
          razorpay_order_id: data.order.id,
          razorpay_payment_id: `pay_dev_${Date.now()}`,
          razorpay_signature: "dev",
        });
        window.location.reload();
        return;
      }

      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        setWorkflowError("Razorpay failed to load");
        return;
      }

      const checkout = new window.Razorpay({
        key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "EdTech Platform",
        description: "Course Publishing Fee",
        order_id: data.order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        handler: async (response) => {
          try {
            await api.post(`/courses/${courseId}/platform-fee/verify`, response);
            window.location.reload();
          } catch {
            setWorkflowError("Verification failed");
          }
        },
      });
      checkout.open();
    } catch (err) {
      setWorkflowError(err.response?.data?.message || "Payment initialization failed");
    } finally {
      setWorkflowLoading(false);
    }
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
        <p className="truncate text-lg font-black text-slate-900 dark:text-white leading-tight">{getVal(course?.title, language)}</p>
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
          <ModuleItem key={mod._id || mod.moduleId} mod={mod} courseId={courseId} isStudent={isStudent} />
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

      {/* Workflow Section */}
      {!isStudent && course && (
        <div className="border-t border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
              course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-600" :
              course.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-600" :
              course.status === "PAYMENT_PENDING" ? "bg-blue-100 text-blue-600" :
              course.status === "REJECTED" ? "bg-rose-100 text-rose-600" :
              "bg-slate-100 text-slate-500"
            }`}>
              {course.status.replace("_", " ")}
            </span>
          </div>

          {course.status === "REJECTED" && (
            <div className="mb-4 rounded-xl bg-rose-50 p-3 dark:bg-rose-900/10">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-600">
                <ExclamationCircleIcon className="h-3 w-3" /> Rejection Reason
              </p>
              <p className="mt-1 text-xs font-medium text-rose-700 dark:text-rose-400">
                {course.rejectionReason || "No reason provided."}
              </p>
            </div>
          )}

          {["DRAFT", "REJECTED"].includes(course.status) && (
            <button
              disabled={workflowLoading}
              onClick={handleSubmitForReview}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-black text-white transition-all hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              {workflowLoading ? "Submitting..." : "Submit for Review"}
            </button>
          )}

          {course.status === "PAYMENT_PENDING" && (
            <button
              disabled={workflowLoading}
              onClick={handlePayPlatformFee}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-black text-white transition-all hover:bg-brand-700 disabled:opacity-50"
            >
              <CreditCardIcon className="h-4 w-4" />
              {workflowLoading ? "Processing..." : "Pay Publishing Fee"}
            </button>
          )}

          {course.status === "PUBLISHED" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-black text-emerald-600 dark:bg-emerald-900/10">
              <CheckCircleIcon className="h-5 w-5" />
              Course Published
            </div>
          )}

          {workflowError && (
            <p className="mt-2 text-center text-[10px] font-bold text-rose-600">{workflowError}</p>
          )}
        </div>
      )}
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
