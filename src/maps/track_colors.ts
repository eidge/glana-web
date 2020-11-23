import SavedFlight from "glana/src/saved_flight";

export class TrackColors {
  private COLORS: string[] = [
    // "#E53E3E", // red-600
    "#3182CE", // blue-600
    "#ED64A6", // pink-500
    "#319795", // teal-600
    "#D69E2E", // yellow-600
    "#48BB78", // green-500
  ];
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
