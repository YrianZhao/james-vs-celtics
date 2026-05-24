import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRightLeft,
  BadgeInfo,
  BookOpen,
  Bot,
  ChevronDown,
  Clipboard,
  Crown,
  Dumbbell,
  Play,
  RotateCcw,
  Swords,
  Trophy,
  UserRoundCheck,
  Zap
} from "lucide-react";
import { getPlayerDisplayName } from "./data/displayNames";
import { comparisonMetrics } from "./data/metrics";
import { celticsPlayers, lebronJames } from "./data/players";
import { dataSnapshotDate, sourceCatalog } from "./data/sources";
import type { BattleMode, ComparisonMetric, PlayerCard } from "./data/types";
import { createShareSeed, pickBySeed } from "./game/random";
import {
  type BattleState,
  createBattleState,
  formatValue,
  getAvailableMetrics,
  resolveAutoBattle,
  resolveRound
} from "./game/resolveRound";
import { buildFullComparison, type ComparisonScoreRow } from "./game/comparisonScore";

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
        <span className="side-label">{side === "james" ? "你的阵营" : "凯尔特人对手"}</span>
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
          <h3>挑一张绿军对手卡</h3>
        </div>
        <button className="icon-button" onClick={onSeedPick} type="button" aria-label="按种子抽一张">
          <RotateCcw size={18} />
        </button>
      </div>
      <div className="card-grid" aria-label="凯尔特人球星卡池">
        {celticsPlayers.map((player) => (
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
          <h3>选择这一回合的对比项</h3>
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
          <p>选择对手和模式后开战。自动模式会自己打完全场，手动模式由你挑每回合的数据项。</p>
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

function DataTickerRow({
  row,
  opponentName
}: {
  row: ComparisonScoreRow;
  opponentName: string;
}) {
  const leaderText =
    row.leader === "james" ? "詹姆斯领先" : row.leader === "opponent" ? `${opponentName} 领先` : "双方打平";

  return (
    <div className={`honor-ticker-row ${row.leader}`}>
      <span>{row.label}</span>
      <strong>
        詹姆斯 {formatValue(row.jamesValue)}
      </strong>
      <em>
        {opponentName} {formatValue(row.opponentValue)}
      </em>
      <b>{leaderText}</b>
    </div>
  );
}

function DataComparisonBoard({ opponent }: { opponent: PlayerCard }) {
  const opponentName = getPlayerDisplayName(opponent);
  const comparison = useMemo(() => buildFullComparison(lebronJames, opponent), [opponent]);
  const visibleRows = comparison.rows.filter((row) => row.jamesValue > 0 || row.opponentValue > 0);
  const tickerRows = [...visibleRows, ...visibleRows];
  const maxScore = Math.max(comparison.jamesScore, comparison.opponentScore, 1);
  const winnerText =
    comparison.winner === "james"
      ? "综合总分：詹姆斯压住这一局"
      : comparison.winner === "opponent"
        ? `综合总分：${opponentName} 顶住门面`
        : "综合总分：双方平手";

  return (
    <section className="honor-board">
      <div className="section-title">
        <div>
          <span>全部数据对比</span>
          <h3>{opponentName} vs 詹姆斯滚动数据榜</h3>
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
          <small>总分综合荣誉、生涯数据、场均、季后赛和历史评价</small>
        </div>
        <div className="score-side opponent-score">
          <span>{opponentName}</span>
          <strong>{comparison.opponentScore}</strong>
          <div className="score-track">
            <i style={{ width: `${(comparison.opponentScore / maxScore) * 100}%` }} />
          </div>
        </div>
      </div>
      <div className="honor-ticker" aria-label="全部数据滚动播放">
        <div className="honor-ticker-track">
          {tickerRows.map((row, index) => (
            <DataTickerRow key={`${row.id}-${index}`} row={row} opponentName={opponentName} />
          ))}
        </div>
      </div>
    </section>
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
          本游戏使用公开资料中常见的核心荣誉与生涯总计做可玩化快照。低位卡不追求逐小数精确，重点是让手机和电脑都能打开就玩。
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
        <p>先选一张凯尔特人球星卡，点击开战后进入完整对战界面，系统会滚动播放两人的全部数据对比。</p>
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
  const seededOpponent = useMemo(() => pickBySeed(celticsPlayers, initialSeed), []);
  const [opponent, setOpponent] = useState(
    celticsPlayers.find((player) => player.id === initialOpponentId) ?? seededOpponent
  );
  const [mode, setMode] = useState<BattleMode>(initialMode);
  const [seed, setSeed] = useState(initialSeed);
  const [state, setState] = useState(() => createBattleState(lebronJames, opponent, mode, seed));
  const [phase, setPhase] = useState<"select" | "battle">(initialOpponentId ? "battle" : "select");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [shareState, setShareState] = useState("复制链接");

  const manualMetrics = useMemo(() => getAvailableMetrics(lebronJames, opponent), [opponent]);

  useEffect(() => {
    setState(createBattleState(lebronJames, opponent, mode, seed));
  }, [opponent, mode, seed]);

  const startBattle = () => {
    const fresh = createBattleState(lebronJames, opponent, mode, seed);
    setState(mode === "auto" ? resolveAutoBattle(fresh) : fresh);
    setPhase("battle");
  };

  const resolveManual = (metricId: string) => {
    setState((current) => resolveRound(current, metricId));
  };

  const chooseSeededOpponent = () => {
    const nextSeed = createShareSeed();
    setSeed(nextSeed);
    setOpponent(pickBySeed(celticsPlayers, nextSeed));
  };

  const pickOpponent = (player: PlayerCard) => {
    setOpponent(player);
    setSeed(createShareSeed());
    setPhase("select");
  };

  const restart = () => {
    setState(createBattleState(lebronJames, opponent, mode, seed));
  };

  const backToSelect = () => {
    setPhase("select");
    setState(createBattleState(lebronJames, opponent, mode, seed));
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
    ? state.jamesHp > state.opponentHp
      ? "詹姆斯拿下这局"
      : `${opponentName} 守住绿军门面`
    : mode === "auto"
      ? "自动模式会一键打完全场"
      : "手动模式每回合由你选数据项";

  if (phase === "select") {
    return (
      <main className="app-shell">
        <header className="app-header">
          <div>
            <span className="eyebrow">Open-source card battle</span>
            <h1>詹姆斯 VS 凯尔特人</h1>
            <p>先选凯尔特人球星卡。点击开战后，才进入对战界面并滚动播放两人的全部数据对比。</p>
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

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">Open-source card battle</span>
          <h1>詹姆斯 VS 凯尔特人</h1>
          <p>手机上下分屏，电脑左右对战。你永远是詹姆斯，对面从绿军传奇卡池里挑。</p>
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

      <section className="arena">
        <PlayerPanel player={lebronJames} hp={state.jamesHp} side="james" active={activeSide === "james"} />
        <div className="versus-core">
          <span className="vs-token">VS</span>
          <strong>{resultText}</strong>
          <small>Seed {seed}</small>
        </div>
        <PlayerPanel player={opponent} hp={state.opponentHp} side="opponent" active={activeSide === "opponent"} />
      </section>

      <section className="control-bar">
        <ModeSwitch mode={mode} onChange={setMode} />
        <div className="primary-actions">
          <button className="primary-button" type="button" onClick={startBattle}>
            <Play size={18} />
            {mode === "auto" ? "重新自动开战" : state.round === 0 ? "开始手动战" : "重开本局"}
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
        <DataComparisonBoard opponent={opponent} />
        <div className="battle-column">
          {mode === "manual" && (
            <ManualControls metrics={manualMetrics} disabled={state.finished} onResolve={resolveManual} />
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
    </main>
  );
}
