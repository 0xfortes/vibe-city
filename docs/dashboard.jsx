import { useState, useEffect, useRef } from "react";

// ─── Utility: Time-based greeting ───
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Late night vibes";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Late night vibes";
};

// ─── Animated background mesh ───
const MeshBackground = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{
      position: "absolute", width: 700, height: 700, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(0,255,170,0.05) 0%, transparent 70%)",
      top: "-15%", right: "10%", animation: "meshDrift1 22s ease-in-out infinite",
    }} />
    <div style={{
      position: "absolute", width: 500, height: 500, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)",
      bottom: "0%", left: "-5%", animation: "meshDrift2 28s ease-in-out infinite",
    }} />
    <div style={{
      position: "absolute", width: 350, height: 350, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(236,72,153,0.03) 0%, transparent 70%)",
      top: "55%", right: "-3%", animation: "meshDrift3 18s ease-in-out infinite",
    }} />
    {/* Noise overlay */}
    <div style={{
      position: "absolute", inset: 0, opacity: 0.02,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat", backgroundSize: "150px",
    }} />
  </div>
);

// ─── City row with hover ───
const CityRow = ({ name, country, flag, delay, onClick, isHot }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px", borderRadius: 14, cursor: "pointer",
        background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
        transition: "all 0.25s ease",
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        opacity: 0, animation: `fadeIn 0.4s ease forwards`,
        animationDelay: `${delay}s`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{flag}</span>
        <span style={{
          fontSize: 15, fontWeight: 600, color: "#fff",
          fontFamily: "'Outfit', sans-serif",
        }}>{name}</span>
        {isHot && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
            textTransform: "uppercase", color: "#ff6b6b",
            background: "rgba(255,107,107,0.1)", padding: "3px 8px",
            borderRadius: 6, fontFamily: "'JetBrains Mono', monospace",
          }}>HOT</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontSize: 12, color: "rgba(255,255,255,0.3)",
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5,
        }}>{country}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={hovered ? "#00FFaa" : "rgba(255,255,255,0.15)"}
          strokeWidth="2" strokeLinecap="round"
          style={{ transition: "all 0.25s ease" }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  );
};

// ─── Stat Micro Card ───
const StatCard = ({ label, value, icon, color, delay }) => (
  <div style={{
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: "20px 18px",
    opacity: 0, animation: `scaleIn 0.5s ease forwards`,
    animationDelay: `${delay}s`,
    display: "flex", flexDirection: "column", gap: 12,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18,
    }}>{icon}</div>
    <div>
      <div style={{
        fontSize: 24, fontWeight: 700, color: "#fff",
        fontFamily: "'Outfit', sans-serif", letterSpacing: -0.5,
      }}>{value}</div>
      <div style={{
        fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4,
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
        textTransform: "uppercase",
      }}>{label}</div>
    </div>
  </div>
);

// ─── Progress Ring ───
const UsageRing = ({ used, total, delay }) => {
  const pct = used / total;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;
  const color = pct >= 1 ? "#ff6b6b" : "#00FFaa";

  return (
    <div style={{
      position: "relative", width: 100, height: 100,
      opacity: 0, animation: `scaleIn 0.6s ease forwards`,
      animationDelay: `${delay}s`,
    }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontSize: 26, fontWeight: 700, color: "#fff",
          fontFamily: "'Outfit', sans-serif",
        }}>{used}<span style={{ color: "rgba(255,255,255,0.25)" }}>/{total}</span></span>
        <span style={{
          fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2,
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1.5,
          textTransform: "uppercase",
        }}>used</span>
      </div>
    </div>
  );
};

// ─── Recent Debate Card ───
const DebateCard = ({ city, flag, date, agents, verdict, delay }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18, padding: 1,
        background: hovered
          ? "linear-gradient(135deg, rgba(0,255,170,0.3), rgba(99,102,241,0.3))"
          : "rgba(255,255,255,0.06)",
        transition: "all 0.4s ease", cursor: "pointer",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        opacity: 0, animation: `fadeSlideUp 0.6s ease forwards`,
        animationDelay: `${delay}s`,
      }}
    >
      <div style={{
        borderRadius: 17, padding: "22px 20px",
        background: "rgba(12,12,18,0.97)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{flag}</span>
            <div>
              <div style={{
                fontSize: 16, fontWeight: 700, color: "#fff",
                fontFamily: "'Outfit', sans-serif",
              }}>{city}</div>
              <div style={{
                fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 3,
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5,
              }}>{date}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: -4 }}>
            {agents.map((a, i) => (
              <span key={i} style={{
                fontSize: 16, marginLeft: i > 0 ? -4 : 0,
                filter: "grayscale(0.2)",
              }}>{a}</span>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: 1.5,
            textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
            fontFamily: "'JetBrains Mono', monospace",
          }}>Verdict</span>
          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "6px 0 0",
            lineHeight: 1.5, fontFamily: "'Outfit', sans-serif", fontStyle: "italic",
          }}>"{verdict}"</p>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───
