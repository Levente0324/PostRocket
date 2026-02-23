import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-obsidian border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-champagne to-yellow-600 flex items-center justify-center">
            <span className="font-serif italic font-bold text-obsidian text-xs">
              P
            </span>
          </div>
          <span className="font-bold text-lg tracking-tight">PostPilot</span>
        </div>

        <div className="flex items-center gap-8 text-xs font-mono text-ivory/50 uppercase tracking-widest">
          <Link href="#" className="hover:text-champagne transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-champagne transition-colors">
            Terms
          </Link>
          <Link href="#" className="hover:text-champagne transition-colors">
            Contact
          </Link>
        </div>

        <div className="text-xs text-ivory/30 font-mono">
          © {new Date().getFullYear()} PostPilot Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
