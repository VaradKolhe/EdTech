import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "EduLearn"}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email Sending Error:", error);
    throw new Error("Failed to send email");
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const frontendUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  const subject = "Password Reset Request - EduLearn";
  const text = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process: ${resetUrl}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #4f46e5; font-weight: 800; text-transform: uppercase; letter-spacing: -0.025em;">EduLearn</h2>
      <p style="font-size: 16px; color: #475569; line-height: 1.6;">You requested a password reset. Click the button below to set a new password. This link is valid for 1 hour.</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #94a3b8;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <hr style="margin: 30px 0; border: 0; border-top: 1px solid #f1f5f9;" />
      <p style="font-size: 10px; color: #94a3b8; text-align: center;">&copy; 2026 EduLearn. All rights reserved.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};
