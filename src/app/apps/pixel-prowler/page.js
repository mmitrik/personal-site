'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '../../../components/Header';

export default function PixelProwler() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [itemsCollected, setItemsCollected] = useState(0);
  const [itemsNeeded, setItemsNeeded] = useState(3);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [isHidden, setIsHidden] = useState(false);
  const [detectionLevel, setDetectionLevel] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);

  // Level themes
  const themes = [
    { name: 'Forest', color: 'bg-green-700', tileColor: 'bg-green-600', emoji: '🌲' },
    { name: 'City', color: 'bg-gray-700', tileColor: 'bg-gray-600', emoji: '🏙️' },
    { name: 'Dungeon', color: 'bg-purple-900', tileColor: 'bg-purple-800', emoji: '🏰' }
  ];
  const currentTheme = themes[(level - 1) % themes.length];

  // Grid size
  const GRID_SIZE = 8;

  // Generate level
  const generateLevel = useCallback(() => {
    const newEnemies = [];
    const newItems = [];
    const newCovers = [];

    // Generate enemies (increases with level)
    const enemyCount = Math.min(2 + Math.floor(level / 2), 6);
    for (let i = 0; i < enemyCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      } while ((x === 1 && y === 1) || newEnemies.some(e => e.x === x && e.y === y));
      
      newEnemies.push({
        x,
        y,
        direction: Math.floor(Math.random() * 4), // 0=up, 1=right, 2=down, 3=left
        patrolType: Math.random() > 0.5 ? 'patrol' : 'stationary'
      });
    }

    // Generate items
    const itemCount = itemsNeeded;
    for (let i = 0; i < itemCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      } while (
        (x === 1 && y === 1) ||
        newEnemies.some(e => e.x === x && e.y === y) ||
        newItems.some(item => item.x === x && item.y === y)
      );
      newItems.push({ x, y });
    }

    // Generate cover spots
    const coverCount = Math.min(3 + level, 8);
    for (let i = 0; i < coverCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      } while (
        (x === 1 && y === 1) ||
        newEnemies.some(e => e.x === x && e.y === y) ||
        newItems.some(item => item.x === x && item.y === y) ||
        newCovers.some(c => c.x === x && c.y === y)
      );
      newCovers.push({ x, y });
    }

    return { enemies: newEnemies, items: newItems, covers: newCovers };
  }, [level, itemsNeeded]);

  const [enemies, setEnemies] = useState([]);
  const [items, setItems] = useState([]);
  const [covers, setCovers] = useState([]);

  // Start/restart game
  const startGame = () => {
    const { enemies: newEnemies, items: newItems, covers: newCovers } = generateLevel();
    setEnemies(newEnemies);
    setItems(newItems);
    setCovers(newCovers);
    setPlayer({ x: 1, y: 1 });
    setGameStarted(true);
    setGameOver(false);
    setLevelComplete(false);
    setItemsCollected(0);
    setDetectionLevel(0);
    setIsHidden(false);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setLevel(1);
    setScore(0);
    setItemsCollected(0);
    setItemsNeeded(3);
    setPlayer({ x: 1, y: 1 });
    setDetectionLevel(0);
    setIsHidden(false);
    setLevelComplete(false);
  };

  // Next level
  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setItemsNeeded(prev => prev + 1);
    setScore(prev => prev + 100 * level);
    const { enemies: newEnemies, items: newItems, covers: newCovers } = generateLevel();
    setEnemies(newEnemies);
    setItems(newItems);
    setCovers(newCovers);
    setPlayer({ x: 1, y: 1 });
    setItemsCollected(0);
    setDetectionLevel(0);
    setIsHidden(false);
    setLevelComplete(false);
  };

  // Check if player is in cover
  const checkIfInCover = useCallback((playerPos) => {
    return covers.some(cover => cover.x === playerPos.x && cover.y === playerPos.y);
  }, [covers]);

  // Check if detected by enemies
  const checkDetection = useCallback((playerPos, isPlayerHidden) => {
    if (isPlayerHidden) return false;

    for (const enemy of enemies) {
      // Check if player is in adjacent cell (simplified line of sight)
      const dx = Math.abs(enemy.x - playerPos.x);
      const dy = Math.abs(enemy.y - playerPos.y);
      
      // Enemy can see 2 tiles in their direction
      if (enemy.direction === 0 && enemy.x === playerPos.x && playerPos.y < enemy.y && dy <= 2) return true;
      if (enemy.direction === 1 && enemy.y === playerPos.y && playerPos.x > enemy.x && dx <= 2) return true;
      if (enemy.direction === 2 && enemy.x === playerPos.x && playerPos.y > enemy.y && dy <= 2) return true;
      if (enemy.direction === 3 && enemy.y === playerPos.y && playerPos.x < enemy.x && dx <= 2) return true;
    }
    return false;
  }, [enemies]);

  // Move player
  const movePlayer = useCallback((dx, dy) => {
    if (!gameStarted || gameOver || levelComplete) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    // Check bounds
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;

    // Check if moving into enemy
    if (enemies.some(e => e.x === newX && e.y === newY)) {
      setGameOver(true);
      return;
    }

    const newPlayer = { x: newX, y: newY };
    setPlayer(newPlayer);

    // Check if collecting item
    const itemIndex = items.findIndex(item => item.x === newX && item.y === newY);
    if (itemIndex !== -1) {
      const newItems = items.filter((_, i) => i !== itemIndex);
      setItems(newItems);
      setItemsCollected(prev => prev + 1);
      setScore(prev => prev + 10);
      
      // Check if level complete
      if (itemsCollected + 1 >= itemsNeeded) {
        setLevelComplete(true);
      }
    }

    // Check if in cover
    const inCover = checkIfInCover(newPlayer);
    setIsHidden(inCover);

    // Check detection (if not in cover)
    if (checkDetection(newPlayer, inCover)) {
      setDetectionLevel(prev => {
        const newLevel = prev + 1;
        if (newLevel >= 3) {
          setGameOver(true);
        }
        return newLevel;
      });
    }
  }, [gameStarted, gameOver, levelComplete, player, enemies, items, itemsCollected, itemsNeeded, checkIfInCover, checkDetection]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver || levelComplete) return;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case 's':
        case 'arrowdown':
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case 'a':
        case 'arrowleft':
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case 'd':
        case 'arrowright':
          e.preventDefault();
          movePlayer(1, 0);
          break;
        case ' ':
          e.preventDefault();
          // Spacebar to hide if in cover
          if (checkIfInCover(player)) {
            setIsHidden(prev => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, levelComplete, movePlayer, player, checkIfInCover]);

  // Enemy AI - patrol
  useEffect(() => {
    if (!gameStarted || gameOver || levelComplete) return;

    const interval = setInterval(() => {
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          if (enemy.patrolType === 'stationary') {
            // Stationary enemies just rotate
            return { ...enemy, direction: (enemy.direction + 1) % 4 };
          }

          // Patrolling enemies move and rotate
          let newX = enemy.x;
          let newY = enemy.y;
          let newDirection = enemy.direction;

          // Try to move in current direction
          if (enemy.direction === 0) newY -= 1;
          else if (enemy.direction === 1) newX += 1;
          else if (enemy.direction === 2) newY += 1;
          else if (enemy.direction === 3) newX -= 1;

          // Check if new position is valid
          if (
            newX < 1 || newX >= GRID_SIZE - 1 ||
            newY < 1 || newY >= GRID_SIZE - 1 ||
            prevEnemies.some(e => e !== enemy && e.x === newX && e.y === newY)
          ) {
            // Turn around if can't move
            newX = enemy.x;
            newY = enemy.y;
            newDirection = (enemy.direction + 2) % 4;
          }

          return { ...enemy, x: newX, y: newY, direction: newDirection };
        });
      });

      // Check detection after enemies move
      setTimeout(() => {
        setPlayer(currentPlayer => {
          const inCover = checkIfInCover(currentPlayer);
          if (checkDetection(currentPlayer, inCover)) {
            setDetectionLevel(prev => {
              const newLevel = prev + 1;
              if (newLevel >= 3) {
                setGameOver(true);
              }
              return newLevel;
            });
          }
          return currentPlayer;
        });
      }, 50);
    }, 1500);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, levelComplete, checkIfInCover, checkDetection]);

  // Render cell
  const renderCell = (x, y) => {
    const isPlayer = player.x === x && player.y === y;
    const enemy = enemies.find(e => e.x === x && e.y === y);
    const item = items.find(i => i.x === x && i.y === y);
    const cover = covers.find(c => c.x === x && c.y === y);

    let content = '';
    let bgClass = currentTheme.tileColor;

    if (isPlayer) {
      content = isHidden ? '🌳' : '🕵️';
      bgClass = isHidden ? 'bg-green-500' : 'bg-blue-500';
    } else if (enemy) {
      const directions = ['⬆️', '➡️', '⬇️', '⬅️'];
      content = enemy.patrolType === 'stationary' ? '👁️' : '👮';
      bgClass = 'bg-red-500';
    } else if (item) {
      content = '💎';
      bgClass = 'bg-yellow-400';
    } else if (cover) {
      content = '🌳';
      bgClass = 'bg-green-500';
    }

    return (
      <div
        key={`${x}-${y}`}
        className={`w-12 h-12 ${bgClass} border border-border flex items-center justify-center text-2xl`}
      >
        {content}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-6xl mx-auto p-8 pt-16">
        <Header />

        {/* Game Section */}
        <section className="bg-surface p-10 rounded-2xl shadow-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-text mb-4">
              🕵️ Pixel Prowler
            </h1>
            <p className="text-muted text-lg">
              A stealth game where you must collect items while avoiding detection!
            </p>
          </div>

          {!gameStarted ? (
            // Start screen
            <div className="text-center">
              <div className="bg-bg p-8 rounded-2xl shadow-sm border border-border mb-6">
                <h2 className="text-2xl font-semibold text-text mb-4">Welcome to Pixel Prowler!</h2>
                <p className="text-muted mb-4">
                  Navigate through levels, collect items, and avoid enemy detection.
                  Use cover spots to hide from guards!
                </p>
                <div className="text-left max-w-md mx-auto space-y-2 text-sm text-muted mb-6">
                  <p>🕵️ You (in blue) - Can hide in cover (green)</p>
                  <p>👮 Patrolling Guards - Move around and watch for you</p>
                  <p>👁️ Lookouts - Stay in place but rotate their view</p>
                  <p>💎 Items - Collect these to complete the level</p>
                  <p>🌳 Cover - Hide here to avoid detection</p>
                </div>
              </div>
              <button
                onClick={startGame}
                className="btn text-xl px-12 py-6"
              >
                Start Game
              </button>
            </div>
          ) : (
            <>
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-bg p-4 rounded-lg border border-border text-center">
                  <h3 className="text-xs text-muted mb-1">Level</h3>
                  <p className="text-accent text-2xl font-bold">{level}</p>
                  <p className="text-xs text-muted">{currentTheme.emoji} {currentTheme.name}</p>
                </div>
                <div className="bg-bg p-4 rounded-lg border border-border text-center">
                  <h3 className="text-xs text-muted mb-1">Score</h3>
                  <p className="text-accent text-2xl font-bold">{score}</p>
                </div>
                <div className="bg-bg p-4 rounded-lg border border-border text-center">
                  <h3 className="text-xs text-muted mb-1">Items</h3>
                  <p className="text-accent text-2xl font-bold">{itemsCollected}/{itemsNeeded}</p>
                </div>
                <div className="bg-bg p-4 rounded-lg border border-border text-center">
                  <h3 className="text-xs text-muted mb-1">Detection</h3>
                  <p className={`text-2xl font-bold ${detectionLevel >= 2 ? 'text-red-500' : 'text-accent'}`}>
                    {detectionLevel}/3
                  </p>
                </div>
                <div className="bg-bg p-4 rounded-lg border border-border text-center">
                  <h3 className="text-xs text-muted mb-1">Status</h3>
                  <p className="text-2xl">{isHidden ? '🌳' : '👀'}</p>
                  <p className="text-xs text-muted">{isHidden ? 'Hidden' : 'Visible'}</p>
                </div>
              </div>

              {/* Game Grid */}
              <div className="flex justify-center mb-6">
                <div className={`inline-block ${currentTheme.color} p-2 rounded-lg`}>
                  {Array.from({ length: GRID_SIZE }).map((_, y) => (
                    <div key={y} className="flex">
                      {Array.from({ length: GRID_SIZE }).map((_, x) => renderCell(x, y))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Over / Level Complete */}
              {(gameOver || levelComplete) && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                  <div className="bg-surface p-10 rounded-2xl shadow-xl max-w-md">
                    {gameOver ? (
                      <>
                        <h2 className="text-3xl font-bold text-red-500 mb-4 text-center">Game Over!</h2>
                        <p className="text-muted text-center mb-6">
                          You were detected by the guards!
                        </p>
                        <div className="text-center mb-6">
                          <p className="text-text text-lg">Final Score: <span className="text-accent font-bold">{score}</span></p>
                          <p className="text-text text-lg">Level Reached: <span className="text-accent font-bold">{level}</span></p>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={resetGame} className="btn flex-1">
                            New Game
                          </button>
                          <button onClick={startGame} className="btn-outline flex-1">
                            Try Again
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold text-green-500 mb-4 text-center">Level Complete! 🎉</h2>
                        <p className="text-muted text-center mb-6">
                          You collected all items without being caught!
                        </p>
                        <div className="text-center mb-6">
                          <p className="text-text text-lg">Score: <span className="text-accent font-bold">{score}</span></p>
                          <p className="text-text text-lg">Level: <span className="text-accent font-bold">{level}</span></p>
                        </div>
                        <button onClick={nextLevel} className="btn w-full">
                          Next Level ➡️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="text-center">
                <button onClick={resetGame} className="btn-outline px-4 py-2 text-sm">
                  Restart Game
                </button>
              </div>
            </>
          )}
        </section>

        {/* Info Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>🎮 How to Play:</strong> Use WASD or Arrow keys to move. Collect all 💎 items to complete each level.
            Hide in 🌳 cover spots to avoid detection (press Space to hide/unhide). Avoid 👮 guards and 👁️ lookouts! 
            Getting detected 3 times ends the game. Each level gets progressively harder with more enemies!
          </p>
        </div>

        {/* Version Footer */}
        <footer className="mt-8 text-center">
          <p className="text-muted text-xs">Pixel Prowler v1.0</p>
        </footer>
      </div>
    </main>
  );
}
