import { describe, expect, it } from "vitest";
import { celticsPlayers, lebronJames, legendPlayers } from "../data/players";
import { buildHonorComparison, honorScoreRules } from "./honorScore";

describe("honorScore", () => {
  it("calculates a visible honor score for both sides", () => {
    const comparison = buildHonorComparison(lebronJames, celticsPlayers[0]);

    expect(comparison.jamesScore).toBeGreaterThan(0);
    expect(comparison.opponentScore).toBeGreaterThan(0);
    expect(comparison.rows).toHaveLength(honorScoreRules.length);
  });

  it("lets Bill Russell win the championship row", () => {
    const comparison = buildHonorComparison(lebronJames, celticsPlayers[0]);
    const row = comparison.rows.find((item) => item.key === "championships");

    expect(row?.leader).toBe("opponent");
    expect(row?.opponentPoints).toBeGreaterThan(row?.jamesPoints ?? 0);
  });

  it("scores different historical archetypes with the same rule set", () => {
    const jordan = legendPlayers.find((player) => player.name === "Michael Jordan")!;
    const curry = legendPlayers.find((player) => player.name === "Stephen Curry")!;
    const jokic = legendPlayers.find((player) => player.name === "Nikola Jokic")!;

    expect(buildHonorComparison(lebronJames, jordan).opponentScore).toBeGreaterThan(0);
    expect(buildHonorComparison(lebronJames, curry).opponentScore).toBeGreaterThan(0);
    expect(buildHonorComparison(lebronJames, jokic).opponentScore).toBeGreaterThan(0);
  });
});
