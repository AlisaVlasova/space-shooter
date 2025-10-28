import * as PIXI from 'pixi.js';
import { BOSS_HP, BOSS_SPEED, WIDTH, BOSS_FIRE_INTERVAL } from '../constants';

export class Boss extends PIXI.Container {
  body: PIXI.Graphics;
  hpBarBg: PIXI.Graphics;
  hpBar: PIXI.Graphics;
  hpMax: number = BOSS_HP;
  hp: number = BOSS_HP;
  vx: number = 0;
  moving: boolean = false;
  moveTimer = 0;
  fireTimer = 0;

  constructor(x: number, y: number) {
    super();
    this.position.set(x, y);

    this.body = new PIXI.Graphics();
    const px = 6;

    const mask = [
      '0000111110000',
      '0001000001000',
      '0011111111100',
      '0111111111110',
      '1111011101111',
      '0011101011100',
      '0100000000010',
      '1000100010001',
      '0100000000010',
    ];

    const w = px * mask[0]!.length;

    const h = px * mask.length;

    const ox = -Math.floor(w / 2);

    const oy = -Math.floor(h / 2) + 6;

    this.body.beginFill(0x7cfc00);

    for (let y = 0; y < mask.length; y++) {
      for (let x = 0; x < mask[y]!.length; x++) {
        if (mask[y]![x] === '1') {
          this.body.drawRect(ox + x * px, oy + y * px, px, px);
        }
      }
    }
    this.body.endFill();
    this.addChild(this.body);

    this.hpBarBg = new PIXI.Graphics();
    this.hpBarBg.beginFill(0x051805).drawRoundedRect(-70, -55, 140, 12, 6).endFill();
    this.addChild(this.hpBarBg);

    this.hpBar = new PIXI.Graphics();
    this.addChild(this.hpBar);
    this.redrawHP();
  }

  redrawHP() {
    const w = 140 * (this.hp / this.hpMax);

    this.hpBar.clear();
    this.hpBar.beginFill(0x00ff66).drawRoundedRect(-70, -55, Math.max(0, w), 12, 6).endFill();
  }

  takeHit(): boolean {
    this.hp = Math.max(0, this.hp - 1);
    this.redrawHP();

    return this.hp <= 0;
  }

  update(delta: number) {
    this.moveTimer += PIXI.Ticker.shared.deltaMS / 1000;

    if (this.moveTimer >= 1.5) {
      this.moving = !this.moving;
      this.moveTimer = 0;
      this.vx = this.moving ? (Math.random() < 0.5 ? -BOSS_SPEED : BOSS_SPEED) : 0;
    }

    this.x += this.vx * delta;

    if (this.x < 80) {
      this.x = 80;
      this.vx *= -1;
    }

    if (this.x > WIDTH - 80) {
      this.x = WIDTH - 80;
      this.vx *= -1;
    }

    this.fireTimer += PIXI.Ticker.shared.deltaMS / 1000;
  }

  shouldFire(): boolean {
    if (this.fireTimer >= BOSS_FIRE_INTERVAL) {
      this.fireTimer = 0;

      return true;
    }

    return false;
  }
}
