export default class API {
  onTimestampChange(callback: (timestamp: Date) => void) {
    if (!this.isInIFrame()) return;

    window.addEventListener("message", (event) => {
      if (!event.data.FixTime) return;
      // Adding an hour here is an hack to synchronize both timestamps.
      // They are out of sync by 1 hour, either glana or the bga are using UTC
      // instead of the local timezone, probably glana.
      callback(new Date(event.data.FixTime.getTime() + 3600000));
    });
  }

  private isInIFrame() {
    try {
      return window.self !== window.parent;
    } catch (e) {
      return true;
    }
  }
}
