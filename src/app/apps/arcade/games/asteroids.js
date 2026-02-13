/**
 * Asteroids - Navigate space and blast asteroids to bits
 * Controls: Arrow keys (Left/Right rotate, Up thrust, Space shoot)
 */
export default class Asteroids {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;

    this.width = Math.min(options.maxWidth || 700, 700);
    this.height = Math.min(options.maxHeight || 500, 500);
    canvas.width = this.width;
    canvas.height = this.height;

    this.isPaused = false;
    this.isGameOver = false;
    this.animFrameId = null;

    this.keys = {};
    this._boundKeyDown = (e) => { this.keys[e.key.toLowerCase()] = true; this._handleStart(e); };
    this._boundKeyUp = (e) => { this.keys[e.key.toLowerCase()] = false; };

    this._setupControls();
    this._showStartScreen();
  }

  _setupControls() {
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);

    if (this.options.touchContainer) {
      this.options.touchContainer.innerHTML = `
        <div class="touch-actions" style="gap:10px">
          <button class="touch-btn" data-key="arrowleft">↺</button>
          <button class="touch-btn" data-key="arrowup" style="font-size:12px">▲</button>
          <button class="touch-btn" data-key="arrowright">↻</button>
          <button class="touch-btn" data-key=" " style="width:70px; font-size:9px">FIRE</button>
        </div>
      `;
      this.options.touchContainer.querySelectorAll('.touch-btn[data-key]').forEach(btn => {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[btn.dataset.key] = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[btn.dataset.key] = false; });
      });
    }
  }

  _handleStart(e) {
    if (e.key === ' ' && this._startScreenVisible) {
      e.preventDefault();
      this._startGame();
    }
  }

  _showStartScreen() {
    this._startScreenVisible = true;
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#fff';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ASTEROIDS', this.width / 2, this.height / 2 - 50);

    ctx.fillStyle = '#aaa';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('← → ROTATE   ↑ THRUST', this.width / 2, this.height / 2);
    ctx.fillText('SPACE TO SHOOT', this.width / 2, this.height / 2 + 20);

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
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.isGameOver = false;
    this.isPaused = false;
    this.shootCooldown = 0;
    this.invincible = 0;

    // Ship
    this.ship = {
      x: this.width / 2,
      y: this.height / 2,
      angle: -Math.PI / 2, // pointing up
      dx: 0,
      dy: 0,
      radius: 12,
      thrusting: false,
    };

    this.bullets = [];
    this.particles = [];
    this._spawnAsteroids(4 + this.level);

    if (this.options.onScoreUpdate) this.options.onScoreUpdate(0);
    this._updateInfo();
  }

  _spawnAsteroids(count) {
    this.asteroids = [];
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.random() * this.width;
        y = Math.random() * this.height;
      } while (Math.hypot(x - this.ship.x, y - this.ship.y) < 100);

      this.asteroids.push(this._createAsteroid(x, y, 3));
    }
  }

  _createAsteroid(x, y, size) {
    const speed = (1 + Math.random()) * (4 - size) * 0.7;
    const angle = Math.random() * Math.PI * 2;
    const radii = [];
    const numVerts = 8 + Math.floor(Math.random() * 5);
    const baseRadius = size * 15;
    for (let i = 0; i < numVerts; i++) {
      radii.push(baseRadius * (0.7 + Math.random() * 0.3));
    }
    return {
      x, y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size,
      radius: baseRadius,
      radii,
      numVerts,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
    };
  }

  _updateInfo() {
    if (this.options.onInfoUpdate) {
      this.options.onInfoUpdate(`LIVES: ${'♥'.repeat(this.lives)}  LEVEL: ${this.level}`);
    }
  }

  _wrap(obj) {
    if (obj.x < -20) obj.x = this.width + 20;
    if (obj.x > this.width + 20) obj.x = -20;
    if (obj.y < -20) obj.y = this.height + 20;
    if (obj.y > this.height + 20) obj.y = -20;
  }

  _update() {
    const ship = this.ship;

    // Rotation
    if (this.keys['arrowleft'] || this.keys['a']) ship.angle -= 0.07;
    if (this.keys['arrowright'] || this.keys['d']) ship.angle += 0.07;

    // Thrust
    ship.thrusting = !!(this.keys['arrowup'] || this.keys['w']);
    if (ship.thrusting) {
      ship.dx += Math.cos(ship.angle) * 0.15;
      ship.dy += Math.sin(ship.angle) * 0.15;
    }

    // Friction
    ship.dx *= 0.99;
    ship.dy *= 0.99;

    // Clamp speed
    const speed = Math.hypot(ship.dx, ship.dy);
    if (speed > 6) {
      ship.dx = (ship.dx / speed) * 6;
      ship.dy = (ship.dy / speed) * 6;
    }

    // Move ship
    ship.x += ship.dx;
    ship.y += ship.dy;
    this._wrap(ship);

    // Shooting
    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.keys[' '] && this.shootCooldown === 0) {
      this.bullets.push({
        x: ship.x + Math.cos(ship.angle) * ship.radius,
        y: ship.y + Math.sin(ship.angle) * ship.radius,
        dx: Math.cos(ship.angle) * 8 + ship.dx * 0.5,
        dy: Math.sin(ship.angle) * 8 + ship.dy * 0.5,
        life: 50,
      });
      this.shootCooldown = 8;
    }

    // Update bullets
    this.bullets = this.bullets.filter(b => {
      b.x += b.dx;
      b.y += b.dy;
      this._wrap(b);
      b.life--;
      return b.life > 0;
    });

    // Update asteroids
    this.asteroids.forEach(a => {
      a.x += a.dx;
      a.y += a.dy;
      a.rotation += a.rotSpeed;
      this._wrap(a);
    });

    // Bullet-asteroid collision
    this.bullets.forEach(b => {
      this.asteroids.forEach(a => {
        if (Math.hypot(b.x - a.x, b.y - a.y) < a.radius) {
          b.life = 0;
          this._splitAsteroid(a);
          const points = [0, 100, 50, 20];
          this.score += points[a.size] || 20;
          if (this.options.onScoreUpdate) this.options.onScoreUpdate(this.score);
        }
      });
    });

    // Remove destroyed asteroids
    this.asteroids = this.asteroids.filter(a => a.size > 0);

    // Ship-asteroid collision
    if (this.invincible > 0) {
      this.invincible--;
    } else {
      this.asteroids.forEach(a => {
        if (a.size > 0 && Math.hypot(ship.x - a.x, ship.y - a.y) < a.radius + ship.radius - 4) {
          this.lives--;
          this._updateInfo();
          this._spawnExplosion(ship.x, ship.y);
          if (this.lives <= 0) {
            this._gameOver();
            return;
          }
          // Respawn ship
          ship.x = this.width / 2;
          ship.y = this.height / 2;
          ship.dx = 0;
          ship.dy = 0;
          this.invincible = 120; // 2 seconds invincibility
        }
      });
    }

    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.life--;
      return p.life > 0;
    });

    // Level complete
    if (this.asteroids.length === 0) {
      this.level++;
      this._spawnAsteroids(4 + this.level);
      this._updateInfo();
    }
  }

  _splitAsteroid(asteroid) {
    this._spawnExplosion(asteroid.x, asteroid.y);
    if (asteroid.size > 1) {
      for (let i = 0; i < 2; i++) {
        this.asteroids.push(
          this._createAsteroid(asteroid.x, asteroid.y, asteroid.size - 1)
        );
      }
    }
    asteroid.size = 0; // Mark for removal
  }

  _spawnExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3;
      this.particles.push({
        x, y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 20 + Math.random() * 20,
      });
    }
  }

  _draw() {
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars
    ctx.fillStyle = '#222';
    for (let i = 0; i < 60; i++) {
      const sx = (i * 173 + 47) % this.width;
      const sy = (i * 257 + 91) % this.height;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Draw ship
    const ship = this.ship;
    if (!this.isGameOver) {
      // Invincibility blink
      if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2) {
        // skip drawing
      } else {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);

        ctx.strokeStyle = '#00ffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ship.radius, 0);
        ctx.lineTo(-ship.radius * 0.8, -ship.radius * 0.7);
        ctx.lineTo(-ship.radius * 0.4, 0);
        ctx.lineTo(-ship.radius * 0.8, ship.radius * 0.7);
        ctx.closePath();
        ctx.stroke();

        // Thrust flame
        if (ship.thrusting) {
          ctx.fillStyle = '#ff6600';
          ctx.shadowColor = '#ff6600';
          ctx.beginPath();
          ctx.moveTo(-ship.radius * 0.5, -ship.radius * 0.3);
          ctx.lineTo(-ship.radius * (1 + Math.random() * 0.5), 0);
          ctx.lineTo(-ship.radius * 0.5, ship.radius * 0.3);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
        ctx.shadowBlur = 0;
      }
    }

    // Draw bullets
    ctx.fillStyle = '#39ff14';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#39ff14';
    this.bullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Draw asteroids
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5;
    this.asteroids.forEach(a => {
      if (a.size <= 0) return;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      ctx.beginPath();
      for (let i = 0; i < a.numVerts; i++) {
        const angle = (i / a.numVerts) * Math.PI * 2;
        const r = a.radii[i];
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });

    // Draw particles
    this.particles.forEach(p => {
      const alpha = p.life / 40;
      ctx.fillStyle = `rgba(255, 150, 50, ${alpha})`;
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    });
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
