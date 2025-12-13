# Pixel Prowler 🕵️

A browser-based stealth game where players control a pixelated character navigating through various levels filled with enemies and obstacles. The objective is to collect items while avoiding detection, using strategy and timing.

## Features

### Gameplay Mechanics
- **Character Control**: Use arrow keys or WASD for movement
- **Stealth System**: Hide in cover spots to avoid enemy detection
- **Progressive Difficulty**: Each level introduces more enemies and challenges
- **Item Collection**: Collect all items (💎) to complete each level

### Enemy AI
- **Patrolling Guards** (👮): Move around the level following patrol patterns
- **Stationary Lookouts** (👁️): Stay in place but rotate their view
- **Line of Sight**: Enemies can detect you up to 2 tiles away in their facing direction
- **Dynamic Behavior**: Enemies change direction when they hit obstacles

### Level Features
- **Three Unique Themes**:
  - 🌲 Forest - Green natural environment
  - 🏙️ City - Urban gray landscape
  - 🏰 Dungeon - Mysterious purple caverns
- **8x8 Grid**: Compact playfield for strategic gameplay
- **Cover Spots** (🌳): Hide here to avoid detection
- **Progressive Scaling**: More items needed and more enemies as you advance

### Game Mechanics
- **Detection System**: Getting spotted 3 times results in game over
- **Hide/Reveal**: Press Spacebar while in cover to toggle hiding
- **Score System**: Earn points for collecting items and completing levels
- **Local Progress**: Game state is preserved during your session

## Technical Stack

- **Framework**: Next.js 14 with React
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Game Loop**: setInterval for enemy AI updates (1.5s cycle)
- **Input Handling**: Keyboard event listeners

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move Up |
| S / ↓ | Move Down |
| A / ← | Move Left |
| D / → | Move Right |
| Space | Hide/Unhide (when in cover) |

## Game Rules

1. **Objective**: Collect all 💎 items in each level
2. **Stealth**: Avoid being detected by enemies 3 times
3. **Cover**: Use 🌳 cover spots to hide from enemy sight
4. **Progression**: Complete levels to unlock harder challenges
5. **Enemies**: 
   - Cannot move through each other
   - Turn around when hitting boundaries
   - Detect you within 2 tiles in their facing direction

## Game States

- **Main Menu**: Start a new game
- **Playing**: Active gameplay with enemy AI
- **Level Complete**: Successfully collected all items
- **Game Over**: Detected 3 times by enemies

## Design System Compliance

Following the repository's AI_GUIDELINES.md:
- ✅ Located in `/apps/` directory structure
- ✅ Uses design system colors (bg-bg, bg-surface, text-text, text-muted, text-accent)
- ✅ Includes Header component
- ✅ Responsive design with grid layouts
- ✅ Proper error states and game states
- ✅ Version footer included
- ✅ Info section with instructions
- ✅ Mobile-friendly interface

## Code Architecture

### State Management
- Game state (started, over, level complete)
- Player position and hiding status
- Enemy positions and patrol patterns
- Item and cover locations
- Score and detection tracking

### Key Functions
- `generateLevel()`: Creates random level layouts
- `movePlayer()`: Handles player movement and collision
- `checkDetection()`: Determines if enemies can see the player
- `checkIfInCover()`: Validates if player is in a cover spot
- Enemy AI loop: Updates enemy positions and rotations

### Performance Optimizations
- useCallback for movement functions
- Memoized level generation
- Efficient collision detection
- Throttled detection checks

## Future Enhancements

Potential improvements based on the original game concept:
- [ ] Sound effects and 8-bit background music
- [ ] Power-ups (invisibility, speed boosts, sound dampeners)
- [ ] Distraction mechanics (throw objects)
- [ ] Noise system (running creates noise)
- [ ] Character unlocks and skins
- [ ] Timed challenges
- [ ] Leaderboard integration
- [ ] More level themes
- [ ] Save game progress (localStorage)
- [ ] Tutorial level
- [ ] Mobile touch controls
- [ ] Animation improvements
- [ ] Mini-map feature

## Known Limitations

- Fixed 8x8 grid size (for simplicity)
- Basic line-of-sight (straight lines only)
- No diagonal movement
- Enemy AI is predictable after observation
- No sound effects yet

## Credits

Game concept inspired by classic stealth games with a retro pixel art aesthetic. Built as part of the personal-site project portfolio.

## Version History

- **v1.0** (2025-12-13): Initial release with core stealth gameplay
  - Player movement and hiding mechanics
  - Enemy AI with patrol and stationary types
  - Three level themes
  - Progressive difficulty scaling
  - Detection and game over system
