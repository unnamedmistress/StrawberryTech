import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { toast } from 'react-hot-toast';

const toneFlavors = [
  { type: 'spicy', label: 'urgent', emoji: '🌶️', points: 10 },
  { type: 'sweet', label: 'gentle', emoji: '🍬', points: 5 },
  { type: 'cool', label: 'calm', emoji: '🧊', points: 8 },
  { type: 'zesty', label: 'lively', emoji: '🍋', points: 7 }
];

interface Tile {
  type: string
  label: string
  emoji: string
  points: number
  id: number
}

const generateTile = (id: number): Tile => {
  const flavor = toneFlavors[Math.floor(Math.random() * toneFlavors.length)];
  return { ...flavor, id };
};

const generateGrid = (): Tile[] => {
  const grid: Tile[] = [];
  for (let i = 0; i < 36; i++) {
    grid.push(generateTile(i));
  }
  return grid;
};

const Match3PromptTuner = () => {
  const [grid, setGrid] = useState<Tile[]>(generateGrid());
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const handleClick = (index: number) => {
    if (selected === null) {
      setSelected(index);
    } else {
      const diff = Math.abs(selected - index);
      const isAdjacent = [1, 6].includes(diff) && !(selected % 6 === 5 && index % 6 === 0);
      if (isAdjacent) {
        const newGrid = [...grid];
        [newGrid[selected], newGrid[index]] = [newGrid[index], newGrid[selected]];
        setGrid(newGrid);
        setSelected(null);
        checkMatches(newGrid);
      } else {
        setSelected(null);
      }
    }
  };

  const checkMatches = (grid: Tile[]) => {
    const matchedIndices = new Set<number>();

    // Check rows
    for (let i = 0; i < 36; i += 6) {
      for (let j = i; j < i + 4; j++) {
        if (grid[j].type === grid[j + 1].type && grid[j].type === grid[j + 2].type) {
          matchedIndices.add(j).add(j + 1).add(j + 2);
        }
      }
    }

    // Check columns
    for (let i = 0; i < 18; i++) {
      if (grid[i].type === grid[i + 6].type && grid[i].type === grid[i + 12].type) {
        matchedIndices.add(i).add(i + 6).add(i + 12);
      }
    }

    if (matchedIndices.size > 0) {
      const newGrid = [...grid];
      let points = 0;
      matchedIndices.forEach((i) => {
        points += newGrid[i].points;
        newGrid[i] = generateTile(i);
      });
      toast.success(`Matched! +${points} points`);
      setScore((prev) => prev + points);
      setGrid(newGrid);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🎮 Match3Prompt Tuner</h2>
      <div className="grid grid-cols-6 gap-2">
        {grid.map((tile, index) => (
          <Card
            key={tile.id}
            onClick={() => handleClick(index)}
            className={`cursor-pointer flex items-center justify-center text-2xl h-16 w-16 rounded-2xl ${
              selected === index ? 'border-4 border-blue-500' : 'border'
            }`}
          >
            <CardContent>{tile.emoji}</CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-lg">Score: {score}</p>
    </div>
  );
};

export default Match3PromptTuner;
