import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function PaymentFailure() {
  const [params] = useSearchParams();
  const courseId = params.get("courseId");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <div className="mb-6 rounded-full bg-rose-100 px-5 py-4 text-3xl text-rose-700">!</div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Payment not completed</h1>
        <p className="mt-3 text-slate-500">No enrollment was created. You can try again from the course page.</p>
        {courseId && (
          <Link to={`/student-dashboard/courses/${courseId}`} className="mt-8 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-900">
            Back to course
          </Link>
        )}
      </main>
    </div>
  );
}
