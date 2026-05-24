import { describe, expect, it } from "vitest";
import { lebronJames, celticsPlayers } from "../data/players";
import { createBattleState, getAvailableMetrics, resolveAutoBattle, resolveRound } from "./resolveRound";

describe("resolveRound", () => {
  it("resolves honor metrics with bounded damage", () => {
    const state = createBattleState(lebronJames, celticsPlayers[0], "manual", "TEST");
    const next = resolveRound(state, "championships");

    expect(next.log[0].damage).toBeGreaterThanOrEqual(8);
    expect(next.log[0].damage).toBeLessThanOrEqual(28);
    expect(next.jamesHp).toBeLessThan(100);
  });

  it("resolves total metrics with bounded damage", () => {
    const state = createBattleState(lebronJames, celticsPlayers[4], "manual", "TEST");
    const next = resolveRound(state, "points");

    expect(next.log[0].winner).toBe("james");
    expect(next.opponentHp).toBeLessThan(100);
    expect(next.log[0].damage).toBeGreaterThanOrEqual(8);
    expect(next.log[0].damage).toBeLessThanOrEqual(28);
  });

  it("never lets hp drop below zero", () => {
    let state = createBattleState(lebronJames, celticsPlayers[0], "manual", "TEST");
    for (let index = 0; index < 20; index += 1) {
      state = resolveRound(state, "championships");
    }

    expect(state.jamesHp).toBeGreaterThanOrEqual(0);
    expect(state.opponentHp).toBeGreaterThanOrEqual(0);
    expect(state.finished).toBe(true);
  });

  it("allows opponent advantage to counterattack", () => {
    const russell = celticsPlayers[0];
    const state = createBattleState(lebronJames, russell, "manual", "TEST");
    const next = resolveRound(state, "rebounds");

    expect(next.log[0].winner).toBe("opponent");
    expect(next.jamesHp).toBeLessThan(100);
  });

  it("keeps automatic battles deterministic by seed for metrics and winners", () => {
    const first = resolveAutoBattle(createBattleState(lebronJames, celticsPlayers[1], "auto", "SAME"));
    const second = resolveAutoBattle(createBattleState(lebronJames, celticsPlayers[1], "auto", "SAME"));

    expect(first.log.map((round) => [round.metric.id, round.winner, round.damage])).toEqual(
      second.log.map((round) => [round.metric.id, round.winner, round.damage])
    );
  });

  it("returns available metrics for manual selection", () => {
    const metrics = getAvailableMetrics(lebronJames, celticsPlayers[0]);

    expect(metrics.some((metric) => metric.id === "championships")).toBe(true);
    expect(metrics.some((metric) => metric.id === "rebounds")).toBe(true);
  });
});
