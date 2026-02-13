'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../../components/Header';
import { Storage } from './lib/storage';

/* ──────────────────────────────────────────────
   Game registry
   ────────────────────────────────────────────── */
const GAMES = [
  { id: 'pong',            title: 'PONG',            icon: '🏓', description: '1P vs AI or 2P local. First to score wins!' },
  { id: 'snake',           title: 'SNAKE',           icon: '🐍', description: "Eat food, grow longer, don't hit walls or yourself!" },
  { id: 'tetris',          title: 'TETRIS',          icon: '🧱', description: 'Clear lines with falling tetrominoes. Classic!' },
  { id: 'space-invaders',  title: 'SPACE INVADERS',  icon: '👾', description: 'Defend Earth from waves of alien invaders!' },
  { id: 'pacman',          title: 'PAC-MAN',         icon: '🟡', description: 'Eat dots, avoid ghosts, grab power pellets!' },
  { id: 'asteroids',       title: 'ASTEROIDS',       icon: '☄️', description: 'Navigate space and blast asteroids to bits!' },
];

// Dynamic imports for each game module
const gameLoaders = {
  pong:             () => import('./games/pong'),
  snake:            () => import('./games/snake'),
  tetris:           () => import('./games/tetris'),
  'space-invaders': () => import('./games/space-invaders'),
  pacman:           () => import('./games/pacman'),
  asteroids:        () => import('./games/asteroids'),
};

/* ──────────────────────────────────────────────
   Main Arcade Page
   ────────────────────────────────────────────── */
