import { useContext, useState, useEffect } from "react";
import { notify } from "../../shared/notify";
import confetti from "canvas-confetti";

import { useRouter } from "next/router";
import HeadTag from "next/head";
import JsonLd from "../../components/seo/JsonLd";

import { UserContext } from "../../shared/UserContext";
import type { UserContextType } from "../../shared/types/user";
import RobotChat from "../../components/RobotChat";
import ModernGameLayout from "../../components/layout/ModernGameLayout";
import WhyCard from "../../components/layout/WhyCard";

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
  { name: "emotional", emoji: "😭", color: "#ff6347" },

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

function ToneMatchGame({ onComplete }: { onComplete: (score: number) => void }) {
  const { setPoints: recordScore } = useContext(UserContext) as UserContextType
  const [selected, setSelected] = useState<Tone | null>(null)
  const [used, setUsed] = useState<Set<Tone>>(new Set())
  const [quizAnswer, setQuizAnswer] = useState<Tone | null>(null)
  const [score, setScore] = useState(0)

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, tone: Tone) {
    e.dataTransfer.setData("text/plain", tone);
  }

  function handleDrop(e: React.DragEvent<HTMLSpanElement>) {
    e.preventDefault();
    const tone = e.dataTransfer.getData("text/plain") as Tone;
    if (tones.includes(tone) && !used.has(tone)) {
      setSelected(tone);
      setUsed(new Set(used).add(tone));
      setScore((s) => s + 20);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLSpanElement>) {
    e.preventDefault();
  }


  useEffect(() => {
    if (used.size >= 3) {
      recordScore('tone', score)
      onComplete(score)
    }
  }, [used, onComplete, score, recordScore])

  return (    <div className="dragdrop-game">
      <h2>Drag a tone into the blank or tap to select</h2>
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
      </p><div className="word-bank">
        {tones.map((tone) => (
          <div
            key={tone}
            draggable
            onDragStart={(e) => handleDragStart(e, tone)}
            className="word"
            aria-label={`Word ${tone}`}
            tabIndex={0}
            onClick={() => {
              if (!used.has(tone)) {
                setSelected(tone)
                setUsed(new Set(used).add(tone))
                setScore((s) => s + 20)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                if (!used.has(tone)) {
                  setSelected(tone)
                  setUsed(new Set(used).add(tone))
                  setScore((s) => s + 20)
                }
              }
            }}
            style={{
              opacity: used.has(tone) ? 0.5 : 1,
              cursor: used.has(tone) ? 'default' : 'pointer',
              userSelect: 'none'
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
                className="btn-primary"
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
  const { user, addBadge } = useContext(UserContext) as UserContextType
  const router = useRouter()
  const [showComplete, setShowComplete] = useState(false)

  function handleComplete(score: number) {
    const earned: string[] = [];
    if (score >= 100 && !user.badges.includes('match-master')) {
      addBadge('match-master')
      earned.push('match-master')
    }
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
    notify(msg);
    setShowComplete(true);
  }

  if (showComplete) {
    return (
      <div className="match3-page">
        <div className="congrats-overlay">
          <div className="congrats-modal" role="dialog" aria-modal="true">
            <img
              src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_46%20PM.png"
              alt="Strawberry calling out sick wrapped in blanket, holding phone with polite sick day message bubble."
              style={{ width: '200px', display: 'block', margin: '0 auto' }}
            />
            <p>Great job matching tones! Ready for a quick quiz?</p>
            <button
              className="btn-primary"
              onClick={() => router.push('/games/quiz')}
              style={{ display: 'block', marginTop: '0.5rem' }}
            >
              Start Quiz
            </button>
            <a
              className="coffee-link"
              href="https://coff.ee/strawberrytech"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', marginTop: '0.5rem' }}
            >
              ☕ Buy me a coffee
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Game',
          name: 'Tone Puzzle',
          description: 'Swap adjectives to see how wording changes the mood and earn points.',
          image:
            'https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_46%20PM.png',
        }}
      />
        <HeadTag>
        <title>Tone Puzzle - StrawberryTech</title>
        <meta property="og:title" content="Tone Puzzle - StrawberryTech" />
        <meta
          property="og:description"
          content="Swap adjectives to see how wording changes the mood and earn points."
        />
        <meta
          property="og:image"
          content="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_46%20PM.png"
        />
        <meta
          property="og:url"
          content="https://strawberry-tech.vercel.app/games/tone"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tone Puzzle - StrawberryTech" />
        <meta
          name="twitter:description"
          content="Swap adjectives to see how wording changes the mood and earn points."
        />
        <meta
          name="twitter:image"
          content="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_46%20PM.png"
        />
          <meta
            name="twitter:url"
            content="https://strawberry-tech.vercel.app/games/tone"
          />        </HeadTag>
      
      <ModernGameLayout
        gameTitle="Tone Master"
        gameIcon="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_46%20PM.png"
        whyCard={
          <WhyCard
            title="Why Tone Matters"
            explanation="The same message can sound completely different depending on the words you choose. In AI prompting, tone controls how the AI responds to you."
            lesson={
              <div>
                <p><strong>Tone in AI prompting affects:</strong></p>
                <ul>
                  <li><strong>Formality:</strong> Professional vs. casual responses</li>
                  <li><strong>Mood:</strong> Enthusiastic vs. neutral delivery</li>
                  <li><strong>Approach:</strong> Direct vs. gentle communication</li>
                  <li><strong>Audience:</strong> Expert vs. beginner explanations</li>
                </ul>
              </div>
            }
            examples={[
              {
                good: "Please explain quantum physics in simple, friendly terms for a curious 12-year-old.",
                bad: "Explain quantum physics."
              }
            ]}
            tip="Experiment with different adjectives to see how they change the feeling of your message. The right tone helps AI give you exactly the style of response you need!"
          />
        }
        nextGameButton={
          <button className="btn-primary" onClick={() => router.push('/games/quiz')}>
            Next: Hallucinations →
          </button>
        }
      >
        <div className="match3-container">
          <img
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_46%20PM.png"
            alt="Strawberry calling out sick wrapped in blanket, holding phone with polite sick day message bubble."
            className="hero-img"
            style={{ width: '200px' }}
          />
          <ToneMatchGame onComplete={handleComplete} />        </div>
          <RobotChat />
      </ModernGameLayout>
    </>
  );
}

export function Head() {
  return (
    <>
      <title>Tone Match Game | StrawberryTech</title>
      <meta
        name="description"
        content="Match adjectives to explore how tone changes a message."
      />
      <link rel="canonical" href="https://strawberry-tech.vercel.app/games/tone" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });
