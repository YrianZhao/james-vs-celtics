import { describe, expect, it } from "vitest";
import { lebronJames, celticsPlayers, legendPlayers } from "../data/players";
import {
  MAX_BATTLE_ROUNDS,
  createBattleState,
  getAvailableHonorMetrics,
  getAvailableMetrics,
  resolveAutoBattle,
  resolveRound
} from "./resolveRound";

describe("resolveRound", () => {
  it("resolves honor metrics with bounded damage", () => {
    const state = createBattleState(lebronJames, celticsPlayers[0], "manual", "TEST");
    const next = resolveRound(state, "championships");

    expect(next.log[0].damage).toBeGreaterThanOrEqual(8);
    expect(next.log[0].damage).toBeLessThanOrEqual(28);
    expect(next.jamesHp).toBeLessThan(100);
  });

  it("falls back to honor metrics when a total metric is requested", () => {
    const state = createBattleState(lebronJames, celticsPlayers[4], "manual", "TEST");
    const next = resolveRound(state, "points");

    expect(next.log[0].metric.kind).toBe("honor");
    expect(next.log[0].damage).toBeGreaterThanOrEqual(8);
    expect(next.log[0].damage).toBeLessThanOrEqual(28);
  });

  it("ends after four rounds and never lets hp drop below zero", () => {
    let state = createBattleState(lebronJames, celticsPlayers[0], "manual", "TEST");
    for (let index = 0; index < 20; index += 1) {
      state = resolveRound(state);
    }

    expect(state.jamesHp).toBeGreaterThanOrEqual(0);
    expect(state.opponentHp).toBeGreaterThanOrEqual(0);
    expect(state.finished).toBe(true);
    expect(state.round).toBe(MAX_BATTLE_ROUNDS);
  });

  it("allows opponent honor advantage to counterattack", () => {
    const russell = celticsPlayers[0];
    const state = createBattleState(lebronJames, russell, "manual", "TEST");
    const next = resolveRound(state, "championships");

    expect(next.log[0].winner).toBe("opponent");
    expect(next.jamesHp).toBeLessThan(100);
  });

  it("keeps automatic battles deterministic by seed for metrics and winners", () => {
    const first = resolveAutoBattle(createBattleState(lebronJames, celticsPlayers[1], "auto", "SAME"));
    const second = resolveAutoBattle(createBattleState(lebronJames, celticsPlayers[1], "auto", "SAME"));

    expect(first.log.map((round) => [round.metric.id, round.winner, round.damage])).toEqual(
      second.log.map((round) => [round.metric.id, round.winner, round.damage])
    );
    expect(first.log).toHaveLength(MAX_BATTLE_ROUNDS);
    expect(new Set(first.log.map((round) => round.metric.id)).size).toBe(first.log.length);
    expect(first.log.every((round) => round.metric.kind === "honor")).toBe(true);
  });

  it("returns available honor metrics for manual selection", () => {
    const metrics = getAvailableHonorMetrics(lebronJames, legendPlayers[0]);

    expect(metrics.some((metric) => metric.id === "championships")).toBe(true);
    expect(metrics.some((metric) => metric.id === "rebounds")).toBe(false);
  });

  it("does not reuse a manually selected honor metric", () => {
    const state = createBattleState(lebronJames, legendPlayers[0], "manual", "TEST");
    const first = resolveRound(state, "championships");
    const second = resolveRound(first, "championships");

    expect(first.log[0].metric.id).toBe("championships");
    expect(second.log[0].metric.id).not.toBe("championships");
    expect(second.usedMetricIds).toContain("championships");
  });

  it("still exposes the full metric list for details views", () => {
    const metrics = getAvailableMetrics(lebronJames, celticsPlayers[0]);

    expect(metrics.some((metric) => metric.id === "championships")).toBe(true);
    expect(metrics.some((metric) => metric.id === "rebounds")).toBe(true);
  });
});
