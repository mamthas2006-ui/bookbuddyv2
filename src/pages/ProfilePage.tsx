import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/apiClient";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
  });

  const handleLogout = async () => {
    await api.post("/auth/logout");
    logout();
    navigate("/");
  };

  return (
    <div>
      <div className="bg-ocean px-5 py-9 text-white text-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mx-auto mb-2">
          {me?.profile?.personalityEmoji || "👤"}
        </div>
        <h2 className="font-display text-xl font-bold">{user?.name}</h2>
        <p className="opacity-85 text-sm">{me?.profile?.personalityName}</p>
      </div>
      <div className="p-4">
        <div className="bg-white border border-[#DCEEFA] rounded-2xl p-5 mb-4">
          <h3 className="font-bold text-sm mb-3">Genres & themes</h3>
          <div className="flex flex-wrap gap-2">
            {me?.profile?.favoriteGenres?.map((g: string) => (
              <span key={g} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">{g}</span>
            ))}
          </div>
        </div>
        <button
          onClick={() => navigate("/qa-diagnostics")}
          className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl py-3 text-sm font-bold mb-3 flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          🛡️ Enterprise QA & Protection Benchmark Suite
        </button>
        <button onClick={handleLogout} className="w-full border border-[#DCEEFA] rounded-xl py-3 text-sm font-semibold">
          Log out
        </button>
      </div>
    </div>
  );
}
