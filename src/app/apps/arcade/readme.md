# Retro Arcade 🎮

A fully functional Retro Arcade Web Application containing multiple classic arcade games implemented in JavaScript using HTML5 Canvas.

## Features

### Games
- **Pong** - 1P vs AI or 2P local, increasing ball speed
- **Snake** - Grid movement, progressive speed, wall/self collision
- **Tetris** - 7 tetrominoes, rotation, line clearing, ghost piece, level progression
- **Space Invaders** - Waves of enemies, projectiles, lives system
- **Pac-Man** - Maze with 4 ghost AI, dots, power pellets
- **Asteroids** - 360° rotation, thrust physics, asteroid splitting, screen wrap

### Arcade System
- Player identity with localStorage persistence
- Per-game high score leaderboards (top 10)
- Cumulative score tracking across all games
- Retro pixel-art theme with CRT scanline effects, neon glow
- Responsive design with touch controls for mobile

### Controls
Each game displays its controls on the start screen. Common patterns:
- **Arrow keys** or **WASD** for movement
- **Space** to start games and shoot
- **P** or the Pause button to pause

## Architecture

All games are implemented as isolated ES6 classes that receive a `<canvas>` element and an options object with callbacks. The arcade shell is a React client component that handles navigation, player state, and score management, while the game engines handle their own rendering loops.

```
src/app/apps/arcade/
  page.js          - Main React page (menu, game view, scores)
  readme.md        - This file
  lib/
    storage.js     - localStorage helper for scores & player
  games/
    pong.js        - Pong game engine
    snake.js       - Snake game engine
    tetris.js      - Tetris game engine
    space-invaders.js - Space Invaders game engine
    pacman.js      - Pac-Man game engine
    asteroids.js   - Asteroids game engine
```
