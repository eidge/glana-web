import SavedFlight from "glana/src/saved_flight";
// @ts-ignore
import colors from "tailwindcss/colors";

export class TrackColors {
  private COLORS: string[] = [
    colors.blue["600"],
    colors.orange["600"],
    colors.pink["500"],
    colors.green["800"]
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
