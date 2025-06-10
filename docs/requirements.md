# Real Estate License Exam Prep Gaming App Requirements

## Objective

Create a web-based gamified quiz application for preparing users for the Massachusetts Real Estate License Exam. The application will leverage modern learning science principles (e.g., spaced repetition) and best practices from _Ace That Test_.

---

## 1. Source Content

- **Primary Reference**: PSI’s Real Estate License Law Rules and Regulations Handbook for Massachusetts
- **Question Bank**: Generate and categorize quiz questions according to handbook sections (e.g., Licensing, Land Use, Contracts, Finance, Ethics).

---

## 2. Core Functionalities

### 2.1 Interactive Quiz Sessions

- Custom session durations (5, 10, 20 minutes)
- Option to focus on random questions or weak topics
- Timer UI/contact prompts during sessions

### 2.2 Detailed Feedback & Progress Tracking

- Post-session summary with correct/incorrect counts
- Section-level performance charts
- Historical performance logs stored locally

### 2.3 Spaced Repetition Algorithm

- Prioritize questions based on past results
- Increase review frequency for missed or weak items
- Use Leitner system or SM-2 algorithm for scheduling reviews

### 2.4 Gamification Features

- Points for correct answers; penalties for wrong answers
- Badges for milestones (e.g., 7-day streak, 100 questions answered)
- Levels/unlocks based on total points or consecutive practice days

---

## 3. Technical Stack & Persistence

- **Frontend**: React (CRA or Vite) + TailwindCSS for styling
- **State & Storage**: LocalStorage (or IndexedDB) for offline persistence; Firebase (optional)
- **Deployment**: GitHub Pages (static hosting)
- **No backend server**: Entirely client-side to minimize maintenance

---

## 4. UI/UX Guidelines

- Clean, responsive layout (mobile & desktop)
- Clear, accessible typography and color contrast
- Minimalist dashboards for progress and profile
- Animations and transitions for feedback (e.g., correct/incorrect flips)

---

## 5. Project Setup & Scripts

- `npm init` (with React & Tailwind)
- `npm run dev` / `npm run build`
- `npm run deploy` (uses `gh-pages` for GitHub Pages)

---

## 6. Future Considerations

- Social sharing of badges and scores
- Adaptive difficulty leveling
- Community-sourced question contributions
