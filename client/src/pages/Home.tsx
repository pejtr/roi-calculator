// War Room — Creator ROI Calculator
// Design: Dark Premium Command Center | Hormozi DNA
// Layout: Asymmetric split (inputs left, live results right)
// Colors: #0A0A0A base, #D4AF37 gold, white data text

import { useState, useEffect, useCallback } from "react";
import {
  calculate,
  formatCZK,
  formatNumber,
  type CalculatorInputs,
  type CalculatorResults,
  type CreatorType,
} from "@/hooks/useCalculator";
import { useCountUp } from "@/hooks/useCountUp";
import { submitCreatorLead, type CreatorLead } from "@/lib/leads";
import LeadCapture from "@/components/LeadCapture";
import { toast } from "sonner";
import {
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Mail,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

const CREATOR_TYPES: { value: CreatorType; label: string; icon: string; desc: string }[] = [
  { value: "influencer", label: "Influencer", icon: "📱", desc: "Instagram, TikTok, X" },
  { value: "realtor", label: "Realitní makléř", icon: "🏠", desc: "Reality & investice" },
  { value: "educator", label: "Eduktor / Kouč", icon: "🎓", desc: "Kurzy, koučink" },
  { value: "youtuber", label: "YouTuber", icon: "▶️", desc: "YouTube, Podcast" },
];


function GoldSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  hint?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "oklch(0.55 0.01 65)" }}>
          {label}
        </span>
        <span
          className="text-sm font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4AF37" }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ "--range-progress": `${pct}%` } as React.CSSProperties}
      />
      {hint && (
        <p className="text-xs" style={{ color: "oklch(0.45 0.008 65)" }}>{hint}</p>
      )}
    </div>
  );
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const animated = useCountUp(value);
  return (
    <span>
      {prefix}{animated.toLocaleString("cs-CZ")}{suffix}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke="#D4AF37" strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-out", filter: "drop-shadow(0 0 6px rgba(212,175,55,0.5))" }}
        />
      </svg>
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4AF37" }}>
          {score}
        </div>
        <div className="text-xs" style={{ color: "oklch(0.55 0.01 65)" }}>/ 100</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    creatorType: "influencer",
    followers: 10000,
    engagementRate: 3.5,
    currentMonthlyRevenue: 15000,
    contentFrequency: 3,
    hasEmailList: false,
    emailListSize: 0,
  });

  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CreatorLead["offer"]>("consultation");

  const updateInput = useCallback(<K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const r = calculate(inputs);
    setResults(r);
  }, [inputs]);

  const handleLeadSubmit = async (data: { name: string; email: string; biggestChallenge: string }) => {
    await submitCreatorLead({
      ...data,
      consent: true,
      offer: selectedOffer,
      creatorType: inputs.creatorType,
      scenario: {
        followers: inputs.followers,
        engagementRate: inputs.engagementRate,
        currentMonthlyRevenue: inputs.currentMonthlyRevenue,
      },
    });
    toast.success("Poptávka byla přijata do LEAD OS.");
  };

  const openInquiry = (offer: CreatorLead["offer"]) => {
    setSelectedOffer(offer);
    setShowLeadCapture(true);
  };

  const monthly = results?.monthlyPotential ?? 0;
  const yearly = results?.yearlyPotential ?? 0;
  const gap = results?.revenueGap ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A", fontFamily: "'DM Sans', sans-serif" }}>

      {/* HERO SECTION */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/89740521/bf3X7ELdCHp7LiTAZC3nTP/hero-bg-h7pcBvhCozsiRwoNy54mYe.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
        }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,10,10,0.97) 40%, rgba(10,10,10,0.7) 100%)" }} />
        <div className="relative container py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 pulse-gold" />
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#D4AF37" }}>
                Free Tool — Hormozi Value First
              </span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold leading-tight mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "oklch(0.97 0.003 65)" }}
            >
              Kolik může vydělat<br />
              <span style={{ color: "#D4AF37" }}>tvůj obsah?</span>
            </h1>
            <p className="text-lg mb-8" style={{ color: "oklch(0.65 0.01 65)", maxWidth: "480px" }}>
              Kalkulačka pro realitáky, influencery, edukátory a YouTubery.
              Zjisti svůj monetizační potenciál za 60 sekund.
            </p>

            <p className="text-sm leading-relaxed mt-4 max-w-xl" style={{ color: "oklch(0.62 0.01 65)" }}>
              Výsledky jsou orientační modelové scénáře, nikoli predikce budoucích příjmů.
              Skutečný výsledek záleží na publiku, nabídce a realizaci.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CALCULATOR — Asymmetric Split */}
      <section className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* LEFT: Inputs (2/5) */}
          <div className="lg:col-span-2 space-y-5">
            <div
              className="p-6 rounded-2xl space-y-6"
              style={{
                background: "oklch(0.11 0.005 285)",
                border: "1px solid rgba(212,175,55,0.12)",
              }}
            >
              <div>
                <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: "#D4AF37" }}>
                  Typ tvůrce
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CREATOR_TYPES.map((ct) => (
                    <button
                      key={ct.value}
                      onClick={() => updateInput("creatorType", ct.value)}
                      className="p-3 rounded-xl text-left transition-all"
                      style={{
                        background: inputs.creatorType === ct.value ? "rgba(212,175,55,0.12)" : "oklch(0.14 0.005 285)",
                        border: `1px solid ${inputs.creatorType === ct.value ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <div className="text-lg mb-1">{ct.icon}</div>
                      <div
                        className="text-xs font-semibold"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          color: inputs.creatorType === ct.value ? "#D4AF37" : "oklch(0.85 0.005 65)",
                        }}
                      >
                        {ct.label}
                      </div>
                      <div className="text-xs" style={{ color: "oklch(0.45 0.008 65)" }}>{ct.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="gold-line" />

              <GoldSlider
                label="Počet followerů / odběratelů"
                value={inputs.followers}
                min={1000}
                max={500000}
                step={1000}
                onChange={(v) => updateInput("followers", v)}
                format={formatNumber}
                hint="Instagram, YouTube, TikTok, LinkedIn..."
              />

              <GoldSlider
                label="Engagement Rate"
                value={inputs.engagementRate}
                min={0.5}
                max={15}
                step={0.1}
                onChange={(v) => updateInput("engagementRate", v)}
                format={(v) => `${v.toFixed(1)} %`}
                hint="Modelový referenční bod: 3 %. Skutečné hodnoty se liší podle platformy."
              />

              <GoldSlider
                label="Aktuální příjem z obsahu"
                value={inputs.currentMonthlyRevenue}
                min={0}
                max={200000}
                step={1000}
                onChange={(v) => updateInput("currentMonthlyRevenue", v)}
                format={formatCZK}
                hint="Měsíčně ze všech kanálů dohromady"
              />

              <GoldSlider
                label="Frekvence obsahu"
                value={inputs.contentFrequency}
                min={1}
                max={14}
                step={1}
                onChange={(v) => updateInput("contentFrequency", v)}
                format={(v) => `${v}× / týden`}
              />

              <div className="gold-line" />

              {/* Email list toggle */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "oklch(0.55 0.01 65)" }}>
                      Máš email list?
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.008 65)" }}>
                      Vlastní publikum může snížit závislost na algoritmech
                    </p>
                  </div>
                  <button
                    onClick={() => updateInput("hasEmailList", !inputs.hasEmailList)}
                    className="relative w-12 h-6 rounded-full transition-all"
                    style={{
                      background: inputs.hasEmailList ? "#D4AF37" : "oklch(0.2 0.005 285)",
                    }}
                  >
                    <span
                      className="absolute top-1 w-4 h-4 rounded-full transition-all"
                      style={{
                        background: inputs.hasEmailList ? "#0A0A0A" : "oklch(0.4 0.008 65)",
                        left: inputs.hasEmailList ? "28px" : "4px",
                      }}
                    />
                  </button>
                </div>

                {inputs.hasEmailList && (
                  <GoldSlider
                    label="Velikost email listu"
                    value={inputs.emailListSize}
                    min={100}
                    max={100000}
                    step={100}
                    onChange={(v) => updateInput("emailListSize", v)}
                    format={formatNumber}
                  />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Results Dashboard (3/5) */}
          <div className="lg:col-span-3 space-y-4">

            {/* Top KPI row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Modelově / měsíc",
                  value: monthly,
                  icon: <TrendingUp size={16} />,
                  big: true,
                },
                {
                  label: "Modelově / rok",
                  value: yearly,
                  icon: <BarChart3 size={16} />,
                  big: false,
                },
                {
                  label: "Modelová mezera",
                  value: gap,
                  icon: <Zap size={16} />,
                  big: false,
                  highlight: true,
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="p-4 rounded-2xl"
                  style={{
                    background: kpi.highlight
                      ? "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(139,105,20,0.08))"
                      : "oklch(0.11 0.005 285)",
                    border: `1px solid ${kpi.highlight ? "rgba(212,175,55,0.3)" : "rgba(212,175,55,0.1)"}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2" style={{ color: "#D4AF37" }}>
                    {kpi.icon}
                    <span className="text-xs font-medium tracking-wide" style={{ color: "oklch(0.55 0.01 65)" }}>
                      {kpi.label}
                    </span>
                  </div>
                  <div
                    className={`font-bold leading-none gold-number ${kpi.big ? "text-2xl" : "text-xl"}`}
                  >
                    <AnimatedNumber value={kpi.value} />
                    <span className="text-sm ml-1" style={{ color: "oklch(0.55 0.01 65)" }}>Kč</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Conversion Score + Opportunity */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-5 rounded-2xl flex items-center gap-4"
                style={{
                  background: "oklch(0.11 0.005 285)",
                  border: "1px solid rgba(212,175,55,0.1)",
                }}
              >
                <ScoreRing score={results?.conversionScore ?? 0} />
                <div>
                  <p className="text-xs font-medium tracking-wide uppercase mb-1" style={{ color: "oklch(0.55 0.01 65)" }}>
                    Conversion Score
                  </p>
                  <p className="text-sm" style={{ color: "oklch(0.75 0.005 65)" }}>
                    {(results?.conversionScore ?? 0) < 50
                      ? "Velký prostor na zlepšení"
                      : (results?.conversionScore ?? 0) < 75
                      ? "Solidní základ"
                      : "Připraven na škálování"}
                  </p>
                </div>
              </div>

              <div
                className="p-5 rounded-2xl"
                style={{
                  background: "oklch(0.11 0.005 285)",
                  border: "1px solid rgba(212,175,55,0.1)",
                }}
              >
                <p className="text-xs font-medium tracking-wide uppercase mb-2" style={{ color: "oklch(0.55 0.01 65)" }}>
                  Top příležitost
                </p>
                <p className="text-sm font-medium leading-snug" style={{ color: "#D4AF37", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {results?.topOpportunity ?? "—"}
                </p>
                <button
                  onClick={() => openInquiry("consultation")}
                  className="mt-3 flex items-center gap-1 text-xs font-medium transition-all hover:gap-2"
                  style={{ color: "oklch(0.65 0.01 65)" }}
                >
                  Jak na to? <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: "oklch(0.11 0.005 285)",
                border: "1px solid rgba(212,175,55,0.1)",
              }}
            >
              <p className="text-xs font-medium tracking-wide uppercase mb-4" style={{ color: "oklch(0.55 0.01 65)" }}>
                Rozložení příjmů
              </p>
              <div className="space-y-3">
                {results?.breakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm" style={{ color: "oklch(0.75 0.005 65)" }}>{item.label}</span>
                      <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4AF37" }}>
                        {formatCZK(item.value)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${item.percentage}%`,
                          background: item.color,
                          boxShadow: `0 0 8px ${item.color}60`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmarks */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: "oklch(0.11 0.005 285)",
                border: "1px solid rgba(212,175,55,0.1)",
              }}
            >
              <p className="text-xs font-medium tracking-wide uppercase mb-4" style={{ color: "oklch(0.55 0.01 65)" }}>
                Ilustrační referenční hodnoty
              </p>
              <div className="space-y-4">
                {results?.benchmarks.map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color: "oklch(0.65 0.01 65)" }}>{b.label}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span style={{ color: "oklch(0.55 0.01 65)" }}>Model: {b.average}{b.unit}</span>
                        <span
                          className="font-bold"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: b.yours >= b.average ? "#D4AF37" : "#ef4444",
                          }}
                        >
                          Ty: {b.yours}{b.unit}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      {/* Average marker */}
                      <div
                        className="absolute top-0 w-0.5 h-full rounded-full"
                        style={{
                          left: `${Math.min((b.average / (b.average * 2)) * 100, 100)}%`,
                          background: "rgba(255,255,255,0.2)",
                        }}
                      />
                      {/* Your value */}
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((b.yours / (b.average * 2)) * 100, 100)}%`,
                          background: b.yours >= b.average
                            ? "linear-gradient(90deg, #8B6914, #D4AF37)"
                            : "linear-gradient(90deg, #7f1d1d, #ef4444)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hormozi Value Equation */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(212,175,55,0.06), rgba(10,10,10,0))",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} style={{ color: "#D4AF37" }} />
                <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "#D4AF37" }}>
                  Hormozi Value Equation
                </p>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                {[
                  { label: "Dream Outcome", value: formatCZK(results?.hormozi.dreamOutcome ?? 0), sub: "ročně" },
                  { label: "Likelihood", value: `${results?.hormozi.likelihood ?? 0}/100`, sub: "ilustrační index" },
                  { label: "Time Delay", value: `${results?.hormozi.timeDelay?.toFixed(1) ?? 0}`, sub: "měsíce" },
                  { label: "Effort", value: `${results?.hormozi.effort ?? 0}/5`, sub: "náročnost" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div
                      className="text-lg font-bold mb-0.5"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4AF37" }}
                    >
                      {item.value}
                    </div>
                    <div className="text-xs" style={{ color: "oklch(0.45 0.008 65)" }}>{item.sub}</div>
                    <div className="text-xs mt-1" style={{ color: "oklch(0.55 0.01 65)" }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="gold-line mb-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "oklch(0.65 0.01 65)" }}>Value Score</span>
                <span
                  className="text-2xl font-bold gold-number"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {results?.hormozi.valueScore ?? 0}
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => openInquiry("consultation")}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all group"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #8B6914)",
                color: "#0A0A0A",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 8px 32px rgba(212,175,55,0.3)",
              }}
            >
              <Mail size={18} />
              Poptat monetizační konzultaci
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ROI offers — inquiries only, not payment transactions */}
      <section className="container py-12" id="audity">
        <div className="gold-line mb-10" />
        <div className="text-center mb-8">
          <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: "#D4AF37" }}>OPTIMATEO · ROI Intelligence</p>
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Z modelu k reálné obchodní akci</h2>
          <p className="text-sm max-w-xl mx-auto" style={{ color: "oklch(0.65 0.01 65)" }}>
            Kalkulačka je zdarma. Pokud chceš individuální doporučení, vyber si audit a nezávazně se poptej. Platba neprobíhá na této stránce.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="rounded-2xl p-6" style={{ background: "oklch(0.11 0.005 285)", border: "1px solid rgba(212,175,55,.2)" }}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "#D4AF37" }}>Start</p>
            <h3 className="text-xl font-bold mb-2">Creator Mini Audit</h3>
            <p className="text-3xl font-bold mb-4 gold-number">1 290 Kč</p>
            <p className="text-sm mb-6" style={{ color: "oklch(0.65 0.01 65)" }}>Stručná analýza monetizace, hlavní rizika a 3 konkrétní doporučené kroky.</p>
            <button onClick={() => openInquiry("mini-audit")} className="w-full rounded-lg py-3 font-semibold" style={{ background: "#D4AF37", color: "#0A0A0A" }}>Poptat mini audit →</button>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(212,175,55,.12), rgba(10,10,10,.95))", border: "1px solid rgba(212,175,55,.35)" }}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "#D4AF37" }}>Rozšířená spolupráce</p>
            <h3 className="text-xl font-bold mb-2">Revenue Audit Sprint</h3>
            <p className="text-3xl font-bold mb-4 gold-number">9 900 Kč</p>
            <p className="text-sm mb-6" style={{ color: "oklch(0.65 0.01 65)" }}>Individuální rozbor nabídky, konverzního funnelu a prioritizovaný plán zlepšení.</p>
            <button onClick={() => openInquiry("revenue-sprint")} className="w-full rounded-lg py-3 font-semibold" style={{ background: "#D4AF37", color: "#0A0A0A" }}>Poptat audit sprint →</button>
          </div>
        </div>
        <p className="text-xs text-center mt-5" style={{ color: "oklch(0.5 0.01 65)" }}>Uvedené ceny jsou orientační nabídka pro vymezený rozsah; spolupráce vzniká až po potvrzení zadání.</p>
      </section>

      {/* DASHBOARD VISUAL SECTION */}
      <section className="container py-8 pb-16">
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ border: "1px solid rgba(212,175,55,0.15)" }}
        >
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/89740521/bf3X7ELdCHp7LiTAZC3nTP/creator-dashboard-SF9DW99TjX4ZDKhZjeJ75y.webp"
            alt="Creator monetization dashboard"
            className="w-full object-cover"
            style={{ maxHeight: "320px", opacity: 0.7 }}
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(10,10,10,0.5)" }}>
            <div className="text-center">
              <p
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4AF37" }}
              >
                Tvůj systém. Tvoje pravidla.
              </p>
              <p className="text-sm mb-6" style={{ color: "oklch(0.75 0.005 65)" }}>
                Přestaň monetizovat náhodně. Začni systematicky.
              </p>
              <button
                onClick={() => openInquiry("consultation")}
                className="px-8 py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: "linear-gradient(135deg, #D4AF37, #8B6914)",
                  color: "#0A0A0A",
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: "0 8px 24px rgba(212,175,55,0.3)",
                }}
              >
                Poptat konzultaci →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-8"
        style={{ borderTop: "1px solid rgba(212,175,55,0.1)" }}
      >
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p
              className="text-sm font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#D4AF37" }}
            >
              Creator ROI Calculator
            </p>
            <p className="text-xs" style={{ color: "oklch(0.45 0.008 65)" }}>
              Ilustrační scénář · skutečné tržby nejsou garantované
            </p>
          </div>
          <p className="text-xs" style={{ color: "oklch(0.35 0.005 65)" }}>
            © 2026 · Bezplatný nástroj pro tvůrce obsahu
          </p>
        </div>
      </footer>

      {/* Components */}
      <LeadCapture
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        results={results}
        offer={selectedOffer}
        onSubmit={handleLeadSubmit}
      />
    </div>
  );
}
