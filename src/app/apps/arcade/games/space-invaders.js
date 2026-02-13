/**
 * Space Invaders - Defend Earth from waves of alien invaders
 * Controls: Arrow Left/Right to move, Space to shoot
 */
export default class SpaceInvaders {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;

    this.width = Math.min(options.maxWidth || 600, 600);
    this.height = Math.min(options.maxHeight || 500, 500);
    canvas.width = this.width;
    canvas.height = this.height;

    this.isPaused = false;
    this.isGameOver = false;
    this.animFrameId = null;

    this.keys = {};
    this._boundKeyDown = (e) => this._onKeyDown(e);
    this._boundKeyUp = (e) => this._onKeyUp(e);

    this._setupControls();
    this._showStartScreen();
  }

  _setupControls() {
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);

    if (this.options.touchContainer) {
      this.options.touchContainer.innerHTML = `
        <div class="touch-actions" style="gap:15px">
          <button class="touch-btn" data-key="arrowleft" style="width:60px">◀</button>
          <button class="touch-btn" data-key=" " style="width:80px; font-size:9px">FIRE</button>
          <button class="touch-btn" data-key="arrowright" style="width:60px">▶</button>
        </div>
      `;
      this.options.touchContainer.querySelectorAll('.touch-btn[data-key]').forEach(btn => {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[btn.dataset.key] = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[btn.dataset.key] = false; });
      });
    }
  }

  _onKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') {
      e.preventDefault();
      if (this._startScreenVisible) {
        this._startGame();
        return;
      }
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

    ctx.fillStyle = '#39ff14';
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE INVADERS', this.width / 2, this.height / 2 - 50);

    ctx.fillStyle = '#aaa';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('← → TO MOVE   SPACE TO FIRE', this.width / 2, this.height / 2);

    ctx.fillStyle = '#39ff14';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('PRESS SPACE TO START', this.width / 2, this.height / 2 + 50);
  }

  _startGame() {
    this._startScreenVisible = false;
    this._reset();
    this._gameLoop();
  }

  _reset() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.isGameOver = false;
    this.isPaused = false;
    this.shootCooldown = 0;
    this.enemyShootCooldown = 0;

    // Player
    this.player = {
      x: this.width / 2 - 15,
      y: this.height - 40,
      width: 30,
      height: 15,
      speed: 5,
    };

    this.bullets = [];
    this.enemyBullets = [];

    this._spawnEnemies();

    if (this.options.onScoreUpdate) this.options.onScoreUpdate(0);
    this._updateInfo();
  }

  _spawnEnemies() {
    this.enemies = [];
    const rows = Math.min(3 + Math.floor(this.wave / 2), 6);
    const cols = 8;
    const colors = ['#ff0040', '#ff6600', '#ffff00', '#39ff14', '#00ffff', '#aa00ff'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.enemies.push({
          x: 60 + c * 55,
          y: 40 + r * 35,
          width: 28,
          height: 20,
          color: colors[r % colors.length],
          alive: true,
          points: (rows - r) * 10,
        });
      }
    }

    this.enemyDir = 1;
    this.enemySpeed = 0.5 + this.wave * 0.2;
    this.enemyDropAmount = 15;
  }

  _updateInfo() {
    if (this.options.onInfoUpdate) {
      this.options.onInfoUpdate(`LIVES: ${'♥'.repeat(this.lives)}  WAVE: ${this.wave}`);
    }
  }

  _update() {
    // Player movement
    if (this.keys['arrowleft'] || this.keys['a']) {
      this.player.x = Math.max(0, this.player.x - this.player.speed);
    }
    if (this.keys['arrowright'] || this.keys['d']) {
      this.player.x = Math.min(this.width - this.player.width, this.player.x + this.player.speed);
    }

    // Shooting
    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.keys[' '] && this.shootCooldown === 0) {
      this.bullets.push({
        x: this.player.x + this.player.width / 2 - 2,
        y: this.player.y,
        width: 4,
        height: 10,
        dy: -7,
      });
      this.shootCooldown = 15;
    }

    // Update bullets
    this.bullets = this.bullets.filter(b => {
      b.y += b.dy;
      return b.y > -10;
    });

    // Enemy bullets
    this.enemyBullets = this.enemyBullets.filter(b => {
      b.y += b.dy;
      return b.y < this.height + 10;
    });

    // Enemy shooting
    this.enemyShootCooldown--;
    if (this.enemyShootCooldown <= 0) {
      const alive = this.enemies.filter(e => e.alive);
      if (alive.length > 0) {
        const shooter = alive[Math.floor(Math.random() * alive.length)];
        this.enemyBullets.push({
          x: shooter.x + shooter.width / 2 - 2,
          y: shooter.y + shooter.height,
          width: 4,
          height: 8,
          dy: 4 + this.wave * 0.3,
        });
      }
      this.enemyShootCooldown = Math.max(20, 60 - this.wave * 5);
    }

    // Move enemies
    let hitEdge = false;
    const alive = this.enemies.filter(e => e.alive);
    alive.forEach(e => {
      e.x += this.enemyDir * this.enemySpeed;
      if (e.x <= 5 || e.x + e.width >= this.width - 5) hitEdge = true;
    });

    if (hitEdge) {
      this.enemyDir *= -1;
      alive.forEach(e => e.y += this.enemyDropAmount);
    }

    // Bullet-enemy collision
    this.bullets.forEach(b => {
      alive.forEach(e => {
        if (e.alive && this._rectsCollide(b, e)) {
          e.alive = false;
          b.y = -100;
          this.score += e.points;
          if (this.options.onScoreUpdate) this.options.onScoreUpdate(this.score);
        }
      });
    });

    // Enemy bullet-player collision
    this.enemyBullets.forEach(b => {
      if (this._rectsCollide(b, this.player)) {
        b.y = this.height + 100;
        this.lives--;
        this._updateInfo();
        if (this.lives <= 0) {
          this._gameOver();
          return;
        }
      }
    });

    // Enemy reaches player
    alive.forEach(e => {
      if (e.alive && e.y + e.height >= this.player.y) {
        this._gameOver();
      }
    });

    // All enemies dead -> next wave
    if (this.enemies.every(e => !e.alive)) {
      this.wave++;
      this._spawnEnemies();
      this._updateInfo();
    }
  }

  _rectsCollide(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
  }

  _draw() {
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars
    ctx.fillStyle = '#222';
    for (let i = 0; i < 50; i++) {
      const sx = (i * 137 + 43) % this.width;
      const sy = (i * 251 + 89) % this.height;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Player ship
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(this.player.x + this.player.width / 2, this.player.y - 5);
    ctx.lineTo(this.player.x, this.player.y + this.player.height);
    ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player bullets
    ctx.fillStyle = '#39ff14';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#39ff14';
    this.bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
    ctx.shadowBlur = 0;

    // Enemy bullets
    ctx.fillStyle = '#ff0040';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff0040';
    this.enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
    ctx.shadowBlur = 0;

    // Enemies
    this.enemies.forEach(e => {
      if (!e.alive) return;
      ctx.fillStyle = e.color;
      ctx.shadowBlur = 5;
      ctx.shadowColor = e.color;
      // Simple invader shape
      const w = e.width, h = e.height;
      ctx.fillRect(e.x + 4, e.y, w - 8, h);
      ctx.fillRect(e.x, e.y + 4, w, h - 8);
      ctx.fillRect(e.x + 2, e.y + 2, 4, 4); // left eye
      ctx.fillRect(e.x + w - 6, e.y + 2, 4, 4); // right eye
      // Antennae
      ctx.fillRect(e.x + 4, e.y - 4, 3, 4);
      ctx.fillRect(e.x + w - 7, e.y - 4, 3, 4);
    });
    ctx.shadowBlur = 0;
  }

  _gameOver() {
    this.isGameOver = true;
    if (this.options.onGameOver) this.options.onGameOver(this.score);
  }

  _gameLoop() {
    if (this.isGameOver) return;
    if (!this.isPaused) {
      this._update();
      this._draw();
    }
    this.animFrameId = requestAnimationFrame(() => this._gameLoop());
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
    window.removeEventListener('keyup', this._boundKeyUp);
  }
}
