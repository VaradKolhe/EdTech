import { Routes, Route, Navigate } from "react-router-dom";
import CoursesPage from "../pages/CoursesPage";
import DashboardPage from "../pages/DashboardPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CoursesPage />} />
      <Route path="/courses/:courseId" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
