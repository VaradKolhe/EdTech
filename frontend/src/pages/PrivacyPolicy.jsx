import Navbar from "../components/layout/Navbar";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>Last updated: May 23, 2026</p>
          <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use the EdTech platform.</p>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, enroll in a course, or contact support. This may include your name, email address, and profile details.</p>
          <h2>2. How We Use Your Information</h2>
          <p>We use your information to provide and improve our services, personalize your learning experience, process payments, and communicate with you about your account and course updates.</p>
          <h2>3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
          <h2>4. Third-Party Services</h2>
          <p>We may use third-party services for payments (Razorpay), analytics, and AI content generation. These services have their own privacy policies.</p>
        </div>
      </main>
    </div>
  );
}
