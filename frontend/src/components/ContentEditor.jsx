import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { saveContent, saveQuiz, updateSubmodule } from "../store/courseSlice";
import { PlusIcon, TrashIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";

function VideoBlock({ url }) {
  const videoId = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
  if (!videoId) return <p className="text-sm text-red-400">Invalid YouTube URL</p>;
  return (
    <div className="aspect-video rounded-xl overflow-hidden shadow-md">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="w-full h-full"
        allowFullScreen
        title="video"
      />
    </div>
  );
}

function QuizBlock({ quiz }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
      <p className="font-semibold text-gray-800 dark:text-gray-100 mb-3">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(opt)}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-colors ${
              selected === opt
                ? opt === quiz.correctAnswer
                  ? "bg-green-100 border-green-400 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-red-100 border-red-400 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected && (
        <p className={`mt-2 text-sm font-medium ${selected === quiz.correctAnswer ? "text-green-600" : "text-red-500"}`}>
          {selected === quiz.correctAnswer ? "✓ Correct!" : `✗ Correct answer: ${quiz.correctAnswer}`}
        </p>
      )}
    </div>
  );
}

function AddContentForm({ submoduleId, onClose }) {
  const dispatch = useDispatch();
  const [type, setType] = useState("text");
  const [value, setValue] = useState("");

  const handleSave = () => {
    if (!value.trim()) return;
    dispatch(saveContent({ submoduleId, type, value }));
    onClose();
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex gap-2 mb-3">
        {["text", "video"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              type === t ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            {t === "text" ? "📝 Text" : "🎬 Video"}
          </button>
        ))}
      </div>
      {type === "text" ? (
        <ReactQuill theme="snow" value={value} onChange={setValue} className="mb-3" />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm mb-3 outline-none focus:border-primary"
        />
      )}
      <div className="flex gap-2">
        <button onClick={handleSave} className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors">
          Save
        </button>
        <button onClick={onClose} className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function AddQuizForm({ submoduleId, onClose }) {
  const dispatch = useDispatch();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const handleSave = () => {
    const filtered = options.filter((o) => o.trim());
    if (!question.trim() || filtered.length < 2 || !correctAnswer) return;
    dispatch(saveQuiz({ submoduleId, question, options: filtered, correctAnswer }));
    onClose();
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-800 space-y-3">
      <h4 className="font-semibold text-gray-700 dark:text-gray-200">New Quiz Question</h4>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question..."
        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary"
      />
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={opt}
              onChange={(e) => setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))}
              placeholder={`Option ${i + 1}`}
              className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary"
            />
            <input
              type="radio"
              name="correct"
              checked={correctAnswer === opt && opt !== ""}
              onChange={() => setCorrectAnswer(opt)}
              className="accent-primary w-4 h-4"
              title="Mark as correct"
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">Select the radio button next to the correct answer</p>
      <div className="flex gap-2">
        <button onClick={handleSave} className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors">
          Save Quiz
        </button>
        <button onClick={onClose} className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ContentEditor() {
  const dispatch = useDispatch();
  const { activeSubmoduleId, submoduleContents, contentLoading, course } = useSelector((s) => s.course);
  const [showContentForm, setShowContentForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("");

  const activeSubmodule = course?.modules
    ?.flatMap((m) => m.submodules)
    ?.find((sm) => sm._id === activeSubmoduleId);

  const contentData = submoduleContents[activeSubmoduleId];

  const handleSpeak = (text) => {
    const stripped = text.replace(/<[^>]+>/g, "");
    const utterance = new SpeechSynthesisUtterance(stripped);
    window.speechSynthesis.speak(utterance);
  };

  const handleRenameSubmodule = () => {
    if (titleVal.trim() && titleVal !== activeSubmodule?.title)
      dispatch(updateSubmodule({ id: activeSubmoduleId, title: titleVal.trim() }));
    setEditingTitle(false);
  };

  if (!activeSubmoduleId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">📚</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Select a Submodule</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Choose a submodule from the sidebar to view and edit its content.
        </p>
      </div>
    );
  }

  if (contentLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        {editingTitle ? (
          <input
            autoFocus
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={handleRenameSubmodule}
            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmodule()}
            className="text-2xl font-bold bg-transparent border-b-2 border-primary outline-none flex-1 dark:text-white"
          />
        ) : (
          <h1
            className="text-2xl font-bold text-gray-800 dark:text-white cursor-pointer hover:text-primary transition-colors"
            onClick={() => { setEditingTitle(true); setTitleVal(activeSubmodule?.title || ""); }}
            title="Click to rename"
          >
            {activeSubmodule?.title}
          </h1>
        )}
      </div>

      {/* Content blocks */}
      <div className="space-y-4 mb-6">
        {contentData?.contents?.map((c, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {c.type === "text" ? "📝 Text" : "🎬 Video"}
              </span>
              {c.type === "text" && (
                <button
                  onClick={() => handleSpeak(c.value)}
                  className="text-gray-400 hover:text-primary transition-colors"
                  title="Text to Speech"
                >
                  <SpeakerWaveIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            {c.type === "text" ? (
              <div className="prose dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: c.value }} />
            ) : (
              <VideoBlock url={c.value} />
            )}
          </div>
        ))}

        {contentData?.quizzes?.map((q, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">🧠 Quiz</span>
            <QuizBlock quiz={q} />
          </div>
        ))}
      </div>

      {/* Add forms */}
      {showContentForm && (
        <div className="mb-4">
          <AddContentForm submoduleId={activeSubmoduleId} onClose={() => setShowContentForm(false)} />
        </div>
      )}
      {showQuizForm && (
        <div className="mb-4">
          <AddQuizForm submoduleId={activeSubmoduleId} onClose={() => setShowQuizForm(false)} />
        </div>
      )}

      {/* Action buttons */}
      {!showContentForm && !showQuizForm && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowContentForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" /> Add Content
          </button>
          <button
            onClick={() => setShowQuizForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" /> Add Quiz
          </button>
        </div>
      )}
    </div>
  );
}
