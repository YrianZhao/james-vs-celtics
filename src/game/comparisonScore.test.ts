import { describe, expect, it } from "vitest";
import { celticsPlayers, lebronJames } from "../data/players";
import { buildFullComparison } from "./comparisonScore";

describe("comparisonScore", () => {
  it("builds a full comparison with honor, total, average, and legacy rows", () => {
    const comparison = buildFullComparison(lebronJames, celticsPlayers[1]);
    const labels = comparison.rows.map((row) => row.sourceLabel);

    expect(comparison.rows.length).toBeGreaterThan(12);
    expect(labels).toContain("核心荣誉");
    expect(labels).toContain("生涯总计");
    expect(labels).toContain("生涯场均");
    expect(labels).toContain("媒体评价摘要");
  });

  it("scores both players and identifies a winner or tie", () => {
    const comparison = buildFullComparison(lebronJames, celticsPlayers[0]);

    expect(comparison.jamesScore).toBeGreaterThan(0);
    expect(comparison.opponentScore).toBeGreaterThan(0);
    expect(["james", "opponent", "tie"]).toContain(comparison.winner);
  });
});
