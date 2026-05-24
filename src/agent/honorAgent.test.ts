import { describe, expect, it } from "vitest";
import { buildHonorAgentReport, findPlayerMatches, runHonorAgent } from "./honorAgent";
import { lebronJames, legendPlayers } from "../data/players";

describe("honorAgent", () => {
  it("matches players by English, Chinese, and nickname inputs", () => {
    expect(findPlayerMatches("Michael Jordan")[0].player.name).toBe("Michael Jordan");
    expect(findPlayerMatches("乔丹")[0].player.name).toBe("Michael Jordan");
    expect(findPlayerMatches("小丑")[0].player.name).toBe("Nikola Jokic");
    expect(findPlayerMatches("curry")[0].player.name).toBe("Stephen Curry");
  });

  it("builds a detailed local honor report", () => {
    const jordan = legendPlayers.find((player) => player.name === "Michael Jordan")!;
    const report = buildHonorAgentReport(lebronJames, jordan);

    expect(report.first).toBe(lebronJames);
    expect(report.second).toBe(jordan);
    expect(report.comparison.rows.length).toBeGreaterThan(8);
    expect(report.debatePoints.length).toBeGreaterThan(0);
    expect(report.decisiveRows.length).toBeGreaterThan(0);
    expect(report.summary).toContain("静态荣誉快照");
  });

  it("returns suggestions instead of a report for unknown names", () => {
    const result = runHonorAgent("not a player", "Jordan");

    expect(result.report).toBeNull();
    expect(result.failures.length).toBeGreaterThan(0);
  });
});
