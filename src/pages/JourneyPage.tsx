import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/apiClient";

export default function JourneyPage() {
  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => (await api.get("/users/me/achievements")).data,
  });

  return (
    <div>
      <div className="bg-ocean px-5 py-7 text-white">
        <h2 className="font-display text-2xl font-bold">Reading Journey</h2>
        <p className="opacity-85 text-sm">Your roadmap from first page to next</p>
      </div>
      <div className="p-4">
        <div className="bg-white border border-[#DCEEFA] rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-3">Badges</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            {achievements?.map((a: any) => (
              <div key={a.id} className={a.earned ? "" : "opacity-30"}>
                <div className="text-2xl">{a.icon}</div>
                <div className="text-[10px] text-textmuted mt-1">{a.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
