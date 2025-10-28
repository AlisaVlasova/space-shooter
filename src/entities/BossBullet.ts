import * as PIXI from 'pixi.js';
import { BOSS_BULLET_SPEED, HEIGHT } from '../constants';

export class BossBullet extends PIXI.Graphics {
  vy = BOSS_BULLET_SPEED;
  alive = true;
  constructor(x: number, y: number) {
    super();
    this.clear();
    this.beginFill(0xff3b3b).drawRect(-2, -10, 4, 10).endFill();
    this.position.set(x, y);
  }

  update(delta: number) {
    this.y += this.vy * delta;

    if (this.y > HEIGHT + 30) {
      this.alive = false;
    }
  }
}
