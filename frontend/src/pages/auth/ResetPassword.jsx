import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import axios from "../../api/axios";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    setError("");
    try {
      await axios.post("/auth/reset-password", { token, password });
      setMessage("Password reset successful. You can now sign in.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="p-10 text-center">Invalid token.</div>;

  return (
    <AuthLayout title="New Password" subtitle="Set a strong password for your account">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
        {message && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">{message}</div>}

        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="••••••••"
        />

        <Button type="submit" className="w-full" disabled={loading || message}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        <Link to="/login" className="font-bold text-brand-600">Back to Login</Link>
      </p>
    </AuthLayout>
  );
}
