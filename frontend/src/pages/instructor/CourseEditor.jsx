import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourse } from "../../store/courseSlice";
import Sidebar from "../../components/Sidebar";
import ContentEditor from "../../components/ContentEditor";
import Navbar from "../../components/Navbar";

export default function CourseEditor() {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const { course, loading, error } = useSelector((s) => s.course);

  useEffect(() => {
    dispatch(fetchCourse(courseId));
  }, [courseId, dispatch]);

  if (loading && !course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Course not found</h2>
          <p className="mt-2 text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar courseId={courseId} modules={course?.modules || []} />
        <main className="flex-1 overflow-hidden">
          <ContentEditor />
        </main>
      </div>
    </div>
  );
}
