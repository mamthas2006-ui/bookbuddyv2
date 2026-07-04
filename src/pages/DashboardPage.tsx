import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/apiClient";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
  });

  const { data: trending } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => (await api.get("/books/trending")).data,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="bg-ocean px-5 py-8 text-white rounded-b-3xl">
        <p className="text-sm opacity-85">{greeting}, {user?.name} 🌊</p>
        <h2 className="font-display text-2xl font-bold mt-1">Welcome back</h2>
        {me?.profile?.personalityName && (
          <span className="inline-block bg-white/20 rounded-full px-3 py-1 text-xs mt-2">
            {me.profile.personalityEmoji} {me.profile.personalityName}
          </span>
        )}
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl border border-[#DCEEFA] shadow-sm p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold">⚡ Level {me?.profile?.level ?? 1}</span>
            <span className="text-textmuted">{me?.profile?.xp ?? 0} XP</span>
          </div>
        </div>

        <div
          onClick={() => navigate("/app/ai-studio")}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white rounded-2xl p-5 mb-6 shadow-md cursor-pointer hover:shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-indigo-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
              <span>✨ New Feature Hub</span>
            </div>
            <h3 className="font-display font-black text-lg">AI Literary Studio</h3>
            <p className="text-xs text-indigo-100 mt-0.5 max-w-sm">
              Roleplay live chat with Sherlock & Gatsby, generate aesthetic quote share cards, & plan your reading pace!
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/20">
            🎭
          </div>
        </div>

        <h3 className="font-bold text-base mb-3">✨ Recommended for you</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {trending?.map((b: any) => (
            <div key={b.id} onClick={() => navigate(`/books/${b.id}`)}
              className="min-w-[130px] bg-white border border-[#DCEEFA] rounded-2xl p-3 cursor-pointer flex-shrink-0">
              <div className="text-3xl text-center bg-primary/10 rounded-xl py-3 mb-2">{b.coverEmoji || "📖"}</div>
              <div className="text-xs font-bold">{b.title}</div>
              <div className="text-[10px] text-textmuted">{b.author?.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
