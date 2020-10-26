import SavedFlight from "glana/src/saved_flight";

export class TrackColors {
  private COLORS: string[] = ["#1f78b4", "#e31a1c", "#ff7f00", "#33a02c"];
  private index: number;
  private colorMap: WeakMap<SavedFlight, string>;

  constructor() {
    this.colorMap = new WeakMap();
    this.index = 0;
  }

  getColorFor(flight: SavedFlight) {
    let associatedColor = this.colorMap.get(flight);
    if (associatedColor) return associatedColor;

    associatedColor = this.nextColor();
    this.colorMap.set(flight, associatedColor);

    return associatedColor;
  }

  private nextColor() {
    if (this.index > this.COLORS.length - 1) {
      this.index = 0;
    }
    return this.COLORS[this.index++];
  }
}
