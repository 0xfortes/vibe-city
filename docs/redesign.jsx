import { useState, useEffect, useRef } from "react";

// ─── Animated Orb Background ───
const OrbBackground = () => {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,255,170,0.08) 0%, transparent 70%)",
        top: "-10%", right: "-5%",
        animation: "orbFloat1 20s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(120,80,255,0.06) 0%, transparent 70%)",
        bottom: "5%", left: "-8%",
        animation: "orbFloat2 25s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,100,200,0.05) 0%, transparent 70%)",
        top: "40%", left: "50%",
        animation: "orbFloat3 18s ease-in-out infinite",
      }} />
    </div>
  );
};

// ─── Agent Pill ───
const AgentPill = ({ emoji, name, color, delay }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "6px 16px", borderRadius: 100,
    background: `${color}10`, border: `1px solid ${color}25`,
    fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    color: color, letterSpacing: 0.3,
    opacity: 0, animation: `fadeSlideUp 0.6s ease forwards`,
    animationDelay: `${delay}s`,
    transition: "all 0.3s ease",
    cursor: "default",
  }}
    onMouseEnter={e => {
      e.currentTarget.style.background = `${color}20`;
      e.currentTarget.style.borderColor = `${color}50`;
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = `${color}10`;
      e.currentTarget.style.borderColor = `${color}25`;
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <span style={{ fontSize: 16 }}>{emoji}</span>
    {name}
  </div>
);

// ─── Vibe Score Ring ───
const VibeScoreRing = ({ score, color }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontSize: 20, fontWeight: 700, color: "#fff",
          fontFamily: "'Space Mono', monospace",
        }}>{score}</span>
      </div>
    </div>
  );
};

// ─── City Card ───
const CityCard = ({ city, country, score, tagline, gradient, delay }) => {
  const [hovered, setHovered] = useState(false);
  const scoreColor = score >= 90 ? "#00FFaa" : score >= 85 ? "#00d4ff" : "#a78bfa";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 20, padding: 1,
        background: hovered ? gradient : "rgba(255,255,255,0.06)",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: 0, animation: `fadeSlideUp 0.7s ease forwards`,
        animationDelay: `${delay}s`,
        cursor: "pointer",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
      }}
    >
      <div style={{
        borderRadius: 19, padding: "28px 24px",
        background: hovered
          ? "linear-gradient(160deg, rgba(20,20,28,0.97) 0%, rgba(12,12,18,0.99) 100%)"
          : "rgba(14,14,20,1)",
        transition: "background 0.5s ease",
        display: "flex", flexDirection: "column", gap: 20, minHeight: 180,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{
              fontSize: 22, fontWeight: 700, color: "#fff", margin: 0,
              fontFamily: "'DM Sans', sans-serif", letterSpacing: -0.5,
            }}>{city}</h3>
            <span style={{
              fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4, display: "block",
            }}>{country}</span>
          </div>
          <VibeScoreRing score={score} color={scoreColor} />
        </div>
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6,
          fontFamily: "'DM Sans', sans-serif", fontStyle: "italic",
          borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16,
        }}>"{tagline}"</p>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginTop: "auto",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: scoreColor,
            boxShadow: `0 0 8px ${scoreColor}60`,
            animation: "pulse 2s ease-in-out infinite",
          }} />
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,0.3)",
            fontFamily: "'Space Mono', monospace", letterSpacing: 1,
            textTransform: "uppercase",
          }}>Live vibe</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main App ───
