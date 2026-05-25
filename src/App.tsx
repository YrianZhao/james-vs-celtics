import { useMemo, useState } from "react";
import type { DataConnection } from "peerjs";
import {
  Clipboard,
  Crown,
  Dice5,
  KeyRound,
  Link2,
  Play,
  RefreshCcw,
  Search,
  ShieldCheck,
  Swords,
  Users
} from "lucide-react";
import { getManagerPlayerDisplayName, managerPlayers } from "./data/managerPlayers";
import type { DraftPick, ManagerMatchupResult, ManagerPlayer } from "./data/types";
import { createShareSeed } from "./game/random";
import { buildRandomLineup, isCompleteLineup, resolveLineup, resolveManagerMatchup } from "./game/managerMatch";
import {
  createHostRoom,
  createRoomCode,
  joinRoom,
  sendRoomPayload,
  type RoomClient,
  type RoomPayload,
  type RoomPhase
} from "./net/room";
import { dataSnapshotDate } from "./data/sources";

type LocalSide = "host" | "guest" | "solo";

const abilityLabels = {
  offense: "进攻",
  defense: "防守",
  playmaking: "组织",
  rebounding: "篮板",
  athleticism: "运动",
  clutch: "关键",
  aura: "气场"
} as const;

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[·.'’\-\s]/g, "");
}

function pickNames(picks: DraftPick[]) {
  return picks
    .map((pick) => managerPlayers.find((player) => player.id === pick.playerId))
    .filter((player): player is ManagerPlayer => Boolean(player))
    .map((player) => getManagerPlayerDisplayName(player));
}

function PlayerCardButton({
  player,
  picked,
  disabled,
  onPick
}: {
  player: ManagerPlayer;
  picked: boolean;
  disabled: boolean;
  onPick: (player: ManagerPlayer) => void;
}) {
  const primeEra = player.eras[1] ?? player.eras[0];
  const average =
    Math.round(
      (primeEra.offense +
        primeEra.defense +
        primeEra.playmaking +
        primeEra.rebounding +
        primeEra.athleticism +
        primeEra.clutch +
        primeEra.aura) /
        7
    );

  return (
    <button className={`manager-player-card ${picked ? "picked" : ""}`} disabled={disabled} onClick={() => onPick(player)} type="button">
      <span>#{player.debateRank}</span>
      <strong>{getManagerPlayerDisplayName(player)}</strong>
      <small>
        {player.position} · {player.summaryTags[0]}
      </small>
      <em>{average}</em>
    </button>
  );
}

function LineupPanel({
  title,
  picks,
  active,
  canRemove,
  onRemove
}: {
  title: string;
  picks: DraftPick[];
  active?: boolean;
  canRemove?: boolean;
  onRemove?: (playerId: string) => void;
}) {
  const names = pickNames(picks);

  return (
    <section className={`lineup-panel ${active ? "active" : ""}`}>
      <div className="section-title compact">
        <div>
          <span>Lineup</span>
          <h3>{title}</h3>
        </div>
        <Users size={20} />
      </div>
      <div className="lineup-slots">
        {Array.from({ length: 5 }).map((_, index) => {
          const pick = picks[index];
          const player = pick ? managerPlayers.find((item) => item.id === pick.playerId) : null;
          return (
            <div className="lineup-slot" key={`${title}-${index}`}>
              <span>{index + 1}</span>
              {player ? (
                <>
                  <strong>{getManagerPlayerDisplayName(player)}</strong>
                  <small>{player.position}</small>
                  {canRemove && (
                    <button type="button" onClick={() => onRemove?.(player.id)} aria-label={`移除 ${getManagerPlayerDisplayName(player)}`}>
                      ×
                    </button>
                  )}
                </>
              ) : (
                <em>等待选择</em>
              )}
            </div>
          );
        })}
      </div>
      <p>{names.length > 0 ? names.join(" / ") : "还没有球员入队"}</p>
    </section>
  );
}

