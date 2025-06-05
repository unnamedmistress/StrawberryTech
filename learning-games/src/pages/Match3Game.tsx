import { useContext, useState } from 'react'
import Card, { CardContent } from '../components/ui/card'
import { UserContext } from '../context/UserContext'
import { toast } from 'react-hot-toast'

/** Tile element used in the grid */
export interface Tile {
  type: string
  color: string
  id: number
}

const colors = ['red', 'blue', 'green', 'yellow']
let tileId = 0

/** Create a random tile with a unique id */
function createTile(): Tile {
  const type = colors[Math.floor(Math.random() * colors.length)]
  return { type, color: type, id: tileId++ }
}

/** Generate the initial 6x6 grid */
function createGrid(): (Tile | null)[] {
  return Array.from({ length: 36 }, () => createTile())
}

const tips = [
  { range: [12, 14], tips: ['Great start! Keep learning leadership basics.'] },
  { range: [15, 18], tips: ['Remember: teamwork makes the dream work!'] },
]

/**
 * Simple match-3 puzzle. Players swap adjacent tiles to make rows or columns
 * of three or more of the same color. Matches award points and occasionally
 * show an age-based leadership tip.
 */
export default function Match3Game() {
  const { user, addPoints, addBadge } = useContext(UserContext)
  const [grid, setGrid] = useState<(Tile | null)[]>(createGrid())
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(20)

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
    checkMatches(newGrid)
  }

  /**
   * Find matches of 3+ identical tiles and handle scoring/dropping logic.
   * Tiles that are cleared are replaced by the tile above them; new tiles fill
   * the top row.
   */
  function checkMatches(current: (Tile | null)[]) {
    const matched = new Set<number>()

    // rows
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const idx = r * 6 + c
        const t = current[idx]
        if (
          t &&
          current[idx + 1]?.type === t.type &&
          current[idx + 2]?.type === t.type
        ) {
          matched.add(idx).add(idx + 1).add(idx + 2)
        }
      }
    }

    // columns
    for (let c = 0; c < 6; c++) {
      for (let r = 0; r < 4; r++) {
        const idx = r * 6 + c
        const t = current[idx]
        if (
          t &&
          current[idx + 6]?.type === t.type &&
          current[idx + 12]?.type === t.type
        ) {
          matched.add(idx).add(idx + 6).add(idx + 12)
        }
      }
    }

    if (matched.size === 0) return

    // clear matched tiles
    const working = [...current]
    matched.forEach((i) => (working[i] = null))

    // drop tiles
    for (let c = 0; c < 6; c++) {
      for (let r = 5; r >= 0; r--) {
        const idx = r * 6 + c
        if (working[idx] === null) {
          for (let k = r; k > 0; k--) {
            working[k * 6 + c] = working[(k - 1) * 6 + c]
          }
          working[c] = createTile()
        }
      }
    }

    const gained = matched.size * 10
    setScore((s) => s + gained)
    addPoints('match3', gained)
    setGrid(working)
    if (ageTips && Math.random() < 0.3) {
      toast(ageTips[Math.floor(Math.random() * ageTips.length)])
    }
  }

  // Award badge when game ends
  function endGame() {
    if (score >= 100 && !user.badges.includes('Match Master')) {
      addBadge('Match Master')
    }
    toast(`Game over! Final score: ${score}`)
  }

  if (moves === 0) {
    endGame()
  }

  return (
    <div className="match3-container">
      <h2>Match-3 Puzzle</h2>
      <p>Moves Left: {moves}</p>
      <div className="match3-grid">
        {grid.map((tile, i) => (
          <Card
            key={tile?.id ?? i}
            onClick={() => handleClick(i)}
            className={`match3-tile ${selected === i ? 'selected' : ''}`}
            style={{ background: tile?.color || 'transparent' }}
          >
            <CardContent>{tile ? '' : null}</CardContent>
          </Card>
        ))}
      </div>
      <p>Score: {score}</p>
    </div>
  )
}
