import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["INR"], default: "INR" },
    provider: { type: String, enum: ["RAZORPAY"], default: "RAZORPAY" },
    razorpayOrderId: { type: String, trim: true, default: "" },
    razorpayPaymentId: { type: String, trim: true, default: "" },
    razorpaySignature: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["CREATED", "SUCCESS", "FAILED", "REFUNDED"],
      default: "CREATED",
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "CARD", "NETBANKING", "WALLET", "UNKNOWN"],
      default: "UNKNOWN",
    },
    paidAt: Date,
    failureReason: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, courseId: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
