import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg">
      <nav className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-[#DCEEFA] px-6 h-16 flex items-center justify-between">
        <span className="font-display text-xl font-bold text-primary cursor-pointer" onClick={() => navigate("/")}>🌊 BookBuddy AI</span>
        <div className="flex gap-2 sm:gap-3 items-center">
          <button
            onClick={() => navigate("/ai-studio")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm animate-pulse"
          >
            ✨ AI Literary Studio
          </button>
          <button
            onClick={() => navigate("/qa-diagnostics")}
            className="bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            🛡️ QA & Protection
          </button>
          <span onClick={() => navigate("/login")} className="text-sm text-textmuted cursor-pointer hover:text-slate-900 font-medium hidden sm:inline">Log in</span>
          <button onClick={() => navigate("/signup")} className="bg-ocean hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-all">
            Get Started
          </button>
        </div>
      </nav>
      <section className="px-6 py-20 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-6 cursor-pointer hover:bg-indigo-100 transition-all shadow-xs" onClick={() => navigate("/ai-studio")}>
          <span>✨ New: Chat with Iconic Book Characters & Analyze Quotes</span>
          <span>→</span>
        </div>
        <h1 className="font-display text-5xl font-bold leading-tight mb-5">
          Find the book that<br /><span className="text-primary">finds you back</span>
        </h1>
        <p className="text-textmuted text-lg mb-8">
          No genres to memorize, no lists to scroll. Tell BookBuddy a mood, a movie, or converse with literary legends — our intelligent AI companion elevates your entire reading world.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button onClick={() => navigate("/signup")} className="w-full sm:w-auto bg-ocean hover:bg-blue-600 text-white rounded-2xl px-8 py-4 font-bold text-base shadow-lg transition-all">
            Start My Reading Journey →
          </button>
          <button onClick={() => navigate("/ai-studio")} className="w-full sm:w-auto bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-2xl px-8 py-4 font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2">
            <span>✨ Launch AI Literary Studio</span>
          </button>
        </div>
      </section>
    </div>
  );
}
