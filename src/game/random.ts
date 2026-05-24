export function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed: string, step = 0): number {
  let state = hashSeed(`${seed}:${step}`) || 1;
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return ((state >>> 0) % 100000) / 100000;
}

export function pickBySeed<T>(items: T[], seed: string, step = 0): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty list.");
  }
  const index = Math.floor(seededRandom(seed, step) * items.length);
  return items[Math.min(index, items.length - 1)];
}

export function createShareSeed() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
