import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const courseId = params.get("courseId");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <div className="mb-6 rounded-full bg-green-100 px-5 py-4 text-3xl text-green-700">✓</div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Payment successful</h1>
        <p className="mt-3 text-slate-500">Your lifetime course access is active.</p>
        {courseId && (
          <Link to={`/student-dashboard/courses/${courseId}/player`} className="mt-8 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white">
            Start learning
          </Link>
        )}
      </main>
    </div>
  );
}
