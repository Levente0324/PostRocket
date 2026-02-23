import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-champagne to-yellow-600 mb-6"
          >
            <span className="font-serif italic font-bold text-obsidian text-2xl">
              P
            </span>
          </Link>
          <h1 className="text-3xl font-bold font-serif italic mb-2">
            Welcome Back
          </h1>
          <p className="text-ivory/60 font-mono text-xs uppercase tracking-widest">
            Enter your credentials to access the command center
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-white/5">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