export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const userName = "strongs";

  const cities = [
    { name: "Tokyo", country: "Japan", flag: "🇯🇵", isHot: true },
    { name: "Berlin", country: "Germany", flag: "🇩🇪", isHot: false },
    { name: "Mexico City", country: "Mexico", flag: "🇲🇽", isHot: true },
    { name: "Lisbon", country: "Portugal", flag: "🇵🇹", isHot: false },
    { name: "New York City", country: "United States", flag: "🇺🇸", isHot: false },
    { name: "Paris", country: "France", flag: "🇫🇷", isHot: false },
    { name: "London", country: "United Kingdom", flag: "🇬🇧", isHot: false },
    { name: "Bangkok", country: "Thailand", flag: "🇹🇭", isHot: true },
    { name: "Buenos Aires", country: "Argentina", flag: "🇦🇷", isHot: false },
    { name: "Istanbul", country: "Turkey", flag: "🇹🇷", isHot: false },
  ];

  const filtered = cities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const recentDebates = [
    {
      city: "Tokyo", flag: "🇯🇵", date: "Mar 8, 2026 · 11:42 PM",
      agents: ["🦉", "🍔", "🎭", "🔥", "🌀"],
      verdict: "Hit Golden Gai for tiny bars, then late-night ramen at Fuunji."
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #08080c; }

        @keyframes meshDrift1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-50px, 30px) scale(1.1); }
        }
        @keyframes meshDrift2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(40px,-35px) scale(1.12); }
        }
        @keyframes meshDrift3 {
          0%, 100% { transform: translate(0,0) scale(0.95); }
          50% { transform: translate(-25px,45px) scale(1.05); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        @keyframes shimmerSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes waveHand {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-8deg); }
          45% { transform: rotate(14deg); }
          60% { transform: rotate(-4deg); }
          75% { transform: rotate(10deg); }
        }

        .search-dash::placeholder {
          color: rgba(255,255,255,0.2);
          font-style: normal;
        }
        .nav-link {
          position: relative; color: rgba(255,255,255,0.45);
          transition: color 0.3s ease; text-decoration: none;
        }
        .nav-link:hover { color: rgba(255,255,255,0.9); }
        .nav-link::after {
          content: ''; position: absolute;
          bottom: -4px; left: 0; right: 0; height: 1px;
          background: #00FFaa; transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .nav-link:hover::after { transform: scaleX(1); }

        .upgrade-btn {
          position: relative; overflow: hidden;
          transition: all 0.4s ease;
        }
        .upgrade-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,255,170,0.2);
        }
        .upgrade-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmerSlide 3s ease-in-out infinite;
        }

        .city-scroll::-webkit-scrollbar { width: 4px; }
        .city-scroll::-webkit-scrollbar-track { background: transparent; }
        .city-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08); border-radius: 4px;
        }
        .city-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.15);
        }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#08080c", color: "#fff",
        fontFamily: "'Outfit', sans-serif", position: "relative",
      }}>
        <MeshBackground />

        {/* ─── Navbar ─── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50, padding: "0 40px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(8,8,12,0.75)", backdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 17, fontWeight: 300, color: "rgba(255,255,255,0.65)", letterSpacing: -0.3 }}>Vibe</span>
            <span style={{
              fontSize: 17, fontWeight: 800, letterSpacing: -0.3,
              background: "linear-gradient(135deg, #00FFaa, #06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>CITY</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a className="nav-link" href="#" style={{
              fontSize: 13, fontWeight: 500, letterSpacing: 0.4,
              fontFamily: "'Outfit', sans-serif", color: "#00FFaa",
            }}>Dashboard</a>
            <button style={{
              padding: "8px 18px", borderRadius: 100,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent", color: "rgba(255,255,255,0.5)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "'Outfit', sans-serif", transition: "all 0.3s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >Sign out</button>
          </div>
        </nav>

        {/* ─── Content ─── */}
        <div style={{
          position: "relative", zIndex: 1, maxWidth: 1160,
          margin: "0 auto", padding: "40px 40px 80px",
        }}>

          {/* ─── Header ─── */}
          <div style={{
            marginBottom: 40,
            opacity: 0, animation: "fadeSlideUp 0.7s ease forwards 0.1s",
          }}>
            <h1 style={{
              fontSize: 36, fontWeight: 700, letterSpacing: -1, margin: 0,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              {getGreeting()}, <span style={{
                background: "linear-gradient(135deg, #00FFaa, #06b6d4)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{userName}</span>
              <span style={{
                fontSize: 32, display: "inline-block",
                animation: "waveHand 2.5s ease-in-out 0.8s 1",
              }}>👋</span>
            </h1>
            <p style={{
              fontSize: 15, color: "rgba(255,255,255,0.3)", marginTop: 8,
              fontWeight: 400, letterSpacing: 0.2,
            }}>
              Your AI council is ready to debate. Pick a city and let them fight it out.
            </p>
          </div>

          {/* ─── Stats Row ─── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14,
            marginBottom: 32,
          }}>
            <StatCard label="Debates" value="1" icon="⚡" color="#00FFaa" delay={0.2} />
            <StatCard label="Cities explored" value="1" icon="🌍" color="#06b6d4" delay={0.3} />
            <StatCard label="Favorite Agent" value="🦉" icon="❤️" color="#ec4899" delay={0.4} />
            <StatCard label="Streak" value="1d" icon="🔥" color="#f97316" delay={0.5} />
          </div>

          {/* ─── Main Grid ─── */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 380px", gap: 24,
          }}>

            {/* ─── Left: Quick Start ─── */}
            <div style={{
              borderRadius: 22, padding: 1,
              background: "rgba(255,255,255,0.04)",
              opacity: 0, animation: "fadeSlideUp 0.7s ease forwards 0.4s",
            }}>
              <div style={{
                borderRadius: 21, padding: "28px 24px",
                background: "rgba(12,12,18,0.9)",
                backdropFilter: "blur(12px)",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 20,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", background: "#00FFaa",
                      boxShadow: "0 0 10px rgba(0,255,170,0.4)",
                      animation: "pulse 2s ease-in-out infinite",
                    }} />
                    <h2 style={{
                      fontSize: 12, fontWeight: 700, letterSpacing: 2.5,
                      textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
                      fontFamily: "'JetBrains Mono', monospace", margin: 0,
                    }}>Quick Start</h2>
                  </div>
                  <span style={{
                    fontSize: 11, color: "rgba(255,255,255,0.2)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{filtered.length} cities</span>
                </div>

                {/* Search */}
                <div style={{
                  borderRadius: 14, padding: 1, marginBottom: 8,
                  background: inputFocused
                    ? "linear-gradient(135deg, rgba(0,255,170,0.3), rgba(6,182,212,0.3))"
                    : "rgba(255,255,255,0.06)",
                  transition: "all 0.4s ease",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "rgba(8,8,12,0.95)", borderRadius: 13, padding: "12px 18px",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke={inputFocused ? "#00FFaa" : "rgba(255,255,255,0.2)"}
                      strokeWidth="2" strokeLinecap="round"
                      style={{ transition: "stroke 0.3s ease", flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                    </svg>
                    <input
                      className="search-dash"
                      type="text"
                      placeholder="Search cities..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        color: "#fff", fontSize: 14, fontFamily: "'Outfit', sans-serif",
                        fontWeight: 400,
                      }}
                    />
                    {search && (
                      <div
                        onClick={() => setSearch("")}
                        style={{
                          width: 20, height: 20, borderRadius: "50%",
                          background: "rgba(255,255,255,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.4)",
                        }}
                      >×</div>
                    )}
                  </div>
                </div>

                {/* City List */}
                <div className="city-scroll" style={{
                  maxHeight: 420, overflowY: "auto", marginTop: 4,
                  marginRight: -8, paddingRight: 8,
                }}>
                  {filtered.map((c, i) => (
                    <CityRow key={c.name} {...c} delay={0.5 + i * 0.04} onClick={() => {}} />
                  ))}
                  {filtered.length === 0 && (
                    <div style={{
                      textAlign: "center", padding: "40px 20px",
                      color: "rgba(255,255,255,0.2)", fontSize: 14,
                    }}>
                      <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>🔍</span>
                      No cities found. Try a different search.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Right Column ─── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Subscription Card */}
              <div style={{
                borderRadius: 22, padding: 1,
                background: "linear-gradient(160deg, rgba(0,255,170,0.12), rgba(99,102,241,0.08), rgba(255,255,255,0.04))",
                opacity: 0, animation: "fadeSlideUp 0.7s ease forwards 0.5s",
              }}>
                <div style={{
                  borderRadius: 21, padding: "28px 24px",
                  background: "linear-gradient(160deg, rgba(12,16,18,0.97) 0%, rgba(12,12,18,0.99) 100%)",
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    marginBottom: 24,
                  }}>
                    <div>
                      <div style={{
                        fontSize: 12, fontWeight: 700, letterSpacing: 2.5,
                        textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>Subscription</div>
                      <div style={{
                        marginTop: 10, display: "inline-flex", alignItems: "center",
                        gap: 8,
                      }}>
                        <span style={{
                          fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)",
                        }}>Plan</span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: 1,
                          textTransform: "uppercase",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          padding: "4px 12px", borderRadius: 8,
                          color: "rgba(255,255,255,0.5)",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>Free</span>
                      </div>
                    </div>
                    <UsageRing used={1} total={1} delay={0.7} />
                  </div>

                  <div style={{
                    fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6,
                    marginBottom: 24,
                  }}>
                    Upgrade to <span style={{ color: "#00FFaa", fontWeight: 600 }}>Pro</span> for unlimited Council debates, saved history, favorite agents, and more.
                  </div>

                  {/* Feature list */}
                  <div style={{
                    display: "flex", flexDirection: "column", gap: 10, marginBottom: 24,
                    padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.04)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    {[
                      ["♾️", "Unlimited debates"],
                      ["📜", "Saved debate history"],
                      ["🎯", "Pick your council agents"],
                      ["⚡", "Priority queue"],
                    ].map(([icon, text], i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        fontSize: 13, color: "rgba(255,255,255,0.45)",
                      }}>
                        <span style={{ fontSize: 14, width: 22, textAlign: "center" }}>{icon}</span>
                        {text}
                      </div>
                    ))}
                  </div>

                  <button className="upgrade-btn" style={{
                    width: "100%", padding: "14px 24px", borderRadius: 14,
                    border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #00FFaa, #06b6d4)",
                    color: "#08080c", fontSize: 14, fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif", letterSpacing: 0.3,
                  }}>
                    Upgrade to Pro — $9.99/mo
                  </button>
                </div>
              </div>

              {/* Quick Tip Card */}
              <div style={{
                borderRadius: 22, padding: "22px 20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                opacity: 0, animation: "fadeSlideUp 0.7s ease forwards 0.7s",
              }}>
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                }}>
                  <span style={{
                    fontSize: 22, flexShrink: 0, marginTop: 2,
                  }}>💡</span>
                  <div>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)",
                      fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
                      textTransform: "uppercase", marginBottom: 6,
                    }}>Pro tip</div>
                    <p style={{
                      fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6,
                      margin: 0,
                    }}>
                      Try searching for a city during its peak nightlife hours for the most opinionated debates from the Council.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Recent Debates Section ─── */}
          <div style={{ marginTop: 40 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20,
              opacity: 0, animation: "fadeSlideUp 0.7s ease forwards 0.8s",
            }}>
              <h2 style={{
                fontSize: 12, fontWeight: 700, letterSpacing: 2.5,
                textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
                fontFamily: "'JetBrains Mono', monospace", margin: 0,
              }}>Recent Debates</h2>
              <a href="#" style={{
                fontSize: 12, color: "#00FFaa", textDecoration: "none",
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5,
                opacity: 0.6, transition: "opacity 0.3s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
              >View all →</a>
            </div>

            {recentDebates.length > 0 ? (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
              }}>
                {recentDebates.map((d, i) => (
                  <DebateCard key={d.city} {...d} delay={0.9 + i * 0.1} />
                ))}
                {/* Empty state cards */}
                {[1, 2].map(i => (
                  <div key={`empty-${i}`} style={{
                    borderRadius: 18, border: "1px dashed rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 30, minHeight: 140,
                    opacity: 0, animation: `fadeIn 0.5s ease forwards`,
                    animationDelay: `${1.0 + i * 0.1}s`,
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <span style={{
                        fontSize: 24, display: "block", marginBottom: 8,
                        opacity: 0.3,
                      }}>🗳️</span>
                      <span style={{
                        fontSize: 12, color: "rgba(255,255,255,0.15)",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>Start a debate</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                borderRadius: 18, border: "1px dashed rgba(255,255,255,0.06)",
                padding: "50px 20px", textAlign: "center",
                opacity: 0, animation: "fadeSlideUp 0.7s ease forwards 0.9s",
              }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>🗳️</span>
                <p style={{
                  fontSize: 14, color: "rgba(255,255,255,0.25)", margin: 0, lineHeight: 1.6,
                }}>
                  No debates yet. Pick a city and let The Council decide.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Footer ─── */}
        <footer style={{
          position: "relative", zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.03)",
          padding: "28px 40px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,0.12)",
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
          }}>© 2026 VibeCITY</span>
          <div style={{ display: "flex", gap: 20 }}>
            {["About", "API", "Privacy"].map(link => (
              <a key={link} className="nav-link" href="#" style={{
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5,
                cursor: "pointer",
              }}>{link}</a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
