"""
Streaming Intelligence Platform — Backend
FastAPI service exposing analytics over a Spotify global-streams dataset.

Run:
    uvicorn main:app --reload --port 8000
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─────────────────────────────────────────────────────────────────────────────
# App + CORS (frontend runs on Vite/Next on a different port)
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Streaming Intelligence API",
    version="1.0.0",
    description="Momentum, velocity, and agentic vibe analytics for global streams.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pulse-opal-omega.vercel.app/", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).parent / "data" / "spotify_data.csv"


# ─────────────────────────────────────────────────────────────────────────────
# Data loading — handles both clean numeric AND Indian-comma-formatted CSVs
# ─────────────────────────────────────────────────────────────────────────────
def _coerce_numeric(series: pd.Series) -> pd.Series:
    """Strip whitespace + commas (handles '5,34,19,96,137' Indian format)."""
    if pd.api.types.is_numeric_dtype(series):
        return series.fillna(0).astype("int64")
    return (
        series.astype(str)
        .str.replace(",", "", regex=False)
        .str.strip()
        .replace({"": "0", "nan": "0", "NaN": "0"})
        .astype("int64")
    )


@lru_cache(maxsize=1)
def load_dataset() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise HTTPException(500, f"Dataset missing at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    df.columns = [c.strip().lstrip("\ufeff") for c in df.columns]

    df["Streams"] = _coerce_numeric(df["Streams"])
    df["Daily"] = _coerce_numeric(df["Daily"])

    # Split "Artist - Song" → two columns. Split on FIRST ' - ' only.
    parts = df["Songs & Artist"].str.split(" - ", n=1, expand=True)
    df["artist"] = parts[0].str.strip()
    df["song"] = parts[1].fillna(parts[0]).str.strip()

    # Derived metrics
    df["momentum"] = (df["Daily"] / df["Streams"].replace(0, pd.NA) * 100).round(4)
    df["avg_daily"] = (df["Streams"] / 365).round(0).astype("int64")
    df["velocity_ratio"] = (df["Daily"] / df["avg_daily"].replace(0, pd.NA)).round(3)

    return df.dropna(subset=["momentum"]).reset_index(drop=True)


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic response models
# ─────────────────────────────────────────────────────────────────────────────
class TrackRow(BaseModel):
    artist: str
    song: str
    streams: int
    daily: int
    avg_daily: int
    momentum: float = Field(..., description="(Daily / Total) * 100")
    velocity_ratio: float = Field(..., description="Daily / AvgDaily — >1 means accelerating")


class AnalyticsResponse(BaseModel):
    total_tracks: int
    total_streams: int
    total_daily: int
    top_gainers: list[TrackRow]
    rising_stars: list[TrackRow]
    artist_dominance: list[dict]
    velocity_sample: list[TrackRow]


class VibeRequest(BaseModel):
    limit: int = Field(5, ge=1, le=20)


class VibeResponse(BaseModel):
    vibe: str
    headline: str
    drivers: list[str]
    confidence: float


# ─────────────────────────────────────────────────────────────────────────────
# Core analytics
# ─────────────────────────────────────────────────────────────────────────────
def calculate_momentum_score(daily: int, total: int) -> float:
    """Single-track momentum: share of lifetime streams happening *today*.

    A song with 1B total streams and 1M daily has momentum 0.1.
    A new viral hit with 50M total and 1M daily has momentum 2.0 — 20× hotter.
    """
    if total <= 0:
        return 0.0
    return round((daily / total) * 100, 4)


def _row_to_track(row: pd.Series) -> dict:
    return {
        "artist": row["artist"],
        "song": row["song"],
        "streams": int(row["Streams"]),
        "daily": int(row["Daily"]),
        "avg_daily": int(row["avg_daily"]),
        "momentum": float(row["momentum"]),
        "velocity_ratio": float(row["velocity_ratio"]) if pd.notna(row["velocity_ratio"]) else 0.0,
    }


@app.get("/analytics", response_model=AnalyticsResponse)
def analytics(
    min_streams: int = Query(0, ge=0, description="Minimum total streams filter"),
    rising_only: bool = Query(False, description="Filter to high-momentum, lower-total tracks"),
):
    df = load_dataset().copy()
    if min_streams:
        df = df[df["Streams"] >= min_streams]
    if df.empty:
        raise HTTPException(404, "No tracks match the filters.")

    # Top Gainers: top 10 by raw daily streams
    top_gainers = df.nlargest(10, "Daily").apply(_row_to_track, axis=1).tolist()

    # Rising Stars: high momentum but below median total streams
    median_total = df["Streams"].median()
    rising = (
        df[df["Streams"] < median_total]
        .nlargest(10, "momentum")
        .apply(_row_to_track, axis=1)
        .tolist()
    )

    # Artist dominance for treemap
    artist_dom = (
        df.groupby("artist", as_index=False)
        .agg(streams=("Streams", "sum"), tracks=("song", "count"), daily=("Daily", "sum"))
        .nlargest(25, "streams")
        .to_dict(orient="records")
    )

    # Velocity sample (50 by daily, for the bar chart)
    velocity = df.nlargest(50, "Daily").apply(_row_to_track, axis=1).tolist()

    pool = rising if rising_only else top_gainers

    return AnalyticsResponse(
        total_tracks=len(df),
        total_streams=int(df["Streams"].sum()),
        total_daily=int(df["Daily"].sum()),
        top_gainers=pool if rising_only else top_gainers,
        rising_stars=rising,
        artist_dominance=artist_dom,
        velocity_sample=velocity,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Agentic vibe summarizer (deterministic mock — swap for an LLM call in prod)
# ─────────────────────────────────────────────────────────────────────────────
def _classify_vibe(top: pd.DataFrame) -> tuple[str, str, float]:
    """Heuristic vibe classifier over the top-N trending slice."""
    avg_momentum = float(top["momentum"].mean())
    avg_velocity = float(top["velocity_ratio"].mean())
    artist_concentration = top["artist"].nunique() / max(len(top), 1)

    if avg_momentum > 1.5 and avg_velocity > 1.4:
        vibe = "Volatile / Breakout"
        headline = "The market is in breakout mode — fresh tracks are eating yesterday's catalog."
    elif avg_velocity > 1.2:
        vibe = "Accelerating"
        headline = "Catalog hits are picking up steam; momentum is positive but orderly."
    elif artist_concentration < 0.5:
        vibe = "Consolidating"
        headline = "A small set of artists is dominating attention — fan bases are concentrated."
    else:
        vibe = "Steady-State"
        headline = "Streams look healthy and broadly distributed across artists."

    confidence = round(min(0.99, 0.55 + abs(avg_velocity - 1) * 0.25), 2)
    return vibe, headline, confidence


@app.post("/agent/vibe", response_model=VibeResponse)
def agentic_vibe_summary(req: VibeRequest):
    """Mock 'agentic' summarizer.

    In production this would call an LLM (e.g. claude-opus-4-7) with the top
    rows + a system prompt. Here we synthesize a plausible structured summary
    from the data so the frontend has a real shape to render against.
    """
    df = load_dataset()
    top = df.nlargest(req.limit, "Daily").copy()

    vibe, headline, confidence = _classify_vibe(top)

    drivers = [
        f"{row['artist']} — '{row['song']}' "
        f"({row['Daily']:,} daily, momentum {row['momentum']:.2f}%)"
        for _, row in top.iterrows()
    ]

    return VibeResponse(vibe=vibe, headline=headline, drivers=drivers, confidence=confidence)


# ─────────────────────────────────────────────────────────────────────────────
# 7-day forecast (linear, with mild decay — for the Predictive Toggle)
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/forecast/{rank}")
def forecast(rank: int, days: int = Query(7, ge=1, le=30), decay: float = 0.985):
    """Simple geometric-decay forecast over a track's current Daily value."""
    df = load_dataset()
    if rank < 0 or rank >= len(df):
        raise HTTPException(404, "rank out of range")
    row = df.nlargest(rank + 1, "Daily").iloc[-1]
    base = int(row["Daily"])
    series = [{"day": d + 1, "predicted": int(base * (decay ** d))} for d in range(days)]
    return {"track": f"{row['artist']} - {row['song']}", "base_daily": base, "forecast": series}


@app.get("/health")
def health() -> dict[Literal["status", "rows"], object]:
    return {"status": "ok", "rows": len(load_dataset())}
