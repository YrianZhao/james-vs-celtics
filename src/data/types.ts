export type TeamSide = "james" | "legend" | "celtics";

export type BattleMode = "manual" | "auto";

export type ComparisonKind = "honor" | "total" | "average" | "legacy";

export type HonorKey =
  | "championships"
  | "mvps"
  | "finalsMvps"
  | "allStars"
  | "allNba"
  | "allDefense"
  | "scoringTitles"
  | "assistTitles"
  | "reboundTitles"
  | "dpoy"
  | "roy"
  | "hallOfFame"
  | "nba75";

export type TotalKey =
  | "games"
  | "points"
  | "rebounds"
  | "assists"
  | "steals"
  | "blocks"
  | "ppg"
  | "rpg"
  | "apg"
  | "playoffPoints"
  | "playoffRebounds"
  | "playoffAssists";

export interface Honors {
  championships: number;
  mvps: number;
  finalsMvps: number;
  allStars: number;
  allNba: number;
  allDefense: number;
  scoringTitles: number;
  assistTitles: number;
  reboundTitles: number;
  dpoy: number;
  roy: number;
  hallOfFame: number;
  nba75: number;
}

export interface CareerTotals {
  games: number | null;
  points: number | null;
  rebounds: number | null;
  assists: number | null;
  steals: number | null;
  blocks: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  playoffPoints: number | null;
  playoffRebounds: number | null;
  playoffAssists: number | null;
}

export interface AdvancedProfile {
  dangerLevel: number;
  clutch: number;
  legacy: number;
  celticsAura: number;
}

export interface RankSource {
  rank: number | null;
  label: string;
  url: string;
}

export interface PlayerCard {
  id: string;
  name: string;
  aliases?: string[];
  teamSide: TeamSide;
  era: string;
  position: string;
  rankSource: RankSource;
  summaryTags: string[];
  honors: Honors;
  careerTotals: CareerTotals;
  advanced: AdvancedProfile;
  mediaNotes: string[];
  sourceUrls: string[];
  trashTalkLines: string[];
}

export interface EraAbility {
  id: string;
  label: string;
  seasons: string;
  team: string;
  offense: number;
  defense: number;
  playmaking: number;
  rebounding: number;
  athleticism: number;
  clutch: number;
  aura: number;
  summary: string;
}

export interface ManagerPlayer extends PlayerCard {
  debateRank: number;
  eras: EraAbility[];
}

export interface DraftPick {
  playerId: string;
  eraId?: string;
}

export interface ResolvedDraftPick {
  player: ManagerPlayer;
  era: EraAbility;
  power: number;
}

export interface ManagerLineupResult {
  picks: ResolvedDraftPick[];
  total: number;
  average: number;
}

export interface ManagerMatchupRound {
  slot: number;
  left: ResolvedDraftPick;
  right: ResolvedDraftPick;
  leftScore: number;
  rightScore: number;
  winner: "left" | "right" | "tie";
  focus: keyof EraAbility;
}

export interface ManagerMatchupResult {
  seed: string;
  left: ManagerLineupResult;
  right: ManagerLineupResult;
  rounds: ManagerMatchupRound[];
  winner: "left" | "right" | "tie";
}

export interface ComparisonMetric {
  id: string;
  label: string;
  kind: ComparisonKind;
  key: HonorKey | TotalKey | keyof AdvancedProfile;
  higherIsBetter: boolean;
  baseWeight: number;
  sourceLabel: string;
}
