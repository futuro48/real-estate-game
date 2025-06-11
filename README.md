# Real Estate Exam Prep Game

This project is a small quiz app built with React and Vite. It shows sample questions for the Massachusetts real estate exam and tracks your progress locally.

## Development

Run `npm install` before starting the development server with `npm run dev`.

```bash
npm install
npm run dev
```

## Testing

Run `npm test` to execute the unit tests with Vitest.

## Linting

This project uses ESLint with the configuration provided in `eslint.config.js`.
After running `npm install`, you can check the code style by running:

```bash
npm run lint
```

## Build & Deploy

Create a production-ready build using:

```bash
npm run build
```

Preview the optimized output locally with:

```bash
npm run preview
```

Deployments are handled by `npm run deploy`, which publishes the `dist` folder using `gh-pages`. You must have permission to push to the repository for this to succeed.

## Features

- Multiple choice questions drawn from several topics
- Countdown timer for each quiz session
- Score tracking and history saved to `localStorage`
- Earn points for correct answers and track levels
- Badges awarded for streaks and total questions answered
- Choose quiz length (5, 10, or 20 minutes) and focus areas
- Per-topic performance charts to review strengths and weaknesses


The app is a work in progress and is intended for experiments with question navigation and simple gamification.
Tailwind's PostCSS plugin comes from the `tailwindcss` package, so no extra PostCSS plugin is required.

## Deployment

The `base` option in `vite.config.js` is set to `/real-estate-game/` so that assets resolve correctly when deployed to GitHub Pages. Run `npm run deploy` to build the project and publish the contents of `dist`.

## Resetting Progress

The quiz saves history and points in the browser's `localStorage`. If you want a
fresh start, open the developer console and remove the stored items:

```js
['history', 'points', 'totalQuestions', 'streak', 'badges', 'lastSession', 'schedule']
  .forEach(key => localStorage.removeItem(key));
```

This clears your quiz history, badges, and statistics so you can begin again fro
m scratch. You can also use the **Reset Progress** button in the app's interface
to perform the same action.

## License

This project is licensed under the [MIT License](LICENSE).
