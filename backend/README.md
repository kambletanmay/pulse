# Streaming Intelligence Platform

A "Cyber-Noir" analytics platform over a global Spotify streams dataset.

## Files
- **`main.py`** — FastAPI backend (`/analytics`, `/agent/vibe`, `/forecast/{rank}`, `/health`)
- **`StreamingIntelligence.jsx`** — React + Tailwind + Framer Motion + Recharts dashboard

## Backend — quickstart
```bash
pip install fastapi uvicorn pandas pydantic
mkdir -p data && cp spotify_data.csv data/
uvicorn main:app --reload --port 8000
```

### Key endpoints
| Endpoint | Method | Returns |
|---|---|---|
| `/analytics?min_streams=0&rising_only=false` | GET | KPIs, top gainers, rising stars, artist dominance, velocity sample |
| `/agent/vibe` | POST `{ "limit": 5 }` | Structured market vibe summary |
| `/forecast/{rank}?days=7&decay=0.985` | GET | 7-day geometric-decay forecast for a track |
| `/health` | GET | Liveness + row count |

### Momentum Score
```python
def calculate_momentum_score(daily: int, total: int) -> float:
    if total <= 0: return 0.0
    return round((daily / total) * 100, 4)
```
Interpretation: the share of a track's lifetime streams happening *today*. A
catalog hit with 1B total / 1M daily = 0.1%. A breakout with 50M / 1M = 2.0% — 20× hotter.

### Velocity ratio
`Daily ÷ AvgDaily` where `AvgDaily = Streams / 365`. Values >1 mean the track is
streaming above its trailing-year baseline (accelerating); <1 means decaying.

### Agentic vibe (mock)
The `/agent/vibe` endpoint inspects the top-N tracks by daily streams and
classifies the market state via thresholds on average momentum, average velocity,
and artist concentration. In production, swap `_classify_vibe` for an LLM call —
the response shape (`vibe`, `headline`, `drivers`, `confidence`) is already
LLM-structured-output friendly.

## Frontend — what's in the artifact
- **Live ticker** — auto-scrolling daily-peak feed (Framer Motion infinite x-loop)
- **KPI strip** — animated counters with cubic ease-out
- **Filters** — Min Streams range slider + Rising Stars + Predictive toggles
- **Agentic Summary card** — vibe classification, headline, confidence bar, key drivers
- **Top Gainers table** — click any row to load it into the forecast panel
- **Velocity Chart** — Recharts dual-bar (Daily vs AvgDaily) with neon gradients
- **Forecast panel** — 7-day geometric-decay line chart, gated by the Predictive toggle
- **Proportion Map** — Recharts Treemap, violet intensity by artist rank

### Wiring the frontend to the backend
The artifact ships with embedded seed data. To go live, replace the `useMemo`
blocks with `useEffect` + `fetch`:

```jsx
const [data, setData] = useState({ topGainers: [], artists: [] });
useEffect(() => {
  const url = `http://localhost:8000/analytics?min_streams=${minStreams}&rising_only=${risingOnly}`;
  fetch(url).then(r => r.json()).then(setData);
}, [minStreams, risingOnly]);
```

## Design notes
- **Palette**: Pure black base (`#000`), zinc-950 surfaces, violet-500 (`#a855f7`)
  primary accent, cyan-400 (`#22d3ee`) secondary for chart contrast.
- **Type**: Space Grotesk display, IBM Plex Sans body, JetBrains Mono for all
  numerics, codes, and tracking labels — gives the Bloomberg-terminal feel.
- **Atmosphere**: 48px violet grid background, top radial glow, scanline overlay
  available via `.scanlines` utility, animated dot pulses on status indicators.
- **Motion**: Staggered card reveals on mount, ticker scroll, animated counter
  on KPIs, table-row fade-in, confidence bar fill — purposeful, not decorative.
