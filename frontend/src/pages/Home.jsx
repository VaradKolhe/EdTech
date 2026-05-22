import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="gradient-hero relative overflow-hidden px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur">
            EduLearn Authentication
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Sign in or create your account
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-indigo-100">
            Students and teachers can register. Admins sign in with seeded
            credentials. After login you are redirected to your dashboard route
            for integration with other branches.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register/student">
              <Button size="lg">Student Register</Button>
            </Link>
            <Link to="/register/teacher">
              <Button
                variant="secondary"
                size="lg"
                className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
              >
                Teacher Register
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="ghost"
                size="lg"
                className="!text-white hover:!bg-white/10"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
