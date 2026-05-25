import { describe, expect, it } from "vitest";
import { managerPlayers } from "../data/managerPlayers";
import { buildRandomLineup, isCompleteLineup, resolveLineup, resolveManagerMatchup } from "./managerMatch";

describe("managerMatch", () => {
  it("builds deterministic five-player random lineups", () => {
    const first = buildRandomLineup("SAME", "left");
    const second = buildRandomLineup("SAME", "left");

    expect(first).toEqual(second);
    expect(first).toHaveLength(5);
    expect(isCompleteLineup(first)).toBe(true);
  });

  it("randomly resolves each selected player to a career era", () => {
    const picks = managerPlayers.slice(0, 5).map((player) => ({ playerId: player.id }));
    const lineup = resolveLineup(picks, "ERA-SEED", "left");

    expect(lineup.picks).toHaveLength(5);
    expect(lineup.total).toBeGreaterThan(0);
    expect(lineup.picks.every((pick) => pick.era.id && pick.power > 0)).toBe(true);
  });

  it("resolves a five-round manager matchup", () => {
    const left = managerPlayers.slice(0, 5).map((player) => ({ playerId: player.id }));
    const right = managerPlayers.slice(5, 10).map((player) => ({ playerId: player.id }));
    const result = resolveManagerMatchup(left, right, "MATCH");

    expect(result.rounds).toHaveLength(5);
    expect(["left", "right", "tie"]).toContain(result.winner);
    expect(result.rounds.every((round) => round.leftScore > 0 && round.rightScore > 0)).toBe(true);
  });
});
