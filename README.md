# StrawberryTech Learning Games

StrawberryTech is a collection of small web games built with **React**, **TypeScript** and **Vite**. Each game adapts content based on the player's age, which is stored locally so progress persists between sessions.

## Mini Games 

### Tone Puzzle
Swap adjectives to explore how word choice affects tone. Matches award points and may show leadership tips that vary by age group. Scores and badges are saved for later.

### Hallucinations
A short quiz where you spot the single AI hallucination hidden among two truthful statements.

### Prompt Recipe Builder
Drag cards to assemble a prompt. Each round now fetches fresh card text from the OpenAI API and shows a short sample response after you build the recipe.

## Age‑Adaptive Features
- Players enter their age and name on first visit.
- Games read the stored age to tweak difficulty and show tailored tips.
- On easy difficulty, older players automatically receive extra time for tasks
  (5s at 40+, 10s at 50+, 15s at 60+).
- Points and badges now sync to a small server so progress follows you across devices.
- High contrast theme preference persists via `ThemeToggle`.
- A unified leaderboard with tabs displays top points for every game.
- A dedicated Badges page lets you track all achievements.
- A hidden `/stats` page displays live visitor analytics collected on the server.
- A community playlist page lets everyone share bad and good prompt pairs.
- A community feedback page highlights positive comments from players.

## Getting Started
1. Install dependencies and start the dev server:
   ```bash
   cd learning-games
   npm install
   npm run dev
   ```
2. In a separate terminal start the API server to persist user info,
  community posts and shared high points:
   ```bash
   cd server
   npm install
   npm start
   ```
3. Create a `.env` file inside `learning-games` with your
   `VITE_OPENAI_API_KEY=<your key>` for the Robot chat and recipe features.
4. Open the printed URL in your browser.

Node **18+** is recommended. Major dependencies include React 19, React Router 7, Vite 6 and TypeScript. Toast notifications are provided by `react-hot-toast` and unit tests use `vitest`.

## Development Tips
- `npm run lint` checks code style with ESLint.
- `npm run test` runs the Vitest unit tests.
- `npm run build` creates a production build in `dist/`.

### Running Tests

Before executing the test suite make sure dependencies are installed:

```bash
cd learning-games
npm install
npm test
```

Without installing the packages first the `vitest` command used by
`npm test` will not be available and the tests will fail.

### Visitor Statistics

Analytics data is now stored by the server in **Firebase Firestore**. Open the hidden
`/stats` page while the server is running to see live counts of page views,
unique visitors, and average session length.

## Environment Variables
RobotChat and the Prompt Recipe Builder use the OpenAI API. Create a `.env` file inside `learning-games` containing:

```bash
VITE_OPENAI_API_KEY=your-key
```

The community feedback page uses the same API for sentiment filtering. Set
`OPENAI_API_KEY` in the server environment so posts can be screened before
publishing.

To point the Next.js frontend at a custom server URL set `NEXT_PUBLIC_API_BASE`
in `nextjs-app/.env`. When omitted, the app defaults to `window.location.origin`
so the API can be served from the same host in production.

The API server now persists data in Firebase. Provide service account credentials
by setting `FIREBASE_SERVICE_ACCOUNT` to a JSON string or path, or use
`GOOGLE_APPLICATION_CREDENTIALS` to point to a credentials file.

Without this key, the RobotChat and recipe features will not work.

## License
This project is released under the [MIT License](LICENSE). Contributions are welcome under the same terms.
