# 🎮 Project: Retro Arcade (Single-Page Web App)

## Objective

Build a fully functional **Retro Arcade Web Application** as a single-page application (SPA) that contains multiple classic arcade games implemented in **JavaScript using HTML5 Canvas**.

The arcade should feel cohesive, nostalgic, and production-quality — not a loose collection of demos.

---

# 1. Technical Requirements

## Core Stack

* Vanilla JavaScript (ES6+)
* HTML5
* CSS3
* HTML5 Canvas API (for all gameplay rendering)
* No external game engines
* No heavy frameworks (React/Vue/etc.) unless explicitly required
* Lightweight utility libraries are allowed if justified

## Architecture

* Single Page Application (SPA)
* Modular code structure
* Each game implemented as an isolated module/class
* Shared arcade state management system
* Shared high-score storage system

### Suggested Folder Structure

```
/arcade
  index.html
  /css
    styles.css
  /js
    main.js
    router.js
    state.js
    storage.js
    ui/
      menu.js
      leaderboard.js
    games/
      pong.js
      snake.js
      tetris.js
      space-invaders.js
      pacman.js
      asteroids.js
```

---

# 2. Core Features

## 2.1 Main Menu

The main menu must:

* Display all available games
* Display logged-in player's name
* Display player's overall cumulative high score
* Show top 3 leaderboard previews for each game
* Allow navigation to any game
* Include retro animations (e.g., blinking cursor, pixel transitions)

---

## 2.2 Player Identity

On first visit:

* Prompt user for player name
* Store in `localStorage`
* Persist across sessions

The system must:

* Track scores per user
* Track scores per game
* Track overall cumulative score
* Allow optional “Change Player” option

---

## 2.3 High Score System

Requirements:

* High scores stored in `localStorage`
* Leaderboard per game
* Show top 10 scores
* Store:

  * player name
  * score
  * timestamp
* Persist across browser refresh

Data model example:

```json
{
  "pong": [
    { "player": "Matt", "score": 1200, "date": "2026-02-12T14:33:00Z" }
  ]
}
```

---

# 3. Games to Implement

Each game must:

* Use Canvas rendering
* Have its own game loop
* Implement start / pause / restart
* Show score in real time
* Trigger Game Over screen
* Save score automatically when game ends

---

## 3.1 Pong

* 1-player (AI opponent)
* 2-player local mode
* Smooth paddle movement
* Increasing ball speed over time
* First to configurable score wins

Controls:

* Player 1: W/S
* Player 2: Arrow keys

---

## 3.2 Snake

* Grid-based movement
* Random food spawning
* Progressive speed increase
* Game over on:

  * Wall collision
  * Self collision

Mobile: swipe controls

---

## 3.3 Tetris

* 7 tetromino shapes
* Rotation system
* Line clearing
* Score system:

  * Single
  * Double
  * Triple
  * Tetris (4-line clear)
* Increasing drop speed per level

---

## 3.4 Space Invaders

* Player ship moves left/right
* Projectile shooting
* Multiple enemy rows
* Increasing difficulty
* Enemy projectiles
* Lives system

---

## 3.5 Pac-Man (Simplified)

* Maze grid
* Collectible dots
* 4 ghosts (basic AI)
* Power pellets
* Score multiplier during power mode

AI can be simplified but must appear intentional.

---

## 3.6 Asteroids

* 360-degree ship rotation
* Thrust physics
* Bullet projectiles
* Asteroids split into smaller fragments
* Wrap-around screen edges

---

# 4. User Experience Requirements

## 4.1 Responsiveness

* Works on desktop and mobile
* Scales canvas appropriately
* Maintains aspect ratio
* Touch controls for mobile where applicable

---

## 4.2 Retro Theming

The arcade must include:

* Pixel-style fonts
* Neon arcade color palette
* Dark background
* CRT scanline overlay (CSS-based)
* Subtle glow effects
* Arcade sound effects (optional but preferred)

Each game may vary visually, but must remain cohesive.

---

# 5. Non-Functional Requirements

* Clean, readable, modular code
* No global variable pollution
* No memory leaks in game loops
* Consistent coding conventions
* Comments explaining key systems
* Runs without console errors

---

# 6. Definition of Done

The project is complete when:

* All 6 games are playable
* High scores persist across sessions
* SPA navigation works without page reload
* UI is cohesive and retro-themed
* Works on desktop and mobile
* No major gameplay bugs
* Game restarts function correctly
* Player identity persists

---

# 7. Optional Stretch Goals (If Time Permits)

* Global arcade leaderboard
* Achievement system
* Sound toggle
* Difficulty selection
* Pixel-art splash screen animation
* Background synthwave soundtrack
* Online leaderboard (mock API)

---

# 8. Constraints

* Do NOT embed external game source code
* Implement core mechanics manually
* Avoid overengineering
* Favor clarity and playability over perfection