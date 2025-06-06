import { useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";

import { useNavigate, Link } from "react-router-dom";

import { UserContext } from "../context/UserContext";
import RobotChat from "../components/RobotChat";
import InstructionBanner from "../components/ui/InstructionBanner";

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

  return {
    grid: working,
    gained: matched.size * 10,
    matchedTypes: Array.from(matchedTypes),
  };
}

/**
 * ToneMatchGame: the drag-and-drop tone mini-game
 */
function ToneMatchGame({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<Tone | null>(null);
  const [used, setUsed] = useState<Set<Tone>>(new Set());
  const [quizAnswer, setQuizAnswer] = useState<Tone | null>(null);

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, tone: Tone) {
    e.dataTransfer.setData("text/plain", tone);
  }

  function handleDrop(e: React.DragEvent<HTMLSpanElement>) {
    e.preventDefault();
    const tone = e.dataTransfer.getData("text/plain") as Tone;
    if (tones.includes(tone)) {
      setSelected(tone);
      setUsed(new Set(used).add(tone));
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLSpanElement>) {
    e.preventDefault();
  }

  useEffect(() => {
    if (used.size === tones.length) {
      onComplete();
    }
  }, [used, onComplete]);

  return (
    <div className="dragdrop-game">
      <h2>Drag a tone into the blank</h2>
      <p className="sentence">
        Write a
        <span
          className="drop-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          aria-label="Drop tone here"
        >
          {selected ? ` ${selected} ` : " ____ "}
        </span>
        short text to call out of work sick today.
      </p>
      <div className="word-bank">
        {tones.map((tone) => (
          <div
            key={tone}
            draggable
            onDragStart={(e) => handleDragStart(e, tone)}
            className="word"
            aria-label={`Word ${tone}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSelected(tone)
                setUsed(new Set(used).add(tone))
              }
            }}
          >
            {tone}
          </div>
        ))}
      </div>
      {selected && (
        <div className="response">
          <h3>AI Response</h3>
          <p>{examples[selected]}</p>
        </div>
      )}
      {used.size === tones.length && (
        <div className="quiz">
          <h3>Quick test</h3>
          <p>
            What tone should you use when writing a message to your boss that you
            will be out of work sick today?
          </p>
          <div className="options">
            {tones.map((tone) => (
              <button
                key={tone}
                onClick={() => setQuizAnswer(tone)}
                disabled={!!quizAnswer}
              >
                {tone}
              </button>
            ))}
          </div>
          {quizAnswer && (
            <p className="feedback">
              {quizAnswer === "Polite"
                ? "Correct! A polite tone is best for informing your boss."
                : "Not quite. A polite tone is usually most appropriate."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Simple match-3 puzzle. Players swap adjacent tiles to make rows or columns
 * of three or more of the same color. Matches award points and occasionally
 * show an age-based leadership tip.
 */
export default function Match3Game() {
  const { user, addBadge } = useContext(UserContext)
  const navigate = useNavigate()
  const [sidebarQuote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)],
  )
  const [sidebarTip] = useState(
    () =>
      tips[Math.floor(Math.random() * tips.length)],
  )

  function handleComplete() {
    const earned: string[] = [];
    if (!user.badges.includes("first-match3")) {
      addBadge("first-match3");
      earned.push("first-match3");
    }
    if (!user.badges.includes("tone-whiz")) {
      addBadge("tone-whiz");
      earned.push("tone-whiz");
    }
    const msg = earned.length
      ? `Great job! Earned ${earned.length} badge${earned.length > 1 ? 's' : ''}.`
      : 'Great job!';
    if (earned.length > 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    toast.success(`${msg} Moving on to the quiz.`);
    navigate("/games/quiz");
  }

  return (
    <div className="match3-page">
      <InstructionBanner>
        Match adjectives to explore how tone changes the meaning of a message.
      </InstructionBanner>
      <div className="match3-wrapper">
        <div className="match3-container">
          <ToneMatchGame onComplete={handleComplete} />
        </div>
        <aside className="match3-sidebar">
          <h3>Why Tone Matters</h3>
          <p>Drag the adjectives into the blank to try different tones.</p>
          <blockquote className="sidebar-quote">{sidebarQuote}</blockquote>
          <p className="sidebar-tip">{sidebarTip}</p>
        </aside>
      </div>
      <RobotChat />
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  );
}
