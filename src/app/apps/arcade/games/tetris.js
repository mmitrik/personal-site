/**
 * Tetris - Classic tetromino puzzle game
 * Controls: Arrow keys to move/rotate, Space to hard drop
 */
export default class Tetris {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;

    this.tileSize = 25;
    this.cols = 10;
    this.rows = 20;
    canvas.width = this.cols * this.tileSize + 150; // Extra space for next piece
    canvas.height = this.rows * this.tileSize;

    this.isPaused = false;
    this.isGameOver = false;
    this.animFrameId = null;

    // Tetromino shapes (each rotation)
    this.SHAPES = {
      I: { color: '#00ffff', shape: [[1,1,1,1]] },
      O: { color: '#ffff00', shape: [[1,1],[1,1]] },
      T: { color: '#aa00ff', shape: [[0,1,0],[1,1,1]] },
      S: { color: '#39ff14', shape: [[0,1,1],[1,1,0]] },
      Z: { color: '#ff0040', shape: [[1,1,0],[0,1,1]] },
      J: { color: '#4444ff', shape: [[1,0,0],[1,1,1]] },
      L: { color: '#ff6600', shape: [[0,0,1],[1,1,1]] },
    };
    this.SHAPE_KEYS = Object.keys(this.SHAPES);

    this._boundKeyDown = (e) => this._onKeyDown(e);
    this._setupControls();
    this._showStartScreen();
  }

  _setupControls() {
    window.addEventListener('keydown', this._boundKeyDown);

    if (this.options.touchContainer) {
      this.options.touchContainer.innerHTML = `
        <div class="touch-dpad">
          <button class="touch-btn up" data-action="rotate">↻</button>
          <button class="touch-btn left" data-action="left">◀</button>
          <button class="touch-btn right" data-action="right">▶</button>
          <button class="touch-btn down" data-action="down">▼</button>
        </div>
        <div class="touch-actions">
          <button class="touch-btn" data-action="drop" style="width:80px; font-size:9px;">DROP</button>
        </div>
      `;
      this.options.touchContainer.querySelectorAll('.touch-btn[data-action]').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this._handleAction(btn.dataset.action);
        });
      });
    }
  }

  _onKeyDown(e) {
    if (e.key === ' ' && this._startScreenVisible) {
      e.preventDefault();
      this._startGame();
      return;
    }
    if (this.isPaused || this.isGameOver) return;

    const actions = {
      arrowleft: 'left', arrowright: 'right', arrowdown: 'down',
      arrowup: 'rotate', ' ': 'drop',
    };
    const action = actions[e.key.toLowerCase()];
    if (action) {
      e.preventDefault();
      this._handleAction(action);
    }
  }

  _handleAction(action) {
    if (this.isPaused || this.isGameOver) return;
    switch (action) {
      case 'left': this._movePiece(-1, 0); break;
      case 'right': this._movePiece(1, 0); break;
      case 'down': this._movePiece(0, 1); break;
      case 'rotate': this._rotatePiece(); break;
      case 'drop': this._hardDrop(); break;
    }
  }

  _showStartScreen() {
    this._startScreenVisible = true;
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#aa00ff';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    const cx = (this.cols * this.tileSize) / 2;
    ctx.fillText('TETRIS', cx, this.canvas.height / 2 - 50);

    ctx.fillStyle = '#aaa';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('← → MOVE  ↑ ROTATE', cx, this.canvas.height / 2);
    ctx.fillText('↓ SOFT DROP  SPACE HARD DROP', cx, this.canvas.height / 2 + 20);

    ctx.fillStyle = '#39ff14';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('PRESS SPACE TO START', cx, this.canvas.height / 2 + 60);
  }

  _startGame() {
    this._startScreenVisible = false;
    this._reset();
    this.lastDrop = performance.now();
    this._gameLoop();
  }

  _reset() {
    this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.dropInterval = 800;

    this.nextPiece = this._randomPiece();
    this._spawnPiece();

    if (this.options.onScoreUpdate) this.options.onScoreUpdate(0);
    if (this.options.onInfoUpdate) this.options.onInfoUpdate('LEVEL: 1  LINES: 0');
  }

  _randomPiece() {
    const key = this.SHAPE_KEYS[Math.floor(Math.random() * this.SHAPE_KEYS.length)];
    const def = this.SHAPES[key];
    return {
      shape: def.shape.map(row => [...row]),
      color: def.color,
      name: key,
    };
  }

  _spawnPiece() {
    this.current = this.nextPiece;
    this.nextPiece = this._randomPiece();
    this.currentX = Math.floor((this.cols - this.current.shape[0].length) / 2);
    this.currentY = 0;

    if (this._collides(this.current.shape, this.currentX, this.currentY)) {
      this.isGameOver = true;
      if (this.options.onGameOver) this.options.onGameOver(this.score);
    }
  }

  _collides(shape, px, py) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const bx = px + x;
          const by = py + y;
          if (bx < 0 || bx >= this.cols || by >= this.rows) return true;
          if (by >= 0 && this.board[by][bx]) return true;
        }
      }
    }
    return false;
  }

  _movePiece(dx, dy) {
    if (!this._collides(this.current.shape, this.currentX + dx, this.currentY + dy)) {
      this.currentX += dx;
      this.currentY += dy;
      return true;
    }
    return false;
  }

  _rotatePiece() {
    const shape = this.current.shape;
    const h = shape.length;
    const w = shape[0].length;
    const rotated = Array.from({ length: w }, (_, i) =>
      Array.from({ length: h }, (_, j) => shape[h - 1 - j][i])
    );

    // Wall kick: try offsets
    for (const offset of [0, -1, 1, -2, 2]) {
      if (!this._collides(rotated, this.currentX + offset, this.currentY)) {
        this.current.shape = rotated;
        this.currentX += offset;
        return;
      }
    }
  }

  _hardDrop() {
    while (this._movePiece(0, 1)) { /* drop */ }
    this._lockPiece();
  }

  _lockPiece() {
    const shape = this.current.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && this.currentY + y >= 0) {
          this.board[this.currentY + y][this.currentX + x] = this.current.color;
        }
      }
    }
    this._clearLines();
    this._spawnPiece();
  }

  _clearLines() {
    let cleared = 0;
    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== null)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.cols).fill(null));
        cleared++;
        y++; // Re-check this row
      }
    }

    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800];
      this.score += (points[cleared] || 800) * this.level;
      this.linesCleared += cleared;
      this.level = Math.floor(this.linesCleared / 10) + 1;
      this.dropInterval = Math.max(100, 800 - (this.level - 1) * 70);

      if (this.options.onScoreUpdate) this.options.onScoreUpdate(this.score);
      if (this.options.onInfoUpdate) {
        this.options.onInfoUpdate(`LEVEL: ${this.level}  LINES: ${this.linesCleared}`);
      }
    }
  }

  _update(now) {
    if (now - this.lastDrop > this.dropInterval) {
      if (!this._movePiece(0, 1)) {
        this._lockPiece();
      }
      this.lastDrop = now;
    }
  }

  _draw() {
    const ctx = this.ctx;
    const ts = this.tileSize;
    const boardWidth = this.cols * ts;

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Board border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, boardWidth, this.rows * ts);

    // Grid
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        ctx.strokeRect(x * ts, y * ts, ts, ts);
      }
    }

    // Placed pieces
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x]) {
          ctx.fillStyle = this.board[y][x];
          ctx.fillRect(x * ts + 1, y * ts + 1, ts - 2, ts - 2);
          // Inner highlight
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(x * ts + 2, y * ts + 2, ts / 2 - 2, ts / 2 - 2);
        }
      }
    }

    // Ghost piece (drop preview)
    let ghostY = this.currentY;
    while (!this._collides(this.current.shape, this.currentX, ghostY + 1)) {
      ghostY++;
    }
    if (ghostY !== this.currentY) {
      ctx.globalAlpha = 0.2;
      this.current.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell) {
            ctx.fillStyle = this.current.color;
            ctx.fillRect((this.currentX + dx) * ts + 1, (ghostY + dy) * ts + 1, ts - 2, ts - 2);
          }
        });
      });
      ctx.globalAlpha = 1;
    }

    // Current piece
    ctx.shadowBlur = 5;
    ctx.shadowColor = this.current.color;
    this.current.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell && this.currentY + dy >= 0) {
          ctx.fillStyle = this.current.color;
          ctx.fillRect((this.currentX + dx) * ts + 1, (this.currentY + dy) * ts + 1, ts - 2, ts - 2);
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect((this.currentX + dx) * ts + 2, (this.currentY + dy) * ts + 2, ts / 2 - 2, ts / 2 - 2);
        }
      });
    });
    ctx.shadowBlur = 0;

    // Next piece panel
    const panelX = boardWidth + 15;
    ctx.fillStyle = '#0d0d2b';
    ctx.fillRect(panelX, 0, 130, 120);
    ctx.strokeStyle = '#1a1a4a';
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, 0, 130, 120);

    ctx.fillStyle = '#00ffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT', panelX + 65, 20);

    const np = this.nextPiece;
    const npOffX = panelX + 65 - (np.shape[0].length * ts) / 2;
    const npOffY = 40;
    np.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          ctx.fillStyle = np.color;
          ctx.fillRect(npOffX + dx * ts + 1, npOffY + dy * ts + 1, ts - 2, ts - 2);
        }
      });
    });

    // Level / lines in sidebar
    ctx.fillStyle = '#ffff00';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`LVL ${this.level}`, panelX + 65, 150);
    ctx.fillText(`${this.linesCleared} LINES`, panelX + 65, 170);
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
    this.lastDrop = performance.now();
    this._gameLoop();
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('keydown', this._boundKeyDown);
  }
}
