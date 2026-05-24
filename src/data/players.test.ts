import { describe, expect, it } from "vitest";
import { celticsPlayers, lebronJames } from "./players";

const totalKeys = ["games", "points", "rebounds", "assists", "steals", "blocks", "ppg", "rpg", "apg"] as const;

describe("player data", () => {
  it("contains exactly 50 Celtics opponents", () => {
    expect(celticsPlayers).toHaveLength(50);
  });

  it("keeps each Celtics card complete enough for the game", () => {
    for (const player of celticsPlayers) {
      expect(player.id).toBeTruthy();
      expect(player.name).toBeTruthy();
      expect(player.rankSource.rank).toBeGreaterThanOrEqual(1);
      expect(player.rankSource.url).toMatch(/^https:/);
      expect(player.summaryTags.length).toBeGreaterThan(0);
      expect(player.sourceUrls.length).toBeGreaterThanOrEqual(2);
      expect(player.trashTalkLines.length).toBeGreaterThan(0);

      for (const key of totalKeys) {
        const value = player.careerTotals[key];
        expect(typeof value === "number" || value === null).toBe(true);
      }
    }
  });

  it("keeps LeBron ready as the fixed player side", () => {
    expect(lebronJames.teamSide).toBe("james");
    expect(lebronJames.honors.mvps).toBeGreaterThan(0);
    expect(lebronJames.careerTotals.points).toBeGreaterThan(40000);
    expect(lebronJames.sourceUrls.length).toBeGreaterThanOrEqual(2);
  });
});
