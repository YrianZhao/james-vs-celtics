import { managerPlayers } from "../data/managerPlayers";
import type {
  DraftPick,
  EraAbility,
  ManagerLineupResult,
  ManagerMatchupResult,
  ManagerMatchupRound,
  ManagerPlayer,
  ResolvedDraftPick
} from "../data/types";
import { pickBySeed, seededRandom } from "./random";

const abilityFocuses: Array<keyof EraAbility> = [
  "offense",
  "defense",
  "playmaking",
  "rebounding",
  "athleticism",
  "clutch",
  "aura"
];

const abilityWeights: Record<keyof EraAbility, number> = {
  id: 0,
  label: 0,
  seasons: 0,
  team: 0,
  summary: 0,
  offense: 0.22,
  defense: 0.18,
  playmaking: 0.16,
  rebounding: 0.13,
  athleticism: 0.11,
  clutch: 0.12,
  aura: 0.08
};

export function calculateEraPower(era: EraAbility) {
  return Math.round(
    era.offense * abilityWeights.offense +
      era.defense * abilityWeights.defense +
      era.playmaking * abilityWeights.playmaking +
      era.rebounding * abilityWeights.rebounding +
      era.athleticism * abilityWeights.athleticism +
      era.clutch * abilityWeights.clutch +
      era.aura * abilityWeights.aura
  );
}

export function getManagerPlayerById(playerId: string): ManagerPlayer | undefined {
  return managerPlayers.find((player) => player.id === playerId);
}

export function resolveDraftPick(pick: DraftPick, seed: string, slot: number, side: "left" | "right"): ResolvedDraftPick | null {
  const player = getManagerPlayerById(pick.playerId);
  if (!player) return null;

  const era =
    player.eras.find((item) => item.id === pick.eraId) ??
    pickBySeed(player.eras, `${seed}:${side}:${player.id}`, slot + player.debateRank);

  return {
    player,
    era,
    power: calculateEraPower(era)
  };
}

export function resolveLineup(picks: DraftPick[], seed: string, side: "left" | "right"): ManagerLineupResult {
  const resolved = picks
    .slice(0, 5)
    .map((pick, index) => resolveDraftPick(pick, seed, index, side))
    .filter((pick): pick is ResolvedDraftPick => pick !== null);
  const total = resolved.reduce((sum, pick) => sum + pick.power, 0);

  return {
    picks: resolved,
    total,
    average: resolved.length === 0 ? 0 : Math.round(total / resolved.length)
  };
}

function scoreRound(pick: ResolvedDraftPick, focus: keyof EraAbility, seed: string, slot: number, side: "left" | "right") {
  const focusValue = typeof pick.era[focus] === "number" ? pick.era[focus] : pick.power;
  const variance = Math.round(seededRandom(`${seed}:${side}:variance`, slot + pick.player.debateRank) * 8);
  return Math.round(pick.power * 0.62 + Number(focusValue) * 0.32 + pick.player.advanced.clutch * 0.06 + variance);
}

export function resolveManagerMatchup(leftPicks: DraftPick[], rightPicks: DraftPick[], seed: string): ManagerMatchupResult {
  const left = resolveLineup(leftPicks, seed, "left");
  const right = resolveLineup(rightPicks, seed, "right");
  const rounds: ManagerMatchupRound[] = [];

  for (let index = 0; index < Math.min(left.picks.length, right.picks.length, 5); index += 1) {
    const focus = pickBySeed(abilityFocuses, `${seed}:focus`, index);
    const leftScore = scoreRound(left.picks[index], focus, seed, index, "left");
    const rightScore = scoreRound(right.picks[index], focus, seed, index, "right");
    rounds.push({
      slot: index + 1,
      left: left.picks[index],
      right: right.picks[index],
      leftScore,
      rightScore,
      winner: leftScore > rightScore ? "left" : rightScore > leftScore ? "right" : "tie",
      focus
    });
  }

  const leftRoundScore = rounds.reduce((sum, round) => sum + round.leftScore, 0);
  const rightRoundScore = rounds.reduce((sum, round) => sum + round.rightScore, 0);

  return {
    seed,
    left,
    right,
    rounds,
    winner: leftRoundScore > rightRoundScore ? "left" : rightRoundScore > leftRoundScore ? "right" : "tie"
  };
}

export function buildRandomLineup(seed: string, side: "left" | "right"): DraftPick[] {
  const pool = [...managerPlayers];
  const picks: DraftPick[] = [];

  for (let slot = 0; slot < 5; slot += 1) {
    const player = pickBySeed(pool, `${seed}:${side}:draft`, slot);
    picks.push({ playerId: player.id });
    pool.splice(pool.indexOf(player), 1);
  }

  return picks;
}

export function isCompleteLineup(picks: DraftPick[]) {
  return picks.length === 5 && new Set(picks.map((pick) => pick.playerId)).size === 5;
}
