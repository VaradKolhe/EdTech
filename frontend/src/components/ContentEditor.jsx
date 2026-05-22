import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveBlocks, updateSubmodule } from "../store/courseSlice";
import {
  PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon,
  SpeakerWaveIcon, EyeIcon, EyeSlashIcon, CheckIcon,
} from "@heroicons/react/24/outline";

const LANGS = ["en", "hi", "mr"];
const LANG_LABEL = { en: "EN", hi: "HI", mr: "MR" };
const EMPTY_BLOCKS = [];

const hydrateBlocks = (blocks) =>
  blocks.map((b, i) => ({ ...b, _tempId: b._id || `tmp-${i}` }));

const newBlock = (type, order) => ({
  _tempId: Math.random().toString(36).slice(2),
  type,
  order,
  content: { en: "", hi: "", mr: "" },
  videoUrl: "",
  videoTitle: { en: "", hi: "", mr: "" },
  videoDuration: "",
  quizQuestions: [],
});

const newQuestion = () => ({
  _tempId: Math.random().toString(36).slice(2),
  question: { en: "", hi: "", mr: "" },
  options: ["", "", "", ""],
  correctAnswer: "",
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
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/5 px-2 py-1.5">
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
        className="min-h-[180px] px-3 py-3 text-sm leading-6 text-gray-100 outline-none prose prose-invert prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500 sm:px-4"
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
function BlockHeader({ label, color, lang, onLangChange, extra, onMoveUp, onMoveDown, onDelete, isFirst, isLast }) {
  return (
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2.5 sm:px-4">
      <span className={`min-w-0 flex-1 text-sm font-bold uppercase tracking-wider ${color}`}>{label}</span>
      <div className="flex flex-wrap items-center justify-end gap-1">
        <LangTabs active={lang} onChange={onLangChange} />
        {extra}
        <button onClick={onMoveUp} disabled={isFirst} className="p-1.5 text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors">
          <ChevronUpIcon className="w-3.5 h-3.5" />
        </button>
        <button onClick={onMoveDown} disabled={isLast} className="p-1.5 text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors">
          <ChevronDownIcon className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── TEXT block ──────────────────────────────────────────── */
function TextBlock({ block, lang, onLangChange, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [collapsed, setCollapsed] = useState(false);

  const speak = () => {
    const text = (block.content[lang] || "").replace(/<[^>]+>/g, "");
    if (!text) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  return (
    <div className="bg-[#141820] border border-white/10 rounded-xl overflow-hidden">
      <BlockHeader
        label="📝 Text" color="text-blue-400"
        lang={lang} onLangChange={onLangChange}
        isFirst={isFirst} isLast={isLast}
        onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete}
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
        <div className="p-3 sm:p-4">
          <RichTextEditor
            value={block.content[lang] || ""}
            onChange={(val) => onChange({ content: { ...block.content, [lang]: val } })}
          />
        </div>
      )}
    </div>
  );
}

/* ── VIDEO block ─────────────────────────────────────────── */
function VideoBlock({ block, lang, onLangChange, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="bg-[#141820] border border-white/10 rounded-xl overflow-hidden">
      <BlockHeader
        label="🎬 Video" color="text-purple-400"
        lang={lang} onLangChange={onLangChange}
        isFirst={isFirst} isLast={isLast}
        onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete}
        extra={
          <button onClick={() => setPreview((p) => !p)} className="p-1.5 text-gray-500 hover:text-primary transition-colors" title="Toggle preview">
            {preview ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
          </button>
        }
      />
      <div className="space-y-3 p-4 sm:p-5">
        <input
          value={block.videoTitle[lang] || ""}
          onChange={(e) => onChange({ videoTitle: { ...block.videoTitle, [lang]: e.target.value } })}
          placeholder={`Video title (${LANG_LABEL[lang]})...`}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none placeholder-gray-500 focus:border-primary"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={block.videoUrl || ""}
            onChange={(e) => onChange({ videoUrl: e.target.value })}
            placeholder="YouTube or S3 URL..."
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none placeholder-gray-500 focus:border-primary"
          />
          <input
            value={block.videoDuration || ""}
            onChange={(e) => onChange({ videoDuration: e.target.value })}
            placeholder="Duration"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none placeholder-gray-500 focus:border-primary sm:w-32"
          />
        </div>
        {preview && block.videoUrl && <VideoEmbed url={block.videoUrl} />}
      </div>
    </div>
  );
}

/* ── QUIZ block ──────────────────────────────────────────── */
function QuizBlock({ block, lang, onLangChange, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [preview, setPreview] = useState(false);
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
    <div className="bg-[#141820] border border-white/10 rounded-xl overflow-hidden">
      <BlockHeader
        label={`🧠 Quiz · ${block.quizQuestions?.length || 0} questions`} color="text-yellow-400"
        lang={lang} onLangChange={onLangChange}
        isFirst={isFirst} isLast={isLast}
        onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete}
        extra={
          <button onClick={() => { setPreview((p) => !p); setAnswers({}); }} className="p-1.5 text-gray-500 hover:text-primary transition-colors" title="Preview">
            {preview ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
          </button>
        }
      />
      <div className="space-y-4 p-4 sm:p-5">
        {preview ? (
          (block.quizQuestions || []).map((q, qi) => (
            <div key={qi} className="rounded-lg bg-white/5 p-3 sm:p-4">
              <p className="font-semibold text-white mb-3">{q.question[lang] || q.question.en || `Question ${qi + 1}`}</p>
              <div className="space-y-2">
                {q.options.filter(Boolean).map((opt, oi) => {
                  const sel = answers[qi];
                  let cls = "w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ";
                  if (!sel) cls += "border-white/10 text-gray-300 hover:border-primary hover:bg-primary/10";
                  else if (sel === opt && opt === q.correctAnswer) cls += "border-green-500 bg-green-500/20 text-green-300";
                  else if (sel === opt) cls += "border-red-500 bg-red-500/20 text-red-300";
                  else if (opt === q.correctAnswer) cls += "border-green-500/50 bg-green-500/10 text-green-400";
                  else cls += "border-white/5 text-gray-500 opacity-60";
                  return <button key={oi} onClick={() => !sel && setAnswers((a) => ({ ...a, [qi]: opt }))} className={cls}>{opt}</button>;
                })}
              </div>
              {answers[qi] && (
                <p className={`text-xs font-semibold mt-2 ${answers[qi] === q.correctAnswer ? "text-green-400" : "text-red-400"}`}>
                  {answers[qi] === q.correctAnswer ? "✓ Correct!" : `✗ Correct: ${q.correctAnswer}`}
                </p>
              )}
            </div>
          ))
        ) : (
          <>
            {(block.quizQuestions || []).map((q, qi) => (
              <div key={q._tempId || qi} className="space-y-3 rounded-lg bg-white/5 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">Q{qi + 1}</span>
                  <button onClick={() => removeQuestion(qi)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  value={q.question[lang] || ""}
                  onChange={(e) => updateQuestion(qi, { question: { ...q.question, [lang]: e.target.value } })}
                  placeholder={`Question (${LANG_LABEL[lang]})...`}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white outline-none placeholder-gray-500 focus:border-primary"
                />
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${block._tempId || block._id}-${qi}`}
                        checked={q.correctAnswer === opt && opt !== ""}
                        onChange={() => updateQuestion(qi, { correctAnswer: opt })}
                        className="accent-primary w-4 h-4 flex-shrink-0"
                      />
                      <input
                        value={opt}
                        onChange={(e) => {
                          updateOption(qi, oi, e.target.value);
                          if (q.correctAnswer === opt) updateQuestion(qi, { correctAnswer: e.target.value });
                        }}
                        placeholder={`Option ${oi + 1}`}
                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white outline-none placeholder-gray-500 focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
                {q.correctAnswer && <p className="text-xs text-green-400">✓ Correct: {q.correctAnswer}</p>}
              </div>
            ))}
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 w-full px-4 py-2.5 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors justify-center"
            >
              <PlusIcon className="w-4 h-4" /> Add Question
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
  const { activeSubmoduleId, submoduleContents, contentLoading, course } = useSelector((s) => s.course);
  const [lang, setLang] = useState("en");
  const [draft, setDraft] = useState({ submoduleId: null, sourceBlocks: EMPTY_BLOCKS, blocks: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("");

  const contentData = submoduleContents[activeSubmoduleId];
  const sourceBlocks = contentData?.blocks ?? EMPTY_BLOCKS;
  const activeSubmodule = course?.modules?.flatMap((m) => m.submodules)?.find((sm) => sm._id === activeSubmoduleId);
  let blocks = draft.blocks;

  if (draft.submoduleId !== activeSubmoduleId || draft.sourceBlocks !== sourceBlocks) {
    blocks = hydrateBlocks(sourceBlocks);
    setDraft({ submoduleId: activeSubmoduleId, sourceBlocks, blocks });
    if (editingTitle) setEditingTitle(false);
  }

  const setBlocks = useCallback((updater) => {
    setDraft((prev) => ({
      ...prev,
      blocks: typeof updater === "function" ? updater(prev.blocks) : updater,
    }));
  }, []);

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
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#0e1117]">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
          <span className="text-4xl">📚</span>
        </div>
        <h2 className="text-xl font-bold text-gray-200 mb-2">Select a Submodule</h2>
        <p className="text-gray-500 text-sm text-center max-w-xs">
          Pick a submodule from the left sidebar to start building your lesson.
        </p>
      </div>
    );
  }

  if (contentLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0e1117]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
  });

  return (
    <div className="flex h-full min-w-0 flex-col bg-[#0e1117]">

      {/* ── Sticky top toolbar ── */}
      <div className="flex flex-shrink-0 flex-col gap-3 border-b border-white/10 bg-[#141820] px-4 py-3 sm:px-7 lg:flex-row lg:items-center">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        <button onClick={() => addBlock("TEXT")} className="flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/20 px-2.5 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-600/30 sm:px-4">
          <PlusIcon className="h-4 w-4" /> Add Text
        </button>
        <button onClick={() => addBlock("VIDEO")} className="flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-600/20 px-2.5 py-2 text-sm font-semibold text-purple-400 transition-colors hover:bg-purple-600/30 sm:px-4">
          <PlusIcon className="h-4 w-4" /> Add Video
        </button>
        <button onClick={() => addBlock("QUIZ")} className="flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-yellow-500/30 bg-yellow-600/20 px-2.5 py-2 text-sm font-semibold text-yellow-400 transition-colors hover:bg-yellow-600/30 sm:px-4">
          <PlusIcon className="h-4 w-4" /> Add Quiz
        </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 lg:ml-auto lg:justify-end">
          <LangTabs active={lang} onChange={setLang} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <CheckIcon className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Lesson"}
          </button>
          {saved && <span className="text-xs text-green-400 font-semibold">✓ Saved!</span>}
          {saveError && <span className="text-xs font-semibold text-red-400">{saveError}</span>}
        </div>
      </div>

      {/* ── Lesson title ── */}
      <div className="flex-shrink-0 border-b border-white/10 bg-[#141820] px-4 py-4 sm:px-7">
        {editingTitle ? (
          <input
            autoFocus value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={handleRenameSubmodule}
            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmodule()}
            className="w-full border-b-2 border-primary bg-transparent text-xl font-bold text-white outline-none sm:text-2xl"
          />
        ) : (
          <h1
            className="cursor-pointer truncate text-xl font-bold text-white transition-colors hover:text-primary sm:text-2xl"
            onClick={() => { setEditingTitle(true); setTitleVal(activeSubmodule?.title || ""); }}
            title="Click to rename"
          >
            {activeSubmodule?.title}
          </h1>
        )}
      </div>

      {/* ── Blocks area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-7">
        {blocks.length === 0 ? (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-primary/10">
              <span className="text-5xl">📚</span>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-200">Start building this lesson</h3>
            <p className="mb-7 max-w-md text-base leading-6 text-gray-500">Add text, video, or quiz blocks to create a complete learning experience.</p>
            <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              <button onClick={() => addBlock("TEXT")} className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/20 px-4 py-3 text-base font-semibold text-blue-400 transition-colors hover:bg-blue-600/30">
                <PlusIcon className="w-4 h-4" /> Add Text
              </button>
              <button onClick={() => addBlock("VIDEO")} className="flex items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-600/20 px-4 py-3 text-base font-semibold text-purple-400 transition-colors hover:bg-purple-600/30">
                <PlusIcon className="w-4 h-4" /> Add Video
              </button>
              <button onClick={() => addBlock("QUIZ")} className="flex items-center justify-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-600/20 px-4 py-3 text-base font-semibold text-yellow-400 transition-colors hover:bg-yellow-600/30">
                <PlusIcon className="w-4 h-4" /> Add Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl space-y-5">
            {blocks.map((block, idx) => {
              const props = { key: block._tempId, block, ...sharedBlockProps(block, idx) };
              if (block.type === "TEXT") return <TextBlock {...props} />;
              if (block.type === "VIDEO") return <VideoBlock {...props} />;
              if (block.type === "QUIZ") return <QuizBlock {...props} />;
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
