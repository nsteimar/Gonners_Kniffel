# 🎲 Kniffel Online Multiplayer

A fully functional online multiplayer Kniffel (Yahtzee) game built with React, Node.js, TypeScript, and Socket.io. Play with friends in real-time across multiple scorecards simultaneously.

## Features

- 🎮 **Real-time Multiplayer** - Play with multiple friends in the same room with live updates
- 🎲 **Interactive Dice** - Roll, hold, and throw dice with visual feedback
- 📊 **6 Parallel Scorecards** - Each player fills 6 complete scorecards simultaneously
- ✨ **Bonus Yahtzee Support** - Automatic detection and scoring of bonus yahtzees
- 🏆 **Final Leaderboard** - Ranking by total score across all 6 sheets
- 🔌 **Reconnection Handling** - Resume your game if connection is lost
- 💻 **Responsive Design** - Works on desktop and tablet

## Tech Stack

- **Backend:** Node.js + TypeScript + Express + Socket.io
- **Frontend:** React + TypeScript + Vite + Zustand
- **State Management:** In-memory (easily extensible to Redis/PostgreSQL)
- **Testing:** Vitest
- **Deployment:** Docker + Docker Compose

## Project Structure

```
kniffel-multiplayer/
├── packages/
│   ├── shared/          # Shared types, game logic, and utilities
│   │   └── src/
│   │       ├── types.ts         # All TypeScript interfaces and enums
│   │       ├── dice.ts          # Dice rolling and combination detection
│   │       ├── scoring.ts       # Scoring logic for all 13 categories
│   │       └── __tests__/       # Unit tests
│   │
│   ├── server/          # Express + Socket.io backend
│   │   └── src/
│   │       ├── index.ts         # Main server file
│   │       ├── roomManager.ts   # Room and player state management
│   │       └── gameLogic.ts     # Server-side game operations
│   │
│   └── client/          # React + Vite frontend
│       └── src/
│           ├── App.tsx          # Main app component
│           ├── main.tsx         # Entry point
│           ├── store/           # Zustand store and Socket.io service
│           ├── pages/           # Page components (Start, Lobby, Game, End)
│           └── components/      # Reusable components (Dice, Scorecard, etc.)
│
├── docker-compose.yml   # Local Docker development setup
├── Dockerfile.server    # Server Docker image
├── Dockerfile.client    # Client Docker image
├── .github/workflows/   # CI/CD workflows
└── README.md
```

## Game Rules

### Standard Kniffel (Yahtzee) Rules

- **5 Dice, 3 Rolls:** Roll up to 3 times per turn, holding any dice between rolls
- **13 Categories:**
  - Upper Section: Ones, Twos, Threes, Fours, Fives, Sixes
  - Lower Section: Three of a Kind, Four of a Kind, Full House, Small Straight, Large Straight, Yahtzee, Chance
- **Upper Section Bonus:** +35 points if sum of ones-sixes ≥ 63
- **Fixed Points:**
  - Full House: 25 points
  - Small Straight (4 consecutive): 30 points
  - Large Straight (5 consecutive): 40 points
  - Yahtzee (all same): 50 points

### Multiplayer Features

- **No Turn Order:** Each player plays independently at their own pace
- **6 Parallel Scorecards:** Each player completes 6 full scorecards (78 total entries per player)
- **Live View:** Watch all players' progress in real-time
- **Bonus Yahtzee Rule:** Second yahtzee gives +50 bonus points + free scoring in any open category (applies per scorecard)

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm/pnpm
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/kniffel-multiplayer.git
   cd kniffel-multiplayer
   ```

2. **Install dependencies:**
   ```bash
   npm install -g pnpm
   pnpm install
   ```

3. **Run in development mode:**
   ```bash
   pnpm run dev
   ```
   - Server runs on `http://localhost:3000`
   - Client runs on `http://localhost:5173`

4. **Run tests:**
   ```bash
   pnpm test
   ```

5. **Build for production:**
   ```bash
   pnpm build
   ```

### Docker Deployment

**Using docker-compose (easiest):**

```bash
docker-compose up --build
```

Then open `http://localhost:5173` in your browser.

**Individual containers:**

```bash
# Build server
docker build -f Dockerfile.server -t kniffel-server .

# Build client
docker build -f Dockerfile.client -t kniffel-client .

# Run server
docker run -p 3000:3000 -e NODE_ENV=production kniffel-server

# Run client (in another terminal)
docker run -p 5173:5173 -e VITE_SERVER_URL=http://localhost:3000 kniffel-client
```

## Playing the Game

1. **Create or Join a Room:**
   - Start Page: Enter your name and create a room (or join with room code)
   - Share the 5-digit room code with friends

2. **Lobby:**
   - See all connected players and their progress
   - Click "Ready to Play" when you're ready

3. **Gameplay:**
   - Click **Roll** to start rolling dice (up to 3 times per round)
   - Click individual dice to hold/release them between rolls
   - After each roll, see scoring previews for all 6 scorecards
   - Select a scorecard sheet (1-6) and a category to score your roll
   - Continue until all 6 scorecards are complete

4. **End of Game:**
   - Final leaderboard shows rankings by total score
   - "Play Again" resets the room for a new game

## API Events

### Socket.io Events (Client → Server)

- `room:create` - Create a new room
- `room:join` - Join existing room by code
- `player:rollDice` - Roll unheld dice
- `player:holdDie` - Hold/release a single die
- `player:scoreCategory` - Score a category in a specific scorecard

### Socket.io Events (Server → Client)

- `game:state` - Updated player/game state
- `room:stateUpdate` - Broadcast updated room summary
- `game:ended` - Game finished with final scores
- `error` - Error message

## Code Quality

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Full type safety
- **Vitest** - Unit tests (30+ tests for game logic)

Run all quality checks:
```bash
pnpm lint
pnpm format
pnpm test
```

## Future Enhancements

- 3D animated dice (using @3d-dice/dice-box)
- User accounts and persistent stats
- Chat in lobby/game
- Database persistence (PostgreSQL/MongoDB)
- Redis for production state management
- Mobile-native app with React Native
- Spectator mode
- Undo last score feature
- Custom room settings (time limits, house rules)

## Architecture Decisions

### Why TypeScript?
Full type safety prevents bugs and improves developer experience.

### Why Socket.io?
Real-time bidirectional communication with automatic reconnection and fallback transports.

### Why In-Memory for v1?
Simplicity and rapid development. Persistence layer is decoupled and can be added later.

### Why 6 Parallel Scorecards?
Increases replayability by allowing different strategical scoring decisions per sheet. Unique to this implementation.

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- 📖 [Kniffel Rules (German Wikipedia)](https://de.wikipedia.org/wiki/Kniffel)
- 🎲 [Yahtzee Rules (English)](https://en.wikipedia.org/wiki/Yahtzee)
- 💬 [Issues & Discussions](https://github.com/yourusername/kniffel-multiplayer/issues)

---

Made with ❤️ by [Your Name]
