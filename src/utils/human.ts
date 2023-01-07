import { Duration, hours, minutes, seconds } from "glana/src/units/duration";
import Quantity from "glana/src/units/quantity";

export function durationToHuman(
  duration: Quantity<Duration>,
  showSeconds: boolean = false
) {
  let result = "";

  const durationInHours = duration.convertTo(hours);
  if (durationInHours.greaterThan(hours(0))) {
    result += `${Math.floor(durationInHours.value)}h`;
  }

  const remainingMinutes = hours(durationInHours.value % 1).convertTo(
    minutes
  ).value;

  if (showSeconds) {
    result += padded(Math.floor(remainingMinutes), "m");

    const remainingSeconds = minutes(remainingMinutes % 1).convertTo(seconds);

    const roundedSeconds = Math.round(remainingSeconds.value);
    result += ` ${Math.round(roundedSeconds)}s`;
  } else {
    const roundedMinutes = Math.round(remainingMinutes);
    result += padded(roundedMinutes, "m");
  }

  return result;
}

function padded(value: number, unit: string) {
  if (value > 9) {
    return `${value}${unit}`;
  } else {
    return `0${value}${unit}`;
  }
}

export function pluralize(word: string, count: number, pluralForm = "s") {
  let pluralized = word;
  if (count !== 1) pluralized = word + pluralForm;
  return `${count} ${pluralized}`;
}
