# StrawberryTech Learning Games

StrawberryTech is a collection of small web games built with **React**, **TypeScript** and **Vite**. Each game adapts content based on the player's age, which is stored locally so progress persists between sessions.

## Mini Games
:)
### AI Basics
Discover how AI predicts the next word by choosing the best completion.

### Tone Puzzle
Swap adjectives to explore how word choice affects tone. Matches award points and may show leadership tips that vary by age group. Scores and badges are saved for later.

### Hallucinations
A short quiz where you spot the single AI hallucination hidden among two truthful statements.

### Prompt Chain Challenge
Master the art of breaking complex tasks into sequences of simple, effective prompts. Learn how each prompt can build on the previous response for better AI results.

### Prompt Recipe Builder
Drag cards to assemble a prompt. Each round now fetches fresh card text from the OpenAI API and shows a short sample response after you build the recipe.

## Age‑Adaptive Features
- Players can optionally enter their age and name to personalize the games.
- Games read the stored age to tweak difficulty and show tailored tips.
- On easy difficulty, older players automatically receive extra time for tasks
  (5s at 40+, 10s at 50+, 15s at 60+).
- Points and badges now sync to a small server so progress follows you across devices.
- High contrast theme preference persists via `ThemeToggle`.
- A unified leaderboard with tabs displays top points for every game.
- A dedicated Badges page lets you track all achievements.
- A hidden `/stats` page displays server-recorded metrics, while page views
  are automatically tracked by **Vercel Analytics**.
- A prompt library lets everyone browse shared prompts by category and submit their own ideas.
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
3. Copy `.env.example` to `.env` inside `learning-games` and fill in your
  keys. `VITE_API_BASE` defaults to `http://localhost:3001` and the Vite dev
  server proxies `/api` requests there automatically. Provide
  `VITE_OPENAI_API_KEY=<your key>` for the Robot chat and recipe features.
4. Copy `.env.example` to `.env` in `nextjs-app` and set `NEXT_PUBLIC_API_BASE`,
  `NEXT_PUBLIC_OPENAI_API_KEY`, `OPENAI_API_KEY` and your Firebase keys.
  The public Firebase values are prefixed with `NEXT_PUBLIC_` so they can be
  loaded by the browser:

  ```bash
  NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
  NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
  ```

  Leaving these blank causes 500 errors from the API routes. See
  [`server/.env.example`](server/.env.example) for reference.
5. Open the printed URL in your browser.

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

Page views are now logged automatically by **Vercel Analytics**.
The server still stores its own metrics in **Firebase Firestore**; open the hidden
`/stats` page while the server is running to see counts of page views, unique visitors
and average session length.

## Environment Variables
RobotChat and the Prompt Recipe Builder use the OpenAI API. Create a `.env` file inside `learning-games` containing:

```bash
VITE_OPENAI_API_KEY=your-key
```

The community feedback page uses the same API for sentiment filtering. Set
`OPENAI_API_KEY` in the server environment so posts can be screened before
publishing.


To point either frontend at a custom server URL set `NEXT_PUBLIC_API_BASE`
in `nextjs-app/.env` or `VITE_API_BASE` in `learning-games/.env`. These must
be the backend URL when the frontend and API run on different hosts. If these
variables are omitted each app makes relative requests to `/api/...`, which only
works when the API is served from the same host or proxied.
Sample `.env.example` files in each app illustrate this configuration.
These now contain placeholder values so you can copy them directly and replace
each key with your own credentials.

For Firebase Analytics in the Next.js app, also include the following variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```


The API server now persists data in Firebase. Provide service account credentials
by setting `FIREBASE_SERVICE_ACCOUNT` to a JSON string or path, or use
`GOOGLE_APPLICATION_CREDENTIALS` to point to a credentials file.

Without this key, the RobotChat and recipe features will not work.

## License
This project is released under the [MIT License](LICENSE). Contributions are welcome under the same terms.
