/**
 * Pong - Classic 2-player / 1-player (AI) pong game
 * Controls: Player 1: W/S, Player 2: Arrow Up/Down
 */
export default class Pong {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;

    // Canvas sizing
    this.width = Math.min(options.maxWidth || 760, 760);
    this.height = Math.min(options.maxHeight || 400, 400);
    canvas.width = this.width;
    canvas.height = this.height;

    this.isPaused = false;
    this.isGameOver = false;
    this.animFrameId = null;
    this.score = { p1: 0, p2: 0 };
    this.winScore = 7;
    this.isTwoPlayer = false;

    // Paddle properties
    this.paddleWidth = 12;
    this.paddleHeight = 80;
    this.paddleSpeed = 6;

    // Ball properties
    this.ballSize = 8;
    this.baseBallSpeed = 5;

    this.keys = {};
    this._boundKeyDown = (e) => this._onKeyDown(e);
    this._boundKeyUp = (e) => this._onKeyUp(e);

    this._setupControls();
    this._showStartScreen();
  }

  _setupControls() {
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);

    // Touch controls
    if (this.options.touchContainer) {
      this.options.touchContainer.innerHTML = `
        <div class="touch-dpad">
          <button class="touch-btn up" data-key="w">▲</button>
          <button class="touch-btn down" data-key="s">▼</button>
        </div>
        <div class="touch-actions">
          <button class="touch-btn" id="touch-mode">2P</button>
        </div>
      `;
      this.options.touchContainer.querySelectorAll('.touch-btn[data-key]').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.keys[btn.dataset.key] = true;
        });
        btn.addEventListener('touchend', (e) => {
          e.preventDefault();
          this.keys[btn.dataset.key] = false;
        });
      });
    }
  }

  _onKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && this._startScreenVisible) {
      e.preventDefault();
      this._startGame();
    }
    // Toggle 2P mode with 'T' at start screen
    if (e.key.toLowerCase() === 't' && this._startScreenVisible) {
      this.isTwoPlayer = !this.isTwoPlayer;
      this._showStartScreen();
    }
  }

  _onKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  _showStartScreen() {
    this._startScreenVisible = true;
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#00ffff';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PONG', this.width / 2, this.height / 2 - 60);

    ctx.fillStyle = '#aaa';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`MODE: ${this.isTwoPlayer ? '2 PLAYER' : '1 PLAYER (vs AI)'}`, this.width / 2, this.height / 2 - 20);
    ctx.fillText('P1: W / S    P2: ↑ / ↓', this.width / 2, this.height / 2 + 5);
    ctx.fillText('PRESS T TO TOGGLE MODE', this.width / 2, this.height / 2 + 25);

    ctx.fillStyle = '#39ff14';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('PRESS SPACE TO START', this.width / 2, this.height / 2 + 60);
  }

  _startGame() {
    this._startScreenVisible = false;
    this._reset();
    this._gameLoop();
  }

  _reset() {
    this.score = { p1: 0, p2: 0 };
    this.isGameOver = false;
    this.isPaused = false;

    this.p1 = {
      x: 20,
      y: this.height / 2 - this.paddleHeight / 2,
    };
    this.p2 = {
      x: this.width - 20 - this.paddleWidth,
      y: this.height / 2 - this.paddleHeight / 2,
    };

    this._resetBall();
    this._updateScore();
  }

  _resetBall() {
    this.ball = {
      x: this.width / 2,
      y: this.height / 2,
      dx: this.baseBallSpeed * (Math.random() > 0.5 ? 1 : -1),
      dy: this.baseBallSpeed * (Math.random() * 0.6 - 0.3),
    };
  }

  _updateScore() {
    if (this.options.onScoreUpdate) {
      this.options.onScoreUpdate(this.score.p1);
    }
    if (this.options.onInfoUpdate) {
      this.options.onInfoUpdate(`P1: ${this.score.p1}  |  P2: ${this.score.p2}  |  First to ${this.winScore}`);
    }
  }

  _update() {
    // Player 1 movement
    if (this.keys['w']) this.p1.y -= this.paddleSpeed;
    if (this.keys['s']) this.p1.y += this.paddleSpeed;

    // Player 2 / AI movement
    if (this.isTwoPlayer) {
      if (this.keys['arrowup']) this.p2.y -= this.paddleSpeed;
      if (this.keys['arrowdown']) this.p2.y += this.paddleSpeed;
    } else {
      // AI: track ball with some delay
      const aiCenter = this.p2.y + this.paddleHeight / 2;
      const diff = this.ball.y - aiCenter;
      const aiSpeed = this.paddleSpeed * 0.7;
      if (Math.abs(diff) > 10) {
        this.p2.y += diff > 0 ? aiSpeed : -aiSpeed;
      }
    }

    // Clamp paddles
    this.p1.y = Math.max(0, Math.min(this.height - this.paddleHeight, this.p1.y));
    this.p2.y = Math.max(0, Math.min(this.height - this.paddleHeight, this.p2.y));

    // Ball movement
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Ball top/bottom bounce
    if (this.ball.y <= 0 || this.ball.y >= this.height - this.ballSize) {
      this.ball.dy *= -1;
      this.ball.y = Math.max(0, Math.min(this.height - this.ballSize, this.ball.y));
    }

    // Ball paddle collision - P1
    if (
      this.ball.dx < 0 &&
      this.ball.x <= this.p1.x + this.paddleWidth &&
      this.ball.x >= this.p1.x &&
      this.ball.y + this.ballSize >= this.p1.y &&
      this.ball.y <= this.p1.y + this.paddleHeight
    ) {
      this.ball.dx = Math.abs(this.ball.dx) * 1.05; // Speed up
      const hitPos = (this.ball.y - this.p1.y) / this.paddleHeight - 0.5;
      this.ball.dy = hitPos * this.baseBallSpeed * 1.5;
    }

    // Ball paddle collision - P2
    if (
      this.ball.dx > 0 &&
      this.ball.x + this.ballSize >= this.p2.x &&
      this.ball.x <= this.p2.x + this.paddleWidth &&
      this.ball.y + this.ballSize >= this.p2.y &&
      this.ball.y <= this.p2.y + this.paddleHeight
    ) {
      this.ball.dx = -Math.abs(this.ball.dx) * 1.05;
      const hitPos = (this.ball.y - this.p2.y) / this.paddleHeight - 0.5;
      this.ball.dy = hitPos * this.baseBallSpeed * 1.5;
    }

    // Scoring
    if (this.ball.x < 0) {
      this.score.p2++;
      this._updateScore();
      this._checkWin() || this._resetBall();
    }
    if (this.ball.x > this.width) {
      this.score.p1++;
      this._updateScore();
      this._checkWin() || this._resetBall();
    }
  }

  _checkWin() {
    if (this.score.p1 >= this.winScore || this.score.p2 >= this.winScore) {
      this.isGameOver = true;
      if (this.options.onGameOver) {
        this.options.onGameOver(this.score.p1);
      }
      return true;
    }
    return false;
  }

  _draw() {
    const ctx = this.ctx;
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);

    // Center line
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 0);
    ctx.lineTo(this.width / 2, this.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scores
    ctx.fillStyle = '#333';
    ctx.font = '40px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.score.p1, this.width / 4, 60);
    ctx.fillText(this.score.p2, (3 * this.width) / 4, 60);

    // Paddles
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    ctx.fillRect(this.p1.x, this.p1.y, this.paddleWidth, this.paddleHeight);

    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.fillRect(this.p2.x, this.p2.y, this.paddleWidth, this.paddleHeight);

    // Ball
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 15;
    ctx.fillRect(this.ball.x, this.ball.y, this.ballSize, this.ballSize);

    ctx.shadowBlur = 0;
  }

  _gameLoop() {
    if (this.isGameOver) return;
    if (!this.isPaused) {
      this._update();
      this._draw();
    }
    this.animFrameId = requestAnimationFrame(() => this._gameLoop());
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  restart() {
    this.isGameOver = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this._reset();
    this._gameLoop();
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup', this._boundKeyUp);
  }
}
