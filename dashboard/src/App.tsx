import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { chalkApi } from "./api/chalk";
import { GameCard } from "./components/SlateView/GameCard";
import { GameDetailView } from "./components/SlateView/GameDetailView";
import { useHealth } from "./hooks/useGameSlate";
import type { OverUnderLine, FantasyProjection } from "./types/chalk";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 3 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

/* ─── Loading placeholders ────────────────────────────────────
   Shaped like the content they stand in for, so nothing jumps
   when the real numbers land.                                   */

function GameCardSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-md border border-hairline px-3 py-2.5">
      <div className="flex items-center justify-between gap-2 pl-2">
        <div className="h-3 w-20 rounded bg-hairline-strong" />
        <div className="h-3 w-8 rounded bg-hairline" />
      </div>
      <div className="mt-2 ml-2 h-2 w-14 rounded bg-hairline" />
    </div>
  );
}

function PlayerCardSkeleton() {
  return (
    <div className="animate-pulse rounded-md border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <div>
          <div className="h-3.5 w-28 rounded bg-hairline-strong" />
          <div className="mt-2 h-2 w-16 rounded bg-hairline" />
        </div>
        <div className="h-4 w-14 rounded bg-hairline" />
      </div>
      <div className="space-y-3.5 px-4 py-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-2 w-8 rounded bg-hairline" />
            <div className="h-2 flex-1 rounded bg-hairline" />
            <div className="h-2 w-8 rounded bg-hairline" />
          </div>
        ))}
      </div>
      <div className="border-t border-hairline px-4 py-2.5">
        <div className="h-2.5 w-32 rounded bg-hairline" />
      </div>
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div className="h-5 w-40 animate-pulse rounded bg-hairline-strong" />
        <div className="h-5 w-28 animate-pulse rounded bg-hairline" />
      </div>
      <div className="mb-6 mt-4 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-7 w-20 animate-pulse rounded-md bg-hairline" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PlayerCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────── */

function Dashboard() {
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [props, setProps] = useState<OverUnderLine[]>([]);
  const [fantasy, setFantasy] = useState<FantasyProjection[]>([]);

  const { data: health } = useHealth();

  // 1. Today's game list — lightweight, renders the rail immediately.
  const { data: todayData, isLoading: gamesLoading } = useQuery({
    queryKey: ["todayGames"],
    queryFn: () => chalkApi.getTodayGames(),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const todayGames = todayData?.games ?? [];
  const effectiveGameId = selectedGameId || todayGames[0]?.game_id || "";

  // 2. Full predictions for the selected game only.
  const { data: selectedGame, isLoading: predictionLoading } = useQuery({
    queryKey: ["game", effectiveGameId],
    queryFn: () => chalkApi.getGamePredictions(effectiveGameId),
    enabled: !!effectiveGameId,
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  // 3. Props + fantasy once the game predictions have arrived.
  useEffect(() => {
    if (!selectedGame || !effectiveGameId) return;

    let cancelled = false;

    async function loadDetail() {
      const allPlayers = [
        ...selectedGame!.home_predictions,
        ...selectedGame!.away_predictions,
      ];

      const propResults: OverUnderLine[] = [];
      for (const p of allPlayers.slice(0, 10)) {
        if (cancelled) return;
        try {
          const playerProps = await chalkApi.getPlayerProps(
            p.player_id,
            effectiveGameId,
          );
          propResults.push(...playerProps);
        } catch {
          // A missing line for one player shouldn't blank the board.
        }
      }
      if (!cancelled) setProps(propResults);

      try {
        const fantasyData = await chalkApi.getGameFantasy(effectiveGameId);
        if (!cancelled) setFantasy(fantasyData.projections);
      } catch {
        if (!cancelled) setFantasy([]);
      }
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedGame, effectiveGameId]);

  const healthy = health?.status === "ok";

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-baseline gap-3">
            <Link
              to="/"
              className="inline-flex items-baseline gap-2"
              aria-label="Chalk home"
            >
              <span className="h-4 w-[3px] shrink-0 translate-y-[1px] rounded-full bg-chalk" />
              <span className="text-[1rem] font-semibold tracking-[-0.02em] text-ink">
                Chalk
              </span>
            </Link>
            <span className="label hidden text-subtle sm:inline">Board</span>
          </div>

          <div className="flex items-center gap-4">
            {todayData && (
              <span className="num hidden text-[0.75rem] tracking-[0.04em] text-subtle sm:inline">
                {todayData.date}
              </span>
            )}

            <span className="flex items-center gap-1.5" title={`API ${health?.status ?? "unknown"}`}>
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  healthy ? "bg-edge-up" : "bg-edge-down"
                }`}
              />
              <span className="label text-subtle">
                {healthy ? "Live" : "Degraded"}
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Slate rail */}
          <aside className="md:w-56 md:shrink-0 lg:w-64">
            <div className="md:sticky md:top-20">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="label text-subtle">Slate</h2>
                <span className="h-px flex-1 bg-hairline" />
                {!gamesLoading && (
                  <span className="num text-[0.6875rem] text-subtle">
                    {todayGames.length}
                  </span>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-x-visible md:pb-0">
                {gamesLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="min-w-[180px] shrink-0 md:min-w-0 md:shrink">
                      <GameCardSkeleton />
                    </div>
                  ))
                ) : todayGames.length > 0 ? (
                  todayGames.map((g) => (
                    <div
                      key={g.game_id}
                      className="min-w-[180px] shrink-0 md:min-w-0 md:shrink"
                    >
                      <GameCard
                        gameId={g.game_id}
                        homeTeam={g.home_team}
                        awayTeam={g.away_team}
                        selected={g.game_id === effectiveGameId}
                        onClick={() => setSelectedGameId(g.game_id)}
                      />
                    </div>
                  ))
                ) : (
                  <p className="rounded-md border border-dashed border-hairline px-3 py-6 text-center text-[0.8125rem] leading-relaxed text-subtle">
                    No games scheduled today.
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* Board */}
          <main className="min-w-0 flex-1">
            {predictionLoading || (effectiveGameId && !selectedGame) ? (
              <ContentSkeleton />
            ) : selectedGame ? (
              <GameDetailView
                game={selectedGame}
                props={props}
                fantasyProjections={fantasy}
              />
            ) : gamesLoading ? (
              <ContentSkeleton />
            ) : (
              <div className="rounded-md border border-dashed border-hairline px-6 py-20 text-center">
                <p className="text-[0.9375rem] font-medium text-muted">
                  Nothing on the board
                </p>
                <p className="lede mx-auto mt-2 max-w-[46ch] text-[0.8125rem] leading-relaxed text-subtle">
                  There are no NBA games scheduled today. The slate refreshes
                  each morning at 07:00 UTC and projections post at 18:00 UTC.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
