import { useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";

import { useNavigate, Link } from "react-router-dom";

import { UserContext } from "../shared/UserContext";
import type { UserContextType } from "../shared/types/user";
import RobotChat from "../components/RobotChat";
import InstructionBanner from "../components/ui/InstructionBanner";
import WhyCard from "../components/layout/WhyCard";

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



function ToneMatchGame({ onComplete }: { onComplete: (score: number) => void }) {
  const { setPoints: recordScore } = useContext(UserContext) as UserContextType
  const [selected, setSelected] = useState<Tone | null>(null)
  const [used, setUsed] = useState<Set<Tone>>(new Set())
  const [quizAnswer, setQuizAnswer] = useState<Tone | null>(null)
  const [points, setPoints] = useState(0)

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, tone: Tone) {
    e.dataTransfer.setData("text/plain", tone);
  }

  function handleDrop(e: React.DragEvent<HTMLSpanElement>) {
    e.preventDefault();
    const tone = e.dataTransfer.getData("text/plain") as Tone;
    if (tones.includes(tone) && !used.has(tone)) {
      setSelected(tone);
      setUsed(new Set(used).add(tone));
      setPoints((s) => s + 20);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLSpanElement>) {
    e.preventDefault();
  }

  useEffect(() => {
    if (used.size >= 3) {
      recordScore('tone', points)
      onComplete(points)
    }
  }, [used, onComplete, points, recordScore])

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
  const navigate = useNavigate()
  const [sidebarQuote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)],
  )
  const [sidebarTip] = useState(
    () =>
      tips[Math.floor(Math.random() * tips.length)],
  )
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
    toast.success(msg);
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
              onClick={() => navigate('/games/quiz')}
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
    <div className="match3-page">
      <InstructionBanner>
        Match adjectives to explore how tone changes the meaning of a message.
      </InstructionBanner>
      <div className="match3-wrapper">
        <WhyCard
          className="match3-sidebar"
          title="Why Tone Matters"
          explanation="Drag the adjectives into the blank to try different tones."
          quote={sidebarQuote}
          tip={sidebarTip}
        />
        <div className="match3-container">
          <img
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_47_46%20PM.png"
            alt="Strawberry calling out sick wrapped in blanket, holding phone with polite sick day message bubble."
            className="hero-img"
            style={{ width: '200px' }}
          />
          <ToneMatchGame onComplete={handleComplete} />
        </div>
      </div>
      <RobotChat />
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button className="btn-primary" onClick={() => navigate('/games/quiz')}>Next Lesson</button>

      </p>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/leaderboard">Return to Progress</Link>
      </p>
    </div>
  );
}
