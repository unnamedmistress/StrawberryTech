import { describe, it, expect } from 'vitest'
import {
  createTile,
  createGrid,
  checkMatches,
  colors,
  type Tile,
} from '../match3Helpers'

function stubTileFactory() {
  let id = 1000
  return () => ({ type: 'stub', color: 'stub', id: id++ })
}

describe('createTile', () => {
  it('returns a tile with valid color and unique id', () => {
    const t1 = createTile()
    const t2 = createTile()
    expect(colors).toContain(t1.type)
    expect(colors).toContain(t2.type)
    expect(t1.id).not.toBe(t2.id)
  })
})

describe('createGrid', () => {
  it('creates a 6x6 grid', () => {
    const grid = createGrid()
    expect(grid.length).toBe(36)
    expect(grid.every((t) => t !== null)).toBe(true)
  })
})

function patternGrid(): Tile[] {
  const grid: Tile[] = []
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const idx = r * 6 + c
      const type = colors[(c + r) % colors.length]
      grid.push({ type, color: type, id: idx })
    }
  }
  return grid
}

describe('checkMatches', () => {
  it('returns zero gained when no matches exist', () => {
    const grid = patternGrid()
    const result = checkMatches(grid, stubTileFactory())
    expect(result.gained).toBe(0)
    expect(result.grid).toEqual(grid)
  })

  it('clears matched tiles and reports gained score', () => {
    const grid = patternGrid()
    grid[0] = { type: colors[0], color: colors[0], id: 999 }
    grid[1] = { type: colors[0], color: colors[0], id: 1000 }
    grid[2] = { type: colors[0], color: colors[0], id: 1001 }
    grid[3] = { type: colors[1], color: colors[1], id: 1002 }
    const result = checkMatches(grid, stubTileFactory())
    expect(result.gained).toBe(30)
    expect(result.grid.length).toBe(36)
  })

  it('awards points for multiple matches', () => {
    const grid = patternGrid()
    grid[0] = { type: colors[0], color: colors[0], id: 999 }
    grid[1] = { type: colors[0], color: colors[0], id: 1000 }
    grid[2] = { type: colors[0], color: colors[0], id: 1001 }
    grid[3] = { type: colors[1], color: colors[1], id: 1002 }
    grid[6] = { type: colors[1], color: colors[1], id: 1003 }
    grid[7] = { type: colors[1], color: colors[1], id: 1004 }
    grid[8] = { type: colors[1], color: colors[1], id: 1005 }
    grid[9] = { type: colors[2], color: colors[2], id: 1006 }
    const result = checkMatches(grid, stubTileFactory())
    expect(result.gained).toBe(60)
    expect(result.grid.length).toBe(36)
  })
})
