import { hours, seconds } from "glana/src/units/duration";
import { durationToHuman } from "../human";

describe(".durationToHuman", () => {
  it("converts duration to hour and minutes format", () => {
    const duration = hours(1.5);
    expect(durationToHuman(duration)).toEqual("1h30m");
  });

  it("pads minutes", () => {
    const duration = hours(1.1);
    expect(durationToHuman(duration)).toEqual("1h06m");
  });

  it("shows 0 hour durations", () => {
    const duration = hours(0.1);
    expect(durationToHuman(duration)).toEqual("0h06m");
  });

  it("rounds minutes", () => {
    let duration = seconds(89);
    expect(durationToHuman(duration)).toEqual("0h01m");

    duration = seconds(90);
    expect(durationToHuman(duration)).toEqual("0h02m");

    duration = seconds(91);
    expect(durationToHuman(duration)).toEqual("0h02m");
  });

  it("displays seconds", () => {
    let duration = seconds(89);
    expect(durationToHuman(duration, true)).toEqual("0h01m 29s");

    duration = seconds(90);
    expect(durationToHuman(duration, true)).toEqual("0h01m 30s");

    duration = seconds(91);
    expect(durationToHuman(duration, true)).toEqual("0h01m 31s");
  });

  it("does not pad seconds", () => {
    let duration = seconds(9);
    expect(durationToHuman(duration, true)).toEqual("0h00m 9s");
  });
});
