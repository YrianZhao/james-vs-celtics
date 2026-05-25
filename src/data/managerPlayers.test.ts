import { describe, expect, it } from "vitest";
import { managerPlayers } from "./managerPlayers";

describe("managerPlayers", () => {
  it("contains a 300-player manager pool", () => {
    expect(managerPlayers).toHaveLength(300);
    expect(new Set(managerPlayers.map((player) => player.id)).size).toBe(300);
  });

  it("includes Yao Ming with multiple career eras", () => {
    const yao = managerPlayers.find((player) => player.name === "Yao Ming");

    expect(yao).toBeTruthy();
    expect(yao?.eras.length).toBeGreaterThanOrEqual(3);
    expect(yao?.eras.some((era) => era.label.includes("巅峰"))).toBe(true);
  });

  it("gives LeBron distinct Cavaliers and Heat era profiles", () => {
    const lebron = managerPlayers.find((player) => player.name === "LeBron James");

    expect(lebron?.eras.map((era) => era.team)).toEqual(expect.arrayContaining(["Cavaliers", "Heat"]));
    expect(new Set(lebron?.eras.map((era) => era.offense)).size).toBeGreaterThan(1);
  });
});