function MatchResultView({ result, localSide }: { result: ManagerMatchupResult; localSide: LocalSide }) {
  const leftTitle = localSide === "guest" ? "房主阵容" : "你的阵容";
  const rightTitle = localSide === "guest" ? "你的阵容" : "对手阵容";
  const winnerText =
    result.winner === "tie" ? "双方打平" : result.winner === "left" ? `${leftTitle} 胜出` : `${rightTitle} 胜出`;

  return (
    <section className="match-result">
      <div className="result-banner">
        <span>随机时期已揭晓</span>
        <h2>{winnerText}</h2>
        <p>
          {leftTitle} {result.left.total} 分，{rightTitle} {result.right.total} 分。每名球员随机抽取一个生涯时期，再按本回合重点能力结算。
        </p>
      </div>
      <div className="manager-rounds">
        {result.rounds.map((round) => (
          <article className={`manager-round ${round.winner}`} key={round.slot}>
            <div>
              <span>R{round.slot}</span>
              <strong>{abilityLabels[round.focus as keyof typeof abilityLabels]}</strong>
            </div>
            <div className="duel-row">
              <section>
                <small>{getManagerPlayerDisplayName(round.left.player)}</small>
                <b>{round.left.era.label}</b>
                <em>{round.leftScore}</em>
              </section>
              <Swords size={20} />
              <section>
                <small>{getManagerPlayerDisplayName(round.right.player)}</small>
                <b>{round.right.era.label}</b>
                <em>{round.rightScore}</em>
              </section>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [mode, setMode] = useState<LocalSide>("solo");
  const [roomCode, setRoomCode] = useState(createRoomCode());
  const [password, setPassword] = useState("");
  const [roomClient, setRoomClient] = useState<RoomClient | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("单机试玩");
  const [phase, setPhase] = useState<RoomPhase>("draft");
  const [seed, setSeed] = useState(createShareSeed());
  const [myPicks, setMyPicks] = useState<DraftPick[]>([]);
  const [remotePicks, setRemotePicks] = useState<DraftPick[]>([]);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<ManagerMatchupResult | null>(null);
  const [copyState, setCopyState] = useState("复制房间信息");

  const filteredPlayers = useMemo(() => {
    const normalized = normalizeSearch(search);
    return managerPlayers
      .filter((player) => {
        if (!normalized) return true;
        const terms = [player.name, getManagerPlayerDisplayName(player), ...(player.aliases ?? []), player.position].map(normalizeSearch);
        return terms.some((term) => term.includes(normalized));
      })
      .slice(0, 300);
  }, [search]);

  const myComplete = isCompleteLineup(myPicks);
  const remoteComplete = isCompleteLineup(remotePicks);
  const localResolved = useMemo(() => resolveLineup(myPicks, seed, mode === "guest" ? "right" : "left"), [mode, myPicks, seed]);

  const attachConnection = (nextConnection: DataConnection, role: LocalSide, activeSeed: string) => {
    setConnection(nextConnection);
    setConnectionStatus(role === "host" ? "客人已连接" : "已加入房间");
    nextConnection.on("data", (data) => {
      const payload = data as RoomPayload;
      if (payload.type === "hello") {
        sendRoomPayload(nextConnection, {
          type: "state",
          roomId: roomCode,
          picks: myPicks,
          seed: activeSeed,
          phase
        });
      }
      if (payload.type === "state") {
        setRemotePicks(payload.picks ?? []);
        setSeed(payload.seed ?? activeSeed);
        setPhase(payload.phase ?? "draft");
      }
      if (payload.type === "lineup") {
        setRemotePicks(payload.picks ?? []);
      }
      if (payload.type === "reveal") {
        const nextSeed = payload.seed ?? activeSeed;
        setSeed(nextSeed);
        setRemotePicks(payload.picks ?? []);
        setPhase("revealed");
        setResult(resolveManagerMatchup(role === "guest" ? payload.picks ?? [] : myPicks, role === "guest" ? myPicks : payload.picks ?? [], nextSeed));
      }
      if (payload.type === "reset") {
        setPhase("draft");
        setResult(null);
        setRemotePicks([]);
      }
    });
    nextConnection.on("close", () => setConnectionStatus("连接已断开"));
  };

  const createRoom = async () => {
    try {
      setConnectionStatus("创建房间中...");
      const client = await createHostRoom(roomCode, password || "manager");
      setRoomClient(client);
      setMode("host");
      setConnectionStatus("等待对手加入");
      client
        .waitForGuest?.()
        .then((nextConnection) => {
          attachConnection(nextConnection, "host", seed);
          sendRoomPayload(nextConnection, { type: "state", roomId: client.roomCode, picks: myPicks, seed, phase });
        })
        .catch(() => setConnectionStatus("等待连接失败，请重试"));
    } catch {
      setConnectionStatus("房间创建失败，换个房间号试试");
    }
  };

  const joinExistingRoom = async () => {
    try {
      setConnectionStatus("加入房间中...");
      const client = await joinRoom(roomCode, password || "manager");
      setRoomClient(client);
      setMode("guest");
      const nextConnection = await client.connect?.(roomCode, password || "manager");
      if (nextConnection) {
        attachConnection(nextConnection, "guest", seed);
        sendRoomPayload(nextConnection, { type: "hello", roomId: client.roomCode, picks: myPicks, seed, phase });
      }
    } catch {
      setConnectionStatus("加入失败，请检查房间号和密码");
    }
  };

  const syncLineup = (nextPicks: DraftPick[]) => {
    sendRoomPayload(connection, { type: "lineup", roomId: roomCode, picks: nextPicks, seed, phase });
  };

  const pickPlayer = (player: ManagerPlayer) => {
    if (myPicks.some((pick) => pick.playerId === player.id) || myPicks.length >= 5 || phase === "revealed") return;
    const nextPicks = [...myPicks, { playerId: player.id }];
    setMyPicks(nextPicks);
    syncLineup(nextPicks);
  };

  const removePlayer = (playerId: string) => {
    const nextPicks = myPicks.filter((pick) => pick.playerId !== playerId);
    setMyPicks(nextPicks);
    syncLineup(nextPicks);
  };

  const fillRandom = () => {
    const nextPicks = buildRandomLineup(createShareSeed(), mode === "guest" ? "right" : "left");
    setMyPicks(nextPicks);
    syncLineup(nextPicks);
  };

  const revealMatch = () => {
    const nextSeed = createShareSeed();
    setSeed(nextSeed);
    setPhase("revealed");
    const left = mode === "guest" ? remotePicks : myPicks;
    const soloOpponent = mode === "solo" && !remotePicks.length ? buildRandomLineup(nextSeed, "right") : remotePicks;
    const right = mode === "guest" ? myPicks : soloOpponent;
    if (mode === "solo") {
      setRemotePicks(soloOpponent);
    }
    const nextResult = resolveManagerMatchup(left, right, nextSeed);
    setResult(nextResult);
    sendRoomPayload(connection, { type: "reveal", roomId: roomCode, picks: myPicks, seed: nextSeed, phase: "revealed" });
  };

  const resetDraft = () => {
    setPhase("draft");
    setResult(null);
    setRemotePicks([]);
    sendRoomPayload(connection, { type: "reset", roomId: roomCode, seed, phase: "draft" });
  };

  const copyRoom = async () => {
    await navigator.clipboard.writeText(`房间号：${roomCode}\n密码：${password || "manager"}\n网址：${window.location.href}`);
    setCopyState("已复制");
    window.setTimeout(() => setCopyState("复制房间信息"), 1400);
  };

  return (
    <main className="manager-shell">
      <header className="manager-header">
        <div>
          <span>NBA Manager Duel</span>
          <h1>球队经理线上对抗</h1>
          <p>用房间号和密码开局。双方各选五名球星，系统随机抽取每名球员的生涯时期，再按五个回合互相比拼。</p>
        </div>
        <div className="manager-status">
          <ShieldCheck size={18} />
          {connectionStatus}
        </div>
      </header>

      <section className="room-panel">
        <label>
          <span>房间号</span>
          <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} />
        </label>
        <label>
          <span>密码</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="默认 manager" type="password" />
        </label>
        <button className="primary-button" type="button" onClick={createRoom}>
          <KeyRound size={18} />
          创建房间
        </button>
        <button className="secondary-button" type="button" onClick={joinExistingRoom}>
          <Link2 size={18} />
          加入房间
        </button>
        <button className="secondary-button" type="button" onClick={copyRoom}>
          <Clipboard size={18} />
          {copyState}
        </button>
      </section>

      <section className="manager-grid">
        <div className="draft-column">
          <section className="draft-tools">
            <label>
              <Search size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索 300 人球星池：姚明 / Kobe / Curry..." />
            </label>
            <button className="secondary-button" type="button" onClick={fillRandom}>
              <Dice5 size={18} />
              随机五人
            </button>
          </section>

          <section className="player-library">
            {filteredPlayers.map((player) => (
              <PlayerCardButton
                key={player.id}
                player={player}
                picked={myPicks.some((pick) => pick.playerId === player.id)}
                disabled={myPicks.length >= 5 || phase === "revealed"}
                onPick={pickPlayer}
              />
            ))}
          </section>
        </div>

        <aside className="manager-side">
          <LineupPanel title="你的五人阵容" picks={myPicks} active canRemove={phase !== "revealed"} onRemove={removePlayer} />
          <LineupPanel title={mode === "solo" ? "电脑/对手阵容" : "线上对手阵容"} picks={remotePicks} />

          <section className="lineup-summary">
            <div>
              <span>当前均值</span>
              <strong>{localResolved.average}</strong>
            </div>
            <div>
              <span>球星池</span>
              <strong>{managerPlayers.length}</strong>
            </div>
            <div>
              <span>快照</span>
              <strong>{dataSnapshotDate}</strong>
            </div>
          </section>

          <div className="manager-actions">
            <button className="primary-button" type="button" disabled={!myComplete || (mode !== "solo" && !remoteComplete)} onClick={revealMatch}>
              <Play size={18} />
              开始五回合
            </button>
            <button className="secondary-button" type="button" onClick={resetDraft}>
              <RefreshCcw size={18} />
              重选阵容
            </button>
          </div>
        </aside>
      </section>

      {result && <MatchResultView result={result} localSide={mode} />}

      <footer className="app-footer manager-footer">
        <span>300 人争议球星池为游戏化静态快照，时期能力用于娱乐模拟。</span>
        <span>
          <Crown size={16} /> Peer-to-peer 房间，无账号登录。
        </span>
      </footer>
    </main>
  );
}
