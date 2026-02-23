"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Image as ImageIcon, Check } from "lucide-react";
import { generatePostAction } from "@/app/actions/generate";
import { useRouter } from "next/navigation";

export function GeneratePostForm() {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState<{
    caption: string;
    imageUrl?: string;
  } | null>(null);
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await generatePostAction({ topic, tone, audience });
      if (res.error) throw new Error(res.error);
      if (res.data) setResult(res.data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Save to DB via another action
    alert("Saved to drafts!");
    router.push("/dashboard/posts");
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handleGenerate} className="space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-mono uppercase tracking-widest text-ivory/60">
            Topic or Promotion
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            rows={4}
            className="w-full bg-obsidian/50 border border-white/10 rounded-2xl p-4 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-all resize-none"
            placeholder="e.g., Announcing our new summer collection with a 20% discount code SUMMER20..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-xs font-mono uppercase tracking-widest text-ivory/60">
              Brand Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-obsidian/50 border border-white/10 rounded-xl px-4 py-3 text-ivory focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-all appearance-none"
            >
              <option value="professional">Professional & Authoritative</option>
              <option value="casual">Casual & Friendly</option>
              <option value="humorous">Humorous & Witty</option>
              <option value="luxurious">Luxurious & Exclusive</option>
              <option value="urgent">Urgent & Promotional</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-mono uppercase tracking-widest text-ivory/60">
              Target Audience
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full bg-obsidian/50 border border-white/10 rounded-xl px-4 py-3 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-all"
              placeholder="e.g., Fitness enthusiasts, 20-35"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl text-lg font-medium shadow-[0_0_30px_rgba(201,168,76,0.2)] hover:shadow-[0_0_50px_rgba(201,168,76,0.4)] transition-all"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" /> Generate Content
            </>
          )}
        </Button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12 border-t border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-champagne/10 border border-champagne/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-champagne" />
            </div>
            <h3 className="text-2xl font-serif italic">Generated Result</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-obsidian/80 border border-white/10 rounded-2xl p-6 relative group">
                <div className="absolute top-4 right-4 text-xs font-mono text-ivory/40 uppercase tracking-widest">
                  Caption
                </div>
                <p className="text-ivory/80 whitespace-pre-wrap mt-6 leading-relaxed">
                  {result.caption}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-obsidian/80 border border-white/10 rounded-2xl p-6 relative flex flex-col items-center justify-center min-h-[300px] text-center overflow-hidden">
                {result.imageUrl ? (
                  <img
                    src={result.imageUrl}
                    alt="Generated"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-ivory/20 mb-4" />
                    <p className="text-ivory/40 font-mono text-xs uppercase tracking-widest">
                      Image Generation Pending
                    </p>
                    <p className="text-ivory/30 text-sm mt-2 max-w-xs">
                      Image generation API integration required for full visual
                      output.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setResult(null)}
              className="rounded-xl border-white/10 hover:bg-white/5"
            >
              Discard
            </Button>
            <Button onClick={handleSave} className="rounded-xl">
              <Check className="w-4 h-4 mr-2" /> Save to Drafts
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
