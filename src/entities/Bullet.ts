import * as PIXI from 'pixi.js';
import { BULLET_SPEED } from '../constants';

export class Bullet extends PIXI.Graphics {
  vy = BULLET_SPEED;
  alive = true;
  constructor(x: number, y: number) {
    super();
    this.clear();
    this.beginFill(0xffffff).drawRect(-1, -8, 2, 8).endFill();
    this.position.set(x, y);
  }

  update(delta: number) {
    this.y += this.vy * delta;

    if (this.y < -20) {
      this.alive = false;
    }
  }
}
