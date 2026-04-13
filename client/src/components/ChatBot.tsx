// War Room AI Advisor — Hormozi-style direct response chatbot
// Collects user data, provides actionable insights, captures leads

import { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare, Zap } from "lucide-react";
import type { CalculatorResults, CreatorType } from "@/hooks/useCalculator";
import { formatCZK } from "@/hooks/useCalculator";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  timestamp: Date;
}

interface ChatBotProps {
  results: CalculatorResults | null;
  creatorType: CreatorType;
  onLeadCapture?: (email: string, name: string) => void;
}

const CREATOR_LABELS: Record<CreatorType, string> = {
  influencer: "influencer",
  realtor: "realitní makléř",
  educator: "eduktor",
  youtuber: "YouTuber",
};

function generateBotResponse(
  userMessage: string,
  results: CalculatorResults | null,
  creatorType: CreatorType,
  messageCount: number
): string {
  const lower = userMessage.toLowerCase();
  const label = CREATOR_LABELS[creatorType];

  // Lead capture trigger
  if (messageCount >= 3 && !lower.includes("@")) {
    if (lower.includes("jak") || lower.includes("pomoc") || lower.includes("chci") || lower.includes("strateg")) {
      return `Vidím, že to myslíš vážně. Mám pro tebe připravený kompletní ${label} monetizační plán — krok za krokem. Pošlu ti ho na email. Jak se jmenuješ a jaký je tvůj email?`;
    }
  }

  // Email detected — capture lead
  if (lower.includes("@") && lower.includes(".")) {
    return `Perfektní! Plán ti pošlu do 24 hodin. Ještě jedna věc — jaký je tvůj největší problém s monetizací teď? (Příklad: "Mám followers ale nikdo nekupuje" nebo "Nevím jak nastavit funnel")`;
  }

  // Results-based responses
  if (results) {
    if (lower.includes("gap") || lower.includes("nechávám") || lower.includes("ztrácím") || lower.includes("potenciál")) {
      return `Tvůj revenue gap je ${formatCZK(results.revenueGap)} měsíčně. To je ${formatCZK(results.revenueGap * 12)} ročně, které teď nechávás na stole. Největší příležitost pro tebe jako ${label}: ${results.topOpportunity}. Chceš vědět, jak to konkrétně nastavit?`;
    }

    if (lower.includes("affiliate") || lower.includes("provize")) {
      return `Affiliate je pro ${label} zlatý důl — žádné vlastní produkty, žádný support. Tvůj potenciál z affiliate: ${formatCZK(results.breakdown[0].value)}/měsíc. Klíč je vybrat produkty s vysokou provizí (20–40 %) a relevancí pro tvé publikum. Chceš konkrétní doporučení produktů pro tvou niche?`;
    }

    if (lower.includes("email") || lower.includes("list") || lower.includes("newsletter")) {
      return `Email list je tvůj největší asset — přímý přístup k publiku bez algoritmů. Průměrný email list konvertuje 3–5x lépe než sociální sítě. Pokud ho ještě nemáš, začni dnes. Lead magnet (free checklist, kalkulačka, mini kurz) + automatizovaná sekvence = pasivní příjem. Mám pro tebe šablonu. Chceš ji?`;
    }

    if (lower.includes("kurz") || lower.includes("produkt") || lower.includes("prodávat")) {
      return `Vlastní produkt je nejlepší leverage. Jednou vytvoříš, prodáváš donekonečna. Pro ${label} doporučuji začít s mini kurzem ($97–$197) — nízká bariéra vstupu pro zákazníka, ale skvělá marže pro tebe. Hormozi říká: "Sell the outcome, not the process." Co je dream outcome tvého publika?`;
    }

    if (lower.includes("hormozi") || lower.includes("value") || lower.includes("nabídka")) {
      return `Hormozi Value Equation: Value = (Dream Outcome × Likelihood) / (Time Delay × Effort). Tvůj Value Score je ${results.hormozi.valueScore}. Chceš ho zvýšit? Sniž Time Delay (rychlejší výsledky) a Effort (jednodušší implementace). Jak konkrétně? Přidej case studies, testimonials a step-by-step návody. Co teď nabízíš svému publiku?`;
    }

    if (lower.includes("konverze") || lower.includes("ctr") || lower.includes("engagement")) {
      return `Tvůj Conversion Score je ${results.conversionScore}/100. ${results.conversionScore < 50 ? "Máš prostor na zlepšení — zaměř se na engagement rate a frekvenci obsahu." : results.conversionScore < 75 ? "Solidní základ. Přidej email list a uvidíš skok." : "Výborně! Teď je čas škálovat přes placené kanály."} Chceš konkrétní taktiku pro zvýšení konverze?`;
    }
  }

  // Generic Hormozi-style responses
  const responses = [
    `Přímá otázka si zaslouží přímou odpověď. Jako ${label} máš tři páky: obsah (přitahuje), email list (vlastníš), produkt/affiliate (monetizuješ). Kde teď nejvíce zaostáváš?`,
    `Hormozi říká: "The market doesn't care about your effort, only your output." Co je konkrétní výsledek, který tvoje publikum chce dosáhnout? Na tom stavíme celý funnel.`,
    `Nejčastější chyba ${label}ů: snaží se monetizovat příliš brzy nebo příliš pozdě. Správné načasování je klíč. Jak dlouho buduješ své publikum a kolik % z nich jsou "engaged followers"?`,
    `Data jsou tvůj nejlepší přítel. Bez měření neexistuje zlepšení. Sleduješ své konverzní metriky? (CTR, email open rate, revenue per follower)`,
  ];

  return responses[messageCount % responses.length];
}

