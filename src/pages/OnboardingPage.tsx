import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/apiClient";

const GENRES = ["Self-Help", "Finance", "History", "Philosophy", "Fiction", "Productivity", "Science", "Psychology"];
const MOODS = ["happy", "curious", "motivated", "relaxed", "sad", "overwhelmed"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [genres, setGenres] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [weeklyTime, setWeeklyTime] = useState(3);
  const [mood, setMood] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleGenre = (g: string) => setGenres((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]));

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/ai/reader-personality", {
        name: "Reader", genres, goal, weeklyTime, mood, level,
      });
      setProfile(data);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="bg-white rounded-2xl border border-[#DCEEFA] shadow-sm p-8 w-full max-w-md">
        {step === 0 && (
          <div>
            <h2 className="font-bold text-xl mb-4">What genres call to you?</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {GENRES.map((g) => (
                <button key={g} onClick={() => toggleGenre(g)}
                  className={`px-4 py-2 rounded-full text-sm border ${genres.includes(g) ? "bg-ocean text-white border-transparent" : "border-[#DCEEFA]"}`}>
                  {g}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="bg-ocean text-white rounded-xl px-6 py-3 font-bold">Continue →</button>
          </div>
        )}
        {step === 1 && (
          <div>
            <h2 className="font-bold text-xl mb-4">What's your reading goal?</h2>
            <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Build a daily habit…"
              className="w-full px-4 py-3 rounded-xl border border-[#DCEEFA] text-sm mb-6 outline-none" />
            <button onClick={() => setStep(2)} className="bg-ocean text-white rounded-xl px-6 py-3 font-bold">Continue →</button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="font-bold text-xl mb-4">Mood & level</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {MOODS.map((m) => (
                <button key={m} onClick={() => setMood(m)}
                  className={`px-4 py-2 rounded-full text-sm border ${mood === m ? "bg-ocean text-white border-transparent" : "border-[#DCEEFA]"}`}>
                  {m}
                </button>
              ))}
            </div>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#DCEEFA] text-sm mb-6">
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
            {error && <p className="text-error text-xs mb-3 p-2 bg-error/10 rounded-lg">{error}</p>}
            <button onClick={generate} disabled={loading} className="bg-ocean text-white rounded-xl px-6 py-3 font-bold disabled:opacity-60 transition-opacity">
              {loading ? "Generating Your Profile…" : "Generate My Profile →"}
            </button>
          </div>
        )}
        {step === 3 && profile && (
          <div className="text-center">
            <div className="text-5xl mb-3">{profile.emoji}</div>
            <h2 className="font-display text-2xl font-bold mb-2">{profile.name}</h2>
            <p className="text-textmuted text-sm mb-6">{profile.description}</p>
            <button onClick={() => navigate("/dashboard")} className="bg-ocean text-white rounded-xl px-6 py-3 font-bold w-full">
              Open My Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
