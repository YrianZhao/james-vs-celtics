import type { ComparisonMetric } from "./types";

export const comparisonMetrics: ComparisonMetric[] = [
  {
    id: "championships",
    label: "总冠军戒指",
    kind: "honor",
    key: "championships",
    higherIsBetter: true,
    baseWeight: 13,
    sourceLabel: "核心荣誉"
  },
  {
    id: "finalsMvps",
    label: "FMVP",
    kind: "honor",
    key: "finalsMvps",
    higherIsBetter: true,
    baseWeight: 15,
    sourceLabel: "核心荣誉"
  },
  {
    id: "mvps",
    label: "常规赛 MVP",
    kind: "honor",
    key: "mvps",
    higherIsBetter: true,
    baseWeight: 15,
    sourceLabel: "核心荣誉"
  },
  {
    id: "allNba",
    label: "最佳阵容次数",
    kind: "honor",
    key: "allNba",
    higherIsBetter: true,
    baseWeight: 12,
    sourceLabel: "核心荣誉"
  },
  {
    id: "allDefense",
    label: "最佳防守阵容次数",
    kind: "honor",
    key: "allDefense",
    higherIsBetter: true,
    baseWeight: 9,
    sourceLabel: "核心荣誉"
  },
  {
    id: "allStars",
    label: "全明星次数",
    kind: "honor",
    key: "allStars",
    higherIsBetter: true,
    baseWeight: 8,
    sourceLabel: "核心荣誉"
  },
  {
    id: "points",
    label: "常规赛总得分",
    kind: "total",
    key: "points",
    higherIsBetter: true,
    baseWeight: 11,
    sourceLabel: "生涯总计"
  },
  {
    id: "rebounds",
    label: "常规赛总篮板",
    kind: "total",
    key: "rebounds",
    higherIsBetter: true,
    baseWeight: 10,
    sourceLabel: "生涯总计"
  },
  {
    id: "assists",
    label: "常规赛总助攻",
    kind: "total",
    key: "assists",
    higherIsBetter: true,
    baseWeight: 10,
    sourceLabel: "生涯总计"
  },
  {
    id: "steals",
    label: "常规赛总抢断",
    kind: "total",
    key: "steals",
    higherIsBetter: true,
    baseWeight: 8,
    sourceLabel: "生涯总计"
  },
  {
    id: "blocks",
    label: "常规赛总盖帽",
    kind: "total",
    key: "blocks",
    higherIsBetter: true,
    baseWeight: 8,
    sourceLabel: "生涯总计"
  },
  {
    id: "ppg",
    label: "生涯场均得分",
    kind: "average",
    key: "ppg",
    higherIsBetter: true,
    baseWeight: 10,
    sourceLabel: "生涯场均"
  },
  {
    id: "rpg",
    label: "生涯场均篮板",
    kind: "average",
    key: "rpg",
    higherIsBetter: true,
    baseWeight: 8,
    sourceLabel: "生涯场均"
  },
  {
    id: "apg",
    label: "生涯场均助攻",
    kind: "average",
    key: "apg",
    higherIsBetter: true,
    baseWeight: 8,
    sourceLabel: "生涯场均"
  },
  {
    id: "playoffPoints",
    label: "季后赛总得分",
    kind: "total",
    key: "playoffPoints",
    higherIsBetter: true,
    baseWeight: 12,
    sourceLabel: "季后赛"
  },
  {
    id: "legacy",
    label: "历史地位压迫感",
    kind: "legacy",
    key: "legacy",
    higherIsBetter: true,
    baseWeight: 9,
    sourceLabel: "媒体评价摘要"
  },
  {
    id: "celticsAura",
    label: "绿军祖传气场",
    kind: "legacy",
    key: "celticsAura",
    higherIsBetter: true,
    baseWeight: 7,
    sourceLabel: "队史影响"
  },
  {
    id: "clutch",
    label: "硬仗气质",
    kind: "legacy",
    key: "clutch",
    higherIsBetter: true,
    baseWeight: 7,
    sourceLabel: "媒体评价摘要"
  }
];
