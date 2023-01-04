// @ts-ignore
import colors from "tailwindcss/colors";

export class Colors {
  private COLORS: string[] = [
    colors.blue["600"],
    colors.orange["600"],
    colors.pink["500"],
    colors.green["800"],
  ];
  private index: number;

  constructor() {
    this.index = 0;
  }

  nextColor() {
    if (this.index > this.COLORS.length - 1) {
      this.index = 0;
    }
    return this.COLORS[this.index++];
  }
}
