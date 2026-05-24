import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRightLeft,
  BadgeInfo,
  BookOpen,
  Bot,
  ChevronDown,
  Clipboard,
  Cpu,
  Crown,
  Dumbbell,
  Play,
  RotateCcw,
  Search,
  Swords,
  Trophy,
  UserRoundCheck,
  Zap
} from "lucide-react";
import {
  findPlayerMatches,
  getHonorAgentPlayers,
  runHonorAgent,
  type HonorAgentReport
} from "./agent/honorAgent";
import { getPlayerDisplayName } from "./data/displayNames";
import { comparisonMetrics } from "./data/metrics";
import { lebronJames, opponentPlayers } from "./data/players";
import { dataSnapshotDate, sourceCatalog } from "./data/sources";
import type { BattleMode, ComparisonMetric, PlayerCard } from "./data/types";
import { createShareSeed, pickBySeed } from "./game/random";
import {
  type BattleState,
  MAX_BATTLE_ROUNDS,
  createBattleState,
  formatValue,
  getAvailableHonorMetrics,
  resolveRound
} from "./game/resolveRound";
import { buildHonorComparison, type HonorScoreRow } from "./game/honorScore";

const params = new URLSearchParams(window.location.search);
const initialOpponentId = params.get("opponent");
const initialMode = params.get("mode") === "manual" ? "manual" : "auto";
const initialSeed = params.get("seed") ?? createShareSeed();

function hpTone(value: number) {
  if (value > 60) return "healthy";
  if (value > 28) return "warning";
  return "danger";
}

function getMetricValue(player: PlayerCard, metric: ComparisonMetric) {
  if (metric.kind === "honor") {
    return player.honors[metric.key as keyof PlayerCard["honors"]];
  }

  if (metric.kind === "legacy") {
    return player.advanced[metric.key as keyof PlayerCard["advanced"]];
  }

  return player.careerTotals[metric.key as keyof PlayerCard["careerTotals"]];
}

function getBattleWinner(state: BattleState) {
  if (state.jamesHp > state.opponentHp) return "james";
  if (state.opponentHp > state.jamesHp) return "opponent";

  const jamesDamage = state.log
    .filter((round) => round.winner === "james")
    .reduce((total, round) => total + round.damage, 0);
  const opponentDamage = state.log
    .filter((round) => round.winner === "opponent")
    .reduce((total, round) => total + round.damage, 0);

  if (jamesDamage > opponentDamage) return "james";
  if (opponentDamage > jamesDamage) return "opponent";
  return "tie";
}

function vibrateOnHit() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion && "vibrate" in navigator) {
    navigator.vibrate?.(45);
  }
}

