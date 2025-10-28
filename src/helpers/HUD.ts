import * as PIXI from 'pixi.js';
import { WIDTH, HEIGHT } from '../constants';

export class HUD {
  timerText: PIXI.Text;
  ammoText: PIXI.Text;
  message: PIXI.Text;

  constructor(stage: PIXI.Container) {
    this.timerText = new PIXI.Text('60', {
      fill: '#7CFC00',
      fontFamily: 'monospace',
      fontSize: 22,
      fontWeight: '700',
    });
    this.timerText.anchor.set(1, 0);
    this.timerText.position.set(WIDTH - 12, 10);
    stage.addChild(this.timerText);

    this.ammoText = new PIXI.Text('Ammo: 10', {
      fill: '#ADFF2F',
      fontFamily: 'monospace',
      fontSize: 20,
      fontWeight: '700',
    });
    this.ammoText.anchor.set(0, 0);
    this.ammoText.position.set(12, 12);
    stage.addChild(this.ammoText);

    this.message = new PIXI.Text('', {
      fill: '#7CFC00',
      fontFamily: 'monospace',
      fontSize: 72,
      fontWeight: '800',
      dropShadow: true,
      dropShadowDistance: 4,
      dropShadowColor: '#001100',
    });
    this.message.anchor.set(0.5);
    this.message.position.set(WIDTH / 2, HEIGHT / 2);
    stage.addChild(this.message);
  }

  setTime(t: number) {
    this.timerText.text = `⏱ ${Math.max(0, Math.ceil(t))}s`;
  }

  setAmmo(n: number) {
    this.ammoText.text = `Ammo: ${n}`;
  }

  show(msg: string) {
    this.message.text = msg;
  }
}
