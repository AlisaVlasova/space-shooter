import * as PIXI from 'pixi.js';
import { MAX_SHOTS, GAME_TIME, WIDTH, HEIGHT, ASTEROID_COUNT } from './constants';
import { Player, Asteroid, Bullet, Boss, BossBullet } from './entities';
import { Input, HUD } from './helpers';

export interface IEntity {
  x: number;
  y: number;
  alive: boolean;
  update(delta: number): void;
}

export class Game {
  app: PIXI.Application;
  stage: PIXI.Container;
  world: PIXI.Container;

  input: Input;
  hud: HUD;

  player: Player;
  asteroids: Asteroid[] = [];
  bullets: Bullet[] = [];
  boss: Boss | null = null;
  bossBullets: BossBullet[] = [];

  // hit radii (avoid magic numbers in collisions)
  private readonly BULLET_RADIUS = 8;
  private readonly BOSS_RADIUS = 70;
  private readonly PLAYER_HIT_RADIUS = 18;
  private readonly BULLET_VS_BULLET_RADIUS = 18;

  shotsLeft = MAX_SHOTS;
  timeLeft = GAME_TIME;

  isGameOver = false;
  level = 1;

  constructor(mount: HTMLElement) {
    this.app = new PIXI.Application({
      width: WIDTH,
      height: HEIGHT,
      background: '#000000',
      antialias: true,
    });
    mount.appendChild(this.app.view as HTMLCanvasElement);

    this.stage = this.app.stage;
    this.world = new PIXI.Container();
    this.stage.addChild(this.world);
    this.drawBackground();

    this.input = new Input();
    this.hud = new HUD(this.world);

    this.player = new Player(WIDTH / 2, HEIGHT - 60);
    this.world.addChild(this.player);
    this.spawnAsteroids(ASTEROID_COUNT);
    this.hud.setAmmo(this.shotsLeft);
    this.hud.setTime(this.timeLeft);
    this.app.ticker.add((delta) => this.update(delta));
  }

  private startBossLevel() {
    this.removeAliveAndClear(this.asteroids);
    this.removeAliveAndClear(this.bullets);

    this.level = 2;
    this.shotsLeft = MAX_SHOTS;
    this.timeLeft = GAME_TIME;
    this.hud.setAmmo(this.shotsLeft);
    this.hud.setTime(this.timeLeft);

    this.boss = new Boss(WIDTH / 2, 120);
    this.world.addChild(this.boss);
    this.bossBullets = [];
  }

  private drawBackground() {
    const g = new PIXI.Graphics();
    g.beginFill(0x000000).drawRect(0, 0, WIDTH, HEIGHT).endFill();
    this.world.addChild(g);
    this.drawScanlinesOverlay();
  }

  private drawScanlinesOverlay() {
    const scan = new PIXI.Graphics();
    scan.beginFill(0x00ff00, 0.04);

    for (let y = 0; y < HEIGHT; y += 3) {
      scan.drawRect(0, y, WIDTH, 1);
    }
    scan.endFill();
    this.world.addChild(scan);
  }

  private spawnAsteroids(n: number): void {
    for (let i = 0; i < n; i++) {
      const r = Math.floor(Math.random() * 25) + 20; // 20..45
      const x = Math.random() * (WIDTH - r * 2) + r;
      const y = Math.random() * (HEIGHT * 0.65) + 40;
      const a = new Asteroid(x, y, r);
      this.world.addChild(a);
      this.asteroids.push(a);
    }
  }

  private shoot(): void {
    if (this.shotsLeft <= 0 || this.isGameOver) {
      return;
    }
    const b = new Bullet(this.player.x, this.player.y - 24);

    this.world.addChild(b);
    this.bullets.push(b);
    this.shotsLeft--;
    this.hud.setAmmo(this.shotsLeft);
  }

  private allAsteroidsDestroyed(): boolean {
    return this.asteroids.every((a) => !a.alive);
  }

  private endGame(win: boolean): void {
    if (this.isGameOver) {
      return;
    }
    this.isGameOver = true;
    this.hud.show(win ? 'YOU WIN' : 'YOU LOSE');
  }

  private circleHit(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
    const dx = x1 - x2;
    const dy = y1 - y2;

    return Math.hypot(dx, dy) < r1 + r2;
  }

