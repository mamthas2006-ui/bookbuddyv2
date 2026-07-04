import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/apiClient";
import { 
  Sparkles, MessageSquare, Quote, Clock, Send, User, BookOpen, 
  Copy, Check, ArrowRight, ShieldCheck, Heart, Share2, Compass, Award, Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const PRESET_CHARACTERS = [
  { name: "Sherlock Holmes", book: "The Adventures of Sherlock Holmes", emoji: "🕵️", desc: "Brilliant, analytical detective with sharp deduction skills." },
  { name: "Elizabeth Bennet", book: "Pride and Prejudice", emoji: "💃", desc: "Witty, independent heroine with sharp observations on society." },
  { name: "Jay Gatsby", book: "The Great Gatsby", emoji: "🍸", desc: "Enigmatic romantic millionaire obsessed with past memories and green lights." },
  { name: "Paul Atreides", book: "Dune", emoji: "🌌", desc: "Strategic young Duke navigating destiny, visions, and desert power." },
  { name: "Hermione Granger", book: "Harry Potter and the Sorcerer's Stone", emoji: "🪄", desc: "Brilliant witch devoted to knowledge, books, and loyalty." },
  { name: "Count Dracula", book: "Dracula", emoji: "🧛", desc: "Ancient, aristocratic vampire speaking with dramatic, gothic eloquence." },
];

const SAMPLE_QUOTES = [
  { quote: "So we beat on, boats against the current, borne back ceaselessly into the past.", book: "The Great Gatsby" },
  { quote: "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration.", book: "Dune" },
  { quote: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", book: "Pride and Prejudice" },
  { quote: "We are all in the gutter, but some of us are looking at the stars.", book: "Lady Windermere's Fan" },
];

export default function AILiteraryStudioPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "quotes" | "pace">("chat");

  // --- Character Chat State ---
  const [selectedChar, setSelectedChar] = useState(PRESET_CHARACTERS[0]);
  const [customCharName, setCustomCharName] = useState("");
  const [customBookTitle, setCustomBookTitle] = useState("");
  const [isCustomChar, setIsCustomChar] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "assistant", content: `Greetings! I am ${PRESET_CHARACTERS[0].name} from ${PRESET_CHARACTERS[0].book}. What mystery or question brings you to my quarters today?` }
  ]);
  const [userMsg, setUserMsg] = useState("");

  const chatMutation = useMutation({
    mutationFn: async (msg: string) => {
      const charName = isCustomChar ? customCharName || "Literary Character" : selectedChar.name;
      const bookName = isCustomChar ? customBookTitle || "Classic Literature" : selectedChar.book;
      const res = await api.post("/ai/character-chat", {
        characterName: charName,
        bookTitle: bookName,
        message: msg,
        history: chatHistory.slice(-6),
      });
      return res.data.data.reply;
    },
    onSuccess: (reply) => {
      setChatHistory((prev) => [...prev, { role: "assistant", content: reply }]);
    },
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsg.trim() || chatMutation.isPending) return;
    const msg = userMsg;
    setUserMsg("");
    setChatHistory((prev) => [...prev, { role: "user", content: msg }]);
    chatMutation.mutate(msg);
  };

  const handleSelectChar = (char: typeof PRESET_CHARACTERS[0]) => {
    setIsCustomChar(false);
    setSelectedChar(char);
    setChatHistory([
      { role: "assistant", content: `Greetings! I am ${char.name} from ${char.book}. What mystery or question brings you to my quarters today?` }
    ]);
  };

  // --- Quote Vault State ---
  const [quoteText, setQuoteText] = useState(SAMPLE_QUOTES[0].quote);
  const [quoteBook, setQuoteBook] = useState(SAMPLE_QUOTES[0].book);
  const [selectedAesthetic, setSelectedAesthetic] = useState<"Cosmic Noir" | "Vintage Botanical" | "Neon Cyberpunk" | "Minimalist Zen">("Vintage Botanical");
  const [copied, setCopied] = useState(false);

  const quoteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/ai/quote-analysis", { quote: quoteText, bookTitle: quoteBook });
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data?.recommendedAesthetic) {
        setSelectedAesthetic(data.recommendedAesthetic);
      }
    },
  });

  const handleCopyCard = () => {
    const text = `"${quoteText}"\n— ${quoteBook || "Unknown"}\n\n✨ Analyzed by BookBuddy AI`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // --- Pace Coach State ---
  const [paceBook, setPaceBook] = useState("The Lord of the Rings");
  const [totalPages, setTotalPages] = useState<number>(450);
  const [daysTarget, setDaysTarget] = useState<number>(14);

  const paceMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/ai/pace-coach", {
        bookTitle: paceBook,
        totalPages: Number(totalPages),
        daysToFinish: Number(daysTarget),
      });
      return res.data.data;
    },
  });

  // Aesthetic Card Styles
  const aestheticStyles = {
    "Cosmic Noir": "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-indigo-100 border-indigo-500/30 font-mono shadow-2xl shadow-indigo-950/50",
    "Vintage Botanical": "bg-[#FDFBF7] text-[#3D3A33] border-[#E2DDD3] font-serif shadow-xl shadow-amber-900/5",
    "Neon Cyberpunk": "bg-black text-cyan-400 border-pink-500/50 font-mono shadow-2xl shadow-pink-900/30 tracking-wide",
    "Minimalist Zen": "bg-white text-slate-800 border-slate-200 font-sans shadow-md",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-800">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white py-14 px-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 uppercase tracking-wider shadow-xs">
              <Sparkles size={14} className="text-amber-400 animate-pulse" /> Next-Gen AI Reader Features
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight">
              AI Literary Studio & Reading Hub
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-2.5 max-w-2xl leading-relaxed">
              Experience BookBuddy AI's most requested interactive features: roleplay live chat with iconic book characters, analyze quotes in customizable aesthetic cards, and generate personalized reading pace schedules!
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-indigo-200">
              <MessageSquare size={14} className="text-blue-400" /> Character Roleplay
            </span>
            <span className="bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-amber-200">
              <Quote size={14} className="text-amber-400" /> Aesthetic Quote Vault
            </span>
            <span className="bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-emerald-200">
              <Clock size={14} className="text-emerald-400" /> Pace Coach
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-6 -mt-7 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-2 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
              activeTab === "chat"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-[1.01]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <MessageSquare size={18} />
            <span>1. Character Chat Studio</span>
            <span className="bg-blue-500/20 text-white text-[10px] px-2 py-0.5 rounded-full font-mono ml-1">AI Roleplay</span>
          </button>

          <button
            onClick={() => setActiveTab("quotes")}
            className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
              activeTab === "quotes"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md transform scale-[1.01]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Quote size={18} />
            <span>2. Quote Vault & Share Cards</span>
            <span className="bg-amber-500/20 text-white text-[10px] px-2 py-0.5 rounded-full font-mono ml-1">Aesthetics</span>
          </button>

          <button
            onClick={() => setActiveTab("pace")}
            className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
              activeTab === "pace"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transform scale-[1.01]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Clock size={18} />
            <span>3. Smart Pace Coach</span>
            <span className="bg-emerald-500/20 text-white text-[10px] px-2 py-0.5 rounded-full font-mono ml-1">Streak Planner</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Character Chat Studio */}
      {activeTab === "chat" && (
        <div className="max-w-6xl mx-auto px-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: Character Selector */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 mb-4">
                  <User size={18} className="text-indigo-600" /> Select Literary Persona
                </h3>

                <div className="space-y-2.5">
                  {PRESET_CHARACTERS.map((char) => (
                    <button
                      key={char.name}
                      onClick={() => handleSelectChar(char)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        !isCustomChar && selectedChar.name === char.name
                          ? "bg-indigo-50/80 border-indigo-500 shadow-xs ring-1 ring-indigo-400"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/80"
                      }`}
                    >
                      <span className="text-2xl p-2 bg-white rounded-xl shadow-xs border border-slate-100">{char.emoji}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{char.name}</div>
                        <div className="text-xs text-indigo-600 font-medium italic">{char.book}</div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{char.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsCustomChar(true);
                      setChatHistory([{ role: "assistant", content: "Greetings, traveler of words! I am listening. Whom do you wish to speak with?" }]);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      isCustomChar
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Sparkles size={14} /> Custom Character & Book...
                  </button>

                  {isCustomChar && (
                    <div className="mt-3 space-y-2 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 animate-fadeIn">
                      <input
                        type="text"
                        placeholder="Character Name (e.g. Gandalf)"
                        value={customCharName}
                        onChange={(e) => setCustomCharName(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Book Title (e.g. The Hobbit)"
                        value={customBookTitle}
                        onChange={(e) => setCustomBookTitle(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-8 flex flex-col h-[620px] bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
              {/* Chat Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl shadow-inner">
                    {isCustomChar ? "✨" : selectedChar.emoji}
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-white">
                      {isCustomChar ? (customCharName || "Custom Literary Persona") : selectedChar.name}
                    </h2>
                    <div className="text-xs text-indigo-300 flex items-center gap-1">
                      <BookOpen size={12} /> {isCustomChar ? (customBookTitle || "World Literature") : selectedChar.book}
                    </div>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Roleplay
                </span>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {chatHistory.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                        m.role === "user"
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs leading-relaxed font-serif text-sm"
                      }`}
                    >
                      {m.role === "assistant" && (
                        <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1 font-sans flex items-center gap-1">
                          <Sparkles size={11} /> {isCustomChar ? (customCharName || "Character") : selectedChar.name}
                        </div>
                      )}
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 italic flex items-center gap-2 shadow-xs">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span>{isCustomChar ? (customCharName || "Character") : selectedChar.name} is composing a reply...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Ask ${isCustomChar ? (customCharName || "them") : selectedChar.name} a question about their story, thoughts, or life...`}
                  value={userMsg}
                  onChange={(e) => setUserMsg(e.target.value)}
                  disabled={chatMutation.isPending}
                  className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!userMsg.trim() || chatMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
                >
                  <Send size={16} /> Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quote Vault & Aesthetic Share Cards */}
      {activeTab === "quotes" && (
        <div className="max-w-6xl mx-auto px-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input & Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 mb-4">
                  <Quote size={18} className="text-amber-600" /> Enter Quote for AI Philosophical Breakdown
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Book Quote or Passage</label>
                    <textarea
                      rows={3}
                      value={quoteText}
                      onChange={(e) => setQuoteText(e.target.value)}
                      placeholder="Paste your favorite line..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm font-serif italic"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Book Title / Author (Optional)</label>
                    <input
                      type="text"
                      value={quoteBook}
                      onChange={(e) => setQuoteBook(e.target.value)}
                      placeholder="e.g. The Great Gatsby by F. Scott Fitzgerald"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                    />
                  </div>

                  <button
                    onClick={() => quoteMutation.mutate()}
                    disabled={!quoteText.trim() || quoteMutation.isPending}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {quoteMutation.isPending ? (
                      <>
                        <Sparkles className="animate-spin" size={16} /> Analyzing Philosophical Meaning...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Analyze Meaning & Suggest Aesthetic
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Try Famous Sample Quotes:</div>
                  <div className="space-y-2">
                    {SAMPLE_QUOTES.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuoteText(sq.quote);
                          setQuoteBook(sq.book);
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-xs transition-all flex items-center justify-between group"
                      >
                        <span className="font-serif italic truncate max-w-[80%] text-slate-700">"{sq.quote}"</span>
                        <span className="text-[10px] font-bold text-amber-600 group-hover:underline shrink-0">{sq.book}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aesthetic Picker */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                  <Compass size={16} className="text-amber-600" /> Select Visual Card Aesthetic
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {(["Cosmic Noir", "Vintage Botanical", "Neon Cyberpunk", "Minimalist Zen"] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setSelectedAesthetic(theme)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                        selectedAesthetic === theme
                          ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-500"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span>{theme}</span>
                      {selectedAesthetic === theme && <Check size={14} className="text-amber-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview & Analysis Output */}
            <div className="lg:col-span-6 space-y-6">
              {/* Visual Card Preview */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Live Shareable Card Preview</span>
                  <span className="text-amber-600 font-semibold">{selectedAesthetic} Theme</span>
                </div>

                <motion.div
                  key={selectedAesthetic}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`p-8 rounded-3xl border ${aestheticStyles[selectedAesthetic]} relative overflow-hidden min-h-[260px] flex flex-col justify-between`}
                >
                  <div className="absolute top-4 right-6 text-4xl opacity-15 select-none pointer-events-none font-serif">“</div>
                  <div className="relative z-10">
                    <p className="text-lg md:text-xl font-medium leading-relaxed italic mb-6">
                      "{quoteText}"
                    </p>
                    <div className="text-right">
                      <div className="font-bold text-sm tracking-wide">— {quoteBook || "Literary Classic"}</div>
                      {quoteMutation.data?.author && (
                        <div className="text-xs opacity-80 mt-0.5">{quoteMutation.data.author}</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-current/20 flex items-center justify-between text-[11px] opacity-80 relative z-10">
                    <span className="flex items-center gap-1 font-bold">
                      <Sparkles size={12} /> BookBuddy AI Vault
                    </span>
                    <span className="uppercase tracking-widest">{quoteMutation.data?.emotionalVibe || "Timeless Wisdom"}</span>
                  </div>
                </motion.div>

                <button
                  onClick={handleCopyCard}
                  className="mt-3 w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-xs text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  {copied ? "Copied Quote Card to Clipboard!" : "Copy Formatted Quote Card Text"}
                </button>
              </div>

              {/* AI Philosophical Breakdown Card */}
              {quoteMutation.data && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-200 rounded-2xl p-6 shadow-sm"
                >
                  <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-amber-600" /> AI Philosophical & Emotional Analysis
                  </h4>
                  <p className="text-sm text-amber-900 leading-relaxed font-serif mb-4">
                    {quoteMutation.data.philosophicalMeaning}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-amber-200/60">
                    <span className="bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                      Vibe: {quoteMutation.data.emotionalVibe}
                    </span>
                    {quoteMutation.data.tags?.map((tag: string, i: number) => (
                      <span key={i} className="bg-white text-amber-800 border border-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Smart Reading Pace Coach */}
      {activeTab === "pace" && (
        <div className="max-w-6xl mx-auto px-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 mb-4">
                  <Clock size={18} className="text-emerald-600" /> Configure Target Reading Schedule
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Book Title</label>
                    <input
                      type="text"
                      value={paceBook}
                      onChange={(e) => setPaceBook(e.target.value)}
                      placeholder="e.g. Project Hail Mary"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Total Book Pages</label>
                      <input
                        type="number"
                        min="1"
                        value={totalPages}
                        onChange={(e) => setTotalPages(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Target Finish (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={daysTarget}
                        onChange={(e) => setDaysTarget(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => paceMutation.mutate()}
                    disabled={!paceBook.trim() || paceMutation.isPending}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {paceMutation.isPending ? (
                      <>
                        <Clock className="animate-spin" size={16} /> Generating AI Coach Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Generate AI Reading Coach Plan
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Quick Pace Presets:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => { setTotalPages(320); setDaysTarget(7); }}
                      className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl text-center text-xs font-bold transition-all"
                    >
                      🚀 7 Days<br/><span className="text-[10px] text-slate-500 font-normal">(Fast Sprint)</span>
                    </button>
                    <button
                      onClick={() => { setTotalPages(450); setDaysTarget(14); }}
                      className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl text-center text-xs font-bold transition-all"
                    >
                      📖 14 Days<br/><span className="text-[10px] text-slate-500 font-normal">(Standard)</span>
                    </button>
                    <button
                      onClick={() => { setTotalPages(600); setDaysTarget(30); }}
                      className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl text-center text-xs font-bold transition-all"
                    >
                      ☕ 30 Days<br/><span className="text-[10px] text-slate-500 font-normal">(Cozy Pace)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Display */}
            <div className="lg:col-span-7 space-y-6">
              {paceMutation.data ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Top Stats Banner */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-lg grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Daily Page Target</div>
                      <div className="text-3xl font-black mt-1">{paceMutation.data.dailyPageTarget} pages</div>
                      <div className="text-[11px] text-emerald-100">Every day for {paceMutation.data.daysToFinish} days</div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Daily Time Est.</div>
                      <div className="text-3xl font-black mt-1">~{paceMutation.data.dailyMinutesEstimate} mins</div>
                      <div className="text-[11px] text-emerald-100">At average reading speed</div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <Award size={14} className="text-amber-300" /> Streak Freeze Active
                      </div>
                      <div className="text-[11px] text-emerald-100 mt-0.5">Your streak is protected if you miss 1 day!</div>
                    </div>
                  </div>

                  {/* Coaching Advice */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="text-emerald-600" /> AI Coach Advice for "{paceMutation.data.bookTitle}"
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl font-medium">
                      {paceMutation.data.coachingAdvice}
                    </p>

                    {/* Milestones */}
                    <div className="mt-6">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Milestone Checkpoints</div>
                      <div className="space-y-3">
                        {paceMutation.data.milestones?.map((ms: any, i: number) => (
                          <div key={i} className="flex items-start gap-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                              D{ms.day}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900">Day {ms.day} Check-in</span>
                                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                  Reach Page {ms.targetPage}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-snug">{ms.tip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200">
                    <Clock size={28} />
                  </div>
                  <h4 className="font-bold text-base text-slate-800">No Coaching Schedule Generated Yet</h4>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">
                    Enter your book details on the left and click "Generate AI Reading Coach Plan" to get your customized daily schedule!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
