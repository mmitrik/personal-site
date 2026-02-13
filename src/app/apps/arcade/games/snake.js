/**
 * Snake - Classic snake game with grid-based movement
 * Controls: Arrow keys or WASD, swipe on mobile
 */
export default class Snake {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;

    this.tileSize = 20;
    this.cols = Math.floor(Math.min(options.maxWidth || 600, 600) / this.tileSize);
    this.rows = Math.floor(Math.min(options.maxHeight || 400, 400) / this.tileSize);
    canvas.width = this.cols * this.tileSize;
    canvas.height = this.rows * this.tileSize;

    this.isPaused = false;
    this.isGameOver = false;
    this.intervalId = null;

    this.keys = {};
    this._boundKeyDown = (e) => this._onKeyDown(e);
    this._setupControls();
    this._showStartScreen();
  }

  _setupControls() {
    window.addEventListener('keydown', this._boundKeyDown);

    // Swipe detection
    let touchStartX = 0, touchStartY = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy)) {
        this._setDirection(dx > 0 ? 'right' : 'left');
      } else {
        this._setDirection(dy > 0 ? 'down' : 'up');
      }
    }, { passive: true });

    // Touch controls
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
          this._setDirection(btn.dataset.dir);
        });
      });
    }
  }

  _onKeyDown(e) {
    const keyMap = {
      arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
    };
    const dir = keyMap[e.key.toLowerCase()];
    if (dir) {
      e.preventDefault();
      this._setDirection(dir);
    }
    if (e.key === ' ' && this._startScreenVisible) {
      e.preventDefault();
      this._startGame();
    }
  }

  _setDirection(dir) {
    const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (dir !== opposite[this.direction]) {
      this.nextDirection = dir;
    }
  }

  _showStartScreen() {
    this._startScreenVisible = true;
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#39ff14';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SNAKE', this.canvas.width / 2, this.canvas.height / 2 - 40);

    ctx.fillStyle = '#aaa';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('ARROW KEYS OR WASD TO MOVE', this.canvas.width / 2, this.canvas.height / 2);

    ctx.fillStyle = '#39ff14';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('PRESS SPACE TO START', this.canvas.width / 2, this.canvas.height / 2 + 40);
  }

  _startGame() {
    this._startScreenVisible = false;
    this._reset();
    this._startLoop();
  }

  _reset() {
    this.score = 0;
    this.direction = 'right';
    this.nextDirection = 'right';
    this.isGameOver = false;
    this.isPaused = false;
    this.baseSpeed = 150;
    this.speed = this.baseSpeed;

    // Init snake in center
    const startX = Math.floor(this.cols / 2);
    const startY = Math.floor(this.rows / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];

    this._spawnFood();

    if (this.options.onScoreUpdate) this.options.onScoreUpdate(0);
    if (this.options.onInfoUpdate) this.options.onInfoUpdate(`LENGTH: 3`);
  }

  _spawnFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows),
      };
    } while (this.snake.some(s => s.x === pos.x && s.y === pos.y));
    this.food = pos;
  }

  _startLoop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (!this.isPaused && !this.isGameOver) {
        this._update();
        this._draw();
      }
    }, this.speed);
  }

  _update() {
    this.direction = this.nextDirection;

    const head = { ...this.snake[0] };
    switch (this.direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
      this._gameOver();
      return;
    }

    // Self collision
    if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
      this._gameOver();
      return;
    }

    this.snake.unshift(head);

    // Food check
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      if (this.options.onScoreUpdate) this.options.onScoreUpdate(this.score);
      if (this.options.onInfoUpdate) this.options.onInfoUpdate(`LENGTH: ${this.snake.length}`);
      this._spawnFood();

      // Speed up every 5 food
      if (this.snake.length % 5 === 0 && this.speed > 60) {
        this.speed -= 10;
        this._startLoop();
      }
    } else {
      this.snake.pop();
    }
  }

  _draw() {
    const ctx = this.ctx;
    const ts = this.tileSize;

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid (subtle)
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        ctx.strokeRect(x * ts, y * ts, ts, ts);
      }
    }

    // Snake
    this.snake.forEach((seg, i) => {
      const shade = i === 0 ? '#39ff14' : `rgb(0, ${200 - i * 3}, 0)`;
      ctx.fillStyle = shade;
      ctx.shadowBlur = i === 0 ? 10 : 0;
      ctx.shadowColor = '#39ff14';
      ctx.fillRect(seg.x * ts + 1, seg.y * ts + 1, ts - 2, ts - 2);
    });

    ctx.shadowBlur = 0;

    // Food
    ctx.fillStyle = '#ff0040';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff0040';
    ctx.beginPath();
    ctx.arc(this.food.x * ts + ts / 2, this.food.y * ts + ts / 2, ts / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _gameOver() {
    this.isGameOver = true;
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.options.onGameOver) this.options.onGameOver(this.score);
  }

  pause() { this.isPaused = true; }
  resume() { this.isPaused = false; }

  restart() {
    if (this.intervalId) clearInterval(this.intervalId);
    this._reset();
    this._startLoop();
  }

  destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    window.removeEventListener('keydown', this._boundKeyDown);
  }
}
