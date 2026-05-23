import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import { 
  SparklesIcon,
  AcademicCapIcon, 
  PresentationChartLineIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/30 px-4 py-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 mb-8 animate-fade-in">
            <SparklesIcon className="h-4 w-4" />
            <span>AI-Powered Multilingual Learning</span>
          </div>
          
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-7xl lg:text-8xl">
            Learn Smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              In Any Language.
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Experience the future of education with AI-driven course recommendations, 
            multilingual content in Hindi, Marathi & English, and intelligent learning assistance.
          </p>
          
          <div className="mt-12 flex flex-wrap justify-center gap-5">
            <Link to="/register/student">
              <Button size="lg" className="px-8 py-4 text-base">Get Started as Student</Button>
            </Link>
            <Link to="/register/instructor">
              <Button variant="secondary" size="lg" className="px-8 py-4 text-base">Become an Instructor</Button>
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-slate-400 dark:text-slate-600 text-sm font-bold uppercase tracking-widest">
            <span>Powered by AI</span>
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            <span>Multilingual support</span>
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            <span>Personalized Learning</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 dark:bg-[#080b11]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Platform Core Features</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Everything you need for a modern, global education experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<CpuChipIcon className="h-8 w-8 text-brand-600" />}
              title="AI Recommendations"
              description="Personalized course suggestions based on your skill level, goals, and learning behavior."
            />
            <FeatureCard 
              icon={<GlobeAltIcon className="h-8 w-8 text-indigo-600" />}
              title="Multilingual Mastery"
              description="Courses available in English, Hindi, and Marathi to break all language barriers."
            />
            <FeatureCard 
              icon={<PresentationChartLineIcon className="h-8 w-8 text-brand-600" />}
              title="Progress Analytics"
              description="Deep insights into your learning journey with module-level tracking and AI summaries."
            />
            <FeatureCard 
              icon={<ShieldCheckIcon className="h-8 w-8 text-indigo-600" />}
              title="Certificate Templates"
              description="Admin-managed certificate templates are ready for future certificate generation."
            />
          </div>
        </div>
      </section>

      {/* Role Sections */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <h3 className="text-3xl font-bold dark:text-white">For Students</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Unlock your potential with courses tailored to your career goals. 
              Watch high-quality videos, read AI-summarized materials, and take interactive quizzes in your preferred language.
            </p>
            <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2"><CheckBadgeIcon className="h-5 w-5 text-brand-500" /> Personalized AI Dashboard</li>
              <li className="flex items-center gap-2"><CheckBadgeIcon className="h-5 w-5 text-brand-500" /> Search Autocomplete Suggestions</li>
              <li className="flex items-center gap-2"><CheckBadgeIcon className="h-5 w-5 text-brand-500" /> Multi-language Content Switcher</li>
            </ul>
            <Link to="/register/student" className="block">
              <Button className="w-full py-4">Join as Student</Button>
            </Link>
          </div>

          <div className="space-y-8 p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <h3 className="text-3xl font-bold dark:text-white">For Instructors</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Share your knowledge globally. Upload content once and leverage AI to 
              generate multilingual descriptions, summaries, and structured learning modules.
            </p>
            <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2"><CheckBadgeIcon className="h-5 w-5 text-indigo-500" /> AI-Assisted Content Creation</li>
              <li className="flex items-center gap-2"><CheckBadgeIcon className="h-5 w-5 text-indigo-500" /> Enrollment & Rating Analytics</li>
              <li className="flex items-center gap-2"><CheckBadgeIcon className="h-5 w-5 text-indigo-500" /> Secure Course Monetization</li>
            </ul>
            <Link to="/register/instructor" className="block">
              <Button variant="secondary" className="w-full py-4 !bg-indigo-600 !text-white hover:!bg-indigo-700">Apply as Instructor</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-2xl font-black text-slate-900 dark:text-white mb-4">EduLearn</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-md mx-auto">
            The next generation of AI-driven, multilingual e-learning. 
            Built for a global audience with localized impact.
          </p>
          <div className="flex justify-center gap-8 mb-8">
            <Link to="/login" className="text-sm font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400">Login to Platform</Link>
            <Link to="/privacy" className="text-sm font-bold text-slate-400 hover:text-slate-600">Privacy Policy</Link>
            <Link to="/terms" className="text-sm font-bold text-slate-400 hover:text-slate-600">Terms of Service</Link>
          </div>
          <p className="text-xs text-slate-400 tracking-widest uppercase">© 2026 EduLearn AI Inc.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-transform hover:-translate-y-1">
      <div className="mb-6">{icon}</div>
      <h4 className="text-lg font-bold mb-3 dark:text-white">{title}</h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
