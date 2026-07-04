import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/apiClient";
import { useBookSummary } from "@/services/aiService";
import { useState } from "react";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wantSummary, setWantSummary] = useState(false);

  const { data: book } = useQuery({
    queryKey: ["book", id],
    queryFn: async () => (await api.get(`/books/${id}`)).data,
    enabled: !!id,
  });

  const { data: aiSummary, isFetching } = useBookSummary(id!, wantSummary);

  if (!book) return <div className="p-8 text-center text-textmuted">Loading…</div>;

  return (
    <div>
      <div className="bg-ocean px-5 py-7 text-white">
        <button onClick={() => navigate(-1)} className="bg-white/20 rounded-lg px-3 py-1.5 text-sm mb-4">← Back</button>
        <div className="text-center">
          <div className="text-6xl mb-3">{book.coverEmoji || "📖"}</div>
          <h1 className="font-display text-xl font-bold">{book.title}</h1>
          <p className="opacity-85 text-sm">by {book.author?.name}</p>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl border border-[#DCEEFA] shadow-sm p-5 mb-4">
          <p className="text-sm text-textmuted leading-relaxed">{book.description}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCEEFA] shadow-sm p-5 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">1-minute summary</h3>
            {!wantSummary && (
              <button onClick={() => setWantSummary(true)} className="text-xs border border-primary text-primary rounded-lg px-3 py-1.5">
                ✨ AI summary
              </button>
            )}
          </div>
          {wantSummary && (isFetching ? <p className="text-xs text-textmuted">Generating…</p> : <p className="text-sm text-textmuted">{aiSummary}</p>)}
        </div>

        {book.keyLessons?.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#DCEEFA] shadow-sm p-5 mb-4">
            <h3 className="font-bold text-sm mb-3">Key lessons</h3>
            {book.keyLessons.map((l: string, i: number) => (
              <div key={i} className="flex gap-3 mb-2.5 text-sm text-textmuted">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
