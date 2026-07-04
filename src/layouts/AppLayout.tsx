import { Outlet, NavLink } from "react-router-dom";
import { Home, Search, BookOpen, Map, User, Sparkles } from "lucide-react";
import { useState } from "react";
import ChatWidget from "@/components/ChatWidget";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/discover", icon: Search, label: "Discover" },
  { to: "/app/ai-studio", icon: Sparkles, label: "Studio" },
  { to: "/library", icon: BookOpen, label: "Library" },
  { to: "/journey", icon: Map, label: "Journey" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function AppLayout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="max-w-[600px] mx-auto min-h-screen bg-white relative shadow-[0_0_40px_rgba(15,82,186,0.08)]">
      <main className="pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-[600px] mx-auto bg-white border-t border-[#DCEEFA] flex z-50">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                isActive ? "text-primary" : "text-textmuted"
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setChatOpen((v) => !v)}
        className="fixed bottom-[76px] right-4 w-[50px] h-[50px] rounded-full bg-ocean text-white text-xl shadow-lg z-[150] flex items-center justify-center"
        aria-label="Open AI chat assistant"
      >
        {chatOpen ? "×" : "💬"}
      </button>

      {chatOpen && <ChatWidget onClose={() => setChatOpen(false)} />}
    </div>
  );
}
