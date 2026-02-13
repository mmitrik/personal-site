/**
 * Storage Module - Manages localStorage for arcade player data and high scores
 */
const STORAGE_KEYS = {
  PLAYER: 'arcade_player',
  SCORES: 'arcade_scores',
};

export const Storage = {
  /** Get the current player name */
  getPlayer() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.PLAYER) || null;
  },

  /** Set the player name */
  setPlayer(name) {
    localStorage.setItem(STORAGE_KEYS.PLAYER, name.toUpperCase());
  },

  /** Get all high scores */
  getAllScores() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORES)) || {};
    } catch {
      return {};
    }
  },

  /** Get high scores for a specific game */
  getGameScores(gameId) {
    const scores = this.getAllScores();
    return scores[gameId] || [];
  },

  /** Add a score for a game, keep top 10 */
  addScore(gameId, player, score) {
    const allScores = this.getAllScores();
    if (!allScores[gameId]) allScores[gameId] = [];

    allScores[gameId].push({
      player,
      score,
      date: new Date().toISOString(),
    });

    // Sort descending, keep top 10
    allScores[gameId].sort((a, b) => b.score - a.score);
    allScores[gameId] = allScores[gameId].slice(0, 10);

    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(allScores));
    return allScores[gameId];
  },

  /** Get the cumulative total score for a player across all games (best per game) */
  getPlayerTotalScore(player) {
    const allScores = this.getAllScores();
    let total = 0;
    for (const gameId of Object.keys(allScores)) {
      const best = allScores[gameId].find(s => s.player === player);
      if (best) total += best.score;
    }
    return total;
  },

  /** Check if a score is a new high score for a game */
  isHighScore(gameId, score) {
    const scores = this.getGameScores(gameId);
    if (scores.length < 10) return true;
    return score > scores[scores.length - 1].score;
  },
};
