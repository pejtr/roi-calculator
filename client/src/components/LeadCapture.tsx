// Lead Capture Modal — Hormozi Value First approach
// Triggered after user sees results (high intent moment)

import { useState } from "react";
import { X, ArrowRight, CheckCircle, Zap } from "lucide-react";
import type { CalculatorResults } from "@/hooks/useCalculator";
import { formatCZK } from "@/hooks/useCalculator";

interface LeadCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  results: CalculatorResults | null;
  offer: "consultation" | "mini-audit" | "revenue-sprint";
  onSubmit: (data: { name: string; email: string; biggestChallenge: string }) => Promise<void>;
}

const CHALLENGES = [
  "Mám followers, ale nikdo nekupuje",
  "Nevím jak nastavit monetizační funnel",
  "Chci začít s affiliate, ale nevím jak",
  "Potřebuji zvýšit engagement rate",
  "Chci vytvořit vlastní online kurz",
  "Jiné",
];

export default function LeadCapture({ isOpen, onClose, results, onSubmit, offer }: LeadCaptureProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [challenge, setChallenge] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !challenge || !consent || sending) return;
    setSending(true);
    setError("");
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), biggestChallenge: challenge });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Odeslání se nezdařilo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md relative"
        style={{
          background: "oklch(0.09 0.004 285)",
          border: "1px solid rgba(212, 175, 55, 0.25)",
          borderRadius: "20px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(212,175,55,0.08)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "oklch(0.55 0.01 65)" }}
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="p-8 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(212, 175, 55, 0.15)", border: "1px solid rgba(212,175,55,0.3)" }}
            >
              <CheckCircle size={32} style={{ color: "#D4AF37" }} />
            </div>
            <h3
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4AF37" }}
            >
              Hotovo, {name}!
            </h3>
            <p className="text-sm mb-6" style={{ color: "oklch(0.65 0.01 65)" }}>
              Poptávka byla přijata. Na <strong style={{ color: "#D4AF37" }}>{email}</strong> se ozveme ohledně dalšího postupu.
            </p>
            <div
              className="p-4 rounded-xl text-left"
              style={{ background: "oklch(0.12 0.005 285)", border: "1px solid rgba(212,175,55,0.15)" }}
            >
              <p className="text-xs mb-1" style={{ color: "oklch(0.55 0.01 65)" }}>CO BUDE NÁSLEDOVAT</p>
              {[
                "Prověříme možnosti monetizace",
                "Domluvíme konkrétní rozsah a cenu předem",
                "Odesláním formuláře neprobíhá žádná platba",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 mt-2">
                  <span style={{ color: "#D4AF37", fontSize: "10px" }}>✦</span>
                  <span className="text-sm" style={{ color: "oklch(0.85 0.005 65)" }}>{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #8B6914)",
                color: "#0A0A0A",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Zpět na kalkulačku
            </button>
          </div>
        ) : (
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} style={{ color: "#D4AF37" }} />
                <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#D4AF37" }}>
                  Poptávka bez závazku
                </span>
              </div>
              <h3
                className="text-2xl font-bold mb-2 leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.97 0.003 65)" }}
              >
                Získej svůj personalizovaný<br />
                <span style={{ color: "#D4AF37" }}>{offer === "mini-audit" ? "Mini audit · 1 290 Kč" : offer === "revenue-sprint" ? "Revenue Audit Sprint · 9 900 Kč" : "monetizační konzultaci"}</span>
              </h3>
              {results && (
                <p className="text-sm" style={{ color: "oklch(0.65 0.01 65)" }}>
                  Orientační modelový scénář:{" "}
                  <strong style={{ color: "#D4AF37" }}>{formatCZK(results.monthlyPotential)}/měsíc</strong>
                </p>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: "oklch(0.65 0.01 65)" }}>
                  JMÉNO
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tvoje jméno"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "oklch(0.13 0.005 285)",
                    border: `1px solid ${name ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: "oklch(0.9 0.005 65)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: "oklch(0.65 0.01 65)" }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tvuj@email.cz"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "oklch(0.13 0.005 285)",
                    border: `1px solid ${email ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: "oklch(0.9 0.005 65)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: "oklch(0.65 0.01 65)" }}>
                  NEJVĚTŠÍ VÝZVA
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {CHALLENGES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setChallenge(c)}
                      className="text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                      style={{
                        background: challenge === c ? "rgba(212,175,55,0.15)" : "oklch(0.13 0.005 285)",
                        border: `1px solid ${challenge === c ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.06)"}`,
                        color: challenge === c ? "#D4AF37" : "oklch(0.75 0.005 65)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "oklch(0.65 0.01 65)" }}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                <span>Souhlasím se zpracováním údajů za účelem vyřízení poptávky. <a href="https://optimateo.com/datenschutz" target="_blank" rel="noreferrer" className="underline" style={{ color: "#D4AF37" }}>Ochrana osobních údajů</a>.</span>
              </label>
              {error && <p role="alert" className="text-sm" style={{ color: "#f87171" }}>{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !email.trim() || !challenge || !consent || sending}
                className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #D4AF37, #8B6914)",
                  color: "#0A0A0A",
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: name && email && challenge ? "0 8px 24px rgba(212,175,55,0.3)" : "none",
                }}
              >
                {sending ? "Odesílám…" : "Odeslat nezávaznou poptávku"}
                <ArrowRight size={16} />
              </button>

              <p className="text-center text-xs" style={{ color: "oklch(0.45 0.008 65)" }}>
                Kontaktujeme tě pouze k této poptávce. Není to platba ani přihlášení k newsletteru.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
