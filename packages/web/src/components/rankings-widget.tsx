"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { FiPack } from "~/types/fi";

interface RankingsWidgetProps {
  packs: FiPack[];
}

function RankChangeIndicator({ amount }: { amount: number }) {
  if (amount > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-green-500">
        <TrendingUp className="h-2.5 w-2.5" />+{amount}
      </span>
    );
  }
  if (amount < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-red-500">
        <TrendingDown className="h-2.5 w-2.5" />{amount}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
      <Minus className="h-2.5 w-2.5" />
    </span>
  );
}

function PackCard({ pack }: { pack: FiPack }) {
  const ranking = pack.all;
  if (!ranking || ranking.isPending) return null;

  const percentile = Math.round(ranking.rankPercentile * 100);

  return (
    <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium truncate">{pack.name}</p>
        {ranking.rankChange && (
          <RankChangeIndicator amount={ranking.rankChange.amount} />
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold tabular-nums">#{ranking.rankNumber}</span>
        <span className="text-[10px] text-muted-foreground">
          of {pack.totalRankedPets.toLocaleString()}
        </span>
      </div>

      <div className="space-y-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground/70 transition-all"
            style={{ width: `${percentile}%`, backgroundColor: pack.highlightColorHex || undefined }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Top {100 - percentile}%</span>
          <span>{ranking.stepCount.toLocaleString()} steps</span>
        </div>
      </div>
    </div>
  );
}

export function RankingsWidget({ packs }: RankingsWidgetProps) {
  const activePacks = packs.filter((p) => p.actingPetIsMember && p.all && !p.all.isPending);

  if (activePacks.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Trophy className="h-3.5 w-3.5" />
          Pack Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {activePacks.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
