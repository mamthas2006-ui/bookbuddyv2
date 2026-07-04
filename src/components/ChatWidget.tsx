import { useState, useRef, useEffect } from "react";
import { useChatSend } from "@/services/aiService";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

export default function ChatWidget({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Hi! I'm BookBuddy AI 🌊 Ask me for recommendations, summaries, or reading advice." },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { mutateAsync, isPending } = useChatSend();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || isPending) return;
    const message = input.trim();
    setInput("");
    setMsgs((p) => [...p, { role: "user", text: message }]);

    try {
      const { reply, conversationId: newId } = await mutateAsync({ conversationId, message });
      setConversationId(newId);
      setMsgs((p) => [...p, { role: "assistant", text: reply }]);
    } catch (e) {
      setMsgs((p) => [...p, { role: "assistant", text: "I'm having trouble connecting to my reading database right now. Please try again in a moment!" }]);
    }
  };

  return (
    <div className="fixed bottom-[90px] right-4 w-80 h-[460px] bg-white rounded-2xl shadow-2xl flex flex-col z-[200] border border-[#DCEEFA]">
      <div className="bg-ocean rounded-t-2xl px-4 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7.5 h-7.5 bg-white/20 rounded-full flex items-center justify-center text-sm">🌊</div>
          <div>
            <div className="text-white font-bold text-sm">BookBuddy AI</div>
            <div className="text-white/75 text-[10px]">Context-aware companion</div>
          </div>
        </div>
        <button onClick={onClose} className="bg-white/20 text-white w-6.5 h-6.5 rounded-full text-sm">
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-3.5 py-2.5 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-ocean text-white rounded-2xl rounded-br-md"
                  : "bg-bg text-textdark rounded-2xl rounded-bl-md"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isPending && <div className="text-textmuted text-xs px-3.5">Thinking…</div>}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-[#DCEEFA] flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about any book…"
          className="flex-1 px-3 py-2 rounded-xl border border-[#DCEEFA] text-xs outline-none"
        />
        <button onClick={send} disabled={isPending || !input.trim()} className="bg-ocean text-white rounded-xl px-3.5 py-2 disabled:opacity-50">
          →
        </button>
      </div>
    </div>
  );
}
