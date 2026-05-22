import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import StudentRegister from "./pages/auth/StudentRegister";
import TeacherRegister from "./pages/auth/TeacherRegister";
import OverviewSection from "./pages/admin/OverviewSection";
import VerificationSection from "./pages/admin/VerificationSection";
import StudentsSection from "./pages/admin/StudentsSection";
import TeachersSection from "./pages/admin/TeachersSection";
import CoursesSection from "./pages/admin/CoursesSection";
import FeedbackSection from "./pages/admin/FeedbackSection";
import CertificatesSection from "./pages/admin/CertificatesSection";
import ModerationSection from "./pages/admin/ModerationSection";
import ReportsSection from "./pages/admin/ReportsSection";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/register/teacher" element={<TeacherRegister />} />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewSection />} />
            <Route path="verification" element={<VerificationSection />} />
            <Route path="students" element={<StudentsSection />} />
            <Route path="teachers" element={<TeachersSection />} />
            <Route path="courses" element={<CoursesSection />} />
            <Route path="feedback" element={<FeedbackSection />} />
            <Route path="certificates" element={<CertificatesSection />} />
            <Route path="moderation" element={<ModerationSection />} />
            <Route path="reports" element={<ReportsSection />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
