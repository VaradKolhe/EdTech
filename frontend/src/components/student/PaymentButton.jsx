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
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "EduLearn",
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
    } catch {
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
