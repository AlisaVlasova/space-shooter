export class Input {
  private keys = new Set<string>();
  private canShoot = true;
  private shootQueued = false;

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        this.keys.add(e.code);
        e.preventDefault();
      }

      if (e.code === 'Space') {
        if (this.canShoot) {
          this.shootQueued = true;
          this.canShoot = false;
        }
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        this.keys.delete(e.code);
      }

      if (e.code === 'Space') {
        this.canShoot = true;
      }
    });
  }

  get left() {
    return this.keys.has('ArrowLeft');
  }

  get right() {
    return this.keys.has('ArrowRight');
  }

  shouldShoot(): boolean {
    const s = this.shootQueued;

    this.shootQueued = false;

    return s;
  }
}
