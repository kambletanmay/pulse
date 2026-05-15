import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Treemap, LineChart, Line, ReferenceLine,
} from "recharts";
import {
  Activity, TrendingUp, Sparkles, Zap, Radio, ChevronRight,
  Cpu, Eye, Filter, AlertCircle,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────────
// Seed data — slice of the real Spotify global dataset
// ───────────────────────────────────────────────────────────────────
const SEED_TRACKS = [{"artist": "Jimin", "song": "Who", "streams": 603979423, "daily": 7553534, "avg_daily": 1654738, "momentum": 1.2506, "velocity_ratio": 4.565}, {"artist": "Billie Eilish", "song": "BIRDS OF A FEATHER", "streams": 1078055969, "daily": 7194182, "avg_daily": 2953578, "momentum": 0.6673, "velocity_ratio": 2.436}, {"artist": "Teddy Swims", "song": "Lose Control", "streams": 1126280439, "daily": 7082537, "avg_daily": 3085700, "momentum": 0.6288, "velocity_ratio": 2.295}, {"artist": "Sabrina Carpenter", "song": "Espresso", "streams": 1316210474, "daily": 5709725, "avg_daily": 3606056, "momentum": 0.4338, "velocity_ratio": 1.583}, {"artist": "Chappell Roan", "song": "Good Luck, Babe!", "streams": 706042525, "daily": 5123739, "avg_daily": 1934363, "momentum": 0.7257, "velocity_ratio": 2.649}, {"artist": "Sabrina Carpenter", "song": "Please Please Please", "streams": 804408292, "daily": 4525181, "avg_daily": 2203858, "momentum": 0.5625, "velocity_ratio": 2.053}, {"artist": "Benson Boone", "song": "Beautiful Things", "streams": 1360463954, "daily": 4241882, "avg_daily": 3727299, "momentum": 0.3118, "velocity_ratio": 1.138}, {"artist": "Shaboozey", "song": "A Bar Song (Tipsy)", "streams": 749292375, "daily": 3516596, "avg_daily": 2052856, "momentum": 0.4693, "velocity_ratio": 1.713}, {"artist": "Hozier", "song": "Too Sweet", "streams": 951562869, "daily": 3011228, "avg_daily": 2607022, "momentum": 0.3165, "velocity_ratio": 1.155}, {"artist": "FloyyMenor", "song": "Gata Only", "streams": 1147181063, "daily": 2996560, "avg_daily": 3142962, "momentum": 0.2612, "velocity_ratio": 0.953}, {"artist": "The Weeknd", "song": "One Of The Girls", "streams": 1237909371, "daily": 2985446, "avg_daily": 3391533, "momentum": 0.2412, "velocity_ratio": 0.88}, {"artist": "The Neighbourhood", "song": "Sweater Weather", "streams": 3187169593, "daily": 2976255, "avg_daily": 8731971, "momentum": 0.0934, "velocity_ratio": 0.341}, {"artist": "Lord Huron", "song": "The Night We Met", "streams": 2382890548, "daily": 2963250, "avg_daily": 6528467, "momentum": 0.1244, "velocity_ratio": 0.454}, {"artist": "Dream Supplier", "song": "Clean Baby Sleep White Noise (Loopable)", "streams": 1158888634, "daily": 2927128, "avg_daily": 3175037, "momentum": 0.2526, "velocity_ratio": 0.922}, {"artist": "Tommy Richman", "song": "MILLION DOLLAR BABY", "streams": 820849602, "daily": 2820589, "avg_daily": 2248903, "momentum": 0.3436, "velocity_ratio": 1.254}, {"artist": "Arctic Monkeys", "song": "I Wanna Be Yours", "streams": 2450537652, "daily": 2696374, "avg_daily": 6713802, "momentum": 0.11, "velocity_ratio": 0.402}, {"artist": "Coldplay", "song": "Yellow", "streams": 2513216173, "daily": 2648103, "avg_daily": 6885524, "momentum": 0.1054, "velocity_ratio": 0.385}, {"artist": "Jung Kook", "song": "Seven", "streams": 1917641700, "daily": 2570770, "avg_daily": 5253813, "momentum": 0.1341, "velocity_ratio": 0.489}, {"artist": "*NSYNC", "song": "Bye Bye Bye", "streams": 766218771, "daily": 2538110, "avg_daily": 2099230, "momentum": 0.3313, "velocity_ratio": 1.209}, {"artist": "Ariana Grande", "song": "we can't be friends (wait for your love)", "streams": 896365244, "daily": 2485069, "avg_daily": 2455795, "momentum": 0.2772, "velocity_ratio": 1.012}, {"artist": "Post Malone", "song": "I Had Some Help (Feat. Morgan Wallen)", "streams": 648104581, "daily": 2480229, "avg_daily": 1775629, "momentum": 0.3827, "velocity_ratio": 1.397}, {"artist": "Artemas", "song": "i like the way you kiss me", "streams": 912453770, "daily": 2435832, "avg_daily": 2499873, "momentum": 0.267, "velocity_ratio": 0.974}, {"artist": "Travis Scott", "song": "FE!N", "streams": 890317128, "daily": 2409613, "avg_daily": 2439225, "momentum": 0.2706, "velocity_ratio": 0.988}, {"artist": "Dasha", "song": "Austin (Boots Stop Workin')", "streams": 539275304, "daily": 2404759, "avg_daily": 1477467, "momentum": 0.4459, "velocity_ratio": 1.628}, {"artist": "Kendrick Lamar", "song": "Not Like Us", "streams": 788382981, "daily": 2404319, "avg_daily": 2159953, "momentum": 0.305, "velocity_ratio": 1.113}, {"artist": "Djo", "song": "End of Beginning", "streams": 1019410778, "daily": 2361144, "avg_daily": 2792906, "momentum": 0.2316, "velocity_ratio": 0.845}, {"artist": "Van Morrison", "song": "Brown Eyed Girl", "streams": 1178142466, "daily": 2350002, "avg_daily": 3227788, "momentum": 0.1995, "velocity_ratio": 0.728}, {"artist": "The Goo Goo Dolls", "song": "Iris", "streams": 1879576385, "daily": 2303736, "avg_daily": 5149524, "momentum": 0.1226, "velocity_ratio": 0.447}, {"artist": "Jung Kook", "song": "Standing Next to You", "streams": 897280368, "daily": 2281080, "avg_daily": 2458302, "momentum": 0.2542, "velocity_ratio": 0.928}, {"artist": "Taylor Swift", "song": "Cruel Summer", "streams": 2481542457, "daily": 2271270, "avg_daily": 6798746, "momentum": 0.0915, "velocity_ratio": 0.334}, {"artist": "Tyler, The Creator", "song": "See You Again", "streams": 1822379391, "daily": 2002703, "avg_daily": 4992820, "momentum": 0.1099, "velocity_ratio": 0.401}, {"artist": "Feid", "song": "LUNA", "streams": 859239638, "daily": 1972447, "avg_daily": 2354081, "momentum": 0.2296, "velocity_ratio": 0.838}, {"artist": "Eurythmics", "song": "Sweet Dreams (Are Made of This)", "streams": 1474459530, "daily": 1941478, "avg_daily": 4039615, "momentum": 0.1317, "velocity_ratio": 0.481}, {"artist": "V", "song": "Love Me Again", "streams": 826038820, "daily": 1938939, "avg_daily": 2263120, "momentum": 0.2347, "velocity_ratio": 0.857}, {"artist": "Mitski", "song": "My Love Mine All Mine", "streams": 1199787148, "daily": 1932683, "avg_daily": 3287088, "momentum": 0.1611, "velocity_ratio": 0.588}, {"artist": "SZA", "song": "Kill Bill", "streams": 2078813747, "daily": 1927479, "avg_daily": 5695380, "momentum": 0.0927, "velocity_ratio": 0.338}, {"artist": "Linkin Park", "song": "Numb", "streams": 1860165774, "daily": 1918957, "avg_daily": 5096345, "momentum": 0.1032, "velocity_ratio": 0.377}, {"artist": "The Weeknd", "song": "Starboy", "streams": 3481137472, "daily": 1897939, "avg_daily": 9537363, "momentum": 0.0545, "velocity_ratio": 0.199}, {"artist": "The Chainsmokers", "song": "Something Just Like This", "streams": 2775000235, "daily": 1864789, "avg_daily": 7602740, "momentum": 0.0672, "velocity_ratio": 0.245}, {"artist": "Bruno Mars", "song": "When I Was Your Man", "streams": 2273842714, "daily": 1848985, "avg_daily": 6229706, "momentum": 0.0813, "velocity_ratio": 0.297}, {"artist": "The Script", "song": "Hall of Fame", "streams": 1542098419, "daily": 1837351, "avg_daily": 4224927, "momentum": 0.1191, "velocity_ratio": 0.435}, {"artist": "Tom Odell", "song": "Another Love", "streams": 2639301081, "daily": 1815421, "avg_daily": 7230962, "momentum": 0.0688, "velocity_ratio": 0.251}, {"artist": "Alphaville", "song": "Forever Young", "streams": 705300874, "daily": 1804908, "avg_daily": 1932331, "momentum": 0.2559, "velocity_ratio": 0.934}, {"artist": "Noah Kahan", "song": "Stick Season", "streams": 1174338287, "daily": 1801341, "avg_daily": 3217365, "momentum": 0.1534, "velocity_ratio": 0.56}, {"artist": "Roddy Ricch", "song": "The Box", "streams": 1998554926, "daily": 1784040, "avg_daily": 5475493, "momentum": 0.0893, "velocity_ratio": 0.326}, {"artist": "Earth, Wind & Fire", "song": "September", "streams": 1735938998, "daily": 1777196, "avg_daily": 4755997, "momentum": 0.1024, "velocity_ratio": 0.374}, {"artist": "Natasha Bedingfield", "song": "Unwritten", "streams": 1119392587, "daily": 1775434, "avg_daily": 3066829, "momentum": 0.1586, "velocity_ratio": 0.579}, {"artist": "Richy Mitch & The Coal Miners", "song": "Evergreen", "streams": 724141656, "daily": 1711016, "avg_daily": 1983950, "momentum": 0.2363, "velocity_ratio": 0.862}, {"artist": "Cigarettes After Sex", "song": "Apocalypse", "streams": 1454086198, "daily": 1673028, "avg_daily": 3983798, "momentum": 0.1151, "velocity_ratio": 0.42}, {"artist": "The Weeknd", "song": "Die For You", "streams": 2424085403, "daily": 1667707, "avg_daily": 6641330, "momentum": 0.0688, "velocity_ratio": 0.251}];
const SEED_ARTISTS = [{"artist": "Taylor Swift", "streams": 39782835766}, {"artist": "The Weeknd", "streams": 38458817140}, {"artist": "Bad Bunny", "streams": 33999724737}, {"artist": "Drake", "streams": 33073789969}, {"artist": "Ed Sheeran", "streams": 32534029810}, {"artist": "Billie Eilish", "streams": 28253244160}, {"artist": "Post Malone", "streams": 27798876572}, {"artist": "Ariana Grande", "streams": 24852909491}, {"artist": "Eminem", "streams": 23541047091}, {"artist": "Bruno Mars", "streams": 22132869673}, {"artist": "Rihanna", "streams": 21095855062}, {"artist": "Imagine Dragons", "streams": 20673479844}, {"artist": "Justin Bieber", "streams": 20661483710}, {"artist": "Maroon 5", "streams": 20349492334}, {"artist": "XXXTENTACION", "streams": 19588433981}, {"artist": "Coldplay", "streams": 18763978316}, {"artist": "Dua Lipa", "streams": 17209737355}, {"artist": "Calvin Harris", "streams": 17018275341}, {"artist": "Adele", "streams": 16918970434}, {"artist": "Kanye West", "streams": 16400338451}];

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};
const fmtFull = (n) => n.toLocaleString();

