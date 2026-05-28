import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createPaymentOrder,
  enrollFreeCourse,
  verifyPayment,
} from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function PaymentButton({ course, onEnrolled }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFreeEnroll = async () => {
    setLoading(true);
    try {
      await enrollFreeCourse(course._id);
      onEnrolled?.();
      navigate(`/student-dashboard/courses/${course._id}/player`);
    } finally {
      setLoading(false);
    }
  };

  const handlePaidEnroll = async () => {
    setLoading(true);
    try {
      const { data } = await createPaymentOrder(course._id);
      if (data.order?.devMode) {
        await verifyPayment(course._id, {
          razorpay_order_id: data.order.id,
          razorpay_payment_id: `pay_dev_${Date.now()}`,
          razorpay_signature: "dev",
          paymentMethod: "UNKNOWN",
        });
        navigate(`/student-dashboard/payment/success?courseId=${course._id}`);
        return;
      }

      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        navigate(`/student-dashboard/payment/failure?courseId=${course._id}`);
        return;
      }

      const checkout = new window.Razorpay({
        key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "EdTech",
        description: course.title,
        order_id: data.order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        handler: async (response) => {
          await verifyPayment(course._id, {
            ...response,
            paymentMethod: "UNKNOWN",
          });
          navigate(`/student-dashboard/payment/success?courseId=${course._id}`);
        },
        modal: {
          ondismiss: () => navigate(`/student-dashboard/payment/failure?courseId=${course._id}`),
        },
      });
      checkout.open();
    } catch (err) {
      navigate(`/student-dashboard/payment/failure?courseId=${course._id}`);
    } finally {
      setLoading(false);
    }
  };

  if (course.enrollment) {
    return (
      <button
        type="button"
        onClick={() => navigate(`/student-dashboard/courses/${course._id}/player`)}
        className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700"
      >
        Continue Learning
      </button>
    );
  }

  if (course.access?.canAccessContent) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate(`/student-dashboard/courses/${course._id}/player`)}
          className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Start Preview
        </button>
        <div className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 p-4 text-center border-2 border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Preview Mode Active</p>
          <p className="text-[10px] text-slate-400 mt-1">No payment or enrollment required.</p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={course.isPaid ? handlePaidEnroll : handleFreeEnroll}
      className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {loading ? "Processing..." : course.isPaid ? "Buy Course" : "Enroll Free"}
    </button>
  );
}
