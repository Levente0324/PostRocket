import { GeneratePostForm } from "@/components/dashboard/GeneratePostForm";

export default function NewPostPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
          Generate{" "}
          <span className="font-serif italic font-normal text-champagne">
            Content
          </span>
        </h2>
        <p className="text-ivory/60 font-mono text-xs uppercase tracking-widest">
          Instruct the AI to craft your next viral post.
        </p>
      </div>

      <div className="glass-panel rounded-[2rem] p-8 md:p-12 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-champagne/50 to-transparent" />
        <GeneratePostForm />
      </div>
    </div>
  );
}