// Momentum: (Daily / Total) * 100 — share of lifetime streams happening today
const momentumScore = (daily, total) =>
  total > 0 ? (daily / total) * 100 : 0;

// Mock agentic vibe summary — mirrors the backend classifier
const generateVibe = (top5) => {
  const avgMomentum = top5.reduce((s, t) => s + t.momentum, 0) / top5.length;
  const avgVelocity = top5.reduce((s, t) => s + t.velocity_ratio, 0) / top5.length;
  const uniqArtists = new Set(top5.map((t) => t.artist)).size / top5.length;

  if (avgMomentum > 1.0 && avgVelocity > 1.4)
    return {
      vibe: "VOLATILE / BREAKOUT",
      headline: "Fresh tracks are eating yesterday's catalog. New releases dominate.",
      confidence: 0.94,
    };
  if (avgVelocity > 1.2)
    return {
      vibe: "ACCELERATING",
      headline: "Catalog hits are picking up steam — momentum positive but orderly.",
      confidence: 0.87,
    };
  if (uniqArtists < 0.6)
    return {
      vibe: "CONSOLIDATING",
      headline: "A small set of artists owns the conversation. Fanbases concentrated.",
      confidence: 0.81,
    };
  return {
    vibe: "STEADY-STATE",
    headline: "Streams healthy and broadly distributed across artists.",
    confidence: 0.76,
  };
};