function PlayerPanel({
  player,
  hp,
  side,
  active
}: {
  player: PlayerCard;
  hp: number;
  side: "james" | "opponent";
  active: boolean;
}) {
  const displayName = getPlayerDisplayName(player);
  const topHonors = [
    ["冠", player.honors.championships],
    ["MVP", player.honors.mvps],
    ["FMVP", player.honors.finalsMvps],
    ["全明星", player.honors.allStars]
  ].filter(([, value]) => Number(value) > 0);

  return (
    <section className={`fighter-panel ${side} ${active ? "is-active" : ""}`}>
      <div className="fighter-bg" aria-hidden="true">
        <span className="court-line line-a" />
        <span className="court-line line-b" />
        <span className="player-silhouette" />
      </div>
      <div className="fighter-topline">
        <span className="side-label">{side === "james" ? "你的阵营" : "历史球星对手"}</span>
        <span className="era-badge">{player.era}</span>
      </div>
      <div className="fighter-name-row">
        <div>
          <h2>{displayName}</h2>
          <p>{player.position}</p>
        </div>
        <div className="danger-chip" aria-label={`危险等级 ${player.advanced.dangerLevel}`}>
          <Zap size={16} />
          {player.advanced.dangerLevel}
        </div>
      </div>
      <div className={`hp-wrap ${hpTone(hp)}`}>
        <div className="hp-text">
          <span>生命</span>
          <strong>{hp}</strong>
        </div>
        <div className="hp-track" aria-label={`${displayName} 生命值 ${hp}`}>
          <span style={{ width: `${hp}%` }} />
        </div>
      </div>
      <div className="tag-row">
        {player.summaryTags.slice(0, 4).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="honor-strip">
        {topHonors.map(([label, value]) => (
          <span key={label}>
            <strong>{value}</strong>
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function ModeSwitch({ mode, onChange }: { mode: BattleMode; onChange: (mode: BattleMode) => void }) {
  return (
    <div className="mode-switch" role="tablist" aria-label="对战模式">
      <button className={mode === "manual" ? "active" : ""} onClick={() => onChange("manual")} type="button">
        <UserRoundCheck size={16} />
        手动选项
      </button>
      <button className={mode === "auto" ? "active" : ""} onClick={() => onChange("auto")} type="button">
        <Bot size={16} />
        自动对战
      </button>
    </div>
  );
}

function OpponentPicker({
  selected,
  onPick,
  onSeedPick
}: {
  selected: PlayerCard;
  onPick: (player: PlayerCard) => void;
  onSeedPick: () => void;
}) {
  return (
    <section className="picker-panel">
      <div className="section-title">
        <div>
          <span>卡池选择</span>
          <h3>挑一张历史球星对手卡</h3>
        </div>
        <button className="icon-button" onClick={onSeedPick} type="button" aria-label="按种子抽一张">
          <RotateCcw size={18} />
        </button>
      </div>
      <div className="card-grid" aria-label="历史球星卡池">
        {opponentPlayers.map((player) => (
          <button
            className={`opponent-card ${selected.id === player.id ? "selected" : ""}`}
            key={player.id}
            onClick={() => onPick(player)}
            type="button"
          >
            <span className="rank">#{player.rankSource.rank}</span>
            <span className="mini-silhouette" aria-hidden="true" />
            <strong>{getPlayerDisplayName(player)}</strong>
            <small>{player.summaryTags[0]}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ManualControls({
  metrics,
  disabled,
  onResolve
}: {
  metrics: ComparisonMetric[];
  disabled: boolean;
  onResolve: (metricId: string) => void;
}) {
  return (
    <section className="manual-panel">
      <div className="section-title compact">
        <div>
          <span>手动模式</span>
          <h3>选择这一回合的隐藏荣誉项</h3>
        </div>
        <Dumbbell size={20} />
      </div>
      <div className="metric-grid">
        {metrics.map((metric) => (
          <button key={metric.id} disabled={disabled} onClick={() => onResolve(metric.id)} type="button">
            <span>{metric.sourceLabel}</span>
            <strong>{metric.label}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function BattleLog({ state }: { state: BattleState }) {
  const latest = state.log[0];
  const opponentName = getPlayerDisplayName(state.opponent);

  return (
    <section className="log-panel">
      <div className="section-title compact">
        <div>
          <span>战报</span>
          <h3>{state.finished ? "比赛结束" : latest ? `第 ${latest.round} 回合` : "等待开火"}</h3>
        </div>
        <Activity size={20} />
      </div>
      {latest ? (
        <article className={`latest-round ${latest.winner}`}>
          <div className="round-header">
            <em>R{latest.round}/{MAX_BATTLE_ROUNDS}</em>
            <span>{latest.metric.sourceLabel}</span>
            <strong>{latest.metric.label}</strong>
          </div>
          <div className="score-compare">
            <span>
              詹姆斯
              <strong>{formatValue(latest.jamesValue)}</strong>
            </span>
            <ArrowRightLeft size={18} />
            <span>
              {opponentName}
              <strong>{formatValue(latest.opponentValue)}</strong>
            </span>
          </div>
          <p>{latest.line}</p>
          <div className="damage-line">
            <Zap size={16} />
            {latest.winner === "james" ? opponentName : "詹姆斯"} 受到 {latest.damage} 点伤害
          </div>
        </article>
      ) : (
        <div className="empty-log">
          <Swords size={28} />
          <p>倒计时结束后开打。自动模式会连续打满 4 回合，手动模式由你挑每回合的隐藏荣誉项。</p>
        </div>
      )}
      <div className="round-list">
        {state.log.slice(1, 7).map((round) => (
          <div key={`${round.round}-${round.metric.id}`} className="round-row">
            <span>R{round.round}</span>
            <strong>{round.metric.label}</strong>
            <em>{round.winner === "james" ? "詹姆斯" : opponentName} +{round.damage}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function HonorTickerRow({
  row,
  opponentName
}: {
  row: HonorScoreRow;
  opponentName: string;
}) {
  const leaderText =
    row.leader === "james" ? "詹姆斯领先" : row.leader === "opponent" ? `${opponentName} 领先` : "双方打平";

  return (
    <div className={`honor-ticker-row ${row.leader}`}>
      <span>{row.label}</span>
      <strong>
        詹姆斯 {row.jamesValue}
        {row.unit}
      </strong>
      <em>
        {opponentName} {row.opponentValue}
        {row.unit}
      </em>
      <b>{leaderText}</b>
    </div>
  );
}

function HonorComparisonBoard({ opponent }: { opponent: PlayerCard }) {
  const opponentName = getPlayerDisplayName(opponent);
  const comparison = useMemo(() => buildHonorComparison(lebronJames, opponent), [opponent]);
  const visibleRows = comparison.rows.filter((row) => row.jamesValue > 0 || row.opponentValue > 0);
  const tickerRows = [...visibleRows, ...visibleRows];
  const maxScore = Math.max(comparison.jamesScore, comparison.opponentScore, 1);
  const winnerText =
    comparison.winner === "james"
      ? "荣誉总分：詹姆斯压住这一局"
      : comparison.winner === "opponent"
        ? `荣誉总分：${opponentName} 顶住挑战`
        : "荣誉总分：双方平手";

  return (
    <section className="honor-board">
      <div className="section-title">
        <div>
          <span>荣誉值对比</span>
          <h3>{opponentName} vs 詹姆斯荣誉榜</h3>
        </div>
        <Crown size={22} />
      </div>
      <div className="honor-score-card">
        <div className="score-side james-score">
          <span>勒布朗·詹姆斯</span>
          <strong>{comparison.jamesScore}</strong>
          <div className="score-track">
            <i style={{ width: `${(comparison.jamesScore / maxScore) * 100}%` }} />
          </div>
        </div>
        <div className="score-verdict">
          <b>{winnerText}</b>
          <small>只计算冠军、MVP、FMVP、最佳阵容等结构化荣誉</small>
        </div>
        <div className="score-side opponent-score">
          <span>{opponentName}</span>
          <strong>{comparison.opponentScore}</strong>
          <div className="score-track">
            <i style={{ width: `${(comparison.opponentScore / maxScore) * 100}%` }} />
          </div>
        </div>
      </div>
      <div className="honor-ticker" aria-label="荣誉数据滚动播放">
        <div className="honor-ticker-track">
          {tickerRows.map((row, index) => (
            <HonorTickerRow key={`${row.key}-${index}`} row={row} opponentName={opponentName} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HonorAgentPanel() {
  const [firstInput, setFirstInput] = useState("LeBron James");
  const [secondInput, setSecondInput] = useState("Michael Jordan");
  const [result, setResult] = useState(() => runHonorAgent("LeBron James", "Michael Jordan"));
  const players = getHonorAgentPlayers();
  const report = result.report;

  const runAgent = () => {
    setResult(runHonorAgent(firstInput, secondInput));
  };

  const suggestions = useMemo(() => {
    const picked = [
      ...findPlayerMatches(firstInput).map((match) => match.player),
      ...findPlayerMatches(secondInput).map((match) => match.player),
      ...players.slice(0, 6)
    ];
    return picked.filter((player, index) => picked.findIndex((item) => item.id === player.id) === index).slice(0, 8);
  }, [firstInput, secondInput, players]);

  return (
    <section className="agent-panel">
      <div className="section-title">
        <div>
          <span>Honor Agent</span>
          <h3>输入两个球星，生成荣誉值报告</h3>
        </div>
        <Cpu size={22} />
      </div>

      <div className="agent-form">
        <label>
          <span>球星 A</span>
          <input value={firstInput} onChange={(event) => setFirstInput(event.target.value)} list="agent-player-list" />
        </label>
        <label>
          <span>球星 B</span>
          <input value={secondInput} onChange={(event) => setSecondInput(event.target.value)} list="agent-player-list" />
        </label>
        <button className="primary-button" type="button" onClick={runAgent}>
          <Search size={18} />
          生成报告
        </button>
        <datalist id="agent-player-list">
          {players.map((player) => (
            <option key={player.id} value={getPlayerDisplayName(player)} />
          ))}
        </datalist>
      </div>

      <div className="agent-suggestion-row">
        {suggestions.map((player) => (
          <button
            key={player.id}
            type="button"
            onClick={() => setSecondInput(getPlayerDisplayName(player))}
            className="agent-chip"
          >
            {getPlayerDisplayName(player)}
          </button>
        ))}
      </div>

      {report ? <HonorAgentReportView report={report} /> : <HonorAgentFailureView failures={result.failures} />}
    </section>
  );
}

function HonorAgentReportView({ report }: { report: HonorAgentReport }) {
  const firstName = getPlayerDisplayName(report.first);
  const secondName = getPlayerDisplayName(report.second);

  return (
    <article className="agent-report">
      <div className="agent-verdict">
        <span>本地 agent 分析</span>
        <strong>{report.winnerLabel}</strong>
        <p>{report.summary}</p>
      </div>
      <div className="agent-score-pair">
        <span>
          {firstName}
          <strong>{report.comparison.jamesScore}</strong>
        </span>
        <em>荣誉值</em>
        <span>
          {secondName}
          <strong>{report.comparison.opponentScore}</strong>
        </span>
      </div>
      <div className="agent-debate-list">
        {report.debatePoints.map((point) => (
          <p key={point}>{point}</p>
        ))}
      </div>
      <div className="agent-mini-table">
        {report.decisiveRows.map((row) => (
          <div key={row.key} className={`agent-mini-row ${row.leader}`}>
            <span>{row.label}</span>
            <strong>
              {row.jamesValue}
              {row.unit}
            </strong>
            <em>
              {row.opponentValue}
              {row.unit}
            </em>
          </div>
        ))}
      </div>
    </article>
  );
}

function HonorAgentFailureView({ failures }: { failures: { input: string; suggestions: PlayerCard[] }[] }) {
  return (
    <div className="agent-empty">
      <Search size={24} />
      <p>没有稳定匹配到球员。试试中文名、英文名或常见绰号。</p>
      {failures.map((failure) => (
        <div key={failure.input}>
          <strong>{failure.input || "空输入"}</strong>
          <span>{failure.suggestions.map((player) => getPlayerDisplayName(player)).join(" / ") || "暂无候选"}</span>
        </div>
      ))}
    </div>
  );
}

function ResultModal({
  open,
  opponent,
  state,
  onClose,
  onRematch,
  onSelect
}: {
  open: boolean;
  opponent: PlayerCard;
  state: BattleState;
  onClose: () => void;
  onRematch: () => void;
  onSelect: () => void;
}) {
  const opponentName = getPlayerDisplayName(opponent);
  const comparison = useMemo(() => buildHonorComparison(lebronJames, opponent), [opponent]);
  const winner = state.finished ? getBattleWinner(state) : comparison.winner;
  const winnerName = winner === "james" ? "勒布朗·詹姆斯" : winner === "opponent" ? opponentName : "双方平手";
  const subtitle =
    winner === "tie"
      ? "四个荣誉回合打到难分高下，这局算是吵架素材拉满。"
      : `${winnerName} 赢了。下面是完整荣誉值对比，输赢理由直接摊开。`;

  if (!open) {
    return null;
  }

  return (
    <div className="result-backdrop" role="dialog" aria-modal="true" aria-labelledby="result-title">
      <section className="result-modal">
        <div className="result-hero">
          <span>对战结果</span>
          <h2 id="result-title">{winnerName}赢了</h2>
          <p>{subtitle}</p>
          <div className="result-scoreline">
            <span>
              勒布朗·詹姆斯
              <strong>{comparison.jamesScore}</strong>
            </span>
            <em>荣誉值</em>
            <span>
              {opponentName}
              <strong>{comparison.opponentScore}</strong>
            </span>
          </div>
        </div>

        <div className="result-table-wrap">
          <div className="result-table-head">
            <span>荣誉项</span>
            <strong>詹姆斯</strong>
            <em>{opponentName}</em>
            <b>领先方</b>
          </div>
          <div className="result-table">
            {comparison.rows.map((row) => (
              <div className={`result-row ${row.leader}`} key={row.key}>
                <span>
                  <small>
                    权重 {row.weight} / {row.unit}
                  </small>
                  {row.label}
                </span>
                <strong>{row.jamesValue}</strong>
                <em>{row.opponentValue}</em>
                <b>
                  {row.leader === "james" ? "詹姆斯" : row.leader === "opponent" ? opponentName : "平手"}
                </b>
              </div>
            ))}
          </div>
        </div>

        <div className="result-actions">
          <button className="primary-button" type="button" onClick={onRematch}>
            <Play size={18} />
            再打一局
          </button>
          <button className="secondary-button" type="button" onClick={onSelect}>
            <RotateCcw size={18} />
            重新选卡
          </button>
          <button className="secondary-button" type="button" onClick={onClose}>
            继续查看
          </button>
        </div>
      </section>
    </div>
  );
}

function DetailsDrawer({
  open,
  opponent,
  onClose
}: {
  open: boolean;
  opponent: PlayerCard;
  onClose: () => void;
}) {
  const opponentName = getPlayerDisplayName(opponent);
  const rows = comparisonMetrics
    .map((metric) => ({
      metric,
      james: getMetricValue(lebronJames, metric),
      opponent: getMetricValue(opponent, metric)
    }))
    .filter((row) => typeof row.james === "number" && typeof row.opponent === "number");

  return (
    <div className={`drawer-backdrop ${open ? "open" : ""}`} onClick={onClose}>
      <aside className="details-drawer" onClick={(event) => event.stopPropagation()} aria-hidden={!open}>
        <div className="drawer-head">
          <div>
            <span>数据详情</span>
            <h3>詹姆斯 vs {opponentName}</h3>
          </div>
          <button className="text-button" type="button" onClick={onClose}>
            收起
            <ChevronDown size={16} />
          </button>
        </div>
        <div className="detail-table">
          {rows.map((row) => (
            <div key={row.metric.id} className="detail-row">
              <span>{row.metric.label}</span>
              <strong>{formatValue(row.james)}</strong>
              <em>{formatValue(row.opponent)}</em>
            </div>
          ))}
        </div>
        <div className="source-list">
          <h4>本场来源入口</h4>
          {[...new Set([...lebronJames.sourceUrls, ...opponent.sourceUrls])].map((url) => (
            <a href={url} key={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}

function SourcesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="sources-modal" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <span>数据来源</span>
            <h3>快照日期 {dataSnapshotDate}</h3>
          </div>
          <button className="text-button" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        <p>
          本游戏使用公开资料中常见的核心荣誉做可玩化快照。精选历史球星池为静态资料，不代表实时自动更新。
        </p>
        <div className="source-list">
          {sourceCatalog.map((source) => (
            <a href={source.url} key={source.url} target="_blank" rel="noreferrer">
              <BookOpen size={16} />
              {source.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function buildShareUrl(opponent: PlayerCard, mode: BattleMode, seed: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("opponent", opponent.id);
  url.searchParams.set("mode", mode);
  url.searchParams.set("seed", seed);
  return url.toString();
}

function SelectionIntro({ selected }: { selected: PlayerCard }) {
  return (
    <section className="selection-intro">
      <div className="selection-hero-card">
        <span className="eyebrow">你的固定阵营</span>
        <h2>勒布朗·詹姆斯</h2>
        <p>先选一张历史球星卡，点击开战后进入 3-2-1 倒计时和 4 回合荣誉对战。</p>
        <div className="selection-stat-row">
          <span>
            <strong>{lebronJames.honors.championships}</strong>
            总冠军
          </span>
          <span>
            <strong>{lebronJames.honors.mvps}</strong>
            MVP
          </span>
          <span>
            <strong>{formatValue(lebronJames.careerTotals.points)}</strong>
            总得分
          </span>
        </div>
      </div>
      <div className="selected-opponent-card">
        <span>当前对手</span>
        <strong>{getPlayerDisplayName(selected)}</strong>
        <small>
          #{selected.rankSource.rank} · {selected.summaryTags.slice(0, 3).join(" / ")}
        </small>
      </div>
    </section>
  );
}

export default function App() {
  const seededOpponent = useMemo(() => pickBySeed(opponentPlayers, initialSeed), []);
  const [opponent, setOpponent] = useState(
    opponentPlayers.find((player) => player.id === initialOpponentId) ?? seededOpponent
  );
  const [mode, setMode] = useState<BattleMode>(initialMode);
  const [seed, setSeed] = useState(initialSeed);
  const [state, setState] = useState(() => createBattleState(lebronJames, opponent, mode, seed));
  const [phase, setPhase] = useState<"select" | "countdown" | "battle">(initialOpponentId ? "battle" : "select");
  const [countdown, setCountdown] = useState(3);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [impactSide, setImpactSide] = useState<"james" | "opponent" | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [shareState, setShareState] = useState("复制链接");

  const manualMetrics = useMemo(
    () => getAvailableHonorMetrics(lebronJames, opponent, state.usedMetricIds),
    [opponent, state.usedMetricIds]
  );

  useEffect(() => {
    setState(createBattleState(lebronJames, opponent, mode, seed));
    setResultOpen(false);
    setAutoPlaying(false);
    setImpactSide(null);
  }, [opponent, mode, seed]);

  const startBattle = () => {
    const fresh = createBattleState(lebronJames, opponent, mode, seed);
    setState(fresh);
    setResultOpen(false);
    setAutoPlaying(false);
    setImpactSide(null);
    setCountdown(3);
    setPhase("countdown");
  };

  useEffect(() => {
    if (phase !== "countdown") return undefined;

    if (countdown <= 0) {
      setPhase("battle");
      setAutoPlaying(mode === "auto");
      return undefined;
    }

    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 800);
    return () => window.clearTimeout(timer);
  }, [countdown, mode, phase]);

  useEffect(() => {
    if (!autoPlaying || mode !== "auto" || phase !== "battle") return undefined;

    if (state.finished) {
      setAutoPlaying(false);
      setResultOpen(true);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setState((current) => {
        if (current.finished) return current;
        const nextState = resolveRound(current);
        const latest = nextState.log[0];
        setImpactSide(latest?.winner === "james" ? "opponent" : "james");
        vibrateOnHit();
        window.setTimeout(() => setImpactSide(null), 420);
        return nextState;
      });
    }, state.round === 0 ? 450 : 1050);

    return () => window.clearTimeout(timer);
  }, [autoPlaying, mode, phase, state.finished, state.round]);

  const resolveManual = (metricId: string) => {
    setState((current) => {
      const nextState = resolveRound(current, metricId);
      const latest = nextState.log[0];
      setImpactSide(latest?.winner === "james" ? "opponent" : "james");
      vibrateOnHit();
      window.setTimeout(() => setImpactSide(null), 420);
      if (nextState.finished) {
        setResultOpen(true);
      }
      return nextState;
    });
  };

  const chooseSeededOpponent = () => {
    const nextSeed = createShareSeed();
    setSeed(nextSeed);
    setOpponent(pickBySeed(opponentPlayers, nextSeed));
  };

  const pickOpponent = (player: PlayerCard) => {
    setOpponent(player);
    setSeed(createShareSeed());
    setPhase("select");
  };

  const restart = () => {
    setState(createBattleState(lebronJames, opponent, mode, seed));
    setResultOpen(false);
  };

  const backToSelect = () => {
    setPhase("select");
    setState(createBattleState(lebronJames, opponent, mode, seed));
    setResultOpen(false);
    setAutoPlaying(false);
    setImpactSide(null);
  };

  const copyShare = async () => {
    const url = buildShareUrl(opponent, mode, seed);
    await navigator.clipboard.writeText(url);
    setShareState("已复制");
    window.setTimeout(() => setShareState("复制链接"), 1400);
  };

  const activeSide = state.log[0]?.winner === "opponent" ? "opponent" : "james";
  const opponentName = getPlayerDisplayName(opponent);
  const resultText = state.finished
    ? getBattleWinner(state) === "james"
      ? "詹姆斯拿下这局"
      : getBattleWinner(state) === "opponent"
        ? `${opponentName} 赢下荣誉战`
        : "四回合打平"
    : mode === "auto"
      ? `自动模式会连打 ${MAX_BATTLE_ROUNDS} 回合`
      : "手动模式每回合由你选隐藏荣誉项";

  if (phase === "select") {
    return (
      <main className="app-shell">
        <header className="app-header">
          <div>
            <span className="eyebrow">Open-source card battle</span>
            <h1>詹姆斯 VS 历史球星</h1>
            <p>先选历史球星卡。点击开战后进入 3-2-1 倒计时，随后用 4 个隐藏荣誉项决胜。</p>
          </div>
          <div className="header-actions">
            <button className="ghost-button" type="button" onClick={() => setSourcesOpen(true)}>
              <BadgeInfo size={18} />
              来源
            </button>
            <button className="ghost-button" type="button" onClick={copyShare}>
              <Clipboard size={18} />
              {shareState}
            </button>
          </div>
        </header>

        <SelectionIntro selected={opponent} />
        <HonorAgentPanel />

        <section className="selection-controls">
          <ModeSwitch mode={mode} onChange={setMode} />
          <button className="primary-button" type="button" onClick={startBattle}>
            <Play size={18} />
            开战
          </button>
        </section>

        <OpponentPicker selected={opponent} onPick={pickOpponent} onSeedPick={chooseSeededOpponent} />

        <footer className="app-footer">
          <span>非官方球迷作品，不使用官方 Logo 或球员照片。</span>
          <span>数据快照：{dataSnapshotDate}</span>
        </footer>

        <SourcesModal open={sourcesOpen} onClose={() => setSourcesOpen(false)} />
      </main>
    );
  }

  if (phase === "countdown") {
    return (
      <main className="app-shell countdown-shell">
        <section className="countdown-arena">
          <div>
            <span>准备对战</span>
            <h1>詹姆斯 VS {opponentName}</h1>
            <p>{mode === "auto" ? "自动模式将在倒计时后连续播放 4 回合。" : "手动模式将在倒计时后让你选择第一项隐藏荣誉。"}</p>
          </div>
          <strong>{countdown > 0 ? countdown : "开战"}</strong>
        </section>
      </main>
    );
  }

  return (
    <main className={`app-shell ${impactSide ? "screen-shake" : ""}`}>
      <header className="app-header">
        <div>
          <span className="eyebrow">Open-source card battle</span>
          <h1>詹姆斯 VS 历史球星</h1>
          <p>手机上下分屏，电脑斜向站位。你永远是詹姆斯，对面从历史球星荣誉池里挑。</p>
        </div>
        <div className="header-actions">
          <button className="ghost-button" type="button" onClick={() => setSourcesOpen(true)}>
            <BadgeInfo size={18} />
            来源
          </button>
          <button className="ghost-button" type="button" onClick={copyShare}>
            <Clipboard size={18} />
            {shareState}
          </button>
          <button className="ghost-button" type="button" onClick={backToSelect}>
            <RotateCcw size={18} />
            重新选卡
          </button>
        </div>
      </header>

      <section className="battlefield">
        <div className="court-markings" aria-hidden="true" />
        <div className={`arena-fighter james ${activeSide === "james" ? "is-active" : ""} ${impactSide === "james" ? "is-hit" : ""}`}>
          <PlayerPanel player={lebronJames} hp={state.jamesHp} side="james" active={activeSide === "james"} />
        </div>
        <div className={`arena-fighter opponent ${activeSide === "opponent" ? "is-active" : ""} ${impactSide === "opponent" ? "is-hit" : ""}`}>
          <PlayerPanel player={opponent} hp={state.opponentHp} side="opponent" active={activeSide === "opponent"} />
        </div>
        <div className={`skill-burst ${state.log[0]?.winner ?? "idle"}`} aria-hidden="true">
          <span>{state.log[0]?.metric.label ?? "荣誉开火"}</span>
        </div>
        <div className="versus-core battle-status">
          <span className="vs-token">R{Math.min(state.round + (state.finished ? 0 : 1), MAX_BATTLE_ROUNDS)}</span>
          <strong>{resultText}</strong>
          <small>Seed {seed}</small>
        </div>
      </section>

      <section className="control-bar">
        <ModeSwitch mode={mode} onChange={setMode} />
        <div className="primary-actions">
          <button className="primary-button" type="button" onClick={startBattle}>
            <Play size={18} />
            {mode === "auto" ? "重新自动开战" : state.round === 0 ? "重新倒计时" : "重开本局"}
          </button>
          <button className="secondary-button" type="button" onClick={restart}>
            <RotateCcw size={18} />
            重置
          </button>
          <button className="secondary-button" type="button" onClick={() => setDetailsOpen(true)}>
            <Trophy size={18} />
            数据详情
          </button>
        </div>
      </section>

      <section className="main-grid">
        <HonorComparisonBoard opponent={opponent} />
        <div className="battle-column">
          {mode === "manual" && (
            <ManualControls metrics={manualMetrics} disabled={state.finished || autoPlaying} onResolve={resolveManual} />
          )}
          <BattleLog state={state} />
        </div>
      </section>

      <footer className="app-footer">
        <span>非官方球迷作品，不使用官方 Logo 或球员照片。</span>
        <span>数据快照：{dataSnapshotDate}</span>
      </footer>

      <DetailsDrawer open={detailsOpen} opponent={opponent} onClose={() => setDetailsOpen(false)} />
      <SourcesModal open={sourcesOpen} onClose={() => setSourcesOpen(false)} />
      <ResultModal
        open={resultOpen}
        opponent={opponent}
        state={state}
        onClose={() => setResultOpen(false)}
        onRematch={startBattle}
        onSelect={backToSelect}
      />
    </main>
  );
}