export default function ArcadePage() {
  const [player, setPlayer] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [view, setView] = useState('menu');          // 'menu' | 'game' | 'leaderboard'
  const [activeGameId, setActiveGameId] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  // Initialise player on mount
  useEffect(() => {
    const saved = Storage.getPlayer();
    if (saved) {
      setPlayer(saved);
      setTotalScore(Storage.getPlayerTotalScore(saved));
    } else {
      setShowNameModal(true);
    }
  }, []);

  const handleSetPlayer = (name) => {
    const n = (name || 'PLAYER 1').toUpperCase();
    Storage.setPlayer(n);
    setPlayer(n);
    setTotalScore(Storage.getPlayerTotalScore(n));
    setShowNameModal(false);
  };

  const refreshTotalScore = useCallback(() => {
    if (player) setTotalScore(Storage.getPlayerTotalScore(player));
  }, [player]);

  const launchGame = (gameId) => {
    setActiveGameId(gameId);
    setView('game');
  };

  const backToMenu = () => {
    setView('menu');
    setActiveGameId(null);
    refreshTotalScore();
  };

  const showLeaderboard = (gameId) => {
    setActiveGameId(gameId);
    setView('leaderboard');
  };

  return (
    <main className="min-h-screen" style={{ background: '#050510', color: '#fff', fontFamily: "'Press Start 2P', monospace" }}>
      {/* Google font */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />

      <div className="max-w-5xl mx-auto p-4 pt-8 md:p-8 md:pt-16">
        <Header />

        {/* Arcade header bar */}
        <div style={styles.arcadeBar}>
          <button onClick={backToMenu} style={styles.arcadeTitle}>RETRO ARCADE</button>
          <div style={styles.barRight}>
            {player && (
              <>
                <span style={{ color: '#39ff14', textShadow: '0 0 8px #39ff14' }}>
                  {player}
                </span>
                <span style={{ color: '#ffff00', textShadow: '0 0 8px #ffff00' }}>
                  SCORE: {totalScore.toLocaleString()}
                </span>
                <button
                  onClick={() => setShowNameModal(true)}
                  style={{ ...styles.smallBtn, marginLeft: 4 }}
                  title="Change player"
                >
                  ✎
                </button>
              </>
            )}
          </div>
        </div>

        {/* CRT overlay */}
        <div style={styles.crt} />

        {/* Views */}
        {view === 'menu' && <Menu games={GAMES} onPlay={launchGame} onLeaderboard={showLeaderboard} />}
        {view === 'game' && activeGameId && (
          <GameView
            gameId={activeGameId}
            player={player}
            onBack={backToMenu}
            onScorePosted={refreshTotalScore}
          />
        )}
        {view === 'leaderboard' && activeGameId && (
          <Leaderboard gameId={activeGameId} onBack={backToMenu} />
        )}
      </div>

      {/* Player name modal */}
      {showNameModal && <PlayerModal onSubmit={handleSetPlayer} current={player} />}
    </main>
  );
}

/* ──────────────────────────────────────────────
   Player Name Modal
   ────────────────────────────────────────────── */
function PlayerModal({ onSubmit, current }) {
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    onSubmit(inputRef.current.value);
  };

  return (
    <div style={styles.modalBg}>
      <div style={styles.modalBox}>
        <h2 style={{ fontSize: 14, color: '#00ffff', marginBottom: 16, textShadow: '0 0 10px #00ffff' }}>
          ENTER YOUR NAME
        </h2>
        <div style={{ color: '#39ff14', fontSize: 20, animation: 'blink .7s infinite', marginBottom: 12 }}>_</div>
        <input
          ref={inputRef}
          type="text"
          maxLength={12}
          placeholder="PLAYER 1"
          defaultValue={current || ''}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          style={styles.nameInput}
        />
        <button onClick={submit} style={styles.btn}>START</button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Menu View
   ────────────────────────────────────────────── */
function Menu({ games, onPlay, onLeaderboard }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2 style={styles.menuTitle}>RETRO ARCADE</h2>
      <p style={{ textAlign: 'center', fontSize: 8, color: '#666688', marginBottom: 24 }}>
        SELECT A GAME TO PLAY
      </p>

      <div style={styles.grid}>
        {games.map(g => (
          <GameCard key={g.id} game={g} onPlay={() => onPlay(g.id)} onLeaderboard={() => onLeaderboard(g.id)} />
        ))}
      </div>
    </div>
  );
}

function GameCard({ game, onPlay, onLeaderboard }) {
  const [hover, setHover] = useState(false);
  const scores = Storage.getGameScores(game.id).slice(0, 3);

  return (
    <div
      style={{
        ...styles.card,
        borderColor: hover ? '#00ffff' : '#1a1a4a',
        boxShadow: hover ? '0 0 20px rgba(0,255,255,0.2)' : 'none',
        transform: hover ? 'translateY(-3px)' : 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onPlay}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{game.icon}</div>
      <div style={{ fontSize: 12, color: '#00ffff', marginBottom: 6, textShadow: '0 0 5px #00ffff' }}>
        {game.title}
      </div>
      <div style={{ fontSize: 7, color: '#aaaacc', lineHeight: 1.8, marginBottom: 10 }}>
        {game.description}
      </div>

      <div style={{ borderTop: '1px solid #1a1a4a', paddingTop: 8 }}>
        <div style={{ fontSize: 7, color: '#ffff00', marginBottom: 4, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onLeaderboard(); }}>
          TOP SCORES ▸
        </div>
        {scores.length === 0 ? (
          <div style={{ fontSize: 7, color: '#666688' }}>NO SCORES YET</div>
        ) : (
          scores.map((s, i) => (
            <div key={i} style={{ fontSize: 7, color: '#666688', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
              <span style={{ color: '#aaaacc' }}>{i + 1}. {s.player}</span>
              <span style={{ color: '#39ff14' }}>{s.score.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Game View
   ────────────────────────────────────────────── */
function GameView({ gameId, player, onBack, onScorePosted }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const touchRef = useRef(null);
  const gameRef = useRef(null);
  const [score, setScore] = useState(0);
  const [info, setInfo] = useState('');
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isHighScore, setIsHighScore] = useState(false);

  const title = GAMES.find(g => g.id === gameId)?.title || gameId;

  // Load & start game
  useEffect(() => {
    let game = null;
    let mounted = true;

    (async () => {
      const loader = gameLoaders[gameId];
      if (!loader || !canvasRef.current) return;

      const module = await loader();
      const GameClass = module.default;
      if (!mounted) return;

      const maxWidth = Math.min(window.innerWidth - 40, 760);
      const maxHeight = Math.min(window.innerHeight - 280, 500);

      game = new GameClass(canvasRef.current, {
        maxWidth,
        maxHeight,
        onScoreUpdate: (s) => { if (mounted) setScore(s); },
        onInfoUpdate: (i) => { if (mounted) setInfo(i); },
        onGameOver: (s) => {
          if (!mounted) return;
          const isHigh = Storage.isHighScore(gameId, s);
          Storage.addScore(gameId, player, s);
          setFinalScore(s);
          setIsHighScore(isHigh);
          setGameOver(true);
          onScorePosted();
        },
        touchContainer: touchRef.current,
      });

      gameRef.current = game;
    })();

    return () => {
      mounted = false;
      if (game?.destroy) game.destroy();
      gameRef.current = null;
    };
  }, [gameId, player, onScorePosted]);

  const togglePause = () => {
    const g = gameRef.current;
    if (!g) return;
    if (g.isPaused) { g.resume(); setPaused(false); }
    else { g.pause(); setPaused(true); }
  };

  const restart = () => {
    const g = gameRef.current;
    if (!g) return;
    setGameOver(false);
    setPaused(false);
    setScore(0);
    g.restart();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Game header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 760, marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: '#ff00ff', textShadow: '0 0 10px #ff00ff' }}>{title}</span>
        <span style={{ fontSize: 12, color: '#39ff14', textShadow: '0 0 8px #39ff14' }}>SCORE: {score.toLocaleString()}</span>
      </div>
      {info && <div style={{ fontSize: 9, color: '#aaaacc', marginBottom: 8 }}>{info}</div>}

      {/* Canvas wrapper */}
      <div ref={wrapperRef} style={{ position: 'relative', border: '2px solid #00ffff', boxShadow: '0 0 20px rgba(0,255,255,0.15)', background: '#000' }}>
        <canvas ref={canvasRef} />

        {/* Game over overlay */}
        {gameOver && (
          <div style={styles.overlay}>
            <h2 style={{ fontSize: 24, color: '#ff0040', textShadow: '0 0 20px #ff0040', marginBottom: 12 }}>GAME OVER</h2>
            <div style={{ fontSize: 14, color: '#ffff00', marginBottom: 16 }}>SCORE: {finalScore.toLocaleString()}</div>
            {isHighScore && <div style={{ fontSize: 10, color: '#39ff14', animation: 'blink .5s infinite', marginBottom: 14 }}>★ NEW HIGH SCORE ★</div>}
            <button onClick={restart} style={styles.btn}>PLAY AGAIN</button>
            <button onClick={onBack} style={{ ...styles.btn, ...styles.btnGreen, marginTop: 8 }}>MENU</button>
          </div>
        )}

        {/* Pause overlay */}
        {paused && !gameOver && (
          <div style={styles.overlay}>
            <h2 style={{ fontSize: 20, color: '#ffff00', textShadow: '0 0 15px #ffff00', animation: 'blink 1s infinite' }}>PAUSED</h2>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button onClick={togglePause} style={styles.btn}>{paused ? 'RESUME' : 'PAUSE'}</button>
        <button onClick={restart} style={{ ...styles.btn, ...styles.btnPink }}>RESTART</button>
        <button onClick={onBack} style={{ ...styles.btn, ...styles.btnGreen }}>MENU</button>
      </div>

      {/* Touch controls placeholder */}
      <div ref={touchRef} style={{ marginTop: 10 }} />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Leaderboard View
   ────────────────────────────────────────────── */
function Leaderboard({ gameId, onBack }) {
  const scores = Storage.getGameScores(gameId);
  const title = GAMES.find(g => g.id === gameId)?.title || gameId;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: 16, color: '#ffff00', textShadow: '0 0 15px #ffff00', marginBottom: 20 }}>
        {title} LEADERBOARD
      </h2>

      {scores.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666688', fontSize: 10, marginTop: 30 }}>NO SCORES RECORDED YET</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['#', 'PLAYER', 'SCORE', 'DATE'].map(h => (
                <th key={h} style={{ fontSize: 9, color: '#00ffff', padding: 8, borderBottom: '2px solid #00ffff', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={i}>
                <td style={{ ...styles.td, color: i < 3 ? ['#ffff00','#c0c0c0','#cd7f32'][i] : '#aaaacc' }}>{i + 1}</td>
                <td style={styles.td}>{s.player}</td>
                <td style={styles.td}>{s.score.toLocaleString()}</td>
                <td style={styles.td}>{new Date(s.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button onClick={onBack} style={styles.btn}>BACK TO MENU</button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Inline styles (arcade-scoped, no global CSS)
   ────────────────────────────────────────────── */
const styles = {
  arcadeBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    background: '#0d0d2b',
    borderBottom: '2px solid #00ffff',
    boxShadow: '0 2px 20px rgba(0,255,255,0.2)',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  arcadeTitle: {
    background: 'none',
    border: 'none',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 14,
    color: '#00ffff',
    textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
    cursor: 'pointer',
  },
  barRight: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    fontSize: 10,
    flexWrap: 'wrap',
  },
  smallBtn: {
    background: 'none',
    border: '1px solid #666',
    color: '#aaa',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 10,
    cursor: 'pointer',
    padding: '2px 6px',
  },
  crt: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    pointerEvents: 'none',
    zIndex: 9999,
    background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
  },
  menuTitle: {
    textAlign: 'center',
    fontSize: 24,
    color: '#ff00ff',
    textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff',
    marginBottom: 8,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#0d0d2b',
    border: '2px solid #1a1a4a',
    padding: 20,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  btn: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 11,
    padding: '10px 24px',
    background: 'transparent',
    color: '#00ffff',
    border: '2px solid #00ffff',
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  btnPink: {
    color: '#ff00ff',
    borderColor: '#ff00ff',
  },
  btnGreen: {
    color: '#39ff14',
    borderColor: '#39ff14',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalBg: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  modalBox: {
    background: '#0d0d2b',
    border: '2px solid #00ffff',
    boxShadow: '0 0 30px rgba(0,255,255,0.3)',
    padding: 40,
    textAlign: 'center',
    maxWidth: 400,
    width: '90%',
    fontFamily: "'Press Start 2P', monospace",
  },
  nameInput: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 14,
    padding: '10px 15px',
    background: '#050510',
    border: '2px solid #ff00ff',
    color: '#39ff14',
    textAlign: 'center',
    width: '100%',
    outline: 'none',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  td: {
    fontSize: 8,
    color: '#aaaacc',
    padding: '6px 8px',
    borderBottom: '1px solid #1a1a4a',
  },
};
