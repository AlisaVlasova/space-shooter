import * as PIXI from 'pixi.js';
import { SHIP_SPEED, WIDTH } from '../constants';
import { Input } from '../helpers';

export class Player extends PIXI.Graphics {
  vx = 0;
  constructor(x: number, y: number) {
    super();
    this.clear();
    // base
    this.beginFill(0xffffff).drawRect(-14, 14, 28, 4).endFill();
    // pedestal
    this.beginFill(0xffffff).drawRect(-8, 6, 16, 8).endFill();
    // turret
    this.beginFill(0xffffff).drawRect(-4, -6, 8, 12).endFill();
    // barrel
    this.beginFill(0xffffff).drawRect(-2, -20, 4, 14).endFill();
    this.position.set(x, y);
  }

  update(input: Input, delta: number) {
    this.vx = 0;

    if (input.left) {
      this.vx -= SHIP_SPEED;
    }

    if (input.right) {
      this.vx += SHIP_SPEED;
    }
    
    this.x += this.vx * delta;
    this.x = Math.max(24, Math.min(WIDTH - 24, this.x));
  }
}
