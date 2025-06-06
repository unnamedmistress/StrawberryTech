import { useContext, useState } from "react";


import { UserContext } from "../context/UserContext";
import RobotChat from "../components/RobotChat";

/** Tile element used in the grid */
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

];

export const colors = flavors.map((f) => f.name);
let tileId = 0;

/** Create a random tile with a unique id */
export function createTile(): Tile {
  const flavor = flavors[Math.floor(Math.random() * flavors.length)];
  return {
    type: flavor.name,
    color: flavor.color,
    emoji: flavor.emoji,
    id: tileId++,
  };
}

/** Generate the initial 6x6 grid */
export function createGrid(): (Tile | null)[] {
  return Array.from({ length: 36 }, () => createTile());
}


const quotes = [
  "Prompting is like seasoning \u2013 a single word changes the flavor.",
  "Swap words wisely and watch your message sparkle!",
];

const tips = [
  "Tip: Swap one adjective to completely change the vibe.",
  "Use synonyms to experiment with different tones!",
];

const tones = [
  "Polite",
  "Casual",
  "Emotional",
  "Angry",
  "Compelling",
  "Persuasive",
] as const;

type Tone = (typeof tones)[number];

const examples: Record<Tone, string> = {
  Polite:
    "Hi, I'm not feeling well and need to take a sick day. Thank you for understanding.",
  Casual: "Hey, I'm sick today so I'm gonna stay home.",
  Emotional:
    "I'm really sorry but I'm quite sick and can't make it in today. I feel awful about letting the team down.",
  Angry:
    "I'm sick and won't be in. I'm frustrated that I'm always pushing myself.",
  Compelling:
    "I'm sick today and staying home so I don't spread it. I'll make sure everything's covered.",
  Persuasive:
    "Would it be alright if I took a sick day today? Resting now will let me get back to 100% quicker.",
};


export interface MatchResult {
  grid: (Tile | null)[];
  gained: number;
  matchedTypes: string[];
}

/**
 * Check for matches in a grid and return the updated grid along with the
 * amount of score gained. The provided `create` function is used to generate
 * new tiles when dropping occurs so tests can supply deterministic tiles.
 */
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
        matched
          .add(idx)
          .add(idx + 1)
          .add(idx + 2);
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
        matched
          .add(idx)
          .add(idx + 6)
          .add(idx + 12);
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

/**
 * Simple match-3 puzzle. Players swap adjacent tiles to make rows or columns
 * of three or more of the same color. Matches award points and occasionally
 * show an age-based leadership tip.
 */
export default function Match3Game() {
  const { setScore: saveScore } = useContext(UserContext)
  const [grid, setGrid] = useState<(Tile | null)[]>(createGrid())
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const [sidebarQuote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)],
  )
  const [sidebarTip] = useState(
    () =>
      tips[Math.floor(Math.random() * tips.length)],
  )
  function handleClick(index: number) {
    if (selected === null) {
      setSelected(index)
      return
    }
    const diff = Math.abs(selected - index)
    const adjacent = [1, 6].includes(diff) && !(selected % 6 === 5 && index % 6 === 0)
    if (!adjacent) {
      setSelected(null)
      return
    }
    const newGrid = [...grid]
    ;[newGrid[selected], newGrid[index]] = [newGrid[index], newGrid[selected]]
    setGrid(newGrid)
    setSelected(null)
    applyMatches(newGrid)
  }

  function applyMatches(current: (Tile | null)[]) {
    const result = checkMatches(current)
    if (result.gained === 0) return
    setScore((s) => {
      const newScore = s + result.gained
      saveScore('match3', newScore)
      return newScore
    })
    setGrid(result.grid)
  }

  return (
    <div className="match3-wrapper">
      <div className="match3-container">
        <div className="match3-grid">
          {grid.map((tile, i) => (
            <div
              key={tile?.id ?? i}
              onClick={() => handleClick(i)}
              className={`match3-tile ${selected === i ? 'selected' : ''}`}
              style={{ background: tile?.color || 'transparent' }}
            >
              {tile?.emoji}
            </div>
          ))}
        </div>
        <p>Score: {score}</p>
      </div>
      <aside className="match3-sidebar">
        <h3>Why Tone Matters</h3>
        <p>Drag the adjectives into the blank to try different tones.</p>
        <blockquote className="sidebar-quote">{sidebarQuote}</blockquote>
        <p className="sidebar-tip">{sidebarTip}</p>
      </aside>

      <RobotChat />
    </div>
  );
}
