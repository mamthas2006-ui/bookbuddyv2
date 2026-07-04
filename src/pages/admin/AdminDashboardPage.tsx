import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/apiClient";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await api.get("/admin/dashboard")).data,
  });

  const stats = [
    ["Users", data?.userCount],
    ["Books", data?.bookCount],
    ["Reviews", data?.reviewCount],
    ["AI Conversations", data?.aiConversationCount],
    ["New signups (7d)", data?.newSignupsLast7Days],
  ];

  return (
    <div className="min-h-screen bg-bg p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => navigate("/qa-diagnostics")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <ShieldCheck size={16} /> Open QA & Protection Benchmark Suite
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map(([label, value]) => (
          <div key={label as string} className="bg-white border border-[#DCEEFA] rounded-2xl p-5">
            <div className="text-2xl font-bold text-primary">{value ?? "—"}</div>
            <div className="text-xs text-textmuted mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
