import Navbar from "../components/layout/Navbar";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">Terms of Service</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>Last updated: May 23, 2026</p>
          <p>Welcome to EdTech. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service.</p>
          <h2>1. Account Registration</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
          <h2>2. Course Enrollment and Access</h2>
          <p>Course access is subject to payment or free enrollment terms. Content is for personal, non-commercial use only.</p>
          <h2>3. User Conduct</h2>
          <p>You agree not to use the platform for any unlawful purpose or to share harmful, offensive, or infringing content.</p>
          <h2>4. Intellectual Property</h2>
          <p>All content on the platform, including videos, text, and logos, is the property of EdTech or its content creators and is protected by copyright laws.</p>
          <h2>5. Termination</h2>
          <p>We reserve the right to terminate or suspend your account for violations of these terms.</p>
        </div>
      </main>
    </div>
  );
}
