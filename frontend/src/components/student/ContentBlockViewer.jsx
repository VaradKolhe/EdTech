import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useParams } from "react-router-dom";
import AIAssistPanel from "./AIAssistPanel";
import { useTheme } from "../../context/ThemeContext";

function VideoPlayer({ url, title }) {
  const youtubeId = url?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
  if (!url) {
    return <div className="rounded-2xl bg-slate-100 p-8 text-center text-slate-500 dark:bg-slate-800">Video is unavailable.</div>;
  }
  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-black">
      {youtubeId ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title || "Course video"}
          className="h-full w-full"
          allowFullScreen
        />
      ) : (
        <video src={url} controls className="h-full w-full" />
      )}
    </div>
  );
}

function TextContentViewer({ html }) {
  return (
    <div
      className="prose prose-slate max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html || "<p>No text content available.</p>" }}
    />
  );
}

export default function ContentBlockViewer({ block, onComplete }) {
  const { language } = useTheme();
  const { courseId } = useParams();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState("");

  const loadQuiz = async () => {
    if (block?.type !== "QUIZ" || !block?.quizId) return;
    setLoadingQuiz(true);
    setQuizError("");
    try {
      const { data } = await axios.get(`/student/courses/${courseId}/quizzes/${block.quizId}`);
      setQuizData(data);
    } catch (err) {
      setQuizError("Failed to load quiz questions.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  useEffect(() => {
    setResult(null);
    setSelectedAnswers({});
    setQuizData(null);
    if (block?.type === "QUIZ") loadQuiz();
  }, [block?.quizId]);

  if (!block) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Select a lesson block to begin.
      </div>
    );
  }

  const handleSelect = (questionId, optionId) => {
    if (result) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await axios.post(`/student/courses/${courseId}/quizzes/${block.quizId}/submit`, {
        courseId,
        moduleId: block.moduleId,
        submoduleId: block.submoduleId,
        blockId: block.blockId,
        answers: selectedAnswers,
      });
      setResult(data.result);
      if (data.result.status === "PASSED") {
        onComplete?.();
      }
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (block.type === "VIDEO") {
    const title = block.title?.[language] || block.title?.en || block.title;
    return <VideoPlayer url={block.videoUrl} title={title} />;
  }

  if (block.type === "TEXT") {
    const title = block.title?.[language] || block.title?.en || block.title;
    const content = block.textContent?.[language] || block.textContent?.en || block.textContent;
    return (
      <div className="space-y-6">
        <TextContentViewer html={content} />
        <AIAssistPanel 
          moduleText={content} 
          moduleTitle={title} 
          language={language} 
        />
      </div>
    );
  }

  if (block.type === "QUIZ") {
    if (loadingQuiz) return <div className="py-10 text-center text-slate-500 font-bold animate-pulse">Loading quiz...</div>;
    
    if (quizError) {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
          <p className="font-bold">{quizError}</p>
          <button onClick={loadQuiz} className="mt-2 text-sm font-black underline uppercase tracking-widest">Retry</button>
        </div>
      );
    }

    const title = block.title?.[language] || block.title?.en || block.title;

    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#161b22]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 mb-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Quiz: {title}</h3>
          {result && (
            <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-widest ${result.status === "PASSED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {result.status} • {result.score}/{result.totalMarks}
            </span>
          )}
        </div>
        
        {quizData?.questions?.length ? (
          <div className="space-y-6">
            {quizData.questions.map((question, index) => (
              <div key={question.questionId} className="rounded-2xl bg-slate-50/50 p-5 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-4">
                  <span className="text-brand-600 mr-2">Q{index + 1}.</span> 
                  {question.questionText?.[language] || question.questionText?.en || question.questionText || "Question"}
                </p>
                <div className="grid gap-3">
                  {(question.options || []).map((option) => {
                    const isSelected = String(selectedAnswers[question.questionId]) === String(option.optionId);
                    return (
                      <button
                        key={option.optionId}
                        type="button"
                        onClick={() => handleSelect(question.questionId, option.optionId)}
                        disabled={!!result}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                          isSelected
                            ? "border-brand-600 bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                            : "border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                        } ${result ? "opacity-80" : ""}`}
                      >
                        {option.text?.[language] || option.text?.en || option.text || "Option"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {!result && (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(selectedAnswers).length < quizData.questions.length}
                className="mt-6 w-full rounded-xl bg-brand-600 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-brand-700 disabled:opacity-50 shadow-xl shadow-brand-600/20 transition-all"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
            
            {result?.status === "FAILED" && (
              <button
                onClick={() => { setResult(null); setSelectedAnswers({}); }}
                className="mt-4 w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Try Again
              </button>
            )}
          </div>
        ) : !loadingQuiz && (
          <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-slate-500 font-medium">Quiz questions are not yet available for this block.</p>
          </div>
        )}
      </div>
    );
  }

  return <TextContentViewer html={block.textContent?.[language] || block.textContent?.en || block.textContent} />;
}

export { TextContentViewer, VideoPlayer };
