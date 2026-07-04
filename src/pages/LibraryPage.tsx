import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/apiClient";

export default function LibraryPage() {
  const [tab, setTab] = useState<"favorites" | "reading" | "completed">("favorites");
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["library"],
    queryFn: async () => (await api.get("/users/me/library")).data,
  });

  const items = tab === "favorites" ? data?.favorites : tab === "reading" ? data?.reading?.map((h: any) => h.book) : data?.completed?.map((h: any) => h.book);

  return (
    <div>
      <div className="bg-ocean px-5 py-7 text-white">
        <h2 className="font-display text-2xl font-bold">My Library</h2>
        <p className="opacity-85 text-sm">Collections, notes, and history</p>
      </div>
      <div className="flex border-b border-[#DCEEFA] px-4">
        {(["favorites", "reading", "completed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-3.5 px-4 text-sm capitalize ${tab === t ? "text-primary border-b-2 border-primary font-bold" : "text-textmuted"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="p-4">
        {items?.map((b: any) => (
          <div key={b.id} onClick={() => navigate(`/books/${b.id}`)}
            className="bg-white border border-[#DCEEFA] rounded-2xl p-4 mb-2.5 flex gap-3 cursor-pointer">
            <div className="text-2xl bg-primary/10 rounded-xl w-14 h-16 flex items-center justify-center flex-shrink-0">{b.coverEmoji || "📖"}</div>
            <div>
              <div className="font-bold text-sm">{b.title}</div>
              <div className="text-xs text-textmuted">{b.author?.name}</div>
            </div>
          </div>
        ))}
        {items?.length === 0 && <p className="text-center text-textmuted text-sm py-10">Nothing here yet</p>}
      </div>
    </div>
  );
}
