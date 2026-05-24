import { comparisonMetrics } from "../data/metrics";
import type { ComparisonMetric, PlayerCard } from "../data/types";

export interface ComparisonScoreRow {
  id: string;
  label: string;
  sourceLabel: string;
  metric: ComparisonMetric;
  jamesValue: number;
  opponentValue: number;
  jamesPoints: number;
  opponentPoints: number;
  leader: "james" | "opponent" | "tie";
}

export interface FullComparison {
  jamesScore: number;
  opponentScore: number;
  rows: ComparisonScoreRow[];
  winner: "james" | "opponent" | "tie";
}

function getValue(player: PlayerCard, metric: ComparisonMetric): number | null {
  if (metric.kind === "honor") {
    return player.honors[metric.key as keyof PlayerCard["honors"]];
  }

  if (metric.kind === "legacy") {
    return player.advanced[metric.key as keyof PlayerCard["advanced"]];
  }

  return player.careerTotals[metric.key as keyof PlayerCard["careerTotals"]];
}

function scorePair(jamesValue: number, opponentValue: number, metric: ComparisonMetric) {
  const strongerValue = Math.max(jamesValue, opponentValue, 1);
  const weakerValue = Math.min(jamesValue, opponentValue);
  const gapRatio = strongerValue === 0 ? 0 : (strongerValue - weakerValue) / strongerValue;
  const winnerBonus = Math.round(metric.baseWeight * (1 + gapRatio));
  const loserScore = Math.max(1, Math.round(metric.baseWeight * 0.35));

  if (jamesValue === opponentValue) {
    const tieScore = Math.max(1, Math.round(metric.baseWeight * 0.6));
    return {
      jamesPoints: tieScore,
      opponentPoints: tieScore,
      leader: "tie" as const
    };
  }

  const jamesWins = metric.higherIsBetter ? jamesValue > opponentValue : jamesValue < opponentValue;

  return {
    jamesPoints: jamesWins ? winnerBonus : loserScore,
    opponentPoints: jamesWins ? loserScore : winnerBonus,
    leader: jamesWins ? ("james" as const) : ("opponent" as const)
  };
}

export function buildFullComparison(james: PlayerCard, opponent: PlayerCard): FullComparison {
  const rows = comparisonMetrics
    .map((metric) => {
      const jamesValue = getValue(james, metric);
      const opponentValue = getValue(opponent, metric);

      if (typeof jamesValue !== "number" || typeof opponentValue !== "number") {
        return null;
      }

      const result = scorePair(jamesValue, opponentValue, metric);

      return {
        id: metric.id,
        label: metric.label,
        sourceLabel: metric.sourceLabel,
        metric,
        jamesValue,
        opponentValue,
        ...result
      };
    })
    .filter((row): row is ComparisonScoreRow => row !== null);

  const jamesScore = rows.reduce((total, row) => total + row.jamesPoints, 0);
  const opponentScore = rows.reduce((total, row) => total + row.opponentPoints, 0);
  const winner = jamesScore > opponentScore ? "james" : opponentScore > jamesScore ? "opponent" : "tie";

  return {
    jamesScore,
    opponentScore,
    rows,
    winner
  };
}
