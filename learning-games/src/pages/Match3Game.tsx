import { useContext, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { toast } from 'react-hot-toast'

/** Tile element used in the grid */
export interface Tile {
  type: string
  color: string
  emoji?: string
  id: number
}

export interface Flavor {
  name: string
  emoji: string
  color: string
}

export const flavors: Flavor[] = [
  { name: 'spicy', emoji: '🌶️', color: '#ff4500' },
  { name: 'zesty', emoji: '🍋', color: '#ffd700' },
  { name: 'calm', emoji: '🪴', color: '#3cb371' },
  { name: 'fresh', emoji: '🍃', color: '#8fbc8f' },
]

export const colors = flavors.map((f) => f.name)
let tileId = 0

/** Create a random tile with a unique id */
export function createTile(): Tile {
  const flavor = flavors[Math.floor(Math.random() * flavors.length)]
  return {
    type: flavor.name,
    color: flavor.color,
    emoji: flavor.emoji,
    id: tileId++,
  }
}

/** Generate the initial 6x6 grid */
export function createGrid(): (Tile | null)[] {
  return Array.from({ length: 36 }, () => createTile())
}

const tips = [
  { range: [12, 14], tips: ['Great start! Keep learning leadership basics.'] },
  { range: [15, 18], tips: ['Remember: teamwork makes the dream work!'] },
]

export interface MatchResult {
  grid: (Tile | null)[]
  gained: number
  matchedTypes: string[]
}

/**
 * Check for matches in a grid and return the updated grid along with the
 * amount of score gained. The provided `create` function is used to generate
 * new tiles when dropping occurs so tests can supply deterministic tiles.
 */
export function checkMatches(
  current: (Tile | null)[],
  create: () => Tile = createTile
): MatchResult {
  const matched = new Set<number>()
  const matchedTypes = new Set<string>()

  // rows
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 6 + c
      const t = current[idx]
      if (t && current[idx + 1]?.type === t.type && current[idx + 2]?.type === t.type) {
        matched.add(idx).add(idx + 1).add(idx + 2)
        if (t) matchedTypes.add(t.type)
      }
    }
  }

  // columns
  for (let c = 0; c < 6; c++) {
    for (let r = 0; r < 4; r++) {
      const idx = r * 6 + c
      const t = current[idx]
      if (t && current[idx + 6]?.type === t.type && current[idx + 12]?.type === t.type) {
        matched.add(idx).add(idx + 6).add(idx + 12)
        if (t) matchedTypes.add(t.type)
      }
    }
  }

  if (matched.size === 0) return { grid: current, gained: 0, matchedTypes: [] }

  const working = [...current]
  matched.forEach((i) => (working[i] = null))

  for (let c = 0; c < 6; c++) {
    for (let r = 5; r >= 0; r--) {
      const idx = r * 6 + c
      if (working[idx] === null) {
        for (let k = r; k > 0; k--) {
          working[k * 6 + c] = working[(k - 1) * 6 + c]
        }
        working[c] = create()
      }
    }
  }

  const gained = matched.size * 10
  return { grid: working, gained, matchedTypes: Array.from(matchedTypes) }
}

/**
 * Simple match-3 puzzle. Players swap adjacent tiles to make rows or columns
 * of three or more of the same color. Matches award points and occasionally
 * show an age-based leadership tip.
 */
export default function Match3Game() {
  const { user, setScore: saveScore, addBadge } = useContext(UserContext)
  const [grid, setGrid] = useState<(Tile | null)[]>(createGrid())
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(20)
  const [challenge] = useState<Flavor>(
    () => flavors[Math.floor(Math.random() * flavors.length)]
  )
  const navigate = useNavigate()
  const [showInstructions, setShowInstructions] = useState(true)
  const [showEndModal, setShowEndModal] = useState(false)

  // Return tips list for the current age
  const ageTips = tips.find((t) =>
    user.age ? user.age >= t.range[0] && user.age <= t.range[1] : false
  )?.tips

  /** Swap two tiles if they are adjacent */
  function handleClick(index: number) {
    if (moves <= 0) return
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
    setMoves((m) => m - 1)
    applyMatches(newGrid)
  }

  /**
   * Find matches of 3+ identical tiles and handle scoring/dropping logic.
   * Tiles that are cleared are replaced by the tile above them; new tiles fill
   * the top row.
   */
  function applyMatches(current: (Tile | null)[]) {
    const result = checkMatches(current)
    if (result.gained === 0) return
    let gained = result.gained
    if (result.matchedTypes.includes(challenge.name)) {
      gained += 20
      toast(`Tone tip! Matched the ${challenge.name} flavor!`)
    }
    setScore((s) => s + gained)
    setGrid(result.grid)
    if (ageTips && Math.random() < 0.3) {
      toast(ageTips[Math.floor(Math.random() * ageTips.length)])
    }
  }

  // Award badges and store the best score when the game ends
  function endGame() {
    saveScore('match3', score)
    if (score >= 100 && !user.badges.includes('match-master')) {
      addBadge('match-master')
    }
    if (!user.badges.includes('first-match3')) {
      addBadge('first-match3')
    }
    toast(`Game over! Final score: ${score}`)
    setShowEndModal(true)
  }

  useEffect(() => {
    if (moves === 0) {
      endGame()
    }
  }, [moves])

  return (
    <div className="match3-wrapper">
      <div className="match3-container">
        <div className="daily-challenge-banner">
          Daily Flavor Challenge: {challenge.emoji} {challenge.name}
        </div>
        <h2>Match-3 Puzzle</h2>
        <p>Moves Left: {moves}</p>
        <div className="match3-grid">
          {grid.map((tile, i) => (
            <motion.div
              key={tile?.id ?? i}
              onClick={() => handleClick(i)}
              className={`match3-tile ${selected === i ? 'selected' : ''}`}
              style={{ background: tile?.color || 'transparent' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {tile?.emoji}
            </motion.div>
          ))}
        </div>
        <p>Score: {score}</p>
      </div>
      <aside className="match3-sidebar">
        <h3>How to Play</h3>
        <ul>
          <li>Swap tiles to create lines of three matching emojis.</li>
          <li>Match the daily flavor for a 20 point bonus.</li>
          <li>Earn as many points as you can in 20 moves.</li>
        </ul>
      </aside>

      {showInstructions && (
        <div className="match3-modal-overlay">
          <div className="match3-modal">
            <h3>Welcome!</h3>
            <p>
              Swap adjacent tiles to match three or more. Focus on {challenge.emoji}{' '}
              {challenge.name} for bonus points.
            </p>
            <button onClick={() => setShowInstructions(false)}>Start</button>
          </div>
        </div>
      )}

      {showEndModal && (
        <div className="match3-modal-overlay">
          <div className="match3-modal">
            <h3>Game Over</h3>
            <p>Your score: {score}</p>
            <button
              onClick={() => {
                setShowEndModal(false)
                navigate('/games/quiz')
              }}
            >
              Next Game
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
