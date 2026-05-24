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

export interface ComparisonMetric {
  id: string;
  label: string;
  kind: ComparisonKind;
  key: HonorKey | TotalKey | keyof AdvancedProfile;
  higherIsBetter: boolean;
  baseWeight: number;
  sourceLabel: string;
}
