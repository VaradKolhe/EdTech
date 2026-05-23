import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import CourseFilters from "../../components/student/CourseFilters";
import EnrolledCourseCard from "../../components/student/EnrolledCourseCard";
import { getStudentEnrollments } from "../../api/studentApi";

export default function MyCourses() {
  const [filters, setFilters] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStudentEnrollments(filters)
      .then(({ data }) => setCourses(data.enrollments || []))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">My Courses</h1>
          <p className="mt-2 text-slate-500">All enrolled and lifetime-access courses.</p>
        </div>
        <CourseFilters filters={filters} onChange={setFilters} enrolled />
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading courses...</div>
        ) : courses.length ? (
          <div className="mt-8 grid gap-5">
            {courses.map((course) => (
              <EnrolledCourseCard key={course.enrollmentId || course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
            No enrolled courses match these filters.
          </div>
        )}
      </main>
    </div>
  );
}
