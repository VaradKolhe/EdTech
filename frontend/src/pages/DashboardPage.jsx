import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourse } from "../store/courseSlice";
import Sidebar from "../components/Sidebar";
import ContentEditor from "../components/ContentEditor";
import Navbar from "../components/Navbar";

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
      <div className="min-h-screen flex items-center justify-center bg-[#0e1117]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1117]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => navigate("/")} className="text-primary underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen min-w-0 flex-col overflow-hidden bg-[#0e1117]">
      <Navbar />
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar courseId={courseId} modules={course?.modules || []} />
        {/* Main content — fills ALL remaining space */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-[#0e1117]">
          <ContentEditor onBack={() => navigate("/")} />
        </main>
      </div>
    </div>
  );
}
