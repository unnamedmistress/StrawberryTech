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
    "Hey, I'm sorry but something came up and I need to cancel. Hope we can reschedule soon!",
  Casual:
    "Yo, gotta bail on our plans—something popped up. Let's hang later!",
  Emotional:
    "I hate to do this but I really can't make it tonight. I'm disappointed and hope you understand.",
  Angry: "Look, I'm cancelling. Too much going on and I'm frustrated.",
  Compelling:
    "I have to cancel because I got an important commitment I can't miss. Thanks for understanding!",
  Persuasive:
    "Would you mind if we postponed? I think meeting later will be much better for both of us.",
};

const toneWords = [

  { word: "critical", flavor: "spicy" },
  { word: "friendly", flavor: "zesty" },
  { word: "cheerful", flavor: "zesty" },
  { word: "professional", flavor: "calm" },
  { word: "polite", flavor: "calm" },
  { word: "casual", flavor: "fresh" },
  { word: "relaxed", flavor: "fresh" },
];

const flavorAdjective: Record<string, string> = {
  spicy: "intense",
  zesty: "upbeat",
  calm: "gentle",
  fresh: "casual",
};

const toneExamples: Record<string, string> = {
  spicy: "Please handle this right away.",
  zesty: "You've got this! Let's make it fun today \u{1F389}",
  calm: "Thank you for your patience while we sort this out.",
  fresh: "No rush\u2014whenever you're ready works for me.",


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

function ToneMatchGame({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<Tone | null>(null);
  const [used, setUsed] = useState<Set<Tone>>(new Set());
  const [quizAnswer, setQuizAnswer] = useState<Tone | null>(null);
  const [userMessage, setUserMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, tone: Tone) {
    e.dataTransfer.setData("text/plain", tone);
  }

  function handleDrop(e: React.DragEvent<HTMLSpanElement>) {
    e.preventDefault();
    const tone = e.dataTransfer.getData("text/plain") as Tone;
    if (tones.includes(tone)) {
      setSelected(tone);
      setUsed(new Set(used).add(tone));
      setUserMessage("");
      setSubmitted(false);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLSpanElement>) {
    e.preventDefault();
  }

  function handleSubmit() {
    if (userMessage.trim()) {
      setSubmitted(true);
    }
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
        >
          {selected ? ` ${selected} ` : " ____ "}
        </span>
        short text to cancel my plans with a friend.
      </p>
      <div className="word-bank">
        {tones.map((tone) => (
          <div
            key={tone}
            draggable
            onDragStart={(e) => handleDragStart(e, tone)}
            className="word"
          >
            {tone}
          </div>
        ))}
      </div>
      {selected && (
        <div className="response">
          <h3>AI Response</h3>
          <p>{examples[selected]}</p>
          {!submitted && (
            <div className="message-input">
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button onClick={handleSubmit} disabled={!userMessage.trim()}>
                Submit Message
              </button>
            </div>
          )}
          {submitted && (
            <p className="user-message">You wrote: {userMessage}</p>
          )}
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
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [showEndModal, setShowEndModal] = useState(false);

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
        <p>Drag the adjectives into the blank to try different tones.</p>
        <blockquote className="sidebar-quote">{sidebarQuote}</blockquote>
        <p className="sidebar-tip">{sidebarTip}</p>
      </aside>

      {showEndModal && (
        <div className="match3-modal-overlay">
          <div className="match3-modal">
            <h3>Great job!</h3>
            <p>You matched all the words.</p>
            <p>You've earned the Tone Tactician badge!</p>
            <div className="flashcard">
              <strong>Why Tone Matters</strong>
              <p>Changing one adjective = a whole new vibe. Tone tells the AI how to speak, not just what to say.</p>
            </div>
            {newBadges.length > 0 && (
              <div className="badge-rewards">
                {newBadges.map((id) => {
                  const badge = BADGES.find((b) => b.id === id);
                  return (
                    <motion.div
                      key={id}
                      className="badge-icon"
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
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
