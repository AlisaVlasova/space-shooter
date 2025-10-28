import * as PIXI from 'pixi.js';
import { WIDTH, HEIGHT } from '../constants';

export class Asteroid extends PIXI.Graphics {
  radius: number;
  alive = true;
  vx: number;
  vy: number;
  constructor(x: number, y: number, r: number) {
    super();
    this.radius = r;
    this.position.set(x, y);
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = Math.random() * 1.5 + 0.5;
    this.clear();
    const px = Math.max(2, Math.floor(this.radius / 4));

    const w = px * 11;

    const h = px * 8;

    const ox = -Math.floor(w / 2);

    const oy = -Math.floor(h / 2);

    this.beginFill(0x7cfc00);
    const mask = [
      '0000111110000',
      '0011011101100',
      '0111111111110',
      '1110111110111',
      '1110111110111',
      '0011111111100',
      '0100000000010',
      '1001000001001',
    ];

    for (let y = 0; y < mask.length; y++) {
      for (let x = 0; x < mask[y]!.length; x++) {
        if (mask[y]![x] === '1') {
          this.drawRect(ox + x * px, oy + y * px, px, px);
        }
      }
    }
    this.endFill();
  }

  update(delta: number) {
    this.x += this.vx * delta;
    this.y += this.vy * delta;

    if (this.x < -this.radius) {
      this.x = WIDTH + this.radius;
    }

    if (this.x > WIDTH + this.radius) {
      this.x = -this.radius;
    }

    if (this.y > HEIGHT + this.radius) {
      this.y = -this.radius;
    }
  }
}