// Animated counter
const Counter = ({ value, format = fmt, delay = 0 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const start = performance.now() + delay;
    let raf;
    const tick = (now) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, delay]);
  return <>{format(display)}</>;
};

// ───────────────────────────────────────────────────────────────────
// Ticker — scrolling daily-peak feed
// ───────────────────────────────────────────────────────────────────
const Ticker = ({ tracks }) => {
  const items = [...tracks.slice(0, 15), ...tracks.slice(0, 15)];
  return (
    <div className="relative overflow-hidden border-y border-violet-500/20 bg-black/60 backdrop-blur">
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg,#000 0%,transparent 8%,transparent 92%,#000 100%)",
          zIndex: 2,
        }}
      />
      <div className="flex items-center">
        <div className="flex items-center gap-2 px-4 py-2 border-r border-violet-500/30 bg-violet-500/5 z-10">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
          </span>
          <span className="text-[10px] tracking-[0.25em] font-mono text-violet-300">
            LIVE • DAILY PEAKS
          </span>
        </div>
        <motion.div
          className="flex gap-8 py-2 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        >
          {items.map((t, i) => (
            <span key={i} className="font-mono text-xs text-zinc-400 inline-flex items-center gap-3">
              <span className="text-violet-400">▸</span>
              <span className="text-zinc-200">{t.artist}</span>
              <span className="text-zinc-600">—</span>
              <span className="text-zinc-300 italic">{t.song}</span>
              <span className="text-cyan-400">{fmt(t.daily)}/d</span>
              <span className={t.momentum > 0.5 ? "text-violet-300" : "text-zinc-600"}>
                M{t.momentum.toFixed(2)}
              </span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────
// Custom shadcn-like primitives (kept inline for single-file artifact)
// ───────────────────────────────────────────────────────────────────
const Card = ({ className = "", children, ...rest }) => (
  <div
    className={`relative bg-zinc-950/60 border border-zinc-800 rounded-sm backdrop-blur-sm ${className}`}
    {...rest}
  >
    <div className="absolute -top-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
    {children}
  </div>
);

const CardHeader = ({ label, hint, icon: Icon }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={12} className="text-violet-400" strokeWidth={1.5} />}
      <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-400">{label}</span>
    </div>
    {hint && <span className="text-[10px] font-mono text-zinc-600">{hint}</span>}
  </div>
);

const Toggle = ({ active, onToggle, label }) => (
  <button
    onClick={onToggle}
    className={`group relative px-3 py-1.5 border text-[10px] font-mono tracking-widest transition-all ${
      active
        ? "border-violet-500/70 bg-violet-500/10 text-violet-300"
        : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
    }`}
  >
    <span className="flex items-center gap-2">
      <span
        className={`h-1.5 w-1.5 rounded-full transition-colors ${
          active ? "bg-violet-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" : "bg-zinc-700"
        }`}
      />
      {label}
    </span>
  </button>
);

// ───────────────────────────────────────────────────────────────────
// Main dashboard
// ───────────────────────────────────────────────────────────────────
export default function StreamingIntelligence() {
  const [minStreams, setMinStreams] = useState(0);
  const [risingOnly, setRisingOnly] = useState(false);
  const [predictiveOn, setPredictiveOn] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState(0);

  // ─── paste here ───
  const [liveData, setLiveData] = useState(null);
  useEffect(() => {
    fetch(`http://localhost:8000/analytics?min_streams=${minStreams}&rising_only=${risingOnly}`)
      .then(r => r.json())
      .then(setLiveData)
      .catch(() => setLiveData(null)); // fall back to seed
  }, [minStreams, risingOnly]);
  // ─── end ───

  // Apply filters
  const filtered = useMemo(() => {
    const source = liveData?.top_gainers ?? SEED_TRACKS;   // ← was: SEED_TRACKS
    let data = source.filter((t) => t.streams >= minStreams);
    if (risingOnly) {
      // ... leave the rest unchanged ...
    }
    return data;
  }, [minStreams, risingOnly, liveData]);   // ← add liveData

  const topGainers = useMemo(
    () => [...filtered].sort((a, b) => b.daily - a.daily).slice(0, 10),
    [filtered]
  );

  const velocityData = useMemo(
    () =>
      topGainers.map((t) => ({
        name: t.song.length > 14 ? t.song.slice(0, 14) + "…" : t.song,
        Daily: t.daily,
        AvgDaily: t.avg_daily,
        artist: t.artist,
      })),
    [topGainers]
  );

  const treemapData = useMemo(
    () =>
      SEED_ARTISTS.slice(0, 16).map((a, i) => ({
        name: a.artist,
        size: a.streams,
        rank: i,
      })),
    []
  );

  const vibe = useMemo(() => generateVibe(topGainers.slice(0, 5)), [topGainers]);

  const totals = useMemo(() => {
    const totalStreams = SEED_TRACKS.reduce((s, t) => s + t.streams, 0);
    const totalDaily = SEED_TRACKS.reduce((s, t) => s + t.daily, 0);
    const avgMomentum =
      SEED_TRACKS.reduce((s, t) => s + t.momentum, 0) / SEED_TRACKS.length;
    return { totalStreams, totalDaily, avgMomentum };
  }, []);

  // 7-day forecast from selected track's Daily — mild geometric decay
  const forecast = useMemo(() => {
    const t = topGainers[selectedTrack] || topGainers[0];
    if (!t) return [];
    const arr = [{ day: "T", value: t.daily, type: "actual" }];
    for (let i = 1; i <= 7; i++) {
      arr.push({
        day: `T+${i}`,
        value: Math.round(t.daily * Math.pow(0.985, i)),
        type: "forecast",
      });
    }
    return arr;
  }, [selectedTrack, topGainers]);

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-violet-500/30">
      {/* Imports + base styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        :root { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-display { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
        .scanlines::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, rgba(168,85,247,0.03) 0 1px, transparent 1px 3px);
          mix-blend-mode: overlay;
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-1px, 1px); }
          40% { transform: translate(1px, -1px); }
          60% { transform: translate(-1px, 0); }
          80% { transform: translate(1px, 1px); }
        }
        .glitch-hover:hover { animation: glitch 0.3s; }
      `}</style>

      {/* Background atmospherics */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(168,85,247,0.15), transparent 60%)",
        }}
      />

      {/* ───────── Header ───────── */}
      <header className="relative border-b border-zinc-900/80 bg-black/80 backdrop-blur z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-9 h-9 border border-violet-500/50 rotate-45 flex items-center justify-center bg-black">
                <div className="-rotate-45">
                  <Activity size={14} className="text-violet-400" strokeWidth={2} />
                </div>
              </div>
              <div className="absolute -inset-1 bg-violet-500/20 blur-md -z-10" />
            </div>
            <div>
              <h1 className="font-display text-xl text-zinc-100 leading-none glitch-hover">
                STREAMING <span className="text-violet-400">INTELLIGENCE</span>
              </h1>
              <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 mt-1">
                NEURAL MARKET TERMINAL · v1.0
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-mono text-[10px] text-zinc-500 tracking-widest">SESSION</div>
              <div className="font-mono text-xs text-violet-300">
                {new Date().toISOString().slice(0, 19).replace("T", " ")}Z
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-emerald-500/30 bg-emerald-500/5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="font-mono text-[10px] tracking-widest text-emerald-300">
                FEED ACTIVE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ───────── Live ticker ───────── */}
      <Ticker tracks={SEED_TRACKS} />

      {/* ───────── Body ───────── */}
      <main className="relative z-10 px-6 py-6 space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { label: "TRACKS MONITORED", value: SEED_TRACKS.length, fmt: (n) => Math.floor(n).toLocaleString(), icon: Radio },
            { label: "TOTAL STREAMS (CUM)", value: totals.totalStreams, fmt, icon: TrendingUp },
            { label: "DAILY VOLUME (24H)", value: totals.totalDaily, fmt, icon: Zap },
            { label: "AVG MOMENTUM", value: totals.avgMomentum, fmt: (n) => n.toFixed(3) + "%", icon: Cpu },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Card className="overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-30">
                  <k.icon size={16} className="text-violet-400" strokeWidth={1.2} />
                </div>
                <div className="p-4">
                  <div className="font-mono text-[10px] tracking-[0.25em] text-zinc-500 mb-3">
                    {k.label}
                  </div>
                  <div className="font-display text-3xl text-zinc-100 tabular-nums">
                    <Counter value={k.value} format={k.fmt} delay={i * 80} />
                  </div>
                  <div className="mt-3 h-px bg-gradient-to-r from-violet-500/40 via-violet-500/10 to-transparent" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filter row */}
        <Card>
          <div className="p-4 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-violet-400" strokeWidth={1.5} />
              <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-400">FILTERS</span>
            </div>

            <div className="flex-1 min-w-[260px] max-w-md">
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[10px] tracking-widest text-zinc-500">
                  MIN.STREAMS
                </label>
                <span className="font-mono text-xs text-violet-300 tabular-nums">
                  {fmt(minStreams)}
                </span>
              </div>
              <input
                type="range" min={0} max={2_000_000_000} step={50_000_000}
                value={minStreams}
                onChange={(e) => setMinStreams(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            <Toggle
              active={risingOnly}
              onToggle={() => setRisingOnly((v) => !v)}
              label="RISING.STARS"
            />
            <Toggle
              active={predictiveOn}
              onToggle={() => setPredictiveOn((v) => !v)}
              label="PREDICTIVE.MODE"
            />

            <div className="ml-auto font-mono text-[10px] text-zinc-500">
              <span className="text-violet-300">{filtered.length}</span> / {SEED_TRACKS.length} tracks
            </div>
          </div>
        </Card>

        {/* ───── Agentic vibe + Top gainers list ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Vibe summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Card className="h-full">
              <CardHeader label="AGENTIC.SUMMARY" icon={Sparkles} hint="GPT-CLAUDE-LIKE" />
              <div className="p-5 space-y-4">
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-zinc-500 mb-2">
                    MARKET.VIBE
                  </div>
                  <div className="font-display text-2xl text-violet-300 leading-tight">
                    {vibe.vibe}
                  </div>
                </div>
                <div className="text-sm text-zinc-300 leading-relaxed border-l-2 border-violet-500/40 pl-3">
                  {vibe.headline}
                </div>
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-widest text-zinc-500">
                    CONFIDENCE
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1 bg-zinc-800 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${vibe.confidence * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="font-mono text-xs text-violet-300 tabular-nums">
                      {(vibe.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-zinc-500 mb-3">
                    KEY.DRIVERS
                  </div>
                  <div className="space-y-1.5">
                    {topGainers.slice(0, 5).map((t, i) => (
                      <motion.div
                        key={t.song + i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="font-mono text-violet-400 w-5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-zinc-300 truncate flex-1">
                          {t.artist}
                          <span className="text-zinc-600"> — </span>
                          <span className="italic text-zinc-400">{t.song}</span>
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Top Gainers Table */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader
                label="TOP.GAINERS · 24H"
                icon={TrendingUp}
                hint={`SORTED BY DAILY · n=${topGainers.length}`}
              />
              <div className="p-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-600 font-mono tracking-widest text-[10px]">
                      <th className="text-left px-3 py-2">#</th>
                      <th className="text-left px-3 py-2">TRACK</th>
                      <th className="text-right px-3 py-2">DAILY</th>
                      <th className="text-right px-3 py-2">TOTAL</th>
                      <th className="text-right px-3 py-2">MOMENTUM</th>
                      <th className="text-right px-3 py-2 pr-4">VEL.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topGainers.map((t, i) => (
                      <motion.tr
                        key={t.song + i}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedTrack(i)}
                        className={`border-t border-zinc-900/80 cursor-pointer transition-colors ${
                          selectedTrack === i
                            ? "bg-violet-500/10"
                            : "hover:bg-zinc-900/40"
                        }`}
                      >
                        <td className="px-3 py-2 font-mono text-violet-400">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-zinc-200 leading-tight">{t.artist}</div>
                          <div className="text-zinc-500 italic text-[11px] leading-tight">
                            {t.song}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-cyan-300 tabular-nums">
                          {fmt(t.daily)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-zinc-400 tabular-nums">
                          {fmt(t.streams)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          <span className={t.momentum > 0.5 ? "text-violet-300" : "text-zinc-500"}>
                            {t.momentum.toFixed(3)}%
                          </span>
                        </td>
                        <td className="px-3 py-2 pr-4 text-right font-mono tabular-nums">
                          <span
                            className={
                              t.velocity_ratio > 1
                                ? "text-emerald-400"
                                : "text-zinc-600"
                            }
                          >
                            {t.velocity_ratio > 1 ? "▲" : "▽"} {t.velocity_ratio.toFixed(2)}×
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ───── Velocity chart + Forecast ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader
                label="VELOCITY.CHART"
                icon={Zap}
                hint="DAILY vs AVG.DAILY (TOTAL/365)"
              />
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={velocityData} margin={{ top: 10, right: 8, bottom: 40, left: 0 }}>
                    <defs>
                      <linearGradient id="g-daily" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="g-avg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.15} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#27272a" strokeDasharray="2 4" vertical={false} />
                    <XAxis
                      dataKey="name" stroke="#52525b" angle={-30} textAnchor="end"
                      tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                      tickLine={false} axisLine={{ stroke: "#27272a" }}
                    />
                    <YAxis
                      stroke="#52525b"
                      tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                      tickFormatter={fmt}
                      tickLine={false} axisLine={{ stroke: "#27272a" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(168,85,247,0.05)" }}
                      contentStyle={{
                        background: "#09090b", border: "1px solid #27272a",
                        borderRadius: 0, fontFamily: "JetBrains Mono", fontSize: 11,
                      }}
                      labelStyle={{ color: "#a855f7" }}
                      formatter={(v) => fmtFull(v)}
                    />
                    <Bar dataKey="AvgDaily" fill="url(#g-avg)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Daily" fill="url(#g-daily)" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 px-2 pt-2 font-mono text-[10px] text-zinc-500">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-violet-500" /> DAILY (24H ACTUAL)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-cyan-400/70" /> AVG.DAILY (TOTAL ÷ 365)
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader
                label="FORECAST · 7D"
                icon={Eye}
                hint={predictiveOn ? "ACTIVE" : "DISABLED"}
              />
              <div className="p-4">
                <div className="mb-3">
                  <div className="font-mono text-[10px] text-zinc-500 tracking-widest mb-1">
                    SUBJECT
                  </div>
                  <div className="text-zinc-200 text-sm leading-tight">
                    {topGainers[selectedTrack]?.artist}
                  </div>
                  <div className="text-zinc-500 italic text-xs">
                    {topGainers[selectedTrack]?.song}
                  </div>
                </div>
                {predictiveOn ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={forecast} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                      <defs>
                        <linearGradient id="g-fc" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="50%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#27272a" strokeDasharray="2 4" />
                      <XAxis
                        dataKey="day" stroke="#52525b"
                        tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                        tickLine={false} axisLine={{ stroke: "#27272a" }}
                      />
                      <YAxis
                        stroke="#52525b" tickFormatter={fmt}
                        tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
                        tickLine={false} axisLine={{ stroke: "#27272a" }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#09090b", border: "1px solid #27272a",
                          borderRadius: 0, fontFamily: "JetBrains Mono", fontSize: 11,
                        }}
                        formatter={(v) => fmtFull(v)}
                      />
                      <ReferenceLine x="T" stroke="#a855f7" strokeDasharray="3 3" />
                      <Line
                        type="monotone" dataKey="value"
                        stroke="url(#g-fc)" strokeWidth={2}
                        dot={{ fill: "#a855f7", r: 3 }}
                        activeDot={{ r: 5, fill: "#c084fc" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center font-mono text-[10px] text-zinc-600 tracking-widest">
                    <AlertCircle size={14} className="mr-2" /> PREDICTIVE MODE OFF
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-3 gap-2 font-mono text-[10px]">
                  <div>
                    <div className="text-zinc-600 tracking-widest">D+1</div>
                    <div className="text-violet-300 tabular-nums text-sm">
                      {predictiveOn && forecast[1] ? fmt(forecast[1].value) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-600 tracking-widest">D+3</div>
                    <div className="text-violet-300 tabular-nums text-sm">
                      {predictiveOn && forecast[3] ? fmt(forecast[3].value) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-600 tracking-widest">D+7</div>
                    <div className="text-cyan-300 tabular-nums text-sm">
                      {predictiveOn && forecast[7] ? fmt(forecast[7].value) : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ───── Treemap ───── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader
              label="PROPORTION.MAP"
              icon={ChevronRight}
              hint="ARTIST DOMINANCE · TOTAL STREAMS"
            />
            <div className="p-4">
              <ResponsiveContainer width="100%" height={320}>
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  stroke="#000"
                  fill="#a855f7"
                  content={<TreemapCell />}
                />
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <footer className="pt-4 pb-8 border-t border-zinc-900/80 flex items-center justify-between font-mono text-[10px] text-zinc-600 tracking-widest">
          <span>STREAMING.INTELLIGENCE • {SEED_TRACKS.length} TRACKS LOADED</span>
          <span>API://localhost:8000/analytics</span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-violet-400 animate-pulse" /> NOMINAL
          </span>
        </footer>
      </main>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Treemap cell — neon violet intensity by rank
// ───────────────────────────────────────────────────────────────────
function TreemapCell(props) {
  const { x, y, width, height, name, rank, size } = props;
  if (width < 2 || height < 2) return null;
  const intensity = 1 - Math.min(0.85, (rank || 0) / 16);
  const fill = `rgba(168, 85, 247, ${0.15 + intensity * 0.5})`;
  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        fill={fill} stroke="#000" strokeWidth={2}
        style={{ cursor: "pointer" }}
      />
      <rect x={x} y={y} width={width} height={1} fill="rgba(192,132,252,0.6)" />
      {width > 80 && height > 40 && (
        <>
          <text
            x={x + 8} y={y + 18}
            fill="#fafafa" fontSize={11} fontFamily="JetBrains Mono"
            fontWeight={500}
          >
            {name}
          </text>
          <text
            x={x + 8} y={y + 32}
            fill="rgba(192,132,252,0.85)" fontSize={9} fontFamily="JetBrains Mono"
          >
            {fmt(size)}
          </text>
        </>
      )}
    </g>
  );
}
