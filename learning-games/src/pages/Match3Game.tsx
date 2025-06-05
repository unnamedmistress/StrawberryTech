import { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import { UserContext } from "../context/UserContext";
import { BADGES } from "../data/badges";

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
  { name: "spicy", emoji: "🌶️", color: "#ff4500" },
  { name: "zesty", emoji: "🍋", color: "#ffd700" },
  { name: "calm", emoji: "🪴", color: "#3cb371" },
  { name: "fresh", emoji: "🍃", color: "#8fbc8f" },
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

const tips = [
  { range: [12, 14], tips: ["Great start! Keep learning leadership basics."] },
  { range: [15, 18], tips: ["Remember: teamwork makes the dream work!"] },
];

const quotes = [
  "Prompting is like seasoning \u2013 a single word changes the flavor.",
  "Swap words wisely and watch your message sparkle!",
];

const toneWords = [
  { word: "fiery", flavor: "spicy" },
  { word: "zippy", flavor: "zesty" },
  { word: "soothing", flavor: "calm" },
  { word: "crisp", flavor: "fresh" },
];

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

function ToneMatchGame({ onComplete }: { onComplete: () => void }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleDrop(flavor: string, word: string) {
    const correct = toneWords.find((t) => t.word === word)?.flavor === flavor;
    setFeedback(correct ? `Nice! ${word} is ${flavor}.` : `Try again!`);
    if (correct && !completed.includes(word)) {
      setCompleted((c) => [...c, word]);
    }
  }

  useEffect(() => {
    if (completed.length === toneWords.length) {
      onComplete();
    }
  }, [completed, onComplete]);

  return (
    <div>
      <h3>Drag the words to match the emoji</h3>
      <div className="drag-container">
        <div className="drag-words">
          {toneWords
            .filter((w) => !completed.includes(w.word))
            .map((w) => (
              <div
                key={w.word}
                className="drag-word"
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("text/plain", w.word)
                }
              >
                {w.word}
              </div>
            ))}
        </div>
        <div className="drop-zones">
          {flavors.map((f) => (
            <div
              key={f.name}
              className="drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const word = e.dataTransfer.getData("text/plain");
                handleDrop(f.name, word);
              }}
            >
              <span role="img" aria-label={f.name}>
                {f.emoji}
              </span>
            </div>
          ))}
        </div>
      </div>
      {feedback && <p>{feedback}</p>}
    </div>
  );
}

/**
 * Simple match-3 puzzle. Players swap adjacent tiles to make rows or columns
 * of three or more of the same color. Matches award points and occasionally
 * show an age-based leadership tip.
 */
export default function Match3Game() {
  const { user, addBadge } = useContext(UserContext);
  const navigate = useNavigate();
  const [sidebarQuote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)],
  );
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [showEndModal, setShowEndModal] = useState(false);

  function handleComplete() {
    const earned: string[] = [];
    if (!user.badges.includes("first-match3")) {
      addBadge("first-match3");
      earned.push("first-match3");
    }
    setNewBadges(earned);
    setShowEndModal(true);
  }

  return (
    <div className="match3-wrapper">
      <div className="match3-container">
        <ToneMatchGame onComplete={handleComplete} />
      </div>
      <aside className="match3-sidebar">
        <h3>Why Tone Matters</h3>
        <p>Drag the adjectives to the emoji that best matches their vibe.</p>
        <blockquote className="sidebar-quote">{sidebarQuote}</blockquote>
      </aside>

      {showEndModal && (
        <div className="match3-modal-overlay">
          <div className="match3-modal">
            <h3>Great job!</h3>
            <p>You matched all the words.</p>
            {newBadges.length > 0 && (
              <div className="badge-rewards">
                {newBadges.map((id) => {
                  const badge = BADGES.find((b) => b.id === id);
                  return (
                    <motion.div
                      key={id}
                      className="badge-icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260 }}
                    >
                      <span role="img" aria-label="badge">
                        🏅
                      </span>
                      <div>{badge?.name ?? id}</div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => {
                setShowEndModal(false);
                navigate("/games/quiz");
              }}
            >
              Next Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
