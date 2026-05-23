import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import axios from "../../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await axios.post("/auth/forgot-password", { email });
      setMessage("If an account exists, you will receive a reset link.");
      if (data.resetToken) setDevToken(data.resetToken);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
        {message && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">{message}</div>}
        
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>

        {devToken && (
          <div className="mt-6 p-4 bg-slate-100 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dev Mode: Reset Token</p>
            <Link to={`/reset-password?token=${devToken}`} className="text-sm font-mono break-all text-brand-600 hover:underline">
              {devToken}
            </Link>
          </div>
        )}
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Remember your password? <Link to="/login" className="font-bold text-brand-600">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
