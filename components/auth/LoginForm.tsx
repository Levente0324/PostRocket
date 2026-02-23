"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setError("Check your email for the confirmation link.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-ivory/60">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-obsidian/50 border border-white/10 rounded-xl px-4 py-3 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-all"
          placeholder="commander@postpilot.ai"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-widest text-ivory/60">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-obsidian/50 border border-white/10 rounded-xl px-4 py-3 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-all"
          placeholder="••••••••"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 rounded-xl text-base font-medium mt-4"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isSignUp ? (
          "Initialize Account"
        ) : (
          "Access Dashboard"
        )}
      </Button>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-ivory/60 hover:text-champagne transition-colors"
        >
          {isSignUp ? "Already have access? Login" : "Need an account? Sign up"}
        </button>
      </div>
    </form>
  );
}