  private update(delta: number): void {
    if (this.isGameOver) {
      return;
    }

    if (this.isTimerTickin()) {
      return;
    }

    this.processPlayerInput(delta);

    if (this.level === 1) {
      this.updateLevel1Entities(delta);
    } else {
      this.updateLevel2Entities(delta);
    }

    this.updateBulletsAndCollisions(delta);

    if (this.level === 2) {
      this.updateBossBulletsAndCollisions(delta);
    }

    this.checkAmmoLoss();
  }

  private removeAliveAndClear<T extends PIXI.DisplayObject>(items: T[]): void {
    for (const it of items) {
      if ((it as unknown as IEntity).alive) {
        this.world.removeChild(it);
      }
    }
    items.length = 0;
  }

  private isTimerTickin(): boolean {
    this.timeLeft -= this.app.ticker.deltaMS / 1000;
    this.hud.setTime(this.timeLeft);

    if (this.timeLeft <= 0) {
      this.endGame(false);

      return true;
    }

    return false;
  }

  private processPlayerInput(delta: number): void {
    this.player.update(this.input, delta);

    if (this.input.shouldShoot()) {
      this.shoot();
    }
  }

  private updateLevel1Entities(delta: number): void {
    for (const a of this.asteroids) {
      if (a.alive) {
        a.update(delta);
      }
    }
  }

  private updateLevel2Entities(delta: number): void {
    if (!this.boss) {
      return;
    }
    this.boss.update(delta);

    if (this.boss.shouldFire()) {
      const bb = new BossBullet(this.boss.x, this.boss.y + 40);
      this.world.addChild(bb);
      this.bossBullets.push(bb);
    }
  }

  private updateBulletsAndCollisions(delta: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]!;

      if (!b.alive) {
        this.world.removeChild(b);
        this.bullets.splice(i, 1);
        continue;
      }

      b.update(delta);

      if (this.level === 1) {
        // collide with asteroids
        for (let j = 0; j < this.asteroids.length; j++) {
          const a = this.asteroids[j]!;

          if (!a.alive) {
            continue;
          }

          if (this.circleHit(b.x, b.y, this.BULLET_RADIUS, a.x, a.y, a.radius)) {
            a.alive = false;
            this.world.removeChild(a);
            b.alive = false;
            this.world.removeChild(b);
            this.bullets.splice(i, 1);

            if (this.allAsteroidsDestroyed()) {
              this.startBossLevel();
            }
            break;
          }
        }
      } else if (this.level === 2 && this.boss) {
        // collide with boss (approx circle radius 70)
        if (
          this.circleHit(
            b.x,
            b.y,
            this.BULLET_RADIUS,
            this.boss.x,
            this.boss.y,
            this.BOSS_RADIUS,
          )
        ) {
          b.alive = false;
          this.world.removeChild(b);
          this.bullets.splice(i, 1);
          const dead = this.boss.takeHit();

          if (dead) {
            this.endGame(true);
          }
          continue;
        }

        for (let k = this.bossBullets.length - 1; k >= 0; k--) {
          const bb = this.bossBullets[k]!;

          if (!bb.alive) {
            continue;
          }

          if (
            this.circleHit(
              b.x,
              b.y,
              this.BULLET_VS_BULLET_RADIUS,
              bb.x,
              bb.y,
              this.BULLET_VS_BULLET_RADIUS,
            )
          ) {
            bb.alive = false;
            this.world.removeChild(bb);
            this.bossBullets.splice(k, 1);
            b.alive = false;
            this.world.removeChild(b);
            this.bullets.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  private updateBossBulletsAndCollisions(delta: number): void {
    for (let k = this.bossBullets.length - 1; k >= 0; k--) {
      const bb = this.bossBullets[k]!;

      if (!bb.alive) {
        this.world.removeChild(bb);
        this.bossBullets.splice(k, 1);
        continue;
      }
      bb.update(delta);

      if (
        this.circleHit(
          bb.x,
          bb.y,
          this.PLAYER_HIT_RADIUS,
          this.player.x,
          this.player.y,
          this.PLAYER_HIT_RADIUS,
        )
      ) {
        this.endGame(false);

        return;
      }
    }
  }

  private checkAmmoLoss(): void {
    if (this.shotsLeft !== 0) {
      return;
    }
    const anyAlive = this.bullets.some((b) => b.alive);

    if (anyAlive) {
      return;
    }

    if (this.level === 1) {
      if (!this.allAsteroidsDestroyed()) {
        this.endGame(false);
      }
    } else if (this.level === 2) {
      if (this.boss && this.boss.hp > 0) {
        this.endGame(false);
      }
    }
  }
}
