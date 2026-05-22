import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourse } from "../store/courseSlice";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ContentEditor from "../components/ContentEditor";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { course, loading, error } = useSelector((s) => s.course);

  useEffect(() => {
    dispatch(fetchCourse(courseId));
  }, [courseId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate("/")} className="text-primary underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar courseId={courseId} modules={course?.modules || []} />
        <main className="flex-1 flex flex-col overflow-hidden md:ml-0">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" /> All Courses
            </button>
          </div>
          <ContentEditor />
        </main>
      </div>
    </div>
  );
}
