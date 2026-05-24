import type { HonorKey, PlayerCard } from "../data/types";

export interface HonorScoreRule {
  key: HonorKey;
  label: string;
  unit: string;
  weight: number;
}

export interface HonorScoreRow {
  key: HonorKey;
  label: string;
  unit: string;
  weight: number;
  jamesValue: number;
  opponentValue: number;
  jamesPoints: number;
  opponentPoints: number;
  leader: "james" | "opponent" | "tie";
}

export interface HonorComparison {
  jamesScore: number;
  opponentScore: number;
  rows: HonorScoreRow[];
  winner: "james" | "opponent" | "tie";
}

export const honorScoreRules: HonorScoreRule[] = [
  { key: "championships", label: "NBA 总冠军", unit: "次", weight: 12 },
  { key: "mvps", label: "常规赛 MVP", unit: "次", weight: 14 },
  { key: "finalsMvps", label: "总决赛 MVP", unit: "次", weight: 15 },
  { key: "allStars", label: "全明星", unit: "次", weight: 3 },
  { key: "allNba", label: "最佳阵容", unit: "次", weight: 5 },
  { key: "allDefense", label: "最佳防守阵容", unit: "次", weight: 3 },
  { key: "scoringTitles", label: "得分王", unit: "次", weight: 4 },
  { key: "assistTitles", label: "助攻王", unit: "次", weight: 4 },
  { key: "reboundTitles", label: "篮板王", unit: "次", weight: 4 },
  { key: "dpoy", label: "年度最佳防守球员", unit: "次", weight: 6 },
  { key: "roy", label: "年度最佳新秀", unit: "次", weight: 3 },
  { key: "hallOfFame", label: "名人堂", unit: "项", weight: 8 },
  { key: "nba75", label: "NBA 75 大", unit: "项", weight: 10 }
];

export function buildHonorComparison(james: PlayerCard, opponent: PlayerCard): HonorComparison {
  const rows = honorScoreRules.map((rule) => {
    const jamesValue = james.honors[rule.key];
    const opponentValue = opponent.honors[rule.key];
    const jamesPoints = jamesValue * rule.weight;
    const opponentPoints = opponentValue * rule.weight;
    const leader: HonorScoreRow["leader"] =
      jamesPoints > opponentPoints ? "james" : opponentPoints > jamesPoints ? "opponent" : "tie";

    return {
      ...rule,
      jamesValue,
      opponentValue,
      jamesPoints,
      opponentPoints,
      leader
    };
  });

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
