import { describe, expect, it } from "vitest";
import { celticsPlayers, lebronJames } from "../data/players";
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
});
