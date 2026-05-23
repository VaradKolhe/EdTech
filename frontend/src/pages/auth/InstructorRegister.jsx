import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerInstructor } from "../../api/authApi";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

export default function InstructorRegister() {
  const { persistAuth, getRoleRedirectPath } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    qualification: "",
    yearsOfExperience: "",
    degreeSpecialization: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await registerInstructor({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        expertise: [form.degreeSpecialization].filter(Boolean),
        bio: { en: form.qualification },
      });
      persistAuth(data.user);
      navigate(getRoleRedirectPath(data.user));
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Become an instructor"
      subtitle="Share your expertise with learners worldwide"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        <Input
          id="name"
          name="name"
          label="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <Input
          id="qualification"
          name="qualification"
          label="Qualification"
          placeholder="e.g. M.Tech, PhD"
          value={form.qualification}
          onChange={handleChange}
          required
        />
        <Input
          id="yearsOfExperience"
          name="yearsOfExperience"
          type="number"
          min="0"
          label="Years of Experience"
          value={form.yearsOfExperience}
          onChange={handleChange}
          required
        />
        <Input
          id="degreeSpecialization"
          name="degreeSpecialization"
          label="Degree / Specialization"
            placeholder="e.g. Computer Science, Networking"
          value={form.degreeSpecialization}
          onChange={handleChange}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Apply as Instructor"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link
          to="/login"
          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
