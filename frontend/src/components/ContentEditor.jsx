import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveBlocks, updateSubmodule } from "../store/courseSlice";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import { getLocalizedValue } from "../utils/localize";
import ContentBlockViewer from "./student/ContentBlockViewer";
import {
  PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon,
  SpeakerWaveIcon, EyeIcon, EyeSlashIcon, CheckIcon,
} from "@heroicons/react/24/outline";

const LANGS = ["en", "hi", "mr"];
const LANG_LABEL = { en: "EN", hi: "HI", mr: "MR" };
const EMPTY_BLOCKS = [];

const hydrateBlocks = (blocks) =>
  (blocks || []).map((b, i) => ({ 
    ...b, 
    _tempId: b._tempId || b._id || b.blockId || `b-${i}-${Date.now()}` 
  }));

const newBlock = (type, order) => ({
  _tempId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  type,
  order,
  title: { en: "", hi: "", mr: "" },
  textContent: { en: "", hi: "", mr: "" },
  video: { type: null, url: "", provider: null },
  quizQuestions: [],
});

const newQuestion = () => ({
  _tempId: `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  question: { en: "", hi: "", mr: "" },
  options: ["", "", "", ""],
  correctAnswer: "",
  correctAnswerIndex: -1,
});

/* ── Rich text editor ───────────────────────────────────── */
function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== value) editor.innerHTML = value || "";
  }, [value]);

  const emitChange = () => onChange(editorRef.current?.innerHTML || "");

  const runCommand = (command, arg = null) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    emitChange();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-2 py-1.5">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand("bold")} className="w-8 h-8 rounded-md text-sm font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors" title="Bold">
          B
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand("italic")} className="w-8 h-8 rounded-md text-sm italic text-gray-300 hover:bg-white/10 hover:text-white transition-colors" title="Italic">
          I
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand("insertUnorderedList")} className="w-8 h-8 rounded-md text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors" title="Bullet list">
          •
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand("formatBlock", "h2")} className="h-8 px-2 rounded-md text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors" title="Heading">
          H2
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand("formatBlock", "p")} className="h-8 px-2 rounded-md text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors" title="Paragraph">
          P
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        className="min-h-[180px] px-3 py-3 text-sm leading-6 text-slate-800 dark:text-gray-100 outline-none prose dark:prose-invert prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500 sm:px-4"
        data-placeholder="Write lesson content here..."
      />
    </div>
  );
}

/* ── Lang tabs ───────────────────────────────────────────── */
function LangTabs({ active, onChange }) {
  return (
    <div className="flex gap-1">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={(e) => { e.stopPropagation(); onChange(l); }}
          className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
            active === l ? "bg-primary text-white" : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
          }`}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

/* ── YouTube embed ───────────────────────────────────────── */
function VideoEmbed({ url }) {
  const id = url?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
  if (!id) return null;
  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black mt-3">
      <iframe src={`https://www.youtube.com/embed/${id}`} className="w-full h-full" allowFullScreen title="preview" />
    </div>
  );
}

