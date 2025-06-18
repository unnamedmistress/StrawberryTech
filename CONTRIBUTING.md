# Contributing to StrawberryTech

Thank you for considering contributing! To get started:

1. **Install dependencies** for each package:
   ```bash
   cd learning-games && npm install
   cd ../server && npm install
   cd ../nextjs-app && npm install
   ```

2. **Run the dev servers**:
   ```bash
   # Terminal 1
   cd learning-games && npm run dev
   # Terminal 2
   cd server && npm start
   ```

3. **Run tests and lint checks** before submitting a PR:
   ```bash
   npm run lint --workspace=learning-games
   npm test --workspace=learning-games
   npm test --workspace=server
   npm test --workspace=nextjs-app
   ```

4. **Submit pull requests** to the `develop` branch with a clear description of your changes.

Please follow the existing code style and ensure `npm test` passes.
