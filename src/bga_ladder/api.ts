export default class API {
  onTimestampChange(callback: (timestamp: Date) => void) {
    if (!this.isInIFrame()) return;

    window.addEventListener("message", (event) => {
      if (!event.data.FixTime) return;
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
