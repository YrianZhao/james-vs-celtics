import Peer, { type DataConnection } from "peerjs";
import type { DraftPick } from "../data/types";
import { createShareSeed, hashSeed } from "../game/random";

export type RoomPhase = "lobby" | "draft" | "revealed";

export interface RoomPayload {
  type: "hello" | "state" | "lineup" | "reveal" | "reset";
  roomId: string;
  playerName?: string;
  picks?: DraftPick[];
  seed?: string;
  phase?: RoomPhase;
}

export interface RoomClient {
  peer: Peer;
  connect?: (roomCode: string, password: string) => Promise<DataConnection>;
  waitForGuest?: () => Promise<DataConnection>;
  peerId: string;
  roomCode: string;
  password: string;
  role: "host" | "guest";
}

const peerPrefix = "nba-manager-room";

function normalizeRoom(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

function normalizePassword(value: string) {
  return value.trim().slice(0, 32);
}

export function createRoomCode() {
  return createShareSeed();
}

export function makeRoomPeerId(roomCode: string, password: string) {
  const room = normalizeRoom(roomCode);
  const passHash = hashSeed(normalizePassword(password)).toString(36).toUpperCase();
  return `${peerPrefix}-${room}-${passHash}`;
}

function waitForOpen(peer: Peer) {
  return new Promise<string>((resolve, reject) => {
    peer.on("open", (id) => resolve(id));
    peer.on("error", reject);
  });
}

function waitForConnection(peer: Peer) {
  return new Promise<DataConnection>((resolve, reject) => {
    peer.on("connection", (connection) => {
      connection.on("open", () => resolve(connection));
    });
    peer.on("error", reject);
  });
}

function waitForConnectionOpen(connection: DataConnection) {
  return new Promise<DataConnection>((resolve, reject) => {
    if (connection.open) {
      resolve(connection);
      return;
    }

    connection.on("open", () => resolve(connection));
    connection.on("error", reject);
  });
}

export async function createHostRoom(roomCode: string, password: string): Promise<RoomClient> {
  const normalizedRoom = normalizeRoom(roomCode);
  const normalizedPassword = normalizePassword(password);
  const peerId = makeRoomPeerId(normalizedRoom, normalizedPassword);
  const peer = new Peer(peerId);

  await waitForOpen(peer);

  return {
    peer,
    peerId,
    roomCode: normalizedRoom,
    password: normalizedPassword,
    role: "host",
    waitForGuest: () => waitForConnection(peer)
  };
}

export async function joinRoom(roomCode: string, password: string): Promise<RoomClient> {
  const normalizedRoom = normalizeRoom(roomCode);
  const normalizedPassword = normalizePassword(password);
  const peer = new Peer();
  const hostPeerId = makeRoomPeerId(normalizedRoom, normalizedPassword);

  await waitForOpen(peer);

  return {
    peer,
    peerId: hostPeerId,
    roomCode: normalizedRoom,
    password: normalizedPassword,
    role: "guest",
    connect: async () => waitForConnectionOpen(peer.connect(hostPeerId, { reliable: true }))
  };
}

export function sendRoomPayload(connection: DataConnection | null, payload: RoomPayload) {
  if (connection?.open) {
    connection.send(payload);
  }
}
