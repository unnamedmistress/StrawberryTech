export interface Tile {
  type: string;
  color: string;
  emoji?: string;
  id: number;
}

export interface Flavor {
  name: string;
  emoji: string;
  color: string;
}

export const flavors: Flavor[] = [
  { name: "friendly", emoji: "😀", color: "#ffd700" },
  { name: "professional", emoji: "😐", color: "#3cb371" },
  { name: "casual", emoji: "😎", color: "#8fbc8f" },
  { name: "emotional", emoji: "😭", color: "#ff6347" },
];

export const colors = flavors.map((f) => f.name);
let tileId = 0;

export function createTile(): Tile {
  const flavor = flavors[Math.floor(Math.random() * flavors.length)];
  return {
    type: flavor.name,
    color: flavor.color,
    emoji: flavor.emoji,
    id: tileId++,
  };
}

export function createGrid(): (Tile | null)[] {
  return Array.from({ length: 36 }, () => createTile());
}

export interface MatchResult {
  grid: (Tile | null)[];
  gained: number;
  matchedTypes: string[];
}

export function checkMatches(
  current: (Tile | null)[],
  create: () => Tile = createTile,
): MatchResult {
  const matched = new Set<number>();
  const matchedTypes = new Set<string>();
  // rows
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 6 + c;
      const t = current[idx];
      if (
        t &&
        current[idx + 1]?.type === t.type &&
        current[idx + 2]?.type === t.type
      ) {
        matched.add(idx).add(idx + 1).add(idx + 2);
        if (t) matchedTypes.add(t.type);
      }
    }
  }
  // columns
  for (let c = 0; c < 6; c++) {
    for (let r = 0; r < 4; r++) {
      const idx = r * 6 + c;
      const t = current[idx];
      if (
        t &&
        current[idx + 6]?.type === t.type &&
        current[idx + 12]?.type === t.type
      ) {
        matched.add(idx).add(idx + 6).add(idx + 12);
        if (t) matchedTypes.add(t.type);
      }
    }
  }
  if (matched.size === 0) return { grid: current, gained: 0, matchedTypes: [] };
  const working = [...current];
  matched.forEach((i) => (working[i] = null));
  for (let c = 0; c < 6; c++) {
    for (let r = 5; r >= 0; r--) {
      const idx = r * 6 + c;
      if (working[idx] === null) {
        for (let k = r; k > 0; k--) {
          working[k * 6 + c] = working[(k - 1) * 6 + c];
        }
        working[c] = create();
      }
    }
  }
  const gained = matched.size * 10;
  return { grid: working, gained, matchedTypes: Array.from(matchedTypes) };
}