/* ── Block header row (shared) ───────────────────────────── */
function BlockHeader({ label, color, lang, onLangChange, extra, onMoveUp, onMoveDown, onDelete, isFirst, isLast, isStudent }) {
  return (
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-2.5 sm:px-4">
      <span className={`min-w-0 flex-1 text-sm font-bold uppercase tracking-wider ${color}`}>{label}</span>
      <div className="flex flex-wrap items-center justify-end gap-1">
        {!isStudent && <LangTabs active={lang} onChange={onLangChange} />}
        {extra}
        {!isStudent && (
          <>
            <button onClick={onMoveUp} disabled={isFirst} className="p-1.5 text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors">
              <ChevronUpIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={onMoveDown} disabled={isLast} className="p-1.5 text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors">
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── TEXT block ──────────────────────────────────────────── */
function TextBlock({ block, lang, onLangChange, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, isStudent }) {
  const [collapsed, setCollapsed] = useState(false);

  const speak = () => {
    const text = (getLocalizedValue(block.textContent, lang) || "").replace(/<[^>]+>/g, "");
    if (!text) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  return (
    <div className="bg-white dark:bg-[#141820] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
      <BlockHeader
        label="📝 Text" color="text-blue-400"
        lang={lang} onLangChange={onLangChange}
        isFirst={isFirst} isLast={isLast}
        onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete}
        isStudent={isStudent}
        extra={
          <>
            <button onClick={speak} className="p-1.5 text-gray-500 hover:text-primary transition-colors" title="Read aloud">
              <SpeakerWaveIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setCollapsed((c) => !c)} className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors">
              {collapsed ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronUpIcon className="w-3.5 h-3.5" />}
            </button>
          </>
        }
      />
      {!collapsed && (
        <div className="p-5 sm:p-7">
          {isStudent ? (
            <div 
              className="prose dark:prose-invert prose-slate max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: getLocalizedValue(block.textContent, lang) || "<p className='italic text-slate-500'>No content available in this language.</p>" }}
            />
          ) : (
            <RichTextEditor
              value={getLocalizedValue(block.textContent, lang) || ""}
              onChange={(val) => onChange({ textContent: { ...(block.textContent || {}), [lang]: val } })}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ── VIDEO block ─────────────────────────────────────────── */
function VideoBlock({ block, lang, onLangChange, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, isStudent, courseId, moduleId, submoduleId }) {
  const [preview, setPreview] = useState(true);
  const [mode, setMode] = useState(block.video?.type === "external" ? "link" : "upload");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("video", file);
    try {
      const res = await api.post(`/instructor/courses/${courseId}/modules/${moduleId}/submodules/${submoduleId}/upload-video`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onChange({ video: res.data.video });
    } catch {
      alert("Video upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    onChange({ video: { type: null, url: "", provider: null, originalName: "", storedName: "", mimeType: "", size: 0 } });
  };

  const videoUrl = block.video?.url || block.videoUrl || "";
  const videoTitle = getLocalizedValue(block.title || block.videoTitle, lang);

  return (
    <div className="bg-white dark:bg-[#141820] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
      <BlockHeader
        label="🎬 Video" color="text-purple-400"
        lang={lang} onLangChange={onLangChange}
        isFirst={isFirst} isLast={isLast}
        onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete}
        isStudent={isStudent}
        extra={
          !isStudent && (
            <button onClick={() => setPreview((p) => !p)} className="p-1.5 text-gray-500 hover:text-primary transition-colors" title="Toggle preview">
              {preview ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
            </button>
          )
        }
      />
      <div className="p-5 sm:p-7">
        {!isStudent ? (
          <div className="space-y-4 mb-6">
            <input
              value={videoTitle || ""}
              onChange={(e) => onChange({ title: { ...(block.title || {}), [lang]: e.target.value } })}
              placeholder={`Video title (${LANG_LABEL[lang]})...`}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none placeholder-gray-500 focus:border-primary"
            />
            
            <div className="flex gap-2">
              <button 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${mode === "upload" ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                onClick={() => setMode("upload")}
              >
                Upload File
              </button>
              <button 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${mode === "link" ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                onClick={() => setMode("link")}
              >
                External Link
              </button>
            </div>

            {mode === "link" ? (
              <div className="flex flex-col gap-3 sm:flex-row items-center">
                <input
                  value={videoUrl}
                  onChange={(e) => onChange({ video: { ...block.video, url: e.target.value, type: "external", provider: e.target.value.includes("youtube") ? "youtube" : "direct" } })}
                  placeholder="YouTube, Vimeo, or Direct URL..."
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none placeholder-gray-500 focus:border-primary"
                />
                <input
                  value={block.durationMinutes || ""}
                  onChange={(e) => onChange({ durationMinutes: Number(e.target.value) || 0 })}
                  placeholder="Mins"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none placeholder-gray-500 focus:border-primary sm:w-24"
                />
                {videoUrl && (
                  <button onClick={removeVideo} className="text-xs font-bold text-red-500 hover:text-red-400 px-2">
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row items-center bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-dashed border-slate-300 dark:border-white/10">
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleUpload} 
                  disabled={uploading}
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                {uploading && <span className="text-xs font-bold text-brand-600 animate-pulse">Uploading...</span>}
                {!uploading && videoUrl?.startsWith("/uploads") && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-green-500 truncate max-w-[150px] block" title={block.video?.originalName}>
                      ✓ {block.video?.originalName || "Video uploaded"}
                    </span>
                    <button onClick={removeVideo} className="text-xs font-bold text-red-500 hover:text-red-400">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {videoTitle || "Course Video"}
            </h4>
          </div>
        )}
        {preview && videoUrl && <VideoEmbed url={videoUrl} />}
      </div>
    </div>
  );
}

/* ── QUIZ block ──────────────────────────────────────────── */
function QuizBlock({ block, lang, onLangChange, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, isStudent }) {
  const [preview, setPreview] = useState(isStudent);
  const [answers, setAnswers] = useState({});

  const updateQuestion = (qi, patch) =>
    onChange({ quizQuestions: block.quizQuestions.map((q, i) => i === qi ? { ...q, ...patch } : q) });

  const updateOption = (qi, oi, val) =>
    onChange({
      quizQuestions: block.quizQuestions.map((q, i) => {
        if (i !== qi) return q;
        return { ...q, options: q.options.map((o, j) => j === oi ? val : o) };
      }),
    });

  const addQuestion = () => onChange({ quizQuestions: [...(block.quizQuestions || []), newQuestion()] });
  const removeQuestion = (qi) => onChange({ quizQuestions: block.quizQuestions.filter((_, i) => i !== qi) });

  return (
    <div className="bg-white dark:bg-[#141820] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
      <BlockHeader
        label={`🧠 Quiz · ${block.quizQuestions?.length || 0} questions`} color="text-yellow-400"
        lang={lang} onLangChange={onLangChange}
        isFirst={isFirst} isLast={isLast}
        onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete}
        isStudent={isStudent}
        extra={
          !isStudent && (
            <button onClick={() => { setPreview((p) => !p); setAnswers({}); }} className="p-1.5 text-gray-500 hover:text-primary transition-colors" title="Preview">
              {preview ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
            </button>
          )
        }
      />
      <div className="space-y-6 p-5 sm:p-7">
        {preview ? (
          (block.quizQuestions || []).map((q, qi) => (
            <div key={qi} className="rounded-2xl bg-slate-50 dark:bg-white/5 p-5 sm:p-6 border border-slate-100 dark:border-white/5">
              <p className="font-bold text-lg text-slate-900 dark:text-white mb-5">
                <span className="text-brand-600 dark:text-brand-400 mr-2">Q{qi + 1}.</span>
                {getLocalizedValue(q.question, lang) || `Question ${qi + 1}`}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt, oi) => {
                  const optText = getLocalizedValue(opt, lang);
                  const sel = answers[qi];
                  let cls = "w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold border transition-all ";
                  if (!sel) cls += "border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10";
                  else if (sel === optText && optText === q.correctAnswer) cls += "border-green-500 bg-green-500/10 text-green-600 dark:text-green-300";
                  else if (sel === optText) cls += "border-red-500 bg-red-500/10 text-red-600 dark:text-red-300";
                  else if (optText === q.correctAnswer) cls += "border-green-500/50 bg-green-500/5 dark:bg-green-500/10 text-green-500 dark:text-green-400";
                  else cls += "border-slate-100 dark:border-white/5 text-slate-400 dark:text-gray-500 opacity-60";
                  return <button key={oi} onClick={() => !sel && setAnswers((a) => ({ ...a, [qi]: optText }))} className={cls}>{optText}</button>;
                })}
              </div>
            </div>
          ))
        ) : (
          <>
            {(block.quizQuestions || []).map((q, qi) => (
              <div key={q._tempId || qi} className="space-y-4 rounded-2xl bg-white/5 p-5 sm:p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Question {qi + 1}</span>
                  <button onClick={() => removeQuestion(qi)} className="text-slate-500 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <input
                  value={getLocalizedValue(q.question, lang) || ""}
                  onChange={(e) => updateQuestion(qi, { question: { ...(q.question || {}), [lang]: e.target.value } })}
                  placeholder={`Question text (${LANG_LABEL[lang]})...`}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none placeholder-gray-500 focus:border-primary"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${block._tempId || block._id}-${qi}`}
                        checked={(q.correctAnswerIndex === oi || (q.correctAnswer === getLocalizedValue(opt, lang) && q.correctAnswer !== "")) && getLocalizedValue(opt, lang) !== ""}
                        onChange={() => updateQuestion(qi, { correctAnswer: getLocalizedValue(opt, lang), correctAnswerIndex: oi })}
                        className="accent-brand-600 w-4 h-4 flex-shrink-0"
                      />
                      <input
                        value={getLocalizedValue(opt, lang) || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newOpt = { ...(typeof opt === 'object' ? opt : {}), [lang]: val };
                          
                          // Consolidate updates to avoid double state trigger
                          const isCorrect = q.correctAnswerIndex === oi || (q.correctAnswer === getLocalizedValue(opt, lang) && q.correctAnswer !== "");
                          
                          const newQuestions = block.quizQuestions.map((question, i) => {
                            if (i !== qi) return question;
                            const newOptions = question.options.map((o, j) => j === oi ? newOpt : o);
                            return { 
                              ...question, 
                              options: newOptions,
                              ...(isCorrect ? { correctAnswer: val } : {})
                            };
                          });
                          
                          onChange({ quizQuestions: newQuestions });
                        }}
                        placeholder={`Option ${oi + 1}`}
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder-gray-500 focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 w-full px-4 py-4 border-2 border-dashed border-white/10 rounded-2xl text-sm font-bold text-slate-500 hover:border-brand-500 hover:text-brand-500 transition-colors justify-center"
            >
              <PlusIcon className="w-5 h-5" /> Add New Question
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main ContentEditor ──────────────────────────────────── */

export default function ContentEditor() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { appLanguage } = useTheme();
  const { activeSubmoduleId, submoduleContents, contentLoading, course } = useSelector((s) => s.course);
  const [lang, setLang] = useState(appLanguage || "en");
  const [draft, setDraft] = useState({ submoduleId: null, sourceBlocks: null, blocks: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("");

  const isStudent = user?.role === "student";

  const contentData = submoduleContents[activeSubmoduleId];
  const sourceBlocks = contentData?.blocks || EMPTY_BLOCKS;
  const activeSubmodule = course?.modules?.flatMap((m) => m.submodules)?.find((sm) => (sm._id || sm.submoduleId) === activeSubmoduleId);
  const activeModule = course?.modules?.find(m => m.submodules?.some(sm => (sm._id || sm.submoduleId) === activeSubmoduleId));
  const moduleId = activeModule?._id || activeModule?.moduleId || "draft";

  useEffect(() => {
    if (activeSubmoduleId && (draft.submoduleId !== activeSubmoduleId || draft.sourceBlocks !== sourceBlocks)) {
      setDraft({
        submoduleId: activeSubmoduleId,
        sourceBlocks: sourceBlocks,
        blocks: hydrateBlocks(sourceBlocks)
      });
      if (editingTitle) setEditingTitle(false);
    }
  }, [activeSubmoduleId, sourceBlocks, draft.submoduleId, draft.sourceBlocks, editingTitle]);

  const blocks = draft.blocks;

  const setBlocks = useCallback((updater) => {
    if (isStudent) return;
    setDraft((prev) => ({
      ...prev,
      blocks: typeof updater === "function" ? updater(prev.blocks) : updater,
    }));
  }, [isStudent]);

  const addBlock = (type) =>
    setBlocks((prev) => [...prev, newBlock(type, prev.length)]);

  const updateBlock = useCallback((tempId, patch) =>
    setBlocks((prev) => prev.map((b) => b._tempId === tempId ? { ...b, ...patch } : b)), [setBlocks]);

  const deleteBlock = (tempId) =>
    setBlocks((prev) => prev.filter((b) => b._tempId !== tempId));

  const moveBlock = (tempId, dir) =>
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b._tempId === tempId);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next.map((b, i) => ({ ...b, order: i }));
    });

  const handleSave = async () => {
    if (isStudent) return;
    setSaving(true);
    setSaveError("");
    const clean = blocks.map((block, i) => {
      const rest = { ...block, order: i };
      delete rest._tempId;
      return rest;
    });
    try {
      await dispatch(saveBlocks({ id: activeSubmoduleId, blocks: clean })).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(typeof err === "string" ? err : err?.message || "Could not save lesson content.");
    } finally {
      setSaving(false);
    }
  };

  const handleRenameSubmodule = () => {
    if (titleVal.trim() && titleVal !== activeSubmodule?.title)
      dispatch(updateSubmodule({ id: activeSubmoduleId, title: titleVal.trim() }));
    setEditingTitle(false);
  };

  /* No submodule selected */
  if (!activeSubmoduleId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-white dark:bg-[#0b0e14]">
        <div className="w-24 h-24 bg-brand-600/10 rounded-3xl flex items-center justify-center mb-8">
          <span className="text-5xl">📚</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Select a Lesson</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs font-medium">
          Choose a submodule from the sidebar to start your learning session.
        </p>
      </div>
    );
  }

  if (contentLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0b0e14]">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sharedBlockProps = (block, idx) => ({
    lang,
    onLangChange: setLang,
    onChange: (p) => updateBlock(block._tempId, p),
    onDelete: () => deleteBlock(block._tempId),
    onMoveUp: () => moveBlock(block._tempId, -1),
    onMoveDown: () => moveBlock(block._tempId, 1),
    isFirst: idx === 0,
    isLast: idx === blocks.length - 1,
    isStudent,
    courseId: course?._id || "draft",
    moduleId,
    submoduleId: activeSubmoduleId || "draft",
  });

  const getVal = (field, fallback = "") => {
    if (!field) return fallback;
    if (typeof field === "string") return field;
    const val = field[lang] || field.en || field.hi || field.mr || fallback;
    return typeof val === "string" ? val : String(val || fallback);
  };

  return (
    <div className="flex h-full min-w-0 flex-col bg-white dark:bg-[#0b0e14]">

      {/* ── Sticky top toolbar (Instructor only) ── */}
      {!isStudent && (
        <div className="flex flex-shrink-0 flex-col gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0e14] px-6 py-4 lg:flex-row lg:items-center">
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
            <button onClick={() => addBlock("TEXT")} className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-600/10 px-3 py-2 text-xs font-bold text-blue-500 transition-all hover:bg-blue-600/20">
              <PlusIcon className="h-4 w-4" /> Add Text
            </button>
            <button onClick={() => addBlock("VIDEO")} className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-600/10 px-3 py-2 text-xs font-bold text-purple-500 transition-all hover:bg-purple-600/20">
              <PlusIcon className="h-4 w-4" /> Add Video
            </button>
            <button onClick={() => addBlock("QUIZ")} className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-yellow-500/30 bg-yellow-600/10 px-3 py-2 text-xs font-bold text-yellow-600 transition-all hover:bg-yellow-600/20">
              <PlusIcon className="h-4 w-4" /> Add Quiz
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 lg:ml-auto lg:justify-end">
            <LangTabs active={lang} onChange={setLang} />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <CheckIcon className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Lesson"}
            </button>
            {saved && <span className="text-xs text-green-500 font-bold">✓ Saved!</span>}
            {saveError && <span className="text-xs font-bold text-red-500">{saveError}</span>}
          </div>
        </div>
      )}

      {/* ── Lesson title ── */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0e14] px-6 py-6 sm:px-10">
        {isStudent ? (
          <div className="flex items-center justify-between gap-4">
            <h1 className="truncate text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              {getVal(activeSubmodule?.submoduleTitle || activeSubmodule?.title || "Lesson")}
            </h1>
            <LangTabs active={lang} onChange={setLang} />
          </div>
        ) : editingTitle ? (
          <input
            autoFocus value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={handleRenameSubmodule}
            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmodule()}
            className="w-full border-b-2 border-brand-600 bg-transparent text-2xl font-black text-slate-900 dark:text-white outline-none sm:text-3xl"
          />
        ) : (
          <h1
            className="cursor-pointer truncate text-2xl font-black text-slate-900 dark:text-white transition-colors hover:text-brand-600 sm:text-3xl"
            onClick={() => { setEditingTitle(true); setTitleVal(getVal(activeSubmodule?.submoduleTitle || activeSubmodule?.title || "Lesson")); }}
            title="Click to rename"
          >
            {getVal(activeSubmodule?.submoduleTitle || activeSubmodule?.title || "Lesson")}
          </h1>
        )}
      </div>

      {/* ── Blocks area ── */}
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-12 bg-slate-50 dark:bg-[#080b11]">
        {blocks.length === 0 ? (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-600/10">
              <span className="text-5xl">📖</span>
            </div>
            <h3 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">This lesson is empty</h3>
            <p className="mb-10 max-w-sm text-base text-slate-500 font-medium leading-relaxed">
              {isStudent ? "The instructor hasn't added any content to this lesson yet." : "Add text, video, or quiz blocks to create a complete learning experience."}
            </p>
            {!isStudent && (
              <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-3">
                <button onClick={() => addBlock("TEXT")} className="flex items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-white dark:bg-slate-900 px-4 py-4 text-sm font-bold text-blue-500 shadow-sm transition-all hover:bg-blue-50">
                  <PlusIcon className="w-4 h-4" /> Add Text
                </button>
                <button onClick={() => addBlock("VIDEO")} className="flex items-center justify-center gap-2 rounded-2xl border border-purple-500/20 bg-white dark:bg-slate-900 px-4 py-4 text-sm font-bold text-purple-500 shadow-sm transition-all hover:bg-purple-50">
                  <PlusIcon className="w-4 h-4" /> Add Video
                </button>
                <button onClick={() => addBlock("QUIZ")} className="flex items-center justify-center gap-2 rounded-2xl border border-yellow-500/20 bg-white dark:bg-slate-900 px-4 py-4 text-sm font-bold text-yellow-600 shadow-sm transition-all hover:bg-yellow-50">
                  <PlusIcon className="w-4 h-4" /> Add Quiz
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-10">
            {blocks.map((block, idx) => {
              const props = { block, ...sharedBlockProps(block, idx) };
              const key = block._tempId || block._id || block.blockId || idx;
              
              if (isStudent) {
                return (
                  <div key={key} className="bg-white dark:bg-[#141820] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <ContentBlockViewer 
                      block={{ ...block, moduleId: activeModule?.moduleId || activeModule?._id, submoduleId: activeSubmoduleId }} 
                      language={lang} 
                      isPreview={true} 
                    />
                  </div>
                );
              }

              if (block.type === "TEXT") return <TextBlock key={key} {...props} />;
              if (block.type === "VIDEO") return <VideoBlock key={key} {...props} />;
              if (block.type === "QUIZ") return <QuizBlock key={key} {...props} />;
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
