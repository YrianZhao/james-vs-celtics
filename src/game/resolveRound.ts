import { comparisonMetrics } from "../data/metrics";
import type { BattleMode, ComparisonMetric, PlayerCard } from "../data/types";
import { seededRandom } from "./random";

export interface BattleRound {
  round: number;
  metric: ComparisonMetric;
  jamesValue: number;
  opponentValue: number;
  winner: "james" | "opponent";
  damage: number;
  jamesHp: number;
  opponentHp: number;
  line: string;
}

export interface BattleState {
  james: PlayerCard;
  opponent: PlayerCard;
  mode: BattleMode;
  seed: string;
  round: number;
  jamesHp: number;
  opponentHp: number;
  log: BattleRound[];
  finished: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

export function getAvailableMetrics(james: PlayerCard, opponent: PlayerCard) {
  return comparisonMetrics.filter((metric) => {
    const jamesValue = getValue(james, metric);
    const opponentValue = getValue(opponent, metric);
    return typeof jamesValue === "number" && typeof opponentValue === "number";
  });
}

function getDramaMultiplier(opponent: PlayerCard, metric: ComparisonMetric) {
  const legendBoostIds = ["Bill Russell", "Larry Bird", "John Havlicek", "Paul Pierce", "Kevin Garnett"];
  const legendBoost = legendBoostIds.includes(opponent.name) ? 1.18 : 1;
  const ringBoost = metric.id === "championships" && opponent.honors.championships >= 6 ? 1.25 : 1;
  const modernBoost = opponent.era.includes("至今") ? 1.08 : 1;
  return legendBoost * ringBoost * modernBoost;
}

function chooseAutoMetric(james: PlayerCard, opponent: PlayerCard, round: number, seed: string) {
  const available = getAvailableMetrics(james, opponent);
  const scored = available.map((metric, index) => {
    const jamesValue = getValue(james, metric) ?? 0;
    const opponentValue = getValue(opponent, metric) ?? 0;
    const strongerValue = Math.max(jamesValue, opponentValue, 1);
    const gap = Math.abs(jamesValue - opponentValue) / strongerValue;
    const jamesBias = jamesValue >= opponentValue ? 1.08 : 0.96;
    const noise = seededRandom(seed, round * 31 + index) * 2.5;
    return {
      metric,
      score: metric.baseWeight * (0.65 + gap) * jamesBias + noise
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const topWindow = scored.slice(0, Math.min(5, scored.length));
  const pickIndex = Math.floor(seededRandom(seed, round * 17) * topWindow.length);
  return topWindow[pickIndex]?.metric ?? scored[0].metric;
}

function makeLine(opponent: PlayerCard, winner: "james" | "opponent", metric: ComparisonMetric) {
  if (winner === "james") {
    const jamesLines = [
      `詹姆斯把「${metric.label}」拍到桌上，数据表开始冒烟。`,
      `这一项国王压上来，对面只能先把嘴闭一秒。`,
      `裁判不用吹，${metric.label} 已经把伤害算完了。`
    ];
    return jamesLines[Math.floor(Math.random() * jamesLines.length)];
  }

  return (
    opponent.trashTalkLines[Math.floor(Math.random() * opponent.trashTalkLines.length)] ??
    `${opponent.name} 用「${metric.label}」打出反击，绿军老账本开始发光。`
  );
}

export function resolveRound(
  state: BattleState,
  selectedMetricId?: string
): BattleState {
  if (state.finished) {
    return state;
  }

  const nextRound = state.round + 1;
  const metric =
    comparisonMetrics.find((item) => item.id === selectedMetricId) ??
    chooseAutoMetric(state.james, state.opponent, nextRound, state.seed);

  const jamesValue = getValue(state.james, metric);
  const opponentValue = getValue(state.opponent, metric);

  if (typeof jamesValue !== "number" || typeof opponentValue !== "number") {
    const fallback = chooseAutoMetric(state.james, state.opponent, nextRound, state.seed);
    return resolveRound(state, fallback.id);
  }

  const jamesWins = metric.higherIsBetter ? jamesValue >= opponentValue : jamesValue <= opponentValue;
  const winner = jamesWins ? "james" : "opponent";
  const strongerValue = Math.max(jamesValue, opponentValue, 1);
  const weakerValue = Math.min(jamesValue, opponentValue);
  const advantageRatio = 1 + (strongerValue - weakerValue) / strongerValue;
  const dramaMultiplier = getDramaMultiplier(state.opponent, metric);
  const damage = clamp(Math.round(metric.baseWeight * advantageRatio * dramaMultiplier), 8, 28);
  const jamesHp = winner === "opponent" ? clamp(state.jamesHp - damage, 0, 100) : state.jamesHp;
  const opponentHp = winner === "james" ? clamp(state.opponentHp - damage, 0, 100) : state.opponentHp;

  const battleRound: BattleRound = {
    round: nextRound,
    metric,
    jamesValue,
    opponentValue,
    winner,
    damage,
    jamesHp,
    opponentHp,
    line: makeLine(state.opponent, winner, metric)
  };

  return {
    ...state,
    round: nextRound,
    jamesHp,
    opponentHp,
    log: [battleRound, ...state.log],
    finished: jamesHp <= 0 || opponentHp <= 0
  };
}

export function createBattleState(
  james: PlayerCard,
  opponent: PlayerCard,
  mode: BattleMode,
  seed: string
): BattleState {
  return {
    james,
    opponent,
    mode,
    seed,
    round: 0,
    jamesHp: 100,
    opponentHp: 100,
    log: [],
    finished: false
  };
}

export function resolveAutoBattle(initialState: BattleState, maxRounds = 24) {
  let state = initialState;

  while (!state.finished && state.round < maxRounds) {
    state = resolveRound(state);
  }

  return state;
}

export function formatValue(value: number | null) {
  if (value === null) {
    return "暂无";
  }

  if (Number.isInteger(value)) {
    return value.toLocaleString("zh-CN");
  }

  return value.toFixed(1);
}
