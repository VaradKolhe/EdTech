import { useAuth } from "../context/AuthContext";
import StudentProfile from "./student/StudentProfile";
import InstructorProfile from "./student/InstructorProfile";
import AdminProfile from "./admin/AdminProfile";

export default function ProfilePage() {
  const { user } = useAuth();
  
  if (!user) return null;

  if (user.role === "admin") return <AdminProfile />;
  if (user.role === "instructor") return <InstructorProfile />;
  return <StudentProfile />;
}
