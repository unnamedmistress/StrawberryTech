# StrawberryTech Learning Games

StrawberryTech is a collection of small web games built with **React**, **TypeScript** and **Vite**. Each game adapts content based on the player's age (12‑18) which is stored locally so progress persists between sessions.

## Mini Games

### Match‑3 Puzzle
Swap adjacent tiles to make rows or columns of three. Matches award points and may show leadership tips that vary by age group. Scores and badges are saved for later.

### Quiz Game
A short multiple‑choice quiz (implementation in progress) that will scale question difficulty according to the player's age.

### Drag & Drop
A drag‑and‑drop sorting challenge (coming soon). Planned age adaptations include increasing the number of items for older players.

## Age‑Adaptive Features
- Players enter an age between **12–18** on first visit.
- Games read the stored age to tweak difficulty and show tailored tips.
- High scores and earned badges persist using `localStorage`.

## Getting Started
1. Install dependencies and start the dev server:
   ```bash
   cd learning-games
   npm install
   npm run dev
   ```
2. Open the printed URL in your browser.

Node **18+** is recommended. Major dependencies include React 19, React Router 7, Vite 6 and TypeScript. Toast notifications are provided by `react-hot-toast` and unit tests use `vitest`.

## Development Tips
- `npm run lint` checks code style with ESLint.
- `npm run test` runs the Vitest unit tests.
- `npm run build` creates a production build in `dist/`.

