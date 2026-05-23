import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { store } from "./store";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import StudentRegister from "./pages/auth/StudentRegister";
import InstructorRegister from "./pages/auth/InstructorRegister";
import OverviewSection from "./pages/admin/OverviewSection";
import VerificationSection from "./pages/admin/VerificationSection";
import StudentsSection from "./pages/admin/StudentsSection";
import InstructorsSection from "./pages/admin/InstructorsSection";
import CoursesSection from "./pages/admin/CoursesSection";
import FeedbackSection from "./pages/admin/FeedbackSection";
import CertificatesSection from "./pages/admin/CertificatesSection";
import ModerationSection from "./pages/admin/ModerationSection";
import ReportsSection from "./pages/admin/ReportsSection";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import CourseEditor from "./pages/instructor/CourseEditor";
import StudentDashboard from "./pages/student/StudentDashboard";
import MyCourses from "./pages/student/MyCourses";
import BrowseCourses from "./pages/student/BrowseCourses";
import CourseDetails from "./pages/student/CourseDetails";
import CoursePlayer from "./pages/student/CoursePlayer";
import PaymentSuccess from "./pages/student/PaymentSuccess";
import PaymentFailure from "./pages/student/PaymentFailure";
import ProfilePage from "./pages/ProfilePage";
import StudentOnboardingQuestionnaire from "./pages/student/StudentOnboardingQuestionnaire";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register/student" element={<StudentRegister />} />
              <Route path="/register/instructor" element={<InstructorRegister />} />
              <Route
                path="/student-onboarding"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentOnboardingQuestionnaire />
                  </ProtectedRoute>
                }
              />

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
                <Route path="instructors" element={<InstructorsSection />} />
                <Route path="courses" element={<CoursesSection />} />
                <Route path="feedback" element={<FeedbackSection />} />
                <Route path="certificates" element={<CertificatesSection />} />
                <Route path="moderation" element={<ModerationSection />} />
                <Route path="reports" element={<ReportsSection />} />
              </Route>

              <Route
                path="/courses"
                element={
                  <ProtectedRoute allowedRoles={["instructor"]}>
                    <CoursesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/courses/:courseId/edit"
                element={
                  <ProtectedRoute allowedRoles={["instructor", "admin"]}>
                    <CourseEditor />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/instructor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["instructor"]}>
                    <CoursesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor-dashboard/courses/:courseId"
                element={
                  <ProtectedRoute allowedRoles={["instructor"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/teacher-dashboard" element={<Navigate to="/instructor-dashboard" replace />} />

              <Route
                path="/student-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student-dashboard/my-courses"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <MyCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-dashboard/browse"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <BrowseCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-dashboard/courses/:courseId"
                element={
                  <ProtectedRoute allowedRoles={["student", "admin"]}>
                    <CourseDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-dashboard/courses/:courseId/player"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <CoursePlayer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-dashboard/payment/success"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PaymentSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-dashboard/payment/failure"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PaymentFailure />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
