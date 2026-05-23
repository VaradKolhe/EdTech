import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import CourseCard from "../../components/student/CourseCard";
import CourseFilters from "../../components/student/CourseFilters";
import SearchBarWithRecommendations from "../../components/student/SearchBarWithRecommendations";
import { getStudentCourses, searchStudentCourses } from "../../api/studentApi";

export default function BrowseCourses() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ sort: "popularity" });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const request = query?.trim()
      ? searchStudentCourses({ ...filters, query })
      : getStudentCourses(filters);
    request
      .then(({ data }) => setCourses(data.courses || []))
      .finally(() => setLoading(false));
  }, [filters, query]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">Browse Courses</h1>
            <p className="mt-2 text-slate-500">Search published courses with recommendation-ready ranking.</p>
          </div>
          <div className="w-full lg:w-[28rem]">
            <SearchBarWithRecommendations
              value={query}
              onChange={setQuery}
              onSelect={(course) => navigate(`/student-dashboard/courses/${course._id}`)}
            />
          </div>
        </div>
        <div className="mb-4 flex justify-end">
          <select
            value={filters.sort || "popularity"}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-[#161b22] dark:text-white"
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Rating</option>
            <option value="newest">Newest</option>
            <option value="priceLow">Price low to high</option>
            <option value="priceHigh">Price high to low</option>
          </select>
        </div>
        <CourseFilters filters={filters} onChange={setFilters} />
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading courses...</div>
        ) : courses.length ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
            No published courses match your search.
          </div>
        )}
      </main>
    </div>
  );
}