export default function VibeCITY() {
  const [city, setCity] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const agents = [
    { emoji: "🦉", name: "Nightowl", color: "#a78bfa" },
    { emoji: "🍔", name: "Foodie", color: "#f97316" },
    { emoji: "🎭", name: "Culture Vulture", color: "#ec4899" },
    { emoji: "🔥", name: "Local Legend", color: "#ef4444" },
    { emoji: "🌀", name: "Wanderer", color: "#06b6d4" },
  ];

  const trending = [
    { city: "Tokyo", country: "Japan", score: 88, tagline: "Chaos with impeccable taste", gradient: "linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)" },
    { city: "Berlin", country: "Germany", score: 85, tagline: "The city that never sleeps because the techno won't let it", gradient: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)" },
    { city: "New York City", country: "United States", score: 91, tagline: "Eight million stories, none of them boring", gradient: "linear-gradient(135deg, #00FFaa 0%, #059669 100%)" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #08080c; }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 30px) scale(1.1); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -40px) scale(1.15); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(0.9); }
          50% { transform: translate(-30px, 50px) scale(1.05); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes titleReveal {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 40px rgba(0,255,170,0.15), 0 0 80px rgba(0,255,170,0.05); }
          50% { text-shadow: 0 0 60px rgba(0,255,170,0.25), 0 0 120px rgba(0,255,170,0.1); }
        }

        .search-input::placeholder {
          color: rgba(255,255,255,0.25);
          font-style: italic;
        }

        .nav-link {
          position: relative;
          color: rgba(255,255,255,0.5);
          transition: color 0.3s ease;
        }
        .nav-link:hover { color: rgba(255,255,255,0.9); }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0; right: 0;
          height: 1px;
          background: #00FFaa;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .nav-link:hover::after { transform: scaleX(1); }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#08080c", color: "#fff",
        fontFamily: "'DM Sans', sans-serif", position: "relative",
      }}>
        <OrbBackground />

        {/* ─── Navbar ─── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          padding: "0 40px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(8,8,12,0.7)", backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,0.7)", letterSpacing: -0.5 }}>
              Vibe
            </span>
            <span style={{
              fontSize: 18, fontWeight: 700, letterSpacing: -0.5,
              background: "linear-gradient(135deg, #00FFaa, #06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>CITY</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a className="nav-link" href="#" style={{
              fontSize: 13, textDecoration: "none", fontWeight: 500,
              letterSpacing: 0.5, cursor: "pointer",
            }}>Dashboard</a>
            <button style={{
              padding: "8px 20px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent", color: "rgba(255,255,255,0.6)",
              fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.3s ease", letterSpacing: 0.3,
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >Sign out</button>
          </div>
        </nav>

        {/* ─── Hero ─── */}
        <section style={{
          position: "relative", zIndex: 1, textAlign: "center",
          padding: "100px 24px 80px", maxWidth: 720, margin: "0 auto",
        }}>
          <h1 style={{
            fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: -3,
            margin: 0,
            opacity: 0, animation: "titleReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>Vibe</span>
            <span style={{
              background: "linear-gradient(135deg, #00FFaa 0%, #06b6d4 40%, #a78bfa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "glowPulse 4s ease-in-out infinite",
            }}>CITY</span>
          </h1>

          <p style={{
            fontSize: 17, color: "rgba(255,255,255,0.4)", marginTop: 20,
            fontWeight: 400, lineHeight: 1.6, letterSpacing: 0.2,
            opacity: 0, animation: "fadeSlideUp 0.8s ease forwards 0.3s",
          }}>
            5 AI agents debate what you should do tonight.
          </p>

          {/* Agent Pills */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center",
            gap: 10, marginTop: 32,
          }}>
            {agents.map((a, i) => (
              <AgentPill key={a.name} {...a} delay={0.5 + i * 0.1} />
            ))}
          </div>

          {/* Search Input */}
          <div style={{
            marginTop: 48, position: "relative", maxWidth: 480, margin: "48px auto 0",
            opacity: 0, animation: "fadeSlideUp 0.8s ease forwards 1.1s",
          }}>
            <div style={{
              position: "relative", borderRadius: 16, padding: 1,
              background: inputFocused
                ? "linear-gradient(135deg, rgba(0,255,170,0.4), rgba(6,182,212,0.4), rgba(167,139,250,0.4))"
                : "rgba(255,255,255,0.08)",
              transition: "all 0.4s ease",
              boxShadow: inputFocused ? "0 0 40px rgba(0,255,170,0.08)" : "none",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(14,14,20,0.95)", borderRadius: 15,
                padding: "16px 24px",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Drop a city..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: "#fff", fontSize: 16, fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 400, letterSpacing: 0.3,
                  }}
                />
                <div style={{
                  padding: "8px 20px", borderRadius: 10,
                  background: city.length > 0
                    ? "linear-gradient(135deg, #00FFaa, #06b6d4)"
                    : "rgba(255,255,255,0.06)",
                  color: city.length > 0 ? "#08080c" : "rgba(255,255,255,0.25)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.3s ease", fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: 0.5,
                }}>
                  Vibe it
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Trending Section ─── */}
        <section style={{
          position: "relative", zIndex: 1, maxWidth: 1100,
          margin: "0 auto", padding: "0 40px 100px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 36,
            opacity: 0, animation: "fadeSlideUp 0.7s ease forwards 1.3s",
          }}>
            <h2 style={{
              fontSize: 14, fontWeight: 600, letterSpacing: 2.5,
              textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
              fontFamily: "'Space Mono', monospace",
            }}>Trending Now</h2>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#00FFaa",
              boxShadow: "0 0 12px rgba(0,255,170,0.5)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}>
            {trending.map((t, i) => (
              <CityCard key={t.city} {...t} delay={1.5 + i * 0.15} />
            ))}
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer style={{
          position: "relative", zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          padding: "32px 40px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{
            fontSize: 12, color: "rgba(255,255,255,0.15)",
            fontFamily: "'Space Mono', monospace", letterSpacing: 1,
          }}>© 2026 VibeCITY</span>
          <div style={{ display: "flex", gap: 24 }}>
            {["About", "API", "Privacy"].map(link => (
              <a key={link} href="#" className="nav-link" style={{
                fontSize: 12, textDecoration: "none",
                fontFamily: "'Space Mono', monospace", letterSpacing: 0.5,
                cursor: "pointer",
              }}>{link}</a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
