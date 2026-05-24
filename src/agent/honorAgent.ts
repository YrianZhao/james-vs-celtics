import { getPlayerDisplayName } from "../data/displayNames";
import { allPlayers, lebronJames, legendPlayers } from "../data/players";
import type { PlayerCard } from "../data/types";
import { buildHonorComparison, type HonorComparison, type HonorScoreRow } from "../game/honorScore";

export interface PlayerMatch {
  player: PlayerCard;
  score: number;
  matchedBy: string;
}

export interface HonorAgentReport {
  first: PlayerCard;
  second: PlayerCard;
  comparison: HonorComparison;
  winner: PlayerCard | null;
  winnerLabel: string;
  summary: string;
  debatePoints: string[];
  decisiveRows: HonorScoreRow[];
}

export interface HonorAgentFailure {
  input: string;
  suggestions: PlayerCard[];
}

export interface HonorAgentResult {
  report: HonorAgentReport | null;
  failures: HonorAgentFailure[];
}

const searchablePlayers = [lebronJames, ...legendPlayers];

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[·.'’\-_\s]/g, "")
    .replace(/勒布朗詹姆斯/g, "lebronjames")
    .replace(/迈克尔乔丹/g, "michaeljordan")
    .replace(/科比布莱恩特/g, "kobebryant")
    .replace(/斯蒂芬库里/g, "stephencurry")
    .replace(/魔术师约翰逊/g, "magicjohnson")
    .replace(/卡里姆阿卜杜尔贾巴尔/g, "kareemabduljabbar")
    .replace(/威尔特张伯伦/g, "wiltchamberlain")
    .replace(/沙奎尔奥尼尔/g, "shaquilleoneal")
    .replace(/蒂姆邓肯/g, "timduncan")
    .replace(/凯文杜兰特/g, "kevindurant")
    .replace(/哈基姆奥拉朱旺/g, "hakeemolajuwon")
    .replace(/奥斯卡罗伯特森/g, "oscarrobertson")
    .replace(/杰里韦斯特/g, "jerrywest")
    .replace(/朱利叶斯欧文/g, "juliuserving")
    .replace(/摩西马龙/g, "mosesmalone")
    .replace(/尼古拉约基奇/g, "nikolajokic")
    .replace(/扬尼斯阿德托昆博/g, "giannisantetokounmpo")
    .replace(/凯文加内特/g, "kevingarnett");
}

function getSearchTerms(player: PlayerCard) {
  return [
    player.name,
    getPlayerDisplayName(player),
    player.id,
    ...player.summaryTags,
    ...(player.aliases ?? [])
  ].map((term) => ({ raw: term, normalized: normalizeName(term) }));
}

function scorePlayerMatch(input: string, player: PlayerCard): PlayerMatch | null {
  const normalizedInput = normalizeName(input);
  if (!normalizedInput) return null;

  const terms = getSearchTerms(player);
  let best: PlayerMatch | null = null;

  for (const term of terms) {
    if (!term.normalized) continue;

    let score = 0;
    if (term.normalized === normalizedInput) {
      score = 100;
    } else if (term.normalized.includes(normalizedInput)) {
      score = 82 + Math.min(12, normalizedInput.length);
    } else if (normalizedInput.includes(term.normalized)) {
      score = 76 + Math.min(10, term.normalized.length);
    } else {
      const inputChars = [...new Set(normalizedInput.split(""))];
      const overlap = inputChars.filter((char) => term.normalized.includes(char)).length;
      score = Math.round((overlap / Math.max(inputChars.length, 1)) * 60);
    }

    if (score > (best?.score ?? 0)) {
      best = { player, score, matchedBy: term.raw };
    }
  }

  if (best === null || best.score < 45) {
    return null;
  }

  return best;
}

export function findPlayerMatches(input: string, limit = 5): PlayerMatch[] {
  return searchablePlayers
    .map((player) => scorePlayerMatch(input, player))
    .filter((match): match is PlayerMatch => match !== null)
    .sort((a, b) => b.score - a.score || a.player.name.localeCompare(b.player.name))
    .slice(0, limit);
}

function describeWinner(first: PlayerCard, second: PlayerCard, comparison: HonorComparison) {
  if (comparison.winner === "tie") {
    return {
      winner: null,
      label: "双方荣誉值打平"
    };
  }

  const winner = comparison.winner === "james" ? first : second;
  return {
    winner,
    label: `${getPlayerDisplayName(winner)} 荣誉值领先`
  };
}

function buildDebatePoints(first: PlayerCard, second: PlayerCard, rows: HonorScoreRow[]) {
  const firstName = getPlayerDisplayName(first);
  const secondName = getPlayerDisplayName(second);
  const decisive = [...rows]
    .filter((row) => row.jamesPoints !== row.opponentPoints)
    .sort((a, b) => Math.abs(b.jamesPoints - b.opponentPoints) - Math.abs(a.jamesPoints - a.opponentPoints))
    .slice(0, 4);

  if (decisive.length === 0) {
    return ["两人的结构化荣誉几乎没有拉开差距，争论会落到时代背景、巅峰质量和比赛风格。"];
  }

  return decisive.map((row) => {
    const leader = row.jamesPoints > row.opponentPoints ? firstName : secondName;
    const firstValue = `${firstName} ${row.jamesValue}${row.unit}`;
    const secondValue = `${secondName} ${row.opponentValue}${row.unit}`;
    return `${row.label}：${leader} 领先，${firstValue} vs ${secondValue}。`;
  });
}

export function buildHonorAgentReport(first: PlayerCard, second: PlayerCard): HonorAgentReport {
  const comparison = buildHonorComparison(first, second);
  const { winner, label } = describeWinner(first, second, comparison);
  const firstName = getPlayerDisplayName(first);
  const secondName = getPlayerDisplayName(second);
  const decisiveRows = [...comparison.rows]
    .filter((row) => row.jamesPoints !== row.opponentPoints)
    .sort((a, b) => Math.abs(b.jamesPoints - b.opponentPoints) - Math.abs(a.jamesPoints - a.opponentPoints))
    .slice(0, 5);
  const summary =
    comparison.winner === "tie"
      ? `${firstName} 和 ${secondName} 在当前荣誉权重下打平，适合继续讨论时代难度、巅峰长度和冠军路径。`
      : `${label}：${comparison.jamesScore} 比 ${comparison.opponentScore}。这个结论只基于当前静态荣誉快照，不调用实时大模型或联网搜索。`;

  return {
    first,
    second,
    comparison,
    winner,
    winnerLabel: label,
    summary,
    debatePoints: buildDebatePoints(first, second, comparison.rows),
    decisiveRows
  };
}

export function runHonorAgent(firstInput: string, secondInput: string): HonorAgentResult {
  const inputs = [firstInput, secondInput];
  const matches = inputs.map((input) => findPlayerMatches(input));
  const failures = inputs
    .map((input, index) => ({
      input,
      suggestions: matches[index].map((match) => match.player)
    }))
    .filter((failure, index) => matches[index][0]?.score !== 100 && matches[index][0]?.score < 62);

  const firstMatch = matches[0][0];
  const secondMatch = matches[1][0];

  if (!firstMatch || !secondMatch || failures.length > 0) {
    return { report: null, failures };
  }

  return {
    report: buildHonorAgentReport(firstMatch.player, secondMatch.player),
    failures: []
  };
}

export function getHonorAgentPlayers() {
  return searchablePlayers;
}

export function getAnyPlayerById(id: string) {
  return allPlayers.find((player) => player.id === id);
}
