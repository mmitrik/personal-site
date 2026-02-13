/**
 * Pac-Man (Simplified) - Eat dots, avoid ghosts, grab power pellets
 * Controls: Arrow keys or WASD
 */
export default class PacMan {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;

    this.tileSize = 24;
    // Map layout: 0 = wall, 1 = path, 2 = dot, 3 = power pellet, 4 = empty (eaten)
    this.MAP = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,2,2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,0],
      [0,3,0,0,2,0,0,0,0,2,0,2,0,0,0,0,2,0,0,3,0],
      [0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
      [0,2,0,0,2,0,2,0,0,0,0,0,0,2,0,2,0,0,2,0,0],
      [0,2,2,2,2,0,2,2,2,0,0,2,2,2,0,2,2,2,2,0,0],
      [0,0,0,0,2,0,0,0,1,0,0,1,0,0,0,2,0,0,0,0,0],
      [0,0,0,0,2,0,1,1,1,1,1,1,1,1,0,2,0,0,0,0,0],
      [0,0,0,0,2,0,1,0,0,1,1,0,0,1,0,2,0,0,0,0,0],
      [1,1,1,1,2,1,1,0,1,1,1,1,0,1,1,2,1,1,1,1,1],
      [0,0,0,0,2,0,1,0,0,0,0,0,0,1,0,2,0,0,0,0,0],
      [0,0,0,0,2,0,1,1,1,1,1,1,1,1,0,2,0,0,0,0,0],
      [0,0,0,0,2,0,1,0,0,0,0,0,0,1,0,2,0,0,0,0,0],
      [0,2,2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,0],
      [0,2,0,0,2,0,0,0,0,2,0,2,0,0,0,0,2,0,0,2,0],
      [0,3,2,0,2,2,2,2,2,2,1,2,2,2,2,2,2,0,2,3,0],
      [0,0,2,0,2,0,2,0,0,0,0,0,0,2,0,2,0,0,2,0,0],
      [0,2,2,2,2,0,2,2,2,2,0,2,2,2,0,2,2,2,2,2,0],
      [0,2,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,2,0],
      [0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];

    this.cols = this.MAP[0].length;
    this.rows = this.MAP.length;
    canvas.width = this.cols * this.tileSize;
    canvas.height = this.rows * this.tileSize;

    this.isPaused = false;
    this.isGameOver = false;
    this.animFrameId = null;
    this.lastMove = 0;
    this.moveInterval = 150;

    this._boundKeyDown = (e) => this._onKeyDown(e);
    this._setupControls();
    this._showStartScreen();
  }

  _setupControls() {
    window.addEventListener('keydown', this._boundKeyDown);

    if (this.options.touchContainer) {
      this.options.touchContainer.innerHTML = `
        <div class="touch-dpad">
          <button class="touch-btn up" data-dir="up">▲</button>
          <button class="touch-btn left" data-dir="left">◀</button>
          <button class="touch-btn right" data-dir="right">▶</button>
          <button class="touch-btn down" data-dir="down">▼</button>
        </div>
      `;
      this.options.touchContainer.querySelectorAll('.touch-btn[data-dir]').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.nextDir = btn.dataset.dir;
        });
      });
    }
  }

  _onKeyDown(e) {
    const map = {
      arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
    };
    const dir = map[e.key.toLowerCase()];
    if (dir) {
      e.preventDefault();
      this.nextDir = dir;
    }
    if (e.key === ' ' && this._startScreenVisible) {
      e.preventDefault();
      this._startGame();
    }
  }

  _showStartScreen() {
    this._startScreenVisible = true;
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#ffff00';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAC-MAN', this.canvas.width / 2, this.canvas.height / 2 - 50);

    ctx.fillStyle = '#aaa';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('ARROW KEYS OR WASD TO MOVE', this.canvas.width / 2, this.canvas.height / 2);
    ctx.fillText('EAT ALL DOTS TO WIN!', this.canvas.width / 2, this.canvas.height / 2 + 20);

    ctx.fillStyle = '#39ff14';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('PRESS SPACE TO START', this.canvas.width / 2, this.canvas.height / 2 + 60);
  }

  _startGame() {
    this._startScreenVisible = false;
    this._reset();
    this._gameLoop();
  }

  _reset() {
    // Deep copy map
    this.map = this.MAP.map(row => [...row]);
    this.score = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.dotsRemaining = 0;
    this.powerMode = false;
    this.powerTimer = 0;
    this.mouthOpen = true;
    this.mouthTimer = 0;

    // Count dots
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.map[y][x] === 2 || this.map[y][x] === 3) this.dotsRemaining++;
      }
    }

    // Pac-Man position
    this.pac = { x: 10, y: 15, dir: 'right' };
    this.nextDir = 'right';

    // Ghosts
    const ghostColors = ['#ff0040', '#ff6600', '#00ffff', '#ff99cc'];
    this.ghosts = [
      { x: 9, y: 9, color: ghostColors[0], dir: 'up', scared: false },
      { x: 10, y: 9, color: ghostColors[1], dir: 'up', scared: false },
      { x: 11, y: 9, color: ghostColors[2], dir: 'down', scared: false },
      { x: 10, y: 8, color: ghostColors[3], dir: 'left', scared: false },
    ];

    this.ghostEatCombo = 0;

    if (this.options.onScoreUpdate) this.options.onScoreUpdate(0);
    if (this.options.onInfoUpdate) this.options.onInfoUpdate(`DOTS: ${this.dotsRemaining}`);
  }

  _canMove(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
      // Allow wrap on row 9
      if (y === 9 && (x < 0 || x >= this.cols)) return true;
      return false;
    }
    return this.map[y][x] !== 0;
  }

  _move(entity) {
    const dirs = {
      up: { dx: 0, dy: -1 },
      down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 },
      right: { dx: 1, dy: 0 },
    };
    const d = dirs[entity.dir];
    if (!d) return;
    let nx = entity.x + d.dx;
    let ny = entity.y + d.dy;

    // Wrap around
    if (nx < 0) nx = this.cols - 1;
    if (nx >= this.cols) nx = 0;

    if (this._canMove(nx, ny)) {
      entity.x = nx;
      entity.y = ny;
    }
  }

  _update(now) {
    if (now - this.lastMove < this.moveInterval) return;
    this.lastMove = now;

    // Toggle mouth
    this.mouthTimer++;
    if (this.mouthTimer % 2 === 0) this.mouthOpen = !this.mouthOpen;

    // Try next direction for pac
    const dirs = {
      up: { dx: 0, dy: -1 }, down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 },
    };

    if (this.nextDir) {
      const nd = dirs[this.nextDir];
      let tnx = this.pac.x + nd.dx;
      let tny = this.pac.y + nd.dy;
      if (tnx < 0) tnx = this.cols - 1;
      if (tnx >= this.cols) tnx = 0;
      if (this._canMove(tnx, tny)) {
        this.pac.dir = this.nextDir;
      }
    }

    this._move(this.pac);

    // Eat dot
    const tile = this.map[this.pac.y] && this.map[this.pac.y][this.pac.x];
    if (tile === 2) {
      this.map[this.pac.y][this.pac.x] = 4;
      this.score += 10;
      this.dotsRemaining--;
    } else if (tile === 3) {
      this.map[this.pac.y][this.pac.x] = 4;
      this.score += 50;
      this.dotsRemaining--;
      this.powerMode = true;
      this.powerTimer = 30; // ~30 moves
      this.ghostEatCombo = 0;
      this.ghosts.forEach(g => g.scared = true);
    }

    if (this.options.onScoreUpdate) this.options.onScoreUpdate(this.score);
    if (this.options.onInfoUpdate) {
      this.options.onInfoUpdate(
        `DOTS: ${this.dotsRemaining}${this.powerMode ? '  ★ POWER MODE ★' : ''}`
      );
    }

    // Check win
    if (this.dotsRemaining <= 0) {
      this.isGameOver = true;
      this.score += 1000; // Bonus for clearing
      if (this.options.onScoreUpdate) this.options.onScoreUpdate(this.score);
      if (this.options.onGameOver) this.options.onGameOver(this.score);
      return;
    }

    // Power timer
    if (this.powerMode) {
      this.powerTimer--;
      if (this.powerTimer <= 0) {
        this.powerMode = false;
        this.ghosts.forEach(g => g.scared = false);
      }
    }

    // Move ghosts
    this.ghosts.forEach(ghost => {
      this._moveGhost(ghost);

      // Check collision
      if (ghost.x === this.pac.x && ghost.y === this.pac.y) {
        if (ghost.scared) {
          // Eat ghost
          this.ghostEatCombo++;
          this.score += 200 * this.ghostEatCombo;
          if (this.options.onScoreUpdate) this.options.onScoreUpdate(this.score);
          // Reset ghost position
          ghost.x = 10;
          ghost.y = 9;
          ghost.scared = false;
        } else {
          this._gameOver();
        }
      }
    });
  }

  _moveGhost(ghost) {
    const dirs = ['up', 'down', 'left', 'right'];
    const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const deltas = {
      up: { dx: 0, dy: -1 }, down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 },
    };

    // Get valid directions (not opposite, not walls)
    let valid = dirs.filter(d => {
      if (d === opposite[ghost.dir]) return false;
      const dd = deltas[d];
      let nx = ghost.x + dd.dx;
      let ny = ghost.y + dd.dy;
      if (nx < 0) nx = this.cols - 1;
      if (nx >= this.cols) nx = 0;
      return this._canMove(nx, ny);
    });

    if (valid.length === 0) {
      valid = dirs.filter(d => {
        const dd = deltas[d];
        let nx = ghost.x + dd.dx;
        let ny = ghost.y + dd.dy;
        if (nx < 0) nx = this.cols - 1;
        if (nx >= this.cols) nx = 0;
        return this._canMove(nx, ny);
      });
    }

    if (valid.length === 0) return;

    if (ghost.scared) {
      // Run away from pac-man (pick direction that increases distance)
      valid.sort((a, b) => {
        const da = deltas[a], db = deltas[b];
        const distA = Math.abs(ghost.x + da.dx - this.pac.x) + Math.abs(ghost.y + da.dy - this.pac.y);
        const distB = Math.abs(ghost.x + db.dx - this.pac.x) + Math.abs(ghost.y + db.dy - this.pac.y);
        return distB - distA;
      });
    } else {
      // Chase pac-man (pick direction that decreases distance) with some randomness
      if (Math.random() < 0.7) {
        valid.sort((a, b) => {
          const da = deltas[a], db = deltas[b];
          const distA = Math.abs(ghost.x + da.dx - this.pac.x) + Math.abs(ghost.y + da.dy - this.pac.y);
          const distB = Math.abs(ghost.x + db.dx - this.pac.x) + Math.abs(ghost.y + db.dy - this.pac.y);
          return distA - distB;
        });
      } else {
        // Random
        valid.sort(() => Math.random() - 0.5);
      }
    }

    ghost.dir = valid[0];
    this._move(ghost);
  }

  _draw() {
    const ctx = this.ctx;
    const ts = this.tileSize;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw map
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.map[y][x];
        if (tile === 0) {
          // Wall
          ctx.fillStyle = '#1a1a6e';
          ctx.fillRect(x * ts, y * ts, ts, ts);
          ctx.strokeStyle = '#3333aa';
          ctx.lineWidth = 1;
          ctx.strokeRect(x * ts + 1, y * ts + 1, ts - 2, ts - 2);
        } else if (tile === 2) {
          // Dot
          ctx.fillStyle = '#ffcc00';
          ctx.beginPath();
          ctx.arc(x * ts + ts / 2, y * ts + ts / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === 3) {
          // Power pellet
          ctx.fillStyle = '#ffcc00';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffcc00';
          ctx.beginPath();
          ctx.arc(x * ts + ts / 2, y * ts + ts / 2, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Draw Pac-Man
    const px = this.pac.x * ts + ts / 2;
    const py = this.pac.y * ts + ts / 2;
    const angles = {
      right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2,
    };
    const angle = angles[this.pac.dir] || 0;
    const mouthAngle = this.mouthOpen ? 0.3 : 0.05;

    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.arc(px, py, ts / 2 - 2, angle + mouthAngle, angle + Math.PI * 2 - mouthAngle);
    ctx.lineTo(px, py);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw ghosts
    this.ghosts.forEach(ghost => {
      const gx = ghost.x * ts;
      const gy = ghost.y * ts;
      const color = ghost.scared ? '#4444ff' : ghost.color;

      ctx.fillStyle = color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;

      // Ghost body (rounded top, wavy bottom)
      ctx.beginPath();
      ctx.arc(gx + ts / 2, gy + ts / 2 - 2, ts / 2 - 3, Math.PI, 0);
      ctx.lineTo(gx + ts - 3, gy + ts - 3);
      // Wavy bottom
      const waveW = (ts - 6) / 3;
      ctx.lineTo(gx + ts - 3 - waveW / 2, gy + ts - 7);
      ctx.lineTo(gx + ts - 3 - waveW, gy + ts - 3);
      ctx.lineTo(gx + ts - 3 - waveW * 1.5, gy + ts - 7);
      ctx.lineTo(gx + ts - 3 - waveW * 2, gy + ts - 3);
      ctx.lineTo(gx + ts - 3 - waveW * 2.5, gy + ts - 7);
      ctx.lineTo(gx + 3, gy + ts - 3);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(gx + ts / 2 - 4, gy + ts / 2 - 3, 3, 0, Math.PI * 2);
      ctx.arc(gx + ts / 2 + 4, gy + ts / 2 - 3, 3, 0, Math.PI * 2);
      ctx.fill();

      if (!ghost.scared) {
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(gx + ts / 2 - 3, gy + ts / 2 - 3, 1.5, 0, Math.PI * 2);
        ctx.arc(gx + ts / 2 + 5, gy + ts / 2 - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
    });
  }

  _gameOver() {
    this.isGameOver = true;
    if (this.options.onGameOver) this.options.onGameOver(this.score);
  }

  _gameLoop(now = performance.now()) {
    if (this.isGameOver) return;
    if (!this.isPaused) {
      this._update(now);
      this._draw();
    }
    this.animFrameId = requestAnimationFrame((t) => this._gameLoop(t));
  }

  pause() { this.isPaused = true; }
  resume() { this.isPaused = false; }

  restart() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this._reset();
    this._gameLoop();
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('keydown', this._boundKeyDown);
  }
}
