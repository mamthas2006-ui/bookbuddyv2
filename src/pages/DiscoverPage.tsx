import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAISearch, useMoodToBook, useMovieToBook, BookRecommendation } from "@/services/aiService";

const MOODS = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "curious", emoji: "🔍", label: "Curious" },
  { id: "motivated", emoji: "🚀", label: "Motivated" },
  { id: "relaxed", emoji: "🌿", label: "Relaxed" },
  { id: "sad", emoji: "💙", label: "Sad" },
  { id: "overwhelmed", emoji: "🌊", label: "Overwhelmed" },
];

export default function DiscoverPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"ai" | "mood" | "movie">("ai");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ books: BookRecommendation[]; insight: string } | null>(null);
  const [error, setError] = useState("");

  const aiSearch = useAISearch();
  const moodSearch = useMoodToBook();
  const movieSearch = useMovieToBook();

  const isPending = aiSearch.isPending || moodSearch.isPending || movieSearch.isPending;

  const runSearch = async () => {
    if (!query.trim()) return;
    setError("");
    setResults(null);
    try {
      const data = tab === "movie" ? await movieSearch.mutateAsync(query) : await aiSearch.mutateAsync(query);
      setResults(data);
    } catch (err: any) {
      setError("Failed to fetch recommendations. Please check your connection or try again.");
    }
  };

  const runMood = async (mood: string) => {
    setError("");
    setResults(null);
    try {
      const data = await moodSearch.mutateAsync(mood);
      setResults(data);
    } catch (err: any) {
      setError("Failed to fetch mood recommendations. Please try again.");
    }
  };

  return (
    <div>
      <div className="bg-ocean px-5 py-7 text-white flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Discover</h2>
          <p className="opacity-85 text-sm">Search anything — mood, movie, or feeling</p>
        </div>
        <button
          onClick={() => navigate("/app/ai-studio")}
          className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 flex items-center gap-1.5 transition-all shadow-xs shrink-0"
        >
          <span>✨ AI Studio</span>
        </button>
      </div>

      <div className="flex border-b border-[#DCEEFA] px-4">
        {(["ai", "mood", "movie"] as const).map((id) => (
          <button
            key={id}
            onClick={() => { setTab(id); setResults(null); }}
            className={`py-3.5 px-3.5 text-sm font-medium ${tab === id ? "text-primary border-b-2 border-primary font-bold" : "text-textmuted"}`}
          >
            {id === "ai" ? "✨ AI Search" : id === "mood" ? "😊 Mood" : "🎬 Movie→Book"}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab !== "mood" && (
          <div className="flex gap-2 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder={tab === "movie" ? "Interstellar, Harry Potter…" : "I want a sad romance…"}
              className="flex-1 px-4 py-3 rounded-2xl border border-[#DCEEFA] text-sm outline-none"
            />
            <button onClick={runSearch} className="bg-ocean text-white rounded-2xl px-4 font-bold">
              {isPending ? "…" : "→"}
            </button>
          </div>
        )}

        {tab === "mood" && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => runMood(m.label)}
                className="border-2 border-[#DCEEFA] rounded-2xl py-3.5 text-center hover:border-primary"
              >
                <div className="text-2xl">{m.emoji}</div>
                <div className="text-xs font-semibold mt-1">{m.label}</div>
              </button>
            ))}
          </div>
        )}

        {error && <div className="bg-error/10 text-error text-xs p-3 rounded-xl mb-4 text-center">{error}</div>}
        {isPending && <p className="text-center text-textmuted text-sm py-8">Charting a course to your next book…</p>}

        {results && !isPending && (
          <div className="flex flex-col gap-3">
            {results.insight && (
              <div className="bg-[#E0F7FC] border border-accent/30 rounded-2xl px-4 py-3 text-sm text-primary">
                🌊 {results.insight}
              </div>
            )}
            {results.books.map((b, i) => (
              <div key={i} className="bg-white border border-[#DCEEFA] rounded-2xl p-4 flex gap-3 shadow-sm">
                <div className="text-3xl bg-primary/10 rounded-xl w-16 h-20 flex items-center justify-center flex-shrink-0">📖</div>
                <div>
                  <div className="font-bold text-sm">{b.title}</div>
                  <div className="text-textmuted text-xs mb-2">by {b.author}</div>
                  <div className="text-xs text-textmuted">{b.why}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
