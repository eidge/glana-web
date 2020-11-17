export default class AnimationTicker {
  private lastTimestamp: number | null = null;
  private isRunning: boolean = false;
  private tickFn: (elapsedTime: number) => void;

  constructor(tickFn: (elapsedTime: number) => void) {
    this.tickFn = tickFn;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleTick();
  }

  private scheduleTick() {
    window.requestAnimationFrame((ts) => this.tick(ts));
  }

  stop() {
    this.isRunning = false;
  }

  private tick(timestamp: number) {
    if (!this.isRunning) {
      this.lastTimestamp = null;
      return;
    }

    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
      return this.scheduleTick();
    }

    let elapsedTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.tickFn(elapsedTime);
    this.scheduleTick();
  }
}
