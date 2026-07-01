# Tetris

A browser-based Tetris game built with React, TypeScript, and Vite.

**Live demo:** https://abhishek-gupta-ducs.github.io/Tetris/

## Features

- Classic Tetris gameplay with ghost piece
- Per-user login with **Google Sign-In** — each player has their own high score
- **Today's Leaderboard** — top scores reset daily (UTC)
- Mobile-friendly with swipe and tap controls on the game board
- Responsive layout for phone, tablet, and desktop
- Landing page with settings, high score, and today's leaderboard
- Difficulty levels: Beginner, Easy, Intermediate, Hard
- Background music and sound effects (toggle in settings)
- End Game button to quit mid-session

## Run locally

```bash
npm install
cp .env.example .env
# Fill in Firebase values in .env (see Firebase setup below)
npm run dev
```

Open http://localhost:5173

## Firebase setup (required for login)

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication → Sign-in method → Google** (toggle on, set a support email)
3. Create a **Firestore** database
4. Register a web app and copy the config values into `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

5. Set Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /dailyScores/{dateKey}/entries/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.score is int
        && request.resource.data.score > 0
        && request.resource.data.displayName is string
        && request.resource.data.updatedAt is int;
      allow update: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.score is int
        && request.resource.data.score > resource.data.score
        && request.resource.data.displayName is string
        && request.resource.data.updatedAt is int;
      allow delete: if false;
    }
  }
}
```

**Note:** After deploying these rules, open the app and play one game. If the leaderboard query fails, Firebase may prompt you to create a composite index for `dailyScores/{date}/entries` ordered by `score`. Follow the link in the browser console to create it.

6. Under **Authentication → Settings → Authorized domains**, ensure these are listed:
   - `localhost`
   - `abhishek-gupta-ducs.github.io` (for your live site)

### GitHub Pages deploy with Firebase

Add the same `VITE_FIREBASE_*` values as **repository secrets** in GitHub:
**Settings → Secrets and variables → Actions → New repository secret**

## Production build

```bash
npm run build
npm run preview
```

For GitHub Pages:

```bash
VITE_BASE_PATH=/Tetris/ npm run build
```

## Controls

### Keyboard

| Key | Action |
|-----|--------|
| ← / A | Move left |
| → / D | Move right |
| ↓ / S | Soft drop |
| Space | Rotate |
| P | Pause |
| R | Resume |

### Touch

Swipe on the game board:

| Gesture | Action |
|---------|--------|
| Swipe left | Move left |
| Swipe right | Move right |
| Swipe down | Soft drop |
| Tap | Rotate |

Pause and resume use the on-screen **Pause** / **Resume** button in the sidebar.

## Tech stack

- React 19
- TypeScript
- Vite 6
- Firebase Auth + Firestore
- Web Audio API (music & SFX)

## License

MIT
