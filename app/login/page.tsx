import { LoginForm } from "@/components/auth/LoginForm";
import { CheckCircle2, Rocket, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="auth-bg min-h-screen">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2E4036]">
            <Rocket className="h-4 w-4 text-[#F2F0E9]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">
            PostRocket
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-[#4a4a4a] transition hover:text-[#2E4036]"
        >
          ← Vissza a főoldalra
        </Link>
      </nav>

      {/* Main content */}
      <div className="mx-auto flex max-w-6xl items-center justify-center px-6 pb-16 pt-24">
        <div className="glass-panel p-8 md:p-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