export default function ChatBot({ results, creatorType, onLeadCapture }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      text: `Ahoj! Jsem tvůj War Room AI Advisor. Analyzoval jsem tvůj profil — máš konkrétní otázku k výsledkům? Nebo chceš vědět, jak maximalizovat svůj revenue gap?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userMessageCount = useRef(0);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    userMessageCount.current += 1;

    // Check for lead capture
    const lower = input.toLowerCase();
    if (lower.includes("@") && lower.includes(".")) {
      const emailMatch = input.match(/[\w.-]+@[\w.-]+\.\w+/);
      const nameMatch = input.match(/^([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+)/);
      if (emailMatch && onLeadCapture) {
        onLeadCapture(emailMatch[0], nameMatch?.[1] || "");
      }
    }

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(
        input,
        results,
        creatorType,
        userMessageCount.current
      );

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: botResponse,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          background: "linear-gradient(135deg, #D4AF37, #8B6914)",
          color: "#0A0A0A",
          boxShadow: "0 4px 24px rgba(212, 175, 55, 0.4)",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <Zap size={16} />
        AI Advisor
        <span className="w-2 h-2 rounded-full bg-green-400 pulse-gold" />
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-80 md:w-96 flex flex-col transition-all duration-300 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{
          height: "480px",
          background: "oklch(0.09 0.004 285)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          borderRadius: "16px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-t-2xl"
          style={{ borderBottom: "1px solid rgba(212, 175, 55, 0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #D4AF37, #8B6914)" }}
            >
              <Zap size={14} color="#0A0A0A" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4AF37" }}>
                War Room Advisor
              </p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-xs" style={{ color: "oklch(0.55 0.01 65)" }}>Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "oklch(0.55 0.01 65)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "bot" ? "chat-bubble-bot" : "chat-bubble-user"
                }`}
                style={{ color: "oklch(0.9 0.005 65)" }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="chat-bubble-bot px-3 py-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "#D4AF37",
                        animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="p-3 rounded-b-2xl"
          style={{ borderTop: "1px solid rgba(212, 175, 55, 0.15)" }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Zeptej se na svůj revenue gap..."
              className="flex-1 px-3 py-2 text-sm rounded-lg outline-none transition-all"
              style={{
                background: "oklch(0.15 0.005 285)",
                border: "1px solid rgba(212, 175, 55, 0.15)",
                color: "oklch(0.9 0.005 65)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #8B6914)",
                color: "#0A0A0A",
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
