import { useEffect, useState } from "react";
import {
  getStudents,
  getInstructors,
  getCourses,
  moderateRemoveUser,
  moderateRemoveCourse,
} from "../../api/adminApi";
import Button from "../../components/ui/Button";

export default function ModerationSection() {
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);

  const load = async () => {
    const [s, t, c] = await Promise.all([
      getStudents(),
      getInstructors(),
      getCourses(),
    ]);
    setStudents(s.data.students.slice(0, 5));
    setInstructors(t.data.instructors.slice(0, 5));
    setCourses(c.data.courses.slice(0, 5));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Content Moderation
        </h2>
        <p className="text-slate-500">Quick remove for users and courses</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ModerationList
          title="Recent Students"
          items={students}
          onRemove={(id) => moderateRemoveUser(id, "student").then(load)}
          labelKey="name"
        />
        <ModerationList
          title="Recent Instructors"
          items={instructors}
          onRemove={(id) => moderateRemoveUser(id, "instructor").then(load)}
          labelKey="name"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-3 font-semibold">Recent Courses</h3>
        <ul className="space-y-2">
          {courses.map((c) => (
            <li
              key={c._id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900"
            >
              <span>{c.title}</span>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (confirm("Remove course?")) {
                    moderateRemoveCourse(c._id).then(load);
                  }
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ModerationList({ title, items, onRemove, labelKey }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item._id}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900"
          >
            <span>{item[labelKey]}</span>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (confirm("Remove user?")) onRemove(item._id);
              }}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
